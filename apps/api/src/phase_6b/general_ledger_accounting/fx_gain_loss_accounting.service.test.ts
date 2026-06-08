import assert from 'node:assert/strict';
import { accountForFxGainLoss, type FxGainLossAccountingInput } from './fx_gain_loss_accounting.service';

const baseInput: FxGainLossAccountingInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_general_ledger_accounting',
  source_seed_id: 'seed_6b_12_fx_gain_loss_accounting',
  fx_event_ref: 'fx_event_receivable_gain_001',
  source_event_name: 'invoice.issued',
  source_document_ref: 'invoice_001',
  invoice_record_authority_ref: 'invoice_record_authority_001',
  payment_allocation_balance_ref: 'payment_allocation_balance_001',
  journal_entry_engine_ref: 'journal_entry_engine_001',
  chart_version_ref: 'coa_2026_v1',
  accounting_period_ref: 'period_2026_06',
  position_type: 'RECEIVABLE',
  base_currency_code: 'usd',
  transaction_currency_code: 'eur',
  original_base_amount_minor: 100000,
  settlement_base_amount_minor: 102500,
  exchange_rate_basis_ref: 'fx_rate_basis_2026_06_08',
  fx_gain_account_ref: 'acct_fx_gain',
  fx_loss_account_ref: 'acct_fx_loss',
  settlement_clearing_account_ref: 'acct_settlement_clearing',
  accounted_by_user_id: 'user_gl_controller_001',
  accounted_at: '2026-06-08T00:00:00.000Z',
};

const gain = accountForFxGainLoss(baseInput);
assert.equal(gain.seed_id, 'seed_6b_12_fx_gain_loss_accounting');
assert.equal(gain.component_id, '6B.12');
assert.equal(gain.event_name, 'phase_6b.general_ledger_accounting.fx_gain_loss.accounted');
assert.equal(gain.source_seed_id, 'seed_6b_12_fx_gain_loss_accounting');
assert.equal(gain.source_event_name, 'invoice.issued');
assert.equal(gain.position_type, 'RECEIVABLE');
assert.equal(gain.base_currency_code, 'USD');
assert.equal(gain.transaction_currency_code, 'EUR');
assert.equal(gain.signed_base_delta_minor, 2500);
assert.equal(gain.fx_gain_loss_amount_minor, 2500);
assert.equal(gain.fx_gain_loss_classification, 'GAIN');
assert.deepEqual(gain.adl_refs, ['ADL-016']);
assert.equal(gain.fx_adjustment_line_count, 2);
assert.equal(gain.fx_adjustment_lines[0].chart_of_account_ref, 'acct_fx_gain');
assert.equal(gain.fx_adjustment_lines[0].side, 'CREDIT');
assert.equal(gain.fx_adjustment_lines[1].chart_of_account_ref, 'acct_settlement_clearing');
assert.equal(gain.fx_adjustment_lines[1].side, 'DEBIT');
assert.equal(gain.journal_balanced, true);
assert.equal(gain.fx_adjustment_journal_prepared, true);
assert.equal(gain.journal_posting_delegated_to_journal_entry_engine, true);
assert.equal(gain.journal_posting_performed, false);
assert.equal(gain.payment_allocation_performed, false);
assert.equal(gain.provider_callback_processed, false);
assert.equal(gain.tax_report_generated, false);
assert.equal(gain.irreversible_action_allowed, false);
assert.equal(gain.fx_gain_loss_evidence_ref, 'fx_gain_loss:fx_event_receivable_gain_001:gain');
assert.equal(gain.fx_gain_loss_digest.length, 64);

const payableGain = accountForFxGainLoss({
  ...baseInput,
  fx_event_ref: 'fx_event_payable_gain_001',
  source_event_name: 'expense.created',
  invoice_record_authority_ref: undefined,
  expense_record_authority_ref: 'expense_record_authority_001',
  position_type: 'PAYABLE',
  original_base_amount_minor: 100000,
  settlement_base_amount_minor: 95000,
});
assert.equal(payableGain.fx_gain_loss_classification, 'GAIN');
assert.equal(payableGain.signed_base_delta_minor, -5000);
assert.equal(payableGain.fx_adjustment_lines[0].side, 'CREDIT');

const loss = accountForFxGainLoss({
  ...baseInput,
  fx_event_ref: 'fx_event_receivable_loss_001',
  settlement_base_amount_minor: 98000,
});
assert.equal(loss.fx_gain_loss_classification, 'LOSS');
assert.equal(loss.fx_adjustment_lines[0].chart_of_account_ref, 'acct_fx_loss');
assert.equal(loss.fx_adjustment_lines[0].side, 'DEBIT');

const neutral = accountForFxGainLoss({
  ...baseInput,
  fx_event_ref: 'fx_event_neutral_001',
  settlement_base_amount_minor: 100000,
});
assert.equal(neutral.fx_gain_loss_classification, 'NEUTRAL');
assert.equal(neutral.fx_gain_loss_amount_minor, 0);
assert.equal(neutral.fx_adjustment_line_count, 0);

assert.throws(() => accountForFxGainLoss({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, source_seed_id: 'seed_other' as never }), /source_seed_id must match/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, fx_event_ref: '' }), /fx_event_ref is required/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, source_event_name: 'po.approved' as never }), /source_event_name is not supported/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, source_document_ref: '' }), /source_document_ref is required/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, invoice_record_authority_ref: undefined }), /invoice_record_authority_ref is required/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, source_event_name: 'expense.created', invoice_record_authority_ref: undefined }), /expense_record_authority_ref is required/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, payment_allocation_balance_ref: '' }), /payment_allocation_balance_ref is required/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, journal_entry_engine_ref: '' }), /journal_entry_engine_ref is required/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, chart_version_ref: '' }), /chart_version_ref is required/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, accounting_period_ref: '' }), /accounting_period_ref is required/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, position_type: 'OTHER' as never }), /position_type is not supported/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, base_currency_code: 'US' }), /base_currency_code must be a three-letter/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, transaction_currency_code: 'EU' }), /transaction_currency_code must be a three-letter/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, transaction_currency_code: 'USD' }), /must differ for ADL-016/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, original_base_amount_minor: -1 }), /original_base_amount_minor must be a non-negative integer/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, settlement_base_amount_minor: -1 }), /settlement_base_amount_minor must be a non-negative integer/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, exchange_rate_basis_ref: '' }), /exchange_rate_basis_ref is required/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, fx_gain_account_ref: '' }), /fx_gain_account_ref is required/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, fx_loss_account_ref: '' }), /fx_loss_account_ref is required/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, settlement_clearing_account_ref: '' }), /settlement_clearing_account_ref is required/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, accounted_by_user_id: '' }), /accounted_by_user_id is required/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, accounted_at: 'not-a-date' }), /accounted_at must be a valid ISO-compatible timestamp/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, journal_posting_requested: true }), /must prepare adjustment lines, not post journals directly/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, provider_callback_processing_requested: true }), /must not process provider callbacks/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, tax_report_generation_requested: true }), /must not generate tax reports/);
assert.throws(() => accountForFxGainLoss({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-088 FX gain/loss accounting service test passed.');
