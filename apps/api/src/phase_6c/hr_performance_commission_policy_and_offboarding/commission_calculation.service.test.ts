import assert from 'node:assert/strict';

import { calculateCommissionFromEvidence, type CommissionCalculationInput } from './commission_calculation.service';

const baseInput: CommissionCalculationInput = {
  organization_id: 'org_phase_6c_commission',
  service_manifest_contract_id: 'smc_phase_6c_commission_calculation',
  source_record_ref: 'commission_batch_2026_06',
  employee_ref: 'employee_sales_001',
  commission_plan_ref: 'plan_standard_sales_commission',
  period_ref: '2026-06',
  default_commission_rate_percent: 3,
  max_commission_amount: 800,
  currency: 'USD',
  evidence_lines: [
    {
      evidence_ref: 'crm_closed_won_001',
      source_phase_ref: '6B_CRM',
      basis: 'CRM_REVENUE',
      eligible_amount: 10000,
      commission_rate_percent: 5,
      approved: true,
      currency: 'USD',
    },
    {
      evidence_ref: 'payment_collection_001',
      source_phase_ref: '6B_PAYMENTS',
      basis: 'PAYMENT_COLLECTION',
      eligible_amount: 5000,
      approved: true,
    },
    {
      evidence_ref: 'invoice_margin_001',
      source_phase_ref: '6B_INVOICING',
      basis: 'INVOICE_MARGIN',
      eligible_amount: 2000,
      commission_rate_percent: 10,
      approved: true,
    },
    {
      evidence_ref: 'manual_adjustment_rejected_001',
      source_phase_ref: 'MANUAL_APPROVED_EVIDENCE',
      basis: 'MANUAL_EVIDENCE_ADJUSTMENT',
      eligible_amount: 9000,
      commission_rate_percent: 20,
      approved: false,
    },
  ],
  evaluated_by_user_id: 'user_commission_controller',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  control_metadata: { source: 'phase_6c_ffet_043' },
};

const cappedReceipt = calculateCommissionFromEvidence(baseInput);
assert.equal(cappedReceipt.seed_id, 'seed_6c_043_commission_calculation');
assert.equal(cappedReceipt.component_id, '6C.04');
assert.equal(cappedReceipt.component_slug, 'hr_performance_commission_policy_and_offboarding');
assert.equal(cappedReceipt.model_name, 'Phase6CCommissionCalculation');
assert.equal(cappedReceipt.event_name, 'phase_6c.hr_performance_commission_policy_and_offboarding.commission_calculation.evaluated');
assert.equal(cappedReceipt.evidence_line_count, 4);
assert.equal(cappedReceipt.approved_line_count, 3);
assert.equal(cappedReceipt.rejected_line_count, 1);
assert.equal(cappedReceipt.eligible_amount_total, 17000);
assert.equal(cappedReceipt.gross_commission_amount, 850);
assert.equal(cappedReceipt.cap_adjustment_amount, 50);
assert.equal(cappedReceipt.payable_commission_amount, 800);
assert.equal(cappedReceipt.decision, 'COMMISSION_CAPPED');
assert.deepEqual(cappedReceipt.source_evidence_refs, ['crm_closed_won_001', 'payment_collection_001', 'invoice_margin_001']);
assert.equal(cappedReceipt.payroll_mutation_allowed, false);
assert.equal(cappedReceipt.payment_mutation_allowed, false);
assert.equal(cappedReceipt.crm_mutation_allowed, false);
assert.equal(cappedReceipt.provider_specific_adapter_allowed, false);
assert.equal(cappedReceipt.schema_mutation_allowed, false);
assert.equal(cappedReceipt.phase_6a_mutation_allowed, false);
assert.equal(cappedReceipt.phase_6b_mutation_allowed, false);
assert.equal(cappedReceipt.runtime_adapter_allowed, false);
assert.equal(cappedReceipt.ticket_flag_flip_allowed, false);
assert.deepEqual(cappedReceipt.decision_refs, ['6C-HR-OPS-005']);
assert.match(cappedReceipt.commission_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = calculateCommissionFromEvidence(baseInput);
assert.equal(repeatedReceipt.commission_evidence_digest, cappedReceipt.commission_evidence_digest);

const readyReceipt = calculateCommissionFromEvidence({
  ...baseInput,
  max_commission_amount: undefined,
  evidence_lines: baseInput.evidence_lines.slice(0, 2),
});
assert.equal(readyReceipt.gross_commission_amount, 650);
assert.equal(readyReceipt.payable_commission_amount, 650);
assert.equal(readyReceipt.cap_adjustment_amount, 0);
assert.equal(readyReceipt.decision, 'COMMISSION_EVIDENCE_READY');

const reviewReceipt = calculateCommissionFromEvidence({
  ...baseInput,
  evidence_lines: baseInput.evidence_lines.map((line) => ({ ...line, approved: false })),
});
assert.equal(reviewReceipt.approved_line_count, 0);
assert.equal(reviewReceipt.eligible_amount_total, 0);
assert.equal(reviewReceipt.payable_commission_amount, 0);
assert.equal(reviewReceipt.decision, 'COMMISSION_REQUIRES_REVIEW');

assert.throws(() => calculateCommissionFromEvidence({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => calculateCommissionFromEvidence({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => calculateCommissionFromEvidence({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => calculateCommissionFromEvidence({ ...baseInput, employee_ref: '' }), /employee_ref is required/);
assert.throws(() => calculateCommissionFromEvidence({ ...baseInput, commission_plan_ref: '' }), /commission_plan_ref is required/);
assert.throws(() => calculateCommissionFromEvidence({ ...baseInput, period_ref: '' }), /period_ref is required/);
assert.throws(() => calculateCommissionFromEvidence({ ...baseInput, currency: 'US' }), /currency must be a three-letter ISO currency code/);
assert.throws(() => calculateCommissionFromEvidence({ ...baseInput, default_commission_rate_percent: 0 }), /default_commission_rate_percent must be greater than 0/);
assert.throws(() => calculateCommissionFromEvidence({ ...baseInput, max_commission_amount: -1 }), /max_commission_amount must be a non-negative finite number/);
assert.throws(() => calculateCommissionFromEvidence({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => calculateCommissionFromEvidence({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => calculateCommissionFromEvidence({ ...baseInput, evidence_lines: [{ ...baseInput.evidence_lines[0], currency: 'EUR' }] }), /currency must match/);
assert.throws(() => calculateCommissionFromEvidence({ ...baseInput, evidence_lines: [{ ...baseInput.evidence_lines[0], eligible_amount: -1 }] }), /eligible_amount must be a non-negative finite number/);
assert.throws(() => calculateCommissionFromEvidence({ ...baseInput, evidence_lines: [{ ...baseInput.evidence_lines[0], commission_rate_percent: 101 }] }), /commission_rate_percent must be greater than 0/);
assert.throws(() => calculateCommissionFromEvidence({ ...baseInput, payroll_mutation_requested: true }), /must not perform payroll mutation/);
assert.throws(() => calculateCommissionFromEvidence({ ...baseInput, payment_mutation_requested: true }), /must not perform payment mutation/);
assert.throws(() => calculateCommissionFromEvidence({ ...baseInput, crm_mutation_requested: true }), /must not perform CRM mutation/);
assert.throws(() => calculateCommissionFromEvidence({ ...baseInput, provider_specific_adapter_requested: true }), /must not perform provider-specific adapter execution/);
assert.throws(() => calculateCommissionFromEvidence({ ...baseInput, schema_mutation_requested: true }), /must not perform schema mutation/);
assert.throws(() => calculateCommissionFromEvidence({ ...baseInput, phase_6a_mutation_requested: true }), /must not perform Phase 6A mutation/);
assert.throws(() => calculateCommissionFromEvidence({ ...baseInput, phase_6b_mutation_requested: true }), /must not perform Phase 6B mutation/);
assert.throws(() => calculateCommissionFromEvidence({ ...baseInput, runtime_adapter_requested: true }), /must not perform runtime adapter execution/);
assert.throws(() => calculateCommissionFromEvidence({ ...baseInput, ticket_flag_flip_requested: true }), /must not perform ticket flag flip/);

console.log('P6C commission_calculation runtime FFET test passed.');
