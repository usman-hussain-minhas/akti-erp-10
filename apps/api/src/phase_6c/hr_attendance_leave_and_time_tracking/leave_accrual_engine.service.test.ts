import assert from 'node:assert/strict';

import { evaluateLeaveAccrualEngine, type LeaveAccrualEngineInput } from './leave_accrual_engine.service';

const baseInput: LeaveAccrualEngineInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_leave_accrual_engine',
  source_record_ref: 'leave_accrual_engine_record_001',
  employee_ref: 'employee_phase_6c_001',
  leave_type_ref: 'leave_type_paid_annual',
  accrual_rule_ref: 'leave_accrual_rule_monthly',
  accrual_frequency: 'MONTHLY',
  accrual_period_start: '2026-06-01',
  accrual_period_end: '2026-06-30',
  annual_entitlement_units: 24,
  opening_balance_units: 4,
  used_units: 1,
  carry_forward_units: 2,
  max_balance_units: 30,
  rounding_policy: 'NONE',
  evaluated_by_user_id: 'user_phase_6c_leave_admin',
  evaluated_at: '2026-06-09T08:00:00.000Z',
  control_metadata: { source: 'phase_6c_ffet_034' },
};

const monthlyReceipt = evaluateLeaveAccrualEngine(baseInput);
assert.equal(monthlyReceipt.seed_id, 'seed_6c_034_leave_accrual_engine');
assert.equal(monthlyReceipt.component_id, '6C.03');
assert.equal(monthlyReceipt.component_slug, 'hr_attendance_leave_and_time_tracking');
assert.equal(monthlyReceipt.model_name, 'Phase6CLeaveAccrualEngine');
assert.equal(monthlyReceipt.event_name, 'phase_6c.hr_attendance_leave_and_time_tracking.leave_accrual_engine.evaluated');
assert.equal(monthlyReceipt.runtime_status, 'LEAVE_ACCRUAL_ENGINE_EVALUATED');
assert.equal(monthlyReceipt.raw_accrual_units, 2);
assert.equal(monthlyReceipt.rounded_accrual_units, 2);
assert.equal(monthlyReceipt.cap_adjustment_units, 0);
assert.equal(monthlyReceipt.projected_balance_units, 7);
assert.equal(monthlyReceipt.decision, 'ACCRUAL_CALCULATED');
assert.equal(monthlyReceipt.balance_mutation_allowed, false);
assert.equal(monthlyReceipt.provider_neutral_only, true);
assert.deepEqual(monthlyReceipt.decision_refs, ['6C-ATT-002', '6C-ATT-014', '6C-ATT-015', '6C-ATT-019']);
assert.deepEqual(monthlyReceipt.evidence_artifacts, [
  'leave_accrual_decision_receipt',
  'leave_accrual_formula_evidence',
  'leave_accrual_cap_evidence',
]);
assert.match(monthlyReceipt.leave_accrual_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateLeaveAccrualEngine(baseInput);
assert.equal(repeatedReceipt.leave_accrual_evidence_digest, monthlyReceipt.leave_accrual_evidence_digest);

const payPeriodReceipt = evaluateLeaveAccrualEngine({
  ...baseInput,
  accrual_frequency: 'PER_PAY_PERIOD',
  pay_periods_in_year: 24,
  completed_pay_periods: 2,
  rounding_policy: 'NEAREST_HALF',
});
assert.equal(payPeriodReceipt.raw_accrual_units, 2);
assert.equal(payPeriodReceipt.rounded_accrual_units, 2);

const annualGrantReceipt = evaluateLeaveAccrualEngine({
  ...baseInput,
  accrual_frequency: 'ANNUAL_GRANT',
  rounding_policy: 'FLOOR',
});
assert.equal(annualGrantReceipt.raw_accrual_units, 24);
assert.equal(annualGrantReceipt.rounded_accrual_units, 24);

const proratedReceipt = evaluateLeaveAccrualEngine({
  ...baseInput,
  accrual_frequency: 'PRORATED_PERIOD',
  annual_entitlement_units: 36,
  accrual_period_start: '2026-01-01',
  accrual_period_end: '2026-01-31',
  period_year_days: 360,
  rounding_policy: 'CEILING',
});
assert.equal(proratedReceipt.raw_accrual_units, 3.1);
assert.equal(proratedReceipt.rounded_accrual_units, 4);

const cappedReceipt = evaluateLeaveAccrualEngine({
  ...baseInput,
  opening_balance_units: 29,
  carry_forward_units: 0,
  used_units: 0,
  max_balance_units: 30,
});
assert.equal(cappedReceipt.decision, 'ACCRUAL_CAPPED');
assert.equal(cappedReceipt.cap_adjustment_units, 1);
assert.equal(cappedReceipt.projected_balance_units, 30);

assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, employee_ref: '' }), /employee_ref is required/);
assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, leave_type_ref: '' }), /leave_type_ref is required/);
assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, accrual_rule_ref: '' }), /accrual_rule_ref is required/);
assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, accrual_period_start: '01-01-2026' }), /accrual_period_start must use YYYY-MM-DD format/);
assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, accrual_period_start: '2026-07-01', accrual_period_end: '2026-06-30' }), /accrual_period_start must be on or before accrual_period_end/);
assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, annual_entitlement_units: -1 }), /annual_entitlement_units must be a non-negative finite number/);
assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, opening_balance_units: -1 }), /opening_balance_units must be a non-negative finite number/);
assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, used_units: -1 }), /used_units must be a non-negative finite number/);
assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, carry_forward_units: -1 }), /carry_forward_units must be a non-negative finite number/);
assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, max_balance_units: 0 }), /max_balance_units must be a positive finite number/);
assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, accrual_frequency: 'PER_PAY_PERIOD', pay_periods_in_year: 0 }), /pay_periods_in_year must be a positive finite number/);
assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, accrual_frequency: 'PRORATED_PERIOD', period_year_days: 0 }), /period_year_days must be a positive finite number/);
assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, direct_balance_mutation_requested: true }), /must not mutate leave balances directly/);
assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, provider_specific_adapter_requested: true }), /provider-neutral/);
assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, schema_mutation_requested: true }), /must not request schema mutation/);
assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateLeaveAccrualEngine({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C leave_accrual_engine runtime test passed.');
