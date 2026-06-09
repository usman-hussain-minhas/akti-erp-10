export const PHASE_6C_INTERVIEW_CALENDAR_EVENT_REQUEST_SEED_ID = 'seed_6c_014_interview_calendar_event_request' as const;
export const PHASE_6C_INTERVIEW_CALENDAR_EVENT_REQUEST_COMPONENT_ID = '6C.02' as const;
export const INTERVIEW_CALENDAR_EVENT_REQUEST_RUNTIME_EVENT = 'phase_6c.hr_recruitment_and_onboarding_pipeline.interview_calendar_event_request.requested' as const;

export type InterviewCalendarParticipantRole = 'APPLICANT' | 'INTERVIEWER' | 'COORDINATOR';
export type InterviewCalendarLocationMode = 'REMOTE' | 'ONSITE' | 'HYBRID';
export type InterviewCalendarDispatchMode = 'WORKSPACE_CALENDAR_EVENT_REQUEST' | 'EVENT_ONLY_REQUEST';

export type InterviewCalendarParticipant = {
  participant_ref: string;
  role: InterviewCalendarParticipantRole;
  display_label: string;
  required: boolean;
};

export type InterviewCalendarEventRequestInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  applicant_ref: string;
  interview_stage_code: string;
  interview_form_ref?: string;
  requested_by_user_id: string;
  evaluated_at: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  location_mode: InterviewCalendarLocationMode;
  location_ref?: string;
  workspace_calendar_active: boolean;
  workspace_calendar_ref?: string;
  event_bus_topic: string;
  participants: readonly InterviewCalendarParticipant[];
  control_metadata?: Record<string, unknown>;
  direct_calendar_mutation_requested?: boolean;
  provider_sync_requested?: boolean;
  external_credentials_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type InterviewCalendarEventPayload = {
  applicant_ref: string;
  interview_stage_code: string;
  interview_form_ref?: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  location_mode: InterviewCalendarLocationMode;
  location_ref?: string;
  participant_count: number;
  required_participant_count: number;
  workspace_calendar_ref?: string;
};

export type InterviewCalendarEventRequestReceipt = {
  seed_id: typeof PHASE_6C_INTERVIEW_CALENDAR_EVENT_REQUEST_SEED_ID;
  component_id: typeof PHASE_6C_INTERVIEW_CALENDAR_EVENT_REQUEST_COMPONENT_ID;
  component_slug: 'hr_recruitment_and_onboarding_pipeline';
  model_name: 'Phase6CInterviewCalendarEventRequest';
  event_name: typeof INTERVIEW_CALENDAR_EVENT_REQUEST_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: 'INTERVIEW_CALENDAR_REQUEST_READY';
  dispatch_mode: InterviewCalendarDispatchMode;
  workspace_calendar_active: boolean;
  workspace_calendar_dependency_condition: 'workspace_calendar_active';
  calendar_event_mutation_allowed: false;
  provider_sync_allowed: false;
  external_credentials_allowed: false;
  event_only_fallback_allowed: true;
  event_bus_topic: string;
  event_payload: InterviewCalendarEventPayload;
  participants: readonly InterviewCalendarParticipant[];
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  requested_by_user_id: string;
  evaluated_at: string;
  interview_calendar_event_request_evidence_digest: string;
};
