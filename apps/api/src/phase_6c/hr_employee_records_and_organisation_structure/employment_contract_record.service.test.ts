import assert from 'node:assert/strict';

import { evaluateEmploymentContractRecordRuntime, type EmploymentContractRecordRuntimeInput } from './employment_contract_record.service';

const baseInput: EmploymentContractRecordRuntimeInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_employment_contract_record',
  source_record_ref: 'employment_contract_record_record_001',
  evaluated_by_user_id: 'user_phase_6c_runtime',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  contracts: [
    {
      contract_ref: 'contract_001',
      employee_record_ref: 'employee_001',
      person_identity_anchor_id: 'person_anchor_001',
      contract_type: 'PERMANENT',
      version: 1,
      effective_from: '2026-01-01T00:00:00.000Z',
      signed_at: '2025-12-15T00:00:00.000Z',
      compensation_policy_ref: 'comp_policy_001',
      document_evidence_ref: 'doc_evidence_001',
    },
    {
      contract_ref: 'contract_002',
      employee_record_ref: 'employee_002',
      person_identity_anchor_id: 'person_anchor_002',
      contract_type: 'FIXED_TERM',
      version: 1,
      effective_from: '2026-12-01T00:00:00.000Z',
      effective_to: '2027-12-01T00:00:00.000Z',
      signed_at: '2026-05-01T00:00:00.000Z',
      renewal_notice_days: 30,
      document_evidence_ref: 'doc_evidence_002',
    },
    {
      contract_ref: 'contract_003',
      employee_record_ref: 'employee_003',
      person_identity_anchor_id: 'person_anchor_003',
      contract_type: 'PROBATION',
      version: 1,
      effective_from: '2026-01-01T00:00:00.000Z',
      effective_to: '2026-03-31T00:00:00.000Z',
      signed_at: '2025-12-20T00:00:00.000Z',
      probation_end_at: '2026-03-31T00:00:00.000Z',
      document_evidence_ref: 'doc_evidence_003',
    },
    {
      contract_ref: 'contract_004',
      employee_record_ref: 'employee_004',
      person_identity_anchor_id: 'person_anchor_004',
      contract_type: 'CONSULTANT',
      version: 1,
      effective_from: '2026-01-01T00:00:00.000Z',
      document_evidence_ref: 'doc_evidence_004',
    },
  ],
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateEmploymentContractRecordRuntime(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_005_employment_contract_record');
assert.equal(receipt.component_id, '6C.01');
assert.equal(receipt.component_slug, 'hr_employee_records_and_organisation_structure');
assert.equal(receipt.model_name, 'Phase6CEmploymentContractRecord');
assert.equal(receipt.runtime_status, 'EMPLOYMENT_CONTRACT_RECORD_VALIDATED');
assert.equal(receipt.capability_implementation_allowed, true);
assert.equal(receipt.business_behavior_allowed, true);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.deepEqual(receipt.decision_refs, ['6C-HR-EMP-007', '6C-SCHEMA-006', '6C-NON-007']);
assert.deepEqual(receipt.contract_counts, {
  total_contracts: 4,
  active_contracts: 1,
  scheduled_contracts: 1,
  expired_contracts: 1,
  signed_contracts: 3,
});
assert.equal(receipt.contracts.find((contract) => contract.contract_ref === 'contract_004')?.contract_status, 'DRAFT');
assert.match(receipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateEmploymentContractRecordRuntime(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, receipt.runtime_evidence_digest);

assert.throws(() => evaluateEmploymentContractRecordRuntime({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateEmploymentContractRecordRuntime({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateEmploymentContractRecordRuntime({ ...baseInput, contracts: [{ ...baseInput.contracts[0]!, contract_ref: '' }] }), /contract_ref is required/);
assert.throws(() => evaluateEmploymentContractRecordRuntime({ ...baseInput, contracts: [{ ...baseInput.contracts[0]!, contract_type: 'UNKNOWN' as never }] }), /contract_type must be a supported/);
assert.throws(() => evaluateEmploymentContractRecordRuntime({ ...baseInput, contracts: [{ ...baseInput.contracts[0]!, version: 0 }] }), /contract_version must be a positive integer/);
assert.throws(() => evaluateEmploymentContractRecordRuntime({ ...baseInput, contracts: [{ ...baseInput.contracts[0]!, effective_to: '2025-01-01T00:00:00.000Z' }] }), /effective_to must not be before effective_from/);
assert.throws(() => evaluateEmploymentContractRecordRuntime({ ...baseInput, contracts: [{ ...baseInput.contracts[0]!, signed_at: '2026-02-01T00:00:00.000Z' }] }), /signed_at must not be after effective_from/);
assert.throws(() => evaluateEmploymentContractRecordRuntime({ ...baseInput, contracts: [{ ...baseInput.contracts[1]!, effective_to: undefined }] }), /FIXED_TERM contracts require effective_to/);
assert.throws(() => evaluateEmploymentContractRecordRuntime({ ...baseInput, contracts: [{ ...baseInput.contracts[2]!, probation_end_at: undefined }] }), /PROBATION contracts require probation_end_at/);
assert.throws(() => evaluateEmploymentContractRecordRuntime({ ...baseInput, contracts: [...baseInput.contracts, { ...baseInput.contracts[0]!, contract_ref: 'contract_005', version: 2 }] }), /must not have multiple ACTIVE contracts/);
assert.throws(() => evaluateEmploymentContractRecordRuntime({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateEmploymentContractRecordRuntime({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A identity records/);
assert.throws(() => evaluateEmploymentContractRecordRuntime({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B finance or billing records/);
assert.throws(() => evaluateEmploymentContractRecordRuntime({ ...baseInput, runtime_adapter_requested: true }), /must not execute external runtime adapters/);
assert.throws(() => evaluateEmploymentContractRecordRuntime({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C runtime employment_contract_record test passed.');
