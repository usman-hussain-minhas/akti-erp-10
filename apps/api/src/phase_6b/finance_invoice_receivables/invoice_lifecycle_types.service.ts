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

const STATUSES: readonly InvoiceLifecycleStatus[] = ['DRAFT', 'ISSUED', 'CANCELLED_BEFORE_ISSUE'] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for invoice lifecycle types.`);
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for invoice lifecycle types.`);
  }
  return normalized;
}

function normalizeStatus(value: InvoiceLifecycleStatus, field: string): InvoiceLifecycleStatus {
  if (!STATUSES.includes(value)) {
    throw new Error(`${field} is not supported for invoice lifecycle types.`);
  }
  return value;
}

function transitionKind(current: InvoiceLifecycleStatus, requested: InvoiceLifecycleStatus): InvoiceLifecycleTransitionKind {
  if (current === requested) return 'NO_OP_CURRENT_STATE';
  if (current === 'DRAFT' && requested === 'ISSUED') return 'DRAFT_TO_ISSUED';
  if (current === 'DRAFT' && requested === 'CANCELLED_BEFORE_ISSUE') return 'DRAFT_TO_CANCELLED_BEFORE_ISSUE';
  if (current === 'ISSUED') {
    throw new Error('issued invoices are immutable; use credit or debit note flow for changes.');
  }
  throw new Error('requested invoice lifecycle transition is not allowed.');
}

export function authorizeInvoiceLifecycleTransition(input: InvoiceLifecycleTransitionInput): InvoiceLifecycleTransitionReceipt {
  if (input.mutate_issued_invoice_requested === true) {
    throw new Error('invoice lifecycle types must not mutate issued invoices.');
  }
  if (input.credit_note_creation_requested === true) {
    throw new Error('invoice lifecycle types must not create credit or debit notes.');
  }
  if (input.payment_allocation_requested === true) {
    throw new Error('invoice lifecycle types must not perform payment allocation math.');
  }
  if (input.invoice_send_requested === true) {
    throw new Error('invoice lifecycle types must not send invoices.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('invoice lifecycle types must not perform irreversible actions.');
  }

  const currentStatus = normalizeStatus(input.current_status, 'current_status');
  const requestedStatus = normalizeStatus(input.requested_status, 'requested_status');
  const kind = transitionKind(currentStatus, requestedStatus);
  const issuedAt = requestedStatus === 'ISSUED' ? requireTimestamp(input.issued_at, 'issued_at') : undefined;
  if (requestedStatus !== 'ISSUED' && input.issued_at !== undefined) {
    throw new Error('issued_at is allowed only when requested_status is ISSUED for invoice lifecycle types.');
  }

  return {
    seed_id: PHASE_6B_INVOICE_LIFECYCLE_TYPES_SEED_ID,
    component_id: PHASE_6B_INVOICE_LIFECYCLE_TYPES_COMPONENT_ID,
    event_name: INVOICE_LIFECYCLE_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    invoice_id: requireNonEmpty(input.invoice_id, 'invoice_id'),
    invoice_record_authority_ref: requireNonEmpty(input.invoice_record_authority_ref, 'invoice_record_authority_ref'),
    product_record_authority_ref: requireNonEmpty(input.product_record_authority_ref, 'product_record_authority_ref'),
    product_price_history_ref: requireNonEmpty(input.product_price_history_ref, 'product_price_history_ref'),
    pricing_table_effective_date_ref: requireNonEmpty(input.pricing_table_effective_date_ref, 'pricing_table_effective_date_ref'),
    pipeline_stage_model_ref: requireNonEmpty(input.pipeline_stage_model_ref, 'pipeline_stage_model_ref'),
    visual_workflow_builder_ref: requireNonEmpty(input.visual_workflow_builder_ref, 'visual_workflow_builder_ref'),
    current_status: currentStatus,
    requested_status: requestedStatus,
    transition_kind: kind,
    transition_reason: requireNonEmpty(input.transition_reason, 'transition_reason'),
    issued_at: issuedAt,
    immutable_after_issue: requestedStatus === 'ISSUED' || currentStatus === 'ISSUED',
    post_issue_change_policy: 'CREDIT_OR_DEBIT_NOTE_REQUIRED',
    mutate_issued_invoice_allowed: false,
    credit_note_creation_allowed: false,
    payment_allocation_allowed: false,
    invoice_send_allowed: false,
    irreversible_action_allowed: false,
    transitioned_by_user_id: requireNonEmpty(input.transitioned_by_user_id, 'transitioned_by_user_id'),
    transitioned_at: requireTimestamp(input.transitioned_at, 'transitioned_at'),
  };
}
