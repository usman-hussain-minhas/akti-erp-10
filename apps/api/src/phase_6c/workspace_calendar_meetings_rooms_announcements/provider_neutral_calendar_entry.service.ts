import { createHash } from 'node:crypto';

export const PHASE_6C_PROVIDER_NEUTRAL_CALENDAR_ENTRY_SEED_ID = 'seed_6c_083_provider_neutral_calendar_entry' as const;
export const PHASE_6C_PROVIDER_NEUTRAL_CALENDAR_ENTRY_COMPONENT_ID = '6C.07' as const;
export const PROVIDER_NEUTRAL_CALENDAR_ENTRY_RUNTIME_EVENT = 'phase_6c.workspace_calendar_meetings_rooms_announcements.provider_neutral_calendar_entry.runtime_evaluated' as const;

type ProviderNeutralCalendarEntryStatus = 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED';
type ProviderNeutralCalendarEntryVisibility = 'PRIVATE' | 'TEAM' | 'ORGANIZATION';
type ProviderNeutralCalendarEntryParticipantRole = 'OWNER' | 'ATTENDEE' | 'OPTIONAL' | 'RESOURCE';
type ProviderNeutralCalendarEntrySourceType = 'MANUAL' | 'TASK' | 'PROJECT' | 'ROOM' | 'ANNOUNCEMENT';

type ProviderNeutralCalendarEntryParticipant = {
  participant_ref: string;
  role: ProviderNeutralCalendarEntryParticipantRole;
  response_status?: 'NEEDS_ACTION' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE';
};

export type ProviderNeutralCalendarEntryInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  calendar_entry_ref: string;
  source_type: ProviderNeutralCalendarEntrySourceType;
  source_ref?: string;
  title: string;
  description?: string;
  status: ProviderNeutralCalendarEntryStatus;
  visibility: ProviderNeutralCalendarEntryVisibility;
  start_at: string;
  end_at?: string;
  timezone: string;
  all_day?: boolean;
  created_by_user_id: string;
  created_at: string;
  participants?: readonly ProviderNeutralCalendarEntryParticipant[];
  evidence_refs?: readonly string[];
  metadata?: Record<string, unknown>;
  provider_sync_requested?: boolean;
  provider_credential_requested?: boolean;
  direct_provider_mutation_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
  cross_phase_write_requested?: boolean;
  frontend_route_requested?: boolean;
  authorization_flag_change_requested?: boolean;
};

type ProviderNeutralCalendarEntryPayload = {
  entry_uid: string;
  source_type: ProviderNeutralCalendarEntrySourceType;
  source_ref?: string;
  title: string;
  description?: string;
  status: ProviderNeutralCalendarEntryStatus;
  visibility: ProviderNeutralCalendarEntryVisibility;
  start_at: string;
  end_at?: string;
  timezone: string;
  all_day: boolean;
  participants: readonly ProviderNeutralCalendarEntryParticipant[];
  evidence_refs: readonly string[];
};

export type ProviderNeutralCalendarEntryReceipt = {
  seed_id: typeof PHASE_6C_PROVIDER_NEUTRAL_CALENDAR_ENTRY_SEED_ID;
  component_id: typeof PHASE_6C_PROVIDER_NEUTRAL_CALENDAR_ENTRY_COMPONENT_ID;
  component_slug: 'workspace_calendar_meetings_rooms_announcements';
  model_name: 'Phase6CProviderNeutralCalendarEntry';
  event_name: typeof PROVIDER_NEUTRAL_CALENDAR_ENTRY_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  calendar_entry_ref: string;
  created_by_user_id: string;
  created_at: string;
  provider_neutral_payload: ProviderNeutralCalendarEntryPayload;
  provider_adapter_boundary_only: true;
  participant_count: number;
  validation_warnings: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};

const STATUSES = new Set<ProviderNeutralCalendarEntryStatus>(['TENTATIVE', 'CONFIRMED', 'CANCELLED']);
const VISIBILITIES = new Set<ProviderNeutralCalendarEntryVisibility>(['PRIVATE', 'TEAM', 'ORGANIZATION']);
const SOURCE_TYPES = new Set<ProviderNeutralCalendarEntrySourceType>(['MANUAL', 'TASK', 'PROJECT', 'ROOM', 'ANNOUNCEMENT']);
const PARTICIPANT_ROLES = new Set<ProviderNeutralCalendarEntryParticipantRole>(['OWNER', 'ATTENDEE', 'OPTIONAL', 'RESOURCE']);
const RESPONSE_STATUSES = new Set<NonNullable<ProviderNeutralCalendarEntryParticipant['response_status']>>(['NEEDS_ACTION', 'ACCEPTED', 'DECLINED', 'TENTATIVE']);

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for provider_neutral_calendar_entry runtime evaluation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  const timestampMs = Date.parse(normalized);
  if (!Number.isFinite(timestampMs)) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for provider_neutral_calendar_entry runtime evaluation.');
  }
  return new Date(timestampMs).toISOString();
}

function rejectForbiddenRequests(input: ProviderNeutralCalendarEntryInput): readonly string[] {
  const rejected: string[] = [];
  const forbiddenFlags: Array<[keyof ProviderNeutralCalendarEntryInput, string]> = [
    ['provider_sync_requested', 'provider sync is adapter-boundary-only and forbidden in this FFET'],
    ['provider_credential_requested', 'provider credential access is forbidden in this FFET'],
    ['direct_provider_mutation_requested', 'direct provider mutation is forbidden; provider-neutral payload only'],
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

function normalizeParticipants(participants: readonly ProviderNeutralCalendarEntryParticipant[]): readonly ProviderNeutralCalendarEntryParticipant[] {
  const seen = new Set<string>();
  return participants.map((participant, index) => {
    const participant_ref = requireNonEmpty(participant.participant_ref, 'participants[' + index + '].participant_ref');
    if (!PARTICIPANT_ROLES.has(participant.role)) {
      throw new Error('participants[' + index + '].role must be OWNER, ATTENDEE, OPTIONAL, or RESOURCE.');
    }
    if (participant.response_status !== undefined && !RESPONSE_STATUSES.has(participant.response_status)) {
      throw new Error('participants[' + index + '].response_status must be NEEDS_ACTION, ACCEPTED, DECLINED, or TENTATIVE.');
    }
    const key = participant_ref + ':' + participant.role;
    if (seen.has(key)) {
      throw new Error('duplicate participant role is not allowed for provider_neutral_calendar_entry: ' + key);
    }
    seen.add(key);
    return {
      participant_ref,
      role: participant.role,
      response_status: participant.response_status ?? 'NEEDS_ACTION',
    };
  });
}

function normalizeStringList(values: readonly string[] | undefined, field: string): readonly string[] {
  const normalized = [...(values ?? [])].map((value, index) => requireNonEmpty(value, field + '[' + index + ']'));
  const seen = new Set<string>();
  for (const value of normalized) {
    if (seen.has(value)) {
      throw new Error(field + ' contains duplicate value for provider_neutral_calendar_entry: ' + value);
    }
    seen.add(value);
  }
  return normalized;
}

function buildEntryUid(input: {
  organization_id: string;
  calendar_entry_ref: string;
  source_type: ProviderNeutralCalendarEntrySourceType;
  source_ref?: string;
  start_at: string;
}): string {
  return createHash('sha256')
    .update([input.organization_id, input.calendar_entry_ref, input.source_type, input.source_ref ?? 'manual', input.start_at].join('|'))
    .digest('hex');
}

function buildWarnings(input: {
  status: ProviderNeutralCalendarEntryStatus;
  participantCount: number;
  evidenceCount: number;
  allDay: boolean;
  hasEndAt: boolean;
}): readonly string[] {
  const warnings: string[] = [];
  if (input.status === 'CONFIRMED' && input.participantCount === 0) {
    warnings.push('confirmed_entry_has_no_participants');
  }
  if (input.evidenceCount === 0) {
    warnings.push('calendar_entry_has_no_evidence_refs');
  }
  if (!input.allDay && !input.hasEndAt) {
    warnings.push('timed_entry_has_no_end_at');
  }
  return warnings;
}

function digestRuntime(receiptWithoutDigest: Omit<ProviderNeutralCalendarEntryReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateProviderNeutralCalendarEntry(input: ProviderNeutralCalendarEntryInput): ProviderNeutralCalendarEntryReceipt {
  const forbiddenBehaviorRejections = rejectForbiddenRequests(input);
  if (forbiddenBehaviorRejections.length > 0) {
    throw new Error('provider_neutral_calendar_entry rejected forbidden behavior: ' + forbiddenBehaviorRejections.join('; '));
  }
  if (!SOURCE_TYPES.has(input.source_type)) {
    throw new Error('source_type must be MANUAL, TASK, PROJECT, ROOM, or ANNOUNCEMENT for provider_neutral_calendar_entry.');
  }
  if (!STATUSES.has(input.status)) {
    throw new Error('status must be TENTATIVE, CONFIRMED, or CANCELLED for provider_neutral_calendar_entry.');
  }
  if (!VISIBILITIES.has(input.visibility)) {
    throw new Error('visibility must be PRIVATE, TEAM, or ORGANIZATION for provider_neutral_calendar_entry.');
  }

  const organization_id = requireNonEmpty(input.organization_id, 'organization_id');
  const service_manifest_contract_id = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const calendar_entry_ref = requireNonEmpty(input.calendar_entry_ref, 'calendar_entry_ref');
  const source_ref = input.source_ref === undefined ? undefined : requireNonEmpty(input.source_ref, 'source_ref');
  if (input.source_type !== 'MANUAL' && source_ref === undefined) {
    throw new Error('source_ref is required when source_type is not MANUAL for provider_neutral_calendar_entry.');
  }
  const title = requireNonEmpty(input.title, 'title');
  const description = input.description === undefined ? undefined : requireNonEmpty(input.description, 'description');
  const start_at = requireTimestamp(input.start_at, 'start_at');
  const end_at = input.end_at === undefined ? undefined : requireTimestamp(input.end_at, 'end_at');
  if (end_at !== undefined && Date.parse(end_at) < Date.parse(start_at)) {
    throw new Error('end_at must not be before start_at for provider_neutral_calendar_entry.');
  }
  const timezone = requireNonEmpty(input.timezone, 'timezone');
  const created_by_user_id = requireNonEmpty(input.created_by_user_id, 'created_by_user_id');
  const created_at = requireTimestamp(input.created_at, 'created_at');
  const participants = normalizeParticipants(input.participants ?? []);
  const evidence_refs = normalizeStringList(input.evidence_refs, 'evidence_refs');
  const all_day = input.all_day === true;
  const entry_uid = buildEntryUid({ organization_id, calendar_entry_ref, source_type: input.source_type, source_ref, start_at });

  const provider_neutral_payload: ProviderNeutralCalendarEntryPayload = {
    entry_uid,
    source_type: input.source_type,
    ...(source_ref === undefined ? {} : { source_ref }),
    title,
    ...(description === undefined ? {} : { description }),
    status: input.status,
    visibility: input.visibility,
    start_at,
    ...(end_at === undefined ? {} : { end_at }),
    timezone,
    all_day,
    participants,
    evidence_refs,
  };

  const receiptWithoutDigest: Omit<ProviderNeutralCalendarEntryReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_PROVIDER_NEUTRAL_CALENDAR_ENTRY_SEED_ID,
    component_id: PHASE_6C_PROVIDER_NEUTRAL_CALENDAR_ENTRY_COMPONENT_ID,
    component_slug: 'workspace_calendar_meetings_rooms_announcements',
    model_name: 'Phase6CProviderNeutralCalendarEntry',
    event_name: PROVIDER_NEUTRAL_CALENDAR_ENTRY_RUNTIME_EVENT,
    organization_id,
    service_manifest_contract_id,
    calendar_entry_ref,
    created_by_user_id,
    created_at,
    provider_neutral_payload,
    provider_adapter_boundary_only: true,
    participant_count: participants.length,
    validation_warnings: buildWarnings({ status: input.status, participantCount: participants.length, evidenceCount: evidence_refs.length, allDay: all_day, hasEndAt: end_at !== undefined }),
    forbidden_behavior_rejections: [],
    metadata: input.metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestRuntime(receiptWithoutDigest),
  };
}
