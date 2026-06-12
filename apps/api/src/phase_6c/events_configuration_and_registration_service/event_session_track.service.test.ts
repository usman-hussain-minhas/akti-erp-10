import assert from 'node:assert/strict';

import { evaluateEventSessionTrack, type EventSessionTrackInput } from './event_session_track.service';

const baseInput: EventSessionTrackInput = {
  organization_id: 'org_phase_6c_events',
  service_manifest_contract_id: 'smc_phase_6c_event_session_track',
  event_configuration_id: 'event_config_001',
  session_track_id: 'session_track_main_001',
  source_record_ref: 'event_session_track_record_001',
  configured_by_user_id: 'user_phase_6c_events',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  track_name: 'Main Operations Track',
  track_code: 'main-track-2026',
  capacity_mode: 'PER_SESSION_CAPACITY',
  sessions: [
    {
      session_ref: 'session:opening-keynote',
      title: 'Opening Keynote',
      starts_at: '2026-09-01T09:00:00.000Z',
      ends_at: '2026-09-01T10:00:00.000Z',
      capacity: 120,
      speaker_ref: 'speaker:chief-operator',
      product_catalogue_item_ref: 'product_catalogue_item:main_track_ticket',
      calendar_event_ref: 'workspace_calendar:opening_keynote',
    },
    {
      session_ref: 'session:operations-panel',
      title: 'Operations Panel',
      starts_at: '2026-09-01T10:15:00.000Z',
      ends_at: '2026-09-01T11:15:00.000Z',
      capacity: 110,
      speaker_ref: 'speaker:ops-panel',
      product_catalogue_item_ref: 'product_catalogue_item:main_track_ticket',
      calendar_event_ref: 'workspace_calendar:operations_panel',
    },
  ],
  product_catalogue_ref: 'product_catalogue:event_tracks',
  ticket_type_ref: 'ticket_type:main_track',
  paid_registration_enabled: true,
  registration_invoice_saga_ref: 'saga:event_registration_invoice_001',
  calendar_schedule: {
    enabled: true,
    condition: 'workspace_calendar_active',
    workspace_calendar_ref: 'workspace_calendar:event_ops_forum',
  },
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateEventSessionTrack(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_097_event_session_track');
assert.equal(receipt.component_id, '6C.08');
assert.equal(receipt.component_slug, 'events_configuration_and_registration_service');
assert.equal(receipt.model_name, 'Phase6CEventSessionTrack');
assert.equal(receipt.normalized_track_code, 'MAIN-TRACK-2026');
assert.equal(receipt.capacity_mode, 'PER_SESSION_CAPACITY');
assert.equal(receipt.session_count, 2);
assert.equal(receipt.earliest_session_start, '2026-09-01T09:00:00.000Z');
assert.equal(receipt.latest_session_end, '2026-09-01T11:15:00.000Z');
assert.equal(receipt.total_session_capacity, 230);
assert.equal(receipt.product_catalogue_anchor_required, true);
assert.equal(receipt.product_catalogue_ref, 'product_catalogue:event_tracks');
assert.equal(receipt.ticket_type_ref, 'ticket_type:main_track');
assert.equal(receipt.registration_invoice_saga_required, true);
assert.equal(receipt.registration_invoice_saga_ref, 'saga:event_registration_invoice_001');
assert.equal(receipt.calendar_schedule_condition, 'workspace_calendar_active');
assert.equal(receipt.calendar_target_ref, 'workspace_calendar:event_ops_forum');
assert.equal(receipt.decision, 'SESSION_TRACK_READY');
assert.deepEqual(receipt.adl_refs, ['ADL-001']);
assert.equal(receipt.refs_events_only, true);
assert.equal(receipt.direct_cross_module_write_allowed, false);
assert.equal(receipt.provider_adapter_allowed, false);
assert.equal(receipt.persistence_performed, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.frontend_surface_created, false);
assert.match(receipt.event_session_track_runtime_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateEventSessionTrack(baseInput);
assert.equal(repeatedReceipt.event_session_track_runtime_digest, receipt.event_session_track_runtime_digest);

const inheritedCapacityReceipt = evaluateEventSessionTrack({
  ...baseInput,
  session_track_id: 'session_track_inherit_001',
  capacity_mode: 'INHERIT_EVENT',
  sessions: [
    {
      session_ref: 'session:overview',
      title: 'Overview',
      starts_at: '2026-09-02T09:00:00.000Z',
      ends_at: '2026-09-02T10:00:00.000Z',
    },
  ],
  product_catalogue_ref: undefined,
  ticket_type_ref: undefined,
  paid_registration_enabled: false,
  registration_invoice_saga_ref: undefined,
  calendar_schedule: { enabled: false, condition: 'workspace_calendar_active' },
});
assert.equal(inheritedCapacityReceipt.product_catalogue_anchor_required, false);
assert.equal(inheritedCapacityReceipt.registration_invoice_saga_required, false);
assert.deepEqual(inheritedCapacityReceipt.adl_refs, []);

const fixedCapacityReceipt = evaluateEventSessionTrack({
  ...baseInput,
  session_track_id: 'session_track_fixed_001',
  capacity_mode: 'FIXED_TRACK_CAPACITY',
  track_capacity: 80,
  sessions: [
    {
      session_ref: 'session:fixed-capacity',
      title: 'Fixed Capacity',
      starts_at: '2026-09-03T09:00:00.000Z',
      ends_at: '2026-09-03T10:00:00.000Z',
    },
  ],
  product_catalogue_ref: undefined,
  ticket_type_ref: undefined,
  paid_registration_enabled: false,
  registration_invoice_saga_ref: undefined,
});
assert.equal(fixedCapacityReceipt.fixed_track_capacity, 80);

const paidWithoutTicketType = evaluateEventSessionTrack({
  ...baseInput,
  session_track_id: 'session_track_review_001',
  ticket_type_ref: undefined,
});
assert.equal(paidWithoutTicketType.decision, 'SESSION_TRACK_REQUIRES_REVIEW');

assert.throws(() => evaluateEventSessionTrack({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateEventSessionTrack({ ...baseInput, track_code: 'x' }), /track_code must be 3-64 characters/);
assert.throws(() => evaluateEventSessionTrack({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateEventSessionTrack({ ...baseInput, sessions: [] }), /at least one session is required/);
assert.throws(() => evaluateEventSessionTrack({ ...baseInput, sessions: [{ ...baseInput.sessions[0], ends_at: '2026-09-01T08:00:00.000Z' }] }), /session.ends_at must be after session.starts_at/);
assert.throws(() => evaluateEventSessionTrack({ ...baseInput, sessions: [{ ...baseInput.sessions[0] }, { ...baseInput.sessions[1], starts_at: '2026-09-01T09:30:00.000Z' }] }), /must not overlap/);
assert.throws(() => evaluateEventSessionTrack({ ...baseInput, sessions: [{ ...baseInput.sessions[0], capacity: undefined }] }), /session.capacity must be a positive integer/);
assert.throws(() => evaluateEventSessionTrack({
  ...baseInput,
  capacity_mode: 'INHERIT_EVENT',
  track_capacity: 50,
  sessions: baseInput.sessions.map((session) => ({ ...session, capacity: undefined })),
}), /track_capacity is only valid/);
assert.throws(() => evaluateEventSessionTrack({ ...baseInput, capacity_mode: 'INHERIT_EVENT', sessions: [{ ...baseInput.sessions[0], capacity: 50 }] }), /session.capacity is only valid/);
assert.throws(() => evaluateEventSessionTrack({ ...baseInput, product_catalogue_ref: undefined }), /product_catalogue_ref is required/);
assert.throws(() => evaluateEventSessionTrack({ ...baseInput, paid_registration_enabled: false, registration_invoice_saga_ref: 'saga:not_allowed' }), /registration_invoice_saga_ref is only valid/);
assert.throws(() => evaluateEventSessionTrack({ ...baseInput, registration_invoice_saga_ref: undefined }), /registration_invoice_saga_ref is required/);
assert.throws(() => evaluateEventSessionTrack({ ...baseInput, calendar_schedule: { enabled: true, condition: 'workspace_calendar_active' } }), /calendar_schedule.workspace_calendar_ref is required/);
assert.throws(() => evaluateEventSessionTrack({ ...baseInput, product_catalogue_write_requested: true }), /must reference Product Catalogue anchors/);
assert.throws(() => evaluateEventSessionTrack({ ...baseInput, finance_invoice_write_requested: true }), /must use Saga\/evidence refs/);
assert.throws(() => evaluateEventSessionTrack({ ...baseInput, payment_capture_requested: true }), /must not capture payment/);
assert.throws(() => evaluateEventSessionTrack({ ...baseInput, calendar_direct_write_requested: true }), /not write calendar data directly/);
assert.throws(() => evaluateEventSessionTrack({ ...baseInput, provider_adapter_requested: true }), /must not execute provider adapters/);
assert.throws(() => evaluateEventSessionTrack({ ...baseInput, persistence_requested: true }), /must not persist records/);
assert.throws(() => evaluateEventSessionTrack({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluateEventSessionTrack({ ...baseInput, frontend_requested: true }), /must not create frontend surfaces/);

console.log('P6C runtime event_session_track test passed.');
