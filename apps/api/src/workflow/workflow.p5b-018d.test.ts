import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import {
  WorkflowService,
  type WorkflowApprovalFlowExecutionInput,
  type WorkflowProcessDefinition,
} from './workflow.service';
import { assertComplianceEventContext } from '../platform-observability/event-outbox.service';

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

function validExecutionInput(
  overrides?: Partial<WorkflowApprovalFlowExecutionInput>,
): WorkflowApprovalFlowExecutionInput {
  return {
    definition: validDefinition(),
    organization_id: 'org-018d',
    actor_user_id: 'actor-018d',
    subject_type: 'foundry.module',
    subject_id: 'platform.fixture',
    current_state: 'draft',
    transition_key: 'submit_for_review',
    gatekeeper_outcome: 'APPROVAL_REQUIRED',
    approval_decision: 'approved',
    evidence_keys_present: ['workflow.definition.reviewed'],
    correlation_id: 'corr-p5b-018d',
    ...overrides,
  };
}

function testWorkflowApprovalTransitionBuildsComplianceClassAuditEvent() {
  const service = new WorkflowService();
  const result = service.executeApprovalFlow(validExecutionInput());
  const event = service.buildWorkflowAuditEvent(result);

  assert.equal(assertComplianceEventContext(event), event);
  assert.equal(event.event_type, 'workflow.process.submitted');
  assert.equal(event.producer, 'akti-api');
  assert.equal(event.schema_version, '1.0.0');
  assert.equal(event.organization_id, 'org-018d');
  assert.equal(event.source_module, 'workflow.engine');
  assert.deepEqual(event.subject, {
    entity_type: 'workflow.process',
    entity_id: 'platform.fixture',
  });
  assert.equal(event.context.actor_user_id, 'actor-018d');
  assert.equal(event.context.correlation_id, 'corr-p5b-018d');
  assert.equal(event.context.workflow_key, 'platform.approval_flow');
  assert.equal(event.compliance.privacy_class, 'restricted');
  assert.equal(event.compliance.retention_class, 'audit');
  assert.equal(event.compliance.redaction_policy, 'strict');
  assert.equal(event.compliance.audit_required, true);
  assert.equal(event.compliance.replay_allowed, false);
  assert.equal(event.payload.workflow_key, 'platform.approval_flow');
  assert.equal(event.payload.transition_key, 'submit_for_review');
  assert.equal(event.payload.status, 'transitioned');
  assert.equal(event.payload.approval_decision, 'approved');
}

function testPendingApprovalStillBuildsAuditEventWithoutTransitionClaim() {
  const service = new WorkflowService();
  const result = service.executeApprovalFlow(
    validExecutionInput({
      approval_decision: null,
    }),
  );
  const event = service.buildWorkflowAuditEvent(result);

  assert.equal(result.status, 'approval_pending');
  assert.equal(result.to_state, 'draft');
  assert.equal(event.payload.status, 'approval_pending');
  assert.equal(event.payload.to_state, 'draft');
  assert.equal(event.payload.gatekeeper_outcome, 'APPROVAL_REQUIRED');
}

function testWorkflowAuditEventComplianceRegressionsAreRejected() {
  const service = new WorkflowService();
  const event = service.buildWorkflowAuditEvent(service.executeApprovalFlow(validExecutionInput()));

  assert.throws(
    () =>
      assertComplianceEventContext({
        ...event,
        context: {
          ...event.context,
          actor_user_id: null,
        },
      }),
    BadRequestException,
  );

  assert.throws(
    () =>
      assertComplianceEventContext({
        ...event,
        compliance: {
          ...event.compliance,
          retention_class: 'standard',
        },
      }),
    BadRequestException,
  );

  assert.throws(
    () =>
      assertComplianceEventContext({
        ...event,
        compliance: {
          ...event.compliance,
          audit_required: false,
        },
      }),
    BadRequestException,
  );
}

function run() {
  testWorkflowApprovalTransitionBuildsComplianceClassAuditEvent();
  testPendingApprovalStillBuildsAuditEventWithoutTransitionClaim();
  testWorkflowAuditEventComplianceRegressionsAreRejected();

  console.log('P5B-018d workflow audit/event proof tests passed.');
}

run();
