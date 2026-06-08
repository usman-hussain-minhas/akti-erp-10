import assert from 'node:assert/strict';

import { evaluateBiometricDeviceBoundaryScaffold, type BiometricDeviceBoundaryScaffoldInput } from './biometric_device_boundary.service';

const baseInput: BiometricDeviceBoundaryScaffoldInput = {
  organization_id: 'org_phase_6c_control',
  service_manifest_contract_id: 'smc_phase_6c_biometric_device_boundary',
  source_record_ref: 'biometric_device_boundary_record_001',
  evaluated_by_user_id: 'user_phase_6c_control',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  control_metadata: { source: 'phase_6c_scaffold_control' },
};

const receipt = evaluateBiometricDeviceBoundaryScaffold(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_025_biometric_device_boundary');
assert.equal(receipt.component_id, '6C.03');
assert.equal(receipt.component_slug, 'hr_attendance_leave_and_time_tracking');
assert.equal(receipt.model_name, 'Phase6CBiometricDeviceBoundary');
assert.equal(receipt.scaffold_status, 'SCAFFOLD_CONTROL_ONLY');
assert.equal(receipt.capability_implementation_allowed, false);
assert.equal(receipt.business_behavior_allowed, false);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.match(receipt.scaffold_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateBiometricDeviceBoundaryScaffold(baseInput);
assert.equal(repeatedReceipt.scaffold_evidence_digest, receipt.scaffold_evidence_digest);

assert.throws(() => evaluateBiometricDeviceBoundaryScaffold({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateBiometricDeviceBoundaryScaffold({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateBiometricDeviceBoundaryScaffold({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateBiometricDeviceBoundaryScaffold({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateBiometricDeviceBoundaryScaffold({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateBiometricDeviceBoundaryScaffold({ ...baseInput, capability_execution_requested: true }), /must not execute capability behavior/);
assert.throws(() => evaluateBiometricDeviceBoundaryScaffold({ ...baseInput, business_behavior_requested: true }), /must not execute business behavior/);
assert.throws(() => evaluateBiometricDeviceBoundaryScaffold({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapter behavior/);

console.log('P6C scaffold-control biometric_device_boundary test passed.');
