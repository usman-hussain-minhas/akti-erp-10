export const PHASE_6B_TOP_UP_PREPAID_CREDIT_SEED_ID = 'seed_6b_10_top_up_prepaid_credit' as const;
export const PHASE_6B_TOP_UP_PREPAID_CREDIT_COMPONENT_ID = '6B.10' as const;

export const TOP_UP_PREPAID_CREDIT_EVENT = 'phase_6b.payment_collection_topup.prepaid_credit.top_up_recorded' as const;

export type TopUpPrepaidCreditStatus = 'PREPAID_CREDIT_READY_TO_RECORD';

export type TopUpPrepaidCreditInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  api_key_scope_registry_ref: string;
  invoice_record_ref: string;
  pricing_table_effective_date_ref: string;
  payment_receipt_ref: string;
  payment_evidence_ref: string;
  provider_transaction_evidence_ref: string;
  prepaid_account_ref: string;
  currency_code: string;
  current_prepaid_balance_minor: number;
  top_up_amount_minor: number;
  requested_by_user_id: string;
  credited_at: string;
  live_provider_dispatch_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  payment_allocation_requested?: boolean;
  reconciliation_requested?: boolean;
  refund_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type TopUpPrepaidCreditReceipt = {
  seed_id: typeof PHASE_6B_TOP_UP_PREPAID_CREDIT_SEED_ID;
  component_id: typeof PHASE_6B_TOP_UP_PREPAID_CREDIT_COMPONENT_ID;
  event_name: typeof TOP_UP_PREPAID_CREDIT_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  api_key_scope_registry_ref: string;
  invoice_record_ref: string;
  pricing_table_effective_date_ref: string;
  payment_receipt_ref: string;
  payment_evidence_ref: string;
  provider_transaction_evidence_ref: string;
  prepaid_account_ref: string;
  currency_code: string;
  previous_prepaid_balance_minor: number;
  top_up_amount_minor: number;
  new_prepaid_balance_minor: number;
  status: TopUpPrepaidCreditStatus;
  prepaid_balance_source_of_truth: true;
  top_up_credit_evidence_ref: string;
  live_provider_dispatch_performed: false;
  provider_callback_processed: false;
  payment_allocation_performed: false;
  reconciliation_performed: false;
  refund_performed: false;
  irreversible_action_allowed: false;
  requested_by_user_id: string;
  credited_at: string;
};
