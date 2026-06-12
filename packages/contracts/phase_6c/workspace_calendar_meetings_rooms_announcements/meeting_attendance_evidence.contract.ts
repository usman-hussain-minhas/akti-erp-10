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
