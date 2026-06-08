export const PHASE_6B_PAYMENT_ALLOCATION_BALANCE_SEED_ID = 'seed_6b_10_payment_allocation_balance' as const;
export const PHASE_6B_PAYMENT_ALLOCATION_BALANCE_COMPONENT_ID = '6B.10' as const;

export const PAYMENT_ALLOCATION_BALANCE_EVENT = 'phase_6b.payment_collection_topup.payment_allocation.balance_computed' as const;
export const PAYMENT_ALLOCATION_BALANCE_INVOICE_ADL_REF = 'ADL-013' as const;

export type PaymentAllocationStatus = 'UNALLOCATED' | 'PARTIALLY_ALLOCATED' | 'FULLY_ALLOCATED';

export type PaymentAllocationLineInput = {
  allocation_line_ref: string;
  invoice_record_ref: string;
  receivable_ref: string;
  invoice_total_minor: number;
  existing_allocated_minor: number;
  allocation_amount_minor: number;
  payment_evidence_ref: string;
};

export type PaymentAllocationBalanceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  pricing_table_effective_date_ref: string;
  payment_receipt_ref: string;
  payment_evidence_ref: string;
  currency_code: string;
  payment_amount_minor: number;
  allocated_by_user_id: string;
  allocated_at: string;
  allocation_lines: PaymentAllocationLineInput[];
  api_key_scope_registry_ref?: string;
  provider_callback_processing_requested?: boolean;
  reconciliation_requested?: boolean;
  refund_requested?: boolean;
  top_up_requested?: boolean;
  invoice_mutation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type PaymentAllocationBalanceEntry = {
  allocation_line_ref: string;
  invoice_record_ref: string;
  receivable_ref: string;
  invoice_total_minor: number;
  existing_allocated_minor: number;
  allocation_amount_minor: number;
  invoice_remaining_balance_minor: number;
  payment_evidence_ref: string;
  status: PaymentAllocationStatus;
};

export type PaymentAllocationBalanceReceipt = {
  seed_id: typeof PHASE_6B_PAYMENT_ALLOCATION_BALANCE_SEED_ID;
  component_id: typeof PHASE_6B_PAYMENT_ALLOCATION_BALANCE_COMPONENT_ID;
  event_name: typeof PAYMENT_ALLOCATION_BALANCE_EVENT;
  invoice_record_authority_adl_ref: typeof PAYMENT_ALLOCATION_BALANCE_INVOICE_ADL_REF;
  organization_id: string;
  service_manifest_contract_id: string;
  pricing_table_effective_date_ref: string;
  payment_receipt_ref: string;
  payment_evidence_ref: string;
  currency_code: string;
  payment_amount_minor: number;
  total_newly_allocated_minor: number;
  unallocated_payment_balance_minor: number;
  allocation_entries: PaymentAllocationBalanceEntry[];
  provider_neutral: true;
  api_key_scope_consumed: false;
  provider_callback_processed: false;
  reconciliation_performed: false;
  refund_performed: false;
  top_up_performed: false;
  invoice_mutation_performed: false;
  irreversible_action_allowed: false;
  allocated_by_user_id: string;
  allocated_at: string;
};
