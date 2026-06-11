import assert from 'node:assert/strict';

import { evaluateWeightedGoalReviewCycle, type WeightedGoalReviewCycleInput } from './weighted_goal_review_cycle.service';

const baseInput: WeightedGoalReviewCycleInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_weighted_goal_review_cycle',
  source_record_ref: 'weighted_goal_review_cycle_record_001',
  employee_ref: 'employee_phase_6c_001',
  framework_ref: 'framework_annual_growth_001',
  review_cycle_ref: 'review_cycle_2027_midyear',
  cycle_start: '2027-01-01',
  cycle_end: '2027-06-30',
  goals: [
    { goal_ref: 'revenue_growth', label: 'Revenue growth', weight_percent: 50, target_value: 100, actual_value: 110, status: 'ACHIEVED' },
    { goal_ref: 'quality_score', label: 'Quality score', weight_percent: 30, target_value: 95, actual_value: 90, status: 'ACHIEVED' },
    { goal_ref: 'documentation', label: 'Documentation', weight_percent: 20, target_value: 10, actual_value: 6, status: 'MISSED' },
  ],
  meets_expectation_threshold: 70,
  exceeds_expectation_threshold: 90,
  evaluated_by_user_id: 'user_phase_6c_hr_admin',
  evaluated_at: '2027-07-01T08:00:00.000Z',
  control_metadata: { source: 'phase_6c_ffet_041' },
};

const readyReceipt = evaluateWeightedGoalReviewCycle(baseInput);
assert.equal(readyReceipt.seed_id, 'seed_6c_041_weighted_goal_review_cycle');
assert.equal(readyReceipt.component_id, '6C.04');
assert.equal(readyReceipt.component_slug, 'hr_performance_commission_policy_and_offboarding');
assert.equal(readyReceipt.model_name, 'Phase6CWeightedGoalReviewCycle');
assert.equal(readyReceipt.event_name, 'phase_6c.hr_performance_commission_policy_and_offboarding.weighted_goal_review_cycle.evaluated');
assert.equal(readyReceipt.runtime_status, 'WEIGHTED_GOAL_REVIEW_CYCLE_EVALUATED');
assert.equal(readyReceipt.goal_count, 3);
assert.equal(readyReceipt.scored_goal_count, 3);
assert.equal(readyReceipt.total_weight_percent, 100);
assert.equal(readyReceipt.weighted_score_percent, 90.421053);
assert.equal(readyReceipt.completion_percent, 100);
assert.equal(readyReceipt.rating_band, 'EXCEEDS_EXPECTATION');
assert.equal(readyReceipt.status, 'REVIEW_READY');
assert.deepEqual(readyReceipt.configuration_issues, []);
assert.equal(readyReceipt.score_mutation_allowed, false);
assert.equal(readyReceipt.commission_mutation_allowed, false);
assert.equal(readyReceipt.provider_neutral_only, true);
assert.deepEqual(readyReceipt.decision_refs, ['6C-HR-OPS-002']);
assert.deepEqual(readyReceipt.evidence_artifacts, ['weighted_goal_review_cycle_receipt', 'goal_weight_evidence', 'review_score_evidence']);
assert.match(readyReceipt.weighted_goal_review_cycle_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateWeightedGoalReviewCycle(baseInput);
assert.equal(repeatedReceipt.weighted_goal_review_cycle_evidence_digest, readyReceipt.weighted_goal_review_cycle_evidence_digest);

const inProgressReceipt = evaluateWeightedGoalReviewCycle({
  ...baseInput,
  goals: [
    baseInput.goals[0],
    { goal_ref: 'quality_score', label: 'Quality score', weight_percent: 30, target_value: 95, status: 'IN_PROGRESS' },
    { goal_ref: 'documentation', label: 'Documentation', weight_percent: 20, target_value: 10, status: 'NOT_STARTED' },
  ],
});
assert.equal(inProgressReceipt.status, 'REVIEW_IN_PROGRESS');
assert.equal(inProgressReceipt.completion_percent, 50);
assert.equal(inProgressReceipt.rating_band, 'UNRATED');

const misconfiguredReceipt = evaluateWeightedGoalReviewCycle({
  ...baseInput,
  goals: [
    { goal_ref: 'goal_a', label: 'Goal A', weight_percent: 40, target_value: 100, actual_value: 80, status: 'ACHIEVED' },
    { goal_ref: 'goal_b', label: 'Goal B', weight_percent: 40, target_value: 100, actual_value: 70, status: 'ACHIEVED' },
  ],
});
assert.equal(misconfiguredReceipt.status, 'REVIEW_REQUIRES_CONFIGURATION');
assert.deepEqual(misconfiguredReceipt.configuration_issues, ['goal weights must total 100 percent']);

const belowReceipt = evaluateWeightedGoalReviewCycle({
  ...baseInput,
  goals: [
    { goal_ref: 'goal_a', label: 'Goal A', weight_percent: 100, target_value: 100, actual_value: 40, status: 'MISSED' },
  ],
});
assert.equal(belowReceipt.rating_band, 'BELOW_EXPECTATION');

assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, employee_ref: '' }), /employee_ref is required/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, framework_ref: '' }), /framework_ref is required/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, review_cycle_ref: '' }), /review_cycle_ref is required/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, cycle_start: '01-01-2027' }), /cycle_start must use YYYY-MM-DD format/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, cycle_start: '2027-07-01', cycle_end: '2027-06-30' }), /cycle_start must be on or before cycle_end/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, meets_expectation_threshold: 95, exceeds_expectation_threshold: 90 }), /meets_expectation_threshold cannot exceed exceeds_expectation_threshold/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, goals: [] }), /goals must contain at least one goal/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, goals: [{ ...baseInput.goals[0] }, { ...baseInput.goals[0] }] }), /goal_ref values must be unique/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, goals: [{ ...baseInput.goals[0], label: '' }] }), /goal.label is required/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, goals: [{ ...baseInput.goals[0], weight_percent: 0 }] }), /weight_percent must be a positive finite number/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, goals: [{ ...baseInput.goals[0], target_value: 0 }] }), /target_value must be a positive finite number/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, goals: [{ ...baseInput.goals[0], status: 'ACHIEVED', actual_value: undefined }] }), /actual_value must be a non-negative finite number/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, score_mutation_requested: true }), /must not mutate score records/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, commission_mutation_requested: true }), /must not mutate commission surfaces/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, provider_specific_adapter_requested: true }), /provider-neutral/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, schema_mutation_requested: true }), /must not request schema mutation/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateWeightedGoalReviewCycle({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C weighted_goal_review_cycle runtime test passed.');
