import assert from 'node:assert/strict';
import { prepareWiseGatewayEnvelope, type WiseGatewayPaymentInput } from './wise_gateway.adapter';

const baseInput: WiseGatewayPaymentInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_payment_collection_topup',
  api_key_scope_registry_ref: 'api_key_scope_wise_tenant_001',
  invoice_record_ref: 'invoice_001',
  pricing_table_effective_date_ref: 'pricing_effective_2026_06',
  gateway_account_ref: 'wise_gateway_account_001',
  payment_request_ref: 'payment_request_001',
  customer_account_ref: 'customer_001',
  payer_contact_ref: 'payer_contact_001',
  amount_minor: 125000,
  currency_code: 'pkr',
  channel: 'WISE_BALANCE_TRANSFER',
  provider_environment: 'SANDBOX',
  requested_at: '2026-06-08T10:15:00.000Z',
  requested_by_user_id: 'user_payment_operator_001',
};

const receipt = prepareWiseGatewayEnvelope(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_10_wise_gateway');
assert.equal(receipt.component_id, '6B.10');
assert.equal(receipt.event_name, 'phase_6b.payment_collection_topup.wise_gateway.envelope_prepared');
assert.equal(receipt.status, 'READY_FOR_PROVIDER_DISPATCH');
assert.equal(receipt.currency_code, 'PKR');
assert.equal(receipt.amount_minor, 125000);
assert.equal(receipt.provider_envelope.provider, 'WISE');
assert.equal(receipt.provider_envelope.provider_environment, 'SANDBOX');
assert.equal(receipt.provider_envelope.channel, 'WISE_BALANCE_TRANSFER');
assert.equal(receipt.provider_envelope.idempotency_key.length, 64);
assert.equal(receipt.provider_envelope.evidence_digest.length, 64);
assert.match(receipt.provider_transaction_evidence_ref, /^provider_transaction_evidence:WISE:/);
assert.match(receipt.payment_evidence_ref, /^payment_evidence:invoice_001:payment_request_001:/);
assert.equal(receipt.live_dispatch_performed, false);
assert.equal(receipt.provider_callback_processed, false);
assert.equal(receipt.credential_material_handled, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.reconciliation_performed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const repeatReceipt = prepareWiseGatewayEnvelope({ ...baseInput, currency_code: 'PKR' });
assert.equal(repeatReceipt.provider_envelope.idempotency_key, receipt.provider_envelope.idempotency_key);
assert.equal(repeatReceipt.provider_envelope.evidence_digest, receipt.provider_envelope.evidence_digest);

const qrReceipt = prepareWiseGatewayEnvelope({
  ...baseInput,
  payment_request_ref: 'payment_request_002',
  channel: 'BANK_TRANSFER',
  provider_environment: 'PRODUCTION_DISABLED',
});
assert.equal(qrReceipt.provider_envelope.channel, 'BANK_TRANSFER');
assert.equal(qrReceipt.provider_envelope.provider_environment, 'PRODUCTION_DISABLED');
assert.notEqual(qrReceipt.provider_envelope.idempotency_key, receipt.provider_envelope.idempotency_key);

assert.throws(() => prepareWiseGatewayEnvelope({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => prepareWiseGatewayEnvelope({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => prepareWiseGatewayEnvelope({ ...baseInput, api_key_scope_registry_ref: '' }), /api_key_scope_registry_ref is required/);
assert.throws(() => prepareWiseGatewayEnvelope({ ...baseInput, invoice_record_ref: '' }), /invoice_record_ref is required/);
assert.throws(() => prepareWiseGatewayEnvelope({ ...baseInput, pricing_table_effective_date_ref: '' }), /pricing_table_effective_date_ref is required/);
assert.throws(() => prepareWiseGatewayEnvelope({ ...baseInput, gateway_account_ref: '' }), /gateway_account_ref is required/);
assert.throws(() => prepareWiseGatewayEnvelope({ ...baseInput, payment_request_ref: '' }), /payment_request_ref is required/);
assert.throws(() => prepareWiseGatewayEnvelope({ ...baseInput, customer_account_ref: '' }), /customer_account_ref is required/);
assert.throws(() => prepareWiseGatewayEnvelope({ ...baseInput, payer_contact_ref: '' }), /payer_contact_ref is required/);
assert.throws(() => prepareWiseGatewayEnvelope({ ...baseInput, requested_by_user_id: '' }), /requested_by_user_id is required/);
assert.throws(() => prepareWiseGatewayEnvelope({ ...baseInput, requested_at: 'not-a-date' }), /requested_at must be a valid ISO-compatible timestamp/);
assert.throws(() => prepareWiseGatewayEnvelope({ ...baseInput, currency_code: 'PK' }), /currency_code must be a three-letter/);
assert.throws(() => prepareWiseGatewayEnvelope({ ...baseInput, amount_minor: 0 }), /amount_minor must be a positive integer/);
assert.throws(() => prepareWiseGatewayEnvelope({ ...baseInput, channel: 'CARD' as never }), /channel is not supported/);
assert.throws(() => prepareWiseGatewayEnvelope({ ...baseInput, provider_environment: 'LIVE' as never }), /provider_environment is not supported/);
assert.throws(() => prepareWiseGatewayEnvelope({ ...baseInput, live_dispatch_requested: true }), /must not perform live provider dispatch/);
assert.throws(() => prepareWiseGatewayEnvelope({ ...baseInput, provider_callback_processing_requested: true }), /must not process provider callbacks/);
assert.throws(() => prepareWiseGatewayEnvelope({ ...baseInput, credential_material_present: true }), /must not handle credential material/);
assert.throws(() => prepareWiseGatewayEnvelope({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => prepareWiseGatewayEnvelope({ ...baseInput, reconciliation_requested: true }), /must not perform reconciliation behavior/);
assert.throws(() => prepareWiseGatewayEnvelope({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-074 Wise gateway adapter test passed.');
