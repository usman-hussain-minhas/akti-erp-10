import { createHash } from 'node:crypto';

export const PHASE_6B_STRIPE_GATEWAY_3DS_GATEWAY_SEED_ID = 'seed_6b_10_stripe_gateway_3ds_gateway' as const;
export const PHASE_6B_STRIPE_GATEWAY_3DS_GATEWAY_COMPONENT_ID = '6B.10' as const;

export const STRIPE_GATEWAY_3DS_GATEWAY_ENVELOPE_EVENT = 'phase_6b.payment_collection_topup.stripe_gateway_3ds_gateway.envelope_prepared' as const;

export type StripeGateway3dsGatewayEnvironment = 'SANDBOX' | 'PRODUCTION_DISABLED';
export type StripeGateway3dsGatewayChannel = 'CHECKOUT_SESSION' | 'PAYMENT_INTENT_3DS' | 'PAYMENT_ELEMENT';
export type StripeGateway3dsGatewayEnvelopeStatus = 'READY_FOR_PROVIDER_DISPATCH' | 'BLOCKED_BY_CONTROL_GATE';

export type StripeGateway3dsGatewayPaymentInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  api_key_scope_registry_ref: string;
  invoice_record_ref: string;
  pricing_table_effective_date_ref: string;
  gateway_account_ref: string;
  payment_request_ref: string;
  customer_account_ref: string;
  payer_contact_ref: string;
  amount_minor: number;
  currency_code: string;
  channel: StripeGateway3dsGatewayChannel;
  provider_environment: StripeGateway3dsGatewayEnvironment;
  requested_at: string;
  requested_by_user_id: string;
  live_dispatch_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  credential_material_present?: boolean;
  payment_allocation_requested?: boolean;
  reconciliation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type StripeGateway3dsGatewayProviderEnvelope = {
  provider: 'STRIPE';
  provider_environment: StripeGateway3dsGatewayEnvironment;
  channel: StripeGateway3dsGatewayChannel;
  gateway_account_ref: string;
  payment_request_ref: string;
  payer_contact_ref: string;
  amount_minor: number;
  currency_code: string;
  idempotency_key: string;
  evidence_digest: string;
};

export type StripeGateway3dsGatewayEnvelopeReceipt = {
  seed_id: typeof PHASE_6B_STRIPE_GATEWAY_3DS_GATEWAY_SEED_ID;
  component_id: typeof PHASE_6B_STRIPE_GATEWAY_3DS_GATEWAY_COMPONENT_ID;
  event_name: typeof STRIPE_GATEWAY_3DS_GATEWAY_ENVELOPE_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  api_key_scope_registry_ref: string;
  invoice_record_ref: string;
  pricing_table_effective_date_ref: string;
  gateway_account_ref: string;
  payment_request_ref: string;
  customer_account_ref: string;
  amount_minor: number;
  currency_code: string;
  status: StripeGateway3dsGatewayEnvelopeStatus;
  provider_envelope: StripeGateway3dsGatewayProviderEnvelope;
  provider_transaction_evidence_ref: string;
  payment_evidence_ref: string;
  live_dispatch_performed: false;
  provider_callback_processed: false;
  credential_material_handled: false;
  payment_allocation_performed: false;
  reconciliation_performed: false;
  irreversible_action_allowed: false;
  requested_by_user_id: string;
  prepared_at: string;
};

const CHANNELS: readonly StripeGateway3dsGatewayChannel[] = ['CHECKOUT_SESSION', 'PAYMENT_INTENT_3DS', 'PAYMENT_ELEMENT'] as const;
const ENVIRONMENTS: readonly StripeGateway3dsGatewayEnvironment[] = ['SANDBOX', 'PRODUCTION_DISABLED'] as const;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for StripeGateway3ds gateway.`);
  }
  return value.trim();
}

function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for StripeGateway3ds gateway.`);
  }
  return normalized;
}

function normalizeCurrency(value: string): string {
  const currency = requireNonEmpty(value, 'currency_code').toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error('currency_code must be a three-letter ISO-style code for StripeGateway3ds gateway.');
  }
  return currency;
}

function normalizeAmount(value: number): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error('amount_minor must be a positive integer for StripeGateway3ds gateway.');
  }
  return value;
}

function requireChannel(value: StripeGateway3dsGatewayChannel): StripeGateway3dsGatewayChannel {
  if (!CHANNELS.includes(value)) {
    throw new Error('channel is not supported for StripeGateway3ds gateway.');
  }
  return value;
}

function requireEnvironment(value: StripeGateway3dsGatewayEnvironment): StripeGateway3dsGatewayEnvironment {
  if (!ENVIRONMENTS.includes(value)) {
    throw new Error('provider_environment is not supported for StripeGateway3ds gateway.');
  }
  return value;
}

function digest(parts: readonly string[]): string {
  return createHash('sha256').update(parts.join('|')).digest('hex');
}

export function prepareStripeGateway3dsGatewayEnvelope(input: StripeGateway3dsGatewayPaymentInput): StripeGateway3dsGatewayEnvelopeReceipt {
  if (input.live_dispatch_requested === true) {
    throw new Error('StripeGateway3ds gateway FFET must not perform live provider dispatch.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('StripeGateway3ds gateway FFET must not process provider callbacks.');
  }
  if (input.credential_material_present === true) {
    throw new Error('StripeGateway3ds gateway FFET must not handle credential material.');
  }
  if (input.payment_allocation_requested === true) {
    throw new Error('StripeGateway3ds gateway FFET must not perform payment allocation math.');
  }
  if (input.reconciliation_requested === true) {
    throw new Error('StripeGateway3ds gateway FFET must not perform reconciliation behavior.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('StripeGateway3ds gateway FFET must not perform irreversible actions.');
  }

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const apiKeyScopeRegistryRef = requireNonEmpty(input.api_key_scope_registry_ref, 'api_key_scope_registry_ref');
  const invoiceRecordRef = requireNonEmpty(input.invoice_record_ref, 'invoice_record_ref');
  const pricingTableEffectiveDateRef = requireNonEmpty(input.pricing_table_effective_date_ref, 'pricing_table_effective_date_ref');
  const gatewayAccountRef = requireNonEmpty(input.gateway_account_ref, 'gateway_account_ref');
  const paymentRequestRef = requireNonEmpty(input.payment_request_ref, 'payment_request_ref');
  const customerAccountRef = requireNonEmpty(input.customer_account_ref, 'customer_account_ref');
  const payerContactRef = requireNonEmpty(input.payer_contact_ref, 'payer_contact_ref');
  const requestedByUserId = requireNonEmpty(input.requested_by_user_id, 'requested_by_user_id');
  const preparedAt = requireTimestamp(input.requested_at, 'requested_at');
  const currencyCode = normalizeCurrency(input.currency_code);
  const amountMinor = normalizeAmount(input.amount_minor);
  const channel = requireChannel(input.channel);
  const providerEnvironment = requireEnvironment(input.provider_environment);
  const idempotencyKey = digest([
    'STRIPE',
    organizationId,
    invoiceRecordRef,
    paymentRequestRef,
    amountMinor.toString(),
    currencyCode,
  ]);
  const evidenceDigest = digest([
    PHASE_6B_STRIPE_GATEWAY_3DS_GATEWAY_SEED_ID,
    serviceManifestContractId,
    apiKeyScopeRegistryRef,
    pricingTableEffectiveDateRef,
    idempotencyKey,
  ]);

  return {
    seed_id: PHASE_6B_STRIPE_GATEWAY_3DS_GATEWAY_SEED_ID,
    component_id: PHASE_6B_STRIPE_GATEWAY_3DS_GATEWAY_COMPONENT_ID,
    event_name: STRIPE_GATEWAY_3DS_GATEWAY_ENVELOPE_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    api_key_scope_registry_ref: apiKeyScopeRegistryRef,
    invoice_record_ref: invoiceRecordRef,
    pricing_table_effective_date_ref: pricingTableEffectiveDateRef,
    gateway_account_ref: gatewayAccountRef,
    payment_request_ref: paymentRequestRef,
    customer_account_ref: customerAccountRef,
    amount_minor: amountMinor,
    currency_code: currencyCode,
    status: 'READY_FOR_PROVIDER_DISPATCH',
    provider_envelope: {
      provider: 'STRIPE',
      provider_environment: providerEnvironment,
      channel,
      gateway_account_ref: gatewayAccountRef,
      payment_request_ref: paymentRequestRef,
      payer_contact_ref: payerContactRef,
      amount_minor: amountMinor,
      currency_code: currencyCode,
      idempotency_key: idempotencyKey,
      evidence_digest: evidenceDigest,
    },
    provider_transaction_evidence_ref: `provider_transaction_evidence:STRIPE:${idempotencyKey}`,
    payment_evidence_ref: `payment_evidence:${invoiceRecordRef}:${paymentRequestRef}:${evidenceDigest}`,
    live_dispatch_performed: false,
    provider_callback_processed: false,
    credential_material_handled: false,
    payment_allocation_performed: false,
    reconciliation_performed: false,
    irreversible_action_allowed: false,
    requested_by_user_id: requestedByUserId,
    prepared_at: preparedAt,
  };
}
