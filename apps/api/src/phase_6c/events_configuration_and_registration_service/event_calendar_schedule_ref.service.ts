import { createHash } from 'node:crypto';

export const PHASE_6C_EVENT_CALENDAR_SCHEDULE_REF_SEED_ID = "seed_6c_105_event_calendar_schedule_ref" as const;
export const PHASE_6C_EVENT_CALENDAR_SCHEDULE_REF_COMPONENT_ID = "6C.08" as const;
export const EVENT_CALENDAR_SCHEDULE_REF_RUNTIME_EVENT = "phase_6c.events_configuration_and_registration_service.event_calendar_schedule_ref.runtime_evaluated" as const;

type EventCalendarScheduleRefDecision =
  | 'CALENDAR_NOT_REQUESTED'
  | 'CALENDAR_REF_PENDING'
  | 'CALENDAR_REF_READY'
  | 'CALENDAR_REF_CONFLICT'
  | 'CALENDAR_REF_REQUIRES_REVIEW';

type EventCalendarScheduleSyncStatus = 'not_requested' | 'pending' | 'synced' | 'failed' | 'conflict';

export type EventCalendarScheduleRefInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  event_start_at: string;
  event_end_at: string;
  timezone: string;
  workspace_calendar_active: boolean;
  calendar_schedule_ref?: string;
  calendar_owner_ref?: string;
  calendar_id_ref?: string;
  calendar_event_ref?: string;
  sync_status?: EventCalendarScheduleSyncStatus;
  conflict_refs?: readonly string[];
  product_catalogue_anchor_ref?: string;
  invoice_saga_ref?: string;
  payment_saga_ref?: string;
  crm_handoff_ref?: string;
  control_metadata?: Record<string, unknown>;
  create_calendar_event_requested?: boolean;
  update_calendar_event_requested?: boolean;
  provider_sync_requested?: boolean;
  calendar_api_publication_requested?: boolean;
  persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type EventCalendarScheduleRefRuntimeReceipt = {
  seed_id: typeof PHASE_6C_EVENT_CALENDAR_SCHEDULE_REF_SEED_ID;
  component_id: typeof PHASE_6C_EVENT_CALENDAR_SCHEDULE_REF_COMPONENT_ID;
  component_slug: "events_configuration_and_registration_service";
  model_name: "Phase6CEventCalendarScheduleRef";
  event_name: typeof EVENT_CALENDAR_SCHEDULE_REF_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  source_record_ref: string;
  decision: EventCalendarScheduleRefDecision;
  workspace_calendar_active: boolean;
  event_start_at: string;
  event_end_at: string;
  duration_minutes: number;
  timezone: string;
  calendar_schedule_ref: string | null;
  calendar_owner_ref: string | null;
  calendar_id_ref: string | null;
  calendar_event_ref: string | null;
  sync_status: EventCalendarScheduleSyncStatus;
  conflict_refs: readonly string[];
  dependency_trace: {
    service_manifest_contract: string;
    product_catalogue_anchor_ref: string | null;
    invoice_saga_ref: string | null;
    payment_saga_ref: string | null;
    crm_handoff_ref: string | null;
    workspace_calendar_condition: 'workspace_calendar_active' | 'workspace_calendar_inactive';
  };
  decision_refs: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  runtime_evidence_digest: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for event_calendar_schedule_ref runtime evaluation.');
  }
  return value.trim();
}

function optionalRef(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(field + ' must be non-empty when provided for event_calendar_schedule_ref.');
  }
  return normalized;
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for event_calendar_schedule_ref.');
  }
  return normalized;
}

function requireTimezone(value: string | undefined): string {
  const normalized = requireNonEmpty(value, 'timezone');
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: normalized }).format(new Date('2026-01-01T00:00:00.000Z'));
  } catch {
    throw new Error('timezone must be an IANA timezone for event_calendar_schedule_ref.');
  }
  return normalized;
}

function normalizeConflicts(conflictRefs: readonly string[] | undefined): readonly string[] {
  const normalized = (conflictRefs ?? []).map((ref, index) => requireNonEmpty(ref, 'conflict_refs[' + index + ']'));
  if (new Set(normalized).size !== normalized.length) {
    throw new Error('conflict_refs must be unique for event_calendar_schedule_ref.');
  }
  return normalized;
}

function assertForbiddenRequests(input: EventCalendarScheduleRefInput): readonly string[] {
  const rejections = [
    ['create_calendar_event_requested', input.create_calendar_event_requested, 'calendar event creation is deferred to the Workspace Calendar wiring layer'],
    ['update_calendar_event_requested', input.update_calendar_event_requested, 'calendar event update is deferred to the Workspace Calendar wiring layer'],
    ['provider_sync_requested', input.provider_sync_requested, 'provider sync is not authorized inside event_calendar_schedule_ref'],
    ['calendar_api_publication_requested', input.calendar_api_publication_requested, 'API publication is deferred until runtime wiring'],
    ['persistence_requested', input.persistence_requested, 'persistence is outside the exact FFET scope'],
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

function determineDecision(input: {
  workspaceCalendarActive: boolean;
  syncStatus: EventCalendarScheduleSyncStatus;
  calendarScheduleRef: string | null;
  calendarIdRef: string | null;
  calendarEventRef: string | null;
  conflicts: readonly string[];
}): EventCalendarScheduleRefDecision {
  if (!input.workspaceCalendarActive) {
    return 'CALENDAR_NOT_REQUESTED';
  }
  if (input.conflicts.length > 0 || input.syncStatus === 'conflict') {
    return 'CALENDAR_REF_CONFLICT';
  }
  if (input.syncStatus === 'failed') {
    return 'CALENDAR_REF_REQUIRES_REVIEW';
  }
  if (input.syncStatus === 'synced') {
    if (input.calendarScheduleRef === null || input.calendarIdRef === null || input.calendarEventRef === null) {
      return 'CALENDAR_REF_REQUIRES_REVIEW';
    }
    return 'CALENDAR_REF_READY';
  }
  if (input.calendarScheduleRef !== null || input.calendarIdRef !== null || input.calendarEventRef !== null) {
    return 'CALENDAR_REF_PENDING';
  }
  return 'CALENDAR_REF_PENDING';
}

function digestRuntime(receiptWithoutDigest: Omit<EventCalendarScheduleRefRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateEventCalendarScheduleRef(input: EventCalendarScheduleRefInput): EventCalendarScheduleRefRuntimeReceipt {
  const forbiddenBehaviorRejections = assertForbiddenRequests(input);
  const eventStartAt = requireTimestamp(input.event_start_at, 'event_start_at');
  const eventEndAt = requireTimestamp(input.event_end_at, 'event_end_at');
  const startMs = Date.parse(eventStartAt);
  const endMs = Date.parse(eventEndAt);
  if (endMs <= startMs) {
    throw new Error('event_end_at must be after event_start_at for event_calendar_schedule_ref.');
  }

  const syncStatus = input.sync_status ?? (input.workspace_calendar_active ? 'pending' : 'not_requested');
  if (!input.workspace_calendar_active && syncStatus !== 'not_requested') {
    throw new Error('sync_status must be not_requested when workspace_calendar_active is false.');
  }

  const calendarScheduleRef = optionalRef(input.calendar_schedule_ref, 'calendar_schedule_ref');
  const calendarOwnerRef = optionalRef(input.calendar_owner_ref, 'calendar_owner_ref');
  const calendarIdRef = optionalRef(input.calendar_id_ref, 'calendar_id_ref');
  const calendarEventRef = optionalRef(input.calendar_event_ref, 'calendar_event_ref');
  const conflicts = normalizeConflicts(input.conflict_refs);
  const decision = determineDecision({
    workspaceCalendarActive: input.workspace_calendar_active,
    syncStatus,
    calendarScheduleRef,
    calendarIdRef,
    calendarEventRef,
    conflicts,
  });

  const receiptWithoutDigest: Omit<EventCalendarScheduleRefRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_EVENT_CALENDAR_SCHEDULE_REF_SEED_ID,
    component_id: PHASE_6C_EVENT_CALENDAR_SCHEDULE_REF_COMPONENT_ID,
    component_slug: "events_configuration_and_registration_service",
    model_name: "Phase6CEventCalendarScheduleRef",
    event_name: EVENT_CALENDAR_SCHEDULE_REF_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    event_config_ref: requireNonEmpty(input.event_config_ref, 'event_config_ref'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    decision,
    workspace_calendar_active: input.workspace_calendar_active,
    event_start_at: eventStartAt,
    event_end_at: eventEndAt,
    duration_minutes: Math.round((endMs - startMs) / 60000),
    timezone: requireTimezone(input.timezone),
    calendar_schedule_ref: calendarScheduleRef,
    calendar_owner_ref: calendarOwnerRef,
    calendar_id_ref: calendarIdRef,
    calendar_event_ref: calendarEventRef,
    sync_status: syncStatus,
    conflict_refs: conflicts,
    dependency_trace: {
      service_manifest_contract: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
      product_catalogue_anchor_ref: optionalRef(input.product_catalogue_anchor_ref, 'product_catalogue_anchor_ref'),
      invoice_saga_ref: optionalRef(input.invoice_saga_ref, 'invoice_saga_ref'),
      payment_saga_ref: optionalRef(input.payment_saga_ref, 'payment_saga_ref'),
      crm_handoff_ref: optionalRef(input.crm_handoff_ref, 'crm_handoff_ref'),
      workspace_calendar_condition: input.workspace_calendar_active ? 'workspace_calendar_active' : 'workspace_calendar_inactive',
    },
    decision_refs: ["6C-EVENT-REG-009", "6C-EVENT-REG-012", "6C-EVENT-REG-003", "6C-BILL-007", "ADL-001"],
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
