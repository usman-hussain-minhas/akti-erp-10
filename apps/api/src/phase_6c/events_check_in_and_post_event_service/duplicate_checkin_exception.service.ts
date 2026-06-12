import { createHash } from 'node:crypto';

export const PHASE_6C_DUPLICATE_CHECKIN_EXCEPTION_SEED_ID = 'seed_6c_117_duplicate_checkin_exception' as const;
export const PHASE_6C_DUPLICATE_CHECKIN_EXCEPTION_COMPONENT_ID = '6C.09' as const;
export const DUPLICATE_CHECKIN_EXCEPTION_RUNTIME_EVENT = 'phase_6c.events_check_in_and_post_event_service.duplicate_checkin_exception.runtime_evaluated' as const;

export type DuplicateCheckinExceptionDecision =
  | 'CHECKIN_ACCEPTED_NO_DUPLICATE'
  | 'DUPLICATE_CHECKIN_BLOCKED'
  | 'DUPLICATE_CHECKIN_REQUIRES_REVIEW'
  | 'DUPLICATE_CHECKIN_CONTEXT_INVALID';

export type DuplicateCheckinScope = 'event' | 'session' | 'ticket';
export type DuplicateCheckinSeverity = 'none' | 'low' | 'medium' | 'high';

export type PriorCheckinEvidence = {
  checkin_ref: string;
  checked_in_at: string;
  checkpoint_ref: string;
  operator_user_id: string;
};

export type DuplicateCheckinExceptionInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_ref: string;
  checkin_scope: DuplicateCheckinScope;
  attempted_checkin_ref: string;
  attempted_at: string;
  attempted_checkpoint_ref: string;
  attempted_operator_user_id: string;
  source_record_ref: string;
  prior_checkins: readonly PriorCheckinEvidence[];
  session_ref?: string;
  allow_manual_review?: boolean;
  control_metadata?: Record<string, unknown>;
  duplicate_persistence_requested?: boolean;
  checkin_record_creation_requested?: boolean;
  ticket_mutation_requested?: boolean;
  attendance_persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type DuplicateCheckinExceptionRuntimeReceipt = {
  seed_id: typeof PHASE_6C_DUPLICATE_CHECKIN_EXCEPTION_SEED_ID;
  component_id: typeof PHASE_6C_DUPLICATE_CHECKIN_EXCEPTION_COMPONENT_ID;
  component_slug: 'events_check_in_and_post_event_service';
  model_name: 'Phase6CDuplicateCheckinException';
  event_name: typeof DUPLICATE_CHECKIN_EXCEPTION_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_ref: string;
  session_ref: string | null;
  source_record_ref: string;
  checkin_scope: DuplicateCheckinScope;
  attempted_checkin_ref: string;
  attempted_at: string;
  attempted_checkpoint_ref: string;
  attempted_operator_user_id: string;
  decision: DuplicateCheckinExceptionDecision;
  duplicate_detected: boolean;
  exception_record_required: boolean;
  manual_review_required: boolean;
  severity: DuplicateCheckinSeverity;
  matched_prior_checkin_refs: readonly string[];
  rejection_reasons: readonly string[];
  decision_refs: readonly string[];
  dependency_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for duplicate_checkin_exception runtime evaluation.');
  }
  return value.trim();
}

function normalizeOptionalRef(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(field + ' must be non-empty when provided for duplicate_checkin_exception runtime evaluation.');
  }
  return normalized;
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for duplicate_checkin_exception runtime evaluation.');
  }
  return normalized;
}

function rejectForbiddenRequests(input: DuplicateCheckinExceptionInput): void {
  const forbidden: Array<[keyof DuplicateCheckinExceptionInput, string]> = [
    ['duplicate_persistence_requested', 'duplicate_checkin_exception must not persist exception records.'],
    ['checkin_record_creation_requested', 'duplicate_checkin_exception must not create check-in records.'],
    ['ticket_mutation_requested', 'duplicate_checkin_exception must not mutate tickets.'],
    ['attendance_persistence_requested', 'duplicate_checkin_exception must not persist attendance.'],
    ['schema_mutation_requested', 'duplicate_checkin_exception must not mutate schema.'],
    ['frontend_requested', 'duplicate_checkin_exception must not create frontend surfaces.'],
  ];

  for (const [field, message] of forbidden) {
    if (input[field] === true) {
      throw new Error(message);
    }
  }
}

function normalizePriorCheckins(priorCheckins: readonly PriorCheckinEvidence[]): PriorCheckinEvidence[] {
  return priorCheckins.map((prior, index) => ({
    checkin_ref: requireNonEmpty(prior.checkin_ref, 'prior_checkins[' + index + '].checkin_ref'),
    checked_in_at: requireTimestamp(prior.checked_in_at, 'prior_checkins[' + index + '].checked_in_at'),
    checkpoint_ref: requireNonEmpty(prior.checkpoint_ref, 'prior_checkins[' + index + '].checkpoint_ref'),
    operator_user_id: requireNonEmpty(prior.operator_user_id, 'prior_checkins[' + index + '].operator_user_id'),
  }));
}

function digestReceipt(receiptWithoutDigest: Omit<DuplicateCheckinExceptionRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function classifyDuplicate(input: {
  attemptedCheckinRef: string;
  attemptedAt: string;
  attemptedCheckpointRef: string;
  priorCheckins: readonly PriorCheckinEvidence[];
  allowManualReview: boolean;
  sessionRef: string | null;
  checkinScope: DuplicateCheckinScope;
}): Pick<DuplicateCheckinExceptionRuntimeReceipt, 'decision' | 'duplicate_detected' | 'exception_record_required' | 'manual_review_required' | 'severity' | 'matched_prior_checkin_refs' | 'rejection_reasons'> {
  const matchedPrior = input.priorCheckins.filter((prior) => prior.checkin_ref !== input.attemptedCheckinRef);
  const sameAttemptRef = input.priorCheckins.some((prior) => prior.checkin_ref === input.attemptedCheckinRef);
  const rejectionReasons: string[] = [];

  if (sameAttemptRef) {
    rejectionReasons.push('attempted_checkin_ref_already_recorded');
  }
  if (input.checkinScope === 'session' && input.sessionRef === null) {
    rejectionReasons.push('session_ref_required_for_session_scope');
  }

  if (rejectionReasons.includes('session_ref_required_for_session_scope')) {
    return {
      decision: 'DUPLICATE_CHECKIN_CONTEXT_INVALID',
      duplicate_detected: false,
      exception_record_required: true,
      manual_review_required: true,
      severity: 'medium',
      matched_prior_checkin_refs: [],
      rejection_reasons: rejectionReasons,
    };
  }

  if (matchedPrior.length === 0 && !sameAttemptRef) {
    return {
      decision: 'CHECKIN_ACCEPTED_NO_DUPLICATE',
      duplicate_detected: false,
      exception_record_required: false,
      manual_review_required: false,
      severity: 'none',
      matched_prior_checkin_refs: [],
      rejection_reasons: [],
    };
  }

  const attemptedTime = Date.parse(input.attemptedAt);
  const priorTimes = matchedPrior.map((prior) => Date.parse(prior.checked_in_at));
  const duplicateAtDifferentCheckpoint = matchedPrior.some((prior) => prior.checkpoint_ref !== input.attemptedCheckpointRef);
  const hasEarlierPrior = priorTimes.some((priorTime) => priorTime <= attemptedTime);
  const severity: DuplicateCheckinSeverity = sameAttemptRef || duplicateAtDifferentCheckpoint ? 'high' : hasEarlierPrior ? 'medium' : 'low';

  if (duplicateAtDifferentCheckpoint) {
    rejectionReasons.push('duplicate_detected_at_different_checkpoint');
  }
  if (matchedPrior.length > 0) {
    rejectionReasons.push('prior_checkin_exists_for_scope');
  }

  return {
    decision: input.allowManualReview ? 'DUPLICATE_CHECKIN_REQUIRES_REVIEW' : 'DUPLICATE_CHECKIN_BLOCKED',
    duplicate_detected: true,
    exception_record_required: true,
    manual_review_required: input.allowManualReview,
    severity,
    matched_prior_checkin_refs: matchedPrior.map((prior) => prior.checkin_ref),
    rejection_reasons: rejectionReasons,
  };
}

export function evaluateDuplicateCheckinException(input: DuplicateCheckinExceptionInput): DuplicateCheckinExceptionRuntimeReceipt {
  rejectForbiddenRequests(input);

  const attemptedAt = requireTimestamp(input.attempted_at, 'attempted_at');
  const attemptedCheckinRef = requireNonEmpty(input.attempted_checkin_ref, 'attempted_checkin_ref');
  const attemptedCheckpointRef = requireNonEmpty(input.attempted_checkpoint_ref, 'attempted_checkpoint_ref');
  const sessionRef = normalizeOptionalRef(input.session_ref, 'session_ref');
  const priorCheckins = normalizePriorCheckins(input.prior_checkins);
  const classification = classifyDuplicate({
    attemptedCheckinRef,
    attemptedAt,
    attemptedCheckpointRef,
    priorCheckins,
    allowManualReview: input.allow_manual_review === true,
    sessionRef,
    checkinScope: input.checkin_scope,
  });

  const receiptWithoutDigest: Omit<DuplicateCheckinExceptionRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_DUPLICATE_CHECKIN_EXCEPTION_SEED_ID,
    component_id: PHASE_6C_DUPLICATE_CHECKIN_EXCEPTION_COMPONENT_ID,
    component_slug: 'events_check_in_and_post_event_service',
    model_name: 'Phase6CDuplicateCheckinException',
    event_name: DUPLICATE_CHECKIN_EXCEPTION_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    event_ref: requireNonEmpty(input.event_ref, 'event_ref'),
    registration_ref: requireNonEmpty(input.registration_ref, 'registration_ref'),
    attendee_ref: requireNonEmpty(input.attendee_ref, 'attendee_ref'),
    ticket_ref: requireNonEmpty(input.ticket_ref, 'ticket_ref'),
    session_ref: sessionRef,
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    checkin_scope: input.checkin_scope,
    attempted_checkin_ref: attemptedCheckinRef,
    attempted_at: attemptedAt,
    attempted_checkpoint_ref: attemptedCheckpointRef,
    attempted_operator_user_id: requireNonEmpty(input.attempted_operator_user_id, 'attempted_operator_user_id'),
    decision: classification.decision,
    duplicate_detected: classification.duplicate_detected,
    exception_record_required: classification.exception_record_required,
    manual_review_required: classification.manual_review_required,
    severity: classification.severity,
    matched_prior_checkin_refs: classification.matched_prior_checkin_refs,
    rejection_reasons: classification.rejection_reasons,
    decision_refs: ['6C-EVENT-CHECK-007', '6C-EVENT-CHECK-014', '6C-EVENT-REG-012'],
    dependency_refs: ['seed_6a_service_manifest_contract', '6C.08'],
    control_metadata: input.control_metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
