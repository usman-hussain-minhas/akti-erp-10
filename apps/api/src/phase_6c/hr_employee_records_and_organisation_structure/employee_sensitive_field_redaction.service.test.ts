import assert from 'node:assert/strict';

import { evaluateEmployeeSensitiveFieldRedactionRuntime, type EmployeeSensitiveFieldRedactionRuntimeInput } from './employee_sensitive_field_redaction.service';

const sensitiveFields = {
  compensation: 'salary-band-a',
  national_id: 'national-id-123',
  bank: 'bank-account-456',
  health: 'health-note',
  emergency_contact: 'emergency-contact',
  performance: 'performance-note',
  disciplinary: 'disciplinary-note',
};

const baseInput: EmployeeSensitiveFieldRedactionRuntimeInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_employee_sensitive_field_redaction',
  source_record_ref: 'employee_sensitive_field_redaction_record_001',
  evaluated_by_user_id: 'user_phase_6c_runtime',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  viewer_role: 'MANAGER',
  records: [
    {
      employee_record_ref: 'employee_001',
      person_identity_anchor_id: 'person_anchor_001',
      sensitive_fields: sensitiveFields,
    },
  ],
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const managerReceipt = evaluateEmployeeSensitiveFieldRedactionRuntime(baseInput);
assert.equal(managerReceipt.seed_id, 'seed_6c_009_employee_sensitive_field_redaction');
assert.equal(managerReceipt.component_id, '6C.01');
assert.equal(managerReceipt.component_slug, 'hr_employee_records_and_organisation_structure');
assert.equal(managerReceipt.model_name, 'Phase6CEmployeeSensitiveFieldRedaction');
assert.equal(managerReceipt.runtime_status, 'EMPLOYEE_SENSITIVE_FIELDS_REDACTED');
assert.equal(managerReceipt.capability_implementation_allowed, true);
assert.equal(managerReceipt.business_behavior_allowed, true);
assert.equal(managerReceipt.runtime_adapter_allowed, false);
assert.equal(managerReceipt.support_window_applied, false);
assert.deepEqual(managerReceipt.redaction_counts, {
  records: 1,
  visible_field_count: 0,
  redacted_field_count: 7,
});
assert.deepEqual(managerReceipt.redacted_records[0]?.redacted_fields, ['compensation', 'national_id', 'bank', 'health', 'emergency_contact', 'performance', 'disciplinary']);
assert.match(managerReceipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const hrReceipt = evaluateEmployeeSensitiveFieldRedactionRuntime({ ...baseInput, viewer_role: 'HR_AUTHORIZED' });
assert.equal(hrReceipt.redaction_counts.visible_field_count, 7);
assert.equal(hrReceipt.redaction_counts.redacted_field_count, 0);
assert.equal(hrReceipt.redacted_records[0]?.visible_fields.bank, 'bank-account-456');

const selfReceipt = evaluateEmployeeSensitiveFieldRedactionRuntime({ ...baseInput, viewer_role: 'SELF', viewer_employee_record_ref: 'employee_001' });
assert.equal(selfReceipt.redaction_counts.visible_field_count, 7);

const otherSelfReceipt = evaluateEmployeeSensitiveFieldRedactionRuntime({ ...baseInput, viewer_role: 'SELF', viewer_employee_record_ref: 'employee_999' });
assert.equal(otherSelfReceipt.redaction_counts.redacted_field_count, 7);

const supportReceipt = evaluateEmployeeSensitiveFieldRedactionRuntime({
  ...baseInput,
  viewer_role: 'WORKSPACE_ADMIN',
  support_window: {
    support_window_ref: 'support_window_001',
    authorized_by_user_id: 'security_admin_001',
    audit_reason_ref: 'support_case_001',
    expires_at: '2026-06-09T10:00:00.000Z',
  },
});
assert.equal(supportReceipt.support_window_applied, true);
assert.equal(supportReceipt.support_window_ref, 'support_window_001');
assert.equal(supportReceipt.redaction_counts.visible_field_count, 7);

const repeatedReceipt = evaluateEmployeeSensitiveFieldRedactionRuntime(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, managerReceipt.runtime_evidence_digest);

assert.throws(() => evaluateEmployeeSensitiveFieldRedactionRuntime({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateEmployeeSensitiveFieldRedactionRuntime({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateEmployeeSensitiveFieldRedactionRuntime({ ...baseInput, viewer_role: 'UNKNOWN' as never }), /viewer_role must be supported/);
assert.throws(() => evaluateEmployeeSensitiveFieldRedactionRuntime({ ...baseInput, records: [{ ...baseInput.records[0]!, employee_record_ref: '' }] }), /employee_record_ref is required/);
assert.throws(() => evaluateEmployeeSensitiveFieldRedactionRuntime({ ...baseInput, records: [{ ...baseInput.records[0]!, sensitive_fields: { ...sensitiveFields, extra: 'nope' } as never }] }), /outside the ratified sensitive set/);
assert.throws(() => evaluateEmployeeSensitiveFieldRedactionRuntime({
  ...baseInput,
  viewer_role: 'SUPPORT_OPERATOR',
  support_window: {
    support_window_ref: 'support_window_002',
    authorized_by_user_id: 'security_admin_001',
    audit_reason_ref: 'support_case_002',
    expires_at: '2026-06-09T08:00:00.000Z',
  },
}), /support window must not be expired/);
assert.throws(() => evaluateEmployeeSensitiveFieldRedactionRuntime({ ...baseInput, support_window_bypass_requested: true }), /must not bypass audited support windows/);
assert.throws(() => evaluateEmployeeSensitiveFieldRedactionRuntime({ ...baseInput, unrestricted_export_requested: true }), /must not perform unrestricted sensitive exports/);
assert.throws(() => evaluateEmployeeSensitiveFieldRedactionRuntime({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateEmployeeSensitiveFieldRedactionRuntime({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A identity records/);
assert.throws(() => evaluateEmployeeSensitiveFieldRedactionRuntime({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B records/);
assert.throws(() => evaluateEmployeeSensitiveFieldRedactionRuntime({ ...baseInput, runtime_adapter_requested: true }), /must not execute external runtime adapters/);
assert.throws(() => evaluateEmployeeSensitiveFieldRedactionRuntime({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C runtime employee_sensitive_field_redaction test passed.');
