import { createHash } from 'node:crypto';

export const PHASE_6C_REGISTRATION_ATTEMPT_EVIDENCE_SEED_ID = "seed_6c_109_registration_attempt_evidence" as const;
export const PHASE_6C_REGISTRATION_ATTEMPT_EVIDENCE_COMPONENT_ID = "6C.08" as const;
export const REGISTRATION_ATTEMPT_EVIDENCE_RUNTIME_EVENT = "phase_6c.events_configuration_and_registration_service.registration_attempt_evidence.runtime_evaluated" as const;

type RegistrationAttemptOutcome =
  | 'registration_created'
  | 'approval_pending'
  | 'payment_pending'
  | 'waitlisted'
  | 'capacity_blocked'
  | 'validation_rejected'
  | 'duplicate_rejected'
  | 'system_rejected';

export type RegistrationAttemptEvidenceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  attempt_ref: string;
  event_config_ref: string;
  attendee_ref: string;
  ticket_type_ref: string;
  source_record_ref: string;
  attempted_at: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  outcome: RegistrationAttemptOutcome;
  registration_ref?: string;
  approval_ref?: string;
  payment_saga_ref?: string;
  waitlist_ref?: string;
  capacity_snapshot_ref?: string;
  product_catalogue_anchor_ref?: string;
  crm_handoff_ref?: string;
  workspace_calendar_ref?: string;
  rejection_code?: string;
  rejection_reason?: string;
  control_metadata?: Record<string, unknown>;
  registration_mutation_requested?: boolean;
  payment_capture_requested?: boolean;
  waitlist_mutation_requested?: boolean;
  approval_mutation_requested?: boolean;
  evidence_persistence_requested?: boolean;
  event_publish_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type RegistrationAttemptEvidenceRuntimeReceipt = {
  seed_id: typeof PHASE_6C_REGISTRATION_ATTEMPT_EVIDENCE_SEED_ID;
  component_id: typeof PHASE_6C_REGISTRATION_ATTEMPT_EVIDENCE_COMPONENT_ID;
  component_slug: "events_configuration_and_registration_service";
  model_name: "Phase6CRegistrationAttemptEvidence";
  event_name: typeof REGISTRATION_ATTEMPT_EVIDENCE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  attempt_ref: string;
  event_config_ref: string;
  attendee_ref: string;
  ticket_type_ref: string;
  source_record_ref: string;
  attempted_at: string;
  outcome: RegistrationAttemptOutcome;
  registration_ref: string | null;
  approval_ref: string | null;
  payment_saga_ref: string | null;
  waitlist_ref: string | null;
  capacity_snapshot_ref: string | null;
  rejection_code: string | null;
  rejection_reason: string | null;
  dependency_trace: {
    service_manifest_contract: string;
    product_catalogue_anchor_ref: string | null;
    crm_handoff_ref: string | null;
    workspace_calendar_ref: string | null;
  };
  decision_refs: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  runtime_evidence_digest: string;
};

const rejectedOutcomes = new Set<RegistrationAttemptOutcome>(['capacity_blocked', 'validation_rejected', 'duplicate_rejected', 'system_rejected']);

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for registration_attempt_evidence runtime evaluation.');
  }
  return value.trim();
}

function optionalRef(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(field + ' must be non-empty when provided for registration_attempt_evidence.');
  }
  return normalized;
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for registration_attempt_evidence.');
  }
  return normalized;
}

function assertForbiddenRequests(input: RegistrationAttemptEvidenceInput): readonly string[] {
  const rejections = [
    ['registration_mutation_requested', input.registration_mutation_requested, 'registration mutation is outside evidence capture'],
    ['payment_capture_requested', input.payment_capture_requested, 'payment capture is Saga-owned and outside this evidence seed'],
    ['waitlist_mutation_requested', input.waitlist_mutation_requested, 'waitlist mutation is outside evidence capture'],
    ['approval_mutation_requested', input.approval_mutation_requested, 'approval mutation is outside evidence capture'],
    ['evidence_persistence_requested', input.evidence_persistence_requested, 'persistence is outside the exact FFET scope'],
    ['event_publish_requested', input.event_publish_requested, 'event publication is deferred to runtime wiring'],
    ['schema_mutation_requested', input.schema_mutation_requested, 'schema mutation is forbidden for this runtime FFET'],
    ['frontend_requested', input.frontend_requested, 'frontend creation is outside the exact FFET scope'],
  ] as const;

  for (const [field, requested, message] of rejections) {
    if (requested === true) {
      throw new Error(field + ': ' + message + '.');
    }
  }

  return rejections.map(([field, , message]) => field + ': ' + message);
}

function validateOutcomeRefs(input: RegistrationAttemptEvidenceInput): void {
  if (input.outcome === 'registration_created' && optionalRef(input.registration_ref, 'registration_ref') === null) {
    throw new Error('registration_ref is required when registration_attempt_evidence outcome is registration_created.');
  }
  if (input.outcome === 'approval_pending' && optionalRef(input.approval_ref, 'approval_ref') === null) {
    throw new Error('approval_ref is required when registration_attempt_evidence outcome is approval_pending.');
  }
  if (input.outcome === 'payment_pending' && optionalRef(input.payment_saga_ref, 'payment_saga_ref') === null) {
    throw new Error('payment_saga_ref is required when registration_attempt_evidence outcome is payment_pending.');
  }
  if (input.outcome === 'waitlisted' && optionalRef(input.waitlist_ref, 'waitlist_ref') === null) {
    throw new Error('waitlist_ref is required when registration_attempt_evidence outcome is waitlisted.');
  }
  if (rejectedOutcomes.has(input.outcome) && optionalRef(input.rejection_code, 'rejection_code') === null) {
    throw new Error('rejection_code is required for rejected registration_attempt_evidence outcomes.');
  }
}

function digestRuntime(receiptWithoutDigest: Omit<RegistrationAttemptEvidenceRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateRegistrationAttemptEvidence(input: RegistrationAttemptEvidenceInput): RegistrationAttemptEvidenceRuntimeReceipt {
  const forbiddenBehaviorRejections = assertForbiddenRequests(input);
  validateOutcomeRefs(input);
  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContract = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');

  const receiptWithoutDigest: Omit<RegistrationAttemptEvidenceRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_REGISTRATION_ATTEMPT_EVIDENCE_SEED_ID,
    component_id: PHASE_6C_REGISTRATION_ATTEMPT_EVIDENCE_COMPONENT_ID,
    component_slug: "events_configuration_and_registration_service",
    model_name: "Phase6CRegistrationAttemptEvidence",
    event_name: REGISTRATION_ATTEMPT_EVIDENCE_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContract,
    attempt_ref: requireNonEmpty(input.attempt_ref, 'attempt_ref'),
    event_config_ref: requireNonEmpty(input.event_config_ref, 'event_config_ref'),
    attendee_ref: requireNonEmpty(input.attendee_ref, 'attendee_ref'),
    ticket_type_ref: requireNonEmpty(input.ticket_type_ref, 'ticket_type_ref'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    attempted_at: requireTimestamp(input.attempted_at, 'attempted_at'),
    outcome: input.outcome,
    registration_ref: optionalRef(input.registration_ref, 'registration_ref'),
    approval_ref: optionalRef(input.approval_ref, 'approval_ref'),
    payment_saga_ref: optionalRef(input.payment_saga_ref, 'payment_saga_ref'),
    waitlist_ref: optionalRef(input.waitlist_ref, 'waitlist_ref'),
    capacity_snapshot_ref: optionalRef(input.capacity_snapshot_ref, 'capacity_snapshot_ref'),
    rejection_code: optionalRef(input.rejection_code, 'rejection_code'),
    rejection_reason: optionalRef(input.rejection_reason, 'rejection_reason'),
    dependency_trace: {
      service_manifest_contract: serviceManifestContract,
      product_catalogue_anchor_ref: optionalRef(input.product_catalogue_anchor_ref, 'product_catalogue_anchor_ref'),
      crm_handoff_ref: optionalRef(input.crm_handoff_ref, 'crm_handoff_ref'),
      workspace_calendar_ref: optionalRef(input.workspace_calendar_ref, 'workspace_calendar_ref'),
    },
    decision_refs: ["6C-EVENT-REG-018", "6C-EVENT-REG-002", "6C-EVENT-REG-003", "6C-EVENT-REG-012", "6C-EVENT-REG-009", "ADL-001"],
    forbidden_behavior_rejections: forbiddenBehaviorRejections,
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestRuntime(receiptWithoutDigest),
  };
}
