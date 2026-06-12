import { createHash } from 'node:crypto';

export const PHASE_6C_CONFERENCING_PROVIDER_BOUNDARY_SEED_ID = 'seed_6c_085_conferencing_provider_boundary' as const;
export const PHASE_6C_CONFERENCING_PROVIDER_BOUNDARY_COMPONENT_ID = '6C.07' as const;
export const CONFERENCING_PROVIDER_BOUNDARY_RUNTIME_EVENT = 'phase_6c.workspace_calendar_meetings_rooms_announcements.conferencing_provider_boundary.runtime_evaluated' as const;

type ConferencingProviderBoundaryProvider = 'GOOGLE_MEET' | 'ZOOM';
type ConferencingProviderBoundaryCapability = 'VIDEO_MEETING_LINK' | 'DIAL_IN' | 'WAITING_ROOM' | 'RECORDING_POLICY';
type ConferencingProviderBoundaryStatus = 'BOUNDARY_VALIDATED' | 'BLOCKED_REQUIRES_ADAPTER_IMPLEMENTATION';

export type ConferencingProviderBoundaryInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  boundary_ref: string;
  provider: ConferencingProviderBoundaryProvider;
  calendar_entry_ref: string;
  meeting_title: string;
  starts_at: string;
  ends_at?: string;
  timezone: string;
  requested_capabilities: readonly ConferencingProviderBoundaryCapability[];
  credential_reference?: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  metadata?: Record<string, unknown>;
  raw_credential_supplied?: boolean;
  provider_sdk_call_requested?: boolean;
  meeting_link_generation_requested?: boolean;
  dial_in_number_requested?: boolean;
  webhook_registration_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
  cross_phase_write_requested?: boolean;
  frontend_route_requested?: boolean;
  authorization_flag_change_requested?: boolean;
};

type ConferencingProviderBoundaryEnvelope = {
  boundary_uid: string;
  provider: ConferencingProviderBoundaryProvider;
  calendar_entry_ref: string;
  meeting_title: string;
  starts_at: string;
  ends_at?: string;
  timezone: string;
  requested_capabilities: readonly ConferencingProviderBoundaryCapability[];
  credential_reference?: string;
  adapter_boundary_only: true;
};

export type ConferencingProviderBoundaryReceipt = {
  seed_id: typeof PHASE_6C_CONFERENCING_PROVIDER_BOUNDARY_SEED_ID;
  component_id: typeof PHASE_6C_CONFERENCING_PROVIDER_BOUNDARY_COMPONENT_ID;
  component_slug: 'workspace_calendar_meetings_rooms_announcements';
  model_name: 'Phase6CConferencingProviderBoundary';
  event_name: typeof CONFERENCING_PROVIDER_BOUNDARY_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  boundary_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  status: ConferencingProviderBoundaryStatus;
  provider_neutral_only: true;
  adapter_boundary_only: true;
  boundary_envelope: ConferencingProviderBoundaryEnvelope;
  validation_warnings: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};

const PROVIDERS = new Set<ConferencingProviderBoundaryProvider>(['GOOGLE_MEET', 'ZOOM']);
const CAPABILITIES = new Set<ConferencingProviderBoundaryCapability>(['VIDEO_MEETING_LINK', 'DIAL_IN', 'WAITING_ROOM', 'RECORDING_POLICY']);

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for conferencing_provider_boundary runtime evaluation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  const timestampMs = Date.parse(normalized);
  if (!Number.isFinite(timestampMs)) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for conferencing_provider_boundary runtime evaluation.');
  }
  return new Date(timestampMs).toISOString();
}

function rejectForbiddenRequests(input: ConferencingProviderBoundaryInput): readonly string[] {
  const rejected: string[] = [];
  const forbiddenFlags: Array<[keyof ConferencingProviderBoundaryInput, string]> = [
    ['raw_credential_supplied', 'raw provider credentials are forbidden; use credential references only'],
    ['provider_sdk_call_requested', 'provider SDK calls are forbidden in the conferencing boundary FFET'],
    ['meeting_link_generation_requested', 'meeting link generation is outside this FFET'],
    ['dial_in_number_requested', 'dial-in number generation is outside this FFET'],
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

function normalizeCapabilities(capabilities: readonly ConferencingProviderBoundaryCapability[]): readonly ConferencingProviderBoundaryCapability[] {
  if (!Array.isArray(capabilities) || capabilities.length === 0) {
    throw new Error('at least one requested capability is required for conferencing_provider_boundary.');
  }
  const seen = new Set<ConferencingProviderBoundaryCapability>();
  return capabilities.map((capability, index) => {
    if (!CAPABILITIES.has(capability)) {
      throw new Error('requested_capabilities[' + index + '] must be VIDEO_MEETING_LINK, DIAL_IN, WAITING_ROOM, or RECORDING_POLICY.');
    }
    if (seen.has(capability)) {
      throw new Error('duplicate requested capability is not allowed for conferencing_provider_boundary: ' + capability);
    }
    seen.add(capability);
    return capability;
  });
}

function validateCredentialReference(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const ref = requireNonEmpty(value, 'credential_reference');
  if (/secret|token|password|-----BEGIN|oauth|jwt/i.test(ref)) {
    throw new Error('credential_reference must be an opaque reference, not a raw secret or token.');
  }
  return ref;
}

function buildBoundaryUid(input: {
  organization_id: string;
  boundary_ref: string;
  provider: ConferencingProviderBoundaryProvider;
  calendar_entry_ref: string;
  starts_at: string;
}): string {
  return createHash('sha256')
    .update([input.organization_id, input.boundary_ref, input.provider, input.calendar_entry_ref, input.starts_at].join('|'))
    .digest('hex');
}

function buildWarnings(input: {
  provider: ConferencingProviderBoundaryProvider;
  credentialReference?: string;
  capabilities: readonly ConferencingProviderBoundaryCapability[];
}): readonly string[] {
  const warnings: string[] = [];
  if (input.credentialReference === undefined) {
    warnings.push('conferencing_boundary_has_no_credential_reference');
  }
  if (input.provider === 'ZOOM' && input.capabilities.includes('RECORDING_POLICY')) {
    warnings.push('zoom_recording_policy_requires_future_adapter_review');
  }
  if (!input.capabilities.includes('VIDEO_MEETING_LINK')) {
    warnings.push('boundary_does_not_request_video_link_capability');
  }
  return warnings;
}

function digestRuntime(receiptWithoutDigest: Omit<ConferencingProviderBoundaryReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateConferencingProviderBoundary(input: ConferencingProviderBoundaryInput): ConferencingProviderBoundaryReceipt {
  const forbiddenBehaviorRejections = rejectForbiddenRequests(input);
  if (forbiddenBehaviorRejections.length > 0) {
    throw new Error('conferencing_provider_boundary rejected forbidden behavior: ' + forbiddenBehaviorRejections.join('; '));
  }
  if (!PROVIDERS.has(input.provider)) {
    throw new Error('provider must be GOOGLE_MEET or ZOOM for conferencing_provider_boundary.');
  }

  const organization_id = requireNonEmpty(input.organization_id, 'organization_id');
  const service_manifest_contract_id = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const boundary_ref = requireNonEmpty(input.boundary_ref, 'boundary_ref');
  const calendar_entry_ref = requireNonEmpty(input.calendar_entry_ref, 'calendar_entry_ref');
  const meeting_title = requireNonEmpty(input.meeting_title, 'meeting_title');
  const starts_at = requireTimestamp(input.starts_at, 'starts_at');
  const ends_at = input.ends_at === undefined ? undefined : requireTimestamp(input.ends_at, 'ends_at');
  if (ends_at !== undefined && Date.parse(ends_at) < Date.parse(starts_at)) {
    throw new Error('ends_at must not be before starts_at for conferencing_provider_boundary.');
  }
  const timezone = requireNonEmpty(input.timezone, 'timezone');
  const requested_capabilities = normalizeCapabilities(input.requested_capabilities);
  const credential_reference = validateCredentialReference(input.credential_reference);
  const evaluated_by_user_id = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const evaluated_at = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const boundary_uid = buildBoundaryUid({ organization_id, boundary_ref, provider: input.provider, calendar_entry_ref, starts_at });
  const validation_warnings = buildWarnings({ provider: input.provider, credentialReference: credential_reference, capabilities: requested_capabilities });

  const boundary_envelope: ConferencingProviderBoundaryEnvelope = {
    boundary_uid,
    provider: input.provider,
    calendar_entry_ref,
    meeting_title,
    starts_at,
    ...(ends_at === undefined ? {} : { ends_at }),
    timezone,
    requested_capabilities,
    ...(credential_reference === undefined ? {} : { credential_reference }),
    adapter_boundary_only: true,
  };

  const receiptWithoutDigest: Omit<ConferencingProviderBoundaryReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_CONFERENCING_PROVIDER_BOUNDARY_SEED_ID,
    component_id: PHASE_6C_CONFERENCING_PROVIDER_BOUNDARY_COMPONENT_ID,
    component_slug: 'workspace_calendar_meetings_rooms_announcements',
    model_name: 'Phase6CConferencingProviderBoundary',
    event_name: CONFERENCING_PROVIDER_BOUNDARY_RUNTIME_EVENT,
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
