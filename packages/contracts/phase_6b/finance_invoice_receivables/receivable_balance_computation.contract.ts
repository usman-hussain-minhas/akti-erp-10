export const PHASE_6B_RECEIVABLE_BALANCE_COMPUTATION_SEED_ID = 'seed_6b_09_receivable_balance_computation' as const;
export const PHASE_6B_RECEIVABLE_BALANCE_COMPUTATION_COMPONENT_ID = '6B.09' as const;

export const RECEIVABLE_BALANCE_COMPUTATION_EVENT = 'phase_6b.finance_invoice_receivables.receivable_balance.computed' as const;

export type ReceivablePaymentTermBasis = 'DUE_ON_RECEIPT' | 'NET_DAYS';
export type ReceivableBalanceStatus = 'OPEN' | 'SETTLED' | 'OVERDUE';

export type ReceivablePaymentTerms = {
  basis: ReceivablePaymentTermBasis;
  net_days?: number;
};

export type ReceivableBalanceComputationInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  receivable_id: string;
  invoice_record_ref: string;
  product_record_authority_ref: string;
  product_price_history_ref: string;
  pricing_table_effective_date_ref: string;
  pipeline_stage_model_ref: string;
  visual_workflow_builder_ref: string;
  currency_code: string;
  invoice_total_minor: number;
  debit_note_total_minor: number;
  credit_note_total_minor: number;
  applied_payment_total_minor: number;
  invoice_issued_at: string;
  as_of: string;
  payment_terms: ReceivablePaymentTerms;
  computed_by_user_id: string;
  payment_allocation_requested?: boolean;
  provider_callback_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type ReceivableBalanceComputationReceipt = {
  seed_id: typeof PHASE_6B_RECEIVABLE_BALANCE_COMPUTATION_SEED_ID;
  component_id: typeof PHASE_6B_RECEIVABLE_BALANCE_COMPUTATION_COMPONENT_ID;
  event_name: typeof RECEIVABLE_BALANCE_COMPUTATION_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  receivable_id: string;
  invoice_record_ref: string;
  product_record_authority_ref: string;
  product_price_history_ref: string;
  pricing_table_effective_date_ref: string;
  pipeline_stage_model_ref: string;
  visual_workflow_builder_ref: string;
  currency_code: string;
  invoice_total_minor: number;
  debit_note_total_minor: number;
  credit_note_total_minor: number;
  applied_payment_total_minor: number;
  receivable_balance_minor: number;
  status: ReceivableBalanceStatus;
  due_at: string;
  days_past_due: number;
  payment_allocation_performed: false;
  provider_callback_processing_allowed: false;
  irreversible_action_allowed: false;
  computed_by_user_id: string;
  computed_at: string;
};
