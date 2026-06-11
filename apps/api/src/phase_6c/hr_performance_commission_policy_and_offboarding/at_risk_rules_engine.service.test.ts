import assert from 'node:assert/strict';

import { evaluateAtRiskRulesEngine, type AtRiskRulesEngineInput } from './at_risk_rules_engine.service';

const baseInput: AtRiskRulesEngineInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_at_risk_rules_engine',
  source_record_ref: 'at_risk_rules_engine_record_001',
  employee_ref: 'employee_phase_6c_001',
  review_cycle_ref: 'review_cycle_2027_midyear',
  absence_days: 5,
  late_arrivals: 7,
  performance_score: 62,
  engagement_score: 40,
  policy_violations: 1,
  rules: [
    { rule_ref: 'absence_high', metric: 'ABSENCE_DAYS', operator: 'GTE', threshold: 5, severity: 'HIGH', action_ref: 'manager_check_in', enabled: true },
    { rule_ref: 'performance_low', metric: 'PERFORMANCE_SCORE', operator: 'LT', threshold: 65, severity: 'CRITICAL', action_ref: 'performance_recovery_plan', enabled: true },
    { rule_ref: 'late_medium', metric: 'LATE_ARRIVALS', operator: 'GT', threshold: 10, severity: 'MEDIUM', action_ref: 'attendance_coaching', enabled: true },
    { rule_ref: 'disabled_policy', metric: 'POLICY_VIOLATIONS', operator: 'GTE', threshold: 1, severity: 'CRITICAL', action_ref: 'disabled_action', enabled: false },
  ],
  evaluated_by_user_id: 'user_phase_6c_hr_admin',
  evaluated_at: '2027-07-01T08:00:00.000Z',
  control_metadata: { source: 'phase_6c_ffet_042' },
};

const riskReceipt = evaluateAtRiskRulesEngine(baseInput);
assert.equal(riskReceipt.seed_id, 'seed_6c_042_at_risk_rules_engine');
assert.equal(riskReceipt.component_id, '6C.04');
assert.equal(riskReceipt.component_slug, 'hr_performance_commission_policy_and_offboarding');
assert.equal(riskReceipt.model_name, 'Phase6CAtRiskRulesEngine');
assert.equal(riskReceipt.event_name, 'phase_6c.hr_performance_commission_policy_and_offboarding.at_risk_rules_engine.evaluated');
assert.equal(riskReceipt.runtime_status, 'AT_RISK_RULES_ENGINE_EVALUATED');
assert.equal(riskReceipt.evaluated_metric_count, 5);
assert.equal(riskReceipt.enabled_rule_count, 3);
assert.deepEqual(riskReceipt.matched_rule_refs, ['absence_high', 'performance_low']);
assert.deepEqual(riskReceipt.matched_action_refs, ['manager_check_in', 'performance_recovery_plan']);
assert.equal(riskReceipt.highest_severity, 'CRITICAL');
assert.equal(riskReceipt.risk_score, 100);
assert.equal(riskReceipt.status, 'CRITICAL_RISK');
assert.equal(riskReceipt.employee_status_mutation_allowed, false);
assert.equal(riskReceipt.notification_send_allowed, false);
assert.equal(riskReceipt.provider_neutral_only, true);
assert.deepEqual(riskReceipt.decision_refs, ['6C-HR-OPS-004']);
assert.deepEqual(riskReceipt.evidence_artifacts, ['at_risk_rule_evaluation_receipt', 'matched_rule_evidence', 'risk_score_evidence']);
assert.match(riskReceipt.at_risk_rules_engine_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateAtRiskRulesEngine(baseInput);
assert.equal(repeatedReceipt.at_risk_rules_engine_evidence_digest, riskReceipt.at_risk_rules_engine_evidence_digest);

const noRiskReceipt = evaluateAtRiskRulesEngine({
  ...baseInput,
  absence_days: 0,
  late_arrivals: 0,
  performance_score: 90,
  engagement_score: 85,
  policy_violations: 0,
});
assert.deepEqual(noRiskReceipt.matched_rule_refs, []);
assert.equal(noRiskReceipt.highest_severity, null);
assert.equal(noRiskReceipt.risk_score, 0);
assert.equal(noRiskReceipt.status, 'NO_RISK');

const mediumRiskReceipt = evaluateAtRiskRulesEngine({
  ...baseInput,
  absence_days: 0,
  performance_score: 90,
  late_arrivals: 11,
});
assert.deepEqual(mediumRiskReceipt.matched_rule_refs, ['late_medium']);
assert.equal(mediumRiskReceipt.highest_severity, 'MEDIUM');
assert.equal(mediumRiskReceipt.risk_score, 50);
assert.equal(mediumRiskReceipt.status, 'AT_RISK');

assert.throws(() => evaluateAtRiskRulesEngine({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateAtRiskRulesEngine({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateAtRiskRulesEngine({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateAtRiskRulesEngine({ ...baseInput, employee_ref: '' }), /employee_ref is required/);
assert.throws(() => evaluateAtRiskRulesEngine({ ...baseInput, review_cycle_ref: '' }), /review_cycle_ref is required/);
assert.throws(() => evaluateAtRiskRulesEngine({ ...baseInput, absence_days: -1 }), /metric_0 must be a non-negative finite number/);
assert.throws(() => evaluateAtRiskRulesEngine({ ...baseInput, rules: [] }), /rules must contain at least one rule/);
assert.throws(() => evaluateAtRiskRulesEngine({ ...baseInput, rules: [{ ...baseInput.rules[0] }, { ...baseInput.rules[0] }] }), /rule_ref values must be unique/);
assert.throws(() => evaluateAtRiskRulesEngine({ ...baseInput, rules: [{ ...baseInput.rules[0], rule_ref: '' }] }), /rule_ref is required/);
assert.throws(() => evaluateAtRiskRulesEngine({ ...baseInput, rules: [{ ...baseInput.rules[0], threshold: -1 }] }), /threshold must be a non-negative finite number/);
assert.throws(() => evaluateAtRiskRulesEngine({ ...baseInput, rules: [{ ...baseInput.rules[0], action_ref: '' }] }), /action_ref is required/);
assert.throws(() => evaluateAtRiskRulesEngine({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateAtRiskRulesEngine({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateAtRiskRulesEngine({ ...baseInput, employee_status_mutation_requested: true }), /must not mutate employee status/);
assert.throws(() => evaluateAtRiskRulesEngine({ ...baseInput, notification_send_requested: true }), /must not send notifications directly/);
assert.throws(() => evaluateAtRiskRulesEngine({ ...baseInput, provider_specific_adapter_requested: true }), /provider-neutral/);
assert.throws(() => evaluateAtRiskRulesEngine({ ...baseInput, schema_mutation_requested: true }), /must not request schema mutation/);
assert.throws(() => evaluateAtRiskRulesEngine({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateAtRiskRulesEngine({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateAtRiskRulesEngine({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateAtRiskRulesEngine({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C at_risk_rules_engine runtime test passed.');
