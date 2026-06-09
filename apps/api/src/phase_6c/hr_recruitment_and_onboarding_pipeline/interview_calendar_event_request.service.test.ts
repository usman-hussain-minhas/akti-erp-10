import assert from 'node:assert/strict';

import { evaluateInterviewCalendarEventRequestRuntime, type InterviewCalendarEventRequestInput } from './interview_calendar_event_request.service';

const baseInput: InterviewCalendarEventRequestInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_interview_calendar_event_request',
  source_record_ref: 'interview_request_001',
  applicant_ref: 'applicant_123',
  interview_stage_code: 'technical_review',
  interview_form_ref: 'configuration_engine:interview_scorecard:v1',
  requested_by_user_id: 'user_phase_6c_recruiter',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  starts_at: '2026-06-10T10:00:00.000Z',
  ends_at: '2026-06-10T11:00:00.000Z',
  timezone: 'Asia/Karachi',
  location_mode: 'HYBRID',
  location_ref: 'room:lahore:interview-1',
  workspace_calendar_active: true,
  workspace_calendar_ref: 'workspace_calendar:primary_hr_calendar',
  event_bus_topic: 'phase_6c.interview_calendar.requested',
  participants: [
    { participant_ref: 'applicant_123', role: 'APPLICANT', display_label: 'Applicant', required: true },
    { participant_ref: 'employee_interviewer_1', role: 'INTERVIEWER', display_label: 'Interviewer 1', required: true },
    { participant_ref: 'employee_coordinator_1', role: 'COORDINATOR', display_label: 'Coordinator', required: false },
  ],
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateInterviewCalendarEventRequestRuntime(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_014_interview_calendar_event_request');
assert.equal(receipt.component_id, '6C.02');
assert.equal(receipt.component_slug, 'hr_recruitment_and_onboarding_pipeline');
assert.equal(receipt.model_name, 'Phase6CInterviewCalendarEventRequest');
assert.equal(receipt.event_name, 'phase_6c.hr_recruitment_and_onboarding_pipeline.interview_calendar_event_request.requested');
assert.equal(receipt.runtime_status, 'INTERVIEW_CALENDAR_REQUEST_READY');
assert.equal(receipt.dispatch_mode, 'WORKSPACE_CALENDAR_EVENT_REQUEST');
assert.equal(receipt.workspace_calendar_active, true);
assert.equal(receipt.workspace_calendar_dependency_condition, 'workspace_calendar_active');
assert.equal(receipt.calendar_event_mutation_allowed, false);
assert.equal(receipt.provider_sync_allowed, false);
assert.equal(receipt.external_credentials_allowed, false);
assert.equal(receipt.event_only_fallback_allowed, true);
assert.equal(receipt.event_payload.workspace_calendar_ref, 'workspace_calendar:primary_hr_calendar');
assert.equal(receipt.event_payload.participant_count, 3);
assert.equal(receipt.event_payload.required_participant_count, 2);
assert.deepEqual(receipt.decision_refs, ['6C-RECRUIT-005']);
assert.match(receipt.interview_calendar_event_request_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateInterviewCalendarEventRequestRuntime(baseInput);
assert.equal(repeatedReceipt.interview_calendar_event_request_evidence_digest, receipt.interview_calendar_event_request_evidence_digest);

const eventOnlyReceipt = evaluateInterviewCalendarEventRequestRuntime({
  ...baseInput,
  workspace_calendar_active: false,
  workspace_calendar_ref: undefined,
  location_mode: 'REMOTE',
  location_ref: undefined,
});
assert.equal(eventOnlyReceipt.dispatch_mode, 'EVENT_ONLY_REQUEST');
assert.equal(eventOnlyReceipt.event_payload.workspace_calendar_ref, undefined);
assert.equal(eventOnlyReceipt.event_only_fallback_allowed, true);

assert.throws(() => evaluateInterviewCalendarEventRequestRuntime({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateInterviewCalendarEventRequestRuntime({ ...baseInput, starts_at: 'not-a-date' }), /starts_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateInterviewCalendarEventRequestRuntime({ ...baseInput, starts_at: baseInput.ends_at }), /starts_at must be before ends_at/);
assert.throws(() => evaluateInterviewCalendarEventRequestRuntime({ ...baseInput, location_mode: 'TELEPORT' as never }), /location_mode is not supported/);
assert.throws(() => evaluateInterviewCalendarEventRequestRuntime({ ...baseInput, location_mode: 'ONSITE', location_ref: undefined }), /location_ref is required/);
assert.throws(() => evaluateInterviewCalendarEventRequestRuntime({ ...baseInput, event_bus_topic: 'calendar.requested' }), /Phase 6C interview calendar namespace/);
assert.throws(() => evaluateInterviewCalendarEventRequestRuntime({ ...baseInput, workspace_calendar_ref: 'calendar:wrong' }), /must identify a Workspace Calendar surface/);
assert.throws(() => evaluateInterviewCalendarEventRequestRuntime({ ...baseInput, workspace_calendar_active: false, workspace_calendar_ref: 'workspace_calendar:primary_hr_calendar' }), /only allowed when workspace_calendar_active is true/);
assert.throws(() => evaluateInterviewCalendarEventRequestRuntime({ ...baseInput, participants: [] }), /at least applicant and interviewer participants/);
assert.throws(() => evaluateInterviewCalendarEventRequestRuntime({
  ...baseInput,
  participants: [
    baseInput.participants[0]!,
    { ...baseInput.participants[1]!, participant_ref: baseInput.participants[0]!.participant_ref },
  ],
}), /participant_ref must be unique/);
assert.throws(() => evaluateInterviewCalendarEventRequestRuntime({
  ...baseInput,
  participants: [
    { ...baseInput.participants[0]!, role: 'COORDINATOR' },
    baseInput.participants[1]!,
  ],
}), /exactly one APPLICANT participant/);
assert.throws(() => evaluateInterviewCalendarEventRequestRuntime({
  ...baseInput,
  participants: [
    baseInput.participants[0]!,
    { ...baseInput.participants[2]!, required: true },
  ],
}), /at least one INTERVIEWER participant/);
assert.throws(() => evaluateInterviewCalendarEventRequestRuntime({
  ...baseInput,
  participants: [
    { ...baseInput.participants[0]!, required: false },
    { ...baseInput.participants[1]!, required: true },
  ],
}), /at least two required participants/);
assert.throws(() => evaluateInterviewCalendarEventRequestRuntime({ ...baseInput, direct_calendar_mutation_requested: true }), /emit requests, not mutate calendar records directly/);
assert.throws(() => evaluateInterviewCalendarEventRequestRuntime({ ...baseInput, provider_sync_requested: true }), /must not perform provider calendar sync/);
assert.throws(() => evaluateInterviewCalendarEventRequestRuntime({ ...baseInput, external_credentials_requested: true }), /must not handle external provider credentials/);
assert.throws(() => evaluateInterviewCalendarEventRequestRuntime({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateInterviewCalendarEventRequestRuntime({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateInterviewCalendarEventRequestRuntime({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateInterviewCalendarEventRequestRuntime({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket or execution authorization flags/);

console.log('P6C runtime interview_calendar_event_request test passed.');
