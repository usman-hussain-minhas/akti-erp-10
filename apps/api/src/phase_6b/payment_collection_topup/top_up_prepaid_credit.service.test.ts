import assert from 'node:assert/strict';
import { recordTopUpPrepaidCredit, type TopUpPrepaidCreditInput } from './top_up_prepaid_credit.service';

const baseInput: TopUpPrepaidCreditInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_payment_collection_topup',
  api_key_scope_registry_ref: 'api_key_scope_top_up_provider_001',
  invoice_record_ref: 'invoice_001',
  pricing_table_effective_date_ref: 'pricing_effective_2026_06',
  payment_receipt_ref: 'payment_receipt_001',
  payment_evidence_ref: 'payment_evidence_001',
  provider_transaction_evidence_ref: 'provider_transaction_evidence_001',
  prepaid_account_ref: 'prepaid_account_001',
  currency_code: 'pkr',
  current_prepaid_balance_minor: 25000,
  top_up_amount_minor: 75000,
  requested_by_user_id: 'user_payment_operator_001',
  credited_at: '2026-06-08T12:00:00.000Z',
};

const receipt = recordTopUpPrepaidCredit(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_10_top_up_prepaid_credit');
assert.equal(receipt.component_id, '6B.10');
assert.equal(receipt.event_name, 'phase_6b.payment_collection_topup.prepaid_credit.top_up_recorded');
assert.equal(receipt.currency_code, 'PKR');
assert.equal(receipt.previous_prepaid_balance_minor, 25000);
assert.equal(receipt.top_up_amount_minor, 75000);
assert.equal(receipt.new_prepaid_balance_minor, 100000);
assert.equal(receipt.status, 'PREPAID_CREDIT_READY_TO_RECORD');
assert.equal(receipt.prepaid_balance_source_of_truth, true);
assert.equal(receipt.top_up_credit_evidence_ref, 'top_up_credit:prepaid_account_001:payment_receipt_001:payment_evidence_001');
assert.equal(receipt.live_provider_dispatch_performed, false);
assert.equal(receipt.provider_callback_processed, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.reconciliation_performed, false);
assert.equal(receipt.refund_performed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const zeroStartingBalance = recordTopUpPrepaidCredit({
  ...baseInput,
  payment_receipt_ref: 'payment_receipt_002',
  current_prepaid_balance_minor: 0,
  top_up_amount_minor: 1,
});
assert.equal(zeroStartingBalance.previous_prepaid_balance_minor, 0);
assert.equal(zeroStartingBalance.new_prepaid_balance_minor, 1);

assert.throws(() => recordTopUpPrepaidCredit({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => recordTopUpPrepaidCredit({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => recordTopUpPrepaidCredit({ ...baseInput, api_key_scope_registry_ref: '' }), /api_key_scope_registry_ref is required/);
assert.throws(() => recordTopUpPrepaidCredit({ ...baseInput, invoice_record_ref: '' }), /invoice_record_ref is required/);
assert.throws(() => recordTopUpPrepaidCredit({ ...baseInput, pricing_table_effective_date_ref: '' }), /pricing_table_effective_date_ref is required/);
assert.throws(() => recordTopUpPrepaidCredit({ ...baseInput, payment_receipt_ref: '' }), /payment_receipt_ref is required/);
assert.throws(() => recordTopUpPrepaidCredit({ ...baseInput, payment_evidence_ref: '' }), /payment_evidence_ref is required/);
assert.throws(() => recordTopUpPrepaidCredit({ ...baseInput, provider_transaction_evidence_ref: '' }), /provider_transaction_evidence_ref is required/);
assert.throws(() => recordTopUpPrepaidCredit({ ...baseInput, prepaid_account_ref: '' }), /prepaid_account_ref is required/);
assert.throws(() => recordTopUpPrepaidCredit({ ...baseInput, currency_code: 'PK' }), /currency_code must be a three-letter/);
assert.throws(() => recordTopUpPrepaidCredit({ ...baseInput, current_prepaid_balance_minor: -1 }), /current_prepaid_balance_minor must be a non-negative integer/);
assert.throws(() => recordTopUpPrepaidCredit({ ...baseInput, top_up_amount_minor: 0 }), /top_up_amount_minor must be a positive integer/);
assert.throws(() => recordTopUpPrepaidCredit({ ...baseInput, requested_by_user_id: '' }), /requested_by_user_id is required/);
assert.throws(() => recordTopUpPrepaidCredit({ ...baseInput, credited_at: 'not-a-date' }), /credited_at must be a valid ISO-compatible timestamp/);
assert.throws(() => recordTopUpPrepaidCredit({ ...baseInput, live_provider_dispatch_requested: true }), /must not perform live provider dispatch/);
assert.throws(() => recordTopUpPrepaidCredit({ ...baseInput, provider_callback_processing_requested: true }), /must not process provider callbacks/);
assert.throws(() => recordTopUpPrepaidCredit({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => recordTopUpPrepaidCredit({ ...baseInput, reconciliation_requested: true }), /must not perform reconciliation behavior/);
assert.throws(() => recordTopUpPrepaidCredit({ ...baseInput, refund_requested: true }), /must not execute refunds/);
assert.throws(() => recordTopUpPrepaidCredit({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-078 top up prepaid credit service test passed.');
