import assert from 'node:assert/strict';

import { evaluateAttendanceLocationRedaction, type AttendanceLocationRedactionInput } from './attendance_location_redaction.service';

const baseInput: AttendanceLocationRedactionInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_attendance_location_redaction',
  source_record_ref: 'attendance_location_redaction_record_001',
  attendance_event_ref: 'attendance_event_001',
  employee_ref: 'employee_phase_6c_001',
  requester_ref: 'manager_phase_6c_001',
  requester_purpose: 'MANAGER_REVIEW',
  redaction_profile: 'HASH_ONLY',
  latitude: 24.860734,
  longitude: 67.001136,
  location_label: 'Building A gate 2',
  region_code: 'pk-sd-karachi',
  provider_location_ref: 'provider-location-sensitive-001',
  captured_at: '2027-01-10T08:00:00.000Z',
  evaluated_by_user_id: 'user_phase_6c_privacy_admin',
  evaluated_at: '2027-01-10T09:00:00.000Z',
  control_metadata: { source: 'phase_6c_ffet_039' },
};

const hashReceipt = evaluateAttendanceLocationRedaction(baseInput);
assert.equal(hashReceipt.seed_id, 'seed_6c_039_attendance_location_redaction');
assert.equal(hashReceipt.component_id, '6C.03');
assert.equal(hashReceipt.component_slug, 'hr_attendance_leave_and_time_tracking');
assert.equal(hashReceipt.model_name, 'Phase6CAttendanceLocationRedaction');
assert.equal(hashReceipt.event_name, 'phase_6c.hr_attendance_leave_and_time_tracking.attendance_location_redaction.evaluated');
assert.equal(hashReceipt.runtime_status, 'ATTENDANCE_LOCATION_REDACTION_EVALUATED');
assert.equal(hashReceipt.redacted_latitude, null);
assert.equal(hashReceipt.redacted_longitude, null);
assert.equal(hashReceipt.redacted_location_label, null);
assert.equal(hashReceipt.region_code, 'PK-SD-KARACHI');
assert.equal(hashReceipt.decision, 'LOCATION_HASHED');
assert.equal(hashReceipt.raw_location_disclosure_allowed, false);
assert.equal(hashReceipt.provider_neutral_only, true);
assert.match(hashReceipt.raw_location_hash, /^[a-f0-9]{64}$/);
assert.match(hashReceipt.provider_location_ref_hash ?? '', /^[a-f0-9]{64}$/);
assert.deepEqual(hashReceipt.decision_refs, ['6C-ATT-020']);
assert.deepEqual(hashReceipt.evidence_artifacts, [
  'attendance_location_redaction_receipt',
  'attendance_location_privacy_evidence',
  'provider_location_hash_evidence',
]);
assert.match(hashReceipt.attendance_location_redaction_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateAttendanceLocationRedaction(baseInput);
assert.equal(repeatedReceipt.attendance_location_redaction_evidence_digest, hashReceipt.attendance_location_redaction_evidence_digest);

const coarseReceipt = evaluateAttendanceLocationRedaction({
  ...baseInput,
  redaction_profile: 'COARSE_COORDINATES',
});
assert.equal(coarseReceipt.redacted_latitude, 24.86);
assert.equal(coarseReceipt.redacted_longitude, 67);
assert.equal(coarseReceipt.redacted_location_label, 'PK-SD-KARACHI');
assert.equal(coarseReceipt.decision, 'LOCATION_COARSENED');
assert.equal(coarseReceipt.raw_location_disclosure_allowed, false);

const regionReceipt = evaluateAttendanceLocationRedaction({
  ...baseInput,
  redaction_profile: 'REGION_ONLY',
});
assert.equal(regionReceipt.redacted_latitude, null);
assert.equal(regionReceipt.redacted_longitude, null);
assert.equal(regionReceipt.redacted_location_label, 'PK-SD-KARACHI');
assert.equal(regionReceipt.decision, 'LOCATION_REGION_ONLY');

const auditReceipt = evaluateAttendanceLocationRedaction({
  ...baseInput,
  requester_purpose: 'AUDIT_SUPPORT_WINDOW',
  requester_ref: 'support_window_auditor_001',
  redaction_profile: 'AUDIT_EXACT',
  raw_location_disclosure_requested: true,
});
assert.equal(auditReceipt.redacted_latitude, 24.860734);
assert.equal(auditReceipt.redacted_longitude, 67.001136);
assert.equal(auditReceipt.redacted_location_label, 'Building A gate 2');
assert.equal(auditReceipt.raw_location_disclosure_allowed, true);
assert.equal(auditReceipt.decision, 'LOCATION_AUDIT_EXACT_ALLOWED');

assert.throws(() => evaluateAttendanceLocationRedaction({ ...baseInput, raw_location_disclosure_requested: true }), /must not disclose raw location outside an audited support window/);
assert.throws(() => evaluateAttendanceLocationRedaction({ ...baseInput, redaction_profile: 'AUDIT_EXACT', requester_purpose: 'MANAGER_REVIEW' }), /must not disclose raw location outside an audited support window/);
assert.throws(() => evaluateAttendanceLocationRedaction({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateAttendanceLocationRedaction({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateAttendanceLocationRedaction({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateAttendanceLocationRedaction({ ...baseInput, attendance_event_ref: '' }), /attendance_event_ref is required/);
assert.throws(() => evaluateAttendanceLocationRedaction({ ...baseInput, employee_ref: '' }), /employee_ref is required/);
assert.throws(() => evaluateAttendanceLocationRedaction({ ...baseInput, requester_ref: '' }), /requester_ref is required/);
assert.throws(() => evaluateAttendanceLocationRedaction({ ...baseInput, latitude: -91 }), /latitude must be between -90 and 90/);
assert.throws(() => evaluateAttendanceLocationRedaction({ ...baseInput, longitude: 181 }), /longitude must be between -180 and 180/);
assert.throws(() => evaluateAttendanceLocationRedaction({ ...baseInput, region_code: '' }), /region_code is required/);
assert.throws(() => evaluateAttendanceLocationRedaction({ ...baseInput, provider_location_ref: '' }), /provider_location_ref is required/);
assert.throws(() => evaluateAttendanceLocationRedaction({ ...baseInput, captured_at: 'not-a-date' }), /captured_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateAttendanceLocationRedaction({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateAttendanceLocationRedaction({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateAttendanceLocationRedaction({ ...baseInput, provider_specific_adapter_requested: true }), /provider-neutral/);
assert.throws(() => evaluateAttendanceLocationRedaction({ ...baseInput, schema_mutation_requested: true }), /must not request schema mutation/);
assert.throws(() => evaluateAttendanceLocationRedaction({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateAttendanceLocationRedaction({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateAttendanceLocationRedaction({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateAttendanceLocationRedaction({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C attendance_location_redaction runtime test passed.');
