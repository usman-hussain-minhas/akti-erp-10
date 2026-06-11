import assert from 'node:assert/strict';

import { evaluatePerformanceFramework, type PerformanceFrameworkInput } from './performance_framework.service';

const baseInput: PerformanceFrameworkInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_performance_framework',
  source_record_ref: 'performance_framework_record_001',
  framework_ref: 'framework_annual_growth_001',
  framework_name: 'Annual Growth Review',
  cycle_ref: 'performance_cycle_2027',
  cycle_start: '2027-01-01',
  cycle_end: '2027-12-31',
  dimensions: [
    { dimension_ref: 'goals', label: 'Business goals', dimension_type: 'GOAL', weight_percent: 50, required: true },
    { dimension_ref: 'competency', label: 'Role competency', dimension_type: 'COMPETENCY', weight_percent: 30, required: true },
    { dimension_ref: 'behavior', label: 'Values and behavior', dimension_type: 'BEHAVIOR', weight_percent: 20, required: true },
  ],
  rating_scale: [
    { rating_ref: 'needs_improvement', label: 'Needs improvement', numeric_value: 1, passing: false },
    { rating_ref: 'meets_expectation', label: 'Meets expectation', numeric_value: 3, passing: true },
    { rating_ref: 'exceeds_expectation', label: 'Exceeds expectation', numeric_value: 5, passing: true },
  ],
  reviewer_role_refs: ['manager', 'hr_business_partner'],
  calibration_required: true,
  evaluated_by_user_id: 'user_phase_6c_hr_admin',
  evaluated_at: '2027-01-01T08:00:00.000Z',
  control_metadata: { source: 'phase_6c_ffet_040' },
};

const readyReceipt = evaluatePerformanceFramework(baseInput);
assert.equal(readyReceipt.seed_id, 'seed_6c_040_performance_framework');
assert.equal(readyReceipt.component_id, '6C.04');
assert.equal(readyReceipt.component_slug, 'hr_performance_commission_policy_and_offboarding');
assert.equal(readyReceipt.model_name, 'Phase6CPerformanceFramework');
assert.equal(readyReceipt.event_name, 'phase_6c.hr_performance_commission_policy_and_offboarding.performance_framework.evaluated');
assert.equal(readyReceipt.runtime_status, 'PERFORMANCE_FRAMEWORK_EVALUATED');
assert.equal(readyReceipt.dimension_count, 3);
assert.equal(readyReceipt.required_dimension_count, 3);
assert.equal(readyReceipt.rating_count, 3);
assert.equal(readyReceipt.reviewer_role_count, 2);
assert.equal(readyReceipt.total_weight_percent, 100);
assert.equal(readyReceipt.minimum_passing_rating_value, 3);
assert.equal(readyReceipt.calibration_required, true);
assert.deepEqual(readyReceipt.configuration_issues, []);
assert.equal(readyReceipt.status, 'FRAMEWORK_READY');
assert.equal(readyReceipt.score_mutation_allowed, false);
assert.equal(readyReceipt.commission_mutation_allowed, false);
assert.equal(readyReceipt.provider_neutral_only, true);
assert.deepEqual(readyReceipt.decision_refs, ['6C-HR-OPS-001']);
assert.deepEqual(readyReceipt.evidence_artifacts, [
  'performance_framework_configuration_receipt',
  'performance_dimension_weight_evidence',
  'performance_rating_scale_evidence',
]);
assert.match(readyReceipt.performance_framework_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluatePerformanceFramework(baseInput);
assert.equal(repeatedReceipt.performance_framework_evidence_digest, readyReceipt.performance_framework_evidence_digest);

const misconfiguredReceipt = evaluatePerformanceFramework({
  ...baseInput,
  dimensions: [
    { dimension_ref: 'goals', label: 'Business goals', dimension_type: 'GOAL', weight_percent: 40, required: false },
    { dimension_ref: 'competency', label: 'Role competency', dimension_type: 'COMPETENCY', weight_percent: 40, required: false },
  ],
  rating_scale: [
    { rating_ref: 'low', label: 'Low', numeric_value: 1, passing: false },
    { rating_ref: 'medium', label: 'Medium', numeric_value: 2, passing: false },
  ],
});
assert.equal(misconfiguredReceipt.status, 'FRAMEWORK_REQUIRES_CONFIGURATION');
assert.deepEqual(misconfiguredReceipt.configuration_issues, [
  'rating scale has no passing rating',
  'dimension weights must total 100 percent',
  'at least one required dimension is needed',
]);

assert.throws(() => evaluatePerformanceFramework({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, framework_ref: '' }), /framework_ref is required/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, framework_name: '' }), /framework_name is required/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, cycle_ref: '' }), /cycle_ref is required/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, cycle_start: '01-01-2027' }), /cycle_start must use YYYY-MM-DD format/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, cycle_start: '2027-12-31', cycle_end: '2027-01-01' }), /cycle_start must be on or before cycle_end/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, dimensions: [] }), /dimensions must contain at least one dimension/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, dimensions: [{ ...baseInput.dimensions[0] }, { ...baseInput.dimensions[0] }] }), /dimension_ref values must be unique/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, dimensions: [{ ...baseInput.dimensions[0], label: '' }] }), /dimension.label is required/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, dimensions: [{ ...baseInput.dimensions[0], weight_percent: -1 }] }), /weight_percent must be a non-negative finite number/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, rating_scale: [baseInput.rating_scale[0]] }), /rating_scale must contain at least two ratings/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, rating_scale: [{ ...baseInput.rating_scale[0] }, { ...baseInput.rating_scale[0] }] }), /rating_ref values must be unique/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, rating_scale: [{ ...baseInput.rating_scale[0] }, { ...baseInput.rating_scale[1], numeric_value: 1 }] }), /rating numeric_value values must be unique/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, reviewer_role_refs: [] }), /reviewer_role_refs must contain at least one reviewer role/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, reviewer_role_refs: [''] }), /reviewer_role_ref is required/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, score_mutation_requested: true }), /must not mutate scores/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, commission_mutation_requested: true }), /must not mutate commission surfaces/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, provider_specific_adapter_requested: true }), /provider-neutral/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, schema_mutation_requested: true }), /must not request schema mutation/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluatePerformanceFramework({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C performance_framework runtime test passed.');
