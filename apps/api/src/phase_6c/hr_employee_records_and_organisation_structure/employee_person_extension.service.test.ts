import assert from 'node:assert/strict';

import { recordEmployeePersonExtension, type EmployeePersonExtensionInput } from './employee_person_extension.service';

const baseInput: EmployeePersonExtensionInput = {
  organization_id: ' org_phase_6c_runtime ',
  service_manifest_contract_id: ' smc_phase_6c_employee_person_extension ',
  person_identity_graph_ref: ' person_identity_graph_ref_001 ',
  employee_record_ref: ' employee_person_extension_record_001 ',
  employee_number: ' EMP-0001 ',
  extension_status: 'ACTIVE',
  effective_at: '2026-06-09T09:00:00.000Z',
  evaluated_by_user_id: ' user_phase_6c_runtime ',
  evaluated_at: '2026-06-09T09:05:00.000Z',
  control_metadata: { zeta: 'last', alpha: 'first' },
  identity_anchor: {
    organization_id: 'org_phase_6c_runtime',
    person_identity_graph_ref: 'person_identity_graph_ref_001',
  },
};

const receipt = recordEmployeePersonExtension(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_001_employee_person_extension');
assert.equal(receipt.component_id, '6C.01');
assert.equal(receipt.component_slug, 'hr_employee_records_and_organisation_structure');
assert.equal(receipt.model_name, 'Phase6CEmployeePersonExtension');
assert.equal(receipt.runtime_status, 'RUNTIME_BEHAVIOR_RECORDED');
assert.equal(receipt.capability_implementation_allowed, true);
assert.equal(receipt.business_behavior_allowed, true);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.equal(receipt.organization_id, 'org_phase_6c_runtime');
assert.equal(receipt.service_manifest_contract_id, 'smc_phase_6c_employee_person_extension');
assert.equal(receipt.person_identity_graph_ref, 'person_identity_graph_ref_001');
assert.equal(receipt.employee_record_ref, 'employee_person_extension_record_001');
assert.equal(receipt.employee_number, 'EMP-0001');
assert.deepEqual(receipt.decision_refs, ['6C-HR-EMP-006', '6C-SCHEMA-006', '6C-NON-007']);
assert.deepEqual(receipt.dependency_refs, ['seed_6a_service_manifest_contract', '6A.05', '6A.06']);
assert.deepEqual(Object.keys(receipt.control_metadata), ['alpha', 'zeta']);
assert.match(receipt.employee_person_extension_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = recordEmployeePersonExtension(baseInput);
assert.equal(repeatedReceipt.employee_person_extension_evidence_digest, receipt.employee_person_extension_evidence_digest);

const withoutEmployeeNumber = recordEmployeePersonExtension({ ...baseInput, employee_number: ' ', source_record_ref: ' source-record-002 ' });
assert.equal(withoutEmployeeNumber.employee_number, null);
assert.equal(withoutEmployeeNumber.source_record_ref, 'source-record-002');

assert.throws(() => recordEmployeePersonExtension({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => recordEmployeePersonExtension({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => recordEmployeePersonExtension({ ...baseInput, person_identity_graph_ref: '' }), /person_identity_graph_ref is required/);
assert.throws(() => recordEmployeePersonExtension({ ...baseInput, employee_record_ref: '' }), /employee_record_ref is required/);
assert.throws(() => recordEmployeePersonExtension({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => recordEmployeePersonExtension({ ...baseInput, effective_at: 'not-a-date' }), /effective_at must be a valid ISO-compatible timestamp/);
assert.throws(() => recordEmployeePersonExtension({ ...baseInput, extension_status: 'DELETED' as never }), /extension_status must be ACTIVE/);
assert.throws(() => recordEmployeePersonExtension({ ...baseInput, identity_anchor: { organization_id: 'other_org', person_identity_graph_ref: 'person_identity_graph_ref_001' } }), /identity_anchor.organization_id must match/);
assert.throws(() => recordEmployeePersonExtension({ ...baseInput, identity_anchor: { organization_id: 'org_phase_6c_runtime', person_identity_graph_ref: 'other_person' } }), /identity_anchor.person_identity_graph_ref must match/);
assert.throws(() => recordEmployeePersonExtension({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => recordEmployeePersonExtension({ ...baseInput, phase_6a_mutation_requested: true }), /must reference, not mutate, Phase 6A/);
assert.throws(() => recordEmployeePersonExtension({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => recordEmployeePersonExtension({ ...baseInput, runtime_adapter_requested: true }), /must not execute external runtime adapters/);

console.log('P6C runtime employee_person_extension test passed.');
