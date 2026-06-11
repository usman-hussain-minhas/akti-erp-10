import assert from 'node:assert/strict';

import { evaluateLeaveEncashment, type LeaveEncashmentInput } from './leave_encashment.service';

const baseInput: LeaveEncashmentInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_leave_encashment',
  source_record_ref: 'leave_encashment_record_001',
  employee_ref: 'employee_phase_6c_001',
  leave_type_ref: 'leave_type_paid_annual',
  policy_ref: 'leave_policy_encashment_annual',
  fiscal_period_ref: 'fy_2027',
  policy: 'CAPPED_UNITS',
  available_balance_units: 12,
  requested_encashment_units: 10,
  max_encashment_units: 8,
  unit_rate_amount: 1250.5,
  currency: 'pkr',
  request_date: '2027-01-05',
  payout_evidence_date: '2027-01-31',
  approval_ref: 'approval_leave_encashment_001',
  evaluated_by_user_id: 'user_phase_6c_leave_admin',
  evaluated_at: '2027-01-05T08:00:00.000Z',
  control_metadata: { source: 'phase_6c_ffet_036' },
};

const cappedReceipt = evaluateLeaveEncashment(baseInput);
assert.equal(cappedReceipt.seed_id, 'seed_6c_036_leave_encashment');
assert.equal(cappedReceipt.component_id, '6C.03');
assert.equal(cappedReceipt.component_slug, 'hr_attendance_leave_and_time_tracking');
assert.equal(cappedReceipt.model_name, 'Phase6CLeaveEncashment');
assert.equal(cappedReceipt.event_name, 'phase_6c.hr_attendance_leave_and_time_tracking.leave_encashment.evaluated');
assert.equal(cappedReceipt.runtime_status, 'LEAVE_ENCASHMENT_EVIDENCE_EVALUATED');
assert.equal(cappedReceipt.approved_encashment_units, 8);
assert.equal(cappedReceipt.rejected_units, 2);
assert.equal(cappedReceipt.gross_encashment_amount, 10004);
assert.equal(cappedReceipt.currency, 'PKR');
assert.equal(cappedReceipt.decision, 'ENCASHMENT_CAPPED');
assert.equal(cappedReceipt.payroll_mutation_allowed, false);
assert.equal(cappedReceipt.balance_mutation_allowed, false);
assert.equal(cappedReceipt.provider_neutral_only, true);
assert.deepEqual(cappedReceipt.decision_refs, ['6C-ATT-015']);
assert.deepEqual(cappedReceipt.evidence_artifacts, [
  'leave_encashment_decision_receipt',
  'leave_encashment_amount_evidence',
  'payroll_boundary_evidence',
]);
assert.match(cappedReceipt.leave_encashment_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateLeaveEncashment(baseInput);
assert.equal(repeatedReceipt.leave_encashment_evidence_digest, cappedReceipt.leave_encashment_evidence_digest);

const fullBalanceReceipt = evaluateLeaveEncashment({
  ...baseInput,
  policy: 'FULL_BALANCE',
  max_encashment_units: undefined,
  requested_encashment_units: 12,
});
assert.equal(fullBalanceReceipt.approved_encashment_units, 12);
assert.equal(fullBalanceReceipt.rejected_units, 0);
assert.equal(fullBalanceReceipt.decision, 'ENCASHMENT_EVIDENCE_READY');

const requestedUnitsReceipt = evaluateLeaveEncashment({
  ...baseInput,
  policy: 'REQUESTED_UNITS_ONLY',
  max_encashment_units: undefined,
  requested_encashment_units: 7,
});
assert.equal(requestedUnitsReceipt.approved_encashment_units, 7);
assert.equal(requestedUnitsReceipt.decision, 'ENCASHMENT_EVIDENCE_READY');

const notAllowedReceipt = evaluateLeaveEncashment({
  ...baseInput,
  policy: 'NOT_ALLOWED',
  max_encashment_units: undefined,
});
assert.equal(notAllowedReceipt.approved_encashment_units, 0);
assert.equal(notAllowedReceipt.rejected_units, 10);
assert.equal(notAllowedReceipt.gross_encashment_amount, 0);
assert.equal(notAllowedReceipt.decision, 'ENCASHMENT_NOT_ALLOWED');

const zeroBalanceReceipt = evaluateLeaveEncashment({
  ...baseInput,
  available_balance_units: 0,
  requested_encashment_units: 5,
});
assert.equal(zeroBalanceReceipt.decision, 'ENCASHMENT_REJECTED_ZERO_BALANCE');
assert.equal(zeroBalanceReceipt.approved_encashment_units, 0);

assert.throws(() => evaluateLeaveEncashment({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, employee_ref: '' }), /employee_ref is required/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, leave_type_ref: '' }), /leave_type_ref is required/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, policy_ref: '' }), /policy_ref is required/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, fiscal_period_ref: '' }), /fiscal_period_ref is required/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, request_date: '01-05-2027' }), /request_date must use YYYY-MM-DD format/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, request_date: '2027-02-01', payout_evidence_date: '2027-01-31' }), /request_date must be on or before payout_evidence_date/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, available_balance_units: -1 }), /available_balance_units must be a non-negative finite number/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, requested_encashment_units: -1 }), /requested_encashment_units must be a non-negative finite number/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, max_encashment_units: 0 }), /max_encashment_units must be a positive finite number/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, unit_rate_amount: 0 }), /unit_rate_amount must be a positive finite number/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, currency: 'rupees' }), /currency must be an ISO-4217 three-letter code/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, policy: 'CAPPED_UNITS', max_encashment_units: undefined }), /max_encashment_units is required for capped leave encashment policy/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, approval_ref: '' }), /approval_ref is required/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, payroll_mutation_requested: true }), /must not mutate payroll surfaces/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, balance_mutation_requested: true }), /must not mutate leave balances directly/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, provider_specific_adapter_requested: true }), /provider-neutral/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, schema_mutation_requested: true }), /must not request schema mutation/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateLeaveEncashment({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C leave_encashment runtime test passed.');
