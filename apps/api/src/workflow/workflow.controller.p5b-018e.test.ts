import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { BadRequestException, ForbiddenException, RequestMethod, UnauthorizedException } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';

import { WorkflowController } from './workflow.controller';
import {
  WorkflowService,
  type WorkflowApprovalFlowExecutionInput,
  type WorkflowProcessDefinition,
} from './workflow.service';
import { type HeaderRecord, createPhase3SessionToken } from '../security/request-context';

const AUTH_SECRET = 'phase5b-workflow-api-baseline-secret';
process.env.AKTI_AUTH_SESSION_SECRET = AUTH_SECRET;

function trustedHeaders(organizationId = 'org-018e', actorUserId = 'actor-018e'): HeaderRecord {
  return {
    authorization: `Bearer ${createPhase3SessionToken(
      {
        organization_id: organizationId,
        actor_user_id: actorUserId,
        issued_at: new Date(Date.now() - 60_000).toISOString(),
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
      AUTH_SECRET,
    )}`,
  };
}

function validDefinition(overrides?: Partial<WorkflowProcessDefinition>): WorkflowProcessDefinition {
  return {
    workflow_key: 'platform.approval_flow',
    version: '1.0.0',
    owner: 'platform',
    tenant_scope: 'organization',
    capability_requirements: ['platform.workflow.manage'],
    states: [
      { state_key: 'draft', kind: 'start', label: 'Draft' },
      { state_key: 'pending_review', kind: 'intermediate', label: 'Pending Review' },
      { state_key: 'approved', kind: 'terminal', label: 'Approved' },
    ],
    transitions: [
      {
        transition_key: 'submit_for_review',
        from_state: 'draft',
        to_state: 'pending_review',
        action_key: 'workflow.submit',
        guard_keys: ['gatekeeper_allow', 'evidence_present'],
        approval_key: 'platform_review',
        emitted_event_types: ['workflow.process.submitted'],
      },
      {
        transition_key: 'mark_approved',
        from_state: 'pending_review',
        to_state: 'approved',
        action_key: 'workflow.approve',
        guard_keys: ['gatekeeper_allow'],
        approval_key: 'platform_review',
        emitted_event_types: ['workflow.process.approved'],
      },
    ],
    guards: [
      { guard_key: 'gatekeeper_allow', type: 'gatekeeper', description: 'Gatekeeper must allow transition.' },
      { guard_key: 'evidence_present', type: 'evidence', description: 'Required evidence must be present.' },
    ],
    approvals: [
      {
        approval_key: 'platform_review',
        approval_chain_key: 'platform.workflow.review',
        evidence_required: true,
        timeout_seconds: 3600,
      },
    ],
    emitted_events: ['workflow.process.submitted', 'workflow.process.approved'],
    audit_hooks: [
      {
        hook_key: 'workflow.submit.audit',
        event_type: 'workflow.process.submitted',
        action_key: 'workflow.submit',
        audit_required: true,
      },
    ],
    error_behavior: 'fail_closed',
    compatibility: { min_platform_version: '1.0.0' },
    evidence_requirements: ['workflow.definition.reviewed'],
    deprecation_policy: {
      deprecated: false,
      replacement_workflow_key: null,
      rollback_supported: true,
    },
    ...overrides,
  };
}

function validStartBody(overrides?: Partial<WorkflowApprovalFlowExecutionInput>): WorkflowApprovalFlowExecutionInput {
  return {
    definition: validDefinition(),
    organization_id: 'org-018e',
    actor_user_id: 'actor-018e',
    subject_type: 'foundry.module',
    subject_id: 'platform.fixture',
    current_state: 'draft',
    transition_key: 'submit_for_review',
    gatekeeper_outcome: 'APPROVAL_REQUIRED',
    approval_decision: 'approved',
    evidence_keys_present: ['workflow.definition.reviewed'],
    correlation_id: 'corr-p5b-018e',
    ...overrides,
  };
}

function testWorkflowRouteMetadataIsExplicit() {
  const startDescriptor = Object.getOwnPropertyDescriptor(WorkflowController.prototype, 'startWorkflow');
  const getDescriptor = Object.getOwnPropertyDescriptor(WorkflowController.prototype, 'getWorkflow');

  assert.ok(startDescriptor?.value);
  assert.ok(getDescriptor?.value);
  assert.equal(Reflect.getMetadata(PATH_METADATA, WorkflowController), 'platform/workflows');
  assert.ok([undefined, '', '/'].includes(Reflect.getMetadata(PATH_METADATA, startDescriptor.value)));
  assert.equal(Reflect.getMetadata(METHOD_METADATA, startDescriptor.value), RequestMethod.POST);
  assert.equal(Reflect.getMetadata(PATH_METADATA, getDescriptor.value), ':id');
  assert.equal(Reflect.getMetadata(METHOD_METADATA, getDescriptor.value), RequestMethod.GET);
}

function testWorkflowStartUsesTrustedContextCapabilityGatekeeperAndAuditShape() {
  const controller = new WorkflowController(new WorkflowService());

  const response = controller.startWorkflow(validStartBody(), trustedHeaders());

  assert.equal(response.method, 'POST');
  assert.equal(response.route, '/platform/workflows');
  assert.equal(response.capability.required, 'platform.workflow.manage');
  assert.deepEqual(response.tenant_context, {
    organization_id: 'org-018e',
    actor_user_id: 'actor-018e',
  });
  assert.equal(response.gatekeeper.preflight_required, true);
  assert.equal(response.gatekeeper.capability_key, 'platform.workflow.manage');
  assert.equal(response.gatekeeper.execution_blocked_on_stop_or_deny, true);
  assert.equal(response.workflow.status, 'transitioned');
  assert.equal(response.workflow.gatekeeper_outcome, 'APPROVAL_REQUIRED');
  assert.equal(response.audit.event_type, 'workflow.process.submitted');
  assert.equal(response.audit.event_envelope.event_type, 'workflow.process.submitted');
  assert.equal(response.audit.event_envelope.source_module, 'workflow.engine');
  assert.equal(response.audit.event_envelope.organization_id, 'org-018e');
  assert.equal(response.audit.event_envelope.context.actor_user_id, 'actor-018e');
}

function testWorkflowQueryUsesTrustedContextAndReadCapability() {
  const controller = new WorkflowController(new WorkflowService());

  const response = controller.getWorkflow('workflow-instance-018e', trustedHeaders());

  assert.equal(response.method, 'GET');
  assert.equal(response.route, '/platform/workflows/:id');
  assert.equal(response.capability.required, 'platform.workflow.read');
  assert.deepEqual(response.tenant_context, {
    organization_id: 'org-018e',
    actor_user_id: 'actor-018e',
  });
  assert.deepEqual(response.workflow, {
    workflow_id: 'workflow-instance-018e',
    persistence_model: 'WorkflowInstance',
    read_model_required: true,
  });
  assert.equal(response.audit.event_type, 'workflow.instance.read');
  assert.equal(response.audit.audit_required, true);
}

function testWorkflowApiRejectsInvalidBodyMismatchedContextAndBlockedOutcomes() {
  const controller = new WorkflowController(new WorkflowService());

  assert.throws(() => controller.startWorkflow({ ...validStartBody(), organization_id: ' ' }, trustedHeaders()), BadRequestException);
  assert.throws(
    () => controller.startWorkflow({ ...validStartBody(), gatekeeper_outcome: 'MAYBE' }, trustedHeaders()),
    BadRequestException,
  );
  assert.throws(
    () => controller.startWorkflow({ ...validStartBody(), evidence_keys_present: [] }, trustedHeaders()),
    BadRequestException,
  );
  assert.throws(
    () => controller.startWorkflow(validStartBody({ gatekeeper_outcome: 'STOP_FOR_REVIEW' }), trustedHeaders()),
    BadRequestException,
  );
  assert.throws(
    () => controller.startWorkflow(validStartBody({ gatekeeper_outcome: 'DENY' }), trustedHeaders()),
    BadRequestException,
  );
  assert.throws(() => controller.startWorkflow(validStartBody(), trustedHeaders('org-other')), ForbiddenException);
  assert.throws(
    () => controller.startWorkflow(validStartBody({ actor_user_id: 'actor-other' }), trustedHeaders()),
    ForbiddenException,
  );
  assert.throws(() => controller.startWorkflow(validStartBody(), {}), UnauthorizedException);
  assert.throws(() => controller.getWorkflow('', trustedHeaders()), BadRequestException);
  assert.throws(() => controller.getWorkflow('workflow-instance-018e', {}), UnauthorizedException);
}

function testAppModuleRegistersWorkflowApiSurface() {
  const appModuleSource = readFileSync('src/app.module.ts', 'utf8');

  assert.equal(appModuleSource.includes('WorkflowController'), true);
  assert.equal(appModuleSource.includes('WorkflowService'), true);
}

function run() {
  testWorkflowRouteMetadataIsExplicit();
  testWorkflowStartUsesTrustedContextCapabilityGatekeeperAndAuditShape();
  testWorkflowQueryUsesTrustedContextAndReadCapability();
  testWorkflowApiRejectsInvalidBodyMismatchedContextAndBlockedOutcomes();
  testAppModuleRegistersWorkflowApiSurface();

  console.log('P5B-018e workflow service API baseline tests passed.');
}

run();
