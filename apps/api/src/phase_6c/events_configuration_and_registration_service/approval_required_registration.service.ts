import { createHash } from 'node:crypto';

export const PHASE_6C_APPROVAL_REQUIRED_REGISTRATION_SEED_ID = 'seed_6c_104_approval_required_registration' as const;
export const PHASE_6C_APPROVAL_REQUIRED_REGISTRATION_COMPONENT_ID = '6C.08' as const;
export const APPROVAL_REQUIRED_REGISTRATION_RUNTIME_EVENT = 'phase_6c.events_configuration_and_registration_service.approval_required_registration.runtime_evaluated' as const;

export type ApprovalRequiredRegistrationDecision = 'APPROVAL_NOT_REQUIRED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'APPROVAL_REQUIRES_REVIEW';
export type ApprovalActionKind = 'APPROVED' | 'REJECTED';

export type ApprovalActionEvidence = {
  reviewer_ref: string;
  action: ApprovalActionKind;
  action_at: string;
  approval_evidence_ref: string;
  reason_ref?: string;
};

export type ApprovalRequiredRegistrationInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  registration_ref: string;
  attendee_ref: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  submitted_at: string;
  approval_required: boolean;
  approval_policy_ref?: string;
  required_approval_count?: number;
  approval_actions?: readonly ApprovalActionEvidence[];
  control_metadata?: Record<string, unknown>;
  approval_mutation_requested?: boolean;
  registration_creation_requested?: boolean;
  ticket_issue_requested?: boolean;
  notification_send_requested?: boolean;
  payment_capture_requested?: boolean;
  provider_adapter_requested?: boolean;
  persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type ApprovalRequiredRegistrationRuntimeReceipt = {
  seed_id: typeof PHASE_6C_APPROVAL_REQUIRED_REGISTRATION_SEED_ID;
  component_id: typeof PHASE_6C_APPROVAL_REQUIRED_REGISTRATION_COMPONENT_ID;
  component_slug: 'events_configuration_and_registration_service';
  model_name: 'Phase6CApprovalRequiredRegistration';
  event_name: typeof APPROVAL_REQUIRED_REGISTRATION_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  registration_ref: string;
  attendee_ref: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  submitted_at: string;
  approval_required: boolean;
  approval_policy_ref?: string;
  required_approval_count: number;
  approval_count: number;
  rejection_count: number;
  reviewer_refs: readonly string[];
  decision: ApprovalRequiredRegistrationDecision;
  decision_reason: string;
  approval_mutation_performed: false;
  registration_creation_performed: false;
  ticket_issue_performed: false;
  notification_send_performed: false;
  payment_capture_allowed: false;
  provider_adapter_allowed: false;
  persistence_performed: false;
  schema_mutation_performed: false;
  frontend_surface_created: false;
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  approval_required_registration_runtime_digest: string;
};

const DECISION_REFS = ['6C-EVENT-REG-008', '6C-GLOBAL-018'] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for approval_required_registration runtime evaluation.');
  }
  return value.trim();
}

function optionalNonEmpty(value: string | undefined, field: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return requireNonEmpty(value, field);
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for approval_required_registration runtime evaluation.');
  }
  return normalized;
}

function requirePositiveInteger(value: number | undefined, field: string): number {
  if (!Number.isInteger(value) || value === undefined || value <= 0) {
    throw new Error(field + ' must be a positive integer for approval_required_registration runtime evaluation.');
  }
  return value;
}

function assertForbidden(input: ApprovalRequiredRegistrationInput): void {
  const forbidden: Array<[keyof ApprovalRequiredRegistrationInput, string]> = [
    ['approval_mutation_requested', 'approval_required_registration must evaluate approval evidence, not mutate approvals.'],
    ['registration_creation_requested', 'approval_required_registration must not create registrations.'],
    ['ticket_issue_requested', 'approval_required_registration must not issue tickets.'],
    ['notification_send_requested', 'approval_required_registration must not send notifications.'],
    ['payment_capture_requested', 'approval_required_registration must not capture payment.'],
    ['provider_adapter_requested', 'approval_required_registration must not execute provider adapters.'],
    ['persistence_requested', 'approval_required_registration FFET must not persist records.'],
    ['schema_mutation_requested', 'approval_required_registration FFET must not mutate schema.'],
    ['frontend_requested', 'approval_required_registration FFET must not create frontend surfaces.'],
  ];
  for (const [field, message] of forbidden) {
    if (input[field] === true) {
      throw new Error(message);
    }
  }
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonicalize(item)]));
  }
  return value;
}

function digestRuntime(receiptWithoutDigest: Omit<ApprovalRequiredRegistrationRuntimeReceipt, 'approval_required_registration_runtime_digest'>): string {
  return createHash('sha256').update(JSON.stringify(canonicalize(receiptWithoutDigest))).digest('hex');
}

function normalizeActions(actions: readonly ApprovalActionEvidence[] | undefined, submittedAt: string): { approvalCount: number; rejectionCount: number; reviewerRefs: readonly string[]; duplicateReviewer: boolean } {
  const normalizedActions = actions ?? [];
  const reviewers = new Set<string>();
  let duplicateReviewer = false;
  let approvalCount = 0;
  let rejectionCount = 0;

  for (const [index, action] of normalizedActions.entries()) {
    const reviewerRef = requireNonEmpty(action.reviewer_ref, 'approval_actions[' + index + '].reviewer_ref');
    const actionAt = requireTimestamp(action.action_at, 'approval_actions[' + index + '].action_at');
    if (Date.parse(actionAt) < Date.parse(submittedAt)) {
      throw new Error('approval action timestamp must not be before submitted_at.');
    }
    requireNonEmpty(action.approval_evidence_ref, 'approval_actions[' + index + '].approval_evidence_ref');
    optionalNonEmpty(action.reason_ref, 'approval_actions[' + index + '].reason_ref');
    if (reviewers.has(reviewerRef)) {
      duplicateReviewer = true;
    }
    reviewers.add(reviewerRef);
    if (action.action === 'APPROVED') {
      approvalCount += 1;
    }
    if (action.action === 'REJECTED') {
      rejectionCount += 1;
    }
  }

  return { approvalCount, rejectionCount, reviewerRefs: Array.from(reviewers), duplicateReviewer };
}

function deriveDecision(input: ApprovalRequiredRegistrationInput, requiredApprovalCount: number, approvalCount: number, rejectionCount: number, duplicateReviewer: boolean): { decision: ApprovalRequiredRegistrationDecision; reason: string } {
  if (!input.approval_required) {
    return { decision: 'APPROVAL_NOT_REQUIRED', reason: 'registration policy does not require approval' };
  }
  if (!input.approval_policy_ref) {
    return { decision: 'APPROVAL_REQUIRES_REVIEW', reason: 'approval_required registration requires approval_policy_ref' };
  }
  if (duplicateReviewer) {
    return { decision: 'APPROVAL_REQUIRES_REVIEW', reason: 'duplicate reviewer evidence requires review' };
  }
  if (rejectionCount > 0) {
    return { decision: 'REJECTED', reason: 'one or more approval actions rejected the registration' };
  }
  if (approvalCount >= requiredApprovalCount) {
    return { decision: 'APPROVED', reason: 'required approval count has been satisfied' };
  }
  return { decision: 'PENDING_APPROVAL', reason: 'registration is waiting for required approvals' };
}

export function evaluateApprovalRequiredRegistration(input: ApprovalRequiredRegistrationInput): ApprovalRequiredRegistrationRuntimeReceipt {
  assertForbidden(input);
  const submittedAt = requireTimestamp(input.submitted_at, 'submitted_at');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  if (Date.parse(evaluatedAt) < Date.parse(submittedAt)) {
    throw new Error('evaluated_at must not be before submitted_at for approval_required_registration runtime evaluation.');
  }
  const requiredApprovalCount = input.approval_required ? requirePositiveInteger(input.required_approval_count ?? 1, 'required_approval_count') : 0;
  const actions = normalizeActions(input.approval_actions, submittedAt);
  const decision = deriveDecision(input, requiredApprovalCount, actions.approvalCount, actions.rejectionCount, actions.duplicateReviewer);

  const receiptWithoutDigest: Omit<ApprovalRequiredRegistrationRuntimeReceipt, 'approval_required_registration_runtime_digest'> = {
    seed_id: PHASE_6C_APPROVAL_REQUIRED_REGISTRATION_SEED_ID,
    component_id: PHASE_6C_APPROVAL_REQUIRED_REGISTRATION_COMPONENT_ID,
    component_slug: 'events_configuration_and_registration_service',
    model_name: 'Phase6CApprovalRequiredRegistration',
    event_name: APPROVAL_REQUIRED_REGISTRATION_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    event_configuration_id: requireNonEmpty(input.event_configuration_id, 'event_configuration_id'),
    registration_ref: requireNonEmpty(input.registration_ref, 'registration_ref'),
    attendee_ref: requireNonEmpty(input.attendee_ref, 'attendee_ref'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: evaluatedAt,
    submitted_at: submittedAt,
    approval_required: input.approval_required,
    approval_policy_ref: optionalNonEmpty(input.approval_policy_ref, 'approval_policy_ref'),
    required_approval_count: requiredApprovalCount,
    approval_count: actions.approvalCount,
    rejection_count: actions.rejectionCount,
    reviewer_refs: actions.reviewerRefs,
    decision: decision.decision,
    decision_reason: decision.reason,
    approval_mutation_performed: false,
    registration_creation_performed: false,
    ticket_issue_performed: false,
    notification_send_performed: false,
    payment_capture_allowed: false,
    provider_adapter_allowed: false,
    persistence_performed: false,
    schema_mutation_performed: false,
    frontend_surface_created: false,
    decision_refs: DECISION_REFS,
    evidence_artifacts: ['approval_required_registration_runtime_receipt', 'approval_required_registration_validation_result', 'approval_required_registration_forbidden_behavior_rejection_evidence'],
    control_metadata: input.control_metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    approval_required_registration_runtime_digest: digestRuntime(receiptWithoutDigest),
  };
}
