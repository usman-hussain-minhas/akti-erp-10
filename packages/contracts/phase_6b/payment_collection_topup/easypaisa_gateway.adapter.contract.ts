export const PHASE_6B_EASYPAISA_GATEWAY_SEED_ID = 'seed_6b_10_easypaisa_gateway' as const;
export const PHASE_6B_EASYPAISA_GATEWAY_COMPONENT_ID = '6B.10' as const;

export const EASYPAISA_GATEWAY_ENVELOPE_EVENT = 'phase_6b.payment_collection_topup.easypaisa_gateway.envelope_prepared' as const;

export type EasypaisaGatewayEnvironment = 'SANDBOX' | 'PRODUCTION_DISABLED';
export type EasypaisaGatewayChannel = 'MOBILE_WALLET' | 'VOUCHER' | 'QR_REFERENCE';
export type EasypaisaGatewayEnvelopeStatus = 'READY_FOR_PROVIDER_DISPATCH' | 'BLOCKED_BY_CONTROL_GATE';

export type EasypaisaGatewayPaymentInput = {
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
  channel: EasypaisaGatewayChannel;
  provider_environment: EasypaisaGatewayEnvironment;
  requested_at: string;
  requested_by_user_id: string;
  live_dispatch_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  credential_material_present?: boolean;
  payment_allocation_requested?: boolean;
  reconciliation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type EasypaisaGatewayProviderEnvelope = {
  provider: 'EASYPAISA';
  provider_environment: EasypaisaGatewayEnvironment;
  channel: EasypaisaGatewayChannel;
  gateway_account_ref: string;
  payment_request_ref: string;
  payer_contact_ref: string;
  amount_minor: number;
  currency_code: string;
  idempotency_key: string;
  evidence_digest: string;
};

export type EasypaisaGatewayEnvelopeReceipt = {
  seed_id: typeof PHASE_6B_EASYPAISA_GATEWAY_SEED_ID;
  component_id: typeof PHASE_6B_EASYPAISA_GATEWAY_COMPONENT_ID;
  event_name: typeof EASYPAISA_GATEWAY_ENVELOPE_EVENT;
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
  status: EasypaisaGatewayEnvelopeStatus;
  provider_envelope: EasypaisaGatewayProviderEnvelope;
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
