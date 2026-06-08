import assert from 'node:assert/strict';
import { computePaymentAllocationBalance, type PaymentAllocationBalanceInput } from './payment_allocation_balance.service';

const baseInput: PaymentAllocationBalanceInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_payment_collection_topup',
  pricing_table_effective_date_ref: 'pricing_effective_2026_06',
  payment_receipt_ref: 'payment_receipt_001',
  payment_evidence_ref: 'payment_evidence_001',
  currency_code: 'pkr',
  payment_amount_minor: 50000,
  allocated_by_user_id: 'user_payment_operator_001',
  allocated_at: '2026-06-08T12:00:00.000Z',
  allocation_lines: [
    {
      allocation_line_ref: 'allocation_line_001',
      invoice_record_ref: 'invoice_001',
      receivable_ref: 'receivable_001',
      invoice_total_minor: 30000,
      existing_allocated_minor: 10000,
      allocation_amount_minor: 20000,
      payment_evidence_ref: 'payment_evidence_001',
    },
    {
      allocation_line_ref: 'allocation_line_002',
      invoice_record_ref: 'invoice_002',
      receivable_ref: 'receivable_002',
      invoice_total_minor: 40000,
      existing_allocated_minor: 5000,
      allocation_amount_minor: 15000,
      payment_evidence_ref: 'payment_evidence_001',
    },
  ],
};

const receipt = computePaymentAllocationBalance(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_10_payment_allocation_balance');
assert.equal(receipt.component_id, '6B.10');
assert.equal(receipt.event_name, 'phase_6b.payment_collection_topup.payment_allocation.balance_computed');
assert.equal(receipt.invoice_record_authority_adl_ref, 'ADL-013');
assert.equal(receipt.currency_code, 'PKR');
assert.equal(receipt.total_newly_allocated_minor, 35000);
assert.equal(receipt.unallocated_payment_balance_minor, 15000);
assert.equal(receipt.provider_neutral, true);
assert.equal(receipt.api_key_scope_consumed, false);
assert.equal(receipt.provider_callback_processed, false);
assert.equal(receipt.reconciliation_performed, false);
assert.equal(receipt.refund_performed, false);
assert.equal(receipt.top_up_performed, false);
assert.equal(receipt.invoice_mutation_performed, false);
assert.equal(receipt.irreversible_action_allowed, false);
assert.equal(receipt.allocation_entries[0].invoice_remaining_balance_minor, 0);
assert.equal(receipt.allocation_entries[0].status, 'FULLY_ALLOCATED');
assert.equal(receipt.allocation_entries[1].invoice_remaining_balance_minor, 20000);
assert.equal(receipt.allocation_entries[1].status, 'PARTIALLY_ALLOCATED');

const unallocatedLine = computePaymentAllocationBalance({
  ...baseInput,
  payment_receipt_ref: 'payment_receipt_002',
  payment_amount_minor: 25000,
  allocation_lines: [
    {
      ...baseInput.allocation_lines[0],
      allocation_line_ref: 'allocation_line_003',
      existing_allocated_minor: 0,
      allocation_amount_minor: 0,
    },
  ],
});
assert.equal(unallocatedLine.total_newly_allocated_minor, 0);
assert.equal(unallocatedLine.unallocated_payment_balance_minor, 25000);
assert.equal(unallocatedLine.allocation_entries[0].status, 'UNALLOCATED');

assert.throws(() => computePaymentAllocationBalance({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, pricing_table_effective_date_ref: '' }), /pricing_table_effective_date_ref is required/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, payment_receipt_ref: '' }), /payment_receipt_ref is required/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, payment_evidence_ref: '' }), /payment_evidence_ref is required/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, currency_code: 'PK' }), /currency_code must be a three-letter/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, payment_amount_minor: 0 }), /payment_amount_minor must be a positive integer/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, allocated_by_user_id: '' }), /allocated_by_user_id is required/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, allocated_at: 'not-a-date' }), /allocated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, allocation_lines: [] }), /allocation_lines must include at least one line/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, allocation_lines: [baseInput.allocation_lines[0], baseInput.allocation_lines[0]] }), /must not repeat allocation_line_ref/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, allocation_lines: [{ ...baseInput.allocation_lines[0], allocation_line_ref: '' }] }), /allocation_lines.allocation_line_ref is required/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, allocation_lines: [{ ...baseInput.allocation_lines[0], invoice_record_ref: '' }] }), /allocation_lines.invoice_record_ref is required/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, allocation_lines: [{ ...baseInput.allocation_lines[0], receivable_ref: '' }] }), /allocation_lines.receivable_ref is required/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, allocation_lines: [{ ...baseInput.allocation_lines[0], payment_evidence_ref: '' }] }), /allocation_lines.payment_evidence_ref is required/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, allocation_lines: [{ ...baseInput.allocation_lines[0], invoice_total_minor: 0 }] }), /invoice_total_minor must be a positive integer/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, allocation_lines: [{ ...baseInput.allocation_lines[0], existing_allocated_minor: -1 }] }), /existing_allocated_minor must be a non-negative integer/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, allocation_lines: [{ ...baseInput.allocation_lines[0], allocation_amount_minor: -1 }] }), /allocation_amount_minor must be a non-negative integer/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, allocation_lines: [{ ...baseInput.allocation_lines[0], existing_allocated_minor: 40000 }] }), /existing_allocated_minor must not exceed invoice_total_minor/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, allocation_lines: [{ ...baseInput.allocation_lines[0], allocation_amount_minor: 25000 }] }), /allocation_amount_minor must not exceed available invoice balance/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, payment_amount_minor: 10000 }), /total allocation_amount_minor must not exceed payment_amount_minor/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, api_key_scope_registry_ref: 'api_key_scope_provider_001' }), /must not consume API-key scope/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, provider_callback_processing_requested: true }), /must not process provider callbacks/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, reconciliation_requested: true }), /must not perform reconciliation behavior/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, refund_requested: true }), /must not execute refunds/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, top_up_requested: true }), /must not execute top-ups/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, invoice_mutation_requested: true }), /must not mutate invoice records/);
assert.throws(() => computePaymentAllocationBalance({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-076 payment allocation balance service test passed.');
