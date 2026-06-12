import { createHash } from 'node:crypto';

export const PHASE_6C_TASK_PROJECT_CALENDAR_EVENT_SEED_ID = 'seed_6c_082_task_project_calendar_event' as const;
export const PHASE_6C_TASK_PROJECT_CALENDAR_EVENT_COMPONENT_ID = '6C.06' as const;
export const TASK_PROJECT_CALENDAR_EVENT_RUNTIME_EVENT = 'phase_6c.workspace_tasks_projects_documents_and_knowledge.task_project_calendar_event.runtime_evaluated' as const;

type TaskProjectCalendarEventSourceType = 'TASK' | 'PROJECT' | 'MILESTONE';
type TaskProjectCalendarEventKind = 'DUE_DATE' | 'WORK_WINDOW' | 'MILESTONE_DATE' | 'REMINDER_WINDOW';
type TaskProjectCalendarEventVisibility = 'PRIVATE' | 'TEAM' | 'ORGANIZATION';
type TaskProjectCalendarEventStatus = 'READY_FOR_CALENDAR_CONSUMPTION' | 'DEFERRED_INCOMPLETE_SOURCE';

type TaskProjectCalendarEventParticipantRef = {
  participant_ref: string;
  role: 'OWNER' | 'ASSIGNEE' | 'WATCHER';
};

export type TaskProjectCalendarEventInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_type: TaskProjectCalendarEventSourceType;
  source_ref: string;
  event_ref: string;
  event_kind: TaskProjectCalendarEventKind;
  title: string;
  start_at: string;
  end_at?: string;
  all_day?: boolean;
  timezone: string;
  visibility: TaskProjectCalendarEventVisibility;
  generated_by_user_id: string;
  generated_at: string;
  participants?: readonly TaskProjectCalendarEventParticipantRef[];
  calendar_surface_active?: boolean;
  workspace_collaboration_surface_active?: boolean;
  collaboration_context_ref?: string;
  evidence_refs?: readonly string[];
  metadata?: Record<string, unknown>;
  calendar_write_requested?: boolean;
  external_provider_sync_requested?: boolean;
  direct_calendar_mutation_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
  cross_phase_write_requested?: boolean;
  frontend_route_requested?: boolean;
  authorization_flag_change_requested?: boolean;
};

type TaskProjectCalendarEventPayload = {
  event_uid: string;
  source_type: TaskProjectCalendarEventSourceType;
  source_ref: string;
  event_ref: string;
  event_kind: TaskProjectCalendarEventKind;
  title: string;
  start_at: string;
  end_at?: string;
  all_day: boolean;
  timezone: string;
  visibility: TaskProjectCalendarEventVisibility;
  participants: readonly TaskProjectCalendarEventParticipantRef[];
  evidence_refs: readonly string[];
};

export type TaskProjectCalendarEventReceipt = {
  seed_id: typeof PHASE_6C_TASK_PROJECT_CALENDAR_EVENT_SEED_ID;
  component_id: typeof PHASE_6C_TASK_PROJECT_CALENDAR_EVENT_COMPONENT_ID;
  component_slug: 'workspace_tasks_projects_documents_and_knowledge';
  model_name: 'Phase6CTaskProjectCalendarEvent';
  event_name: typeof TASK_PROJECT_CALENDAR_EVENT_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  generated_by_user_id: string;
  generated_at: string;
  status: TaskProjectCalendarEventStatus;
  calendar_surface_active: boolean;
  workspace_collaboration_surface_active: boolean;
  collaboration_context_ref?: string;
  calendar_payload: TaskProjectCalendarEventPayload;
  validation_warnings: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};

const SOURCE_TYPES = new Set<TaskProjectCalendarEventSourceType>(['TASK', 'PROJECT', 'MILESTONE']);
const EVENT_KINDS = new Set<TaskProjectCalendarEventKind>(['DUE_DATE', 'WORK_WINDOW', 'MILESTONE_DATE', 'REMINDER_WINDOW']);
const VISIBILITIES = new Set<TaskProjectCalendarEventVisibility>(['PRIVATE', 'TEAM', 'ORGANIZATION']);
const PARTICIPANT_ROLES = new Set<TaskProjectCalendarEventParticipantRef['role']>(['OWNER', 'ASSIGNEE', 'WATCHER']);

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for task_project_calendar_event runtime evaluation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  const timestampMs = Date.parse(normalized);
  if (!Number.isFinite(timestampMs)) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for task_project_calendar_event runtime evaluation.');
  }
  return new Date(timestampMs).toISOString();
}

function rejectForbiddenRequests(input: TaskProjectCalendarEventInput): readonly string[] {
  const rejected: string[] = [];
  const forbiddenFlags: Array<[keyof TaskProjectCalendarEventInput, string]> = [
    ['calendar_write_requested', 'calendar writes are forbidden; emit provider-neutral consumption payload only'],
    ['external_provider_sync_requested', 'external provider sync is outside this FFET'],
    ['direct_calendar_mutation_requested', 'direct calendar mutation is forbidden; refs/events only'],
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

function normalizeParticipants(participants: readonly TaskProjectCalendarEventParticipantRef[]): readonly TaskProjectCalendarEventParticipantRef[] {
  const seen = new Set<string>();
  return participants.map((participant, index) => {
    const participant_ref = requireNonEmpty(participant.participant_ref, 'participants[' + index + '].participant_ref');
    if (!PARTICIPANT_ROLES.has(participant.role)) {
      throw new Error('participants[' + index + '].role must be OWNER, ASSIGNEE, or WATCHER.');
    }
    const key = participant_ref + ':' + participant.role;
    if (seen.has(key)) {
      throw new Error('duplicate participant role is not allowed for task_project_calendar_event: ' + key);
    }
    seen.add(key);
    return { participant_ref, role: participant.role };
  });
}

function normalizeStringList(values: readonly string[] | undefined, field: string): readonly string[] {
  const normalized = [...(values ?? [])].map((value, index) => requireNonEmpty(value, field + '[' + index + ']'));
  const seen = new Set<string>();
  for (const value of normalized) {
    if (seen.has(value)) {
      throw new Error(field + ' contains duplicate value for task_project_calendar_event: ' + value);
    }
    seen.add(value);
  }
  return normalized;
}

function buildEventUid(input: {
  organization_id: string;
  source_type: TaskProjectCalendarEventSourceType;
  source_ref: string;
  event_ref: string;
  start_at: string;
}): string {
  return createHash('sha256')
    .update([input.organization_id, input.source_type, input.source_ref, input.event_ref, input.start_at].join('|'))
    .digest('hex');
}

function buildWarnings(input: {
  calendarSurfaceActive: boolean;
  participantCount: number;
  evidenceCount: number;
  hasEndAt: boolean;
  eventKind: TaskProjectCalendarEventKind;
}): readonly string[] {
  const warnings: string[] = [];
  if (!input.calendarSurfaceActive) {
    warnings.push('calendar_surface_inactive_payload_ready_for_later_consumption');
  }
  if (input.participantCount === 0) {
    warnings.push('calendar_event_has_no_participants');
  }
  if (input.evidenceCount === 0) {
    warnings.push('calendar_event_has_no_evidence_refs');
  }
  if (input.eventKind === 'WORK_WINDOW' && !input.hasEndAt) {
    warnings.push('work_window_has_no_end_at');
  }
  return warnings;
}

function digestRuntime(receiptWithoutDigest: Omit<TaskProjectCalendarEventReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateTaskProjectCalendarEvent(input: TaskProjectCalendarEventInput): TaskProjectCalendarEventReceipt {
  const forbiddenBehaviorRejections = rejectForbiddenRequests(input);
  if (forbiddenBehaviorRejections.length > 0) {
    throw new Error('task_project_calendar_event rejected forbidden behavior: ' + forbiddenBehaviorRejections.join('; '));
  }
  if (!SOURCE_TYPES.has(input.source_type)) {
    throw new Error('source_type must be TASK, PROJECT, or MILESTONE for task_project_calendar_event runtime evaluation.');
  }
  if (!EVENT_KINDS.has(input.event_kind)) {
    throw new Error('event_kind must be DUE_DATE, WORK_WINDOW, MILESTONE_DATE, or REMINDER_WINDOW.');
  }
  if (!VISIBILITIES.has(input.visibility)) {
    throw new Error('visibility must be PRIVATE, TEAM, or ORGANIZATION for task_project_calendar_event runtime evaluation.');
  }

  const organization_id = requireNonEmpty(input.organization_id, 'organization_id');
  const service_manifest_contract_id = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const source_ref = requireNonEmpty(input.source_ref, 'source_ref');
  const event_ref = requireNonEmpty(input.event_ref, 'event_ref');
  const title = requireNonEmpty(input.title, 'title');
  const start_at = requireTimestamp(input.start_at, 'start_at');
  const end_at = input.end_at === undefined ? undefined : requireTimestamp(input.end_at, 'end_at');
  if (end_at !== undefined && Date.parse(end_at) < Date.parse(start_at)) {
    throw new Error('end_at must not be before start_at for task_project_calendar_event runtime evaluation.');
  }
  const timezone = requireNonEmpty(input.timezone, 'timezone');
  const generated_by_user_id = requireNonEmpty(input.generated_by_user_id, 'generated_by_user_id');
  const generated_at = requireTimestamp(input.generated_at, 'generated_at');
  const participants = normalizeParticipants(input.participants ?? []);
  const evidence_refs = normalizeStringList(input.evidence_refs, 'evidence_refs');
  const calendar_surface_active = input.calendar_surface_active === true;
  const workspace_collaboration_surface_active = input.workspace_collaboration_surface_active === true;
  const collaboration_context_ref = input.collaboration_context_ref === undefined
    ? undefined
    : requireNonEmpty(input.collaboration_context_ref, 'collaboration_context_ref');
  if (collaboration_context_ref !== undefined && !workspace_collaboration_surface_active) {
    throw new Error('collaboration_context_ref requires workspace_collaboration_surface_active for task_project_calendar_event.');
  }

  const event_uid = buildEventUid({ organization_id, source_type: input.source_type, source_ref, event_ref, start_at });
  const calendar_payload: TaskProjectCalendarEventPayload = {
    event_uid,
    source_type: input.source_type,
    source_ref,
    event_ref,
    event_kind: input.event_kind,
    title,
    start_at,
    ...(end_at === undefined ? {} : { end_at }),
    all_day: input.all_day === true,
    timezone,
    visibility: input.visibility,
    participants,
    evidence_refs,
  };
  const validation_warnings = buildWarnings({
    calendarSurfaceActive: calendar_surface_active,
    participantCount: participants.length,
    evidenceCount: evidence_refs.length,
    hasEndAt: end_at !== undefined,
    eventKind: input.event_kind,
  });

  const receiptWithoutDigest: Omit<TaskProjectCalendarEventReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_TASK_PROJECT_CALENDAR_EVENT_SEED_ID,
    component_id: PHASE_6C_TASK_PROJECT_CALENDAR_EVENT_COMPONENT_ID,
    component_slug: 'workspace_tasks_projects_documents_and_knowledge',
    model_name: 'Phase6CTaskProjectCalendarEvent',
    event_name: TASK_PROJECT_CALENDAR_EVENT_RUNTIME_EVENT,
    organization_id,
    service_manifest_contract_id,
    generated_by_user_id,
    generated_at,
    status: validation_warnings.includes('calendar_surface_inactive_payload_ready_for_later_consumption') ? 'DEFERRED_INCOMPLETE_SOURCE' : 'READY_FOR_CALENDAR_CONSUMPTION',
    calendar_surface_active,
    workspace_collaboration_surface_active,
    ...(collaboration_context_ref === undefined ? {} : { collaboration_context_ref }),
    calendar_payload,
    validation_warnings,
    forbidden_behavior_rejections: [],
    metadata: input.metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestRuntime(receiptWithoutDigest),
  };
}
