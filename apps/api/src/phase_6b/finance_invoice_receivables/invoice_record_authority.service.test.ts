import assert from 'node:assert/strict';
import { authorizeInvoiceRecord, type InvoiceRecordAuthorityInput } from './invoice_record_authority.service';

const baseInput: InvoiceRecordAuthorityInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_finance_invoice_receivables',
  invoice_id: 'invoice_001',
  invoice_number: 'INV-2026-0001',
  customer_record_ref: 'customer_record_001',
  pipeline_stage_model_ref: 'pipeline_stage_model_001',
  visual_workflow_builder_ref: 'visual_workflow_builder_001',
  payment_terms: { basis: 'NET_DAYS', net_days: 30 },
  status: 'ISSUED',
  currency_code: 'usd',
  issued_at: '2026-06-08T22:45:00.000Z',
  invoice_lines: [
    {
      invoice_line_id: 'invoice_line_001',
      line_type: 'PRODUCT',
      product_record_ref: 'product_record_001',
      product_price_history_ref: 'product_price_history_001',
      pricing_table_effective_date_ref: 'pricing_table_effective_date_001',
      description: 'Admissions service package',
      quantity_units: 2,
      unit_amount_minor: 15000,
      currency_code: 'USD',
      line_total_minor: 30000,
    },
    {
      invoice_line_id: 'invoice_line_002',
      line_type: 'SERVICE',
      product_record_ref: 'product_record_002',
      product_price_history_ref: 'product_price_history_002',
      pricing_table_effective_date_ref: 'pricing_table_effective_date_001',
      description: 'Support service package',
      quantity_units: 1,
      unit_amount_minor: 5000,
      currency_code: 'USD',
      line_total_minor: 5000,
    },
  ],
  authorized_by_user_id: 'user_finance_owner_001',
  authorized_at: '2026-06-08T22:46:00.000Z',
};

const receipt = authorizeInvoiceRecord(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_09_invoice_record_authority');
assert.equal(receipt.component_id, '6B.09');
assert.equal(receipt.event_name, 'phase_6b.finance_invoice_receivables.invoice_record.authorized');
assert.equal(receipt.currency_code, 'USD');
assert.equal(receipt.status, 'ISSUED');
assert.equal(receipt.immutable_after_issue, true);
assert.equal(receipt.post_issue_change_policy, 'CREDIT_OR_DEBIT_NOTE_REQUIRED');
assert.equal(receipt.line_count, 2);
assert.equal(receipt.invoice_total_minor, 35000);
assert.match(receipt.invoice_record_digest, /^[a-f0-9]{64}$/);
assert.equal(receipt.mutate_issued_invoice_allowed, false);
assert.equal(receipt.payment_allocation_allowed, false);
assert.equal(receipt.invoice_send_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const repeatedReceipt = authorizeInvoiceRecord(baseInput);
assert.equal(repeatedReceipt.invoice_record_digest, receipt.invoice_record_digest);

const draftReceipt = authorizeInvoiceRecord({
  ...baseInput,
  invoice_id: 'invoice_002',
  invoice_number: 'INV-DRAFT-0002',
  payment_terms: { basis: 'DUE_ON_RECEIPT' },
  status: 'DRAFT',
  issued_at: undefined,
});
assert.equal(draftReceipt.status, 'DRAFT');
assert.equal(draftReceipt.immutable_after_issue, false);
assert.equal(draftReceipt.payment_terms.basis, 'DUE_ON_RECEIPT');

assert.throws(() => authorizeInvoiceRecord({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, invoice_id: '' }), /invoice_id is required/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, invoice_number: '' }), /invoice_number is required/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, customer_record_ref: '' }), /customer_record_ref is required/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, pipeline_stage_model_ref: '' }), /pipeline_stage_model_ref is required/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, visual_workflow_builder_ref: '' }), /visual_workflow_builder_ref is required/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, payment_terms: { basis: 'CUSTOM' as never } }), /payment_terms.basis is not supported/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, payment_terms: { basis: 'DUE_ON_RECEIPT', net_days: 1 } }), /must not carry net_days/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, payment_terms: { basis: 'NET_DAYS', net_days: 0 } }), /require positive net_days/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, status: 'PAID' as never }), /status is not supported/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, status: 'ISSUED', issued_at: undefined }), /issued_at is required/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, status: 'DRAFT', issued_at: '2026-06-08T22:45:00.000Z' }), /issued_at is allowed only when status is ISSUED/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, currency_code: 'US' }), /currency_code must be a three-letter/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, invoice_lines: [] }), /invoice_lines must include at least one line/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, invoice_lines: [{ ...baseInput.invoice_lines[0]!, invoice_line_id: '' }] }), /invoice_lines.invoice_line_id is required/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, invoice_lines: [{ ...baseInput.invoice_lines[0]!, line_type: 'FEE' as never }] }), /line_type is not supported/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, invoice_lines: [{ ...baseInput.invoice_lines[0]!, product_record_ref: '' }] }), /invoice_lines.product_record_ref is required/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, invoice_lines: [{ ...baseInput.invoice_lines[0]!, product_price_history_ref: '' }] }), /invoice_lines.product_price_history_ref is required/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, invoice_lines: [{ ...baseInput.invoice_lines[0]!, pricing_table_effective_date_ref: '' }] }), /invoice_lines.pricing_table_effective_date_ref is required/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, invoice_lines: [{ ...baseInput.invoice_lines[0]!, description: '' }] }), /invoice_lines.description is required/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, invoice_lines: [{ ...baseInput.invoice_lines[0]!, quantity_units: 0 }] }), /quantity_units must be a positive integer/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, invoice_lines: [{ ...baseInput.invoice_lines[0]!, unit_amount_minor: -1 }] }), /unit_amount_minor must be a non-negative integer/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, invoice_lines: [{ ...baseInput.invoice_lines[0]!, currency_code: 'EUR' }] }), /invoice line currency must match invoice currency/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, invoice_lines: [{ ...baseInput.invoice_lines[0]!, line_total_minor: 1 }] }), /line_total_minor must equal quantity_units times unit_amount_minor/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, invoice_lines: [{ ...baseInput.invoice_lines[0]!, invoice_line_id: 'duplicate' }, { ...baseInput.invoice_lines[1]!, invoice_line_id: 'duplicate' }] }), /invoice_lines must not repeat invoice_line_id/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, authorized_by_user_id: '' }), /authorized_by_user_id is required/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, authorized_at: 'not-a-date' }), /authorized_at must be a valid ISO-compatible timestamp/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, mutate_issued_invoice_requested: true }), /issued invoices must not be mutated/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, invoice_send_requested: true }), /must not send invoices/);
assert.throws(() => authorizeInvoiceRecord({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-064 invoice record authority service test passed.');
