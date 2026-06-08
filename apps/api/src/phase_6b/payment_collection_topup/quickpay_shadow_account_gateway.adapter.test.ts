import assert from 'node:assert/strict';
import { prepareQuickpayShadowAccountGatewayEnvelope, type QuickpayShadowAccountGatewayPaymentInput } from './quickpay_shadow_account_gateway.adapter';

const baseInput: QuickpayShadowAccountGatewayPaymentInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_payment_collection_topup',
  api_key_scope_registry_ref: 'api_key_scope_quickpay_shadow_account_tenant_001',
  invoice_record_ref: 'invoice_001',
  pricing_table_effective_date_ref: 'pricing_effective_2026_06',
  gateway_account_ref: 'quickpay_shadow_account_gateway_account_001',
  payment_request_ref: 'payment_request_001',
  customer_account_ref: 'customer_001',
  payer_contact_ref: 'payer_contact_001',
  amount_minor: 125000,
  currency_code: 'pkr',
  channel: 'QUICKPAY_SHADOW_ACCOUNT_ALIAS',
  provider_environment: 'SANDBOX',
  requested_at: '2026-06-08T10:15:00.000Z',
  requested_by_user_id: 'user_payment_operator_001',
};

const receipt = prepareQuickpayShadowAccountGatewayEnvelope(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_10_quickpay_shadow_account_gateway');
assert.equal(receipt.component_id, '6B.10');
assert.equal(receipt.event_name, 'phase_6b.payment_collection_topup.quickpay_shadow_account_gateway.envelope_prepared');
assert.equal(receipt.status, 'READY_FOR_PROVIDER_DISPATCH');
assert.equal(receipt.currency_code, 'PKR');
assert.equal(receipt.amount_minor, 125000);
assert.equal(receipt.provider_envelope.provider, 'QUICKPAY_SHADOW_ACCOUNT');
assert.equal(receipt.provider_envelope.provider_environment, 'SANDBOX');
assert.equal(receipt.provider_envelope.channel, 'QUICKPAY_SHADOW_ACCOUNT_ALIAS');
assert.equal(receipt.provider_envelope.idempotency_key.length, 64);
assert.equal(receipt.provider_envelope.evidence_digest.length, 64);
assert.match(receipt.provider_transaction_evidence_ref, /^provider_transaction_evidence:QUICKPAY_SHADOW_ACCOUNT:/);
assert.match(receipt.payment_evidence_ref, /^payment_evidence:invoice_001:payment_request_001:/);
assert.equal(receipt.live_dispatch_performed, false);
assert.equal(receipt.provider_callback_processed, false);
assert.equal(receipt.credential_material_handled, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.reconciliation_performed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const repeatReceipt = prepareQuickpayShadowAccountGatewayEnvelope({ ...baseInput, currency_code: 'PKR' });
assert.equal(repeatReceipt.provider_envelope.idempotency_key, receipt.provider_envelope.idempotency_key);
assert.equal(repeatReceipt.provider_envelope.evidence_digest, receipt.provider_envelope.evidence_digest);

const qrReceipt = prepareQuickpayShadowAccountGatewayEnvelope({
  ...baseInput,
  payment_request_ref: 'payment_request_002',
  channel: 'QR_REFERENCE',
  provider_environment: 'PRODUCTION_DISABLED',
});
assert.equal(qrReceipt.provider_envelope.channel, 'QR_REFERENCE');
assert.equal(qrReceipt.provider_envelope.provider_environment, 'PRODUCTION_DISABLED');
assert.notEqual(qrReceipt.provider_envelope.idempotency_key, receipt.provider_envelope.idempotency_key);

assert.throws(() => prepareQuickpayShadowAccountGatewayEnvelope({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => prepareQuickpayShadowAccountGatewayEnvelope({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => prepareQuickpayShadowAccountGatewayEnvelope({ ...baseInput, api_key_scope_registry_ref: '' }), /api_key_scope_registry_ref is required/);
assert.throws(() => prepareQuickpayShadowAccountGatewayEnvelope({ ...baseInput, invoice_record_ref: '' }), /invoice_record_ref is required/);
assert.throws(() => prepareQuickpayShadowAccountGatewayEnvelope({ ...baseInput, pricing_table_effective_date_ref: '' }), /pricing_table_effective_date_ref is required/);
assert.throws(() => prepareQuickpayShadowAccountGatewayEnvelope({ ...baseInput, gateway_account_ref: '' }), /gateway_account_ref is required/);
assert.throws(() => prepareQuickpayShadowAccountGatewayEnvelope({ ...baseInput, payment_request_ref: '' }), /payment_request_ref is required/);
assert.throws(() => prepareQuickpayShadowAccountGatewayEnvelope({ ...baseInput, customer_account_ref: '' }), /customer_account_ref is required/);
assert.throws(() => prepareQuickpayShadowAccountGatewayEnvelope({ ...baseInput, payer_contact_ref: '' }), /payer_contact_ref is required/);
assert.throws(() => prepareQuickpayShadowAccountGatewayEnvelope({ ...baseInput, requested_by_user_id: '' }), /requested_by_user_id is required/);
assert.throws(() => prepareQuickpayShadowAccountGatewayEnvelope({ ...baseInput, requested_at: 'not-a-date' }), /requested_at must be a valid ISO-compatible timestamp/);
assert.throws(() => prepareQuickpayShadowAccountGatewayEnvelope({ ...baseInput, currency_code: 'PK' }), /currency_code must be a three-letter/);
assert.throws(() => prepareQuickpayShadowAccountGatewayEnvelope({ ...baseInput, amount_minor: 0 }), /amount_minor must be a positive integer/);
assert.throws(() => prepareQuickpayShadowAccountGatewayEnvelope({ ...baseInput, channel: 'CARD' as never }), /channel is not supported/);
assert.throws(() => prepareQuickpayShadowAccountGatewayEnvelope({ ...baseInput, provider_environment: 'LIVE' as never }), /provider_environment is not supported/);
assert.throws(() => prepareQuickpayShadowAccountGatewayEnvelope({ ...baseInput, live_dispatch_requested: true }), /must not perform live provider dispatch/);
assert.throws(() => prepareQuickpayShadowAccountGatewayEnvelope({ ...baseInput, provider_callback_processing_requested: true }), /must not process provider callbacks/);
assert.throws(() => prepareQuickpayShadowAccountGatewayEnvelope({ ...baseInput, credential_material_present: true }), /must not handle credential material/);
assert.throws(() => prepareQuickpayShadowAccountGatewayEnvelope({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => prepareQuickpayShadowAccountGatewayEnvelope({ ...baseInput, reconciliation_requested: true }), /must not perform reconciliation behavior/);
assert.throws(() => prepareQuickpayShadowAccountGatewayEnvelope({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-072 QuickpayShadowAccount gateway adapter test passed.');
