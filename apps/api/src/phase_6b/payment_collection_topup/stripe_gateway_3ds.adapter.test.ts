import assert from 'node:assert/strict';
import { prepareStripeGateway3dsGatewayEnvelope, type StripeGateway3dsGatewayPaymentInput } from './stripe_gateway_3ds.adapter';

const baseInput: StripeGateway3dsGatewayPaymentInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_payment_collection_topup',
  api_key_scope_registry_ref: 'api_key_scope_stripe_gateway_3ds_tenant_001',
  invoice_record_ref: 'invoice_001',
  pricing_table_effective_date_ref: 'pricing_effective_2026_06',
  gateway_account_ref: 'stripe_gateway_3ds_gateway_account_001',
  payment_request_ref: 'payment_request_001',
  customer_account_ref: 'customer_001',
  payer_contact_ref: 'payer_contact_001',
  amount_minor: 125000,
  currency_code: 'pkr',
  channel: 'PAYMENT_INTENT_3DS',
  provider_environment: 'SANDBOX',
  requested_at: '2026-06-08T10:15:00.000Z',
  requested_by_user_id: 'user_payment_operator_001',
};

const receipt = prepareStripeGateway3dsGatewayEnvelope(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_10_stripe_gateway_3ds_gateway');
assert.equal(receipt.component_id, '6B.10');
assert.equal(receipt.event_name, 'phase_6b.payment_collection_topup.stripe_gateway_3ds_gateway.envelope_prepared');
assert.equal(receipt.status, 'READY_FOR_PROVIDER_DISPATCH');
assert.equal(receipt.currency_code, 'PKR');
assert.equal(receipt.amount_minor, 125000);
assert.equal(receipt.provider_envelope.provider, 'STRIPE');
assert.equal(receipt.provider_envelope.provider_environment, 'SANDBOX');
assert.equal(receipt.provider_envelope.channel, 'PAYMENT_INTENT_3DS');
assert.equal(receipt.provider_envelope.idempotency_key.length, 64);
assert.equal(receipt.provider_envelope.evidence_digest.length, 64);
assert.match(receipt.provider_transaction_evidence_ref, /^provider_transaction_evidence:STRIPE:/);
assert.match(receipt.payment_evidence_ref, /^payment_evidence:invoice_001:payment_request_001:/);
assert.equal(receipt.live_dispatch_performed, false);
assert.equal(receipt.provider_callback_processed, false);
assert.equal(receipt.credential_material_handled, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.reconciliation_performed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const repeatReceipt = prepareStripeGateway3dsGatewayEnvelope({ ...baseInput, currency_code: 'PKR' });
assert.equal(repeatReceipt.provider_envelope.idempotency_key, receipt.provider_envelope.idempotency_key);
assert.equal(repeatReceipt.provider_envelope.evidence_digest, receipt.provider_envelope.evidence_digest);

const qrReceipt = prepareStripeGateway3dsGatewayEnvelope({
  ...baseInput,
  payment_request_ref: 'payment_request_002',
  channel: 'CHECKOUT_SESSION',
  provider_environment: 'PRODUCTION_DISABLED',
});
assert.equal(qrReceipt.provider_envelope.channel, 'CHECKOUT_SESSION');
assert.equal(qrReceipt.provider_envelope.provider_environment, 'PRODUCTION_DISABLED');
assert.notEqual(qrReceipt.provider_envelope.idempotency_key, receipt.provider_envelope.idempotency_key);

assert.throws(() => prepareStripeGateway3dsGatewayEnvelope({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => prepareStripeGateway3dsGatewayEnvelope({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => prepareStripeGateway3dsGatewayEnvelope({ ...baseInput, api_key_scope_registry_ref: '' }), /api_key_scope_registry_ref is required/);
assert.throws(() => prepareStripeGateway3dsGatewayEnvelope({ ...baseInput, invoice_record_ref: '' }), /invoice_record_ref is required/);
assert.throws(() => prepareStripeGateway3dsGatewayEnvelope({ ...baseInput, pricing_table_effective_date_ref: '' }), /pricing_table_effective_date_ref is required/);
assert.throws(() => prepareStripeGateway3dsGatewayEnvelope({ ...baseInput, gateway_account_ref: '' }), /gateway_account_ref is required/);
assert.throws(() => prepareStripeGateway3dsGatewayEnvelope({ ...baseInput, payment_request_ref: '' }), /payment_request_ref is required/);
assert.throws(() => prepareStripeGateway3dsGatewayEnvelope({ ...baseInput, customer_account_ref: '' }), /customer_account_ref is required/);
assert.throws(() => prepareStripeGateway3dsGatewayEnvelope({ ...baseInput, payer_contact_ref: '' }), /payer_contact_ref is required/);
assert.throws(() => prepareStripeGateway3dsGatewayEnvelope({ ...baseInput, requested_by_user_id: '' }), /requested_by_user_id is required/);
assert.throws(() => prepareStripeGateway3dsGatewayEnvelope({ ...baseInput, requested_at: 'not-a-date' }), /requested_at must be a valid ISO-compatible timestamp/);
assert.throws(() => prepareStripeGateway3dsGatewayEnvelope({ ...baseInput, currency_code: 'PK' }), /currency_code must be a three-letter/);
assert.throws(() => prepareStripeGateway3dsGatewayEnvelope({ ...baseInput, amount_minor: 0 }), /amount_minor must be a positive integer/);
assert.throws(() => prepareStripeGateway3dsGatewayEnvelope({ ...baseInput, channel: 'CARD' as never }), /channel is not supported/);
assert.throws(() => prepareStripeGateway3dsGatewayEnvelope({ ...baseInput, provider_environment: 'LIVE' as never }), /provider_environment is not supported/);
assert.throws(() => prepareStripeGateway3dsGatewayEnvelope({ ...baseInput, live_dispatch_requested: true }), /must not perform live provider dispatch/);
assert.throws(() => prepareStripeGateway3dsGatewayEnvelope({ ...baseInput, provider_callback_processing_requested: true }), /must not process provider callbacks/);
assert.throws(() => prepareStripeGateway3dsGatewayEnvelope({ ...baseInput, credential_material_present: true }), /must not handle credential material/);
assert.throws(() => prepareStripeGateway3dsGatewayEnvelope({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => prepareStripeGateway3dsGatewayEnvelope({ ...baseInput, reconciliation_requested: true }), /must not perform reconciliation behavior/);
assert.throws(() => prepareStripeGateway3dsGatewayEnvelope({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-073 StripeGateway3ds gateway adapter test passed.');
