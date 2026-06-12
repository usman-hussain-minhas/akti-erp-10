import assert from 'node:assert/strict';

import { evaluateKioskModeCheckin, type KioskModeCheckinInput } from './kiosk_mode_checkin.service';

const baseInput: KioskModeCheckinInput = {
  organization_id: 'org_phase_6c_events',
  service_manifest_contract_id: 'smc_phase_6c_kiosk_mode_checkin',
  event_config_ref: 'event_config_annual_summit',
  kiosk_session_ref: 'kiosk_session_001',
  kiosk_device_ref: 'kiosk_device_front_desk_001',
  registration_ref: 'registration_001',
  attendee_ref: 'attendee_001',
  ticket_issue_ref: 'ticket_issue_001',
  source_record_ref: 'kiosk_mode_checkin_record_001',
  evaluated_by_user_id: 'user_phase_6c_events',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  kiosk_mode_active: true,
  token_status: 'valid',
  time_window_status: 'allowed',
  signed_ticket_token_ref: 'signed_ticket_token_001',
  checkin_time_window_ref: 'checkin_time_window_001',
  person_identity_ref: 'person_identity_attendee_001',
  access_audit_ref: 'access_audit_kiosk_checkin_001',
  crm_event_ref: 'crm_event_checkin_ref_001',
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const allowedReceipt = evaluateKioskModeCheckin(baseInput);
assert.equal(allowedReceipt.seed_id, 'seed_6c_114_kiosk_mode_checkin');
assert.equal(allowedReceipt.component_id, '6C.09');
assert.equal(allowedReceipt.event_name, 'phase_6c.events_check_in_and_post_event_service.kiosk_mode_checkin.runtime_evaluated');
assert.equal(allowedReceipt.decision, 'KIOSK_CHECKIN_ALLOWED');
assert.equal(allowedReceipt.dependency_trace.registration_context, '6C.08');
assert.equal(allowedReceipt.dependency_trace.signed_ticket_token_ref, 'signed_ticket_token_001');
assert.equal(allowedReceipt.dependency_trace.checkin_time_window_ref, 'checkin_time_window_001');
assert.deepEqual(allowedReceipt.decision_refs, ['6C-EVENT-CHECK-004', '6C-EVENT-CHECK-014', '6C-GLOBAL-018']);
assert.match(allowedReceipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateKioskModeCheckin(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, allowedReceipt.runtime_evidence_digest);

assert.equal(evaluateKioskModeCheckin({ ...baseInput, kiosk_mode_active: false }).decision, 'KIOSK_DISABLED');
assert.equal(evaluateKioskModeCheckin({ ...baseInput, token_status: 'expired' }).decision, 'TOKEN_REJECTED');
assert.equal(evaluateKioskModeCheckin({ ...baseInput, token_status: 'missing' }).decision, 'TOKEN_REJECTED');
assert.equal(evaluateKioskModeCheckin({ ...baseInput, time_window_status: 'too_late' }).decision, 'WINDOW_REJECTED');
assert.equal(evaluateKioskModeCheckin({ ...baseInput, time_window_status: 'review' }).decision, 'KIOSK_REQUIRES_REVIEW');

assert.throws(() => evaluateKioskModeCheckin({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateKioskModeCheckin({ ...baseInput, kiosk_session_ref: '' }), /kiosk_session_ref is required/);
assert.throws(() => evaluateKioskModeCheckin({ ...baseInput, signed_ticket_token_ref: '' }), /signed_ticket_token_ref must be non-empty/);
assert.throws(() => evaluateKioskModeCheckin({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateKioskModeCheckin({ ...baseInput, checkin_mark_requested: true }), /check-in marking is outside/);
assert.throws(() => evaluateKioskModeCheckin({ ...baseInput, kiosk_ui_session_requested: true }), /kiosk UI\/session creation is outside/);
assert.throws(() => evaluateKioskModeCheckin({ ...baseInput, device_enrollment_requested: true }), /device enrollment is outside/);
assert.throws(() => evaluateKioskModeCheckin({ ...baseInput, token_override_requested: true }), /token override requires/);
assert.throws(() => evaluateKioskModeCheckin({ ...baseInput, persistence_requested: true }), /persistence is outside/);
assert.throws(() => evaluateKioskModeCheckin({ ...baseInput, schema_mutation_requested: true }), /schema mutation is forbidden/);
assert.throws(() => evaluateKioskModeCheckin({ ...baseInput, frontend_requested: true }), /frontend creation is outside/);

console.log('P6C runtime kiosk_mode_checkin test passed.');
