import assert from 'node:assert/strict';
import { importBankStatement, type BankStatementImportInput } from './bank_statement_import.adapter';

const baseInput: BankStatementImportInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_banking_reconciliation',
  source_seed_id: 'seed_6b_13_bank_statement_import',
  statement_import_ref: 'bank_statement_import_001',
  bank_account_ref: 'bank_account_operating_001',
  payment_allocation_balance_ref: 'payment_allocation_balance_001',
  chart_version_ref: 'coa_2026_v1',
  statement_source_label: 'June operating account statement',
  import_format: 'CSV',
  statement_period_start_at: '2026-06-01T00:00:00.000Z',
  statement_period_end_at: '2026-06-30T23:59:59.000Z',
  statement_rows: [
    {
      row_ref: 'row_001',
      external_transaction_ref: 'bank_tx_ext_001',
      transaction_date: '2026-06-03T00:00:00.000Z',
      value_date: '2026-06-03T00:00:00.000Z',
      description: 'Customer payment received',
      credit_amount_minor: 125000,
      balance_after_minor: 1125000,
      currency_code: 'usd',
    },
    {
      row_ref: 'row_002',
      external_transaction_ref: 'bank_tx_ext_002',
      transaction_date: '2026-06-04T00:00:00.000Z',
      description: 'Vendor disbursement',
      debit_amount_minor: 45000,
      balance_after_minor: 1080000,
      currency_code: 'USD',
    },
  ],
  imported_by_user_id: 'user_bank_controller_001',
  imported_at: '2026-06-08T00:00:00.000Z',
};

const receipt = importBankStatement(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_13_bank_statement_import');
assert.equal(receipt.component_id, '6B.13');
assert.equal(receipt.event_name, 'phase_6b.banking_reconciliation.bank_tx.imported');
assert.equal(receipt.phase_6b_bank_account_model, 'Phase6BBankAccount');
assert.equal(receipt.phase_6b_bank_transaction_model, 'Phase6BBankTransaction');
assert.equal(receipt.source_seed_id, 'seed_6b_13_bank_statement_import');
assert.equal(receipt.import_format, 'CSV');
assert.equal(receipt.imported_transaction_count, 2);
assert.equal(receipt.total_inflow_minor, 125000);
assert.equal(receipt.total_outflow_minor, 45000);
assert.equal(receipt.normalized_transactions[0].direction, 'INFLOW');
assert.equal(receipt.normalized_transactions[0].currency_code, 'USD');
assert.equal(receipt.normalized_transactions[1].direction, 'OUTFLOW');
assert.equal(receipt.provider_fetch_performed, false);
assert.equal(receipt.credential_handling_performed, false);
assert.equal(receipt.reconciliation_performed, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.provider_callback_processed, false);
assert.equal(receipt.irreversible_action_allowed, false);
assert.equal(receipt.statement_import_evidence_ref, 'bank_statement_import:bank_statement_import_001:imported');
assert.equal(receipt.statement_import_digest.length, 64);

assert.throws(() => importBankStatement({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => importBankStatement({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => importBankStatement({ ...baseInput, source_seed_id: 'seed_other' as never }), /source_seed_id must match/);
assert.throws(() => importBankStatement({ ...baseInput, statement_import_ref: '' }), /statement_import_ref is required/);
assert.throws(() => importBankStatement({ ...baseInput, bank_account_ref: '' }), /bank_account_ref is required/);
assert.throws(() => importBankStatement({ ...baseInput, payment_allocation_balance_ref: '' }), /payment_allocation_balance_ref is required/);
assert.throws(() => importBankStatement({ ...baseInput, chart_version_ref: '' }), /chart_version_ref is required/);
assert.throws(() => importBankStatement({ ...baseInput, statement_source_label: '' }), /statement_source_label is required/);
assert.throws(() => importBankStatement({ ...baseInput, import_format: 'API' as never }), /import_format is not supported/);
assert.throws(() => importBankStatement({ ...baseInput, statement_period_start_at: 'not-a-date' }), /statement_period_start_at must be a valid ISO-compatible timestamp/);
assert.throws(() => importBankStatement({ ...baseInput, statement_period_end_at: 'not-a-date' }), /statement_period_end_at must be a valid ISO-compatible timestamp/);
assert.throws(() => importBankStatement({ ...baseInput, statement_period_end_at: '2026-05-31T00:00:00.000Z' }), /statement_period_end_at must not be earlier/);
assert.throws(() => importBankStatement({ ...baseInput, statement_rows: [] }), /statement_rows must include at least one row/);
assert.throws(() => importBankStatement({ ...baseInput, statement_rows: [{ ...baseInput.statement_rows[0], row_ref: '' }] }), /statement_rows.row_ref is required/);
assert.throws(() => importBankStatement({ ...baseInput, statement_rows: [{ ...baseInput.statement_rows[0], external_transaction_ref: '' }] }), /statement_rows.external_transaction_ref is required/);
assert.throws(() => importBankStatement({ ...baseInput, statement_rows: [{ ...baseInput.statement_rows[0], transaction_date: 'not-a-date' }] }), /statement_rows.transaction_date must be a valid ISO-compatible timestamp/);
assert.throws(() => importBankStatement({ ...baseInput, statement_rows: [{ ...baseInput.statement_rows[0], value_date: 'not-a-date' }] }), /statement_rows.value_date must be a valid ISO-compatible timestamp/);
assert.throws(() => importBankStatement({ ...baseInput, statement_rows: [{ ...baseInput.statement_rows[0], description: '' }] }), /statement_rows.description is required/);
assert.throws(() => importBankStatement({ ...baseInput, statement_rows: [{ ...baseInput.statement_rows[0], debit_amount_minor: 1 }] }), /exactly one of debit_amount_minor or credit_amount_minor/);
assert.throws(() => importBankStatement({ ...baseInput, statement_rows: [{ ...baseInput.statement_rows[0], credit_amount_minor: undefined }] }), /exactly one of debit_amount_minor or credit_amount_minor/);
assert.throws(() => importBankStatement({ ...baseInput, statement_rows: [{ ...baseInput.statement_rows[0], credit_amount_minor: 0 }] }), /statement row amount must be greater than 0/);
assert.throws(() => importBankStatement({ ...baseInput, statement_rows: [{ ...baseInput.statement_rows[0], credit_amount_minor: -1 }] }), /credit_amount_minor must be a non-negative integer/);
assert.throws(() => importBankStatement({ ...baseInput, statement_rows: [{ ...baseInput.statement_rows[0], balance_after_minor: -1 }] }), /balance_after_minor must be a non-negative integer/);
assert.throws(() => importBankStatement({ ...baseInput, statement_rows: [{ ...baseInput.statement_rows[0], currency_code: 'US' }] }), /currency_code must be a three-letter/);
assert.throws(() => importBankStatement({ ...baseInput, statement_rows: [baseInput.statement_rows[0], baseInput.statement_rows[0]] }), /statement_rows must not repeat row_ref/);
assert.throws(() => importBankStatement({ ...baseInput, imported_by_user_id: '' }), /imported_by_user_id is required/);
assert.throws(() => importBankStatement({ ...baseInput, imported_at: 'not-a-date' }), /imported_at must be a valid ISO-compatible timestamp/);
assert.throws(() => importBankStatement({ ...baseInput, provider_fetch_requested: true }), /must not fetch from external providers/);
assert.throws(() => importBankStatement({ ...baseInput, credential_handling_requested: true }), /must not handle credentials/);
assert.throws(() => importBankStatement({ ...baseInput, reconciliation_requested: true }), /must not perform reconciliation/);
assert.throws(() => importBankStatement({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => importBankStatement({ ...baseInput, provider_callback_processing_requested: true }), /must not process provider callbacks/);
assert.throws(() => importBankStatement({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-090 bank statement import adapter test passed.');
