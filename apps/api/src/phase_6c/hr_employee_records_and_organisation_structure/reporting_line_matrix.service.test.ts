import assert from 'node:assert/strict';

import { evaluateReportingLineMatrixRuntime, type ReportingLineMatrixRuntimeInput } from './reporting_line_matrix.service';

const baseInput: ReportingLineMatrixRuntimeInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_reporting_line_matrix',
  source_record_ref: 'reporting_line_matrix_record_001',
  evaluated_by_user_id: 'user_phase_6c_runtime',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  reporting_lines: [
    {
      line_ref: 'line_primary_001',
      employee_record_ref: 'employee_001',
      manager_employee_record_ref: 'employee_010',
      line_type: 'PRIMARY',
      effective_from: '2026-01-01T00:00:00.000Z',
    },
    {
      line_ref: 'line_dotted_001',
      employee_record_ref: 'employee_001',
      manager_employee_record_ref: 'employee_020',
      line_type: 'DOTTED',
      effective_from: '2026-01-01T00:00:00.000Z',
    },
    {
      line_ref: 'line_scheduled_001',
      employee_record_ref: 'employee_002',
      manager_employee_record_ref: 'employee_010',
      line_type: 'PRIMARY',
      effective_from: '2026-12-01T00:00:00.000Z',
    },
  ],
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateReportingLineMatrixRuntime(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_004_reporting_line_matrix');
assert.equal(receipt.component_id, '6C.01');
assert.equal(receipt.component_slug, 'hr_employee_records_and_organisation_structure');
assert.equal(receipt.model_name, 'Phase6CReportingLineMatrix');
assert.equal(receipt.runtime_status, 'REPORTING_LINE_MATRIX_VALIDATED');
assert.equal(receipt.capability_implementation_allowed, true);
assert.equal(receipt.business_behavior_allowed, true);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.deepEqual(receipt.decision_refs, ['6C-HR-EMP-006', '6C-SCHEMA-006', '6C-NON-007']);
assert.deepEqual(receipt.matrix_counts, {
  total_lines: 3,
  active_lines: 2,
  active_primary_lines: 1,
  active_dotted_lines: 1,
  employees_with_active_primary_manager: 1,
});
assert.match(receipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateReportingLineMatrixRuntime(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, receipt.runtime_evidence_digest);

assert.throws(() => evaluateReportingLineMatrixRuntime({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateReportingLineMatrixRuntime({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateReportingLineMatrixRuntime({ ...baseInput, reporting_lines: [{ ...baseInput.reporting_lines[0]!, line_ref: '' }] }), /line_ref is required/);
assert.throws(() => evaluateReportingLineMatrixRuntime({ ...baseInput, reporting_lines: [{ ...baseInput.reporting_lines[0]!, line_type: 'INVALID' as never }] }), /line_type must be PRIMARY or DOTTED/);
assert.throws(() => evaluateReportingLineMatrixRuntime({ ...baseInput, reporting_lines: [{ ...baseInput.reporting_lines[0]!, manager_employee_record_ref: 'employee_001' }] }), /employee must not report to self/);
assert.throws(() => evaluateReportingLineMatrixRuntime({ ...baseInput, reporting_lines: [...baseInput.reporting_lines, { ...baseInput.reporting_lines[0]!, line_ref: 'line_primary_duplicate' }] }), /active PRIMARY employee_record_ref must be unique/);
assert.throws(() => evaluateReportingLineMatrixRuntime({ ...baseInput, reporting_lines: [{ ...baseInput.reporting_lines[0]!, effective_to: '2025-01-01T00:00:00.000Z' }] }), /line effective_to must not be before effective_from/);
assert.throws(() => evaluateReportingLineMatrixRuntime({
  ...baseInput,
  reporting_lines: [
    {
      line_ref: 'cycle_a',
      employee_record_ref: 'employee_a',
      manager_employee_record_ref: 'employee_b',
      line_type: 'PRIMARY',
      effective_from: '2026-01-01T00:00:00.000Z',
    },
    {
      line_ref: 'cycle_b',
      employee_record_ref: 'employee_b',
      manager_employee_record_ref: 'employee_a',
      line_type: 'PRIMARY',
      effective_from: '2026-01-01T00:00:00.000Z',
    },
  ],
}), /must not create a management cycle/);
assert.throws(() => evaluateReportingLineMatrixRuntime({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateReportingLineMatrixRuntime({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A identity records/);
assert.throws(() => evaluateReportingLineMatrixRuntime({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B finance or billing records/);
assert.throws(() => evaluateReportingLineMatrixRuntime({ ...baseInput, runtime_adapter_requested: true }), /must not execute external runtime adapters/);
assert.throws(() => evaluateReportingLineMatrixRuntime({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C runtime reporting_line_matrix test passed.');
