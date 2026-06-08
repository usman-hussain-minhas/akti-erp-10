import assert from 'node:assert/strict';
import { computeReceivableBalance, type ReceivableBalanceComputationInput } from './receivable_balance_computation.service';

const baseInput: ReceivableBalanceComputationInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_finance_invoice_receivables',
  receivable_id: 'receivable_001',
  invoice_record_ref: 'invoice_001',
  product_record_authority_ref: 'product_record_authority_001',
  product_price_history_ref: 'product_price_history_001',
  pricing_table_effective_date_ref: 'pricing_table_effective_date_001',
  pipeline_stage_model_ref: 'pipeline_stage_model_001',
  visual_workflow_builder_ref: 'visual_workflow_builder_001',
  currency_code: 'usd',
  invoice_total_minor: 35000,
  debit_note_total_minor: 5000,
  credit_note_total_minor: 10000,
  applied_payment_total_minor: 15000,
  invoice_issued_at: '2026-06-01T00:00:00.000Z',
  as_of: '2026-07-05T00:00:00.000Z',
  payment_terms: { basis: 'NET_DAYS', net_days: 30 },
  computed_by_user_id: 'user_finance_owner_001',
};

const receipt = computeReceivableBalance(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_09_receivable_balance_computation');
assert.equal(receipt.component_id, '6B.09');
assert.equal(receipt.event_name, 'phase_6b.finance_invoice_receivables.receivable_balance.computed');
assert.equal(receipt.currency_code, 'USD');
assert.equal(receipt.receivable_balance_minor, 15000);
assert.equal(receipt.due_at, '2026-07-01T00:00:00.000Z');
assert.equal(receipt.status, 'OVERDUE');
assert.equal(receipt.days_past_due, 4);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.provider_callback_processing_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const settledReceipt = computeReceivableBalance({
  ...baseInput,
  receivable_id: 'receivable_002',
  credit_note_total_minor: 5000,
  applied_payment_total_minor: 35000,
  as_of: '2026-06-20T00:00:00.000Z',
});
assert.equal(settledReceipt.receivable_balance_minor, 0);
assert.equal(settledReceipt.status, 'SETTLED');
assert.equal(settledReceipt.days_past_due, 0);

const dueOnReceipt = computeReceivableBalance({
  ...baseInput,
  receivable_id: 'receivable_003',
  payment_terms: { basis: 'DUE_ON_RECEIPT' },
  as_of: '2026-06-01T00:00:00.000Z',
});
assert.equal(dueOnReceipt.due_at, '2026-06-01T00:00:00.000Z');
assert.equal(dueOnReceipt.status, 'OPEN');

assert.throws(() => computeReceivableBalance({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => computeReceivableBalance({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => computeReceivableBalance({ ...baseInput, receivable_id: '' }), /receivable_id is required/);
assert.throws(() => computeReceivableBalance({ ...baseInput, invoice_record_ref: '' }), /invoice_record_ref is required/);
assert.throws(() => computeReceivableBalance({ ...baseInput, product_record_authority_ref: '' }), /product_record_authority_ref is required/);
assert.throws(() => computeReceivableBalance({ ...baseInput, product_price_history_ref: '' }), /product_price_history_ref is required/);
assert.throws(() => computeReceivableBalance({ ...baseInput, pricing_table_effective_date_ref: '' }), /pricing_table_effective_date_ref is required/);
assert.throws(() => computeReceivableBalance({ ...baseInput, pipeline_stage_model_ref: '' }), /pipeline_stage_model_ref is required/);
assert.throws(() => computeReceivableBalance({ ...baseInput, visual_workflow_builder_ref: '' }), /visual_workflow_builder_ref is required/);
assert.throws(() => computeReceivableBalance({ ...baseInput, currency_code: 'US' }), /currency_code must be a three-letter/);
assert.throws(() => computeReceivableBalance({ ...baseInput, invoice_total_minor: -1 }), /invoice_total_minor must be a non-negative integer/);
assert.throws(() => computeReceivableBalance({ ...baseInput, debit_note_total_minor: -1 }), /debit_note_total_minor must be a non-negative integer/);
assert.throws(() => computeReceivableBalance({ ...baseInput, credit_note_total_minor: -1 }), /credit_note_total_minor must be a non-negative integer/);
assert.throws(() => computeReceivableBalance({ ...baseInput, applied_payment_total_minor: -1 }), /applied_payment_total_minor must be a non-negative integer/);
assert.throws(() => computeReceivableBalance({ ...baseInput, credit_note_total_minor: 50000 }), /credits plus applied payments must not exceed gross receivable/);
assert.throws(() => computeReceivableBalance({ ...baseInput, invoice_issued_at: 'not-a-date' }), /invoice_issued_at must be a valid ISO-compatible timestamp/);
assert.throws(() => computeReceivableBalance({ ...baseInput, as_of: 'not-a-date' }), /as_of must be a valid ISO-compatible timestamp/);
assert.throws(() => computeReceivableBalance({ ...baseInput, as_of: '2026-05-31T00:00:00.000Z' }), /as_of must not be earlier than invoice_issued_at/);
assert.throws(() => computeReceivableBalance({ ...baseInput, payment_terms: { basis: 'CUSTOM' as never } }), /payment_terms.basis is not supported/);
assert.throws(() => computeReceivableBalance({ ...baseInput, payment_terms: { basis: 'DUE_ON_RECEIPT', net_days: 1 } }), /must not carry net_days/);
assert.throws(() => computeReceivableBalance({ ...baseInput, payment_terms: { basis: 'NET_DAYS', net_days: 0 } }), /require positive net_days/);
assert.throws(() => computeReceivableBalance({ ...baseInput, computed_by_user_id: '' }), /computed_by_user_id is required/);
assert.throws(() => computeReceivableBalance({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => computeReceivableBalance({ ...baseInput, provider_callback_requested: true }), /must not process provider callbacks/);
assert.throws(() => computeReceivableBalance({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-066 receivable balance computation service test passed.');
