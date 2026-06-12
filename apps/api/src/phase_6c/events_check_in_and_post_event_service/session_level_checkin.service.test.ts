import assert from 'node:assert/strict';

import { evaluateSessionLevelCheckin, type SessionLevelCheckinInput } from './session_level_checkin.service';

const baseInput: SessionLevelCheckinInput = {
  organization_id: 'org_phase_6c_events',
  service_manifest_contract_id: 'smc_phase_6c_session_level_checkin',
  event_config_ref: 'event_config_annual_summit',
  session_ref: 'event_session_keynote_001',
  registration_ref: 'registration_001',
  attendee_ref: 'attendee_001',
  ticket_issue_ref: 'ticket_issue_001',
  source_record_ref: 'session_level_checkin_record_001',
  evaluated_by_user_id: 'user_phase_6c_events',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  session_eligibility_status: 'eligible',
  time_window_status: 'allowed',
  signed_ticket_token_ref: 'signed_ticket_token_001',
  kiosk_checkin_ref: 'kiosk_mode_checkin_001',
  person_identity_ref: 'person_identity_attendee_001',
  access_audit_ref: 'access_audit_session_checkin_001',
  crm_event_ref: 'crm_event_checkin_ref_001',
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const allowedReceipt = evaluateSessionLevelCheckin(baseInput);
assert.equal(allowedReceipt.seed_id, 'seed_6c_115_session_level_checkin');
assert.equal(allowedReceipt.component_id, '6C.09');
assert.equal(allowedReceipt.event_name, 'phase_6c.events_check_in_and_post_event_service.session_level_checkin.runtime_evaluated');
assert.equal(allowedReceipt.decision, 'SESSION_CHECKIN_ALLOWED');
assert.equal(allowedReceipt.dependency_trace.registration_context, '6C.08');
assert.equal(allowedReceipt.dependency_trace.signed_ticket_token_ref, 'signed_ticket_token_001');
assert.deepEqual(allowedReceipt.decision_refs, ['6C-EVENT-CHECK-005', '6C-EVENT-CHECK-014', '6C-GLOBAL-018']);
assert.match(allowedReceipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateSessionLevelCheckin(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, allowedReceipt.runtime_evidence_digest);

assert.equal(evaluateSessionLevelCheckin({ ...baseInput, prior_session_checkin_ref: 'session_checkin_existing_001' }).decision, 'ALREADY_CHECKED_IN');
assert.equal(evaluateSessionLevelCheckin({ ...baseInput, session_eligibility_status: 'not_registered' }).decision, 'SESSION_NOT_ELIGIBLE');
assert.equal(evaluateSessionLevelCheckin({ ...baseInput, session_eligibility_status: 'capacity_blocked' }).decision, 'SESSION_NOT_ELIGIBLE');
assert.equal(evaluateSessionLevelCheckin({ ...baseInput, time_window_status: 'too_early' }).decision, 'WINDOW_REJECTED');
assert.equal(evaluateSessionLevelCheckin({ ...baseInput, session_eligibility_status: 'review' }).decision, 'SESSION_CHECKIN_REQUIRES_REVIEW');

assert.throws(() => evaluateSessionLevelCheckin({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateSessionLevelCheckin({ ...baseInput, session_ref: '' }), /session_ref is required/);
assert.throws(() => evaluateSessionLevelCheckin({ ...baseInput, prior_session_checkin_ref: '' }), /prior_session_checkin_ref must be non-empty/);
assert.throws(() => evaluateSessionLevelCheckin({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateSessionLevelCheckin({ ...baseInput, checkin_record_requested: true }), /check-in record creation is outside/);
assert.throws(() => evaluateSessionLevelCheckin({ ...baseInput, session_capacity_mutation_requested: true }), /session capacity mutation is outside/);
assert.throws(() => evaluateSessionLevelCheckin({ ...baseInput, attendance_persistence_requested: true }), /attendance persistence is deferred/);
assert.throws(() => evaluateSessionLevelCheckin({ ...baseInput, ticket_mutation_requested: true }), /ticket mutation is outside/);
assert.throws(() => evaluateSessionLevelCheckin({ ...baseInput, schema_mutation_requested: true }), /schema mutation is forbidden/);
assert.throws(() => evaluateSessionLevelCheckin({ ...baseInput, frontend_requested: true }), /frontend creation is outside/);

console.log('P6C runtime session_level_checkin test passed.');
