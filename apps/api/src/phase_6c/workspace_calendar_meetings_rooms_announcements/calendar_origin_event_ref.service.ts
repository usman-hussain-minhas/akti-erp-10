import { createHash } from 'node:crypto';

export const PHASE_6C_CALENDAR_ORIGIN_EVENT_REF_SEED_ID = 'seed_6c_092_calendar_origin_event_ref' as const;
export const PHASE_6C_CALENDAR_ORIGIN_EVENT_REF_COMPONENT_ID = '6C.07' as const;
export const CALENDAR_ORIGIN_EVENT_REF_RUNTIME_EVENT = 'phase_6c.workspace_calendar_meetings_rooms_announcements.calendar_origin_event_ref.runtime_evaluated' as const;

export const CALENDAR_ORIGIN_EVENT_REF_DECISION_REFS = ['6C-CAL-010', '6C-GLOBAL-018'] as const;

export type CalendarOriginSystem = 'HR' | 'TASKS' | 'EVENTS' | 'LMS';
export type CalendarOriginReferenceMode = 'EVENT_REFERENCE_ONLY';
export type CalendarOriginReferenceDecision = 'ACCEPTED_EVENT_REFERENCE';

export type CalendarOriginEventRefInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  calendar_event_ref: string;
  source_record_ref: string;
  requested_by_user_id: string;
  evaluated_at: string;
  origin_system: CalendarOriginSystem;
  origin_component_ref: string;
  origin_event_id: string;
  origin_event_type: string;
  origin_entity_ref: string;
  origin_occurred_at: string;
  correlation_id: string;
  source_event_payload_hash: string;
  calendar_write_requested?: boolean;
  origin_mutation_requested?: boolean;
  direct_cross_module_query_requested?: boolean;
  provider_sync_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type NormalizedCalendarOriginEventRef = {
  origin_ref_id: string;
  reference_mode: CalendarOriginReferenceMode;
  origin_system: CalendarOriginSystem;
  origin_component_ref: string;
  origin_event_id: string;
  origin_event_type: string;
  origin_entity_ref: string;
  origin_occurred_at: string;
  correlation_id: string;
  source_event_payload_hash: string;
};

export type CalendarOriginEventRefReceipt = {
  seed_id: typeof PHASE_6C_CALENDAR_ORIGIN_EVENT_REF_SEED_ID;
  component_id: typeof PHASE_6C_CALENDAR_ORIGIN_EVENT_REF_COMPONENT_ID;
  component_slug: 'workspace_calendar_meetings_rooms_announcements';
  model_name: 'Phase6CCalendarOriginEventRef';
  event_name: typeof CALENDAR_ORIGIN_EVENT_REF_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  calendar_event_ref: string;
  source_record_ref: string;
  decision: CalendarOriginReferenceDecision;
  normalized_origin_ref: NormalizedCalendarOriginEventRef;
  refs_events_only: true;
  calendar_write_executed: false;
  origin_mutation_executed: false;
  direct_cross_module_query_executed: false;
  provider_sync_executed: false;
  runtime_adapter_executed: false;
  persistence_executed: false;
  required_evidence_artifacts: readonly string[];
  decision_refs: typeof CALENDAR_ORIGIN_EVENT_REF_DECISION_REFS;
  requested_by_user_id: string;
  evaluated_at: string;
  runtime_evidence_digest: string;
};

const ALLOWED_ORIGINS = new Set<CalendarOriginSystem>(['HR', 'TASKS', 'EVENTS', 'LMS']);
const HASH_RE = /^[a-f0-9]{64}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for calendar origin event reference evaluation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for calendar origin event reference evaluation.');
  }
  return normalized;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return '[' + value.map((item) => stableStringify(item)).join(',') + ']';
  }
  if (value && typeof value === 'object') {
    return '{' + Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => JSON.stringify(key) + ':' + stableStringify(nested))
      .join(',') + '}';
  }
  return JSON.stringify(value);
}

function digest(value: unknown): string {
  return createHash('sha256').update(stableStringify(value)).digest('hex');
}

function normalizeHash(value: string | undefined): string {
  const normalized = requireNonEmpty(value, 'source_event_payload_hash').toLowerCase();
  if (!HASH_RE.test(normalized)) {
    throw new Error('source_event_payload_hash must be a lowercase sha256 hex digest.');
  }
  return normalized;
}

export function evaluateCalendarOriginEventRef(input: CalendarOriginEventRefInput): CalendarOriginEventRefReceipt {
  if (input.calendar_write_requested === true) {
    throw new Error('calendar_origin_event_ref must not write calendar events inside this FFET.');
  }
  if (input.origin_mutation_requested === true) {
    throw new Error('calendar_origin_event_ref must not mutate origin systems inside this FFET.');
  }
  if (input.direct_cross_module_query_requested === true) {
    throw new Error('calendar_origin_event_ref must not execute direct cross-module queries inside this FFET.');
  }
  if (input.provider_sync_requested === true) {
    throw new Error('calendar_origin_event_ref must not execute provider sync inside this FFET.');
  }
  if (input.persistence_requested === true) {
    throw new Error('calendar_origin_event_ref must not persist origin reference state inside this FFET.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('calendar_origin_event_ref must not execute runtime adapters inside this FFET.');
  }

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const calendarEventRef = requireNonEmpty(input.calendar_event_ref, 'calendar_event_ref');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const requestedByUserId = requireNonEmpty(input.requested_by_user_id, 'requested_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const originSystem = input.origin_system;
  if (!ALLOWED_ORIGINS.has(originSystem)) {
    throw new Error('origin_system contains unsupported value ' + String(originSystem) + '.');
  }

  const originComponentRef = requireNonEmpty(input.origin_component_ref, 'origin_component_ref');
  const originEventId = requireNonEmpty(input.origin_event_id, 'origin_event_id');
  const originEventType = requireNonEmpty(input.origin_event_type, 'origin_event_type');
  const originEntityRef = requireNonEmpty(input.origin_entity_ref, 'origin_entity_ref');
  const originOccurredAt = requireTimestamp(input.origin_occurred_at, 'origin_occurred_at');
  const correlationId = requireNonEmpty(input.correlation_id, 'correlation_id');
  const sourceEventPayloadHash = normalizeHash(input.source_event_payload_hash);

  const normalizedOriginRef: NormalizedCalendarOriginEventRef = {
    origin_ref_id: digest({ calendarEventRef, correlationId, originEventId, originSystem }),
    reference_mode: 'EVENT_REFERENCE_ONLY',
    origin_system: originSystem,
    origin_component_ref: originComponentRef,
    origin_event_id: originEventId,
    origin_event_type: originEventType,
    origin_entity_ref: originEntityRef,
    origin_occurred_at: originOccurredAt,
    correlation_id: correlationId,
    source_event_payload_hash: sourceEventPayloadHash,
  };

  const receiptWithoutDigest: Omit<CalendarOriginEventRefReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_CALENDAR_ORIGIN_EVENT_REF_SEED_ID,
    component_id: PHASE_6C_CALENDAR_ORIGIN_EVENT_REF_COMPONENT_ID,
    component_slug: 'workspace_calendar_meetings_rooms_announcements',
    model_name: 'Phase6CCalendarOriginEventRef',
    event_name: CALENDAR_ORIGIN_EVENT_REF_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    calendar_event_ref: calendarEventRef,
    source_record_ref: sourceRecordRef,
    decision: 'ACCEPTED_EVENT_REFERENCE',
    normalized_origin_ref: normalizedOriginRef,
    refs_events_only: true,
    calendar_write_executed: false,
    origin_mutation_executed: false,
    direct_cross_module_query_executed: false,
    provider_sync_executed: false,
    runtime_adapter_executed: false,
    persistence_executed: false,
    required_evidence_artifacts: [
      'calendar_origin_event_ref_runtime_receipt',
      'origin_event_payload_hash',
      'refs_events_only_boundary_evidence',
    ],
    decision_refs: CALENDAR_ORIGIN_EVENT_REF_DECISION_REFS,
    requested_by_user_id: requestedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digest(receiptWithoutDigest),
  };
}
