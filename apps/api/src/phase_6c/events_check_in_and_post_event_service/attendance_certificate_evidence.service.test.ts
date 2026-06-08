import assert from 'node:assert/strict';

import { evaluateAttendanceCertificateEvidenceScaffold, type AttendanceCertificateEvidenceScaffoldInput } from './attendance_certificate_evidence.service';

const baseInput: AttendanceCertificateEvidenceScaffoldInput = {
  organization_id: 'org_phase_6c_control',
  service_manifest_contract_id: 'smc_phase_6c_attendance_certificate_evidence',
  source_record_ref: 'attendance_certificate_evidence_record_001',
  evaluated_by_user_id: 'user_phase_6c_control',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  control_metadata: { source: 'phase_6c_scaffold_control' },
};

const receipt = evaluateAttendanceCertificateEvidenceScaffold(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_124_attendance_certificate_evidence');
assert.equal(receipt.component_id, '6C.09');
assert.equal(receipt.component_slug, 'events_check_in_and_post_event_service');
assert.equal(receipt.model_name, 'Phase6CAttendanceCertificateEvidence');
assert.equal(receipt.scaffold_status, 'SCAFFOLD_CONTROL_ONLY');
assert.equal(receipt.capability_implementation_allowed, false);
assert.equal(receipt.business_behavior_allowed, false);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.match(receipt.scaffold_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateAttendanceCertificateEvidenceScaffold(baseInput);
assert.equal(repeatedReceipt.scaffold_evidence_digest, receipt.scaffold_evidence_digest);

assert.throws(() => evaluateAttendanceCertificateEvidenceScaffold({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateAttendanceCertificateEvidenceScaffold({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateAttendanceCertificateEvidenceScaffold({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateAttendanceCertificateEvidenceScaffold({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateAttendanceCertificateEvidenceScaffold({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateAttendanceCertificateEvidenceScaffold({ ...baseInput, capability_execution_requested: true }), /must not execute capability behavior/);
assert.throws(() => evaluateAttendanceCertificateEvidenceScaffold({ ...baseInput, business_behavior_requested: true }), /must not execute business behavior/);
assert.throws(() => evaluateAttendanceCertificateEvidenceScaffold({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapter behavior/);

console.log('P6C scaffold-control attendance_certificate_evidence test passed.');
