import { createHash } from 'node:crypto';

export const PHASE_6C_CALENDAR_PROVIDER_SYNC_BOUNDARY_SEED_ID = 'seed_6c_084_calendar_provider_sync_boundary' as const;
export const PHASE_6C_CALENDAR_PROVIDER_SYNC_BOUNDARY_COMPONENT_ID = '6C.07' as const;
export const CALENDAR_PROVIDER_SYNC_BOUNDARY_RUNTIME_EVENT = 'phase_6c.workspace_calendar_meetings_rooms_announcements.calendar_provider_sync_boundary.runtime_evaluated' as const;

type CalendarProviderSyncBoundaryProvider = 'GOOGLE_CALENDAR' | 'OUTLOOK_CALENDAR';
type CalendarProviderSyncBoundaryDirection = 'EXPORT_TO_PROVIDER' | 'IMPORT_FROM_PROVIDER' | 'BIDIRECTIONAL_PROPOSED';
type CalendarProviderSyncBoundaryScope = 'READ_CALENDAR_METADATA' | 'WRITE_CALENDAR_EVENTS' | 'READ_WRITE_CALENDAR_EVENTS';
type CalendarProviderSyncBoundaryStatus = 'BOUNDARY_VALIDATED' | 'BLOCKED_REQUIRES_ADAPTER_IMPLEMENTATION';

export type CalendarProviderSyncBoundaryInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  boundary_ref: string;
  provider: CalendarProviderSyncBoundaryProvider;
  direction: CalendarProviderSyncBoundaryDirection;
  requested_scopes: readonly CalendarProviderSyncBoundaryScope[];
  provider_neutral_calendar_entry_ref: string;
  credential_reference?: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  metadata?: Record<string, unknown>;
  raw_credential_supplied?: boolean;
  provider_sdk_call_requested?: boolean;
  sync_execution_requested?: boolean;
  webhook_registration_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
  cross_phase_write_requested?: boolean;
  frontend_route_requested?: boolean;
  authorization_flag_change_requested?: boolean;
};

type CalendarProviderSyncBoundaryEnvelope = {
  boundary_uid: string;
  provider: CalendarProviderSyncBoundaryProvider;
  direction: CalendarProviderSyncBoundaryDirection;
  requested_scopes: readonly CalendarProviderSyncBoundaryScope[];
  provider_neutral_calendar_entry_ref: string;
  credential_reference?: string;
  adapter_boundary_only: true;
};

export type CalendarProviderSyncBoundaryReceipt = {
  seed_id: typeof PHASE_6C_CALENDAR_PROVIDER_SYNC_BOUNDARY_SEED_ID;
  component_id: typeof PHASE_6C_CALENDAR_PROVIDER_SYNC_BOUNDARY_COMPONENT_ID;
  component_slug: 'workspace_calendar_meetings_rooms_announcements';
  model_name: 'Phase6CCalendarProviderSyncBoundary';
  event_name: typeof CALENDAR_PROVIDER_SYNC_BOUNDARY_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  boundary_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  status: CalendarProviderSyncBoundaryStatus;
  provider_neutral_only: true;
  adapter_boundary_only: true;
  boundary_envelope: CalendarProviderSyncBoundaryEnvelope;
  validation_warnings: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};

const PROVIDERS = new Set<CalendarProviderSyncBoundaryProvider>(['GOOGLE_CALENDAR', 'OUTLOOK_CALENDAR']);
const DIRECTIONS = new Set<CalendarProviderSyncBoundaryDirection>(['EXPORT_TO_PROVIDER', 'IMPORT_FROM_PROVIDER', 'BIDIRECTIONAL_PROPOSED']);
const SCOPES = new Set<CalendarProviderSyncBoundaryScope>(['READ_CALENDAR_METADATA', 'WRITE_CALENDAR_EVENTS', 'READ_WRITE_CALENDAR_EVENTS']);

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for calendar_provider_sync_boundary runtime evaluation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  const timestampMs = Date.parse(normalized);
  if (!Number.isFinite(timestampMs)) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for calendar_provider_sync_boundary runtime evaluation.');
  }
  return new Date(timestampMs).toISOString();
}

function rejectForbiddenRequests(input: CalendarProviderSyncBoundaryInput): readonly string[] {
  const rejected: string[] = [];
  const forbiddenFlags: Array<[keyof CalendarProviderSyncBoundaryInput, string]> = [
    ['raw_credential_supplied', 'raw provider credentials are forbidden; use credential references only'],
    ['provider_sdk_call_requested', 'provider SDK calls are forbidden in the adapter boundary FFET'],
    ['sync_execution_requested', 'sync execution is outside this FFET'],
    ['webhook_registration_requested', 'provider webhook registration is outside this FFET'],
    ['persistence_requested', 'persistence is deferred until runtime wiring is authorized'],
    ['runtime_adapter_requested', 'runtime adapter execution is outside this FFET'],
    ['cross_phase_write_requested', 'cross-phase writes are forbidden; refs/events only'],
    ['frontend_route_requested', 'frontend route publication is outside this FFET'],
    ['authorization_flag_change_requested', 'authorization flag changes are human-gated and forbidden here'],
  ];
  for (const [field, reason] of forbiddenFlags) {
    if (input[field] === true) {
      rejected.push(reason);
    }
  }
  return rejected;
}

function normalizeScopes(scopes: readonly CalendarProviderSyncBoundaryScope[]): readonly CalendarProviderSyncBoundaryScope[] {
  if (!Array.isArray(scopes) || scopes.length === 0) {
    throw new Error('at least one requested scope is required for calendar_provider_sync_boundary.');
  }
  const seen = new Set<CalendarProviderSyncBoundaryScope>();
  return scopes.map((scope, index) => {
    if (!SCOPES.has(scope)) {
      throw new Error('requested_scopes[' + index + '] must be READ_CALENDAR_METADATA, WRITE_CALENDAR_EVENTS, or READ_WRITE_CALENDAR_EVENTS.');
    }
    if (seen.has(scope)) {
      throw new Error('duplicate requested scope is not allowed for calendar_provider_sync_boundary: ' + scope);
    }
    seen.add(scope);
    return scope;
  });
}

function validateCredentialReference(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const ref = requireNonEmpty(value, 'credential_reference');
  if (/secret|token|password|-----BEGIN|oauth/i.test(ref)) {
    throw new Error('credential_reference must be an opaque reference, not a raw secret or token.');
  }
  return ref;
}

function buildBoundaryUid(input: {
  organization_id: string;
  boundary_ref: string;
  provider: CalendarProviderSyncBoundaryProvider;
  direction: CalendarProviderSyncBoundaryDirection;
  provider_neutral_calendar_entry_ref: string;
}): string {
  return createHash('sha256')
    .update([input.organization_id, input.boundary_ref, input.provider, input.direction, input.provider_neutral_calendar_entry_ref].join('|'))
    .digest('hex');
}

function buildWarnings(input: {
  direction: CalendarProviderSyncBoundaryDirection;
  credentialReference?: string;
  scopes: readonly CalendarProviderSyncBoundaryScope[];
}): readonly string[] {
  const warnings: string[] = [];
  if (input.direction !== 'IMPORT_FROM_PROVIDER' && input.credentialReference === undefined) {
    warnings.push('export_boundary_has_no_credential_reference');
  }
  if (input.scopes.includes('READ_WRITE_CALENDAR_EVENTS')) {
    warnings.push('read_write_scope_requires_future_adapter_review');
  }
  if (input.direction === 'BIDIRECTIONAL_PROPOSED') {
    warnings.push('bidirectional_sync_requires_future_adapter_approval');
  }
  return warnings;
}

function digestRuntime(receiptWithoutDigest: Omit<CalendarProviderSyncBoundaryReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateCalendarProviderSyncBoundary(input: CalendarProviderSyncBoundaryInput): CalendarProviderSyncBoundaryReceipt {
  const forbiddenBehaviorRejections = rejectForbiddenRequests(input);
  if (forbiddenBehaviorRejections.length > 0) {
    throw new Error('calendar_provider_sync_boundary rejected forbidden behavior: ' + forbiddenBehaviorRejections.join('; '));
  }
  if (!PROVIDERS.has(input.provider)) {
    throw new Error('provider must be GOOGLE_CALENDAR or OUTLOOK_CALENDAR for calendar_provider_sync_boundary.');
  }
  if (!DIRECTIONS.has(input.direction)) {
    throw new Error('direction must be EXPORT_TO_PROVIDER, IMPORT_FROM_PROVIDER, or BIDIRECTIONAL_PROPOSED.');
  }

  const organization_id = requireNonEmpty(input.organization_id, 'organization_id');
  const service_manifest_contract_id = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const boundary_ref = requireNonEmpty(input.boundary_ref, 'boundary_ref');
  const provider_neutral_calendar_entry_ref = requireNonEmpty(input.provider_neutral_calendar_entry_ref, 'provider_neutral_calendar_entry_ref');
  const requested_scopes = normalizeScopes(input.requested_scopes);
  const credential_reference = validateCredentialReference(input.credential_reference);
  const evaluated_by_user_id = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const evaluated_at = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const boundary_uid = buildBoundaryUid({ organization_id, boundary_ref, provider: input.provider, direction: input.direction, provider_neutral_calendar_entry_ref });
  const validation_warnings = buildWarnings({ direction: input.direction, credentialReference: credential_reference, scopes: requested_scopes });

  const boundary_envelope: CalendarProviderSyncBoundaryEnvelope = {
    boundary_uid,
    provider: input.provider,
    direction: input.direction,
    requested_scopes,
    provider_neutral_calendar_entry_ref,
    ...(credential_reference === undefined ? {} : { credential_reference }),
    adapter_boundary_only: true,
  };

  const receiptWithoutDigest: Omit<CalendarProviderSyncBoundaryReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_CALENDAR_PROVIDER_SYNC_BOUNDARY_SEED_ID,
    component_id: PHASE_6C_CALENDAR_PROVIDER_SYNC_BOUNDARY_COMPONENT_ID,
    component_slug: 'workspace_calendar_meetings_rooms_announcements',
    model_name: 'Phase6CCalendarProviderSyncBoundary',
    event_name: CALENDAR_PROVIDER_SYNC_BOUNDARY_RUNTIME_EVENT,
    organization_id,
    service_manifest_contract_id,
    boundary_ref,
    evaluated_by_user_id,
    evaluated_at,
    status: validation_warnings.length === 0 ? 'BOUNDARY_VALIDATED' : 'BLOCKED_REQUIRES_ADAPTER_IMPLEMENTATION',
    provider_neutral_only: true,
    adapter_boundary_only: true,
    boundary_envelope,
    validation_warnings,
    forbidden_behavior_rejections: [],
    metadata: input.metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestRuntime(receiptWithoutDigest),
  };
}
