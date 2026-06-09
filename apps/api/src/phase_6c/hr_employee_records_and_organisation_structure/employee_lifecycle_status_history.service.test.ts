import assert from 'node:assert/strict';

import { evaluateEmployeeLifecycleStatusHistoryRuntime, type EmployeeLifecycleStatusHistoryRuntimeInput } from './employee_lifecycle_status_history.service';

const baseInput: EmployeeLifecycleStatusHistoryRuntimeInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_employee_lifecycle_status_history',
  source_record_ref: 'employee_lifecycle_status_history_record_001',
  evaluated_by_user_id: 'user_phase_6c_runtime',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  status_labels: [
    { label_code: 'employee_active', label_text: 'Active', anchor: 'active', is_default_for_anchor: true },
    { label_code: 'employee_on_leave', label_text: 'On Leave', anchor: 'inactive' },
    { label_code: 'employee_inactive', label_text: 'Inactive', anchor: 'inactive', is_default_for_anchor: true },
    { label_code: 'employee_terminated', label_text: 'Terminated', anchor: 'terminated', is_default_for_anchor: true },
  ],
  status_changes: [
    {
      change_ref: 'change_001',
      employee_record_ref: 'employee_001',
      person_identity_anchor_id: 'person_anchor_001',
      status_label_code: 'employee_active',
      effective_at: '2026-01-01T00:00:00.000Z',
      reason_ref: 'hire_completed',
      evidence_ref: 'evidence_001',
    },
    {
      change_ref: 'change_002',
      employee_record_ref: 'employee_002',
      person_identity_anchor_id: 'person_anchor_002',
      status_label_code: 'employee_inactive',
      effective_at: '2026-02-01T00:00:00.000Z',
      evidence_ref: 'evidence_002',
    },
    {
      change_ref: 'change_003',
      employee_record_ref: 'employee_003',
      person_identity_anchor_id: 'person_anchor_003',
      status_label_code: 'employee_terminated',
      effective_at: '2026-03-01T00:00:00.000Z',
      evidence_ref: 'evidence_003',
    },
    {
      change_ref: 'change_future',
      employee_record_ref: 'employee_001',
      person_identity_anchor_id: 'person_anchor_001',
      status_label_code: 'employee_on_leave',
      effective_at: '2026-12-01T00:00:00.000Z',
      evidence_ref: 'evidence_future',
    },
  ],
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateEmployeeLifecycleStatusHistoryRuntime(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_008_employee_lifecycle_status_history');
assert.equal(receipt.component_id, '6C.01');
assert.equal(receipt.component_slug, 'hr_employee_records_and_organisation_structure');
assert.equal(receipt.model_name, 'Phase6CEmployeeLifecycleStatusHistory');
assert.equal(receipt.runtime_status, 'EMPLOYEE_LIFECYCLE_STATUS_HISTORY_VALIDATED');
assert.equal(receipt.capability_implementation_allowed, true);
assert.equal(receipt.business_behavior_allowed, true);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.deepEqual(receipt.hard_anchors, ['active', 'inactive', 'terminated']);
assert.deepEqual(receipt.decision_refs, ['6C-HR-EMP-008', '6C-SCHEMA-006', '6C-NON-007']);
assert.deepEqual(receipt.status_counts, {
  labels: 4,
  changes: 4,
  active_employees: 1,
  inactive_employees: 1,
  terminated_employees: 1,
});
assert.equal(receipt.current_status_by_employee.employee_001?.anchor, 'active');
assert.equal(receipt.current_status_by_employee.employee_002?.anchor, 'inactive');
assert.equal(receipt.current_status_by_employee.employee_003?.anchor, 'terminated');
assert.match(receipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateEmployeeLifecycleStatusHistoryRuntime(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, receipt.runtime_evidence_digest);

assert.throws(() => evaluateEmployeeLifecycleStatusHistoryRuntime({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateEmployeeLifecycleStatusHistoryRuntime({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateEmployeeLifecycleStatusHistoryRuntime({ ...baseInput, status_labels: [{ ...baseInput.status_labels[0]!, label_code: '' }] }), /label_code is required/);
assert.throws(() => evaluateEmployeeLifecycleStatusHistoryRuntime({ ...baseInput, status_labels: [{ ...baseInput.status_labels[0]!, anchor: 'probation' as never }] }), /anchor must be one of active/);
assert.throws(() => evaluateEmployeeLifecycleStatusHistoryRuntime({ ...baseInput, status_labels: baseInput.status_labels.filter((label) => label.anchor !== 'terminated') }), /each hard lifecycle anchor must have at least one configurable label/);
assert.throws(() => evaluateEmployeeLifecycleStatusHistoryRuntime({ ...baseInput, status_labels: [...baseInput.status_labels, { label_code: 'employee_active_alt', label_text: 'Active Alt', anchor: 'active', is_default_for_anchor: true }] }), /no more than one default label/);
assert.throws(() => evaluateEmployeeLifecycleStatusHistoryRuntime({ ...baseInput, status_changes: [{ ...baseInput.status_changes[0]!, status_label_code: 'unknown_label' }] }), /references an unknown status_label_code/);
assert.throws(() => evaluateEmployeeLifecycleStatusHistoryRuntime({ ...baseInput, status_changes: [{ ...baseInput.status_changes[0]!, change_ref: '' }] }), /change_ref is required/);
assert.throws(() => evaluateEmployeeLifecycleStatusHistoryRuntime({ ...baseInput, status_changes: [{ ...baseInput.status_changes[0]!, effective_at: 'not-a-date' }] }), /status_effective_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateEmployeeLifecycleStatusHistoryRuntime({ ...baseInput, hard_anchor_mutation_requested: true }), /must not mutate hard lifecycle anchors/);
assert.throws(() => evaluateEmployeeLifecycleStatusHistoryRuntime({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateEmployeeLifecycleStatusHistoryRuntime({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A identity records/);
assert.throws(() => evaluateEmployeeLifecycleStatusHistoryRuntime({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B records/);
assert.throws(() => evaluateEmployeeLifecycleStatusHistoryRuntime({ ...baseInput, runtime_adapter_requested: true }), /must not execute external runtime adapters/);
assert.throws(() => evaluateEmployeeLifecycleStatusHistoryRuntime({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C runtime employee_lifecycle_status_history test passed.');
