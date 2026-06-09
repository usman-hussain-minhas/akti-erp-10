import assert from 'node:assert/strict';

import { evaluateBiometricDeviceBoundaryRuntime, type BiometricDeviceBoundaryInput } from './biometric_device_boundary.service';

const baseInput: BiometricDeviceBoundaryInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_biometric_device_boundary',
  source_record_ref: 'attendance_boundary:device_session_001',
  employee_ref: 'employee:001',
  device_boundary_ref: 'biometric_boundary:provider_neutral_fingerprint',
  provider_neutral_device_ref: 'provider_neutral_device:device_001',
  device_family: 'FINGERPRINT',
  biometric_evidence_ref: 'biometric_evidence:match_token_001',
  captured_at: '2026-06-09T09:00:00.000Z',
  received_at: '2026-06-09T09:00:05.000Z',
  fallback_method_ref: 'attendance_fallback:manual_override_available',
  evaluated_by_user_id: 'user_phase_6c_attendance_admin',
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateBiometricDeviceBoundaryRuntime(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_025_biometric_device_boundary');
assert.equal(receipt.component_id, '6C.03');
assert.equal(receipt.component_slug, 'hr_attendance_leave_and_time_tracking');
assert.equal(receipt.model_name, 'Phase6CBiometricDeviceBoundary');
assert.equal(receipt.event_name, 'phase_6c.hr_attendance_leave_and_time_tracking.biometric_device_boundary.evaluated');
assert.equal(receipt.runtime_status, 'BIOMETRIC_DEVICE_BOUNDARY_EVALUATED');
assert.equal(receipt.decision, 'BOUNDARY_ACCEPTED');
assert.deepEqual(receipt.rejection_reasons, []);
assert.equal(receipt.provider_neutral_only, true);
assert.equal(receipt.real_brand_adapter_allowed, false);
assert.equal(receipt.provider_credentials_allowed, false);
assert.equal(receipt.raw_biometric_capture_allowed, false);
assert.equal(receipt.biometric_template_storage_allowed, false);
assert.equal(receipt.external_device_call_allowed, false);
assert.equal(receipt.fallback_methods_allowed, true);
assert.deepEqual(receipt.decision_refs, ['6C-ATT-001', '6C-ATT-002', '6C-ATT-003', '6C-ATT-019', '6C-ATT-020']);
assert.deepEqual(receipt.evidence_artifacts, [
  'biometric_device_boundary_runtime_receipt',
  'biometric_device_boundary_validation_result',
  'biometric_device_boundary_forbidden_behavior_rejection_evidence',
]);
assert.match(receipt.biometric_device_boundary_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateBiometricDeviceBoundaryRuntime(baseInput);
assert.equal(repeatedReceipt.biometric_device_boundary_evidence_digest, receipt.biometric_device_boundary_evidence_digest);

const rejectedReceipt = evaluateBiometricDeviceBoundaryRuntime({
  ...baseInput,
  captured_at: '2026-06-09T09:01:00.000Z',
  received_at: '2026-06-09T09:00:00.000Z',
  fallback_method_ref: 'fallback:wrong',
});
assert.equal(rejectedReceipt.decision, 'BOUNDARY_REJECTED');
assert.deepEqual(rejectedReceipt.rejection_reasons, ['CAPTURED_AT_AFTER_RECEIVED_AT', 'INVALID_FALLBACK_METHOD_REF']);

assert.throws(() => evaluateBiometricDeviceBoundaryRuntime({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateBiometricDeviceBoundaryRuntime({ ...baseInput, captured_at: 'not-a-date' }), /valid ISO-compatible timestamp/);
assert.throws(() => evaluateBiometricDeviceBoundaryRuntime({ ...baseInput, device_boundary_ref: 'boundary:wrong' }), /biometric_boundary:/);
assert.throws(() => evaluateBiometricDeviceBoundaryRuntime({ ...baseInput, provider_neutral_device_ref: 'brand_device:001' }), /provider_neutral_device:/);
assert.throws(() => evaluateBiometricDeviceBoundaryRuntime({ ...baseInput, device_family: 'RETINA' as never }), /device_family is not supported/);
assert.throws(() => evaluateBiometricDeviceBoundaryRuntime({ ...baseInput, biometric_evidence_ref: 'raw_sample:001' }), /biometric_evidence:/);
assert.throws(() => evaluateBiometricDeviceBoundaryRuntime({ ...baseInput, real_brand_adapter_requested: true }), /real biometric brand adapters/);
assert.throws(() => evaluateBiometricDeviceBoundaryRuntime({ ...baseInput, provider_credentials_requested: true }), /provider credentials/);
assert.throws(() => evaluateBiometricDeviceBoundaryRuntime({ ...baseInput, raw_biometric_capture_requested: true }), /raw biometric samples/);
assert.throws(() => evaluateBiometricDeviceBoundaryRuntime({ ...baseInput, biometric_template_storage_requested: true }), /biometric templates/);
assert.throws(() => evaluateBiometricDeviceBoundaryRuntime({ ...baseInput, external_device_call_requested: true }), /external devices/);
assert.throws(() => evaluateBiometricDeviceBoundaryRuntime({ ...baseInput, attendance_record_mutation_requested: true }), /not mutate attendance records/);
assert.throws(() => evaluateBiometricDeviceBoundaryRuntime({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateBiometricDeviceBoundaryRuntime({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateBiometricDeviceBoundaryRuntime({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateBiometricDeviceBoundaryRuntime({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateBiometricDeviceBoundaryRuntime({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket or execution authorization flags/);

console.log('P6C runtime biometric_device_boundary test passed.');
