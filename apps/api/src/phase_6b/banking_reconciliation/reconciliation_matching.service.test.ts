import assert from 'node:assert/strict';
import { generateReconciliationMatches, type ReconciliationMatchingInput } from './reconciliation_matching.service';

const baseInput: ReconciliationMatchingInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_banking_reconciliation',
  source_seed_id: 'seed_6b_13_reconciliation_matching',
  match_run_ref: 'match_run_001',
  bank_account_ref: 'bank_account_operating_001',
  payment_allocation_balance_ref: 'payment_allocation_balance_001',
  chart_version_ref: 'coa_2026_v1',
  bank_transactions: [
    {
      bank_transaction_ref: 'bank_tx_001',
      external_transaction_ref: 'external_pay_001',
      bank_statement_import_ref: 'bank_statement_import_001',
      transaction_date: '2026-06-04T00:00:00.000Z',
      description: 'Receipt for PAY-001 from customer',
      direction: 'INFLOW',
      amount_minor: 125000,
      currency_code: 'usd',
      bank_transaction_evidence_ref: 'bank_statement_import:bank_statement_import_001:row_001:external_pay_001',
    },
    {
      bank_transaction_ref: 'bank_tx_002',
      external_transaction_ref: 'external_pay_002',
      bank_statement_import_ref: 'bank_statement_import_001',
      transaction_date: '2026-06-05T00:00:00.000Z',
      description: 'Receipt near INV-002',
      direction: 'INFLOW',
      amount_minor: 50100,
      currency_code: 'USD',
      bank_transaction_evidence_ref: 'bank_statement_import:bank_statement_import_001:row_002:external_pay_002',
    },
  ],
  allocation_targets: [
    {
      allocation_balance_ref: 'payment_allocation_balance_001',
      payment_ref: 'PAY-001',
      invoice_ref: 'INV-001',
      receivable_ref: 'REC-001',
      expected_direction: 'INFLOW',
      expected_amount_minor: 125000,
      currency_code: 'USD',
      expected_settlement_at: '2026-06-04T00:00:00.000Z',
      chart_account_ref: 'acct_receivable',
      allocation_evidence_ref: 'payment_allocation_balance:PAY-001:expected',
    },
    {
      allocation_balance_ref: 'payment_allocation_balance_001',
      payment_ref: 'PAY-002',
      invoice_ref: 'INV-002',
      receivable_ref: 'REC-002',
      expected_direction: 'INFLOW',
      expected_amount_minor: 50000,
      currency_code: 'USD',
      expected_settlement_at: '2026-06-07T00:00:00.000Z',
      chart_account_ref: 'acct_receivable',
      allocation_evidence_ref: 'payment_allocation_balance:PAY-002:expected',
    },
  ],
  generated_by_user_id: 'user_bank_controller_001',
  generated_at: '2026-06-08T00:00:00.000Z',
};

const receipt = generateReconciliationMatches(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_13_reconciliation_matching');
assert.equal(receipt.component_id, '6B.13');
assert.equal(receipt.event_name, 'phase_6b.banking_reconciliation.match_candidates.generated');
assert.equal(receipt.phase_6b_reconciliation_candidate_model, 'Phase6BReconciliationCandidate');
assert.equal(receipt.phase_6b_bank_transaction_model, 'Phase6BBankTransaction');
assert.equal(receipt.source_seed_id, 'seed_6b_13_reconciliation_matching');
assert.equal(receipt.candidate_count, 4);
assert.equal(receipt.auto_match_candidate_count, 1);
assert.equal(receipt.review_required_count, 1);
assert.equal(receipt.rejected_count, 2);
assert.equal(receipt.candidates[0].candidate_ref, 'match_run_001:bank_tx_001:PAY-001');
assert.equal(receipt.candidates[0].status, 'AUTO_MATCH_CANDIDATE');
assert.equal(receipt.candidates[0].score, 100);
assert.deepEqual(receipt.candidates[0].score_reasons, ['exact_amount_match', 'same_day_settlement', 'payment_reference_seen']);
assert.equal(receipt.candidates[1].status, 'REVIEW_REQUIRED');
assert.equal(receipt.candidates[1].amount_delta_minor, 100);
assert.equal(receipt.candidates[1].date_delta_days, 2);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.journal_posting_performed, false);
assert.equal(receipt.statement_closed, false);
assert.equal(receipt.manual_reconciliation_performed, false);
assert.equal(receipt.provider_callback_processed, false);
assert.equal(receipt.irreversible_action_allowed, false);
assert.equal(receipt.reconciliation_matching_evidence_ref, 'reconciliation_matching:match_run_001:generated');
assert.equal(receipt.reconciliation_matching_digest.length, 64);

assert.throws(() => generateReconciliationMatches({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, source_seed_id: 'seed_other' as never }), /source_seed_id must match/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, match_run_ref: '' }), /match_run_ref is required/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, bank_account_ref: '' }), /bank_account_ref is required/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, payment_allocation_balance_ref: '' }), /payment_allocation_balance_ref is required/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, chart_version_ref: '' }), /chart_version_ref is required/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, auto_match_threshold: 101 }), /auto_match_threshold must be an integer/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, review_threshold: 91, auto_match_threshold: 90 }), /review_threshold must not exceed/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, bank_transactions: [] }), /bank_transactions must include at least one transaction/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, bank_transactions: [{ ...baseInput.bank_transactions[0], bank_transaction_ref: '' }] }), /bank_transactions.bank_transaction_ref is required/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, bank_transactions: [{ ...baseInput.bank_transactions[0], external_transaction_ref: '' }] }), /bank_transactions.external_transaction_ref is required/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, bank_transactions: [{ ...baseInput.bank_transactions[0], bank_statement_import_ref: '' }] }), /bank_transactions.bank_statement_import_ref is required/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, bank_transactions: [{ ...baseInput.bank_transactions[0], transaction_date: 'not-a-date' }] }), /bank_transactions.transaction_date must be a valid ISO-compatible timestamp/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, bank_transactions: [{ ...baseInput.bank_transactions[0], description: '' }] }), /bank_transactions.description is required/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, bank_transactions: [{ ...baseInput.bank_transactions[0], direction: 'SIDEWAYS' as never }] }), /bank_transactions.direction is not supported/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, bank_transactions: [{ ...baseInput.bank_transactions[0], amount_minor: 0 }] }), /bank_transactions.amount_minor must be a positive integer/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, bank_transactions: [{ ...baseInput.bank_transactions[0], currency_code: 'US' }] }), /bank_transactions.currency_code must be a three-letter/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, bank_transactions: [{ ...baseInput.bank_transactions[0], bank_transaction_evidence_ref: '' }] }), /bank_transactions.bank_transaction_evidence_ref is required/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, bank_transactions: [baseInput.bank_transactions[0], baseInput.bank_transactions[0]] }), /bank_transactions must not repeat bank_transaction_ref/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, allocation_targets: [] }), /allocation_targets must include at least one target/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, allocation_targets: [{ ...baseInput.allocation_targets[0], allocation_balance_ref: '' }] }), /allocation_targets.allocation_balance_ref is required/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, allocation_targets: [{ ...baseInput.allocation_targets[0], allocation_balance_ref: 'other_balance' }] }), /allocation_targets.allocation_balance_ref must match/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, allocation_targets: [{ ...baseInput.allocation_targets[0], payment_ref: '' }] }), /allocation_targets.payment_ref is required/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, allocation_targets: [{ ...baseInput.allocation_targets[0], expected_direction: 'SIDEWAYS' as never }] }), /allocation_targets.expected_direction is not supported/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, allocation_targets: [{ ...baseInput.allocation_targets[0], expected_amount_minor: -1 }] }), /allocation_targets.expected_amount_minor must be a positive integer/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, allocation_targets: [{ ...baseInput.allocation_targets[0], currency_code: 'US' }] }), /allocation_targets.currency_code must be a three-letter/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, allocation_targets: [{ ...baseInput.allocation_targets[0], expected_settlement_at: 'not-a-date' }] }), /allocation_targets.expected_settlement_at must be a valid ISO-compatible timestamp/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, allocation_targets: [{ ...baseInput.allocation_targets[0], chart_account_ref: '' }] }), /allocation_targets.chart_account_ref is required/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, allocation_targets: [{ ...baseInput.allocation_targets[0], allocation_evidence_ref: '' }] }), /allocation_targets.allocation_evidence_ref is required/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, allocation_targets: [baseInput.allocation_targets[0], baseInput.allocation_targets[0]] }), /allocation_targets must not repeat payment_ref/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, generated_by_user_id: '' }), /generated_by_user_id is required/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, generated_at: 'not-a-date' }), /generated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, journal_posting_requested: true }), /must not post journals/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, statement_closure_requested: true }), /must not close reconciliation statements/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, manual_reconciliation_requested: true }), /must not perform manual reconciliation resolution/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, provider_callback_processing_requested: true }), /must not process provider callbacks/);
assert.throws(() => generateReconciliationMatches({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-091 reconciliation matching service test passed.');
