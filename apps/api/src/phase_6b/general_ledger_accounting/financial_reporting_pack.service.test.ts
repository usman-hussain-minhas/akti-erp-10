import assert from 'node:assert/strict';
import { generateFinancialReportingPack, type FinancialReportingPackInput } from './financial_reporting_pack.service';

const baseInput: FinancialReportingPackInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_general_ledger_accounting',
  source_seed_id: 'seed_6b_12_financial_reporting_pack',
  reporting_pack_ref: 'reporting_pack_2026_06',
  accounting_period_ref: 'period_2026_06',
  chart_version_ref: 'coa_2026_v1',
  invoice_record_authority_ref: 'invoice_record_authority_001',
  payment_allocation_balance_ref: 'payment_allocation_balance_001',
  expense_record_authority_ref: 'expense_record_authority_001',
  report_currency_code: 'usd',
  trial_balance_lines: [
    {
      account_ref: 'acct_cash',
      account_code: '1000',
      account_name: 'Cash',
      account_type: 'ASSET',
      debit_total_minor: 140000,
      credit_total_minor: 0,
      line_evidence_ref: 'trial_balance_cash_evidence',
    },
    {
      account_ref: 'acct_liability',
      account_code: '2000',
      account_name: 'Liabilities',
      account_type: 'LIABILITY',
      debit_total_minor: 0,
      credit_total_minor: 50000,
      line_evidence_ref: 'trial_balance_liability_evidence',
    },
    {
      account_ref: 'acct_equity',
      account_code: '3000',
      account_name: 'Equity',
      account_type: 'EQUITY',
      debit_total_minor: 0,
      credit_total_minor: 40000,
      line_evidence_ref: 'trial_balance_equity_evidence',
    },
    {
      account_ref: 'acct_revenue',
      account_code: '4000',
      account_name: 'Revenue',
      account_type: 'REVENUE',
      debit_total_minor: 0,
      credit_total_minor: 80000,
      line_evidence_ref: 'trial_balance_revenue_evidence',
    },
    {
      account_ref: 'acct_expense',
      account_code: '5000',
      account_name: 'Expenses',
      account_type: 'EXPENSE',
      debit_total_minor: 30000,
      credit_total_minor: 0,
      line_evidence_ref: 'trial_balance_expense_evidence',
    },
  ],
  report_evidence_refs: ['report_pack_source_evidence_001', 'trial_balance_evidence_001'],
  generated_by_user_id: 'user_reporting_controller_001',
  generated_at: '2026-06-08T00:00:00.000Z',
};

const receipt = generateFinancialReportingPack(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_12_financial_reporting_pack');
assert.equal(receipt.component_id, '6B.12');
assert.equal(receipt.event_name, 'phase_6b.general_ledger_accounting.financial_reporting_pack.generated');
assert.equal(receipt.source_seed_id, 'seed_6b_12_financial_reporting_pack');
assert.equal(receipt.report_currency_code, 'USD');
assert.equal(receipt.trial_balance_line_count, 5);
assert.equal(receipt.asset_total_minor, 140000);
assert.equal(receipt.liability_total_minor, 50000);
assert.equal(receipt.equity_total_minor, 40000);
assert.equal(receipt.revenue_total_minor, 80000);
assert.equal(receipt.expense_total_minor, 30000);
assert.equal(receipt.net_income_minor, 50000);
assert.equal(receipt.balance_sheet_check_minor, 0);
assert.equal(receipt.trial_balance_balanced, true);
assert.equal(receipt.report_evidence_count, 2);
assert.equal(receipt.financial_reporting_pack_generated, true);
assert.equal(receipt.frontend_screen_created, false);
assert.equal(receipt.external_publication_performed, false);
assert.equal(receipt.journal_posting_performed, false);
assert.equal(receipt.period_closed, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.irreversible_action_allowed, false);
assert.equal(receipt.reporting_pack_evidence_ref, 'financial_reporting_pack:reporting_pack_2026_06:generated');
assert.equal(receipt.reporting_pack_digest.length, 64);

assert.throws(() => generateFinancialReportingPack({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, source_seed_id: 'seed_other' as never }), /source_seed_id must match/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, reporting_pack_ref: '' }), /reporting_pack_ref is required/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, accounting_period_ref: '' }), /accounting_period_ref is required/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, chart_version_ref: '' }), /chart_version_ref is required/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, invoice_record_authority_ref: '' }), /invoice_record_authority_ref is required/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, payment_allocation_balance_ref: '' }), /payment_allocation_balance_ref is required/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, expense_record_authority_ref: '' }), /expense_record_authority_ref is required/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, report_currency_code: 'US' }), /report_currency_code must be a three-letter/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, trial_balance_lines: [] }), /trial_balance_lines must include at least one line/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, trial_balance_lines: [{ ...baseInput.trial_balance_lines[0], account_ref: '' }] }), /trial_balance_lines.account_ref is required/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, trial_balance_lines: [{ ...baseInput.trial_balance_lines[0], account_code: '' }] }), /trial_balance_lines.account_code is required/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, trial_balance_lines: [{ ...baseInput.trial_balance_lines[0], account_code: 'cash account' }] }), /account_code must use uppercase/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, trial_balance_lines: [{ ...baseInput.trial_balance_lines[0], account_name: '' }] }), /trial_balance_lines.account_name is required/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, trial_balance_lines: [{ ...baseInput.trial_balance_lines[0], account_type: 'TAX' as never }] }), /account_type is not supported/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, trial_balance_lines: [{ ...baseInput.trial_balance_lines[0], debit_total_minor: -1 }] }), /debit_total_minor must be a non-negative integer/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, trial_balance_lines: [{ ...baseInput.trial_balance_lines[0], credit_total_minor: -1 }] }), /credit_total_minor must be a non-negative integer/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, trial_balance_lines: [{ ...baseInput.trial_balance_lines[0], line_evidence_ref: '' }] }), /trial_balance_lines.line_evidence_ref is required/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, trial_balance_lines: [baseInput.trial_balance_lines[0], baseInput.trial_balance_lines[0]] }), /trial_balance_lines must not repeat account_ref/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, trial_balance_lines: [{ ...baseInput.trial_balance_lines[0], debit_total_minor: 1 }, ...baseInput.trial_balance_lines.slice(1)] }), /requires a balanced balance sheet equation/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, report_evidence_refs: [] }), /report_evidence_refs must include at least one/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, report_evidence_refs: ['evidence_a', 'evidence_a'] }), /report_evidence_refs must not contain duplicates/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, report_evidence_refs: [' '] }), /report_evidence_refs\[0\] is required/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, generated_by_user_id: '' }), /generated_by_user_id is required/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, generated_at: 'not-a-date' }), /generated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, frontend_screen_requested: true }), /must not create frontend screens/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, external_publication_requested: true }), /must not publish reports externally/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, journal_posting_requested: true }), /must not post journals/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, period_close_requested: true }), /must not close periods/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => generateFinancialReportingPack({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-089 financial reporting pack service test passed.');
