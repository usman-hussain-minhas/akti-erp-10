import assert from 'node:assert/strict';

import { evaluateAttendanceCertificateEvidence, type AttendanceCertificateEvidenceInput } from './attendance_certificate_evidence.service';

const baseInput: AttendanceCertificateEvidenceInput = {
  organization_id: 'org_phase_6c_events',
  service_manifest_contract_id: 'smc_phase_6c_attendance_certificate_evidence',
  event_ref: 'event_2026_founder_roundtable',
  attendee_ref: 'attendee_001',
  registration_ref: 'registration_001',
  source_record_ref: 'attendance_certificate_source_001',
  evaluated_by_user_id: 'user_event_ops',
  evaluated_at: '2026-06-12T12:30:00.000Z',
  certificate_scope: 'session_attendance',
  identity_policy: 'identified',
  person_ref: 'person_001',
  contact_ref: 'contact_001',
  certificate_policy_ref: 'policy_attendance_certificate_80_percent',
  attendance_summary: {
    required_sessions: 5,
    attended_sessions: 5,
    minimum_attendance_percent: 80,
    required_minutes: 300,
    attended_minutes: 285,
  },
  checkin_evidence_refs: ['checkin_003', 'checkin_001', 'checkin_002', 'checkin_004', 'checkin_005'],
  certificate_reason: 'attendee met event attendance evidence threshold',
};

const receipt = evaluateAttendanceCertificateEvidence(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_124_attendance_certificate_evidence');
assert.equal(receipt.component_id, '6C.09');
assert.equal(receipt.component_slug, 'events_check_in_and_post_event_service');
assert.equal(receipt.model_name, 'Phase6CAttendanceCertificateEvidence');
assert.equal(receipt.event_name, 'phase_6c.events_check_in_and_post_event_service.attendance_certificate_evidence.runtime_evaluated');
assert.equal(receipt.decision, 'CERTIFICATE_EVIDENCE_READY');
assert.equal(receipt.attendance_percent, 95);
assert.deepEqual(receipt.checkin_evidence_refs, ['checkin_001', 'checkin_002', 'checkin_003', 'checkin_004', 'checkin_005']);
assert.deepEqual(receipt.identity_refs, ['contact_001', 'person_001']);
assert.deepEqual(receipt.review_reasons, []);
assert.deepEqual(receipt.rejection_reasons, []);
assert.equal(receipt.lms_certification_deferred_to_phase, '6D');
assert.equal(receipt.lms_certificate_issued, false);
assert.equal(receipt.credential_issued, false);
assert.equal(receipt.certificate_file_generated, false);
assert.equal(receipt.file_storage_performed, false);
assert.equal(receipt.outbound_communication_performed, false);
assert.deepEqual(receipt.decision_refs, ['6C-EVENT-CHECK-014', '6C-EVENT-REG-012', '6C-GLOBAL-018', '6C-NON-001']);
assert.match(receipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateAttendanceCertificateEvidence({
  ...baseInput,
  checkin_evidence_refs: ['checkin_005', 'checkin_004', 'checkin_003', 'checkin_002', 'checkin_001'],
});
assert.equal(repeatedReceipt.runtime_evidence_digest, receipt.runtime_evidence_digest);

const reviewReceipt = evaluateAttendanceCertificateEvidence({
  ...baseInput,
  identity_policy: 'pseudonymous',
  person_ref: undefined,
  contact_ref: 'contact_shadow_001',
  checkin_evidence_refs: ['checkin_001', 'checkin_002'],
});
assert.equal(reviewReceipt.decision, 'CERTIFICATE_EVIDENCE_REVIEW_REQUIRED');
assert.deepEqual(reviewReceipt.review_reasons, [
  'PSEUDONYMOUS_CERTIFICATE_EVIDENCE_REQUIRES_REVIEW',
  'SESSION_CERTIFICATE_EVIDENCE_HAS_FEWER_CHECKIN_REFS_THAN_ATTENDED_SESSIONS',
]);

const anonymousReceipt = evaluateAttendanceCertificateEvidence({
  ...baseInput,
  identity_policy: 'anonymous',
});
assert.equal(anonymousReceipt.decision, 'CERTIFICATE_EVIDENCE_REJECTED');
assert.ok(anonymousReceipt.rejection_reasons.includes('ANONYMOUS_ATTENDEE_CANNOT_RECEIVE_ATTENDANCE_CERTIFICATE_EVIDENCE'));

const belowThresholdReceipt = evaluateAttendanceCertificateEvidence({
  ...baseInput,
  attendance_summary: {
    required_sessions: 5,
    attended_sessions: 3,
    minimum_attendance_percent: 80,
  },
});
assert.equal(belowThresholdReceipt.decision, 'CERTIFICATE_EVIDENCE_REJECTED');
assert.equal(belowThresholdReceipt.attendance_percent, 60);
assert.ok(belowThresholdReceipt.rejection_reasons.includes('ATTENDANCE_BELOW_CERTIFICATE_POLICY_THRESHOLD'));

const missingIdentityReceipt = evaluateAttendanceCertificateEvidence({
  ...baseInput,
  person_ref: undefined,
  contact_ref: undefined,
});
assert.equal(missingIdentityReceipt.decision, 'CERTIFICATE_EVIDENCE_REJECTED');
assert.ok(missingIdentityReceipt.rejection_reasons.includes('CERTIFICATE_IDENTITY_REF_REQUIRED'));

assert.throws(() => evaluateAttendanceCertificateEvidence({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateAttendanceCertificateEvidence({ ...baseInput, certificate_scope: 'lms_certification' as AttendanceCertificateEvidenceInput['certificate_scope'] }), /certificate_scope is not supported/);
assert.throws(() => evaluateAttendanceCertificateEvidence({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateAttendanceCertificateEvidence({ ...baseInput, attendance_summary: { required_sessions: 0, attended_sessions: 0, minimum_attendance_percent: 80 } }), /required_sessions must be greater than zero/);
assert.throws(() => evaluateAttendanceCertificateEvidence({ ...baseInput, attendance_summary: { required_sessions: 2, attended_sessions: 3, minimum_attendance_percent: 80 } }), /attended_sessions cannot exceed required_sessions/);
assert.throws(() => evaluateAttendanceCertificateEvidence({ ...baseInput, checkin_evidence_refs: [] }), /checkin_evidence_refs must include at least one reference/);
assert.throws(() => evaluateAttendanceCertificateEvidence({ ...baseInput, lms_certification_requested: true }), /must not issue LMS certification/);
assert.throws(() => evaluateAttendanceCertificateEvidence({ ...baseInput, credential_issuance_requested: true }), /must not issue credentials/);
assert.throws(() => evaluateAttendanceCertificateEvidence({ ...baseInput, certificate_file_generation_requested: true }), /must not generate certificate files/);
assert.throws(() => evaluateAttendanceCertificateEvidence({ ...baseInput, file_storage_requested: true }), /must not store files/);
assert.throws(() => evaluateAttendanceCertificateEvidence({ ...baseInput, outbound_communication_requested: true }), /must not send outbound communications/);

console.log('P6C runtime attendance_certificate_evidence test passed.');
