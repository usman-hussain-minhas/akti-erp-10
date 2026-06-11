import assert from 'node:assert/strict';

import { evaluatePayrollInputEvidence, type PayrollInputEvidenceInput } from './payroll_input_evidence.service';

const baseInput: PayrollInputEvidenceInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_payroll_input_evidence',
  source_record_ref: 'payroll_input_evidence_record_001',
  employee_ref: 'employee_phase_6c_001',
  payroll_period_ref: 'payroll_2027_01',
  attendance_period_start: '2027-01-01',
  attendance_period_end: '2027-01-31',
  evidence_lines: [
    { evidence_ref: 'attendance_regular_001', source_seed_id: 'seed_6c_024_qr_attendance', kind: 'ATTENDANCE_HOURS', quantity: 160, approved: true },
    { evidence_ref: 'attendance_overtime_001', source_seed_id: 'seed_6c_030_attendance_exception_detection', kind: 'OVERTIME_HOURS', quantity: 8.5, approved: true },
    { evidence_ref: 'leave_paid_001', source_seed_id: 'seed_6c_034_leave_accrual_engine', kind: 'PAID_LEAVE_UNITS', quantity: 2, approved: true },
    { evidence_ref: 'leave_unpaid_001', source_seed_id: 'seed_6c_032_holiday_calendar', kind: 'UNPAID_LEAVE_UNITS', quantity: 1, approved: true },
    { evidence_ref: 'absence_deduction_001', source_seed_id: 'seed_6c_030_attendance_exception_detection', kind: 'ABSENCE_DEDUCTION_UNITS', quantity: 0.5, approved: true },
    { evidence_ref: 'encashment_001', source_seed_id: 'seed_6c_036_leave_encashment', kind: 'LEAVE_ENCASHMENT_AMOUNT', quantity: 8, amount: 10004, currency: 'pkr', approved: true },
  ],
  evaluated_by_user_id: 'user_phase_6c_payroll_admin',
  evaluated_at: '2027-02-01T08:00:00.000Z',
  control_metadata: { source: 'phase_6c_ffet_038' },
};

const readyReceipt = evaluatePayrollInputEvidence(baseInput);
assert.equal(readyReceipt.seed_id, 'seed_6c_038_payroll_input_evidence');
assert.equal(readyReceipt.component_id, '6C.03');
assert.equal(readyReceipt.component_slug, 'hr_attendance_leave_and_time_tracking');
assert.equal(readyReceipt.model_name, 'Phase6CPayrollInputEvidence');
assert.equal(readyReceipt.event_name, 'phase_6c.hr_attendance_leave_and_time_tracking.payroll_input_evidence.evaluated');
assert.equal(readyReceipt.runtime_status, 'PAYROLL_INPUT_EVIDENCE_EVALUATED');
assert.equal(readyReceipt.evidence_line_count, 6);
assert.equal(readyReceipt.approved_line_count, 6);
assert.equal(readyReceipt.rejected_line_count, 0);
assert.equal(readyReceipt.attendance_hours, 160);
assert.equal(readyReceipt.overtime_hours, 8.5);
assert.equal(readyReceipt.paid_leave_units, 2);
assert.equal(readyReceipt.unpaid_leave_units, 1);
assert.equal(readyReceipt.absence_deduction_units, 0.5);
assert.equal(readyReceipt.leave_encashment_amount, 10004);
assert.equal(readyReceipt.currency, 'PKR');
assert.equal(readyReceipt.status, 'PAYROLL_INPUT_READY');
assert.equal(readyReceipt.payroll_mutation_allowed, false);
assert.equal(readyReceipt.balance_mutation_allowed, false);
assert.equal(readyReceipt.provider_neutral_only, true);
assert.deepEqual(readyReceipt.decision_refs, ['6C-ATT-017']);
assert.deepEqual(readyReceipt.evidence_artifacts, [
  'payroll_input_evidence_receipt',
  'attendance_payroll_summary_evidence',
  'leave_payroll_boundary_evidence',
]);
assert.match(readyReceipt.payroll_input_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluatePayrollInputEvidence(baseInput);
assert.equal(repeatedReceipt.payroll_input_evidence_digest, readyReceipt.payroll_input_evidence_digest);

const reviewReceipt = evaluatePayrollInputEvidence({
  ...baseInput,
  evidence_lines: [
    ...baseInput.evidence_lines,
    { evidence_ref: 'attendance_unapproved_001', source_seed_id: 'seed_6c_030_attendance_exception_detection', kind: 'OVERTIME_HOURS', quantity: 2, approved: false },
  ],
});
assert.equal(reviewReceipt.approved_line_count, 6);
assert.equal(reviewReceipt.rejected_line_count, 1);
assert.equal(reviewReceipt.overtime_hours, 8.5);
assert.equal(reviewReceipt.status, 'PAYROLL_INPUT_REQUIRES_REVIEW');

const noApprovedReceipt = evaluatePayrollInputEvidence({
  ...baseInput,
  evidence_lines: [{ evidence_ref: 'attendance_unapproved_002', source_seed_id: 'seed_6c_030_attendance_exception_detection', kind: 'ATTENDANCE_HOURS', quantity: 1, approved: false }],
});
assert.equal(noApprovedReceipt.approved_line_count, 0);
assert.equal(noApprovedReceipt.status, 'PAYROLL_INPUT_REQUIRES_REVIEW');

assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, employee_ref: '' }), /employee_ref is required/);
assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, payroll_period_ref: '' }), /payroll_period_ref is required/);
assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, attendance_period_start: '01-01-2027' }), /attendance_period_start must use YYYY-MM-DD format/);
assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, attendance_period_start: '2027-02-01', attendance_period_end: '2027-01-31' }), /attendance_period_start must be on or before attendance_period_end/);
assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, evidence_lines: [] }), /evidence_lines must contain at least one line/);
assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, evidence_lines: [{ ...baseInput.evidence_lines[0], evidence_ref: '' }] }), /evidence_ref is required/);
assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, evidence_lines: [{ ...baseInput.evidence_lines[0], source_seed_id: '' }] }), /source_seed_id is required/);
assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, evidence_lines: [{ ...baseInput.evidence_lines[0], quantity: -1 }] }), /quantity must be a non-negative finite number/);
assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, evidence_lines: [{ ...baseInput.evidence_lines[5], amount: -1 }] }), /amount must be a non-negative finite number/);
assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, evidence_lines: [{ ...baseInput.evidence_lines[5], currency: 'rupees' }] }), /currency must be an ISO-4217 three-letter code/);
assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, evidence_lines: [baseInput.evidence_lines[5], { evidence_ref: 'encashment_002', source_seed_id: 'seed_6c_036_leave_encashment', kind: 'LEAVE_ENCASHMENT_AMOUNT', quantity: 1, amount: 10, currency: 'USD', approved: true }] }), /all monetary payroll input evidence lines must use the same currency/);
assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, payroll_mutation_requested: true }), /must not mutate payroll surfaces/);
assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, balance_mutation_requested: true }), /must not mutate leave balances directly/);
assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, provider_specific_adapter_requested: true }), /provider-neutral/);
assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, schema_mutation_requested: true }), /must not request schema mutation/);
assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluatePayrollInputEvidence({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C payroll_input_evidence runtime test passed.');
