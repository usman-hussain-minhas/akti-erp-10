import assert from 'node:assert/strict';

import { evaluateCompensationMetadataPayrollEvidenceRuntime, type CompensationMetadataPayrollEvidenceRuntimeInput } from './compensation_metadata_payroll_evidence.service';

const baseInput: CompensationMetadataPayrollEvidenceRuntimeInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_compensation_metadata_payroll_evidence',
  source_record_ref: 'compensation_metadata_payroll_evidence_record_001',
  evaluated_by_user_id: 'user_phase_6c_runtime',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  compensation_records: [
    {
      compensation_ref: 'comp_001',
      employee_record_ref: 'employee_001',
      person_identity_anchor_id: 'person_anchor_001',
      compensation_policy_ref: 'comp_policy_salary_001',
      pay_basis: 'SALARY',
      amount_minor_units: 15000000,
      currency_code: 'usd',
      effective_from: '2026-01-01T00:00:00.000Z',
    },
    {
      compensation_ref: 'comp_002',
      employee_record_ref: 'employee_002',
      person_identity_anchor_id: 'person_anchor_002',
      compensation_policy_ref: 'comp_policy_hourly_001',
      pay_basis: 'HOURLY',
      amount_minor_units: 7500,
      currency_code: 'USD',
      effective_from: '2026-12-01T00:00:00.000Z',
    },
    {
      compensation_ref: 'comp_003',
      employee_record_ref: 'employee_003',
      person_identity_anchor_id: 'person_anchor_003',
      compensation_policy_ref: 'comp_policy_stipend_001',
      pay_basis: 'STIPEND',
      amount_minor_units: 50000,
      currency_code: 'USD',
      effective_from: '2026-01-01T00:00:00.000Z',
      effective_to: '2026-03-31T00:00:00.000Z',
    },
  ],
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateCompensationMetadataPayrollEvidenceRuntime(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_007_compensation_metadata_payroll_evidence');
assert.equal(receipt.component_id, '6C.01');
assert.equal(receipt.component_slug, 'hr_employee_records_and_organisation_structure');
assert.equal(receipt.model_name, 'Phase6CCompensationMetadataPayrollEvidence');
assert.equal(receipt.runtime_status, 'COMPENSATION_PAYROLL_EVIDENCE_VALIDATED');
assert.equal(receipt.capability_implementation_allowed, true);
assert.equal(receipt.business_behavior_allowed, true);
assert.equal(receipt.payroll_ownership_allowed, false);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.deepEqual(receipt.decision_refs, ['6C-HR-EMP-011', '6C-SCHEMA-006', '6C-NON-007', '6C-GLOBAL-018']);
assert.deepEqual(receipt.evidence_counts, {
  total_records: 3,
  active_records: 1,
  scheduled_records: 1,
  ended_records: 1,
  payroll_reference_envelopes: 3,
});
assert.equal(receipt.compensation_records[0]?.currency_code, 'USD');
assert.equal(receipt.payroll_evidence_envelopes[0]?.evidence_target, 'PHASE_6B_PAYROLL_REFERENCE');
assert.equal(receipt.payroll_evidence_envelopes[0]?.evidence_mode, 'REFERENCE_ONLY');
assert.match(receipt.payroll_evidence_envelopes[0]?.evidence_hash ?? '', /^[a-f0-9]{64}$/);
assert.match(receipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateCompensationMetadataPayrollEvidenceRuntime(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, receipt.runtime_evidence_digest);
assert.deepEqual(repeatedReceipt.payroll_evidence_envelopes, receipt.payroll_evidence_envelopes);

assert.throws(() => evaluateCompensationMetadataPayrollEvidenceRuntime({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateCompensationMetadataPayrollEvidenceRuntime({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateCompensationMetadataPayrollEvidenceRuntime({ ...baseInput, compensation_records: [{ ...baseInput.compensation_records[0]!, compensation_ref: '' }] }), /compensation_ref is required/);
assert.throws(() => evaluateCompensationMetadataPayrollEvidenceRuntime({ ...baseInput, compensation_records: [{ ...baseInput.compensation_records[0]!, pay_basis: 'UNKNOWN' as never }] }), /pay_basis must be supported/);
assert.throws(() => evaluateCompensationMetadataPayrollEvidenceRuntime({ ...baseInput, compensation_records: [{ ...baseInput.compensation_records[0]!, amount_minor_units: -1 }] }), /amount_minor_units must be a non-negative integer/);
assert.throws(() => evaluateCompensationMetadataPayrollEvidenceRuntime({ ...baseInput, compensation_records: [{ ...baseInput.compensation_records[0]!, currency_code: 'US' }] }), /currency_code must be a three-letter/);
assert.throws(() => evaluateCompensationMetadataPayrollEvidenceRuntime({ ...baseInput, compensation_records: [{ ...baseInput.compensation_records[0]!, effective_to: '2025-01-01T00:00:00.000Z' }] }), /effective_to must not be before effective_from/);
assert.throws(() => evaluateCompensationMetadataPayrollEvidenceRuntime({ ...baseInput, compensation_records: [...baseInput.compensation_records, { ...baseInput.compensation_records[0]!, compensation_ref: 'comp_004' }] }), /must not have multiple ACTIVE compensation metadata records/);
assert.throws(() => evaluateCompensationMetadataPayrollEvidenceRuntime({ ...baseInput, payroll_calculation_requested: true }), /must not calculate payroll/);
assert.throws(() => evaluateCompensationMetadataPayrollEvidenceRuntime({ ...baseInput, payroll_run_generation_requested: true }), /must not generate payroll runs/);
assert.throws(() => evaluateCompensationMetadataPayrollEvidenceRuntime({ ...baseInput, payment_disbursement_requested: true }), /must not disburse payments/);
assert.throws(() => evaluateCompensationMetadataPayrollEvidenceRuntime({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateCompensationMetadataPayrollEvidenceRuntime({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A identity records/);
assert.throws(() => evaluateCompensationMetadataPayrollEvidenceRuntime({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B payroll records/);
assert.throws(() => evaluateCompensationMetadataPayrollEvidenceRuntime({ ...baseInput, runtime_adapter_requested: true }), /must not execute external runtime adapters/);
assert.throws(() => evaluateCompensationMetadataPayrollEvidenceRuntime({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C runtime compensation_metadata_payroll_evidence test passed.');
