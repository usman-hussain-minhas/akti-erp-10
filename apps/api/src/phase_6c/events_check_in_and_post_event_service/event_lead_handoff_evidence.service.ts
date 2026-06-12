import { createHash } from 'node:crypto';

export const PHASE_6C_EVENT_LEAD_HANDOFF_EVIDENCE_SEED_ID = "seed_6c_123_event_lead_handoff_evidence" as const;
export const PHASE_6C_EVENT_LEAD_HANDOFF_EVIDENCE_COMPONENT_ID = "6C.09" as const;
export const EVENT_LEAD_HANDOFF_EVIDENCE_RUNTIME_EVENT = "phase_6c.events_check_in_and_post_event_service.event_lead_handoff_evidence.runtime_evaluated" as const;

export type EventLeadHandoffSource = "registration" | "check_in" | "feedback" | "attendee_update";
export type EventLeadHandoffDecision =
  | "HANDOFF_EVIDENCE_READY"
  | "HANDOFF_EVIDENCE_REVIEW_REQUIRED"
  | "HANDOFF_EVIDENCE_REJECTED";
export type EventLeadHandoffIdentityPolicy = "identified" | "pseudonymous" | "anonymous";

export type EventLeadHandoffEvidenceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  handoff_source: EventLeadHandoffSource;
  identity_policy: EventLeadHandoffIdentityPolicy;
  attendee_ref?: string;
  registration_ref?: string;
  feedback_ref?: string;
  person_ref?: string;
  crm_lead_ref?: string;
  contact_ref?: string;
  handoff_reason: string;
  consent_basis_ref?: string;
  evidence_payload?: Record<string, string | number | boolean>;
  direct_crm_write_requested?: boolean;
  outbound_communication_requested?: boolean;
  provider_adapter_requested?: boolean;
};

export type EventLeadHandoffEvidenceReceipt = {
  seed_id: typeof PHASE_6C_EVENT_LEAD_HANDOFF_EVIDENCE_SEED_ID;
  component_id: typeof PHASE_6C_EVENT_LEAD_HANDOFF_EVIDENCE_COMPONENT_ID;
  component_slug: "events_check_in_and_post_event_service";
  model_name: "Phase6CEventLeadHandoffEvidence";
  event_name: typeof EVENT_LEAD_HANDOFF_EVIDENCE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  source_record_ref: string;
  handoff_source: EventLeadHandoffSource;
  identity_policy: EventLeadHandoffIdentityPolicy;
  decision: EventLeadHandoffDecision;
  crm_handoff_target_component: "6B.06";
  crm_handoff_mode: "EVENT_REF_ONLY_NO_DIRECT_WRITE";
  direct_crm_write_performed: false;
  outbound_communication_performed: false;
  provider_adapter_invoked: false;
  lead_identity_refs: readonly string[];
  source_refs: readonly string[];
  review_reasons: readonly string[];
  rejection_reasons: readonly string[];
  handoff_reason: string;
  consent_basis_ref?: string;
  evidence_payload: Record<string, string | number | boolean>;
  decision_refs: readonly string[];
  runtime_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};

const HANDOFF_SOURCES = new Set<EventLeadHandoffSource>(["registration", "check_in", "feedback", "attendee_update"]);
const IDENTITY_POLICIES = new Set<EventLeadHandoffIdentityPolicy>(["identified", "pseudonymous", "anonymous"]);
const MAX_PAYLOAD_KEYS = 12;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for event lead handoff evidence.');
  }
  return value.trim();
}

function optionalNonEmpty(value: string | undefined, field: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(field + ' cannot be blank for event lead handoff evidence.');
  }
  return normalized;
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for event lead handoff evidence.');
  }
  return normalized;
}

function requireEnum<T extends string>(value: T | undefined, values: Set<T>, field: string): T {
  const normalized = requireNonEmpty(value, field) as T;
  if (!values.has(normalized)) {
    throw new Error(field + ' is not supported for event lead handoff evidence.');
  }
  return normalized;
}

function normalizePayload(payload: Record<string, string | number | boolean> | undefined): Record<string, string | number | boolean> {
  if (payload === undefined) {
    return {};
  }

  const entries = Object.entries(payload).sort(([a], [b]) => a.localeCompare(b));
  if (entries.length > MAX_PAYLOAD_KEYS) {
    throw new Error('evidence_payload exceeds the maximum supported event lead handoff evidence key count.');
  }

  return Object.fromEntries(entries.map(([key, value]) => {
    const normalizedKey = requireNonEmpty(key, 'evidence_payload key');
    if (!['string', 'number', 'boolean'].includes(typeof value) || (typeof value === 'number' && !Number.isFinite(value))) {
      throw new Error('evidence_payload values must be finite primitive values for event lead handoff evidence.');
    }
    return [normalizedKey, value];
  }));
}

function uniqueSorted(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => value !== undefined))).sort();
}

function digestReceipt(receiptWithoutDigest: Omit<EventLeadHandoffEvidenceReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function assertForbiddenRuntimeRequests(input: EventLeadHandoffEvidenceInput): void {
  if (input.direct_crm_write_requested === true) {
    throw new Error('event lead handoff evidence must emit event/ref evidence only and must not write CRM directly.');
  }
  if (input.outbound_communication_requested === true) {
    throw new Error('event lead handoff evidence must not send outbound communications.');
  }
  if (input.provider_adapter_requested === true) {
    throw new Error('event lead handoff evidence must not invoke provider adapters.');
  }
}

export function evaluateEventLeadHandoffEvidence(input: EventLeadHandoffEvidenceInput): EventLeadHandoffEvidenceReceipt {
  assertForbiddenRuntimeRequests(input);

  const handoffSource = requireEnum(input.handoff_source, HANDOFF_SOURCES, 'handoff_source');
  const identityPolicy = requireEnum(input.identity_policy, IDENTITY_POLICIES, 'identity_policy');
  const leadIdentityRefs = uniqueSorted([
    optionalNonEmpty(input.person_ref, 'person_ref'),
    optionalNonEmpty(input.crm_lead_ref, 'crm_lead_ref'),
    optionalNonEmpty(input.contact_ref, 'contact_ref'),
  ]);
  const sourceRefs = uniqueSorted([
    optionalNonEmpty(input.attendee_ref, 'attendee_ref'),
    optionalNonEmpty(input.registration_ref, 'registration_ref'),
    optionalNonEmpty(input.feedback_ref, 'feedback_ref'),
  ]);

  const reviewReasons: string[] = [];
  const rejectionReasons: string[] = [];

  if (sourceRefs.length === 0) {
    rejectionReasons.push('EVENT_LEAD_HANDOFF_SOURCE_REF_REQUIRED');
  }
  if (leadIdentityRefs.length === 0) {
    rejectionReasons.push('EVENT_LEAD_HANDOFF_IDENTITY_OR_CONTACT_REF_REQUIRED');
  }
  if (identityPolicy === 'anonymous') {
    rejectionReasons.push('ANONYMOUS_FEEDBACK_CANNOT_CREATE_LEAD_HANDOFF');
  }
  if (identityPolicy === 'pseudonymous') {
    reviewReasons.push('PSEUDONYMOUS_IDENTITY_REQUIRES_CRM_HANDLER_REVIEW');
  }
  if (handoffSource === 'feedback' && input.feedback_ref === undefined) {
    reviewReasons.push('FEEDBACK_HANDOFF_WITHOUT_FEEDBACK_REF_REQUIRES_REVIEW');
  }
  if (input.consent_basis_ref === undefined) {
    reviewReasons.push('CONSENT_BASIS_REF_NOT_PROVIDED');
  }

  const decision: EventLeadHandoffDecision = rejectionReasons.length > 0
    ? 'HANDOFF_EVIDENCE_REJECTED'
    : reviewReasons.length > 0
      ? 'HANDOFF_EVIDENCE_REVIEW_REQUIRED'
      : 'HANDOFF_EVIDENCE_READY';

  const receiptWithoutDigest: Omit<EventLeadHandoffEvidenceReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_EVENT_LEAD_HANDOFF_EVIDENCE_SEED_ID,
    component_id: PHASE_6C_EVENT_LEAD_HANDOFF_EVIDENCE_COMPONENT_ID,
    component_slug: "events_check_in_and_post_event_service",
    model_name: "Phase6CEventLeadHandoffEvidence",
    event_name: EVENT_LEAD_HANDOFF_EVIDENCE_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    event_ref: requireNonEmpty(input.event_ref, 'event_ref'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    handoff_source: handoffSource,
    identity_policy: identityPolicy,
    decision,
    crm_handoff_target_component: '6B.06',
    crm_handoff_mode: 'EVENT_REF_ONLY_NO_DIRECT_WRITE',
    direct_crm_write_performed: false,
    outbound_communication_performed: false,
    provider_adapter_invoked: false,
    lead_identity_refs: leadIdentityRefs,
    source_refs: sourceRefs,
    review_reasons: reviewReasons.sort(),
    rejection_reasons: rejectionReasons.sort(),
    handoff_reason: requireNonEmpty(input.handoff_reason, 'handoff_reason'),
    consent_basis_ref: optionalNonEmpty(input.consent_basis_ref, 'consent_basis_ref'),
    evidence_payload: normalizePayload(input.evidence_payload),
    decision_refs: ["6C-EVENT-CHECK-013", "6C-EVENT-REG-012", "6C-GLOBAL-018", "6C-API-008"],
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
