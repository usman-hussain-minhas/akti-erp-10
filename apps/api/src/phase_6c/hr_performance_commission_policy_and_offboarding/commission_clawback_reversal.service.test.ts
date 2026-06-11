import assert from 'node:assert/strict';

import { evaluateCommissionClawbackReversal, type CommissionClawbackReversalInput } from './commission_clawback_reversal.service';

const baseInput: CommissionClawbackReversalInput = {
  organization_id: 'org_phase_6c_commission',
  service_manifest_contract_id: 'smc_phase_6c_commission_clawback_reversal',
  source_record_ref: 'commission_clawback_batch_2026_06',
  reversal_batch_ref: 'clawback_batch_2026_06_001',
  period_ref: '2026-06',
  currency: 'USD',
  reversal_items: [
    {
      commission_receipt_ref: 'commission_receipt_full_001',
      employee_ref: 'employee_sales_001',
      commission_plan_ref: 'plan_standard_sales_commission',
      original_commission_amount: 1000,
      paid_commission_amount: 800,
      prior_reversal_amount: 100,
      reversal_requested_amount: 300,
      reason: 'CUSTOMER_REFUND',
      approved_for_reversal: true,
      source_evidence_ref: 'refund_evidence_001',
      currency: 'USD',
      evidence_refs: ['refund_evidence_001', 'payment_collection_001'],
    },
    {
      commission_receipt_ref: 'commission_receipt_partial_001',
      employee_ref: 'employee_sales_002',
      commission_plan_ref: 'plan_enterprise_sales_commission',
      original_commission_amount: 1200,
      paid_commission_amount: 600,
      prior_reversal_amount: 500,
      reversal_requested_amount: 300,
      reason: 'DEAL_CANCELLATION',
      approved_for_reversal: true,
      source_evidence_ref: 'cancellation_evidence_001',
      evidence_refs: ['cancellation_evidence_001'],
    },
    {
      commission_receipt_ref: 'commission_receipt_review_001',
      employee_ref: 'employee_sales_003',
      commission_plan_ref: 'plan_standard_sales_commission',
      original_commission_amount: 700,
      paid_commission_amount: 700,
      reversal_requested_amount: 200,
      reason: 'COMPLIANCE_HOLD',
      approved_for_reversal: false,
      source_evidence_ref: 'compliance_case_001',
      review_note: 'legal review pending',
      evidence_refs: ['compliance_case_001'],
    },
  ],
  evaluated_by_user_id: 'user_commission_controller',
  evaluated_at: '2026-06-15T09:00:00.000Z',
  control_metadata: { source: 'phase_6c_ffet_045' },
};

const receipt = evaluateCommissionClawbackReversal(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_045_commission_clawback_reversal');
assert.equal(receipt.component_id, '6C.04');
assert.equal(receipt.component_slug, 'hr_performance_commission_policy_and_offboarding');
assert.equal(receipt.model_name, 'Phase6CCommissionClawbackReversal');
assert.equal(receipt.event_name, 'phase_6c.hr_performance_commission_policy_and_offboarding.commission_clawback_reversal.evaluated');
assert.equal(receipt.reversal_item_count, 3);
assert.equal(receipt.full_reversal_count, 1);
assert.equal(receipt.partial_reversal_count, 1);
assert.equal(receipt.review_reversal_count, 1);
assert.equal(receipt.requested_reversal_amount_total, 800);
assert.equal(receipt.approved_reversal_amount_total, 400);
assert.equal(receipt.unreversed_requested_amount_total, 400);
assert.equal(receipt.decision, 'CLAWBACK_REVERSAL_PARTIAL');
assert.equal(receipt.planned_reversals[0].maximum_reversible_amount, 700);
assert.equal(receipt.planned_reversals[0].approved_reversal_amount, 300);
assert.equal(receipt.planned_reversals[0].outcome, 'FULL_REVERSAL_READY');
assert.equal(receipt.planned_reversals[1].maximum_reversible_amount, 100);
assert.equal(receipt.planned_reversals[1].approved_reversal_amount, 100);
assert.equal(receipt.planned_reversals[1].unreversed_requested_amount, 200);
assert.equal(receipt.planned_reversals[1].outcome, 'PARTIAL_REVERSAL_READY');
assert.equal(receipt.planned_reversals[2].approved_reversal_amount, 0);
assert.equal(receipt.planned_reversals[2].outcome, 'REVERSAL_REQUIRES_REVIEW');
assert.equal(receipt.payroll_mutation_allowed, false);
assert.equal(receipt.payment_mutation_allowed, false);
assert.equal(receipt.crm_mutation_allowed, false);
assert.equal(receipt.provider_specific_adapter_allowed, false);
assert.equal(receipt.schema_mutation_allowed, false);
assert.equal(receipt.phase_6a_mutation_allowed, false);
assert.equal(receipt.phase_6b_mutation_allowed, false);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.equal(receipt.ticket_flag_flip_allowed, false);
assert.deepEqual(receipt.decision_refs, ['6C-HR-OPS-008']);
assert.match(receipt.clawback_reversal_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateCommissionClawbackReversal(baseInput);
assert.equal(repeatedReceipt.clawback_reversal_digest, receipt.clawback_reversal_digest);

const readyReceipt = evaluateCommissionClawbackReversal({
  ...baseInput,
  reversal_items: baseInput.reversal_items.slice(0, 1),
});
assert.equal(readyReceipt.decision, 'CLAWBACK_REVERSAL_READY');
assert.equal(readyReceipt.approved_reversal_amount_total, 300);
assert.equal(readyReceipt.unreversed_requested_amount_total, 0);

const reviewReceipt = evaluateCommissionClawbackReversal({
  ...baseInput,
  reversal_items: baseInput.reversal_items.slice(2),
});
assert.equal(reviewReceipt.decision, 'CLAWBACK_REVERSAL_REQUIRES_REVIEW');
assert.equal(reviewReceipt.approved_reversal_amount_total, 0);

assert.throws(() => evaluateCommissionClawbackReversal({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateCommissionClawbackReversal({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateCommissionClawbackReversal({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateCommissionClawbackReversal({ ...baseInput, reversal_batch_ref: '' }), /reversal_batch_ref is required/);
assert.throws(() => evaluateCommissionClawbackReversal({ ...baseInput, period_ref: '' }), /period_ref is required/);
assert.throws(() => evaluateCommissionClawbackReversal({ ...baseInput, currency: 'US' }), /currency must be a three-letter ISO currency code/);
assert.throws(() => evaluateCommissionClawbackReversal({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateCommissionClawbackReversal({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateCommissionClawbackReversal({ ...baseInput, reversal_items: [{ ...baseInput.reversal_items[0], currency: 'EUR' }] }), /currency must match/);
assert.throws(() => evaluateCommissionClawbackReversal({ ...baseInput, reversal_items: [{ ...baseInput.reversal_items[0], paid_commission_amount: 1100 }] }), /paid_commission_amount must not exceed original_commission_amount/);
assert.throws(() => evaluateCommissionClawbackReversal({ ...baseInput, reversal_items: [{ ...baseInput.reversal_items[0], prior_reversal_amount: 900 }] }), /prior_reversal_amount must not exceed paid_commission_amount/);
assert.throws(() => evaluateCommissionClawbackReversal({ ...baseInput, reversal_items: [{ ...baseInput.reversal_items[0], reversal_requested_amount: -1 }] }), /reversal_requested_amount must be a non-negative finite number/);
assert.throws(() => evaluateCommissionClawbackReversal({ ...baseInput, reversal_items: [{ ...baseInput.reversal_items[0], reason: 'OTHER' as never }] }), /reason must be a supported clawback reason/);
assert.throws(() => evaluateCommissionClawbackReversal({ ...baseInput, reversal_items: [{ ...baseInput.reversal_items[0], evidence_refs: [] }] }), /evidence_refs must contain at least one evidence reference/);
assert.throws(() => evaluateCommissionClawbackReversal({ ...baseInput, payroll_mutation_requested: true }), /must not perform payroll mutation/);
assert.throws(() => evaluateCommissionClawbackReversal({ ...baseInput, payment_mutation_requested: true }), /must not perform payment mutation/);
assert.throws(() => evaluateCommissionClawbackReversal({ ...baseInput, crm_mutation_requested: true }), /must not perform CRM mutation/);
assert.throws(() => evaluateCommissionClawbackReversal({ ...baseInput, provider_specific_adapter_requested: true }), /must not perform provider-specific adapter execution/);
assert.throws(() => evaluateCommissionClawbackReversal({ ...baseInput, schema_mutation_requested: true }), /must not perform schema mutation/);
assert.throws(() => evaluateCommissionClawbackReversal({ ...baseInput, phase_6a_mutation_requested: true }), /must not perform Phase 6A mutation/);
assert.throws(() => evaluateCommissionClawbackReversal({ ...baseInput, phase_6b_mutation_requested: true }), /must not perform Phase 6B mutation/);
assert.throws(() => evaluateCommissionClawbackReversal({ ...baseInput, runtime_adapter_requested: true }), /must not perform runtime adapter execution/);
assert.throws(() => evaluateCommissionClawbackReversal({ ...baseInput, ticket_flag_flip_requested: true }), /must not perform ticket flag flip/);

console.log('P6C commission_clawback_reversal runtime FFET test passed.');
