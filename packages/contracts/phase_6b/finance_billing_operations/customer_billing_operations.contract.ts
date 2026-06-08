export const PHASE_6B_CUSTOMER_BILLING_OPERATIONS_SEED_ID = 'seed_6b_15_customer_billing_operations' as const;
export const PHASE_6B_FINANCE_BILLING_OPERATIONS_COMPONENT_ID = '6B.15' as const;

export const CUSTOMER_BILLING_OPERATIONS_EVENT = 'phase_6b.finance_billing.customer_operations_summarized' as const;

export type BillingServiceSpendInput = {
  service_ref: string;
  pricing_table_ref: string;
  optimization_fact_ref: string;
  usage_evidence_ref: string;
  spend_minor: number;
  currency_code: string;
};

export type BillingBudgetCapInput = {
  budget_cap_ref: string;
  service_ref: string;
  cap_amount_minor: number;
  current_spend_minor: number;
  currency_code: string;
};

export type CustomerBillingOperationsInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_CUSTOMER_BILLING_OPERATIONS_SEED_ID;
  billing_operations_ref: string;
  customer_account_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  billing_period_start_at: string;
  billing_period_end_at: string;
  base_currency_code: string;
  service_spend: BillingServiceSpendInput[];
  budget_caps: BillingBudgetCapInput[];
  requested_by_user_id: string;
  requested_at: string;
  invoice_generation_requested?: boolean;
  proration_requested?: boolean;
  dunning_requested?: boolean;
  payment_collection_requested?: boolean;
  journal_posting_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type CustomerBillingOperationsReceipt = {
  seed_id: typeof PHASE_6B_CUSTOMER_BILLING_OPERATIONS_SEED_ID;
  component_id: typeof PHASE_6B_FINANCE_BILLING_OPERATIONS_COMPONENT_ID;
  event_name: typeof CUSTOMER_BILLING_OPERATIONS_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  phase_6b_billing_operation_model: 'Phase6BBillingOperation';
  phase_6b_budget_cap_model: 'Phase6BBudgetCap';
  source_seed_id: typeof PHASE_6B_CUSTOMER_BILLING_OPERATIONS_SEED_ID;
  billing_operations_ref: string;
  customer_account_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  billing_period_start_at: string;
  billing_period_end_at: string;
  base_currency_code: string;
  service_count: number;
  budget_cap_count: number;
  total_spend_minor: number;
  budget_cap_breach_count: number;
  budget_cap_warning_count: number;
  operation_evidence_ref: string;
  operation_digest: string;
  invoice_generated: false;
  proration_performed: false;
  dunning_performed: false;
  payment_collected: false;
  journal_posted: false;
  irreversible_action_allowed: false;
  requested_by_user_id: string;
  requested_at: string;
};
