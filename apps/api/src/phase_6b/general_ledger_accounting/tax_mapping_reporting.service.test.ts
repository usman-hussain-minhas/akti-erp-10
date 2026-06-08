import assert from 'node:assert/strict';
import { generateTaxMappingReport, type TaxMappingReportingInput } from './tax_mapping_reporting.service';

const baseInput: TaxMappingReportingInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_general_ledger_accounting',
  source_seed_id: 'seed_6b_12_tax_mapping_reporting',
  tax_report_ref: 'tax_report_2026_06',
  accounting_period_ref: 'period_2026_06',
  chart_version_ref: 'coa_2026_v1',
  invoice_record_authority_ref: 'invoice_record_authority_001',
  payment_allocation_balance_ref: 'payment_allocation_balance_001',
  expense_record_authority_ref: 'expense_record_authority_001',
  base_currency_code: 'usd',
  regional_compliance_pack_ref: 'regional_tax_pack_pk_2026',
  tax_mappings: [
    {
      tax_mapping_ref: 'tax_mapping_sales',
      tax_code_ref: 'tax_code_sales_standard',
      source_event_name: 'invoice.issued',
      chart_of_account_ref: 'acct_tax_payable',
      tax_rate_basis_points: 1750,
      rounding_mode: 'ROUND_HALF_UP',
      mapping_evidence_ref: 'mapping_evidence_sales_tax',
    },
    {
      tax_mapping_ref: 'tax_mapping_expense',
      tax_code_ref: 'tax_code_expense_recoverable',
      source_event_name: 'expense.created',
      chart_of_account_ref: 'acct_tax_recoverable',
      tax_rate_basis_points: 750,
      rounding_mode: 'TRUNCATE',
      mapping_evidence_ref: 'mapping_evidence_expense_tax',
    },
  ],
  taxable_lines: [
    {
      taxable_line_ref: 'taxable_line_invoice_001',
      source_event_name: 'invoice.issued',
      source_document_ref: 'invoice_001',
      tax_mapping_ref: 'tax_mapping_sales',
      net_amount_minor: 100000,
      currency_code: 'USD',
    },
    {
      taxable_line_ref: 'taxable_line_expense_001',
      source_event_name: 'expense.created',
      source_document_ref: 'expense_001',
      tax_mapping_ref: 'tax_mapping_expense',
      net_amount_minor: 3333,
      currency_code: 'usd',
    },
  ],
  generated_by_user_id: 'user_tax_controller_001',
  generated_at: '2026-06-08T00:00:00.000Z',
};

const receipt = generateTaxMappingReport(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_12_tax_mapping_reporting');
assert.equal(receipt.component_id, '6B.12');
assert.equal(receipt.event_name, 'phase_6b.general_ledger_accounting.tax_report.generated');
assert.equal(receipt.phase_6b_tax_mapping_model, 'Phase6BTaxMapping');
assert.equal(receipt.source_seed_id, 'seed_6b_12_tax_mapping_reporting');
assert.equal(receipt.base_currency_code, 'USD');
assert.equal(receipt.mapping_count, 2);
assert.equal(receipt.taxable_line_count, 2);
assert.equal(receipt.total_net_amount_minor, 103333);
assert.equal(receipt.total_tax_amount_minor, 17749);
assert.deepEqual(receipt.adl_refs, ['ADL-018']);
assert.equal(receipt.tax_report_generated, true);
assert.equal(receipt.external_tax_filing_submitted, false);
assert.equal(receipt.journal_posting_performed, false);
assert.equal(receipt.period_closed, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.provider_callback_processed, false);
assert.equal(receipt.irreversible_action_allowed, false);
assert.equal(receipt.tax_report_evidence_ref, 'tax_report:tax_report_2026_06:generated');
assert.equal(receipt.tax_report_digest.length, 64);
assert.equal(receipt.report_lines[0].tax_amount_minor, 17500);
assert.equal(receipt.report_lines[1].tax_amount_minor, 249);

const halfEven = generateTaxMappingReport({
  ...baseInput,
  tax_report_ref: 'tax_report_half_even',
  tax_mappings: [
    {
      ...baseInput.tax_mappings[0],
      tax_rate_basis_points: 5000,
      rounding_mode: 'ROUND_HALF_EVEN',
    },
  ],
  taxable_lines: [
    {
      ...baseInput.taxable_lines[0],
      net_amount_minor: 5,
    },
  ],
});
assert.equal(halfEven.report_lines[0].tax_amount_minor, 2);

assert.throws(() => generateTaxMappingReport({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, source_seed_id: 'seed_other' as never }), /source_seed_id must match/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, tax_report_ref: '' }), /tax_report_ref is required/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, accounting_period_ref: '' }), /accounting_period_ref is required/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, chart_version_ref: '' }), /chart_version_ref is required/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, invoice_record_authority_ref: '' }), /invoice_record_authority_ref is required/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, payment_allocation_balance_ref: '' }), /payment_allocation_balance_ref is required/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, expense_record_authority_ref: '' }), /expense_record_authority_ref is required/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, base_currency_code: 'US' }), /base_currency_code must be a three-letter/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, regional_compliance_pack_ref: '' }), /regional_compliance_pack_ref is required/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, tax_mappings: [] }), /tax_mappings must include at least one mapping/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, tax_mappings: [{ ...baseInput.tax_mappings[0], tax_mapping_ref: '' }] }), /tax_mappings.tax_mapping_ref is required/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, tax_mappings: [{ ...baseInput.tax_mappings[0], tax_code_ref: '' }] }), /tax_mappings.tax_code_ref is required/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, tax_mappings: [{ ...baseInput.tax_mappings[0], source_event_name: 'po.approved' as never }] }), /source_event_name is not supported/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, tax_mappings: [{ ...baseInput.tax_mappings[0], chart_of_account_ref: '' }] }), /tax_mappings.chart_of_account_ref is required/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, tax_mappings: [{ ...baseInput.tax_mappings[0], tax_rate_basis_points: -1 }] }), /tax_mappings.tax_rate_basis_points must be a non-negative integer/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, tax_mappings: [{ ...baseInput.tax_mappings[0], rounding_mode: 'ROUND_RANDOM' as never }] }), /rounding_mode is not supported/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, tax_mappings: [{ ...baseInput.tax_mappings[0], mapping_evidence_ref: '' }] }), /tax_mappings.mapping_evidence_ref is required/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, tax_mappings: [baseInput.tax_mappings[0], baseInput.tax_mappings[0]] }), /tax_mappings must not repeat tax_mapping_ref/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, taxable_lines: [] }), /taxable_lines must include at least one line/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, taxable_lines: [{ ...baseInput.taxable_lines[0], taxable_line_ref: '' }] }), /taxable_lines.taxable_line_ref is required/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, taxable_lines: [{ ...baseInput.taxable_lines[0], source_event_name: 'po.approved' as never }] }), /source_event_name is not supported/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, taxable_lines: [{ ...baseInput.taxable_lines[0], source_document_ref: '' }] }), /taxable_lines.source_document_ref is required/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, taxable_lines: [{ ...baseInput.taxable_lines[0], tax_mapping_ref: 'missing_mapping' }] }), /taxable_lines.tax_mapping_ref must reference a tax mapping/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, taxable_lines: [{ ...baseInput.taxable_lines[0], net_amount_minor: -1 }] }), /taxable_lines.net_amount_minor must be a non-negative integer/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, taxable_lines: [{ ...baseInput.taxable_lines[0], currency_code: 'PKR' }] }), /taxable_lines.currency_code must match base_currency_code/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, taxable_lines: [baseInput.taxable_lines[0], baseInput.taxable_lines[0]] }), /taxable_lines must not repeat taxable_line_ref/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, generated_by_user_id: '' }), /generated_by_user_id is required/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, generated_at: 'not-a-date' }), /generated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, journal_posting_requested: true }), /must not post journals/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, period_close_requested: true }), /must not close accounting periods/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, external_tax_filing_requested: true }), /must not submit external tax filings/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, provider_callback_processing_requested: true }), /must not process provider callbacks/);
assert.throws(() => generateTaxMappingReport({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-087 tax mapping reporting service test passed.');
