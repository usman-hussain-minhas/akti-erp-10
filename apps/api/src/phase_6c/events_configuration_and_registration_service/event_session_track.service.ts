import { createHash } from 'node:crypto';

export const PHASE_6C_EVENT_SESSION_TRACK_SEED_ID = 'seed_6c_097_event_session_track' as const;
export const PHASE_6C_EVENT_SESSION_TRACK_COMPONENT_ID = '6C.08' as const;
export const EVENT_SESSION_TRACK_RUNTIME_EVENT = 'phase_6c.events_configuration_and_registration_service.event_session_track.runtime_evaluated' as const;

export type EventSessionTrackCapacityMode = 'INHERIT_EVENT' | 'FIXED_TRACK_CAPACITY' | 'PER_SESSION_CAPACITY';
export type EventSessionTrackDecision = 'SESSION_TRACK_READY' | 'SESSION_TRACK_REQUIRES_REVIEW';

export type EventSessionDefinition = {
  session_ref: string;
  title: string;
  starts_at: string;
  ends_at: string;
  capacity?: number;
  speaker_ref?: string;
  product_catalogue_item_ref?: string;
  calendar_event_ref?: string;
};

export type EventSessionTrackInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  session_track_id: string;
  source_record_ref: string;
  configured_by_user_id: string;
  evaluated_at: string;
  track_name: string;
  track_code: string;
  capacity_mode: EventSessionTrackCapacityMode;
  sessions: readonly EventSessionDefinition[];
  track_capacity?: number;
  product_catalogue_ref?: string;
  ticket_type_ref?: string;
  paid_registration_enabled?: boolean;
  registration_invoice_saga_ref?: string;
  calendar_schedule?: {
    enabled: boolean;
    condition: 'workspace_calendar_active';
    workspace_calendar_ref?: string;
  };
  control_metadata?: Record<string, unknown>;
  product_catalogue_write_requested?: boolean;
  finance_invoice_write_requested?: boolean;
  payment_capture_requested?: boolean;
  calendar_direct_write_requested?: boolean;
  provider_adapter_requested?: boolean;
  persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type EventSessionTrackRuntimeReceipt = {
  seed_id: typeof PHASE_6C_EVENT_SESSION_TRACK_SEED_ID;
  component_id: typeof PHASE_6C_EVENT_SESSION_TRACK_COMPONENT_ID;
  component_slug: 'events_configuration_and_registration_service';
  model_name: 'Phase6CEventSessionTrack';
  event_name: typeof EVENT_SESSION_TRACK_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  session_track_id: string;
  source_record_ref: string;
  configured_by_user_id: string;
  evaluated_at: string;
  normalized_track_code: string;
  capacity_mode: EventSessionTrackCapacityMode;
  session_count: number;
  earliest_session_start: string;
  latest_session_end: string;
  fixed_track_capacity?: number;
  total_session_capacity?: number;
  product_catalogue_anchor_required: boolean;
  product_catalogue_ref?: string;
  ticket_type_ref?: string;
  registration_invoice_saga_required: boolean;
  registration_invoice_saga_ref?: string;
  calendar_schedule_condition?: 'workspace_calendar_active';
  calendar_target_ref?: string;
  decision: EventSessionTrackDecision;
  refs_events_only: true;
  direct_cross_module_write_allowed: false;
  provider_adapter_allowed: false;
  persistence_performed: false;
  schema_mutation_performed: false;
  frontend_surface_created: false;
  decision_refs: readonly string[];
  adl_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  event_session_track_runtime_digest: string;
};

const DECISION_REFS = ['6C-EVENT-REG-013', '6C-EVENT-REG-002', '6C-EVENT-REG-003', '6C-EVENT-REG-009', '6C-BILL-007', '6C-GLOBAL-018'] as const;
const ADL_REFS = ['ADL-001'] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for event_session_track runtime evaluation.');
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
    throw new Error(field + ' must be a valid ISO-compatible timestamp for event_session_track runtime evaluation.');
  }
  return normalized;
}

function requirePositiveInteger(value: number | undefined, field: string): number {
  if (!Number.isInteger(value) || value === undefined || value <= 0) {
    throw new Error(field + ' must be a positive integer for event_session_track runtime evaluation.');
  }
  return value;
}

function normalizeTrackCode(value: string | undefined): string {
  const normalized = requireNonEmpty(value, 'track_code').toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9_-]{1,62}[A-Z0-9]$/.test(normalized)) {
    throw new Error('track_code must be 3-64 characters using letters, numbers, underscores, or hyphens.');
  }
  return normalized;
}

function assertForbidden(input: EventSessionTrackInput): void {
  const forbidden: Array<[keyof EventSessionTrackInput, string]> = [
    ['product_catalogue_write_requested', 'event_session_track must reference Product Catalogue anchors, not write Product Catalogue data.'],
    ['finance_invoice_write_requested', 'event_session_track must use Saga/evidence refs, not write Finance invoices.'],
    ['payment_capture_requested', 'event_session_track must not capture payment.'],
    ['calendar_direct_write_requested', 'event_session_track must reference Workspace Calendar conditionally, not write calendar data directly.'],
    ['provider_adapter_requested', 'event_session_track must not execute provider adapters.'],
    ['persistence_requested', 'event_session_track FFET must not persist records.'],
    ['schema_mutation_requested', 'event_session_track FFET must not mutate schema.'],
    ['frontend_requested', 'event_session_track FFET must not create frontend surfaces.'],
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

function digestRuntime(receiptWithoutDigest: Omit<EventSessionTrackRuntimeReceipt, 'event_session_track_runtime_digest'>): string {
  return createHash('sha256').update(JSON.stringify(canonicalize(receiptWithoutDigest))).digest('hex');
}

function validateSessions(input: EventSessionTrackInput): { earliest: string; latest: string; totalSessionCapacity?: number; productItemRefsRequired: boolean } {
  if (!Array.isArray(input.sessions) || input.sessions.length === 0) {
    throw new Error('at least one session is required for event_session_track runtime evaluation.');
  }

  const sorted = input.sessions.map((session) => {
    const startsAt = requireTimestamp(session.starts_at, 'session.starts_at');
    const endsAt = requireTimestamp(session.ends_at, 'session.ends_at');
    if (Date.parse(startsAt) >= Date.parse(endsAt)) {
      throw new Error('session.ends_at must be after session.starts_at.');
    }
    return {
      session_ref: requireNonEmpty(session.session_ref, 'session.session_ref'),
      title: requireNonEmpty(session.title, 'session.title'),
      starts_at: startsAt,
      ends_at: endsAt,
      capacity: session.capacity,
      speaker_ref: optionalNonEmpty(session.speaker_ref, 'session.speaker_ref'),
      product_catalogue_item_ref: optionalNonEmpty(session.product_catalogue_item_ref, 'session.product_catalogue_item_ref'),
      calendar_event_ref: optionalNonEmpty(session.calendar_event_ref, 'session.calendar_event_ref'),
    };
  }).sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at));

  for (let index = 1; index < sorted.length; index += 1) {
    if (Date.parse(sorted[index - 1].ends_at) > Date.parse(sorted[index].starts_at)) {
      throw new Error('sessions in the same event_session_track must not overlap.');
    }
  }

  if (input.capacity_mode === 'PER_SESSION_CAPACITY') {
    return {
      earliest: sorted[0].starts_at,
      latest: sorted[sorted.length - 1].ends_at,
      totalSessionCapacity: sorted.reduce((sum, session) => sum + requirePositiveInteger(session.capacity, 'session.capacity'), 0),
      productItemRefsRequired: sorted.some((session) => session.product_catalogue_item_ref !== undefined),
    };
  }

  if (input.sessions.some((session) => session.capacity !== undefined)) {
    throw new Error('session.capacity is only valid for PER_SESSION_CAPACITY tracks.');
  }

  return {
    earliest: sorted[0].starts_at,
    latest: sorted[sorted.length - 1].ends_at,
    productItemRefsRequired: sorted.some((session) => session.product_catalogue_item_ref !== undefined),
  };
}

function validateCapacity(input: EventSessionTrackInput): number | undefined {
  if (input.capacity_mode === 'FIXED_TRACK_CAPACITY') {
    return requirePositiveInteger(input.track_capacity, 'track_capacity');
  }
  if (input.track_capacity !== undefined) {
    throw new Error('track_capacity is only valid for FIXED_TRACK_CAPACITY tracks.');
  }
  return undefined;
}

function validateProductCatalogue(input: EventSessionTrackInput, productItemRefsRequired: boolean): { required: boolean; productRef?: string; ticketTypeRef?: string } {
  const required = productItemRefsRequired || input.ticket_type_ref !== undefined || input.paid_registration_enabled === true;
  if (!required) {
    if (input.product_catalogue_ref !== undefined) {
      throw new Error('product_catalogue_ref requires ticket_type_ref, paid registration, or session product item refs.');
    }
    return { required };
  }
  return {
    required,
    productRef: requireNonEmpty(input.product_catalogue_ref, 'product_catalogue_ref'),
    ticketTypeRef: optionalNonEmpty(input.ticket_type_ref, 'ticket_type_ref'),
  };
}

function validatePaidRegistration(input: EventSessionTrackInput): { required: boolean; sagaRef?: string } {
  if (input.paid_registration_enabled !== true) {
    if (input.registration_invoice_saga_ref !== undefined) {
      throw new Error('registration_invoice_saga_ref is only valid when paid_registration_enabled is true.');
    }
    return { required: false };
  }
  return {
    required: true,
    sagaRef: requireNonEmpty(input.registration_invoice_saga_ref, 'registration_invoice_saga_ref'),
  };
}

function validateCalendar(input: EventSessionTrackInput): string | undefined {
  if (!input.calendar_schedule || input.calendar_schedule.enabled === false) {
    return undefined;
  }
  if (input.calendar_schedule.condition !== 'workspace_calendar_active') {
    throw new Error('calendar_schedule must use condition workspace_calendar_active.');
  }
  return requireNonEmpty(input.calendar_schedule.workspace_calendar_ref, 'calendar_schedule.workspace_calendar_ref');
}

export function evaluateEventSessionTrack(input: EventSessionTrackInput): EventSessionTrackRuntimeReceipt {
  assertForbidden(input);
  const sessions = validateSessions(input);
  const fixedTrackCapacity = validateCapacity(input);
  const productCatalogue = validateProductCatalogue(input, sessions.productItemRefsRequired);
  const paidRegistration = validatePaidRegistration(input);
  const calendarTargetRef = validateCalendar(input);

  const receiptWithoutDigest: Omit<EventSessionTrackRuntimeReceipt, 'event_session_track_runtime_digest'> = {
    seed_id: PHASE_6C_EVENT_SESSION_TRACK_SEED_ID,
    component_id: PHASE_6C_EVENT_SESSION_TRACK_COMPONENT_ID,
    component_slug: 'events_configuration_and_registration_service',
    model_name: 'Phase6CEventSessionTrack',
    event_name: EVENT_SESSION_TRACK_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    event_configuration_id: requireNonEmpty(input.event_configuration_id, 'event_configuration_id'),
    session_track_id: requireNonEmpty(input.session_track_id, 'session_track_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    configured_by_user_id: requireNonEmpty(input.configured_by_user_id, 'configured_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
    normalized_track_code: normalizeTrackCode(input.track_code),
    capacity_mode: input.capacity_mode,
    session_count: input.sessions.length,
    earliest_session_start: sessions.earliest,
    latest_session_end: sessions.latest,
    fixed_track_capacity: fixedTrackCapacity,
    total_session_capacity: sessions.totalSessionCapacity,
    product_catalogue_anchor_required: productCatalogue.required,
    product_catalogue_ref: productCatalogue.productRef,
    ticket_type_ref: productCatalogue.ticketTypeRef,
    registration_invoice_saga_required: paidRegistration.required,
    registration_invoice_saga_ref: paidRegistration.sagaRef,
    calendar_schedule_condition: calendarTargetRef ? 'workspace_calendar_active' : undefined,
    calendar_target_ref: calendarTargetRef,
    decision: paidRegistration.required && !productCatalogue.ticketTypeRef ? 'SESSION_TRACK_REQUIRES_REVIEW' : 'SESSION_TRACK_READY',
    refs_events_only: true,
    direct_cross_module_write_allowed: false,
    provider_adapter_allowed: false,
    persistence_performed: false,
    schema_mutation_performed: false,
    frontend_surface_created: false,
    decision_refs: DECISION_REFS,
    adl_refs: paidRegistration.required ? ADL_REFS : [],
    evidence_artifacts: ['event_session_track_runtime_receipt', 'event_session_track_validation_result', 'event_session_track_forbidden_behavior_rejection_evidence'],
    control_metadata: input.control_metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    event_session_track_runtime_digest: digestRuntime(receiptWithoutDigest),
  };
}
