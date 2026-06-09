import assert from 'node:assert/strict';

import { evaluateQrAttendanceRuntime, type QrAttendanceInput } from './qr_attendance.service';

const baseInput: QrAttendanceInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_qr_attendance',
  source_record_ref: 'attendance_session:morning_shift',
  employee_ref: 'employee:001',
  qr_token_ref: 'qr_token:shift_window_001',
  scan_mode: 'SELF_SCAN',
  scanned_by_user_ref: 'employee:001',
  device_ref: 'device:mobile_001',
  device_scan_at: '2026-06-09T09:05:00.000Z',
  server_received_at: '2026-06-09T09:05:20.000Z',
  attendance_window: {
    window_ref: 'attendance_window:shift_start',
    starts_at: '2026-06-09T09:00:00.000Z',
    ends_at: '2026-06-09T09:15:00.000Z',
    max_clock_skew_seconds: 60,
  },
  geofence: {
    geofence_ref: 'geofence:main_location_gate',
    center_latitude: 24.8607,
    center_longitude: 67.0011,
    radius_meters: 150,
  },
  scan_location: {
    latitude: 24.8608,
    longitude: 67.0012,
    accuracy_meters: 10,
  },
  liveness_photo_required: true,
  liveness_photo_evidence_ref: 'liveness_photo:qr_001',
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateQrAttendanceRuntime(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_024_qr_attendance');
assert.equal(receipt.component_id, '6C.03');
assert.equal(receipt.component_slug, 'hr_attendance_leave_and_time_tracking');
assert.equal(receipt.model_name, 'Phase6CQrAttendance');
assert.equal(receipt.event_name, 'phase_6c.hr_attendance_leave_and_time_tracking.qr_attendance.evaluated');
assert.equal(receipt.runtime_status, 'QR_ATTENDANCE_EVALUATED');
assert.equal(receipt.scan_mode, 'SELF_SCAN');
assert.equal(receipt.decision, 'ACCEPTED');
assert.deepEqual(receipt.rejection_reasons, []);
assert.equal(receipt.within_time_window, true);
assert.equal(receipt.clock_skew_seconds, 20);
assert.equal(receipt.within_clock_skew_tolerance, true);
assert.equal(receipt.within_geofence, true);
assert.equal(receipt.location_redacted, true);
assert.equal(receipt.liveness_photo_required, true);
assert.equal(receipt.liveness_photo_satisfied, true);
assert.equal(receipt.provider_neutral_only, true);
assert.equal(receipt.fallback_methods_allowed, true);
assert.equal(receipt.attendance_record_mutation_allowed, false);
assert.equal(receipt.raw_location_storage_allowed, false);
assert.deepEqual(receipt.adl_refs, ['ADL-024']);
assert.deepEqual(receipt.decision_refs, ['6C-ATT-004', '6C-ATT-005', '6C-ATT-007', '6C-ATT-018', '6C-ATT-019', '6C-ATT-020', '6C-ADL-007']);
assert.match(receipt.qr_attendance_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateQrAttendanceRuntime(baseInput);
assert.equal(repeatedReceipt.qr_attendance_evidence_digest, receipt.qr_attendance_evidence_digest);

const rejectedReceipt = evaluateQrAttendanceRuntime({
  ...baseInput,
  device_scan_at: '2026-06-09T09:30:00.000Z',
  server_received_at: '2026-06-09T09:45:00.000Z',
  scan_location: { latitude: 24.8807, longitude: 67.0211, accuracy_meters: 5 },
  liveness_photo_evidence_ref: undefined,
});
assert.equal(rejectedReceipt.decision, 'REJECTED');
assert.deepEqual(rejectedReceipt.rejection_reasons, [
  'CLOCK_SKEW_EXCEEDS_CONFIGURED_TOLERANCE',
  'LIVENESS_PHOTO_REQUIRED',
  'OUTSIDE_ADL_024_ATTENDANCE_WINDOW',
  'OUTSIDE_CONFIGURED_GEOFENCE',
]);

const supervisorReceipt = evaluateQrAttendanceRuntime({
  ...baseInput,
  scan_mode: 'SUPERVISOR_SCAN',
  scanned_by_user_ref: 'employee:supervisor_001',
});
assert.equal(supervisorReceipt.scan_mode, 'SUPERVISOR_SCAN');
assert.equal(supervisorReceipt.decision, 'ACCEPTED');

assert.throws(() => evaluateQrAttendanceRuntime({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateQrAttendanceRuntime({ ...baseInput, device_scan_at: 'not-a-date' }), /valid ISO-compatible timestamp/);
assert.throws(() => evaluateQrAttendanceRuntime({ ...baseInput, scan_mode: 'BADGE_SCAN' as never }), /scan_mode is not supported/);
assert.throws(() => evaluateQrAttendanceRuntime({ ...baseInput, scan_mode: 'SUPERVISOR_SCAN', scanned_by_user_ref: 'employee:001' }), /SUPERVISOR_SCAN requires/);
assert.throws(() => evaluateQrAttendanceRuntime({ ...baseInput, liveness_photo_evidence_ref: 'photo:wrong' }), /liveness_photo_evidence_ref must use liveness_photo:/);
assert.throws(() => evaluateQrAttendanceRuntime({
  ...baseInput,
  attendance_window: { ...baseInput.attendance_window, starts_at: '2026-06-09T10:00:00.000Z' },
}), /starts_at must be before ends_at/);
assert.throws(() => evaluateQrAttendanceRuntime({
  ...baseInput,
  geofence: { ...baseInput.geofence, center_latitude: 100 },
}), /geofence.center_latitude must be between/);
assert.throws(() => evaluateQrAttendanceRuntime({ ...baseInput, provider_specific_adapter_requested: true }), /provider-neutral/);
assert.throws(() => evaluateQrAttendanceRuntime({ ...baseInput, biometric_capture_requested: true }), /must not capture biometric data/);
assert.throws(() => evaluateQrAttendanceRuntime({ ...baseInput, raw_location_storage_requested: true }), /must redact location/);
assert.throws(() => evaluateQrAttendanceRuntime({ ...baseInput, attendance_record_mutation_requested: true }), /not mutate attendance records/);
assert.throws(() => evaluateQrAttendanceRuntime({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateQrAttendanceRuntime({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateQrAttendanceRuntime({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateQrAttendanceRuntime({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateQrAttendanceRuntime({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket or execution authorization flags/);

console.log('P6C runtime qr_attendance test passed.');
