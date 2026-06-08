export const PHASE_6B_LEAD_SCORING_ENGINE_SEED_ID = 'seed_6b_08_lead_scoring_engine' as const;
export const PHASE_6B_LEAD_SCORING_ENGINE_COMPONENT_ID = '6B.08' as const;

export const LEAD_SCORING_ENGINE_EVENT = 'phase_6b.crm_scoring_reporting.lead_scoring_engine.scored' as const;

export type LeadScoringRuleOperator = 'EXISTS' | 'EQUALS' | 'NUMBER_AT_LEAST' | 'NUMBER_AT_MOST';
export type LeadScoringBand = 'LOW' | 'MEDIUM' | 'HIGH';

export type LeadScoringFact = {
  fact_key: string;
  fact_value: string | number | boolean;
};

export type LeadScoringRule = {
  rule_id: string;
  fact_key: string;
  operator: LeadScoringRuleOperator;
  expected_value?: string | number | boolean;
  weight: number;
  active: boolean;
  evidence_label: string;
};

export type LeadScoringEngineInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  scoring_run_id: string;
  lead_record_ref: string;
  pipeline_stage_model_ref: string;
  whatsapp_template_management_ref: string;
  optimization_fact_store_ref: string;
  scoring_rules: LeadScoringRule[];
  facts: LeadScoringFact[];
  scored_by_user_id: string;
  scored_at: string;
  irreversible_action_requested?: boolean;
  ai_score_requested?: boolean;
  hardcoded_rule_requested?: boolean;
};

export type LeadScoringRuleResult = {
  rule_id: string;
  fact_key: string;
  matched: boolean;
  awarded_weight: number;
  evidence_label: string;
};

export type LeadScoringEngineReceipt = {
  seed_id: typeof PHASE_6B_LEAD_SCORING_ENGINE_SEED_ID;
  component_id: typeof PHASE_6B_LEAD_SCORING_ENGINE_COMPONENT_ID;
  event_name: typeof LEAD_SCORING_ENGINE_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  scoring_run_id: string;
  lead_record_ref: string;
  pipeline_stage_model_ref: string;
  whatsapp_template_management_ref: string;
  optimization_fact_store_ref: string;
  rule_count: number;
  active_rule_count: number;
  total_possible_score: number;
  awarded_score: number;
  normalized_score: number;
  score_band: LeadScoringBand;
  rule_results: LeadScoringRuleResult[];
  scored_by_user_id: string;
  scored_at: string;
  irreversible_action_allowed: false;
  ai_score_allowed: false;
  hardcoded_rule_allowed: false;
};

const OPERATORS: readonly LeadScoringRuleOperator[] = ['EXISTS', 'EQUALS', 'NUMBER_AT_LEAST', 'NUMBER_AT_MOST'] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for lead scoring engine.`);
  }
  return value.trim();
}

function requireScoredAt(value: string): string {
  const normalized = requireNonEmpty(value, 'scored_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('scored_at must be a valid ISO-compatible timestamp for lead scoring engine.');
  }
  return normalized;
}

function normalizeOperator(value: LeadScoringRuleOperator): LeadScoringRuleOperator {
  if (!OPERATORS.includes(value)) {
    throw new Error('operator is not supported for lead scoring engine.');
  }
  return value;
}

function normalizeFact(fact: LeadScoringFact): LeadScoringFact {
  if (!['string', 'number', 'boolean'].includes(typeof fact.fact_value)) {
    throw new Error('fact_value must be a string, number, or boolean for lead scoring engine.');
  }
  return {
    fact_key: requireNonEmpty(fact.fact_key, 'facts.fact_key'),
    fact_value: fact.fact_value,
  };
}

function normalizeFacts(facts: LeadScoringFact[]): Map<string, LeadScoringFact> {
  if (!Array.isArray(facts) || facts.length === 0) {
    throw new Error('facts must include at least one optimization fact for lead scoring engine.');
  }
  const normalized = facts.map(normalizeFact);
  const factMap = new Map<string, LeadScoringFact>();
  for (const fact of normalized) {
    if (factMap.has(fact.fact_key)) {
      throw new Error('facts must not repeat fact_key for lead scoring engine.');
    }
    factMap.set(fact.fact_key, fact);
  }
  return factMap;
}

function normalizeRule(rule: LeadScoringRule): LeadScoringRule {
  if (!Number.isFinite(rule.weight) || rule.weight <= 0) {
    throw new Error('weight must be a positive number for lead scoring engine.');
  }
  const operator = normalizeOperator(rule.operator);
  if (operator !== 'EXISTS' && rule.expected_value === undefined) {
    throw new Error('expected_value is required for non-EXISTS lead scoring rules.');
  }
  return {
    rule_id: requireNonEmpty(rule.rule_id, 'scoring_rules.rule_id'),
    fact_key: requireNonEmpty(rule.fact_key, 'scoring_rules.fact_key'),
    operator,
    expected_value: rule.expected_value,
    weight: rule.weight,
    active: rule.active === true,
    evidence_label: requireNonEmpty(rule.evidence_label, 'scoring_rules.evidence_label'),
  };
}

function normalizeRules(rules: LeadScoringRule[]): LeadScoringRule[] {
  if (!Array.isArray(rules) || rules.length === 0) {
    throw new Error('scoring_rules must include at least one rule for lead scoring engine.');
  }
  const normalized = rules.map(normalizeRule);
  const ruleIds = new Set<string>();
  for (const rule of normalized) {
    if (ruleIds.has(rule.rule_id)) {
      throw new Error('scoring_rules must not repeat rule_id for lead scoring engine.');
    }
    ruleIds.add(rule.rule_id);
  }
  if (!normalized.some((rule) => rule.active)) {
    throw new Error('scoring_rules must include at least one active rule for lead scoring engine.');
  }
  return normalized;
}

function compareRule(rule: LeadScoringRule, factMap: Map<string, LeadScoringFact>): boolean {
  const fact = factMap.get(rule.fact_key);
  if (rule.operator === 'EXISTS') return fact !== undefined;
  if (fact === undefined) return false;
  if (rule.operator === 'EQUALS') return fact.fact_value === rule.expected_value;
  if (typeof fact.fact_value !== 'number' || typeof rule.expected_value !== 'number') {
    throw new Error('numeric lead scoring operators require numeric fact_value and expected_value.');
  }
  if (rule.operator === 'NUMBER_AT_LEAST') return fact.fact_value >= rule.expected_value;
  return fact.fact_value <= rule.expected_value;
}

function scoreBand(normalizedScore: number): LeadScoringBand {
  if (normalizedScore >= 70) return 'HIGH';
  if (normalizedScore >= 40) return 'MEDIUM';
  return 'LOW';
}

export function scoreLead(input: LeadScoringEngineInput): LeadScoringEngineReceipt {
  if (input.irreversible_action_requested === true) {
    throw new Error('lead scoring engine must not perform irreversible actions.');
  }
  if (input.ai_score_requested === true) {
    throw new Error('lead scoring engine must not generate AI scores.');
  }
  if (input.hardcoded_rule_requested === true) {
    throw new Error('lead scoring engine must not hardcode scoring rules.');
  }

  const rules = normalizeRules(input.scoring_rules);
  const factMap = normalizeFacts(input.facts);
  const activeRules = rules.filter((rule) => rule.active);
  const totalPossibleScore = activeRules.reduce((total, rule) => total + rule.weight, 0);
  const ruleResults = activeRules.map((rule) => {
    const matched = compareRule(rule, factMap);
    return {
      rule_id: rule.rule_id,
      fact_key: rule.fact_key,
      matched,
      awarded_weight: matched ? rule.weight : 0,
      evidence_label: rule.evidence_label,
    };
  });
  const awardedScore = ruleResults.reduce((total, result) => total + result.awarded_weight, 0);
  const normalizedScore = totalPossibleScore === 0 ? 0 : Math.round((awardedScore / totalPossibleScore) * 100);

  return {
    seed_id: PHASE_6B_LEAD_SCORING_ENGINE_SEED_ID,
    component_id: PHASE_6B_LEAD_SCORING_ENGINE_COMPONENT_ID,
    event_name: LEAD_SCORING_ENGINE_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    scoring_run_id: requireNonEmpty(input.scoring_run_id, 'scoring_run_id'),
    lead_record_ref: requireNonEmpty(input.lead_record_ref, 'lead_record_ref'),
    pipeline_stage_model_ref: requireNonEmpty(input.pipeline_stage_model_ref, 'pipeline_stage_model_ref'),
    whatsapp_template_management_ref: requireNonEmpty(input.whatsapp_template_management_ref, 'whatsapp_template_management_ref'),
    optimization_fact_store_ref: requireNonEmpty(input.optimization_fact_store_ref, 'optimization_fact_store_ref'),
    rule_count: rules.length,
    active_rule_count: activeRules.length,
    total_possible_score: totalPossibleScore,
    awarded_score: awardedScore,
    normalized_score: normalizedScore,
    score_band: scoreBand(normalizedScore),
    rule_results: ruleResults,
    scored_by_user_id: requireNonEmpty(input.scored_by_user_id, 'scored_by_user_id'),
    scored_at: requireScoredAt(input.scored_at),
    irreversible_action_allowed: false,
    ai_score_allowed: false,
    hardcoded_rule_allowed: false,
  };
}
