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

const DECISIONS: readonly ExpenseApprovalDecision[] = ['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ESCALATED'] as const;
const EVIDENCE_MODES: readonly ExpenseApprovalEvidenceMode[] = ['MANUAL_REVIEW', 'WORKFLOW_RULE'] as const;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for expense approval workflow.`);
  }
  return value.trim();
}

function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for expense approval workflow.`);
  }
  return normalized;
}

function normalizeCurrency(value: string): string {
  const currency = requireNonEmpty(value, 'currency_code').toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error('currency_code must be a three-letter ISO-style code for expense approval workflow.');
  }
  return currency;
}

function normalizeAmount(value: number): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error('expense_total_minor must be a positive integer for expense approval workflow.');
  }
  return value;
}

function requireDigest(value: string): string {
  const digest = requireNonEmpty(value, 'expense_record_digest');
  if (!DIGEST_PATTERN.test(digest)) {
    throw new Error('expense_record_digest must be a 64-character lowercase hex digest for expense approval workflow.');
  }
  return digest;
}

function requireDecision(value: ExpenseApprovalDecision): ExpenseApprovalDecision {
  if (!DECISIONS.includes(value)) {
    throw new Error('decision is not supported for expense approval workflow.');
  }
  return value;
}

function requireEvidenceMode(value: ExpenseApprovalEvidenceMode): ExpenseApprovalEvidenceMode {
  if (!EVIDENCE_MODES.includes(value)) {
    throw new Error('evidence_mode is not supported for expense approval workflow.');
  }
  return value;
}

export function recordExpenseApprovalWorkflowDecision(input: ExpenseApprovalWorkflowInput): ExpenseApprovalWorkflowReceipt {
  if (input.vendor_payment_requested === true) {
    throw new Error('expense approval workflow must not execute vendor payments.');
  }
  if (input.payment_allocation_requested === true) {
    throw new Error('expense approval workflow must not perform payment allocation math.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('expense approval workflow must not process provider callbacks.');
  }
  if (input.gl_posting_requested === true) {
    throw new Error('expense approval workflow must not post to general ledger.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('expense approval workflow must not perform irreversible actions.');
  }
  const submittedAt = requireTimestamp(input.submitted_at, 'submitted_at');
  const decidedAt = requireTimestamp(input.decided_at, 'decided_at');
  if (Date.parse(decidedAt) < Date.parse(submittedAt)) {
    throw new Error('decided_at must not be earlier than submitted_at for expense approval workflow.');
  }
  const expenseRecordRef = requireNonEmpty(input.expense_record_ref, 'expense_record_ref');
  const approvalStepRef = requireNonEmpty(input.approval_step_ref, 'approval_step_ref');
  const decision = requireDecision(input.decision);

  return {
    seed_id: PHASE_6B_EXPENSE_APPROVAL_WORKFLOW_SEED_ID,
    component_id: PHASE_6B_EXPENSE_APPROVAL_WORKFLOW_COMPONENT_ID,
    event_name: EXPENSE_APPROVAL_WORKFLOW_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    expense_record_ref: expenseRecordRef,
    expense_record_digest: requireDigest(input.expense_record_digest),
    requester_person_ref: requireNonEmpty(input.requester_person_ref, 'requester_person_ref'),
    approver_person_ref: requireNonEmpty(input.approver_person_ref, 'approver_person_ref'),
    visual_workflow_builder_ref: requireNonEmpty(input.visual_workflow_builder_ref, 'visual_workflow_builder_ref'),
    approval_workflow_ref: requireNonEmpty(input.approval_workflow_ref, 'approval_workflow_ref'),
    approval_step_ref: approvalStepRef,
    evidence_mode: requireEvidenceMode(input.evidence_mode),
    decision,
    decision_reason: requireNonEmpty(input.decision_reason, 'decision_reason'),
    expense_total_minor: normalizeAmount(input.expense_total_minor),
    currency_code: normalizeCurrency(input.currency_code),
    submitted_at: submittedAt,
    decided_at: decidedAt,
    approval_capability_gated: true,
    approval_evidence_ref: `expense_approval:${expenseRecordRef}:${approvalStepRef}:${decision}`,
    vendor_payment_performed: false,
    payment_allocation_performed: false,
    provider_callback_processed: false,
    gl_posting_performed: false,
    irreversible_action_allowed: false,
  };
}
