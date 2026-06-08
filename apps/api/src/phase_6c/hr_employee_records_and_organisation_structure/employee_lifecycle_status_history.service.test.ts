import assert from 'node:assert/strict';

import { evaluateEmployeeLifecycleStatusHistoryScaffold, type EmployeeLifecycleStatusHistoryScaffoldInput } from './employee_lifecycle_status_history.service';

const baseInput: EmployeeLifecycleStatusHistoryScaffoldInput = {
  organization_id: 'org_phase_6c_control',
  service_manifest_contract_id: 'smc_phase_6c_employee_lifecycle_status_history',
  source_record_ref: 'employee_lifecycle_status_history_record_001',
  evaluated_by_user_id: 'user_phase_6c_control',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  control_metadata: { source: 'phase_6c_scaffold_control' },
};

const receipt = evaluateEmployeeLifecycleStatusHistoryScaffold(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_008_employee_lifecycle_status_history');
assert.equal(receipt.component_id, '6C.01');
assert.equal(receipt.component_slug, 'hr_employee_records_and_organisation_structure');
assert.equal(receipt.model_name, 'Phase6CEmployeeLifecycleStatusHistory');
assert.equal(receipt.scaffold_status, 'SCAFFOLD_CONTROL_ONLY');
assert.equal(receipt.capability_implementation_allowed, false);
assert.equal(receipt.business_behavior_allowed, false);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.match(receipt.scaffold_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateEmployeeLifecycleStatusHistoryScaffold(baseInput);
assert.equal(repeatedReceipt.scaffold_evidence_digest, receipt.scaffold_evidence_digest);

assert.throws(() => evaluateEmployeeLifecycleStatusHistoryScaffold({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateEmployeeLifecycleStatusHistoryScaffold({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateEmployeeLifecycleStatusHistoryScaffold({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateEmployeeLifecycleStatusHistoryScaffold({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateEmployeeLifecycleStatusHistoryScaffold({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateEmployeeLifecycleStatusHistoryScaffold({ ...baseInput, capability_execution_requested: true }), /must not execute capability behavior/);
assert.throws(() => evaluateEmployeeLifecycleStatusHistoryScaffold({ ...baseInput, business_behavior_requested: true }), /must not execute business behavior/);
assert.throws(() => evaluateEmployeeLifecycleStatusHistoryScaffold({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapter behavior/);

console.log('P6C scaffold-control employee_lifecycle_status_history test passed.');
