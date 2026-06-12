import assert from 'node:assert/strict';

import { evaluateCalendarOriginEventRef, type CalendarOriginEventRefInput } from './calendar_origin_event_ref.service';

const payloadHash = 'a'.repeat(64);

const baseInput: CalendarOriginEventRefInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_calendar_origin_event_ref',
  calendar_event_ref: 'calendar_event_ref_001',
  source_record_ref: 'calendar_origin_source_record_001',
  requested_by_user_id: 'user_calendar_admin',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  origin_system: 'TASKS',
  origin_component_ref: 'workspace_task_component',
  origin_event_id: 'task_event_001',
  origin_event_type: 'task_due_date_changed',
  origin_entity_ref: 'task_ref_001',
  origin_occurred_at: '2026-06-09T08:30:00.000Z',
  correlation_id: 'calendar_origin_correlation_001',
  source_event_payload_hash: payloadHash,
};

const receipt = evaluateCalendarOriginEventRef(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_092_calendar_origin_event_ref');
assert.equal(receipt.component_id, '6C.07');
assert.equal(receipt.event_name, 'phase_6c.workspace_calendar_meetings_rooms_announcements.calendar_origin_event_ref.runtime_evaluated');
assert.equal(receipt.decision, 'ACCEPTED_EVENT_REFERENCE');
assert.equal(receipt.refs_events_only, true);
assert.equal(receipt.calendar_write_executed, false);
assert.equal(receipt.origin_mutation_executed, false);
assert.equal(receipt.direct_cross_module_query_executed, false);
assert.equal(receipt.provider_sync_executed, false);
assert.equal(receipt.runtime_adapter_executed, false);
assert.equal(receipt.persistence_executed, false);
assert.equal(receipt.normalized_origin_ref.reference_mode, 'EVENT_REFERENCE_ONLY');
assert.equal(receipt.normalized_origin_ref.origin_system, 'TASKS');
assert.equal(receipt.normalized_origin_ref.source_event_payload_hash, payloadHash);
assert.match(receipt.normalized_origin_ref.origin_ref_id, /^[a-f0-9]{64}$/);
assert.deepEqual(receipt.decision_refs, ['6C-CAL-010', '6C-GLOBAL-018']);
assert.match(receipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateCalendarOriginEventRef(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, receipt.runtime_evidence_digest);
assert.equal(repeatedReceipt.normalized_origin_ref.origin_ref_id, receipt.normalized_origin_ref.origin_ref_id);

for (const originSystem of ['HR', 'TASKS', 'EVENTS', 'LMS'] as const) {
  const originReceipt = evaluateCalendarOriginEventRef({
    ...baseInput,
    origin_system: originSystem,
    origin_event_id: 'event_for_' + originSystem.toLowerCase(),
    correlation_id: 'correlation_for_' + originSystem.toLowerCase(),
  });
  assert.equal(originReceipt.normalized_origin_ref.origin_system, originSystem);
  assert.equal(originReceipt.refs_events_only, true);
}

assert.throws(() => evaluateCalendarOriginEventRef({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateCalendarOriginEventRef({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateCalendarOriginEventRef({ ...baseInput, origin_system: 'CRM' as never }), /unsupported value CRM/);
assert.throws(() => evaluateCalendarOriginEventRef({ ...baseInput, source_event_payload_hash: 'not-a-hash' }), /must be a lowercase sha256 hex digest/);
assert.throws(() => evaluateCalendarOriginEventRef({ ...baseInput, calendar_write_requested: true }), /must not write calendar events/);
assert.throws(() => evaluateCalendarOriginEventRef({ ...baseInput, origin_mutation_requested: true }), /must not mutate origin systems/);
assert.throws(() => evaluateCalendarOriginEventRef({ ...baseInput, direct_cross_module_query_requested: true }), /must not execute direct cross-module queries/);
assert.throws(() => evaluateCalendarOriginEventRef({ ...baseInput, provider_sync_requested: true }), /must not execute provider sync/);
assert.throws(() => evaluateCalendarOriginEventRef({ ...baseInput, persistence_requested: true }), /must not persist origin reference state/);
assert.throws(() => evaluateCalendarOriginEventRef({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);

console.log('P6C runtime calendar_origin_event_ref test passed.');
