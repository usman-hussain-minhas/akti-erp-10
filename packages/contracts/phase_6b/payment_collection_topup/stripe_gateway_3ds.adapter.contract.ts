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
