import assert from 'node:assert/strict';

import { evaluateEmployeeNumberPolicy, type EmployeeNumberPolicyInput } from './employee_number_policy.service';

const baseInput: EmployeeNumberPolicyInput = {
  organization_id: ' org_phase_6c_runtime ',
  service_manifest_contract_id: ' smc_phase_6c_employee_number_policy ',
  stable_employee_uuid: '550e8400-e29b-41d4-a716-446655440000',
  employee_person_extension_ref: ' employee_person_extension_record_001 ',
  policy_config: {
    prefix: 'EMP',
    sequence_value: 42,
    padding_width: 5,
    separator: '-',
    suffix: 'PK',
  },
  evaluated_by_user_id: ' user_phase_6c_runtime ',
  evaluated_at: '2026-06-09T09:05:00.000Z',
  control_metadata: { zeta: 'last', alpha: 'first' },
};

const receipt = evaluateEmployeeNumberPolicy(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_002_employee_number_policy');
assert.equal(receipt.component_id, '6C.01');
assert.equal(receipt.component_slug, 'hr_employee_records_and_organisation_structure');
assert.equal(receipt.model_name, 'Phase6CEmployeeNumberPolicy');
assert.equal(receipt.runtime_status, 'EMPLOYEE_NUMBER_POLICY_EVALUATED');
assert.equal(receipt.capability_implementation_allowed, true);
assert.equal(receipt.business_behavior_allowed, true);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.equal(receipt.organization_id, 'org_phase_6c_runtime');
assert.equal(receipt.stable_employee_uuid, '550e8400-e29b-41d4-a716-446655440000');
assert.equal(receipt.employee_person_extension_ref, 'employee_person_extension_record_001');
assert.equal(receipt.display_employee_number, 'EMP-00042-PK');
assert.deepEqual(receipt.decision_refs, ['6C-HR-EMP-001']);
assert.deepEqual(receipt.dependency_refs, ['seed_6a_service_manifest_contract', 'seed_6c_001_employee_person_extension']);
assert.deepEqual(Object.keys(receipt.control_metadata), ['alpha', 'zeta']);
assert.match(receipt.employee_number_policy_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateEmployeeNumberPolicy(baseInput);
assert.equal(repeatedReceipt.employee_number_policy_evidence_digest, receipt.employee_number_policy_evidence_digest);

const defaultSeparatorReceipt = evaluateEmployeeNumberPolicy({
  ...baseInput,
  policy_config: { prefix: 'STAFF', sequence_value: 7, padding_width: 3 },
  source_record_ref: ' source-policy-002 ',
});
assert.equal(defaultSeparatorReceipt.display_employee_number, 'STAFF-007');
assert.equal(defaultSeparatorReceipt.source_record_ref, 'source-policy-002');

assert.throws(() => evaluateEmployeeNumberPolicy({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateEmployeeNumberPolicy({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateEmployeeNumberPolicy({ ...baseInput, stable_employee_uuid: 'not-a-uuid' }), /stable_employee_uuid must be a stable UUID/);
assert.throws(() => evaluateEmployeeNumberPolicy({ ...baseInput, employee_person_extension_ref: '' }), /employee_person_extension_ref is required/);
assert.throws(() => evaluateEmployeeNumberPolicy({ ...baseInput, policy_config: { ...baseInput.policy_config, prefix: '' } }), /policy_config.prefix is required/);
assert.throws(() => evaluateEmployeeNumberPolicy({ ...baseInput, policy_config: { ...baseInput.policy_config, sequence_value: -1 } }), /sequence_value must be a non-negative integer/);
assert.throws(() => evaluateEmployeeNumberPolicy({ ...baseInput, policy_config: { ...baseInput.policy_config, padding_width: 0 } }), /padding_width must be an integer/);
assert.throws(() => evaluateEmployeeNumberPolicy({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateEmployeeNumberPolicy({ ...baseInput, hardcoded_display_number_requested: true }), /must derive display numbers from configurable policy/);
assert.throws(() => evaluateEmployeeNumberPolicy({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateEmployeeNumberPolicy({ ...baseInput, runtime_adapter_requested: true }), /must not execute external runtime adapters/);

console.log('P6C runtime employee_number_policy test passed.');
