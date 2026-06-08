import assert from 'node:assert/strict';
import {
  recordManualReconciliationPathReview,
  type ManualReconciliationReviewInput,
} from './manual_reconciliation_path.lifecycle';

const baseInput: ManualReconciliationReviewInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_payment_collection_topup',
  reviewer_user_id: 'user_reconciliation_reviewer_001',
  reviewed_at: '2026-06-08T12:00:00.000Z',
  candidate: {
    reconciliation_candidate_ref: 'reconciliation_candidate_001',
    candidate_type: 'BANK_STATEMENT_IMPORT',
    candidate_source_ref: 'bank_statement_import_001',
    invoice_record_ref: 'invoice_001',
    pricing_table_effective_date_ref: 'pricing_effective_2026_06',
    payment_evidence_ref: 'payment_evidence_001',
    provider_transaction_evidence_ref: 'provider_transaction_evidence_001',
    amount_minor: 150000,
    currency_code: 'pkr',
    observed_at: '2026-06-08T10:00:00.000Z',
    candidate_reason: 'statement line amount matches invoice payment evidence',
    confidence_score: 82,
  },
  decision: 'MATCHED_PENDING_ALLOCATION',
  decision_reason: 'reviewer confirmed the candidate matches the invoice evidence',
};

const receipt = recordManualReconciliationPathReview(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_10_manual_reconciliation_path');
assert.equal(receipt.component_id, '6B.10');
assert.equal(receipt.event_name, 'phase_6b.payment_collection_topup.manual_reconciliation.review_recorded');
assert.equal(receipt.status, 'MATCHED_PENDING_ALLOCATION');
assert.equal(receipt.decision, 'MATCHED_PENDING_ALLOCATION');
assert.equal(receipt.currency_code, 'PKR');
assert.equal(receipt.amount_minor, 150000);
assert.equal(receipt.provider_transaction_evidence_ref, 'provider_transaction_evidence_001');
assert.equal(receipt.provider_neutral, true);
assert.equal(receipt.api_key_scope_consumed, false);
assert.equal(receipt.provider_callback_processed, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.auto_reconciliation_performed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const openReview = recordManualReconciliationPathReview({
  ...baseInput,
  candidate: { ...baseInput.candidate, reconciliation_candidate_ref: 'reconciliation_candidate_002', provider_transaction_evidence_ref: undefined },
  decision: 'OPEN_REVIEW',
  decision_reason: 'candidate requires a second reviewer',
});
assert.equal(openReview.status, 'OPEN_MANUAL_REVIEW');
assert.equal(openReview.provider_transaction_evidence_ref, undefined);

const unmatched = recordManualReconciliationPathReview({
  ...baseInput,
  candidate: { ...baseInput.candidate, reconciliation_candidate_ref: 'reconciliation_candidate_003', candidate_type: 'CASH_COUNTER' },
  decision: 'UNMATCHED',
  decision_reason: 'reviewer rejected the candidate',
});
assert.equal(unmatched.status, 'UNMATCHED');
assert.equal(unmatched.candidate_type, 'CASH_COUNTER');

assert.throws(() => recordManualReconciliationPathReview({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => recordManualReconciliationPathReview({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => recordManualReconciliationPathReview({ ...baseInput, reviewer_user_id: '' }), /reviewer_user_id is required/);
assert.throws(() => recordManualReconciliationPathReview({ ...baseInput, reviewed_at: 'not-a-date' }), /reviewed_at must be a valid ISO-compatible timestamp/);
assert.throws(() => recordManualReconciliationPathReview({ ...baseInput, candidate: undefined as never }), /candidate is required/);
assert.throws(() => recordManualReconciliationPathReview({ ...baseInput, candidate: { ...baseInput.candidate, reconciliation_candidate_ref: '' } }), /candidate.reconciliation_candidate_ref is required/);
assert.throws(() => recordManualReconciliationPathReview({ ...baseInput, candidate: { ...baseInput.candidate, candidate_type: 'AUTO_MATCH' as never } }), /candidate_type is not supported/);
assert.throws(() => recordManualReconciliationPathReview({ ...baseInput, candidate: { ...baseInput.candidate, candidate_source_ref: '' } }), /candidate.candidate_source_ref is required/);
assert.throws(() => recordManualReconciliationPathReview({ ...baseInput, candidate: { ...baseInput.candidate, invoice_record_ref: '' } }), /candidate.invoice_record_ref is required/);
assert.throws(() => recordManualReconciliationPathReview({ ...baseInput, candidate: { ...baseInput.candidate, pricing_table_effective_date_ref: '' } }), /candidate.pricing_table_effective_date_ref is required/);
assert.throws(() => recordManualReconciliationPathReview({ ...baseInput, candidate: { ...baseInput.candidate, payment_evidence_ref: '' } }), /candidate.payment_evidence_ref is required/);
assert.throws(() => recordManualReconciliationPathReview({ ...baseInput, candidate: { ...baseInput.candidate, amount_minor: 0 } }), /amount_minor must be a positive integer/);
assert.throws(() => recordManualReconciliationPathReview({ ...baseInput, candidate: { ...baseInput.candidate, currency_code: 'PK' } }), /currency_code must be a three-letter/);
assert.throws(() => recordManualReconciliationPathReview({ ...baseInput, candidate: { ...baseInput.candidate, observed_at: 'not-a-date' } }), /candidate.observed_at must be a valid ISO-compatible timestamp/);
assert.throws(() => recordManualReconciliationPathReview({ ...baseInput, candidate: { ...baseInput.candidate, observed_at: '2026-06-09T00:00:00.000Z' } }), /reviewed_at must not be earlier/);
assert.throws(() => recordManualReconciliationPathReview({ ...baseInput, candidate: { ...baseInput.candidate, confidence_score: 101 } }), /confidence_score must be an integer between 0 and 100/);
assert.throws(() => recordManualReconciliationPathReview({ ...baseInput, decision: 'AUTO_MATCHED' as never }), /decision is not supported/);
assert.throws(() => recordManualReconciliationPathReview({ ...baseInput, decision_reason: '' }), /decision_reason is required/);
assert.throws(() => recordManualReconciliationPathReview({ ...baseInput, api_key_scope_registry_ref: 'api_key_scope_provider_001' }), /must not consume API-key scope/);
assert.throws(() => recordManualReconciliationPathReview({ ...baseInput, provider_callback_processing_requested: true }), /must not process provider callbacks/);
assert.throws(() => recordManualReconciliationPathReview({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => recordManualReconciliationPathReview({ ...baseInput, auto_reconciliation_requested: true }), /must not perform automatic reconciliation/);
assert.throws(() => recordManualReconciliationPathReview({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-075 manual reconciliation path lifecycle test passed.');
