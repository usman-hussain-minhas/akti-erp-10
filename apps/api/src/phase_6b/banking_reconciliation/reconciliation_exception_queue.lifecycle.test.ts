import assert from 'node:assert/strict';
import { queueReconciliationExceptions, type ReconciliationExceptionQueueInput } from './reconciliation_exception_queue.lifecycle';

const baseInput: ReconciliationExceptionQueueInput = {
  organization_id: 'org_demo',
  source_seed_id: 'seed_6b_13_reconciliation_exception_queue',
  queue_ref: 'recon_exception_queue_001',
  payment_allocation_balance_ref: 'payment_allocation_balance_001',
  chart_version_ref: 'coa_2026_v1',
  assigned_team_ref: 'banking_ops_team',
  queued_by_user_id: 'user_bank_controller_001',
  queued_at: '2026-06-08T00:00:00.000Z',
  exceptions: [
    {
      exception_ref: 'exception_no_match_001',
      bank_transaction_ref: 'bank_tx_001',
      payment_allocation_balance_ref: 'payment_allocation_balance_001',
      chart_account_ref: 'acct_receivable',
      reason: 'NO_MATCH',
      amount_delta_minor: 0,
      date_delta_days: 0,
      currency_code: 'usd',
      evidence_ref: 'reconciliation_matching:match_run_001:bank_tx_001:no_match',
    },
    {
      exception_ref: 'exception_currency_001',
      bank_transaction_ref: 'bank_tx_002',
      payment_allocation_balance_ref: 'payment_allocation_balance_001',
      chart_account_ref: 'acct_receivable',
      candidate_ref: 'match_run_001:bank_tx_002:PAY-002',
      reason: 'CURRENCY_MISMATCH',
      amount_delta_minor: 250000,
      date_delta_days: 5,
      currency_code: 'USD',
      evidence_ref: 'reconciliation_matching:match_run_001:bank_tx_002:currency_mismatch',
    },
  ],
};

const receipt = queueReconciliationExceptions(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_13_reconciliation_exception_queue');
assert.equal(receipt.component_id, '6B.13');
assert.equal(receipt.event_name, 'phase_6b.banking_reconciliation.exception_queue.updated');
assert.equal(receipt.source_seed_id, 'seed_6b_13_reconciliation_exception_queue');
assert.equal(receipt.phase_6b_reconciliation_candidate_model, 'Phase6BReconciliationCandidate');
assert.equal(receipt.queue_item_count, 2);
assert.equal(receipt.high_or_critical_count, 1);
assert.equal(receipt.items[0].severity, 'LOW');
assert.equal(receipt.items[0].status, 'OPEN');
assert.equal(receipt.items[0].queue_item_ref, 'recon_exception_queue_001:exception_no_match_001');
assert.equal(receipt.items[1].severity, 'CRITICAL');
assert.equal(receipt.items[1].status, 'ESCALATED');
assert.equal(receipt.manual_reconciliation_performed, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.journal_posting_performed, false);
assert.equal(receipt.statement_closed, false);
assert.equal(receipt.provider_callback_processed, false);
assert.equal(receipt.irreversible_action_allowed, false);
assert.equal(receipt.queue_digest.length, 64);

assert.throws(() => queueReconciliationExceptions({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, source_seed_id: 'seed_other' as never }), /source_seed_id must match/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, queue_ref: '' }), /queue_ref is required/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, payment_allocation_balance_ref: '' }), /payment_allocation_balance_ref is required/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, chart_version_ref: '' }), /chart_version_ref is required/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, assigned_team_ref: '' }), /assigned_team_ref is required/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, queued_by_user_id: '' }), /queued_by_user_id is required/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, queued_at: 'not-a-date' }), /queued_at must be a valid ISO-compatible timestamp/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, exceptions: [] }), /exceptions must include at least one item/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, exceptions: [{ ...baseInput.exceptions[0], exception_ref: '' }] }), /exceptions.exception_ref is required/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, exceptions: [{ ...baseInput.exceptions[0], bank_transaction_ref: '' }] }), /exceptions.bank_transaction_ref is required/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, exceptions: [{ ...baseInput.exceptions[0], payment_allocation_balance_ref: '' }] }), /exceptions.payment_allocation_balance_ref is required/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, exceptions: [{ ...baseInput.exceptions[0], payment_allocation_balance_ref: 'other_balance' }] }), /exceptions.payment_allocation_balance_ref must match/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, exceptions: [{ ...baseInput.exceptions[0], chart_account_ref: '' }] }), /exceptions.chart_account_ref is required/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, exceptions: [{ ...baseInput.exceptions[0], candidate_ref: '' }] }), /exceptions.candidate_ref is required/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, exceptions: [{ ...baseInput.exceptions[0], reason: 'UNKNOWN' as never }] }), /reason is not supported/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, exceptions: [{ ...baseInput.exceptions[0], amount_delta_minor: -1 }] }), /exceptions.amount_delta_minor must be a non-negative integer/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, exceptions: [{ ...baseInput.exceptions[0], date_delta_days: -1 }] }), /exceptions.date_delta_days must be a non-negative integer/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, exceptions: [{ ...baseInput.exceptions[0], currency_code: 'US' }] }), /exceptions.currency_code must be a three-letter/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, exceptions: [{ ...baseInput.exceptions[0], evidence_ref: '' }] }), /exceptions.evidence_ref is required/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, exceptions: [baseInput.exceptions[0], baseInput.exceptions[0]] }), /exceptions must not repeat exception_ref/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, manual_reconciliation_requested: true }), /must not perform manual reconciliation resolution/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, journal_posting_requested: true }), /must not post journals/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, statement_closure_requested: true }), /must not close reconciliation statements/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, provider_callback_processing_requested: true }), /must not process provider callbacks/);
assert.throws(() => queueReconciliationExceptions({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-092 reconciliation exception queue lifecycle test passed.');
