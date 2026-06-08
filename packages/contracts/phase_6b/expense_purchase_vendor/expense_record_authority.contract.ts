export const PHASE_6B_EXPENSE_RECORD_AUTHORITY_SEED_ID = 'seed_6b_11_expense_record_authority' as const;
export const PHASE_6B_EXPENSE_RECORD_AUTHORITY_COMPONENT_ID = '6B.11' as const;

export const EXPENSE_RECORD_AUTHORITY_EVENT = 'phase_6b.expense_purchase_vendor.expense_record.authorized' as const;

export type ExpenseRecordStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'VOID_BEFORE_APPROVAL';
export type ExpenseLineType = 'PURCHASE' | 'REIMBURSEMENT' | 'FEE' | 'TAX';

export type ExpenseLineInput = {
  expense_line_ref: string;
  line_type: ExpenseLineType;
  description: string;
  quantity_units: number;
  unit_amount_minor: number;
  line_total_minor: number;
  currency_code: string;
  receipt_evidence_ref?: string;
};

export type ExpenseRecordAuthorityInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  expense_record_ref: string;
  expense_number: string;
  vendor_record_ref: string;
  requester_person_ref: string;
  payment_allocation_balance_ref: string;
  visual_workflow_builder_ref: string;
  approval_workflow_ref: string;
  pricing_table_effective_date_ref: string;
  status: ExpenseRecordStatus;
  currency_code: string;
  incurred_at: string;
  submitted_at?: string;
  approved_by_person_ref?: string;
  approved_at?: string;
  rejection_reason?: string;
  expense_lines: ExpenseLineInput[];
  authorized_by_user_id: string;
  authorized_at: string;
  payment_allocation_requested?: boolean;
  vendor_payment_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  gl_posting_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type ExpenseRecordAuthorityReceipt = {
  seed_id: typeof PHASE_6B_EXPENSE_RECORD_AUTHORITY_SEED_ID;
  component_id: typeof PHASE_6B_EXPENSE_RECORD_AUTHORITY_COMPONENT_ID;
  event_name: typeof EXPENSE_RECORD_AUTHORITY_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  expense_record_ref: string;
  expense_number: string;
  vendor_record_ref: string;
  requester_person_ref: string;
  payment_allocation_balance_ref: string;
  visual_workflow_builder_ref: string;
  approval_workflow_ref: string;
  pricing_table_effective_date_ref: string;
  status: ExpenseRecordStatus;
  currency_code: string;
  incurred_at: string;
  submitted_at?: string;
  approved_by_person_ref?: string;
  approved_at?: string;
  rejection_reason?: string;
  expense_lines: ExpenseLineInput[];
  line_count: number;
  expense_total_minor: number;
  approval_capability_gated: true;
  expense_record_digest: string;
  payment_allocation_performed: false;
  vendor_payment_performed: false;
  provider_callback_processed: false;
  gl_posting_performed: false;
  irreversible_action_allowed: false;
  authorized_by_user_id: string;
  authorized_at: string;
};
