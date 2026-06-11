import assert from 'node:assert/strict';

import { evaluateOffboardingSettlementStep, type OffboardingSettlementStepInput } from './offboarding_settlement_step.service';

const baseInput: OffboardingSettlementStepInput = {
  organization_id: 'org_phase_6c_offboarding',
  service_manifest_contract_id: 'smc_phase_6c_offboarding_settlement_step',
  source_record_ref: 'offboarding_case_001',
  saga_ref: 'offboarding_saga_employee_001',
  settlement_ref: 'settlement_employee_001_2026_06',
  employee_ref: 'employee_departing_001',
  currency: 'USD',
  settlement_lines: [
    {
      line_ref: 'final_salary_june',
      line_type: 'FINAL_SALARY',
      direction: 'EARNING',
      amount: 3000,
      approved: true,
      evidence_refs: ['payroll_input_evidence_001'],
    },
    {
      line_ref: 'leave_encashment',
      line_type: 'LEAVE_ENCASHMENT',
      direction: 'EARNING',
      amount: 600,
      approved: true,
      evidence_refs: ['leave_encashment_evidence_001'],
    },
    {
      line_ref: 'asset_deduction',
      line_type: 'ASSET_RECOVERY_DEDUCTION',
      direction: 'DEDUCTION',
      amount: 250,
      approved: true,
      evidence_refs: ['asset_recovery_evidence_001'],
    },
    {
      line_ref: 'legal_hold',
      line_type: 'SETTLEMENT_HOLD',
      direction: 'HOLD',
      amount: 100,
      approved: true,
      evidence_refs: ['legal_hold_evidence_001'],
    },
    {
      line_ref: 'manual_adjustment_review',
      line_type: 'DEDUCTION',
      direction: 'DEDUCTION',
      amount: 75,
      approved: false,
      review_note: 'manual deduction approval pending',
      evidence_refs: ['manual_review_evidence_001'],
    },
  ],
  evaluated_by_user_id: 'user_hr_admin',
  evaluated_at: '2026-06-15T09:00:00.000Z',
  control_metadata: { source: 'phase_6c_ffet_052' },
};

const partialReceipt = evaluateOffboardingSettlementStep(baseInput);
assert.equal(partialReceipt.seed_id, 'seed_6c_052_offboarding_settlement_step');
assert.equal(partialReceipt.component_id, '6C.04');
assert.equal(partialReceipt.component_slug, 'hr_performance_commission_policy_and_offboarding');
assert.equal(partialReceipt.model_name, 'Phase6COffboardingSettlementStep');
assert.equal(partialReceipt.event_name, 'phase_6c.hr_performance_commission_policy_and_offboarding.offboarding_settlement_step.evaluated');
assert.equal(partialReceipt.earning_total, 3600);
assert.equal(partialReceipt.deduction_total, 250);
assert.equal(partialReceipt.hold_total, 100);
assert.equal(partialReceipt.net_settlement_amount, 3250);
assert.equal(partialReceipt.review_line_count, 1);
assert.equal(partialReceipt.decision, 'SETTLEMENT_PARTIAL_REVIEW');
assert.equal(partialReceipt.prepared_lines[4].outcome, 'REVIEW_REQUIRED');
assert.equal(partialReceipt.payroll_mutation_allowed, false);
assert.equal(partialReceipt.payment_mutation_allowed, false);
assert.equal(partialReceipt.event_dispatch_allowed, false);
assert.equal(partialReceipt.dlq_write_allowed, false);
assert.equal(partialReceipt.schema_mutation_allowed, false);
assert.equal(partialReceipt.phase_6a_mutation_allowed, false);
assert.equal(partialReceipt.phase_6b_mutation_allowed, false);
assert.equal(partialReceipt.runtime_adapter_allowed, false);
assert.equal(partialReceipt.ticket_flag_flip_allowed, false);
assert.deepEqual(partialReceipt.adl_refs, ['ADL-001', 'ADL-002']);
assert.deepEqual(partialReceipt.decision_refs, ['6C-HR-OPS-012', '6C-HR-OPS-011', '6C-ADL-002', '6C-ADL-004']);
assert.match(partialReceipt.settlement_step_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateOffboardingSettlementStep(baseInput);
assert.equal(repeatedReceipt.settlement_step_digest, partialReceipt.settlement_step_digest);

const readyReceipt = evaluateOffboardingSettlementStep({
  ...baseInput,
  settlement_lines: baseInput.settlement_lines.slice(0, 3),
});
assert.equal(readyReceipt.decision, 'SETTLEMENT_READY');
assert.equal(readyReceipt.net_settlement_amount, 3350);
assert.equal(readyReceipt.review_line_count, 0);

const negativeReceipt = evaluateOffboardingSettlementStep({
  ...baseInput,
  settlement_lines: [{ ...baseInput.settlement_lines[2], amount: 5000 }],
});
assert.equal(negativeReceipt.decision, 'SETTLEMENT_REQUIRES_REVIEW');
assert.equal(negativeReceipt.net_settlement_amount, -5000);

assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, saga_ref: '' }), /saga_ref is required/);
assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, settlement_ref: '' }), /settlement_ref is required/);
assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, employee_ref: '' }), /employee_ref is required/);
assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, currency: 'US' }), /currency must be a three-letter ISO currency code/);
assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, settlement_lines: [] }), /settlement_lines must contain at least one line/);
assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, settlement_lines: [{ ...baseInput.settlement_lines[0], line_type: 'OTHER' as never }] }), /line_type must be a supported line type/);
assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, settlement_lines: [{ ...baseInput.settlement_lines[0], direction: 'OTHER' as never }] }), /direction must be a supported line direction/);
assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, settlement_lines: [{ ...baseInput.settlement_lines[0], amount: -1 }] }), /amount must be a non-negative finite number/);
assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, settlement_lines: [{ ...baseInput.settlement_lines[0], currency: 'EUR' }] }), /currency must match/);
assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, settlement_lines: [{ ...baseInput.settlement_lines[0], evidence_refs: [] }] }), /evidence_refs must contain at least one evidence reference/);
assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, payroll_mutation_requested: true }), /must not perform payroll mutation/);
assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, payment_mutation_requested: true }), /must not perform payment mutation/);
assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, event_dispatch_requested: true }), /must not perform event dispatch/);
assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, dlq_write_requested: true }), /must not perform DLQ write/);
assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, schema_mutation_requested: true }), /must not perform schema mutation/);
assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, phase_6a_mutation_requested: true }), /must not perform Phase 6A mutation/);
assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, phase_6b_mutation_requested: true }), /must not perform Phase 6B mutation/);
assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, runtime_adapter_requested: true }), /must not perform runtime adapter execution/);
assert.throws(() => evaluateOffboardingSettlementStep({ ...baseInput, ticket_flag_flip_requested: true }), /must not perform ticket flag flip/);

console.log('P6C offboarding_settlement_step runtime FFET test passed.');
