import assert from 'node:assert/strict';

import { evaluateLeaveApprovalChain, type LeaveApprovalChainInput } from './leave_approval_chain.service';

const baseInput: LeaveApprovalChainInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_leave_approval_chain',
  source_record_ref: 'leave_approval_chain_record_001',
  leave_request_ref: 'leave_request_001',
  employee_ref: 'employee_phase_6c_001',
  leave_type_ref: 'leave_type_paid_annual',
  policy_ref: 'leave_policy_approval_chain_annual',
  approval_mode: 'SEQUENTIAL',
  requested_leave_units: 6,
  submitted_at: '2027-02-01T08:00:00.000Z',
  evaluated_by_user_id: 'user_phase_6c_leave_admin',
  evaluated_at: '2027-02-01T10:00:00.000Z',
  steps: [
    { step_order: 1, approver_kind: 'MANAGER', approver_ref: 'manager_employee_001', min_leave_units: 0, max_leave_units: 10, escalation_after_hours: 24, required: true },
    { step_order: 2, approver_kind: 'ROLE', approver_ref: 'hr_leave_admin', min_leave_units: 5, escalation_after_hours: 48, required: true },
    { step_order: 3, approver_kind: 'GROUP', approver_ref: 'finance_review_group', min_leave_units: 15, required: true },
  ],
  decisions: [],
  control_metadata: { source: 'phase_6c_ffet_037' },
};

const pendingReceipt = evaluateLeaveApprovalChain(baseInput);
assert.equal(pendingReceipt.seed_id, 'seed_6c_037_leave_approval_chain');
assert.equal(pendingReceipt.component_id, '6C.03');
assert.equal(pendingReceipt.component_slug, 'hr_attendance_leave_and_time_tracking');
assert.equal(pendingReceipt.model_name, 'Phase6CLeaveApprovalChain');
assert.equal(pendingReceipt.event_name, 'phase_6c.hr_attendance_leave_and_time_tracking.leave_approval_chain.evaluated');
assert.equal(pendingReceipt.runtime_status, 'LEAVE_APPROVAL_CHAIN_EVALUATED');
assert.deepEqual(pendingReceipt.applicable_step_orders, [1, 2]);
assert.deepEqual(pendingReceipt.completed_step_orders, []);
assert.deepEqual(pendingReceipt.next_step_orders, [1]);
assert.deepEqual(pendingReceipt.next_approver_refs, ['manager_employee_001']);
assert.equal(pendingReceipt.status, 'APPROVAL_PENDING');
assert.equal(pendingReceipt.approval_mutation_allowed, false);
assert.equal(pendingReceipt.notification_send_allowed, false);
assert.equal(pendingReceipt.provider_neutral_only, true);
assert.deepEqual(pendingReceipt.decision_refs, ['6C-ATT-016']);
assert.deepEqual(pendingReceipt.evidence_artifacts, [
  'leave_approval_chain_decision_receipt',
  'leave_approval_step_evidence',
  'leave_approval_escalation_evidence',
]);
assert.match(pendingReceipt.leave_approval_chain_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateLeaveApprovalChain(baseInput);
assert.equal(repeatedReceipt.leave_approval_chain_evidence_digest, pendingReceipt.leave_approval_chain_evidence_digest);

const sequentialSecondStepReceipt = evaluateLeaveApprovalChain({
  ...baseInput,
  decisions: [{ step_order: 1, approver_ref: 'manager_employee_001', decision: 'APPROVED', decided_at: '2027-02-01T09:00:00.000Z' }],
});
assert.deepEqual(sequentialSecondStepReceipt.completed_step_orders, [1]);
assert.deepEqual(sequentialSecondStepReceipt.next_step_orders, [2]);
assert.deepEqual(sequentialSecondStepReceipt.next_approver_refs, ['hr_leave_admin']);
assert.equal(sequentialSecondStepReceipt.status, 'APPROVAL_PENDING');

const sequentialApprovedReceipt = evaluateLeaveApprovalChain({
  ...baseInput,
  decisions: [
    { step_order: 1, approver_ref: 'manager_employee_001', decision: 'APPROVED', decided_at: '2027-02-01T09:00:00.000Z' },
    { step_order: 2, approver_ref: 'hr_leave_admin', decision: 'APPROVED', decided_at: '2027-02-01T09:30:00.000Z' },
  ],
});
assert.equal(sequentialApprovedReceipt.status, 'APPROVED');
assert.deepEqual(sequentialApprovedReceipt.next_approver_refs, []);

const rejectedReceipt = evaluateLeaveApprovalChain({
  ...baseInput,
  decisions: [{ step_order: 1, approver_ref: 'manager_employee_001', decision: 'REJECTED', decided_at: '2027-02-01T09:00:00.000Z' }],
});
assert.equal(rejectedReceipt.status, 'REJECTED');
assert.deepEqual(rejectedReceipt.rejected_by_refs, ['manager_employee_001']);

const parallelAllReceipt = evaluateLeaveApprovalChain({
  ...baseInput,
  approval_mode: 'PARALLEL_ALL',
});
assert.deepEqual(parallelAllReceipt.next_step_orders, [1, 2]);
assert.deepEqual(parallelAllReceipt.next_approver_refs, ['manager_employee_001', 'hr_leave_admin']);
assert.equal(parallelAllReceipt.status, 'APPROVAL_PENDING');

const parallelAnyReceipt = evaluateLeaveApprovalChain({
  ...baseInput,
  approval_mode: 'PARALLEL_ANY',
  decisions: [{ step_order: 2, approver_ref: 'hr_leave_admin', decision: 'APPROVED', decided_at: '2027-02-01T09:15:00.000Z' }],
});
assert.equal(parallelAnyReceipt.status, 'APPROVED');

const escalationReceipt = evaluateLeaveApprovalChain({
  ...baseInput,
  evaluated_at: '2027-02-02T09:00:00.000Z',
});
assert.equal(escalationReceipt.status, 'ESCALATION_REQUIRED');

const noApplicableStepsReceipt = evaluateLeaveApprovalChain({
  ...baseInput,
  requested_leave_units: 0,
  steps: [{ step_order: 1, approver_kind: 'MANAGER', approver_ref: 'manager_employee_001', min_leave_units: 1, required: true }],
});
assert.equal(noApplicableStepsReceipt.status, 'APPROVED');
assert.deepEqual(noApplicableStepsReceipt.applicable_step_orders, []);

assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, leave_request_ref: '' }), /leave_request_ref is required/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, employee_ref: '' }), /employee_ref is required/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, leave_type_ref: '' }), /leave_type_ref is required/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, policy_ref: '' }), /policy_ref is required/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, requested_leave_units: -1 }), /requested_leave_units must be a non-negative finite number/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, submitted_at: 'not-a-date' }), /submitted_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, submitted_at: '2027-02-02T00:00:00.000Z', evaluated_at: '2027-02-01T00:00:00.000Z' }), /submitted_at must be on or before evaluated_at/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, steps: [] }), /steps must contain at least one approval step/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, steps: [{ ...baseInput.steps[0], step_order: 0 }] }), /step_order must be a positive integer/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, steps: [{ ...baseInput.steps[0] }, { ...baseInput.steps[0] }] }), /step_order values must be unique/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, steps: [{ ...baseInput.steps[0], approver_ref: '' }] }), /approver_ref is required/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, steps: [{ ...baseInput.steps[0], min_leave_units: 10, max_leave_units: 5 }] }), /min_leave_units cannot exceed max_leave_units/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, decisions: [{ step_order: 99, approver_ref: 'missing', decision: 'APPROVED', decided_at: '2027-02-01T09:00:00.000Z' }] }), /decision references a non-applicable approval step/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, decisions: [{ step_order: 1, approver_ref: 'manager_employee_001', decision: 'APPROVED', decided_at: 'not-a-date' }] }), /decided_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, approval_mutation_requested: true }), /must not mutate approval records/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, notification_send_requested: true }), /must not send notifications directly/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, provider_specific_adapter_requested: true }), /provider-neutral/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, schema_mutation_requested: true }), /must not request schema mutation/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateLeaveApprovalChain({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C leave_approval_chain runtime test passed.');
