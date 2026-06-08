export const PHASE_6B_REFUND_TO_ORIGINAL_METHOD_SEED_ID = 'seed_6b_10_refund_to_original_method' as const;
export const PHASE_6B_REFUND_TO_ORIGINAL_METHOD_COMPONENT_ID = '6B.10' as const;

export const REFUND_TO_ORIGINAL_METHOD_EVENT = 'phase_6b.payment_collection_topup.refund.original_method_intent_prepared' as const;

export type RefundToOriginalMethodReason = 'CUSTOMER_REQUEST' | 'DUPLICATE_PAYMENT' | 'SERVICE_CREDIT' | 'OVERPAYMENT';
export type RefundToOriginalMethodStatus = 'READY_FOR_PROVIDER_DISPATCH';

export type RefundToOriginalMethodInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  api_key_scope_registry_ref: string;
  invoice_record_ref: string;
  pricing_table_effective_date_ref: string;
  payment_receipt_ref: string;
  payment_evidence_ref: string;
  original_provider_ref: string;
  original_payment_method_ref: string;
  refund_request_ref: string;
  refund_reason: RefundToOriginalMethodReason;
  currency_code: string;
  original_payment_amount_minor: number;
  prior_refunded_minor: number;
  refund_amount_minor: number;
  requested_by_user_id: string;
  requested_at: string;
  alternate_refund_method_ref?: string;
  live_provider_dispatch_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  payment_allocation_requested?: boolean;
  reconciliation_requested?: boolean;
  top_up_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type RefundToOriginalMethodReceipt = {
  seed_id: typeof PHASE_6B_REFUND_TO_ORIGINAL_METHOD_SEED_ID;
  component_id: typeof PHASE_6B_REFUND_TO_ORIGINAL_METHOD_COMPONENT_ID;
  event_name: typeof REFUND_TO_ORIGINAL_METHOD_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  api_key_scope_registry_ref: string;
  invoice_record_ref: string;
  pricing_table_effective_date_ref: string;
  payment_receipt_ref: string;
  payment_evidence_ref: string;
  original_provider_ref: string;
  original_payment_method_ref: string;
  refund_request_ref: string;
  refund_reason: RefundToOriginalMethodReason;
  currency_code: string;
  original_payment_amount_minor: number;
  prior_refunded_minor: number;
  refund_amount_minor: number;
  remaining_refundable_minor: number;
  status: RefundToOriginalMethodStatus;
  provider_refund_evidence_ref: string;
  original_method_enforced: true;
  live_provider_dispatch_performed: false;
  provider_callback_processed: false;
  payment_allocation_performed: false;
  reconciliation_performed: false;
  top_up_performed: false;
  irreversible_action_allowed: false;
  requested_by_user_id: string;
  prepared_at: string;
};
