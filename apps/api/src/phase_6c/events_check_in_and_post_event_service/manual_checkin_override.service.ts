import { createHash } from 'node:crypto';

export const PHASE_6C_MANUAL_CHECKIN_OVERRIDE_SEED_ID = 'seed_6c_116_manual_checkin_override' as const;
export const PHASE_6C_MANUAL_CHECKIN_OVERRIDE_COMPONENT_ID = '6C.09' as const;
export const MANUAL_CHECKIN_OVERRIDE_RUNTIME_EVENT = 'phase_6c.events_check_in_and_post_event_service.manual_checkin_override.runtime_evaluated' as const;

export type ManualCheckinOverrideDecision =
  | 'MANUAL_OVERRIDE_APPROVED'
  | 'MANUAL_OVERRIDE_REQUIRES_APPROVAL'
  | 'MANUAL_OVERRIDE_REJECTED_ALREADY_CHECKED_IN'
  | 'MANUAL_OVERRIDE_REJECTED_INELIGIBLE_CONTEXT'
  | 'MANUAL_OVERRIDE_REJECTED_REASON_REQUIRED';

export type ManualCheckinOverrideApprovalStatus = 'approved' | 'pending' | 'rejected';
export type ManualCheckinOverrideEligibilityStatus = 'eligible' | 'ineligible' | 'review';

export type ManualCheckinOverrideInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_ref: string;
  session_ref?: string;
  override_reason: string;
  approval_status: ManualCheckinOverrideApprovalStatus;
  approval_ref?: string;
  approved_by_user_id?: string;
  requested_by_user_id: string;
  evaluated_at: string;
  source_record_ref: string;
  eligibility_status?: ManualCheckinOverrideEligibilityStatus;
  existing_checkin_ref?: string;
  control_metadata?: Record<string, unknown>;
  checkin_record_creation_requested?: boolean;
  ticket_mutation_requested?: boolean;
  session_capacity_mutation_requested?: boolean;
  attendance_persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type ManualCheckinOverrideRuntimeReceipt = {
  seed_id: typeof PHASE_6C_MANUAL_CHECKIN_OVERRIDE_SEED_ID;
  component_id: typeof PHASE_6C_MANUAL_CHECKIN_OVERRIDE_COMPONENT_ID;
  component_slug: 'events_check_in_and_post_event_service';
  model_name: 'Phase6CManualCheckinOverride';
  event_name: typeof MANUAL_CHECKIN_OVERRIDE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_ref: string;
  session_ref: string | null;
  source_record_ref: string;
  decision: ManualCheckinOverrideDecision;
  override_reason: string;
  approval_status: ManualCheckinOverrideApprovalStatus;
  approval_ref: string | null;
  approved_by_user_id: string | null;
  requested_by_user_id: string;
  eligibility_status: ManualCheckinOverrideEligibilityStatus;
  existing_checkin_ref: string | null;
  manual_override_allowed: boolean;
  approval_required: boolean;
  rejection_reasons: readonly string[];
  decision_refs: readonly string[];
  dependency_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_at: string;
  runtime_evidence_digest: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for manual_checkin_override runtime evaluation.');
  }
  return value.trim();
}

function normalizeOptionalRef(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(field + ' must be non-empty when provided for manual_checkin_override runtime evaluation.');
  }
  return normalized;
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for manual_checkin_override runtime evaluation.');
  }
  return normalized;
}

function rejectForbiddenRequests(input: ManualCheckinOverrideInput): void {
  const forbidden: Array<[keyof ManualCheckinOverrideInput, string]> = [
    ['checkin_record_creation_requested', 'manual_checkin_override must not create check-in records.'],
    ['ticket_mutation_requested', 'manual_checkin_override must not mutate tickets.'],
    ['session_capacity_mutation_requested', 'manual_checkin_override must not mutate session capacity.'],
    ['attendance_persistence_requested', 'manual_checkin_override must not persist attendance.'],
    ['schema_mutation_requested', 'manual_checkin_override must not mutate schema.'],
    ['frontend_requested', 'manual_checkin_override must not create frontend surfaces.'],
  ];

  for (const [field, message] of forbidden) {
    if (input[field] === true) {
      throw new Error(message);
    }
  }
}

function digestReceipt(receiptWithoutDigest: Omit<ManualCheckinOverrideRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function decideManualOverride(input: {
  override_reason: string;
  approval_status: ManualCheckinOverrideApprovalStatus;
  approval_ref: string | null;
  approved_by_user_id: string | null;
  eligibility_status: ManualCheckinOverrideEligibilityStatus;
  existing_checkin_ref: string | null;
}): Pick<ManualCheckinOverrideRuntimeReceipt, 'decision' | 'manual_override_allowed' | 'approval_required' | 'rejection_reasons'> {
  const rejectionReasons: string[] = [];

  if (input.override_reason.trim().length < 12) {
    rejectionReasons.push('override_reason_minimum_length_not_met');
  }
  if (input.existing_checkin_ref !== null) {
    rejectionReasons.push('attendee_already_checked_in_for_scope');
  }
  if (input.eligibility_status === 'ineligible') {
    rejectionReasons.push('registration_or_ticket_context_ineligible');
  }
  if (input.approval_status === 'rejected') {
    rejectionReasons.push('manual_override_approval_rejected');
  }
  if (input.approval_status === 'approved' && (input.approval_ref === null || input.approved_by_user_id === null)) {
    rejectionReasons.push('approval_ref_and_approver_required_when_approved');
  }

  if (input.override_reason.trim().length < 12) {
    return {
      decision: 'MANUAL_OVERRIDE_REJECTED_REASON_REQUIRED',
      manual_override_allowed: false,
      approval_required: true,
      rejection_reasons: rejectionReasons,
    };
  }
  if (input.existing_checkin_ref !== null) {
    return {
      decision: 'MANUAL_OVERRIDE_REJECTED_ALREADY_CHECKED_IN',
      manual_override_allowed: false,
      approval_required: false,
      rejection_reasons: rejectionReasons,
    };
  }
  if (input.eligibility_status === 'ineligible' || input.approval_status === 'rejected') {
    return {
      decision: 'MANUAL_OVERRIDE_REJECTED_INELIGIBLE_CONTEXT',
      manual_override_allowed: false,
      approval_required: input.approval_status !== 'rejected',
      rejection_reasons: rejectionReasons,
    };
  }
  if (input.approval_status !== 'approved' || input.approval_ref === null || input.approved_by_user_id === null || input.eligibility_status === 'review') {
    return {
      decision: 'MANUAL_OVERRIDE_REQUIRES_APPROVAL',
      manual_override_allowed: false,
      approval_required: true,
      rejection_reasons: rejectionReasons,
    };
  }

  return {
    decision: 'MANUAL_OVERRIDE_APPROVED',
    manual_override_allowed: true,
    approval_required: false,
    rejection_reasons: [],
  };
}

export function evaluateManualCheckinOverride(input: ManualCheckinOverrideInput): ManualCheckinOverrideRuntimeReceipt {
  rejectForbiddenRequests(input);

  const overrideReason = requireNonEmpty(input.override_reason, 'override_reason');
  const approvalRef = normalizeOptionalRef(input.approval_ref, 'approval_ref');
  const approvedByUserId = normalizeOptionalRef(input.approved_by_user_id, 'approved_by_user_id');
  const eligibilityStatus = input.eligibility_status ?? 'eligible';
  const existingCheckinRef = normalizeOptionalRef(input.existing_checkin_ref, 'existing_checkin_ref');

  const decision = decideManualOverride({
    override_reason: overrideReason,
    approval_status: input.approval_status,
    approval_ref: approvalRef,
    approved_by_user_id: approvedByUserId,
    eligibility_status: eligibilityStatus,
    existing_checkin_ref: existingCheckinRef,
  });

  const receiptWithoutDigest: Omit<ManualCheckinOverrideRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_MANUAL_CHECKIN_OVERRIDE_SEED_ID,
    component_id: PHASE_6C_MANUAL_CHECKIN_OVERRIDE_COMPONENT_ID,
    component_slug: 'events_check_in_and_post_event_service',
    model_name: 'Phase6CManualCheckinOverride',
    event_name: MANUAL_CHECKIN_OVERRIDE_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    event_ref: requireNonEmpty(input.event_ref, 'event_ref'),
    registration_ref: requireNonEmpty(input.registration_ref, 'registration_ref'),
    attendee_ref: requireNonEmpty(input.attendee_ref, 'attendee_ref'),
    ticket_ref: requireNonEmpty(input.ticket_ref, 'ticket_ref'),
    session_ref: normalizeOptionalRef(input.session_ref, 'session_ref'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    decision: decision.decision,
    override_reason: overrideReason,
    approval_status: input.approval_status,
    approval_ref: approvalRef,
    approved_by_user_id: approvedByUserId,
    requested_by_user_id: requireNonEmpty(input.requested_by_user_id, 'requested_by_user_id'),
    eligibility_status: eligibilityStatus,
    existing_checkin_ref: existingCheckinRef,
    manual_override_allowed: decision.manual_override_allowed,
    approval_required: decision.approval_required,
    rejection_reasons: decision.rejection_reasons,
    decision_refs: ['6C-EVENT-CHECK-006', '6C-EVENT-CHECK-014', '6C-EVENT-REG-012'],
    dependency_refs: ['seed_6a_service_manifest_contract', '6C.08'],
    control_metadata: input.control_metadata ?? {},
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
