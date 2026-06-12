import assert from 'node:assert/strict';

import { evaluateMeetingAttendanceEvidence, type MeetingAttendanceEvidenceInput } from './meeting_attendance_evidence.service';

const payloadHash = 'b'.repeat(64);

const baseInput: MeetingAttendanceEvidenceInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_meeting_attendance_evidence',
  meeting_ref: 'meeting_ref_001',
  calendar_event_ref: 'calendar_event_ref_001',
  source_record_ref: 'meeting_attendance_source_record_001',
  requested_by_user_id: 'user_meeting_admin',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  meeting_started_at: '2026-06-09T08:00:00.000Z',
  meeting_ended_at: '2026-06-09T09:00:00.000Z',
  correlation_id: 'meeting_attendance_correlation_001',
  source_event_payload_hash: payloadHash,
  participants: [
    {
      user_id: 'user_present',
      attendance_status: 'PRESENT',
      scheduled_required: true,
      joined_at: '2026-06-09T08:00:00.000Z',
      left_at: '2026-06-09T09:00:00.000Z',
      source_attendance_ref: 'attendance_ref_present',
    },
    {
      user_id: 'user_absent',
      attendance_status: 'ABSENT',
      scheduled_required: true,
      source_attendance_ref: 'attendance_ref_absent',
    },
    {
      user_id: 'user_late',
      attendance_status: 'LATE',
      scheduled_required: false,
      joined_at: '2026-06-09T08:15:00.000Z',
      left_at: '2026-06-09T09:00:00.000Z',
      source_attendance_ref: 'attendance_ref_late',
    },
  ],
};

const receipt = evaluateMeetingAttendanceEvidence(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_093_meeting_attendance_evidence');
assert.equal(receipt.component_id, '6C.07');
assert.equal(receipt.event_name, 'phase_6c.workspace_calendar_meetings_rooms_announcements.meeting_attendance_evidence.runtime_evaluated');
assert.equal(receipt.decision, 'PARTIAL_EVIDENCE_READY');
assert.equal(receipt.refs_events_only, true);
assert.equal(receipt.workspace_write_executed, false);
assert.equal(receipt.provider_fetch_executed, false);
assert.equal(receipt.attendance_mutation_executed, false);
assert.equal(receipt.runtime_adapter_executed, false);
assert.equal(receipt.persistence_executed, false);
assert.deepEqual(receipt.summary, {
  total_participants: 3,
  required_participants: 2,
  present_count: 1,
  absent_count: 1,
  late_count: 1,
  excused_count: 0,
  left_early_count: 0,
});
assert.equal(receipt.evidence_entries.length, 3);
assert.equal(receipt.evidence_entries[0].duration_minutes, 60);
assert.equal(receipt.evidence_entries[1].duration_minutes, null);
assert.equal(receipt.evidence_entries.every((entry) => entry.workspace_evidence_mode === 'EVENT_REFERENCE_ONLY'), true);
assert.deepEqual(receipt.decision_refs, ['6C-CAL-011', '6C-GLOBAL-018']);
assert.match(receipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateMeetingAttendanceEvidence(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, receipt.runtime_evidence_digest);
assert.equal(repeatedReceipt.evidence_entries[0].evidence_id, receipt.evidence_entries[0].evidence_id);

const completeReceipt = evaluateMeetingAttendanceEvidence({
  ...baseInput,
  participants: [baseInput.participants[0]],
});
assert.equal(completeReceipt.decision, 'EVIDENCE_READY');

const emptyReceipt = evaluateMeetingAttendanceEvidence({
  ...baseInput,
  participants: [],
});
assert.equal(emptyReceipt.decision, 'NO_ATTENDANCE_EVIDENCE');
assert.equal(emptyReceipt.evidence_entries.length, 0);

assert.throws(() => evaluateMeetingAttendanceEvidence({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateMeetingAttendanceEvidence({ ...baseInput, meeting_ended_at: '2026-06-09T07:59:00.000Z' }), /meeting_ended_at must be on or after meeting_started_at/);
assert.throws(() => evaluateMeetingAttendanceEvidence({ ...baseInput, source_event_payload_hash: 'not-a-hash' }), /must be a lowercase sha256 hex digest/);
assert.throws(() => evaluateMeetingAttendanceEvidence({ ...baseInput, participants: [baseInput.participants[0], baseInput.participants[0]] }), /duplicate user_id user_present/);
assert.throws(() => evaluateMeetingAttendanceEvidence({ ...baseInput, participants: [{ ...baseInput.participants[0], attendance_status: 'UNKNOWN' as never }] }), /unsupported value UNKNOWN/);
assert.throws(() => evaluateMeetingAttendanceEvidence({ ...baseInput, participants: [{ ...baseInput.participants[0], left_at: '2026-06-09T07:59:00.000Z' }] }), /left_at must be on or after participants.joined_at/);
assert.throws(() => evaluateMeetingAttendanceEvidence({ ...baseInput, workspace_write_requested: true }), /must not write Workspace evidence/);
assert.throws(() => evaluateMeetingAttendanceEvidence({ ...baseInput, provider_fetch_requested: true }), /must not fetch provider attendance/);
assert.throws(() => evaluateMeetingAttendanceEvidence({ ...baseInput, attendance_mutation_requested: true }), /must not mutate attendance/);
assert.throws(() => evaluateMeetingAttendanceEvidence({ ...baseInput, persistence_requested: true }), /must not persist attendance evidence/);
assert.throws(() => evaluateMeetingAttendanceEvidence({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);

console.log('P6C runtime meeting_attendance_evidence test passed.');
