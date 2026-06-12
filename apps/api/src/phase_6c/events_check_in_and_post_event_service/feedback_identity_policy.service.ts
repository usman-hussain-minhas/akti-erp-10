import { createHash } from 'node:crypto';

export const PHASE_6C_FEEDBACK_IDENTITY_POLICY_SEED_ID = 'seed_6c_121_feedback_identity_policy' as const;
export const PHASE_6C_FEEDBACK_IDENTITY_POLICY_COMPONENT_ID = '6C.09' as const;
export const FEEDBACK_IDENTITY_POLICY_RUNTIME_EVENT = 'phase_6c.events_check_in_and_post_event_service.feedback_identity_policy.runtime_evaluated' as const;

export type FeedbackIdentityMode = 'anonymous_allowed' | 'identified_required' | 'mixed_allowed';
export type FeedbackIdentityDecision = 'FEEDBACK_IDENTITY_POLICY_ALLOWED' | 'FEEDBACK_IDENTITY_REQUIRES_IDENTITY' | 'FEEDBACK_IDENTITY_REJECTED_POLICY_CONFLICT' | 'FEEDBACK_IDENTITY_REQUIRES_REVIEW';

export type FeedbackIdentityPolicyInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  form_ref: string;
  source_record_ref: string;
  identity_mode: FeedbackIdentityMode;
  response_is_anonymous: boolean;
  attendee_ref?: string;
  registration_ref?: string;
  crm_lead_ref?: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  response_collection_requested?: boolean;
  identity_persistence_requested?: boolean;
  crm_write_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type FeedbackIdentityPolicyRuntimeReceipt = {
  seed_id: typeof PHASE_6C_FEEDBACK_IDENTITY_POLICY_SEED_ID;
  component_id: typeof PHASE_6C_FEEDBACK_IDENTITY_POLICY_COMPONENT_ID;
  component_slug: 'events_check_in_and_post_event_service';
  model_name: 'Phase6CFeedbackIdentityPolicy';
  event_name: typeof FEEDBACK_IDENTITY_POLICY_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  form_ref: string;
  source_record_ref: string;
  decision: FeedbackIdentityDecision;
  identity_mode: FeedbackIdentityMode;
  response_is_anonymous: boolean;
  attendee_ref: string | null;
  registration_ref: string | null;
  crm_lead_ref: string | null;
  identity_required: boolean;
  crm_handoff_allowed: boolean;
  rejection_reasons: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  decision_refs: readonly string[];
  dependency_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for feedback_identity_policy runtime evaluation.');
  }
  return value.trim();
}

function normalizeOptional(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(field + ' must be non-empty when provided for feedback_identity_policy runtime evaluation.');
  }
  return normalized;
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for feedback_identity_policy runtime evaluation.');
  }
  return normalized;
}

function rejectForbiddenRequests(input: FeedbackIdentityPolicyInput): void {
  const forbidden: Array<[keyof FeedbackIdentityPolicyInput, string]> = [
    ['response_collection_requested', 'feedback_identity_policy must not collect responses.'],
    ['identity_persistence_requested', 'feedback_identity_policy must not persist identity records.'],
    ['crm_write_requested', 'feedback_identity_policy must not write CRM records.'],
    ['schema_mutation_requested', 'feedback_identity_policy must not mutate schema.'],
    ['frontend_requested', 'feedback_identity_policy must not create frontend surfaces.'],
  ];

  for (const [field, message] of forbidden) {
    if (input[field] === true) {
      throw new Error(message);
    }
  }
}

function digestReceipt(receiptWithoutDigest: Omit<FeedbackIdentityPolicyRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateFeedbackIdentityPolicy(input: FeedbackIdentityPolicyInput): FeedbackIdentityPolicyRuntimeReceipt {
  rejectForbiddenRequests(input);

  const attendeeRef = normalizeOptional(input.attendee_ref, 'attendee_ref');
  const registrationRef = normalizeOptional(input.registration_ref, 'registration_ref');
  const crmLeadRef = normalizeOptional(input.crm_lead_ref, 'crm_lead_ref');
  const identityEvidencePresent = attendeeRef !== null || registrationRef !== null || crmLeadRef !== null;
  const reasons: string[] = [];

  if (input.identity_mode === 'identified_required' && input.response_is_anonymous) {
    reasons.push('identified_feedback_required_but_response_is_anonymous');
  }
  if (!input.response_is_anonymous && !identityEvidencePresent) {
    reasons.push('identified_feedback_missing_identity_reference');
  }
  if (input.response_is_anonymous && identityEvidencePresent) {
    reasons.push('anonymous_feedback_must_not_carry_identity_reference');
  }

  const decision: FeedbackIdentityDecision =
    input.identity_mode === 'identified_required' && input.response_is_anonymous
      ? 'FEEDBACK_IDENTITY_REQUIRES_IDENTITY'
      : input.response_is_anonymous && identityEvidencePresent
        ? 'FEEDBACK_IDENTITY_REJECTED_POLICY_CONFLICT'
        : !input.response_is_anonymous && !identityEvidencePresent
          ? 'FEEDBACK_IDENTITY_REQUIRES_REVIEW'
          : 'FEEDBACK_IDENTITY_POLICY_ALLOWED';

  const receiptWithoutDigest: Omit<FeedbackIdentityPolicyRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_FEEDBACK_IDENTITY_POLICY_SEED_ID,
    component_id: PHASE_6C_FEEDBACK_IDENTITY_POLICY_COMPONENT_ID,
    component_slug: 'events_check_in_and_post_event_service',
    model_name: 'Phase6CFeedbackIdentityPolicy',
    event_name: FEEDBACK_IDENTITY_POLICY_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    event_ref: requireNonEmpty(input.event_ref, 'event_ref'),
    form_ref: requireNonEmpty(input.form_ref, 'form_ref'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    decision,
    identity_mode: input.identity_mode,
    response_is_anonymous: input.response_is_anonymous,
    attendee_ref: attendeeRef,
    registration_ref: registrationRef,
    crm_lead_ref: crmLeadRef,
    identity_required: input.identity_mode === 'identified_required',
    crm_handoff_allowed: !input.response_is_anonymous && crmLeadRef !== null && decision === 'FEEDBACK_IDENTITY_POLICY_ALLOWED',
    rejection_reasons: reasons,
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
    decision_refs: ['6C-EVENT-CHECK-011', '6C-EVENT-CHECK-013', '6C-EVENT-CHECK-014'],
    dependency_refs: ['seed_6a_service_manifest_contract', '6C.08'],
    control_metadata: input.control_metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
