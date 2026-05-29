import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { WorkflowService, type WorkflowProcessDefinition } from './workflow.service';

function validDefinition(overrides?: Partial<WorkflowProcessDefinition>): WorkflowProcessDefinition {
  return {
    workflow_key: 'platform.approval_flow',
    version: '1.0.0',
    owner: 'platform',
    tenant_scope: 'organization',
    capability_requirements: ['platform.workflow.manage'],
    states: [
      {
        state_key: 'draft',
        kind: 'start',
        label: 'Draft',
      },
      {
        state_key: 'pending_review',
        kind: 'intermediate',
        label: 'Pending Review',
      },
      {
        state_key: 'approved',
        kind: 'terminal',
        label: 'Approved',
      },
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
        approval_key: null,
        emitted_event_types: ['workflow.process.approved'],
      },
    ],
    guards: [
      {
        guard_key: 'gatekeeper_allow',
        type: 'gatekeeper',
        description: 'Gatekeeper must allow the workflow transition.',
      },
      {
        guard_key: 'evidence_present',
        type: 'evidence',
        description: 'Required evidence must be present before transition.',
      },
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
    compatibility: {
      min_platform_version: '1.0.0',
    },
    evidence_requirements: ['workflow.definition.reviewed'],
    deprecation_policy: {
      deprecated: false,
      replacement_workflow_key: null,
      rollback_supported: true,
    },
    ...overrides,
  };
}

function testValidWorkflowDefinitionPassesContractValidation() {
  const service = new WorkflowService();
  const result = service.validateProcessDefinition(validDefinition());

  assert.equal(result.valid, true);
  assert.equal(result.workflow_key, 'platform.approval_flow');
  assert.equal(result.version, '1.0.0');
  assert.equal(result.tenant_scope, 'organization');
  assert.equal(result.core_service, true);
  assert.equal(result.foundry_module, false);
  assert.deepEqual(result.errors, []);
}

function testWorkflowDefinitionRejectsMissingAndMalformedRequiredFields() {
  const service = new WorkflowService();
  const invalid = service.validateProcessDefinition({
    ...validDefinition({
      workflow_key: 'invalid',
      version: 'latest',
      tenant_scope: 'tenant' as never,
      error_behavior: 'best_effort' as never,
      compatibility: {
        min_platform_version: 'current',
      },
    }),
    evidence_requirements: [],
  });

  assert.equal(invalid.valid, false);
  assert.match(invalid.errors.join('\n'), /workflow_key must use module\.process key syntax/);
  assert.match(invalid.errors.join('\n'), /version must use semver syntax/);
  assert.match(invalid.errors.join('\n'), /tenant_scope must be global or organization/);
  assert.match(invalid.errors.join('\n'), /workflow error_behavior must fail closed/);
  assert.match(invalid.errors.join('\n'), /compatibility\.min_platform_version must use semver syntax/);
  assert.match(invalid.errors.join('\n'), /workflow definition must declare evidence_requirements/);
}

function testWorkflowDefinitionRejectsInvalidStateAndTransitionTopology() {
  const service = new WorkflowService();
  const invalid = service.validateProcessDefinition({
    ...validDefinition(),
    states: [
      { state_key: 'draft', kind: 'start', label: 'Draft' },
      { state_key: 'draft', kind: 'intermediate', label: 'Duplicate Draft' },
      { state_key: 'pending_review', kind: 'intermediate', label: 'Pending Review' },
    ],
    transitions: [
      {
        transition_key: 'submit_for_review',
        from_state: 'draft',
        to_state: 'missing_terminal',
        action_key: 'workflow.submit',
        guard_keys: ['missing_guard'],
        approval_key: 'missing_approval',
        emitted_event_types: [],
      },
    ],
  });

  assert.equal(invalid.valid, false);
  assert.match(invalid.errors.join('\n'), /state draft is duplicated/);
  assert.match(invalid.errors.join('\n'), /workflow definition must have at least one terminal state/);
  assert.match(invalid.errors.join('\n'), /references unknown to_state missing_terminal/);
  assert.match(invalid.errors.join('\n'), /references unknown guard missing_guard/);
  assert.match(invalid.errors.join('\n'), /references unknown approval missing_approval/);
  assert.match(invalid.errors.join('\n'), /must emit at least one event/);
}

function testWorkflowDefinitionCannotRedefineGatekeeperOutcomes() {
  const service = new WorkflowService();
  const invalid = service.validateProcessDefinition({
    ...validDefinition(),
    gatekeeper_outcomes: ['ALLOW', 'DENY'],
    states: [
      ...validDefinition().states,
      {
        state_key: 'APPROVAL_REQUIRED',
        kind: 'intermediate',
        label: 'Approval Required',
      },
    ],
    transitions: [
      {
        ...validDefinition().transitions[0],
        transition_key: 'bad_transition',
        outcome: 'STOP_FOR_REVIEW',
      },
    ],
  });

  assert.equal(invalid.valid, false);
  assert.match(invalid.errors.join('\n'), /must not redefine Gatekeeper outcomes/);
  assert.match(invalid.errors.join('\n'), /must not declare Gatekeeper outcome STOP_FOR_REVIEW/);
  assert.match(invalid.errors.join('\n'), /state APPROVAL_REQUIRED must use workflow state key syntax/);
}

function testAssertWorkflowDefinitionThrowsFailClosedError() {
  const service = new WorkflowService();

  assert.throws(
    () =>
      service.assertProcessDefinitionValid({
        ...validDefinition(),
        audit_hooks: [
          {
            hook_key: 'workflow.submit.audit',
            event_type: 'workflow.process.submitted',
            action_key: 'workflow.submit',
            audit_required: false,
          },
        ],
      }),
    BadRequestException,
  );
}

function run() {
  testValidWorkflowDefinitionPassesContractValidation();
  testWorkflowDefinitionRejectsMissingAndMalformedRequiredFields();
  testWorkflowDefinitionRejectsInvalidStateAndTransitionTopology();
  testWorkflowDefinitionCannotRedefineGatekeeperOutcomes();
  testAssertWorkflowDefinitionThrowsFailClosedError();

  console.log('P5B-018a workflow process-definition validation tests passed.');
}

run();
