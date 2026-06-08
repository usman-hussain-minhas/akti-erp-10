import assert from 'node:assert/strict';
import { prepareRaastGatewayEnvelope, type RaastGatewayPaymentInput } from './raast_gateway.adapter';

const baseInput: RaastGatewayPaymentInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_payment_collection_topup',
  api_key_scope_registry_ref: 'api_key_scope_raast_tenant_001',
  invoice_record_ref: 'invoice_001',
  pricing_table_effective_date_ref: 'pricing_effective_2026_06',
  gateway_account_ref: 'raast_gateway_account_001',
  payment_request_ref: 'payment_request_001',
  customer_account_ref: 'customer_001',
  payer_contact_ref: 'payer_contact_001',
  amount_minor: 125000,
  currency_code: 'pkr',
  channel: 'RAAST_ALIAS',
  provider_environment: 'SANDBOX',
  requested_at: '2026-06-08T10:15:00.000Z',
  requested_by_user_id: 'user_payment_operator_001',
};

const receipt = prepareRaastGatewayEnvelope(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_10_raast_gateway');
assert.equal(receipt.component_id, '6B.10');
assert.equal(receipt.event_name, 'phase_6b.payment_collection_topup.raast_gateway.envelope_prepared');
assert.equal(receipt.status, 'READY_FOR_PROVIDER_DISPATCH');
assert.equal(receipt.currency_code, 'PKR');
assert.equal(receipt.amount_minor, 125000);
assert.equal(receipt.provider_envelope.provider, 'RAAST');
assert.equal(receipt.provider_envelope.provider_environment, 'SANDBOX');
assert.equal(receipt.provider_envelope.channel, 'RAAST_ALIAS');
assert.equal(receipt.provider_envelope.idempotency_key.length, 64);
assert.equal(receipt.provider_envelope.evidence_digest.length, 64);
assert.match(receipt.provider_transaction_evidence_ref, /^provider_transaction_evidence:RAAST:/);
assert.match(receipt.payment_evidence_ref, /^payment_evidence:invoice_001:payment_request_001:/);
assert.equal(receipt.live_dispatch_performed, false);
assert.equal(receipt.provider_callback_processed, false);
assert.equal(receipt.credential_material_handled, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.reconciliation_performed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const repeatReceipt = prepareRaastGatewayEnvelope({ ...baseInput, currency_code: 'PKR' });
assert.equal(repeatReceipt.provider_envelope.idempotency_key, receipt.provider_envelope.idempotency_key);
assert.equal(repeatReceipt.provider_envelope.evidence_digest, receipt.provider_envelope.evidence_digest);

const qrReceipt = prepareRaastGatewayEnvelope({
  ...baseInput,
  payment_request_ref: 'payment_request_002',
  channel: 'QR_REFERENCE',
  provider_environment: 'PRODUCTION_DISABLED',
});
assert.equal(qrReceipt.provider_envelope.channel, 'QR_REFERENCE');
assert.equal(qrReceipt.provider_envelope.provider_environment, 'PRODUCTION_DISABLED');
assert.notEqual(qrReceipt.provider_envelope.idempotency_key, receipt.provider_envelope.idempotency_key);

assert.throws(() => prepareRaastGatewayEnvelope({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => prepareRaastGatewayEnvelope({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => prepareRaastGatewayEnvelope({ ...baseInput, api_key_scope_registry_ref: '' }), /api_key_scope_registry_ref is required/);
assert.throws(() => prepareRaastGatewayEnvelope({ ...baseInput, invoice_record_ref: '' }), /invoice_record_ref is required/);
assert.throws(() => prepareRaastGatewayEnvelope({ ...baseInput, pricing_table_effective_date_ref: '' }), /pricing_table_effective_date_ref is required/);
assert.throws(() => prepareRaastGatewayEnvelope({ ...baseInput, gateway_account_ref: '' }), /gateway_account_ref is required/);
assert.throws(() => prepareRaastGatewayEnvelope({ ...baseInput, payment_request_ref: '' }), /payment_request_ref is required/);
assert.throws(() => prepareRaastGatewayEnvelope({ ...baseInput, customer_account_ref: '' }), /customer_account_ref is required/);
assert.throws(() => prepareRaastGatewayEnvelope({ ...baseInput, payer_contact_ref: '' }), /payer_contact_ref is required/);
assert.throws(() => prepareRaastGatewayEnvelope({ ...baseInput, requested_by_user_id: '' }), /requested_by_user_id is required/);
assert.throws(() => prepareRaastGatewayEnvelope({ ...baseInput, requested_at: 'not-a-date' }), /requested_at must be a valid ISO-compatible timestamp/);
assert.throws(() => prepareRaastGatewayEnvelope({ ...baseInput, currency_code: 'PK' }), /currency_code must be a three-letter/);
assert.throws(() => prepareRaastGatewayEnvelope({ ...baseInput, amount_minor: 0 }), /amount_minor must be a positive integer/);
assert.throws(() => prepareRaastGatewayEnvelope({ ...baseInput, channel: 'CARD' as never }), /channel is not supported/);
assert.throws(() => prepareRaastGatewayEnvelope({ ...baseInput, provider_environment: 'LIVE' as never }), /provider_environment is not supported/);
assert.throws(() => prepareRaastGatewayEnvelope({ ...baseInput, live_dispatch_requested: true }), /must not perform live provider dispatch/);
assert.throws(() => prepareRaastGatewayEnvelope({ ...baseInput, provider_callback_processing_requested: true }), /must not process provider callbacks/);
assert.throws(() => prepareRaastGatewayEnvelope({ ...baseInput, credential_material_present: true }), /must not handle credential material/);
assert.throws(() => prepareRaastGatewayEnvelope({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => prepareRaastGatewayEnvelope({ ...baseInput, reconciliation_requested: true }), /must not perform reconciliation behavior/);
assert.throws(() => prepareRaastGatewayEnvelope({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-071 Raast gateway adapter test passed.');
