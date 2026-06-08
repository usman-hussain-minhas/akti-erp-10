import assert from 'node:assert/strict';
import { configureChartOfAccounts, type ChartOfAccountsInput } from './chart_of_accounts.service';

const baseInput: ChartOfAccountsInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_general_ledger_accounting',
  source_seed_id: 'seed_6b_12_chart_of_accounts',
  chart_version_ref: 'coa_2026_v1',
  base_currency_code: 'usd',
  invoice_record_authority_ref: 'invoice_record_authority_001',
  payment_allocation_balance_ref: 'payment_allocation_balance_001',
  expense_record_authority_ref: 'expense_record_authority_001',
  accounts: [
    {
      account_ref: 'acct_receivable',
      account_code: '1100',
      account_name: 'Trade receivables',
      account_type: 'ASSET',
      normal_balance: 'DEBIT',
      posting_policy: 'POSTING_ALLOWED',
    },
    {
      account_ref: 'acct_revenue',
      account_code: '4000',
      account_name: 'Service revenue',
      account_type: 'REVENUE',
      normal_balance: 'CREDIT',
      posting_policy: 'POSTING_ALLOWED',
    },
    {
      account_ref: 'acct_expense_parent',
      account_code: '5000',
      account_name: 'Operating expenses',
      account_type: 'EXPENSE',
      normal_balance: 'DEBIT',
      posting_policy: 'SUMMARY_ONLY',
    },
    {
      account_ref: 'acct_vendor_expense',
      account_code: '5000.10',
      account_name: 'Vendor expenses',
      account_type: 'EXPENSE',
      normal_balance: 'DEBIT',
      posting_policy: 'POSTING_ALLOWED',
      parent_account_ref: 'acct_expense_parent',
    },
  ],
  finance_event_mappings: [
    {
      mapping_ref: 'map_invoice_receivable',
      source_event_name: 'invoice.issued',
      account_ref: 'acct_receivable',
      entry_side: 'DEBIT',
      mapping_evidence_ref: 'mapping_evidence_invoice_receivable',
    },
    {
      mapping_ref: 'map_invoice_revenue',
      source_event_name: 'invoice.issued',
      account_ref: 'acct_revenue',
      entry_side: 'CREDIT',
      mapping_evidence_ref: 'mapping_evidence_invoice_revenue',
    },
    {
      mapping_ref: 'map_expense_vendor',
      source_event_name: 'expense.created',
      account_ref: 'acct_vendor_expense',
      entry_side: 'DEBIT',
      mapping_evidence_ref: 'mapping_evidence_expense_vendor',
    },
  ],
  configured_by_user_id: 'user_gl_controller_001',
  configured_at: '2026-06-08T00:00:00.000Z',
};

const receipt = configureChartOfAccounts(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_12_chart_of_accounts');
assert.equal(receipt.component_id, '6B.12');
assert.equal(receipt.event_name, 'phase_6b.general_ledger_accounting.chart_of_accounts.configured');
assert.equal(receipt.phase_6b_chart_of_account_model, 'Phase6BChartOfAccount');
assert.equal(receipt.source_seed_id, 'seed_6b_12_chart_of_accounts');
assert.equal(receipt.base_currency_code, 'USD');
assert.equal(receipt.account_count, 4);
assert.equal(receipt.finance_event_mapping_count, 3);
assert.equal(receipt.accounting_periods_protected, true);
assert.equal(receipt.chart_configuration_evidence_ref, 'chart_of_accounts:coa_2026_v1:configured');
assert.equal(receipt.chart_of_accounts_digest.length, 64);
assert.equal(receipt.journal_posting_performed, false);
assert.equal(receipt.period_closed, false);
assert.equal(receipt.tax_report_generated, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.irreversible_action_allowed, false);
assert.equal(receipt.accounts[3].parent_account_ref, 'acct_expense_parent');

assert.throws(() => configureChartOfAccounts({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, source_seed_id: 'seed_other' as never }), /source_seed_id must match/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, chart_version_ref: '' }), /chart_version_ref is required/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, base_currency_code: 'US' }), /base_currency_code must be a three-letter/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, invoice_record_authority_ref: '' }), /invoice_record_authority_ref is required/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, payment_allocation_balance_ref: '' }), /payment_allocation_balance_ref is required/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, expense_record_authority_ref: '' }), /expense_record_authority_ref is required/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, accounts: [] }), /accounts must include at least one account/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, accounts: [{ ...baseInput.accounts[0], account_ref: '' }] }), /accounts.account_ref is required/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, accounts: [{ ...baseInput.accounts[0], account_code: '' }] }), /accounts.account_code is required/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, accounts: [{ ...baseInput.accounts[0], account_code: 'receivable code' }] }), /account_code must use uppercase/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, accounts: [{ ...baseInput.accounts[0], account_name: '' }] }), /accounts.account_name is required/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, accounts: [{ ...baseInput.accounts[0], account_type: 'OTHER' as never }] }), /account_type is not supported/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, accounts: [{ ...baseInput.accounts[0], normal_balance: 'OTHER' as never }] }), /normal_balance is not supported/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, accounts: [{ ...baseInput.accounts[0], posting_policy: 'AUTO_POST' as never }] }), /posting_policy is not supported/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, accounts: [baseInput.accounts[0], baseInput.accounts[0]] }), /accounts must not repeat account_ref/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, accounts: [{ ...baseInput.accounts[0], parent_account_ref: 'acct_receivable' }] }), /parent_account_ref must not equal account_ref/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, accounts: [{ ...baseInput.accounts[0], parent_account_ref: 'missing_parent' }] }), /parent_account_ref must reference another account/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, finance_event_mappings: [] }), /finance_event_mappings must include at least one mapping/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, finance_event_mappings: [{ ...baseInput.finance_event_mappings[0], mapping_ref: '' }] }), /finance_event_mappings.mapping_ref is required/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, finance_event_mappings: [{ ...baseInput.finance_event_mappings[0], source_event_name: 'po.approved' as never }] }), /source_event_name is not supported/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, finance_event_mappings: [{ ...baseInput.finance_event_mappings[0], account_ref: 'missing_account' }] }), /finance_event_mappings.account_ref must reference an account/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, finance_event_mappings: [{ ...baseInput.finance_event_mappings[0], entry_side: 'OTHER' as never }] }), /entry_side is not supported/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, finance_event_mappings: [{ ...baseInput.finance_event_mappings[0], mapping_evidence_ref: '' }] }), /finance_event_mappings.mapping_evidence_ref is required/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, finance_event_mappings: [baseInput.finance_event_mappings[0], baseInput.finance_event_mappings[0]] }), /finance_event_mappings must not repeat mapping_ref/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, configured_by_user_id: '' }), /configured_by_user_id is required/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, configured_at: 'not-a-date' }), /configured_at must be a valid ISO-compatible timestamp/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, journal_posting_requested: true }), /must not post journals/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, period_close_requested: true }), /must not close accounting periods/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, tax_report_generation_requested: true }), /must not generate tax reports/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => configureChartOfAccounts({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-084 chart of accounts service test passed.');
