import assert from 'node:assert/strict';
import { exportBankingEvidence, type BankingEvidenceExportInput } from './banking_evidence_export.evidence';

const baseInput: BankingEvidenceExportInput = {
  organization_id: 'org_demo',
  source_seed_id: 'seed_6b_13_banking_evidence_export',
  export_ref: 'banking_evidence_export_001',
  bank_account_ref: 'bank_account_operating_001',
  payment_allocation_balance_ref: 'payment_allocation_balance_001',
  chart_version_ref: 'coa_2026_v1',
  reconciliation_statement_ref: 'recon_statement_001',
  requested_by_user_id: 'user_bank_controller_001',
  requested_at: '2026-06-08T00:00:00.000Z',
  artifacts: [
    {
      artifact_ref: 'artifact_bank_account_001',
      artifact_type: 'BANK_ACCOUNT',
      source_model: 'Phase6BBankAccount',
      source_record_ref: 'bank_account_operating_001',
      evidence_ref: 'bank_account:bank_account_operating_001:evidence',
      captured_at: '2026-06-01T00:00:00.000Z',
    },
    {
      artifact_ref: 'artifact_bank_tx_001',
      artifact_type: 'BANK_TRANSACTION',
      source_model: 'Phase6BBankTransaction',
      source_record_ref: 'bank_tx_001',
      evidence_ref: 'bank_statement_import:bank_statement_import_001:row_001:external_pay_001',
      captured_at: '2026-06-04T00:00:00.000Z',
      amount_minor: 125000,
      currency_code: 'usd',
    },
    {
      artifact_ref: 'artifact_candidate_001',
      artifact_type: 'MATCH_CANDIDATE',
      source_model: 'Phase6BReconciliationCandidate',
      source_record_ref: 'match_run_001:bank_tx_001:PAY-001',
      evidence_ref: 'reconciliation_matching:match_run_001:bank_tx_001:PAY-001:candidate',
      captured_at: '2026-06-08T00:00:00.000Z',
    },
  ],
};

const receipt = exportBankingEvidence(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_13_banking_evidence_export');
assert.equal(receipt.component_id, '6B.13');
assert.equal(receipt.event_name, 'phase_6b.banking_reconciliation.evidence_export.generated');
assert.equal(receipt.source_seed_id, 'seed_6b_13_banking_evidence_export');
assert.equal(receipt.artifact_count, 3);
assert.equal(receipt.artifact_type_counts.BANK_ACCOUNT, 1);
assert.equal(receipt.artifact_type_counts.BANK_TRANSACTION, 1);
assert.equal(receipt.artifact_type_counts.MATCH_CANDIDATE, 1);
assert.equal(receipt.artifact_type_counts.RECONCILIATION_STATEMENT, 0);
assert.equal(receipt.artifacts[1].currency_code, 'USD');
assert.equal(receipt.export_evidence_ref, 'banking_evidence_export:banking_evidence_export_001:generated');
assert.equal(receipt.external_delivery_performed, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.journal_posting_performed, false);
assert.equal(receipt.statement_closed, false);
assert.equal(receipt.provider_callback_processed, false);
assert.equal(receipt.irreversible_action_allowed, false);
assert.equal(receipt.export_digest.length, 64);

assert.throws(() => exportBankingEvidence({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => exportBankingEvidence({ ...baseInput, source_seed_id: 'seed_other' as never }), /source_seed_id must match/);
assert.throws(() => exportBankingEvidence({ ...baseInput, export_ref: '' }), /export_ref is required/);
assert.throws(() => exportBankingEvidence({ ...baseInput, bank_account_ref: '' }), /bank_account_ref is required/);
assert.throws(() => exportBankingEvidence({ ...baseInput, payment_allocation_balance_ref: '' }), /payment_allocation_balance_ref is required/);
assert.throws(() => exportBankingEvidence({ ...baseInput, chart_version_ref: '' }), /chart_version_ref is required/);
assert.throws(() => exportBankingEvidence({ ...baseInput, reconciliation_statement_ref: '' }), /reconciliation_statement_ref is required/);
assert.throws(() => exportBankingEvidence({ ...baseInput, requested_by_user_id: '' }), /requested_by_user_id is required/);
assert.throws(() => exportBankingEvidence({ ...baseInput, requested_at: 'not-a-date' }), /requested_at must be a valid ISO-compatible timestamp/);
assert.throws(() => exportBankingEvidence({ ...baseInput, artifacts: [] }), /artifacts must include at least one evidence artifact/);
assert.throws(() => exportBankingEvidence({ ...baseInput, artifacts: [{ ...baseInput.artifacts[0], artifact_ref: '' }] }), /artifacts.artifact_ref is required/);
assert.throws(() => exportBankingEvidence({ ...baseInput, artifacts: [{ ...baseInput.artifacts[0], artifact_type: 'OTHER' as never }] }), /artifacts.artifact_type is not supported/);
assert.throws(() => exportBankingEvidence({ ...baseInput, artifacts: [{ ...baseInput.artifacts[0], source_model: 'OtherModel' as never }] }), /artifacts.source_model is not supported/);
assert.throws(() => exportBankingEvidence({ ...baseInput, artifacts: [{ ...baseInput.artifacts[0], source_record_ref: '' }] }), /artifacts.source_record_ref is required/);
assert.throws(() => exportBankingEvidence({ ...baseInput, artifacts: [{ ...baseInput.artifacts[0], evidence_ref: '' }] }), /artifacts.evidence_ref is required/);
assert.throws(() => exportBankingEvidence({ ...baseInput, artifacts: [{ ...baseInput.artifacts[0], captured_at: 'not-a-date' }] }), /artifacts.captured_at must be a valid ISO-compatible timestamp/);
assert.throws(() => exportBankingEvidence({ ...baseInput, artifacts: [{ ...baseInput.artifacts[1], amount_minor: -1 }] }), /artifacts.amount_minor must be a non-negative integer/);
assert.throws(() => exportBankingEvidence({ ...baseInput, artifacts: [{ ...baseInput.artifacts[1], currency_code: 'US' }] }), /artifacts.currency_code must be a three-letter/);
assert.throws(() => exportBankingEvidence({ ...baseInput, artifacts: [baseInput.artifacts[0], baseInput.artifacts[0]] }), /artifacts must not repeat artifact_ref/);
assert.throws(() => exportBankingEvidence({ ...baseInput, external_delivery_requested: true }), /must not perform external delivery/);
assert.throws(() => exportBankingEvidence({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => exportBankingEvidence({ ...baseInput, journal_posting_requested: true }), /must not post journals/);
assert.throws(() => exportBankingEvidence({ ...baseInput, statement_closure_requested: true }), /must not close reconciliation statements/);
assert.throws(() => exportBankingEvidence({ ...baseInput, provider_callback_processing_requested: true }), /must not process provider callbacks/);
assert.throws(() => exportBankingEvidence({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-093 banking evidence export evidence test passed.');
