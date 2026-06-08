import assert from 'node:assert/strict';
import { postJournalEntry, type JournalEntryEngineInput } from './journal_entry_engine.service';

const baseInput: JournalEntryEngineInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_general_ledger_accounting',
  source_seed_id: 'seed_6b_12_journal_entry_engine',
  journal_entry_ref: 'journal_entry_001',
  chart_version_ref: 'coa_2026_v1',
  accounting_period_ref: 'period_2026_06',
  accounting_period_open: true,
  source_event_name: 'invoice.issued',
  source_event_ref: 'invoice_issued_event_001',
  invoice_record_authority_ref: 'invoice_record_authority_001',
  base_currency_code: 'usd',
  transaction_currency_code: 'usd',
  journal_lines: [
    {
      journal_entry_line_ref: 'journal_line_debit_receivable',
      chart_of_account_ref: 'acct_receivable',
      side: 'DEBIT',
      amount_minor: 100000,
      line_evidence_ref: 'invoice_receivable_evidence_001',
    },
    {
      journal_entry_line_ref: 'journal_line_credit_revenue',
      chart_of_account_ref: 'acct_revenue',
      side: 'CREDIT',
      amount_minor: 100000,
      line_evidence_ref: 'invoice_revenue_evidence_001',
    },
  ],
  posted_by_user_id: 'user_gl_controller_001',
  posted_at: '2026-06-08T00:00:00.000Z',
};

const receipt = postJournalEntry(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_12_journal_entry_engine');
assert.equal(receipt.component_id, '6B.12');
assert.equal(receipt.event_name, 'phase_6b.general_ledger_accounting.journal.posted');
assert.equal(receipt.phase_6b_journal_entry_model, 'Phase6BJournalEntry');
assert.equal(receipt.phase_6b_journal_entry_line_model, 'Phase6BJournalEntryLine');
assert.equal(receipt.source_seed_id, 'seed_6b_12_journal_entry_engine');
assert.equal(receipt.accounting_period_open_confirmed, true);
assert.equal(receipt.source_event_name, 'invoice.issued');
assert.equal(receipt.invoice_record_authority_ref, 'invoice_record_authority_001');
assert.equal(receipt.base_currency_code, 'USD');
assert.equal(receipt.transaction_currency_code, 'USD');
assert.deepEqual(receipt.adl_refs, []);
assert.equal(receipt.line_count, 2);
assert.equal(receipt.debit_total_minor, 100000);
assert.equal(receipt.credit_total_minor, 100000);
assert.equal(receipt.journal_balanced, true);
assert.equal(receipt.journal_posted, true);
assert.equal(receipt.journal_entry_evidence_ref, 'journal_entry:journal_entry_001:invoice.issued');
assert.equal(receipt.journal_entry_digest.length, 64);
assert.equal(receipt.period_closed, false);
assert.equal(receipt.tax_report_generated, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.provider_callback_processed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const fxReceipt = postJournalEntry({
  ...baseInput,
  journal_entry_ref: 'journal_entry_fx_001',
  source_event_name: 'payment.verified',
  invoice_record_authority_ref: undefined,
  payment_allocation_balance_ref: 'payment_allocation_balance_001',
  transaction_currency_code: 'eur',
  exchange_rate_basis_ref: 'fx_rate_basis_2026_06_08',
  fx_gain_loss_amount_minor: 250,
  fx_gain_loss_account_ref: 'acct_fx_gain_loss',
});
assert.equal(fxReceipt.source_event_name, 'payment.verified');
assert.equal(fxReceipt.payment_allocation_balance_ref, 'payment_allocation_balance_001');
assert.equal(fxReceipt.transaction_currency_code, 'EUR');
assert.equal(fxReceipt.fx_gain_loss_amount_minor, 250);
assert.equal(fxReceipt.fx_gain_loss_account_ref, 'acct_fx_gain_loss');
assert.deepEqual(fxReceipt.adl_refs, ['ADL-016']);

const expenseReceipt = postJournalEntry({
  ...baseInput,
  journal_entry_ref: 'journal_entry_expense_001',
  source_event_name: 'expense.created',
  invoice_record_authority_ref: undefined,
  expense_record_authority_ref: 'expense_record_authority_001',
});
assert.equal(expenseReceipt.source_event_name, 'expense.created');
assert.equal(expenseReceipt.expense_record_authority_ref, 'expense_record_authority_001');

assert.throws(() => postJournalEntry({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => postJournalEntry({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => postJournalEntry({ ...baseInput, source_seed_id: 'seed_other' as never }), /source_seed_id must match/);
assert.throws(() => postJournalEntry({ ...baseInput, journal_entry_ref: '' }), /journal_entry_ref is required/);
assert.throws(() => postJournalEntry({ ...baseInput, chart_version_ref: '' }), /chart_version_ref is required/);
assert.throws(() => postJournalEntry({ ...baseInput, accounting_period_ref: '' }), /accounting_period_ref is required/);
assert.throws(() => postJournalEntry({ ...baseInput, accounting_period_open: false }), /accounting_period_open must be true/);
assert.throws(() => postJournalEntry({ ...baseInput, source_event_name: 'po.approved' as never }), /source_event_name is not supported/);
assert.throws(() => postJournalEntry({ ...baseInput, source_event_ref: '' }), /source_event_ref is required/);
assert.throws(() => postJournalEntry({ ...baseInput, invoice_record_authority_ref: undefined }), /invoice_record_authority_ref is required/);
assert.throws(() => postJournalEntry({ ...baseInput, source_event_name: 'payment.verified', invoice_record_authority_ref: undefined }), /payment_allocation_balance_ref is required/);
assert.throws(() => postJournalEntry({ ...baseInput, source_event_name: 'expense.created', invoice_record_authority_ref: undefined }), /expense_record_authority_ref is required/);
assert.throws(() => postJournalEntry({ ...baseInput, base_currency_code: 'US' }), /base_currency_code must be a three-letter/);
assert.throws(() => postJournalEntry({ ...baseInput, transaction_currency_code: 'EU' }), /transaction_currency_code must be a three-letter/);
assert.throws(() => postJournalEntry({ ...baseInput, transaction_currency_code: 'EUR' }), /exchange_rate_basis_ref is required/);
assert.throws(() => postJournalEntry({ ...baseInput, fx_gain_loss_amount_minor: 10 }), /fx_gain_loss_account_ref is required/);
assert.throws(() => postJournalEntry({ ...baseInput, fx_gain_loss_amount_minor: 1.5 }), /fx_gain_loss_amount_minor must be an integer/);
assert.throws(() => postJournalEntry({ ...baseInput, exchange_rate_basis_ref: 'fx_rate', fx_gain_loss_account_ref: 'acct_fx' }), /FX gain\/loss fields are allowed only/);
assert.throws(() => postJournalEntry({ ...baseInput, journal_lines: [baseInput.journal_lines[0]] }), /journal_lines must include at least two lines/);
assert.throws(() => postJournalEntry({ ...baseInput, journal_lines: [baseInput.journal_lines[0], baseInput.journal_lines[0]] }), /journal_lines must not repeat journal_entry_line_ref/);
assert.throws(() => postJournalEntry({ ...baseInput, journal_lines: [{ ...baseInput.journal_lines[0], journal_entry_line_ref: '' }, baseInput.journal_lines[1]] }), /journal_lines\[0\].journal_entry_line_ref is required/);
assert.throws(() => postJournalEntry({ ...baseInput, journal_lines: [{ ...baseInput.journal_lines[0], chart_of_account_ref: '' }, baseInput.journal_lines[1]] }), /journal_lines\[0\].chart_of_account_ref is required/);
assert.throws(() => postJournalEntry({ ...baseInput, journal_lines: [{ ...baseInput.journal_lines[0], side: 'OTHER' as never }, baseInput.journal_lines[1]] }), /journal entry line side is not supported/);
assert.throws(() => postJournalEntry({ ...baseInput, journal_lines: [{ ...baseInput.journal_lines[0], amount_minor: 0 }, baseInput.journal_lines[1]] }), /amount_minor must be a positive integer/);
assert.throws(() => postJournalEntry({ ...baseInput, journal_lines: [{ ...baseInput.journal_lines[0], line_evidence_ref: '' }, baseInput.journal_lines[1]] }), /journal_lines\[0\].line_evidence_ref is required/);
assert.throws(() => postJournalEntry({ ...baseInput, journal_lines: [{ ...baseInput.journal_lines[0], amount_minor: 100001 }, baseInput.journal_lines[1]] }), /journal entry must balance/);
assert.throws(() => postJournalEntry({ ...baseInput, posted_by_user_id: '' }), /posted_by_user_id is required/);
assert.throws(() => postJournalEntry({ ...baseInput, posted_at: 'not-a-date' }), /posted_at must be a valid ISO-compatible timestamp/);
assert.throws(() => postJournalEntry({ ...baseInput, period_close_requested: true }), /must not close accounting periods/);
assert.throws(() => postJournalEntry({ ...baseInput, tax_report_generation_requested: true }), /must not generate tax reports/);
assert.throws(() => postJournalEntry({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => postJournalEntry({ ...baseInput, provider_callback_processing_requested: true }), /must not process provider callbacks/);
assert.throws(() => postJournalEntry({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-085 journal entry engine service test passed.');
