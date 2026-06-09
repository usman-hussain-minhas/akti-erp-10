import { createHash } from 'node:crypto';

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

type InterviewCalendarReceiptWithoutDigest = Omit<InterviewCalendarEventRequestReceipt, 'interview_calendar_event_request_evidence_digest'>;

const PARTICIPANT_ROLES = new Set<InterviewCalendarParticipantRole>(['APPLICANT', 'INTERVIEWER', 'COORDINATOR']);
const LOCATION_MODES = new Set<InterviewCalendarLocationMode>(['REMOTE', 'ONSITE', 'HYBRID']);
const WORKSPACE_CALENDAR_REF_PREFIX = 'workspace_calendar:';
const EVENT_BUS_TOPIC_PREFIX = 'phase_6c.interview_calendar.';

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for interview_calendar_event_request runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for interview_calendar_event_request runtime.');
  }
  return normalized;
}

function rejectForbiddenRequests(input: InterviewCalendarEventRequestInput): void {
  if (input.direct_calendar_mutation_requested === true) {
    throw new Error('interview_calendar_event_request runtime must emit requests, not mutate calendar records directly.');
  }
  if (input.provider_sync_requested === true) {
    throw new Error('interview_calendar_event_request runtime must not perform provider calendar sync.');
  }
  if (input.external_credentials_requested === true) {
    throw new Error('interview_calendar_event_request runtime must not handle external provider credentials.');
  }
  if (input.schema_mutation_requested === true) {
    throw new Error('interview_calendar_event_request runtime must not mutate Prisma schema or migrations.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('interview_calendar_event_request runtime must not mutate Phase 6A surfaces.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('interview_calendar_event_request runtime must not mutate Phase 6B surfaces.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('interview_calendar_event_request runtime must not flip ticket or execution authorization flags.');
  }
}

function normalizeParticipants(participants: readonly InterviewCalendarParticipant[]): { participants: InterviewCalendarParticipant[]; requiredParticipantCount: number } {
  if (!Array.isArray(participants) || participants.length < 2) {
    throw new Error('at least applicant and interviewer participants are required for interview_calendar_event_request runtime.');
  }

  const participantRefs = new Set<string>();
  let applicantCount = 0;
  let interviewerCount = 0;
  let requiredParticipantCount = 0;

  const normalized = participants.map((participant) => {
    const participantRef = requireNonEmpty(participant.participant_ref, 'participant_ref');
    if (participantRefs.has(participantRef)) {
      throw new Error('participant_ref must be unique for interview_calendar_event_request runtime: ' + participantRef);
    }
    participantRefs.add(participantRef);
    const displayLabel = requireNonEmpty(participant.display_label, 'participant display_label');
    if (!PARTICIPANT_ROLES.has(participant.role)) {
      throw new Error('participant role is not supported for interview_calendar_event_request runtime: ' + participantRef);
    }
    if (typeof participant.required !== 'boolean') {
      throw new Error('participant required flag must be boolean for interview_calendar_event_request runtime: ' + participantRef);
    }
    if (participant.role === 'APPLICANT') {
      applicantCount += 1;
    }
    if (participant.role === 'INTERVIEWER') {
      interviewerCount += 1;
    }
    if (participant.required) {
      requiredParticipantCount += 1;
    }
    return { participant_ref: participantRef, role: participant.role, display_label: displayLabel, required: participant.required };
  });

  if (applicantCount !== 1) {
    throw new Error('exactly one APPLICANT participant is required for interview_calendar_event_request runtime.');
  }
  if (interviewerCount < 1) {
    throw new Error('at least one INTERVIEWER participant is required for interview_calendar_event_request runtime.');
  }
  if (requiredParticipantCount < 2) {
    throw new Error('at least two required participants are required for interview_calendar_event_request runtime.');
  }

  return { participants: normalized, requiredParticipantCount };
}

function resolveDispatchMode(input: InterviewCalendarEventRequestInput): {
  dispatchMode: InterviewCalendarDispatchMode;
  workspaceCalendarRef?: string;
} {
  if (typeof input.workspace_calendar_active !== 'boolean') {
    throw new Error('workspace_calendar_active must be boolean for interview_calendar_event_request runtime.');
  }
  if (input.workspace_calendar_active) {
    const workspaceCalendarRef = requireNonEmpty(input.workspace_calendar_ref, 'workspace_calendar_ref');
    if (!workspaceCalendarRef.startsWith(WORKSPACE_CALENDAR_REF_PREFIX)) {
      throw new Error('workspace_calendar_ref must identify a Workspace Calendar surface for interview_calendar_event_request runtime.');
    }
    return { dispatchMode: 'WORKSPACE_CALENDAR_EVENT_REQUEST', workspaceCalendarRef };
  }
  if (input.workspace_calendar_ref !== undefined && input.workspace_calendar_ref.trim().length > 0) {
    throw new Error('workspace_calendar_ref is only allowed when workspace_calendar_active is true for interview_calendar_event_request runtime.');
  }
  return { dispatchMode: 'EVENT_ONLY_REQUEST' };
}

function digestReceipt(receiptWithoutDigest: InterviewCalendarReceiptWithoutDigest): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateInterviewCalendarEventRequestRuntime(input: InterviewCalendarEventRequestInput): InterviewCalendarEventRequestReceipt {
  rejectForbiddenRequests(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const applicantRef = requireNonEmpty(input.applicant_ref, 'applicant_ref');
  const interviewStageCode = requireNonEmpty(input.interview_stage_code, 'interview_stage_code');
  const interviewFormRef = input.interview_form_ref === undefined ? undefined : requireNonEmpty(input.interview_form_ref, 'interview_form_ref');
  const requestedByUserId = requireNonEmpty(input.requested_by_user_id, 'requested_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const startsAt = requireTimestamp(input.starts_at, 'starts_at');
  const endsAt = requireTimestamp(input.ends_at, 'ends_at');
  if (Date.parse(startsAt) >= Date.parse(endsAt)) {
    throw new Error('starts_at must be before ends_at for interview_calendar_event_request runtime.');
  }
  const timezone = requireNonEmpty(input.timezone, 'timezone');
  if (!LOCATION_MODES.has(input.location_mode)) {
    throw new Error('location_mode is not supported for interview_calendar_event_request runtime.');
  }
  const locationRef = input.location_ref === undefined ? undefined : requireNonEmpty(input.location_ref, 'location_ref');
  if ((input.location_mode === 'ONSITE' || input.location_mode === 'HYBRID') && locationRef === undefined) {
    throw new Error('location_ref is required for ONSITE or HYBRID interview calendar requests.');
  }
  const eventBusTopic = requireNonEmpty(input.event_bus_topic, 'event_bus_topic');
  if (!eventBusTopic.startsWith(EVENT_BUS_TOPIC_PREFIX)) {
    throw new Error('event_bus_topic must use the Phase 6C interview calendar namespace.');
  }

  const participantSummary = normalizeParticipants(input.participants);
  const dispatch = resolveDispatchMode(input);

  const eventPayload: InterviewCalendarEventPayload = {
    applicant_ref: applicantRef,
    interview_stage_code: interviewStageCode,
    ...(interviewFormRef === undefined ? {} : { interview_form_ref: interviewFormRef }),
    starts_at: startsAt,
    ends_at: endsAt,
    timezone,
    location_mode: input.location_mode,
    ...(locationRef === undefined ? {} : { location_ref: locationRef }),
    participant_count: participantSummary.participants.length,
    required_participant_count: participantSummary.requiredParticipantCount,
    ...(dispatch.workspaceCalendarRef === undefined ? {} : { workspace_calendar_ref: dispatch.workspaceCalendarRef }),
  };

  const receiptWithoutDigest: InterviewCalendarReceiptWithoutDigest = {
    seed_id: PHASE_6C_INTERVIEW_CALENDAR_EVENT_REQUEST_SEED_ID,
    component_id: PHASE_6C_INTERVIEW_CALENDAR_EVENT_REQUEST_COMPONENT_ID,
    component_slug: 'hr_recruitment_and_onboarding_pipeline',
    model_name: 'Phase6CInterviewCalendarEventRequest',
    event_name: INTERVIEW_CALENDAR_EVENT_REQUEST_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    runtime_status: 'INTERVIEW_CALENDAR_REQUEST_READY',
    dispatch_mode: dispatch.dispatchMode,
    workspace_calendar_active: input.workspace_calendar_active,
    workspace_calendar_dependency_condition: 'workspace_calendar_active',
    calendar_event_mutation_allowed: false,
    provider_sync_allowed: false,
    external_credentials_allowed: false,
    event_only_fallback_allowed: true,
    event_bus_topic: eventBusTopic,
    event_payload: eventPayload,
    participants: participantSummary.participants,
    decision_refs: ['6C-RECRUIT-005'],
    evidence_artifacts: [
      'interview_calendar_event_request_runtime_receipt',
      'interview_calendar_event_request_validation_result',
      'interview_calendar_event_request_forbidden_behavior_rejection_evidence',
    ],
    control_metadata: input.control_metadata ?? {},
    requested_by_user_id: requestedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    interview_calendar_event_request_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
