import assert from 'node:assert/strict';

import { evaluateMobileGpsAttendanceRuntime, type MobileGpsAttendanceInput } from './mobile_gps_attendance.service';

const baseInput: MobileGpsAttendanceInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_mobile_gps_attendance',
  source_record_ref: 'mobile_gps_attendance:session_001',
  employee_ref: 'employee:001',
  mobile_device_ref: 'mobile_device:device_001',
  location_policy: {
    policy_ref: 'mobile_gps_policy:main_location',
    center_latitude: 24.8607,
    center_longitude: 67.0011,
    radius_meters: 150,
    max_accuracy_meters: 25,
  },
  location_proof: {
    latitude: 24.8608,
    longitude: 67.0012,
    accuracy_meters: 12,
  },
  device_observed_at: '2026-06-09T09:00:00.000Z',
  server_received_at: '2026-06-09T09:00:20.000Z',
  max_clock_skew_seconds: 60,
  liveness_photo_required: true,
  liveness_photo_evidence_ref: 'liveness_photo:gps_001',
  offline_capture: true,
  offline_queue_ref: 'offline_attendance_queue:gps_batch_001',
  fallback_method_ref: 'attendance_fallback:manual_override_available',
  evaluated_by_user_id: 'user_phase_6c_attendance_admin',
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateMobileGpsAttendanceRuntime(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_027_mobile_gps_attendance');
assert.equal(receipt.component_id, '6C.03');
assert.equal(receipt.component_slug, 'hr_attendance_leave_and_time_tracking');
assert.equal(receipt.model_name, 'Phase6CMobileGpsAttendance');
assert.equal(receipt.runtime_status, 'MOBILE_GPS_ATTENDANCE_EVALUATED');
assert.equal(receipt.decision, 'ACCEPTED');
assert.deepEqual(receipt.rejection_reasons, []);
assert.equal(receipt.provider_neutral_only, true);
assert.equal(receipt.location_redacted, true);
assert.equal(receipt.raw_location_storage_allowed, false);
assert.equal(receipt.attendance_record_mutation_allowed, false);
assert.equal(receipt.offline_queue_supported, true);
assert.equal(receipt.fallback_methods_allowed, true);
assert.equal(receipt.within_location_policy, true);
assert.equal(receipt.within_accuracy_tolerance, true);
assert.equal(receipt.clock_skew_seconds, 20);
assert.equal(receipt.within_clock_skew_tolerance, true);
assert.equal(receipt.liveness_photo_satisfied, true);
assert.deepEqual(receipt.decision_refs, ['6C-ATT-001', '6C-ATT-002', '6C-ATT-005', '6C-ATT-006', '6C-ATT-007', '6C-ATT-019', '6C-ATT-020']);
assert.match(receipt.mobile_gps_attendance_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateMobileGpsAttendanceRuntime(baseInput);
assert.equal(repeatedReceipt.mobile_gps_attendance_evidence_digest, receipt.mobile_gps_attendance_evidence_digest);

const rejectedReceipt = evaluateMobileGpsAttendanceRuntime({
  ...baseInput,
  location_proof: { latitude: 24.9, longitude: 67.04, accuracy_meters: 100 },
  server_received_at: '2026-06-09T09:05:00.000Z',
  liveness_photo_evidence_ref: undefined,
  offline_queue_ref: undefined,
  fallback_method_ref: 'fallback:wrong',
});
assert.equal(rejectedReceipt.decision, 'REJECTED');
assert.deepEqual(rejectedReceipt.rejection_reasons, [
  'CLOCK_SKEW_EXCEEDS_CONFIGURED_TOLERANCE',
  'INVALID_FALLBACK_METHOD_REF',
  'LIVENESS_PHOTO_REQUIRED',
  'LOCATION_ACCURACY_EXCEEDS_CONFIGURED_TOLERANCE',
  'OFFLINE_CAPTURE_REQUIRES_QUEUE_REF',
  'OUTSIDE_CONFIGURED_LOCATION_POLICY',
]);

assert.throws(() => evaluateMobileGpsAttendanceRuntime({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateMobileGpsAttendanceRuntime({ ...baseInput, device_observed_at: 'not-a-date' }), /valid ISO-compatible timestamp/);
assert.throws(() => evaluateMobileGpsAttendanceRuntime({ ...baseInput, max_clock_skew_seconds: -1 }), /max_clock_skew_seconds/);
assert.throws(() => evaluateMobileGpsAttendanceRuntime({ ...baseInput, location_policy: { ...baseInput.location_policy, policy_ref: 'policy:wrong' } }), /mobile_gps_policy:/);
assert.throws(() => evaluateMobileGpsAttendanceRuntime({ ...baseInput, location_policy: { ...baseInput.location_policy, center_latitude: 100 } }), /location_policy.center_latitude/);
assert.throws(() => evaluateMobileGpsAttendanceRuntime({ ...baseInput, liveness_photo_evidence_ref: 'photo:wrong' }), /liveness_photo:/);
assert.throws(() => evaluateMobileGpsAttendanceRuntime({ ...baseInput, offline_capture: 'yes' as never }), /offline_capture must be boolean/);
assert.throws(() => evaluateMobileGpsAttendanceRuntime({ ...baseInput, raw_location_storage_requested: true }), /must redact location/);
assert.throws(() => evaluateMobileGpsAttendanceRuntime({ ...baseInput, provider_specific_adapter_requested: true }), /provider-neutral/);
assert.throws(() => evaluateMobileGpsAttendanceRuntime({ ...baseInput, attendance_record_mutation_requested: true }), /not mutate attendance records/);
assert.throws(() => evaluateMobileGpsAttendanceRuntime({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateMobileGpsAttendanceRuntime({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateMobileGpsAttendanceRuntime({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateMobileGpsAttendanceRuntime({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateMobileGpsAttendanceRuntime({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket or execution authorization flags/);

console.log('P6C runtime mobile_gps_attendance test passed.');
