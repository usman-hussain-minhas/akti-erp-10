import assert from 'node:assert/strict';
import { prepareRefundToOriginalMethod, type RefundToOriginalMethodInput } from './refund_to_original_method.service';

const baseInput: RefundToOriginalMethodInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_payment_collection_topup',
  api_key_scope_registry_ref: 'api_key_scope_refund_provider_001',
  invoice_record_ref: 'invoice_001',
  pricing_table_effective_date_ref: 'pricing_effective_2026_06',
  payment_receipt_ref: 'payment_receipt_001',
  payment_evidence_ref: 'payment_evidence_001',
  original_provider_ref: 'provider_stripe_001',
  original_payment_method_ref: 'payment_method_original_001',
  refund_request_ref: 'refund_request_001',
  refund_reason: 'DUPLICATE_PAYMENT',
  currency_code: 'usd',
  original_payment_amount_minor: 50000,
  prior_refunded_minor: 10000,
  refund_amount_minor: 15000,
  requested_by_user_id: 'user_payment_operator_001',
  requested_at: '2026-06-08T12:00:00.000Z',
};

const receipt = prepareRefundToOriginalMethod(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_10_refund_to_original_method');
assert.equal(receipt.component_id, '6B.10');
assert.equal(receipt.event_name, 'phase_6b.payment_collection_topup.refund.original_method_intent_prepared');
assert.equal(receipt.status, 'READY_FOR_PROVIDER_DISPATCH');
assert.equal(receipt.currency_code, 'USD');
assert.equal(receipt.remaining_refundable_minor, 25000);
assert.equal(receipt.original_method_enforced, true);
assert.equal(receipt.provider_refund_evidence_ref, 'provider_refund_evidence:provider_stripe_001:payment_receipt_001:refund_request_001');
assert.equal(receipt.live_provider_dispatch_performed, false);
assert.equal(receipt.provider_callback_processed, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.reconciliation_performed, false);
assert.equal(receipt.top_up_performed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const fullRefund = prepareRefundToOriginalMethod({
  ...baseInput,
  refund_request_ref: 'refund_request_002',
  prior_refunded_minor: 0,
  refund_amount_minor: 50000,
  refund_reason: 'CUSTOMER_REQUEST',
});
assert.equal(fullRefund.remaining_refundable_minor, 0);
assert.equal(fullRefund.refund_reason, 'CUSTOMER_REQUEST');

assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, api_key_scope_registry_ref: '' }), /api_key_scope_registry_ref is required/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, invoice_record_ref: '' }), /invoice_record_ref is required/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, pricing_table_effective_date_ref: '' }), /pricing_table_effective_date_ref is required/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, payment_receipt_ref: '' }), /payment_receipt_ref is required/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, payment_evidence_ref: '' }), /payment_evidence_ref is required/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, original_provider_ref: '' }), /original_provider_ref is required/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, original_payment_method_ref: '' }), /original_payment_method_ref is required/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, refund_request_ref: '' }), /refund_request_ref is required/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, refund_reason: 'OTHER' as never }), /refund_reason is not supported/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, currency_code: 'US' }), /currency_code must be a three-letter/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, original_payment_amount_minor: 0 }), /original_payment_amount_minor must be a positive integer/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, prior_refunded_minor: -1 }), /prior_refunded_minor must be a non-negative integer/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, refund_amount_minor: 0 }), /refund_amount_minor must be a positive integer/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, prior_refunded_minor: 60000 }), /prior_refunded_minor must not exceed original_payment_amount_minor/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, refund_amount_minor: 45000 }), /refund_amount_minor must not exceed remaining refundable balance/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, requested_by_user_id: '' }), /requested_by_user_id is required/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, requested_at: 'not-a-date' }), /requested_at must be a valid ISO-compatible timestamp/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, alternate_refund_method_ref: 'manual_bank_transfer' }), /must not use an alternate refund method/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, live_provider_dispatch_requested: true }), /must not perform live provider dispatch/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, provider_callback_processing_requested: true }), /must not process provider callbacks/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, reconciliation_requested: true }), /must not perform reconciliation behavior/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, top_up_requested: true }), /must not execute top-ups/);
assert.throws(() => prepareRefundToOriginalMethod({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-077 refund to original method service test passed.');
