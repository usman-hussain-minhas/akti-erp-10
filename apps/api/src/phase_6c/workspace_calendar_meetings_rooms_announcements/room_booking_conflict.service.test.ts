import assert from 'node:assert/strict';

import { evaluateRoomBookingConflict, type RoomBookingConflictInput } from './room_booking_conflict.service';

const baseInput: RoomBookingConflictInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_room_booking_conflict',
  candidate_booking: {
    booking_ref: 'booking_candidate_001',
    resource_ref: 'room_boardroom_a',
    start_at: '2026-06-25T10:00:00.000Z',
    end_at: '2026-06-25T11:00:00.000Z',
    status: 'REQUESTED',
    attendee_count: 12,
  },
  requested_resources: [{ resource_ref: 'room_boardroom_a', resource_type: 'ROOM', capacity: 10 }],
  existing_bookings: [
    {
      booking_ref: 'booking_existing_overlap',
      resource_ref: 'room_boardroom_a',
      start_at: '2026-06-25T10:30:00.000Z',
      end_at: '2026-06-25T11:30:00.000Z',
      status: 'CONFIRMED',
      attendee_count: 4,
    },
    {
      booking_ref: 'booking_cancelled_overlap',
      resource_ref: 'room_boardroom_a',
      start_at: '2026-06-25T10:15:00.000Z',
      end_at: '2026-06-25T10:45:00.000Z',
      status: 'CANCELLED',
    },
  ],
  evaluated_by_user_id: 'user_room_admin',
  evaluated_at: '2026-06-18T14:00:00.000Z',
  metadata: { source: 'phase_6c_room_booking_conflict_test' },
};

const receipt = evaluateRoomBookingConflict(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_086_room_booking_conflict');
assert.equal(receipt.component_id, '6C.07');
assert.equal(receipt.component_slug, 'workspace_calendar_meetings_rooms_announcements');
assert.equal(receipt.model_name, 'Phase6CRoomBookingConflict');
assert.equal(receipt.event_name, 'phase_6c.workspace_calendar_meetings_rooms_announcements.room_booking_conflict.runtime_evaluated');
assert.equal(receipt.conflict_severity, 'BLOCKING');
assert.equal(receipt.conflict_count, 2);
assert.equal(receipt.findings[0]?.reason, 'RESOURCE_TIME_OVERLAP');
assert.equal(receipt.findings[0]?.overlap_start_at, '2026-06-25T10:30:00.000Z');
assert.equal(receipt.findings[0]?.overlap_end_at, '2026-06-25T11:00:00.000Z');
assert.equal(receipt.findings[1]?.reason, 'CAPACITY_EXCEEDED');
assert.deepEqual(receipt.validation_warnings, []);
assert.match(receipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateRoomBookingConflict(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, receipt.runtime_evidence_digest);
assert.equal(repeatedReceipt.findings[0]?.conflict_ref, receipt.findings[0]?.conflict_ref);

const cleanReceipt = evaluateRoomBookingConflict({
  ...baseInput,
  candidate_booking: { ...baseInput.candidate_booking, booking_ref: 'booking_clean', start_at: '2026-06-25T12:00:00.000Z', end_at: '2026-06-25T13:00:00.000Z', attendee_count: 8 },
});
assert.equal(cleanReceipt.conflict_severity, 'NONE');
assert.equal(cleanReceipt.conflict_count, 0);

const warningReceipt = evaluateRoomBookingConflict({
  ...baseInput,
  candidate_booking: { ...baseInput.candidate_booking, booking_ref: 'booking_warning', start_at: '2026-06-25T12:00:00.000Z', end_at: '2026-06-25T13:00:00.000Z', attendee_count: undefined },
  requested_resources: [{ resource_ref: 'room_boardroom_a', resource_type: 'ROOM' }],
});
assert.deepEqual(warningReceipt.validation_warnings, ['candidate_booking_has_no_attendee_count', 'room_resource_has_no_capacity_metadata']);

assert.throws(() => evaluateRoomBookingConflict({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateRoomBookingConflict({ ...baseInput, candidate_booking: { ...baseInput.candidate_booking, end_at: '2026-06-25T09:00:00.000Z' } }), /end_at must be after start_at/);
assert.throws(() => evaluateRoomBookingConflict({ ...baseInput, candidate_booking: { ...baseInput.candidate_booking, status: 'CANCELLED' } }), /candidate_booking must not be CANCELLED/);
assert.throws(() => evaluateRoomBookingConflict({ ...baseInput, requested_resources: [] }), /at least one requested resource is required/);
assert.throws(() => evaluateRoomBookingConflict({
  ...baseInput,
  requested_resources: [
    { resource_ref: 'room_boardroom_a', resource_type: 'ROOM' },
    { resource_ref: 'room_boardroom_a', resource_type: 'ROOM' },
  ],
}), /duplicate requested resource/);
assert.throws(() => evaluateRoomBookingConflict({ ...baseInput, candidate_booking: { ...baseInput.candidate_booking, resource_ref: 'room_missing' } }), /candidate_booking.resource_ref must be included/);
assert.throws(() => evaluateRoomBookingConflict({ ...baseInput, requested_resources: [{ resource_ref: 'resource_1', resource_type: 'VEHICLE' as never }] }), /resource_type must be ROOM or EQUIPMENT/);
assert.throws(() => evaluateRoomBookingConflict({ ...baseInput, booking_write_requested: true }), /booking writes are outside this FFET/);
assert.throws(() => evaluateRoomBookingConflict({ ...baseInput, calendar_write_requested: true }), /calendar writes are outside this FFET/);
assert.throws(() => evaluateRoomBookingConflict({ ...baseInput, provider_sync_requested: true }), /provider sync is outside this FFET/);
assert.throws(() => evaluateRoomBookingConflict({ ...baseInput, cross_phase_write_requested: true }), /cross-phase writes are forbidden/);
assert.throws(() => evaluateRoomBookingConflict({ ...baseInput, authorization_flag_change_requested: true }), /authorization flag changes are human-gated/);

console.log('P6C runtime room_booking_conflict test passed.');
