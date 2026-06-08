export const PHASE_6B_RAAST_GATEWAY_SEED_ID = 'seed_6b_10_raast_gateway' as const;
export const PHASE_6B_RAAST_GATEWAY_COMPONENT_ID = '6B.10' as const;

export const RAAST_GATEWAY_ENVELOPE_EVENT = 'phase_6b.payment_collection_topup.raast_gateway.envelope_prepared' as const;

export type RaastGatewayEnvironment = 'SANDBOX' | 'PRODUCTION_DISABLED';
export type RaastGatewayChannel = 'RAAST_ALIAS' | 'BANK_ACCOUNT' | 'QR_REFERENCE';
export type RaastGatewayEnvelopeStatus = 'READY_FOR_PROVIDER_DISPATCH' | 'BLOCKED_BY_CONTROL_GATE';

export type RaastGatewayPaymentInput = {
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
  channel: RaastGatewayChannel;
  provider_environment: RaastGatewayEnvironment;
  requested_at: string;
  requested_by_user_id: string;
  live_dispatch_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  credential_material_present?: boolean;
  payment_allocation_requested?: boolean;
  reconciliation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type RaastGatewayProviderEnvelope = {
  provider: 'RAAST';
  provider_environment: RaastGatewayEnvironment;
  channel: RaastGatewayChannel;
  gateway_account_ref: string;
  payment_request_ref: string;
  payer_contact_ref: string;
  amount_minor: number;
  currency_code: string;
  idempotency_key: string;
  evidence_digest: string;
};

export type RaastGatewayEnvelopeReceipt = {
  seed_id: typeof PHASE_6B_RAAST_GATEWAY_SEED_ID;
  component_id: typeof PHASE_6B_RAAST_GATEWAY_COMPONENT_ID;
  event_name: typeof RAAST_GATEWAY_ENVELOPE_EVENT;
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
  status: RaastGatewayEnvelopeStatus;
  provider_envelope: RaastGatewayProviderEnvelope;
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
