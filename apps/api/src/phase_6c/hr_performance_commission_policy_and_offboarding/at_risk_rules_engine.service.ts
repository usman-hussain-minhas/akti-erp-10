import { createHash } from 'node:crypto';

export const PHASE_6C_AT_RISK_RULES_ENGINE_SEED_ID = "seed_6c_042_at_risk_rules_engine" as const;
export const PHASE_6C_AT_RISK_RULES_ENGINE_COMPONENT_ID = "6C.04" as const;
export const AT_RISK_RULES_ENGINE_EVALUATED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.at_risk_rules_engine.evaluated" as const;

export type AtRiskMetric = "ABSENCE_DAYS" | "LATE_ARRIVALS" | "PERFORMANCE_SCORE" | "ENGAGEMENT_SCORE" | "POLICY_VIOLATIONS";
export type AtRiskOperator = "GTE" | "LTE" | "GT" | "LT" | "EQ";
export type AtRiskSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AtRiskStatus = "NO_RISK" | "AT_RISK" | "CRITICAL_RISK";

export type AtRiskRule = { rule_ref: string; metric: AtRiskMetric; operator: AtRiskOperator; threshold: number; severity: AtRiskSeverity; action_ref: string; enabled: boolean };
export type AtRiskRulesEngineInput = {
  organization_id: string; service_manifest_contract_id: string; source_record_ref: string; employee_ref: string; review_cycle_ref: string;
  absence_days: number; late_arrivals: number; performance_score: number; engagement_score: number; policy_violations: number;
  rules: readonly AtRiskRule[]; evaluated_by_user_id: string; evaluated_at: string; control_metadata?: Record<string, unknown>;
  employee_status_mutation_requested?: boolean; notification_send_requested?: boolean; provider_specific_adapter_requested?: boolean; schema_mutation_requested?: boolean; phase_6a_mutation_requested?: boolean; phase_6b_mutation_requested?: boolean; runtime_adapter_requested?: boolean; ticket_flag_flip_requested?: boolean;
};
export type AtRiskRulesEngineReceipt = {
  seed_id: typeof PHASE_6C_AT_RISK_RULES_ENGINE_SEED_ID; component_id: typeof PHASE_6C_AT_RISK_RULES_ENGINE_COMPONENT_ID; component_slug: "hr_performance_commission_policy_and_offboarding"; model_name: "Phase6CAtRiskRulesEngine"; event_name: typeof AT_RISK_RULES_ENGINE_EVALUATED_EVENT;
  organization_id: string; service_manifest_contract_id: string; source_record_ref: string; employee_ref: string; review_cycle_ref: string;
  evaluated_metric_count: number; enabled_rule_count: number; matched_rule_refs: readonly string[]; matched_action_refs: readonly string[]; highest_severity: AtRiskSeverity | null; risk_score: number; status: AtRiskStatus;
  employee_status_mutation_allowed: false; notification_send_allowed: false; provider_neutral_only: true; runtime_status: "AT_RISK_RULES_ENGINE_EVALUATED"; decision_refs: readonly string[]; evidence_artifacts: readonly string[]; control_metadata: Record<string, unknown>; evaluated_by_user_id: string; evaluated_at: string; at_risk_rules_engine_evidence_digest: string;
};

const VALID_METRICS: readonly AtRiskMetric[] = ["ABSENCE_DAYS", "LATE_ARRIVALS", "PERFORMANCE_SCORE", "ENGAGEMENT_SCORE", "POLICY_VIOLATIONS"];
const VALID_OPERATORS: readonly AtRiskOperator[] = ["GTE", "LTE", "GT", "LT", "EQ"];
const VALID_SEVERITIES: readonly AtRiskSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const DECISION_REFS = ["6C-HR-OPS-004"] as const;
const EVIDENCE_ARTIFACTS = ["at_risk_rule_evaluation_receipt", "matched_rule_evidence", "risk_score_evidence"] as const;
const SEVERITY_SCORE: Record<AtRiskSeverity, number> = { LOW: 25, MEDIUM: 50, HIGH: 75, CRITICAL: 100 };
const SEVERITY_RANK: Record<AtRiskSeverity, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

function requireNonEmpty(value: string | undefined, field: string): string { if (typeof value !== 'string' || value.trim().length === 0) throw new Error(field + ' is required for at_risk_rules_engine.'); return value.trim(); }
function requireTimestamp(value: string | undefined, field: string): string { const normalized = requireNonEmpty(value, field); if (!Number.isFinite(Date.parse(normalized))) throw new Error(field + ' must be a valid ISO-compatible timestamp for at_risk_rules_engine.'); return normalized; }
function requireNonNegativeNumber(value: number | undefined, field: string): number { if (value === undefined || !Number.isFinite(value) || value < 0) throw new Error(field + ' must be a non-negative finite number for at_risk_rules_engine.'); return value; }
function requireMetric(value: AtRiskMetric): AtRiskMetric { if (!VALID_METRICS.includes(value)) throw new Error('metric is not allowed for at_risk_rules_engine.'); return value; }
function requireOperator(value: AtRiskOperator): AtRiskOperator { if (!VALID_OPERATORS.includes(value)) throw new Error('operator is not allowed for at_risk_rules_engine.'); return value; }
function requireSeverity(value: AtRiskSeverity): AtRiskSeverity { if (!VALID_SEVERITIES.includes(value)) throw new Error('severity is not allowed for at_risk_rules_engine.'); return value; }
function rejectForbiddenRequests(input: AtRiskRulesEngineInput): void {
  const forbiddenFlags: Array<[keyof AtRiskRulesEngineInput, string]> = [
    ['employee_status_mutation_requested', 'at_risk_rules_engine must emit risk evidence and must not mutate employee status.'],
    ['notification_send_requested', 'at_risk_rules_engine must not send notifications directly.'],
    ['provider_specific_adapter_requested', 'at_risk_rules_engine must remain provider-neutral.'],
    ['schema_mutation_requested', 'at_risk_rules_engine must not request schema mutation.'],
    ['phase_6a_mutation_requested', 'at_risk_rules_engine must not mutate Phase 6A surfaces.'],
    ['phase_6b_mutation_requested', 'at_risk_rules_engine must not mutate Phase 6B surfaces.'],
    ['runtime_adapter_requested', 'at_risk_rules_engine must not execute runtime adapters.'],
    ['ticket_flag_flip_requested', 'at_risk_rules_engine must not flip ticket authorization flags.'],
  ];
  for (const [flag, message] of forbiddenFlags) if (input[flag] === true) throw new Error(message);
}
function metricValue(metric: AtRiskMetric, input: AtRiskRulesEngineInput): number {
  const values: Record<AtRiskMetric, number> = { ABSENCE_DAYS: input.absence_days, LATE_ARRIVALS: input.late_arrivals, PERFORMANCE_SCORE: input.performance_score, ENGAGEMENT_SCORE: input.engagement_score, POLICY_VIOLATIONS: input.policy_violations };
  return values[metric];
}
function compare(value: number, operator: AtRiskOperator, threshold: number): boolean {
  if (operator === "GTE") return value >= threshold;
  if (operator === "LTE") return value <= threshold;
  if (operator === "GT") return value > threshold;
  if (operator === "LT") return value < threshold;
  return value === threshold;
}
function digestRisk(receiptWithoutDigest: Omit<AtRiskRulesEngineReceipt, 'at_risk_rules_engine_evidence_digest'>): string { return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex'); }

export function evaluateAtRiskRulesEngine(input: AtRiskRulesEngineInput): AtRiskRulesEngineReceipt {
  rejectForbiddenRequests(input);
  const metrics = [input.absence_days, input.late_arrivals, input.performance_score, input.engagement_score, input.policy_violations];
  metrics.forEach((value, index) => requireNonNegativeNumber(value, 'metric_' + index));
  if (!Array.isArray(input.rules) || input.rules.length === 0) throw new Error('rules must contain at least one rule for at_risk_rules_engine.');
  const seen = new Set<string>();
  const matchedRuleRefs: string[] = [];
  const matchedActionRefs: string[] = [];
  const matchedSeverities: AtRiskSeverity[] = [];
  let enabledRuleCount = 0;
  for (const rule of input.rules) {
    const ruleRef = requireNonEmpty(rule.rule_ref, 'rule_ref');
    if (seen.has(ruleRef)) throw new Error('rule_ref values must be unique for at_risk_rules_engine.');
    seen.add(ruleRef);
    const metric = requireMetric(rule.metric);
    const operator = requireOperator(rule.operator);
    const threshold = requireNonNegativeNumber(rule.threshold, 'threshold');
    const severity = requireSeverity(rule.severity);
    const actionRef = requireNonEmpty(rule.action_ref, 'action_ref');
    if (rule.enabled !== true) continue;
    enabledRuleCount += 1;
    if (compare(metricValue(metric, input), operator, threshold)) {
      matchedRuleRefs.push(ruleRef);
      matchedActionRefs.push(actionRef);
      matchedSeverities.push(severity);
    }
  }
  const highestSeverity = matchedSeverities.length === 0 ? null : matchedSeverities.sort((left, right) => SEVERITY_RANK[right] - SEVERITY_RANK[left])[0];
  const riskScore = matchedSeverities.length === 0 ? 0 : Math.max(...matchedSeverities.map((severity) => SEVERITY_SCORE[severity]));
  const status: AtRiskStatus = highestSeverity === null ? "NO_RISK" : highestSeverity === "CRITICAL" ? "CRITICAL_RISK" : "AT_RISK";
  const receiptWithoutDigest: Omit<AtRiskRulesEngineReceipt, 'at_risk_rules_engine_evidence_digest'> = {
    seed_id: PHASE_6C_AT_RISK_RULES_ENGINE_SEED_ID,
    component_id: PHASE_6C_AT_RISK_RULES_ENGINE_COMPONENT_ID,
    component_slug: "hr_performance_commission_policy_and_offboarding",
    model_name: "Phase6CAtRiskRulesEngine",
    event_name: AT_RISK_RULES_ENGINE_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    employee_ref: requireNonEmpty(input.employee_ref, 'employee_ref'),
    review_cycle_ref: requireNonEmpty(input.review_cycle_ref, 'review_cycle_ref'),
    evaluated_metric_count: 5,
    enabled_rule_count: enabledRuleCount,
    matched_rule_refs: matchedRuleRefs,
    matched_action_refs: matchedActionRefs,
    highest_severity: highestSeverity,
    risk_score: riskScore,
    status,
    employee_status_mutation_allowed: false,
    notification_send_allowed: false,
    provider_neutral_only: true,
    runtime_status: "AT_RISK_RULES_ENGINE_EVALUATED",
    decision_refs: DECISION_REFS,
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };
  return { ...receiptWithoutDigest, at_risk_rules_engine_evidence_digest: digestRisk(receiptWithoutDigest) };
}
