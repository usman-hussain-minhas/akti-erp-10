export const PHASE_6C_AT_RISK_RULES_ENGINE_SEED_ID = "seed_6c_042_at_risk_rules_engine" as const;
export const PHASE_6C_AT_RISK_RULES_ENGINE_COMPONENT_ID = "6C.04" as const;
export const AT_RISK_RULES_ENGINE_EVALUATED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.at_risk_rules_engine.evaluated" as const;

export type AtRiskMetric = "ABSENCE_DAYS" | "LATE_ARRIVALS" | "PERFORMANCE_SCORE" | "ENGAGEMENT_SCORE" | "POLICY_VIOLATIONS";
export type AtRiskOperator = "GTE" | "LTE" | "GT" | "LT" | "EQ";
export type AtRiskSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AtRiskStatus = "NO_RISK" | "AT_RISK" | "CRITICAL_RISK";

export type AtRiskRule = {
  rule_ref: string;
  metric: AtRiskMetric;
  operator: AtRiskOperator;
  threshold: number;
  severity: AtRiskSeverity;
  action_ref: string;
  enabled: boolean;
};

export type AtRiskRulesEngineInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  review_cycle_ref: string;
  absence_days: number;
  late_arrivals: number;
  performance_score: number;
  engagement_score: number;
  policy_violations: number;
  rules: readonly AtRiskRule[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  employee_status_mutation_requested?: boolean;
  notification_send_requested?: boolean;
  provider_specific_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type AtRiskRulesEngineReceipt = {
  seed_id: typeof PHASE_6C_AT_RISK_RULES_ENGINE_SEED_ID;
  component_id: typeof PHASE_6C_AT_RISK_RULES_ENGINE_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6CAtRiskRulesEngine";
  event_name: typeof AT_RISK_RULES_ENGINE_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  review_cycle_ref: string;
  evaluated_metric_count: number;
  enabled_rule_count: number;
  matched_rule_refs: readonly string[];
  matched_action_refs: readonly string[];
  highest_severity: AtRiskSeverity | null;
  risk_score: number;
  status: AtRiskStatus;
  employee_status_mutation_allowed: false;
  notification_send_allowed: false;
  provider_neutral_only: true;
  runtime_status: "AT_RISK_RULES_ENGINE_EVALUATED";
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  at_risk_rules_engine_evidence_digest: string;
};
