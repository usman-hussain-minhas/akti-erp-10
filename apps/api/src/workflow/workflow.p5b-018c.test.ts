import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import {
  WorkflowService,
  type WorkflowApprovalFlowExecutionInput,
  type WorkflowProcessDefinition,
} from './workflow.service';

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
      {
        guard_key: 'gatekeeper_allow',
        type: 'gatekeeper',
        description: 'Gatekeeper must permit the transition.',
      },
      {
        guard_key: 'evidence_present',
        type: 'evidence',
        description: 'Required evidence is present.',
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
    organization_id: 'org-018c',
    actor_user_id: 'actor-018c',
    subject_type: 'foundry.module',
    subject_id: 'platform.fixture',
    current_state: 'draft',
    transition_key: 'submit_for_review',
    gatekeeper_outcome: 'APPROVAL_REQUIRED',
    approval_decision: null,
    evidence_keys_present: ['workflow.definition.reviewed'],
    correlation_id: 'corr-p5b-018c',
    ...overrides,
  };
}

function testApprovalRequiredOutcomeCreatesPendingApprovalWithoutTransition() {
  const service = new WorkflowService();

  const result = service.executeApprovalFlow(validExecutionInput());

  assert.equal(result.status, 'approval_pending');
  assert.equal(result.from_state, 'draft');
  assert.equal(result.to_state, 'draft');
  assert.equal(result.gatekeeper_outcome, 'APPROVAL_REQUIRED');
  assert.equal(result.approval_key, 'platform_review');
  assert.equal(result.approval_chain_key, 'platform.workflow.review');
  assert.equal(result.approval_decision, null);
  assert.equal(result.audit_required, true);
  assert.equal(result.event_type, 'workflow.process.submitted');
  assert.equal(result.correlation_id, 'corr-p5b-018c');
}

function testApprovedEvidenceBackedFlowTransitionsToNextState() {
  const service = new WorkflowService();

  const result = service.executeApprovalFlow(
    validExecutionInput({
      gatekeeper_outcome: 'APPROVAL_REQUIRED',
      approval_decision: 'approved',
    }),
  );

  assert.equal(result.status, 'transitioned');
  assert.equal(result.from_state, 'draft');
  assert.equal(result.to_state, 'pending_review');
  assert.equal(result.gatekeeper_outcome, 'APPROVAL_REQUIRED');
  assert.equal(result.approval_decision, 'approved');
  assert.deepEqual(result.required_evidence, ['workflow.definition.reviewed']);
  assert.deepEqual(result.evidence_keys_present, ['workflow.definition.reviewed']);
}

function testGatekeeperAllowCanTransitionApprovalFlowWhenEvidenceIsPresent() {
  const service = new WorkflowService();

  const result = service.executeApprovalFlow(
    validExecutionInput({
      gatekeeper_outcome: 'ALLOW',
      approval_decision: null,
    }),
  );

  assert.equal(result.status, 'transitioned');
  assert.equal(result.from_state, 'draft');
  assert.equal(result.to_state, 'pending_review');
  assert.equal(result.gatekeeper_outcome, 'ALLOW');
  assert.equal(result.approval_decision, null);
}

function testApprovalFlowFailsClosedForMissingEvidenceRejectedOrBlockedGatekeeperOutcomes() {
  const service = new WorkflowService();

  assert.throws(
    () => service.executeApprovalFlow(validExecutionInput({ evidence_keys_present: [] })),
    BadRequestException,
  );
  assert.throws(
    () => service.executeApprovalFlow(validExecutionInput({ approval_decision: 'rejected' })),
    BadRequestException,
  );
  assert.throws(
    () => service.executeApprovalFlow(validExecutionInput({ gatekeeper_outcome: 'DENY' })),
    BadRequestException,
  );
  assert.throws(
    () => service.executeApprovalFlow(validExecutionInput({ gatekeeper_outcome: 'STOP_FOR_REVIEW' })),
    BadRequestException,
  );
}

function testApprovalFlowRejectsUndeclaredOrWrongStateTransitions() {
  const service = new WorkflowService();

  assert.throws(
    () => service.executeApprovalFlow(validExecutionInput({ transition_key: 'missing_transition' })),
    BadRequestException,
  );
  assert.throws(
    () => service.executeApprovalFlow(validExecutionInput({ current_state: 'pending_review' })),
    BadRequestException,
  );
}

function run() {
  testApprovalRequiredOutcomeCreatesPendingApprovalWithoutTransition();
  testApprovedEvidenceBackedFlowTransitionsToNextState();
  testGatekeeperAllowCanTransitionApprovalFlowWhenEvidenceIsPresent();
  testApprovalFlowFailsClosedForMissingEvidenceRejectedOrBlockedGatekeeperOutcomes();
  testApprovalFlowRejectsUndeclaredOrWrongStateTransitions();

  console.log('P5B-018c workflow approval-flow execution proof tests passed.');
}

run();
