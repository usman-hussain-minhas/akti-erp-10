export const PHASE_6B_EXPENSE_APPROVAL_WORKFLOW_SEED_ID = 'seed_6b_11_expense_approval_workflow' as const;
export const PHASE_6B_EXPENSE_APPROVAL_WORKFLOW_COMPONENT_ID = '6B.11' as const;

export const EXPENSE_APPROVAL_WORKFLOW_EVENT = 'phase_6b.expense_purchase_vendor.expense_approval.decision_recorded' as const;

export type ExpenseApprovalDecision = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
export type ExpenseApprovalEvidenceMode = 'MANUAL_REVIEW' | 'WORKFLOW_RULE';

export type ExpenseApprovalWorkflowInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  expense_record_ref: string;
  expense_record_digest: string;
  requester_person_ref: string;
  approver_person_ref: string;
  visual_workflow_builder_ref: string;
  approval_workflow_ref: string;
  approval_step_ref: string;
  evidence_mode: ExpenseApprovalEvidenceMode;
  decision: ExpenseApprovalDecision;
  decision_reason: string;
  expense_total_minor: number;
  currency_code: string;
  submitted_at: string;
  decided_at: string;
  vendor_payment_requested?: boolean;
  payment_allocation_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  gl_posting_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type ExpenseApprovalWorkflowReceipt = {
  seed_id: typeof PHASE_6B_EXPENSE_APPROVAL_WORKFLOW_SEED_ID;
  component_id: typeof PHASE_6B_EXPENSE_APPROVAL_WORKFLOW_COMPONENT_ID;
  event_name: typeof EXPENSE_APPROVAL_WORKFLOW_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  expense_record_ref: string;
  expense_record_digest: string;
  requester_person_ref: string;
  approver_person_ref: string;
  visual_workflow_builder_ref: string;
  approval_workflow_ref: string;
  approval_step_ref: string;
  evidence_mode: ExpenseApprovalEvidenceMode;
  decision: ExpenseApprovalDecision;
  decision_reason: string;
  expense_total_minor: number;
  currency_code: string;
  submitted_at: string;
  decided_at: string;
  approval_capability_gated: true;
  approval_evidence_ref: string;
  vendor_payment_performed: false;
  payment_allocation_performed: false;
  provider_callback_processed: false;
  gl_posting_performed: false;
  irreversible_action_allowed: false;
};
