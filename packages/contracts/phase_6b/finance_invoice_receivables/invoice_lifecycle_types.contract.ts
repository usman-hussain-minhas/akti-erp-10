export const PHASE_6B_INVOICE_LIFECYCLE_TYPES_SEED_ID = 'seed_6b_09_invoice_lifecycle_types' as const;
export const PHASE_6B_INVOICE_LIFECYCLE_TYPES_COMPONENT_ID = '6B.09' as const;

export const INVOICE_LIFECYCLE_EVENT = 'phase_6b.finance_invoice_receivables.invoice_lifecycle.transition_authorized' as const;

export type InvoiceLifecycleStatus = 'DRAFT' | 'ISSUED' | 'CANCELLED_BEFORE_ISSUE';
export type InvoiceLifecycleTransitionKind = 'DRAFT_TO_ISSUED' | 'DRAFT_TO_CANCELLED_BEFORE_ISSUE' | 'NO_OP_CURRENT_STATE';

export type InvoiceLifecycleTransitionInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  invoice_id: string;
  invoice_record_authority_ref: string;
  product_record_authority_ref: string;
  product_price_history_ref: string;
  pricing_table_effective_date_ref: string;
  pipeline_stage_model_ref: string;
  visual_workflow_builder_ref: string;
  current_status: InvoiceLifecycleStatus;
  requested_status: InvoiceLifecycleStatus;
  transition_reason: string;
  issued_at?: string;
  transitioned_by_user_id: string;
  transitioned_at: string;
  mutate_issued_invoice_requested?: boolean;
  credit_note_creation_requested?: boolean;
  payment_allocation_requested?: boolean;
  invoice_send_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type InvoiceLifecycleTransitionReceipt = {
  seed_id: typeof PHASE_6B_INVOICE_LIFECYCLE_TYPES_SEED_ID;
  component_id: typeof PHASE_6B_INVOICE_LIFECYCLE_TYPES_COMPONENT_ID;
  event_name: typeof INVOICE_LIFECYCLE_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  invoice_id: string;
  invoice_record_authority_ref: string;
  product_record_authority_ref: string;
  product_price_history_ref: string;
  pricing_table_effective_date_ref: string;
  pipeline_stage_model_ref: string;
  visual_workflow_builder_ref: string;
  current_status: InvoiceLifecycleStatus;
  requested_status: InvoiceLifecycleStatus;
  transition_kind: InvoiceLifecycleTransitionKind;
  transition_reason: string;
  issued_at?: string;
  immutable_after_issue: boolean;
  post_issue_change_policy: 'CREDIT_OR_DEBIT_NOTE_REQUIRED';
  mutate_issued_invoice_allowed: false;
  credit_note_creation_allowed: false;
  payment_allocation_allowed: false;
  invoice_send_allowed: false;
  irreversible_action_allowed: false;
  transitioned_by_user_id: string;
  transitioned_at: string;
};
