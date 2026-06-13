import assert from 'node:assert/strict';
import { scoreLead, type LeadScoringEngineInput } from './lead_scoring_engine.service';

const baseInput: LeadScoringEngineInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_scoring_reporting',
  scoring_run_id: 'lead_score_run_001',
  lead_record_ref: 'lead_record_001',
  pipeline_stage_model_ref: 'pipeline_stage_model_001',
  whatsapp_template_management_ref: 'whatsapp_template_management_001',
  optimization_fact_store_ref: 'optimization_fact_store_001',
  scoring_rules: [
    {
      rule_id: 'rule_has_verified_contact',
      fact_key: 'verified_contact',
      operator: 'EQUALS',
      expected_value: true,
      weight: 30,
      active: true,
      evidence_label: 'verified_contact_score_evidence',
    },
    {
      rule_id: 'rule_engagement_count',
      fact_key: 'engagement_count',
      operator: 'NUMBER_AT_LEAST',
      expected_value: 3,
      weight: 50,
      active: true,
      evidence_label: 'engagement_count_score_evidence',
    },
    {
      rule_id: 'rule_source_exists',
      fact_key: 'lead_source',
      operator: 'EXISTS',
      weight: 20,
      active: true,
      evidence_label: 'lead_source_score_evidence',
    },
    {
      rule_id: 'rule_inactive_reference',
      fact_key: 'ignored_fact',
      operator: 'EXISTS',
      weight: 10,
      active: false,
      evidence_label: 'inactive_rule_evidence',
    },
  ],
  facts: [
    { fact_key: 'verified_contact', fact_value: true },
    { fact_key: 'engagement_count', fact_value: 5 },
    { fact_key: 'lead_source', fact_value: 'website' },
  ],
  scored_by_user_id: 'user_scoring_owner_001',
  scored_at: '2026-06-08T21:25:00.000Z',
};

const receipt = scoreLead(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_08_lead_scoring_engine');
assert.equal(receipt.component_id, '6B.08');
assert.equal(receipt.event_name, 'phase_6b.crm_scoring_reporting.lead_scoring_engine.scored');
assert.equal(receipt.rule_count, 4);
assert.equal(receipt.active_rule_count, 3);
assert.equal(receipt.total_possible_score, 100);
assert.equal(receipt.awarded_score, 100);
assert.equal(receipt.normalized_score, 100);
assert.equal(receipt.score_band, 'HIGH');
assert.equal(receipt.rule_results.length, 3);
assert.equal(receipt.irreversible_action_allowed, false);
assert.equal(receipt.ai_score_allowed, false);
assert.equal(receipt.hardcoded_rule_allowed, false);

const mediumReceipt = scoreLead({
  ...baseInput,
  scoring_run_id: 'lead_score_run_002',
  facts: [
    { fact_key: 'verified_contact', fact_value: true },
    { fact_key: 'engagement_count', fact_value: 1 },
  ],
});
assert.equal(mediumReceipt.awarded_score, 30);
assert.equal(mediumReceipt.normalized_score, 30);
assert.equal(mediumReceipt.score_band, 'LOW');
assert.equal(mediumReceipt.rule_results.filter((result) => result.matched).length, 1);

const cappedReceipt = scoreLead({
  ...baseInput,
  scoring_run_id: 'lead_score_run_003',
  scoring_rules: [
    {
      rule_id: 'rule_engagement_max',
      fact_key: 'engagement_count',
      operator: 'NUMBER_AT_MOST',
      expected_value: 10,
      weight: 40,
      active: true,
      evidence_label: 'engagement_max_score_evidence',
    },
  ],
  facts: [{ fact_key: 'engagement_count', fact_value: 5 }],
});
assert.equal(cappedReceipt.awarded_score, 40);
assert.equal(cappedReceipt.normalized_score, 100);
assert.equal(cappedReceipt.score_band, 'HIGH');

assert.throws(() => scoreLead({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => scoreLead({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => scoreLead({ ...baseInput, scoring_run_id: '' }), /scoring_run_id is required/);
assert.throws(() => scoreLead({ ...baseInput, lead_record_ref: '' }), /lead_record_ref is required/);
assert.throws(() => scoreLead({ ...baseInput, pipeline_stage_model_ref: '' }), /pipeline_stage_model_ref is required/);
assert.throws(() => scoreLead({ ...baseInput, whatsapp_template_management_ref: '' }), /whatsapp_template_management_ref is required/);
assert.throws(() => scoreLead({ ...baseInput, optimization_fact_store_ref: '' }), /optimization_fact_store_ref is required/);
assert.throws(() => scoreLead({ ...baseInput, scoring_rules: [] }), /scoring_rules must include at least one rule/);
assert.throws(() => scoreLead({ ...baseInput, scoring_rules: baseInput.scoring_rules.map((rule) => ({ ...rule, active: false })) }), /scoring_rules must include at least one active rule/);
assert.throws(() => scoreLead({ ...baseInput, scoring_rules: [{ ...baseInput.scoring_rules[0]!, rule_id: '' }] }), /scoring_rules.rule_id is required/);
assert.throws(() => scoreLead({ ...baseInput, scoring_rules: [{ ...baseInput.scoring_rules[0]!, fact_key: '' }] }), /scoring_rules.fact_key is required/);
assert.throws(() => scoreLead({ ...baseInput, scoring_rules: [{ ...baseInput.scoring_rules[0]!, operator: 'CONTAINS' as never }] }), /operator is not supported/);
assert.throws(() => scoreLead({ ...baseInput, scoring_rules: [{ ...baseInput.scoring_rules[0]!, expected_value: undefined }] }), /expected_value is required/);
assert.throws(() => scoreLead({ ...baseInput, scoring_rules: [{ ...baseInput.scoring_rules[0]!, weight: 0 }] }), /weight must be a positive number/);
assert.throws(() => scoreLead({ ...baseInput, scoring_rules: [{ ...baseInput.scoring_rules[0]!, evidence_label: '' }] }), /scoring_rules.evidence_label is required/);
assert.throws(() => scoreLead({ ...baseInput, scoring_rules: [{ ...baseInput.scoring_rules[0]!, rule_id: 'duplicate' }, { ...baseInput.scoring_rules[1]!, rule_id: 'duplicate' }] }), /scoring_rules must not repeat rule_id/);
assert.throws(() => scoreLead({ ...baseInput, facts: [] }), /facts must include at least one optimization fact/);
assert.throws(() => scoreLead({ ...baseInput, facts: [{ fact_key: '', fact_value: true }] }), /facts.fact_key is required/);
assert.throws(() => scoreLead({ ...baseInput, facts: [{ fact_key: 'duplicate', fact_value: true }, { fact_key: 'duplicate', fact_value: false }] }), /facts must not repeat fact_key/);
assert.throws(() => scoreLead({ ...baseInput, scoring_rules: [{ ...baseInput.scoring_rules[1]! }], facts: [{ fact_key: 'engagement_count', fact_value: 'five' }] }), /numeric lead scoring operators require numeric fact_value and expected_value/);
assert.throws(() => scoreLead({ ...baseInput, scored_by_user_id: '' }), /scored_by_user_id is required/);
assert.throws(() => scoreLead({ ...baseInput, scored_at: 'not-a-date' }), /scored_at must be a valid ISO-compatible timestamp/);
assert.throws(() => scoreLead({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);
assert.throws(() => scoreLead({ ...baseInput, ai_score_requested: true }), /must not generate AI scores/);
assert.throws(() => scoreLead({ ...baseInput, hardcoded_rule_requested: true }), /must not hardcode scoring rules/);

console.log('P6B-FFET-060 lead scoring engine service test passed.');
