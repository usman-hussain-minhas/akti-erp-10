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
