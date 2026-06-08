export const PHASE_6B_AGING_AND_OVERDUE_MANAGEMENT_SEED_ID = 'seed_6b_09_aging_and_overdue_management' as const;
export const PHASE_6B_AGING_AND_OVERDUE_MANAGEMENT_COMPONENT_ID = '6B.09' as const;

export const AGING_AND_OVERDUE_MANAGEMENT_EVENT = 'phase_6b.finance_invoice_receivables.aging_overdue.evaluated' as const;

export type AgingReceivableStatus = 'CURRENT' | 'OVERDUE' | 'SETTLED';
export type AgingWorkflowDisposition = 'NO_ACTION' | 'MANUAL_REVIEW' | 'WORKFLOW_ESCALATION';

export type AgingBucketPolicy = {
  bucket_id: string;
  label: string;
  min_days_past_due: number;
  max_days_past_due?: number;
  pipeline_stage_model_ref: string;
  visual_workflow_builder_ref: string;
  requires_manual_review: boolean;
};

export type AgingReceivableInput = {
  receivable_id: string;
  invoice_record_ref: string;
  currency_code: string;
  receivable_balance_minor: number;
  due_at: string;
  issued_at: string;
  customer_account_ref: string;
  payment_terms_ref: string;
  credit_note_total_minor: number;
  debit_note_total_minor: number;
  applied_payment_total_minor: number;
};

export type AgingAndOverdueManagementInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  product_record_authority_ref: string;
  product_price_history_ref: string;
  pricing_table_effective_date_ref: string;
  pipeline_stage_model_ref: string;
  visual_workflow_builder_ref: string;
  as_of: string;
  managed_by_user_id: string;
  aging_policy: AgingBucketPolicy[];
  receivables: AgingReceivableInput[];
  payment_allocation_requested?: boolean;
  communication_send_requested?: boolean;
  provider_callback_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type AgingReceivableEvaluation = {
  receivable_id: string;
  invoice_record_ref: string;
  customer_account_ref: string;
  payment_terms_ref: string;
  currency_code: string;
  receivable_balance_minor: number;
  due_at: string;
  issued_at: string;
  days_past_due: number;
  status: AgingReceivableStatus;
  aging_bucket_id: string;
  aging_bucket_label: string;
  pipeline_stage_model_ref: string;
  visual_workflow_builder_ref: string;
  disposition: AgingWorkflowDisposition;
  credit_note_total_minor: number;
  debit_note_total_minor: number;
  applied_payment_total_minor: number;
};

export type AgingAndOverdueManagementReceipt = {
  seed_id: typeof PHASE_6B_AGING_AND_OVERDUE_MANAGEMENT_SEED_ID;
  component_id: typeof PHASE_6B_AGING_AND_OVERDUE_MANAGEMENT_COMPONENT_ID;
  event_name: typeof AGING_AND_OVERDUE_MANAGEMENT_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  product_record_authority_ref: string;
  product_price_history_ref: string;
  pricing_table_effective_date_ref: string;
  pipeline_stage_model_ref: string;
  visual_workflow_builder_ref: string;
  as_of: string;
  managed_by_user_id: string;
  total_receivable_count: number;
  overdue_receivable_count: number;
  current_receivable_count: number;
  settled_receivable_count: number;
  total_open_balance_minor_by_currency: Record<string, number>;
  evaluations: AgingReceivableEvaluation[];
  payment_allocation_performed: false;
  communication_send_performed: false;
  provider_callback_processing_allowed: false;
  irreversible_action_allowed: false;
  evaluated_at: string;
};
