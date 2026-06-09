import assert from 'node:assert/strict';

import { evaluateOfflineAttendanceQueue, type OfflineAttendanceQueueInput } from './offline_attendance_queue.service';

const baseInput: OfflineAttendanceQueueInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_offline_attendance_queue',
  source_record_ref: 'offline_attendance_queue_record_001',
  employee_ref: 'employee_phase_6c_001',
  offline_capture_ref: 'offline_capture_001',
  attendance_method: 'MOBILE_GPS',
  attendance_event_type: 'CHECK_IN',
  captured_at_device: '2026-06-09T08:58:00.000Z',
  queued_at: '2026-06-09T08:58:05.000Z',
  server_received_at: '2026-06-09T09:00:00.000Z',
  replay_requested_at: '2026-06-09T09:01:00.000Z',
  connectivity_restored: false,
  max_clock_skew_seconds: 180,
  fallback_method_ref: 'attendance_fallback_method_manual_review',
  provider_channel_ref: 'attendance_channel_mobile_app',
  control_metadata: { source: 'phase_6c_ffet_029' },
};

const queuedReceipt = evaluateOfflineAttendanceQueue(baseInput);
assert.equal(queuedReceipt.seed_id, 'seed_6c_029_offline_attendance_queue');
assert.equal(queuedReceipt.component_id, '6C.03');
assert.equal(queuedReceipt.component_slug, 'hr_attendance_leave_and_time_tracking');
assert.equal(queuedReceipt.model_name, 'Phase6COfflineAttendanceQueue');
assert.equal(queuedReceipt.event_name, 'phase_6c.hr_attendance_leave_and_time_tracking.offline_attendance_queue.evaluated');
assert.equal(queuedReceipt.runtime_status, 'OFFLINE_ATTENDANCE_QUEUE_EVALUATED');
assert.equal(queuedReceipt.decision, 'QUEUED_PENDING_CONNECTIVITY');
assert.equal(queuedReceipt.observed_clock_skew_seconds, 120);
assert.equal(queuedReceipt.provider_neutral_only, true);
assert.equal(queuedReceipt.fallback_methods_allowed, true);
assert.equal(queuedReceipt.attendance_record_mutation_allowed, false);
assert.equal(queuedReceipt.fallback_method_ref, 'attendance_fallback_method_manual_review');
assert.equal(queuedReceipt.provider_channel_ref, 'attendance_channel_mobile_app');
assert.deepEqual(queuedReceipt.decision_refs, ['6C-ATT-001', '6C-ATT-002', '6C-ATT-006', '6C-ATT-007', '6C-ATT-008', '6C-ATT-019']);
assert.deepEqual(queuedReceipt.evidence_artifacts, [
  'offline_attendance_queue_decision_receipt',
  'offline_attendance_replay_evidence',
  'offline_attendance_clock_skew_evidence',
]);
assert.match(queuedReceipt.offline_queue_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateOfflineAttendanceQueue(baseInput);
assert.equal(repeatedReceipt.offline_queue_evidence_digest, queuedReceipt.offline_queue_evidence_digest);

const replayAcceptedReceipt = evaluateOfflineAttendanceQueue({
  ...baseInput,
  connectivity_restored: true,
});
assert.equal(replayAcceptedReceipt.decision, 'REPLAY_ACCEPTED_FOR_PROCESSING');
assert.deepEqual(replayAcceptedReceipt.rejection_reasons, []);

const skewRejectedReceipt = evaluateOfflineAttendanceQueue({
  ...baseInput,
  connectivity_restored: true,
  max_clock_skew_seconds: 60,
});
assert.equal(skewRejectedReceipt.decision, 'REPLAY_REJECTED');
assert.deepEqual(skewRejectedReceipt.rejection_reasons, ['CLOCK_SKEW_EXCEEDS_CONFIGURED_TOLERANCE']);

const duplicateRejectedReceipt = evaluateOfflineAttendanceQueue({
  ...baseInput,
  connectivity_restored: true,
  duplicate_detected: true,
});
assert.equal(duplicateRejectedReceipt.decision, 'REPLAY_REJECTED');
assert.deepEqual(duplicateRejectedReceipt.rejection_reasons, ['DUPLICATE_DETECTED_EXCEPTION_REQUIRED']);
assert.equal(duplicateRejectedReceipt.duplicate_exception_recorded, false);

const duplicateExceptionReceipt = evaluateOfflineAttendanceQueue({
  ...baseInput,
  connectivity_restored: true,
  duplicate_detected: true,
  duplicate_exception_ref: 'offline_duplicate_exception_001',
});
assert.equal(duplicateExceptionReceipt.decision, 'REPLAY_ACCEPTED_FOR_PROCESSING');
assert.equal(duplicateExceptionReceipt.duplicate_exception_recorded, true);
assert.equal(duplicateExceptionReceipt.duplicate_exception_ref, 'offline_duplicate_exception_001');

assert.throws(() => evaluateOfflineAttendanceQueue({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateOfflineAttendanceQueue({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateOfflineAttendanceQueue({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateOfflineAttendanceQueue({ ...baseInput, employee_ref: '' }), /employee_ref is required/);
assert.throws(() => evaluateOfflineAttendanceQueue({ ...baseInput, offline_capture_ref: '' }), /offline_capture_ref is required/);
assert.throws(() => evaluateOfflineAttendanceQueue({ ...baseInput, captured_at_device: 'not-a-date' }), /captured_at_device must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateOfflineAttendanceQueue({ ...baseInput, queued_at: 'not-a-date' }), /queued_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateOfflineAttendanceQueue({ ...baseInput, server_received_at: 'not-a-date' }), /server_received_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateOfflineAttendanceQueue({ ...baseInput, replay_requested_at: 'not-a-date' }), /replay_requested_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateOfflineAttendanceQueue({ ...baseInput, max_clock_skew_seconds: -1 }), /max_clock_skew_seconds must be a non-negative finite number/);
assert.throws(() => evaluateOfflineAttendanceQueue({ ...baseInput, duplicate_exception_ref: ' ' }), /duplicate_exception_ref must be non-empty/);
assert.throws(() => evaluateOfflineAttendanceQueue({ ...baseInput, fallback_method_ref: ' ' }), /fallback_method_ref must be non-empty/);
assert.throws(() => evaluateOfflineAttendanceQueue({ ...baseInput, provider_channel_ref: ' ' }), /provider_channel_ref must be non-empty/);
assert.throws(() => evaluateOfflineAttendanceQueue({ ...baseInput, direct_attendance_record_mutation_requested: true }), /must not mutate attendance records directly/);
assert.throws(() => evaluateOfflineAttendanceQueue({ ...baseInput, provider_specific_adapter_requested: true }), /provider-neutral/);
assert.throws(() => evaluateOfflineAttendanceQueue({ ...baseInput, schema_mutation_requested: true }), /must not request schema mutation/);
assert.throws(() => evaluateOfflineAttendanceQueue({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateOfflineAttendanceQueue({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateOfflineAttendanceQueue({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateOfflineAttendanceQueue({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C offline_attendance_queue runtime test passed.');
