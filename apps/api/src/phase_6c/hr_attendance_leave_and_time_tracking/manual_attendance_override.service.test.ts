import assert from 'node:assert/strict';

import { evaluateManualAttendanceOverride, type ManualAttendanceOverrideInput } from './manual_attendance_override.service';

const baseInput: ManualAttendanceOverrideInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_manual_attendance_override',
  source_record_ref: 'manual_attendance_override_record_001',
  employee_ref: 'employee_phase_6c_001',
  override_action: 'CORRECT_CHECK_IN',
  override_effective_at: '2026-06-09T08:45:00.000Z',
  server_recorded_at: '2026-06-09T09:00:00.000Z',
  reason_ref: 'manual_attendance_override_reason_001',
  reason_text: 'Supervisor approved correction for missed check-in evidence.',
  requested_by_user_id: 'user_phase_6c_attendance_reviewer',
  control_metadata: { source: 'phase_6c_ffet_028' },
};

const pendingReceipt = evaluateManualAttendanceOverride(baseInput);
assert.equal(pendingReceipt.seed_id, 'seed_6c_028_manual_attendance_override');
assert.equal(pendingReceipt.component_id, '6C.03');
assert.equal(pendingReceipt.component_slug, 'hr_attendance_leave_and_time_tracking');
assert.equal(pendingReceipt.model_name, 'Phase6CManualAttendanceOverride');
assert.equal(pendingReceipt.event_name, 'phase_6c.hr_attendance_leave_and_time_tracking.manual_attendance_override.evaluated');
assert.equal(pendingReceipt.runtime_status, 'MANUAL_ATTENDANCE_OVERRIDE_EVALUATED');
assert.equal(pendingReceipt.approval_default_on, true);
assert.equal(pendingReceipt.approval_required, true);
assert.equal(pendingReceipt.approval_ref, null);
assert.equal(pendingReceipt.decision, 'PENDING_APPROVAL');
assert.deepEqual(pendingReceipt.rejection_reasons, []);
assert.equal(pendingReceipt.provider_neutral_only, true);
assert.equal(pendingReceipt.fallback_methods_allowed, true);
assert.equal(pendingReceipt.attendance_record_mutation_allowed, false);
assert.deepEqual(pendingReceipt.decision_refs, ['6C-ATT-001', '6C-ATT-002', '6C-ATT-008', '6C-ATT-010', '6C-ATT-011', '6C-ATT-019']);
assert.deepEqual(pendingReceipt.evidence_artifacts, [
  'manual_attendance_override_decision_receipt',
  'manual_attendance_override_reason_evidence',
  'manual_attendance_override_approval_default_evidence',
]);
assert.match(pendingReceipt.override_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateManualAttendanceOverride(baseInput);
assert.equal(repeatedReceipt.override_evidence_digest, pendingReceipt.override_evidence_digest);

const approvedReceipt = evaluateManualAttendanceOverride({
  ...baseInput,
  approval_ref: 'manual_attendance_override_approval_001',
});
assert.equal(approvedReceipt.decision, 'APPROVED_FOR_RECORDING');
assert.equal(approvedReceipt.approval_required, true);
assert.equal(approvedReceipt.approval_ref, 'manual_attendance_override_approval_001');

const configuredNoApprovalReceipt = evaluateManualAttendanceOverride({
  ...baseInput,
  approval_required: false,
  fallback_method_ref: 'attendance_fallback_method_manual_review',
});
assert.equal(configuredNoApprovalReceipt.decision, 'APPROVED_FOR_RECORDING');
assert.equal(configuredNoApprovalReceipt.approval_required, false);
assert.equal(configuredNoApprovalReceipt.fallback_method_ref, 'attendance_fallback_method_manual_review');

const duplicateRejectedReceipt = evaluateManualAttendanceOverride({
  ...baseInput,
  approval_required: false,
  duplicate_detected: true,
});
assert.equal(duplicateRejectedReceipt.decision, 'REJECTED');
assert.deepEqual(duplicateRejectedReceipt.rejection_reasons, ['DUPLICATE_DETECTED_EXCEPTION_REQUIRED']);
assert.equal(duplicateRejectedReceipt.duplicate_exception_recorded, false);

const duplicateExceptionReceipt = evaluateManualAttendanceOverride({
  ...baseInput,
  approval_required: false,
  duplicate_detected: true,
  duplicate_exception_ref: 'manual_attendance_duplicate_exception_001',
});
assert.equal(duplicateExceptionReceipt.decision, 'APPROVED_FOR_RECORDING');
assert.equal(duplicateExceptionReceipt.duplicate_exception_recorded, true);
assert.equal(duplicateExceptionReceipt.duplicate_exception_ref, 'manual_attendance_duplicate_exception_001');

assert.throws(() => evaluateManualAttendanceOverride({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateManualAttendanceOverride({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateManualAttendanceOverride({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateManualAttendanceOverride({ ...baseInput, employee_ref: '' }), /employee_ref is required/);
assert.throws(() => evaluateManualAttendanceOverride({ ...baseInput, reason_ref: '' }), /reason_ref is required/);
assert.throws(() => evaluateManualAttendanceOverride({ ...baseInput, reason_text: '' }), /reason_text is required/);
assert.throws(() => evaluateManualAttendanceOverride({ ...baseInput, requested_by_user_id: '' }), /requested_by_user_id is required/);
assert.throws(() => evaluateManualAttendanceOverride({ ...baseInput, override_effective_at: 'not-a-date' }), /override_effective_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateManualAttendanceOverride({ ...baseInput, server_recorded_at: 'not-a-date' }), /server_recorded_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateManualAttendanceOverride({ ...baseInput, approval_ref: ' ' }), /approval_ref must be non-empty/);
assert.throws(() => evaluateManualAttendanceOverride({ ...baseInput, duplicate_exception_ref: ' ' }), /duplicate_exception_ref must be non-empty/);
assert.throws(() => evaluateManualAttendanceOverride({ ...baseInput, fallback_method_ref: ' ' }), /fallback_method_ref must be non-empty/);
assert.throws(() => evaluateManualAttendanceOverride({ ...baseInput, reasonless_override_requested: true }), /requires a reason/);
assert.throws(() => evaluateManualAttendanceOverride({ ...baseInput, approval_bypass_requested: true }), /must not bypass approval defaults/);
assert.throws(() => evaluateManualAttendanceOverride({ ...baseInput, direct_attendance_record_mutation_requested: true }), /must not mutate attendance records directly/);
assert.throws(() => evaluateManualAttendanceOverride({ ...baseInput, provider_specific_adapter_requested: true }), /provider-neutral/);
assert.throws(() => evaluateManualAttendanceOverride({ ...baseInput, schema_mutation_requested: true }), /must not request schema mutation/);
assert.throws(() => evaluateManualAttendanceOverride({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateManualAttendanceOverride({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateManualAttendanceOverride({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateManualAttendanceOverride({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C manual_attendance_override runtime test passed.');
