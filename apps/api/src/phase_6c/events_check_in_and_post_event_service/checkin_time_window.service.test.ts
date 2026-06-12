import assert from 'node:assert/strict';

import { evaluateCheckinTimeWindow, type CheckinTimeWindowInput } from './checkin_time_window.service';

const baseInput: CheckinTimeWindowInput = {
  organization_id: 'org_phase_6c_events',
  service_manifest_contract_id: 'smc_phase_6c_checkin_time_window',
  event_config_ref: 'event_config_annual_summit',
  registration_ref: 'registration_001',
  attendee_ref: 'attendee_001',
  ticket_issue_ref: 'ticket_issue_001',
  source_record_ref: 'checkin_time_window_record_001',
  evaluated_by_user_id: 'user_phase_6c_events',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  attempted_checkin_at: '2026-07-15T09:30:00.000Z',
  window_start_at: '2026-07-15T09:00:00.000Z',
  window_end_at: '2026-07-15T18:00:00.000Z',
  timezone: 'Asia/Karachi',
  signed_ticket_token_ref: 'signed_ticket_token_001',
  person_identity_ref: 'person_identity_attendee_001',
  access_audit_ref: 'access_audit_checkin_window_001',
  crm_event_ref: 'crm_event_checkin_ref_001',
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const allowedReceipt = evaluateCheckinTimeWindow(baseInput);
assert.equal(allowedReceipt.seed_id, 'seed_6c_113_checkin_time_window');
assert.equal(allowedReceipt.component_id, '6C.09');
assert.equal(allowedReceipt.event_name, 'phase_6c.events_check_in_and_post_event_service.checkin_time_window.runtime_evaluated');
assert.equal(allowedReceipt.decision, 'CHECKIN_ALLOWED');
assert.equal(allowedReceipt.milliseconds_until_open, 0);
assert.equal(allowedReceipt.milliseconds_after_close, 0);
assert.deepEqual(allowedReceipt.adl_refs, ['ADL-024']);
assert.equal(allowedReceipt.dependency_trace.registration_context, '6C.08');
assert.equal(allowedReceipt.dependency_trace.signed_ticket_token_ref, 'signed_ticket_token_001');
assert.match(allowedReceipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateCheckinTimeWindow(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, allowedReceipt.runtime_evidence_digest);

const earlyReceipt = evaluateCheckinTimeWindow({ ...baseInput, attempted_checkin_at: '2026-07-15T08:30:00.000Z' });
assert.equal(earlyReceipt.decision, 'CHECKIN_TOO_EARLY');
assert.equal(earlyReceipt.milliseconds_until_open, 30 * 60 * 1000);

const lateReceipt = evaluateCheckinTimeWindow({ ...baseInput, attempted_checkin_at: '2026-07-15T18:30:00.000Z' });
assert.equal(lateReceipt.decision, 'CHECKIN_TOO_LATE');
assert.equal(lateReceipt.milliseconds_after_close, 30 * 60 * 1000);

const invalidWindowReceipt = evaluateCheckinTimeWindow({ ...baseInput, window_end_at: baseInput.window_start_at });
assert.equal(invalidWindowReceipt.decision, 'CHECKIN_REQUIRES_REVIEW');

assert.throws(() => evaluateCheckinTimeWindow({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateCheckinTimeWindow({ ...baseInput, attempted_checkin_at: 'not-a-date' }), /attempted_checkin_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateCheckinTimeWindow({ ...baseInput, timezone: 'not-a-timezone' }), /timezone must be an IANA timezone/);
assert.throws(() => evaluateCheckinTimeWindow({ ...baseInput, signed_ticket_token_ref: '' }), /signed_ticket_token_ref must be non-empty/);
assert.throws(() => evaluateCheckinTimeWindow({ ...baseInput, checkin_mark_requested: true }), /check-in marking is outside/);
assert.throws(() => evaluateCheckinTimeWindow({ ...baseInput, time_override_requested: true }), /time override requires/);
assert.throws(() => evaluateCheckinTimeWindow({ ...baseInput, ticket_mutation_requested: true }), /ticket mutation is outside/);
assert.throws(() => evaluateCheckinTimeWindow({ ...baseInput, audit_persistence_requested: true }), /audit persistence is deferred/);
assert.throws(() => evaluateCheckinTimeWindow({ ...baseInput, schema_mutation_requested: true }), /schema mutation is forbidden/);
assert.throws(() => evaluateCheckinTimeWindow({ ...baseInput, frontend_requested: true }), /frontend creation is outside/);

console.log('P6C runtime checkin_time_window test passed.');
