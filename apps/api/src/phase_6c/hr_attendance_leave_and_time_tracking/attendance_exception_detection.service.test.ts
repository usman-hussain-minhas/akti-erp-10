import assert from 'node:assert/strict';

import { evaluateAttendanceExceptionDetection, type AttendanceExceptionDetectionInput } from './attendance_exception_detection.service';

const baseInput: AttendanceExceptionDetectionInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_attendance_exception_detection',
  source_record_ref: 'attendance_exception_detection_record_001',
  employee_ref: 'employee_phase_6c_001',
  attendance_date: '2026-06-09',
  scheduled_start_at: '2026-06-09T09:00:00.000Z',
  scheduled_end_at: '2026-06-09T17:00:00.000Z',
  server_recorded_at: '2026-06-09T17:10:00.000Z',
  actual_check_in_at: '2026-06-09T09:03:00.000Z',
  actual_check_out_at: '2026-06-09T17:00:00.000Z',
  device_captured_at: '2026-06-09T17:09:30.000Z',
  duplicate_detected: false,
  max_clock_skew_seconds: 120,
  late_grace_period_minutes: 5,
  missing_checkout_grace_period_minutes: 30,
  fallback_method_ref: 'attendance_fallback_method_manual_review',
  provider_channel_ref: 'attendance_channel_mobile_app',
  control_metadata: { source: 'phase_6c_ffet_030' },
};

const cleanReceipt = evaluateAttendanceExceptionDetection(baseInput);
assert.equal(cleanReceipt.seed_id, 'seed_6c_030_attendance_exception_detection');
assert.equal(cleanReceipt.component_id, '6C.03');
assert.equal(cleanReceipt.component_slug, 'hr_attendance_leave_and_time_tracking');
assert.equal(cleanReceipt.model_name, 'Phase6CAttendanceExceptionDetection');
assert.equal(cleanReceipt.event_name, 'phase_6c.hr_attendance_leave_and_time_tracking.attendance_exception_detection.evaluated');
assert.equal(cleanReceipt.runtime_status, 'ATTENDANCE_EXCEPTION_DETECTION_EVALUATED');
assert.equal(cleanReceipt.decision, 'NO_EXCEPTION');
assert.deepEqual(cleanReceipt.exceptions, []);
assert.equal(cleanReceipt.observed_clock_skew_seconds, 30);
assert.equal(cleanReceipt.observed_late_minutes, 3);
assert.equal(cleanReceipt.missing_checkout_elapsed_minutes, null);
assert.equal(cleanReceipt.provider_neutral_only, true);
assert.equal(cleanReceipt.fallback_methods_allowed, true);
assert.equal(cleanReceipt.attendance_record_mutation_allowed, false);
assert.deepEqual(cleanReceipt.decision_refs, ['6C-ATT-001', '6C-ATT-002', '6C-ATT-007', '6C-ATT-008', '6C-ATT-019']);
assert.deepEqual(cleanReceipt.evidence_artifacts, [
  'attendance_exception_detection_decision_receipt',
  'attendance_exception_detection_threshold_evidence',
  'attendance_exception_detection_exception_records',
]);
assert.match(cleanReceipt.exception_detection_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateAttendanceExceptionDetection(baseInput);
assert.equal(repeatedReceipt.exception_detection_evidence_digest, cleanReceipt.exception_detection_evidence_digest);

const allExceptionsReceipt = evaluateAttendanceExceptionDetection({
  ...baseInput,
  actual_check_in_at: '2026-06-09T09:15:00.000Z',
  actual_check_out_at: undefined,
  device_captured_at: '2026-06-09T16:50:00.000Z',
  duplicate_detected: true,
  max_clock_skew_seconds: 60,
  server_recorded_at: '2026-06-09T18:00:00.000Z',
  missing_checkout_grace_period_minutes: 15,
});
assert.equal(allExceptionsReceipt.decision, 'EXCEPTION_DETECTED');
assert.deepEqual(allExceptionsReceipt.exceptions.map((exception) => exception.exception_type), [
  'DUPLICATE_ATTENDANCE',
  'CLOCK_SKEW_EXCEEDED',
  'LATE_CHECK_IN',
  'MISSING_CHECKOUT',
]);
assert.equal(allExceptionsReceipt.exceptions[0]?.severity, 'REVIEW_REQUIRED');
assert.equal(allExceptionsReceipt.exceptions[1]?.measured_value, 4200);
assert.equal(allExceptionsReceipt.exceptions[1]?.threshold_value, 60);
assert.equal(allExceptionsReceipt.exceptions[2]?.measured_value, 15);
assert.equal(allExceptionsReceipt.exceptions[2]?.threshold_value, 5);
assert.equal(allExceptionsReceipt.exceptions[3]?.measured_value, 60);
assert.equal(allExceptionsReceipt.exceptions[3]?.threshold_value, 15);

const missingOnlyReceipt = evaluateAttendanceExceptionDetection({
  ...baseInput,
  actual_check_out_at: undefined,
  server_recorded_at: '2026-06-09T17:45:00.000Z',
  device_captured_at: '2026-06-09T17:44:30.000Z',
});
assert.equal(missingOnlyReceipt.decision, 'EXCEPTION_DETECTED');
assert.deepEqual(missingOnlyReceipt.exceptions.map((exception) => exception.exception_type), ['MISSING_CHECKOUT']);
assert.equal(missingOnlyReceipt.missing_checkout_elapsed_minutes, 45);

assert.throws(() => evaluateAttendanceExceptionDetection({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateAttendanceExceptionDetection({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateAttendanceExceptionDetection({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateAttendanceExceptionDetection({ ...baseInput, employee_ref: '' }), /employee_ref is required/);
assert.throws(() => evaluateAttendanceExceptionDetection({ ...baseInput, attendance_date: '09-06-2026' }), /attendance_date must use YYYY-MM-DD format/);
assert.throws(() => evaluateAttendanceExceptionDetection({ ...baseInput, scheduled_start_at: 'not-a-date' }), /scheduled_start_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateAttendanceExceptionDetection({ ...baseInput, scheduled_end_at: 'not-a-date' }), /scheduled_end_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateAttendanceExceptionDetection({ ...baseInput, server_recorded_at: 'not-a-date' }), /server_recorded_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateAttendanceExceptionDetection({ ...baseInput, actual_check_in_at: 'not-a-date' }), /actual_check_in_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateAttendanceExceptionDetection({ ...baseInput, actual_check_out_at: 'not-a-date' }), /actual_check_out_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateAttendanceExceptionDetection({ ...baseInput, device_captured_at: 'not-a-date' }), /device_captured_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateAttendanceExceptionDetection({ ...baseInput, max_clock_skew_seconds: -1 }), /max_clock_skew_seconds must be a non-negative finite number/);
assert.throws(() => evaluateAttendanceExceptionDetection({ ...baseInput, late_grace_period_minutes: -1 }), /late_grace_period_minutes must be a non-negative finite number/);
assert.throws(() => evaluateAttendanceExceptionDetection({ ...baseInput, missing_checkout_grace_period_minutes: -1 }), /missing_checkout_grace_period_minutes must be a non-negative finite number/);
assert.throws(() => evaluateAttendanceExceptionDetection({ ...baseInput, fallback_method_ref: ' ' }), /fallback_method_ref must be non-empty/);
assert.throws(() => evaluateAttendanceExceptionDetection({ ...baseInput, provider_channel_ref: ' ' }), /provider_channel_ref must be non-empty/);
assert.throws(() => evaluateAttendanceExceptionDetection({ ...baseInput, direct_attendance_record_mutation_requested: true }), /must not mutate attendance records directly/);
assert.throws(() => evaluateAttendanceExceptionDetection({ ...baseInput, provider_specific_adapter_requested: true }), /provider-neutral/);
assert.throws(() => evaluateAttendanceExceptionDetection({ ...baseInput, schema_mutation_requested: true }), /must not request schema mutation/);
assert.throws(() => evaluateAttendanceExceptionDetection({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateAttendanceExceptionDetection({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateAttendanceExceptionDetection({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateAttendanceExceptionDetection({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C attendance_exception_detection runtime test passed.');
