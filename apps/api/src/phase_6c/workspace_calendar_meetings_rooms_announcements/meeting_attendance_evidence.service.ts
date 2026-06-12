import { createHash } from 'node:crypto';

export const PHASE_6C_MEETING_ATTENDANCE_EVIDENCE_SEED_ID = 'seed_6c_093_meeting_attendance_evidence' as const;
export const PHASE_6C_MEETING_ATTENDANCE_EVIDENCE_COMPONENT_ID = '6C.07' as const;
export const MEETING_ATTENDANCE_EVIDENCE_RUNTIME_EVENT = 'phase_6c.workspace_calendar_meetings_rooms_announcements.meeting_attendance_evidence.runtime_evaluated' as const;

export const MEETING_ATTENDANCE_EVIDENCE_DECISION_REFS = ['6C-CAL-011', '6C-GLOBAL-018'] as const;

export type MeetingAttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'LEFT_EARLY';
export type MeetingAttendanceDecision = 'EVIDENCE_READY' | 'PARTIAL_EVIDENCE_READY' | 'NO_ATTENDANCE_EVIDENCE';

export type MeetingAttendanceParticipant = {
  user_id: string;
  attendance_status: MeetingAttendanceStatus;
  scheduled_required: boolean;
  joined_at?: string;
  left_at?: string;
  source_attendance_ref: string;
};

export type MeetingAttendanceEvidenceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  meeting_ref: string;
  calendar_event_ref: string;
  source_record_ref: string;
  requested_by_user_id: string;
  evaluated_at: string;
  meeting_started_at: string;
  meeting_ended_at: string;
  participants: MeetingAttendanceParticipant[];
  correlation_id: string;
  source_event_payload_hash: string;
  workspace_write_requested?: boolean;
  provider_fetch_requested?: boolean;
  attendance_mutation_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type MeetingAttendanceEvidenceEntry = {
  evidence_id: string;
  user_id: string;
  attendance_status: MeetingAttendanceStatus;
  source_attendance_ref: string;
  duration_minutes: number | null;
  workspace_evidence_mode: 'EVENT_REFERENCE_ONLY';
};

export type MeetingAttendanceEvidenceSummary = {
  total_participants: number;
  required_participants: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  left_early_count: number;
};

export type MeetingAttendanceEvidenceReceipt = {
  seed_id: typeof PHASE_6C_MEETING_ATTENDANCE_EVIDENCE_SEED_ID;
  component_id: typeof PHASE_6C_MEETING_ATTENDANCE_EVIDENCE_COMPONENT_ID;
  component_slug: 'workspace_calendar_meetings_rooms_announcements';
  model_name: 'Phase6CMeetingAttendanceEvidence';
  event_name: typeof MEETING_ATTENDANCE_EVIDENCE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  meeting_ref: string;
  calendar_event_ref: string;
  source_record_ref: string;
  decision: MeetingAttendanceDecision;
  evidence_entries: MeetingAttendanceEvidenceEntry[];
  summary: MeetingAttendanceEvidenceSummary;
  refs_events_only: true;
  workspace_write_executed: false;
  provider_fetch_executed: false;
  attendance_mutation_executed: false;
  runtime_adapter_executed: false;
  persistence_executed: false;
  required_evidence_artifacts: readonly string[];
  decision_refs: typeof MEETING_ATTENDANCE_EVIDENCE_DECISION_REFS;
  correlation_id: string;
  source_event_payload_hash: string;
  requested_by_user_id: string;
  evaluated_at: string;
  runtime_evidence_digest: string;
};

const STATUSES = new Set<MeetingAttendanceStatus>(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'LEFT_EARLY']);
const HASH_RE = /^[a-f0-9]{64}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for meeting attendance evidence evaluation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for meeting attendance evidence evaluation.');
  }
  return normalized;
}

function normalizeHash(value: string | undefined): string {
  const normalized = requireNonEmpty(value, 'source_event_payload_hash').toLowerCase();
  if (!HASH_RE.test(normalized)) {
    throw new Error('source_event_payload_hash must be a lowercase sha256 hex digest.');
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

function durationMinutes(joinedAt: string | undefined, leftAt: string | undefined, status: MeetingAttendanceStatus): number | null {
  if (status === 'ABSENT' || status === 'EXCUSED') {
    return null;
  }
  const joined = requireTimestamp(joinedAt, 'participants.joined_at');
  const left = requireTimestamp(leftAt, 'participants.left_at');
  const duration = Math.round((Date.parse(left) - Date.parse(joined)) / 60000);
  if (duration < 0) {
    throw new Error('participants.left_at must be on or after participants.joined_at.');
  }
  return duration;
}

export function evaluateMeetingAttendanceEvidence(input: MeetingAttendanceEvidenceInput): MeetingAttendanceEvidenceReceipt {
  if (input.workspace_write_requested === true) {
    throw new Error('meeting_attendance_evidence must not write Workspace evidence inside this FFET.');
  }
  if (input.provider_fetch_requested === true) {
    throw new Error('meeting_attendance_evidence must not fetch provider attendance inside this FFET.');
  }
  if (input.attendance_mutation_requested === true) {
    throw new Error('meeting_attendance_evidence must not mutate attendance inside this FFET.');
  }
  if (input.persistence_requested === true) {
    throw new Error('meeting_attendance_evidence must not persist attendance evidence inside this FFET.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('meeting_attendance_evidence must not execute runtime adapters inside this FFET.');
  }

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const meetingRef = requireNonEmpty(input.meeting_ref, 'meeting_ref');
  const calendarEventRef = requireNonEmpty(input.calendar_event_ref, 'calendar_event_ref');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const requestedByUserId = requireNonEmpty(input.requested_by_user_id, 'requested_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const meetingStartedAt = requireTimestamp(input.meeting_started_at, 'meeting_started_at');
  const meetingEndedAt = requireTimestamp(input.meeting_ended_at, 'meeting_ended_at');
  if (Date.parse(meetingEndedAt) < Date.parse(meetingStartedAt)) {
    throw new Error('meeting_ended_at must be on or after meeting_started_at.');
  }
  const correlationId = requireNonEmpty(input.correlation_id, 'correlation_id');
  const sourceEventPayloadHash = normalizeHash(input.source_event_payload_hash);
  if (!Array.isArray(input.participants)) {
    throw new Error('participants must be an array.');
  }

  const seenUsers = new Set<string>();
  const evidenceEntries: MeetingAttendanceEvidenceEntry[] = [];
  const summary: MeetingAttendanceEvidenceSummary = {
    total_participants: input.participants.length,
    required_participants: 0,
    present_count: 0,
    absent_count: 0,
    late_count: 0,
    excused_count: 0,
    left_early_count: 0,
  };

  for (const participant of input.participants) {
    const userId = requireNonEmpty(participant.user_id, 'participants.user_id');
    if (seenUsers.has(userId)) {
      throw new Error('participants must not contain duplicate user_id ' + userId + '.');
    }
    seenUsers.add(userId);
    if (!STATUSES.has(participant.attendance_status)) {
      throw new Error('participants.attendance_status contains unsupported value ' + String(participant.attendance_status) + '.');
    }
    if (participant.scheduled_required === true) {
      summary.required_participants += 1;
    }
    const duration = durationMinutes(participant.joined_at, participant.left_at, participant.attendance_status);
    const sourceAttendanceRef = requireNonEmpty(participant.source_attendance_ref, 'participants.source_attendance_ref');
    evidenceEntries.push({
      evidence_id: digest({ calendarEventRef, meetingRef, sourceAttendanceRef, userId }),
      user_id: userId,
      attendance_status: participant.attendance_status,
      source_attendance_ref: sourceAttendanceRef,
      duration_minutes: duration,
      workspace_evidence_mode: 'EVENT_REFERENCE_ONLY',
    });
    if (participant.attendance_status === 'PRESENT') summary.present_count += 1;
    if (participant.attendance_status === 'ABSENT') summary.absent_count += 1;
    if (participant.attendance_status === 'LATE') summary.late_count += 1;
    if (participant.attendance_status === 'EXCUSED') summary.excused_count += 1;
    if (participant.attendance_status === 'LEFT_EARLY') summary.left_early_count += 1;
  }

  const decision: MeetingAttendanceDecision = evidenceEntries.length === 0
    ? 'NO_ATTENDANCE_EVIDENCE'
    : summary.absent_count + summary.excused_count > 0
      ? 'PARTIAL_EVIDENCE_READY'
      : 'EVIDENCE_READY';

  const receiptWithoutDigest: Omit<MeetingAttendanceEvidenceReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_MEETING_ATTENDANCE_EVIDENCE_SEED_ID,
    component_id: PHASE_6C_MEETING_ATTENDANCE_EVIDENCE_COMPONENT_ID,
    component_slug: 'workspace_calendar_meetings_rooms_announcements',
    model_name: 'Phase6CMeetingAttendanceEvidence',
    event_name: MEETING_ATTENDANCE_EVIDENCE_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    meeting_ref: meetingRef,
    calendar_event_ref: calendarEventRef,
    source_record_ref: sourceRecordRef,
    decision,
    evidence_entries: evidenceEntries,
    summary,
    refs_events_only: true,
    workspace_write_executed: false,
    provider_fetch_executed: false,
    attendance_mutation_executed: false,
    runtime_adapter_executed: false,
    persistence_executed: false,
    required_evidence_artifacts: [
      'meeting_attendance_evidence_runtime_receipt',
      'workspace_evidence_reference_entries',
      'attendance_summary_counts',
    ],
    decision_refs: MEETING_ATTENDANCE_EVIDENCE_DECISION_REFS,
    correlation_id: correlationId,
    source_event_payload_hash: sourceEventPayloadHash,
    requested_by_user_id: requestedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digest(receiptWithoutDigest),
  };
}
