import assert from 'node:assert/strict';

import { evaluateLeaveCarryforwardExpiry, type LeaveCarryforwardExpiryInput } from './leave_carryforward_expiry.service';

const baseInput: LeaveCarryforwardExpiryInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_leave_carryforward_expiry',
  source_record_ref: 'leave_carryforward_expiry_record_001',
  employee_ref: 'employee_phase_6c_001',
  leave_type_ref: 'leave_type_paid_annual',
  policy_ref: 'leave_policy_carryforward_annual',
  policy: 'CAPPED_CARRY_FORWARD',
  source_period_start: '2026-01-01',
  source_period_end: '2026-12-31',
  target_period_start: '2027-01-01',
  available_balance_units: 12,
  already_carried_forward_units: 2,
  max_carryforward_units: 6,
  evaluation_date: '2027-01-01',
  evaluated_by_user_id: 'user_phase_6c_leave_admin',
  evaluated_at: '2027-01-01T08:00:00.000Z',
  control_metadata: { source: 'phase_6c_ffet_035' },
};

const cappedReceipt = evaluateLeaveCarryforwardExpiry(baseInput);
assert.equal(cappedReceipt.seed_id, 'seed_6c_035_leave_carryforward_expiry');
assert.equal(cappedReceipt.component_id, '6C.03');
assert.equal(cappedReceipt.component_slug, 'hr_attendance_leave_and_time_tracking');
assert.equal(cappedReceipt.model_name, 'Phase6CLeaveCarryforwardExpiry');
assert.equal(cappedReceipt.event_name, 'phase_6c.hr_attendance_leave_and_time_tracking.leave_carryforward_expiry.evaluated');
assert.equal(cappedReceipt.runtime_status, 'LEAVE_CARRYFORWARD_EXPIRY_EVALUATED');
assert.equal(cappedReceipt.eligible_balance_units, 10);
assert.equal(cappedReceipt.carryforward_units, 6);
assert.equal(cappedReceipt.capped_units, 4);
assert.equal(cappedReceipt.expired_units, 0);
assert.equal(cappedReceipt.forfeited_units, 4);
assert.equal(cappedReceipt.decision, 'CARRY_FORWARD_CAPPED');
assert.equal(cappedReceipt.balance_mutation_allowed, false);
assert.equal(cappedReceipt.payroll_mutation_allowed, false);
assert.equal(cappedReceipt.provider_neutral_only, true);
assert.deepEqual(cappedReceipt.decision_refs, ['6C-ATT-015']);
assert.deepEqual(cappedReceipt.evidence_artifacts, [
  'leave_carryforward_expiry_decision_receipt',
  'leave_carryforward_cap_evidence',
  'leave_expiry_forfeiture_evidence',
]);
assert.match(cappedReceipt.leave_carryforward_expiry_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateLeaveCarryforwardExpiry(baseInput);
assert.equal(repeatedReceipt.leave_carryforward_expiry_evidence_digest, cappedReceipt.leave_carryforward_expiry_evidence_digest);

const fullCarryforwardReceipt = evaluateLeaveCarryforwardExpiry({
  ...baseInput,
  policy: 'FULL_CARRY_FORWARD',
  max_carryforward_units: undefined,
});
assert.equal(fullCarryforwardReceipt.carryforward_units, 10);
assert.equal(fullCarryforwardReceipt.capped_units, 0);
assert.equal(fullCarryforwardReceipt.forfeited_units, 0);
assert.equal(fullCarryforwardReceipt.decision, 'CARRY_FORWARD_APPLIED');

const noCarryforwardReceipt = evaluateLeaveCarryforwardExpiry({
  ...baseInput,
  policy: 'NO_CARRY_FORWARD',
  max_carryforward_units: undefined,
});
assert.equal(noCarryforwardReceipt.carryforward_units, 0);
assert.equal(noCarryforwardReceipt.forfeited_units, 10);
assert.equal(noCarryforwardReceipt.decision, 'NO_CARRY_FORWARD_ALLOWED');

const activeExpiryReceipt = evaluateLeaveCarryforwardExpiry({
  ...baseInput,
  policy: 'EXPIRY_DATE_CAPPED',
  max_carryforward_units: 8,
  expiry_date: '2027-03-31',
  evaluation_date: '2027-02-01',
});
assert.equal(activeExpiryReceipt.carryforward_units, 8);
assert.equal(activeExpiryReceipt.capped_units, 2);
assert.equal(activeExpiryReceipt.expired_units, 0);
assert.equal(activeExpiryReceipt.decision, 'CARRY_FORWARD_CAPPED');

const expiredReceipt = evaluateLeaveCarryforwardExpiry({
  ...baseInput,
  policy: 'EXPIRY_DATE_CAPPED',
  max_carryforward_units: 8,
  expiry_date: '2027-03-31',
  evaluation_date: '2027-04-01',
});
assert.equal(expiredReceipt.carryforward_units, 0);
assert.equal(expiredReceipt.expired_units, 10);
assert.equal(expiredReceipt.forfeited_units, 10);
assert.equal(expiredReceipt.decision, 'CARRY_FORWARD_EXPIRED');

assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, employee_ref: '' }), /employee_ref is required/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, leave_type_ref: '' }), /leave_type_ref is required/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, policy_ref: '' }), /policy_ref is required/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, source_period_start: '01-01-2026' }), /source_period_start must use YYYY-MM-DD format/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, source_period_start: '2027-01-01', source_period_end: '2026-12-31' }), /source_period_start must be on or before source_period_end/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, target_period_start: '2026-12-31' }), /target_period_start must be after source_period_end/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, available_balance_units: -1 }), /available_balance_units must be a non-negative finite number/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, already_carried_forward_units: -1 }), /already_carried_forward_units must be a non-negative finite number/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, already_carried_forward_units: 13 }), /already_carried_forward_units cannot exceed available_balance_units/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, max_carryforward_units: 0 }), /max_carryforward_units must be a positive finite number/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, max_carryforward_units: undefined }), /max_carryforward_units is required for capped carry-forward policy/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, evaluation_date: 'not-a-date' }), /evaluation_date must use YYYY-MM-DD format/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, balance_mutation_requested: true }), /must not mutate leave balances directly/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, payroll_mutation_requested: true }), /must not mutate payroll surfaces/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, provider_specific_adapter_requested: true }), /provider-neutral/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, schema_mutation_requested: true }), /must not request schema mutation/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateLeaveCarryforwardExpiry({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C leave_carryforward_expiry runtime test passed.');
