import assert from 'node:assert/strict';

import { evaluateRfidNfcAttendanceRuntime, type RfidNfcAttendanceInput } from './rfid_nfc_attendance.service';

const baseInput: RfidNfcAttendanceInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_rfid_nfc_attendance',
  source_record_ref: 'attendance_reader_session:001',
  employee_ref: 'employee:001',
  method: 'NFC',
  provider_neutral_reader_ref: 'provider_neutral_reader:reader_001',
  token_evidence_ref: 'rfid_nfc_token_evidence:token_hash_001',
  device_observed_at: '2026-06-09T09:00:00.000Z',
  server_received_at: '2026-06-09T09:00:20.000Z',
  max_clock_skew_seconds: 60,
  offline_capture: true,
  offline_queue_ref: 'offline_attendance_queue:reader_001_batch_001',
  fallback_method_ref: 'attendance_fallback:manual_override_available',
  evaluated_by_user_id: 'user_phase_6c_attendance_admin',
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateRfidNfcAttendanceRuntime(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_026_rfid_nfc_attendance');
assert.equal(receipt.component_id, '6C.03');
assert.equal(receipt.component_slug, 'hr_attendance_leave_and_time_tracking');
assert.equal(receipt.model_name, 'Phase6CRfidNfcAttendance');
assert.equal(receipt.event_name, 'phase_6c.hr_attendance_leave_and_time_tracking.rfid_nfc_attendance.evaluated');
assert.equal(receipt.runtime_status, 'RFID_NFC_ATTENDANCE_EVALUATED');
assert.equal(receipt.method, 'NFC');
assert.equal(receipt.decision, 'ACCEPTED');
assert.deepEqual(receipt.rejection_reasons, []);
assert.equal(receipt.provider_neutral_only, true);
assert.equal(receipt.raw_tag_storage_allowed, false);
assert.equal(receipt.external_reader_call_allowed, false);
assert.equal(receipt.attendance_record_mutation_allowed, false);
assert.equal(receipt.offline_queue_supported, true);
assert.equal(receipt.fallback_methods_allowed, true);
assert.equal(receipt.clock_skew_seconds, 20);
assert.equal(receipt.within_clock_skew_tolerance, true);
assert.deepEqual(receipt.decision_refs, ['6C-ATT-001', '6C-ATT-002', '6C-ATT-006', '6C-ATT-007', '6C-ATT-019']);
assert.match(receipt.rfid_nfc_attendance_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateRfidNfcAttendanceRuntime(baseInput);
assert.equal(repeatedReceipt.rfid_nfc_attendance_evidence_digest, receipt.rfid_nfc_attendance_evidence_digest);

const rejectedReceipt = evaluateRfidNfcAttendanceRuntime({
  ...baseInput,
  device_observed_at: '2026-06-09T09:00:00.000Z',
  server_received_at: '2026-06-09T09:05:00.000Z',
  offline_queue_ref: undefined,
  fallback_method_ref: 'fallback:wrong',
});
assert.equal(rejectedReceipt.decision, 'REJECTED');
assert.deepEqual(rejectedReceipt.rejection_reasons, [
  'CLOCK_SKEW_EXCEEDS_CONFIGURED_TOLERANCE',
  'INVALID_FALLBACK_METHOD_REF',
  'OFFLINE_CAPTURE_REQUIRES_QUEUE_REF',
]);

assert.throws(() => evaluateRfidNfcAttendanceRuntime({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateRfidNfcAttendanceRuntime({ ...baseInput, device_observed_at: 'not-a-date' }), /valid ISO-compatible timestamp/);
assert.throws(() => evaluateRfidNfcAttendanceRuntime({ ...baseInput, method: 'BARCODE' as never }), /method is not supported/);
assert.throws(() => evaluateRfidNfcAttendanceRuntime({ ...baseInput, provider_neutral_reader_ref: 'reader:brand' }), /provider_neutral_reader:/);
assert.throws(() => evaluateRfidNfcAttendanceRuntime({ ...baseInput, token_evidence_ref: 'raw_tag:001' }), /rfid_nfc_token_evidence:/);
assert.throws(() => evaluateRfidNfcAttendanceRuntime({ ...baseInput, max_clock_skew_seconds: -1 }), /max_clock_skew_seconds/);
assert.throws(() => evaluateRfidNfcAttendanceRuntime({ ...baseInput, offline_capture: 'yes' as never }), /offline_capture must be boolean/);
assert.throws(() => evaluateRfidNfcAttendanceRuntime({ ...baseInput, provider_specific_adapter_requested: true }), /provider-neutral/);
assert.throws(() => evaluateRfidNfcAttendanceRuntime({ ...baseInput, raw_tag_storage_requested: true }), /raw RFID\/NFC tag values/);
assert.throws(() => evaluateRfidNfcAttendanceRuntime({ ...baseInput, external_reader_call_requested: true }), /external readers/);
assert.throws(() => evaluateRfidNfcAttendanceRuntime({ ...baseInput, attendance_record_mutation_requested: true }), /not mutate attendance records/);
assert.throws(() => evaluateRfidNfcAttendanceRuntime({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateRfidNfcAttendanceRuntime({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateRfidNfcAttendanceRuntime({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateRfidNfcAttendanceRuntime({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateRfidNfcAttendanceRuntime({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket or execution authorization flags/);

console.log('P6C runtime rfid_nfc_attendance test passed.');
