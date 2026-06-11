import { createHash } from 'node:crypto';

export const PHASE_6C_WEIGHTED_GOAL_REVIEW_CYCLE_SEED_ID = "seed_6c_041_weighted_goal_review_cycle" as const;
export const PHASE_6C_WEIGHTED_GOAL_REVIEW_CYCLE_COMPONENT_ID = "6C.04" as const;
export const WEIGHTED_GOAL_REVIEW_CYCLE_EVALUATED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.weighted_goal_review_cycle.evaluated" as const;

export type WeightedGoalStatus = "NOT_STARTED" | "IN_PROGRESS" | "ACHIEVED" | "MISSED";
export type WeightedReviewCycleStatus = "REVIEW_READY" | "REVIEW_IN_PROGRESS" | "REVIEW_REQUIRES_CONFIGURATION";
export type WeightedReviewRatingBand = "UNRATED" | "BELOW_EXPECTATION" | "MEETS_EXPECTATION" | "EXCEEDS_EXPECTATION";

export type WeightedGoalReviewItem = {
  goal_ref: string;
  label: string;
  weight_percent: number;
  target_value: number;
  actual_value?: number;
  status: WeightedGoalStatus;
};

export type WeightedGoalReviewCycleInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  framework_ref: string;
  review_cycle_ref: string;
  cycle_start: string;
  cycle_end: string;
  goals: readonly WeightedGoalReviewItem[];
  meets_expectation_threshold: number;
  exceeds_expectation_threshold: number;
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  score_mutation_requested?: boolean;
  commission_mutation_requested?: boolean;
  provider_specific_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type WeightedGoalReviewCycleReceipt = {
  seed_id: typeof PHASE_6C_WEIGHTED_GOAL_REVIEW_CYCLE_SEED_ID;
  component_id: typeof PHASE_6C_WEIGHTED_GOAL_REVIEW_CYCLE_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6CWeightedGoalReviewCycle";
  event_name: typeof WEIGHTED_GOAL_REVIEW_CYCLE_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  framework_ref: string;
  review_cycle_ref: string;
  cycle_start: string;
  cycle_end: string;
  goal_count: number;
  scored_goal_count: number;
  total_weight_percent: number;
  weighted_score_percent: number;
  completion_percent: number;
  rating_band: WeightedReviewRatingBand;
  status: WeightedReviewCycleStatus;
  configuration_issues: readonly string[];
  score_mutation_allowed: false;
  commission_mutation_allowed: false;
  provider_neutral_only: true;
  runtime_status: "WEIGHTED_GOAL_REVIEW_CYCLE_EVALUATED";
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  weighted_goal_review_cycle_evidence_digest: string;
};

const VALID_STATUSES: readonly WeightedGoalStatus[] = ["NOT_STARTED", "IN_PROGRESS", "ACHIEVED", "MISSED"];
const DECISION_REFS = ["6C-HR-OPS-002"] as const;
const EVIDENCE_ARTIFACTS = ["weighted_goal_review_cycle_receipt", "goal_weight_evidence", "review_score_evidence"] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) throw new Error(field + ' is required for weighted_goal_review_cycle.');
  return value.trim();
}
function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) throw new Error(field + ' must be a valid ISO-compatible timestamp for weighted_goal_review_cycle.');
  return normalized;
}
function requireDate(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) throw new Error(field + ' must use YYYY-MM-DD format for weighted_goal_review_cycle.');
  return normalized;
}
function requireNonNegativeNumber(value: number | undefined, field: string): number {
  if (value === undefined || !Number.isFinite(value) || value < 0) throw new Error(field + ' must be a non-negative finite number for weighted_goal_review_cycle.');
  return value;
}
function requirePositiveNumber(value: number | undefined, field: string): number {
  if (value === undefined || !Number.isFinite(value) || value <= 0) throw new Error(field + ' must be a positive finite number for weighted_goal_review_cycle.');
  return value;
}
function requireGoalStatus(value: WeightedGoalStatus): WeightedGoalStatus {
  if (!VALID_STATUSES.includes(value)) throw new Error('goal status is not allowed for weighted_goal_review_cycle.');
  return value;
}
function rejectForbiddenRequests(input: WeightedGoalReviewCycleInput): void {
  const forbiddenFlags: Array<[keyof WeightedGoalReviewCycleInput, string]> = [
    ['score_mutation_requested', 'weighted_goal_review_cycle must evaluate scores and must not mutate score records.'],
    ['commission_mutation_requested', 'weighted_goal_review_cycle must not mutate commission surfaces.'],
    ['provider_specific_adapter_requested', 'weighted_goal_review_cycle must remain provider-neutral.'],
    ['schema_mutation_requested', 'weighted_goal_review_cycle must not request schema mutation.'],
    ['phase_6a_mutation_requested', 'weighted_goal_review_cycle must not mutate Phase 6A surfaces.'],
    ['phase_6b_mutation_requested', 'weighted_goal_review_cycle must not mutate Phase 6B surfaces.'],
    ['runtime_adapter_requested', 'weighted_goal_review_cycle must not execute runtime adapters.'],
    ['ticket_flag_flip_requested', 'weighted_goal_review_cycle must not flip ticket authorization flags.'],
  ];
  for (const [flag, message] of forbiddenFlags) if (input[flag] === true) throw new Error(message);
}
function digestReview(receiptWithoutDigest: Omit<WeightedGoalReviewCycleReceipt, 'weighted_goal_review_cycle_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}
function compareIsoDate(left: string, right: string): number {
  return Date.parse(left + 'T00:00:00.000Z') - Date.parse(right + 'T00:00:00.000Z');
}
function ratingBand(score: number, completion: number, meets: number, exceeds: number): WeightedReviewRatingBand {
  if (completion < 100) return "UNRATED";
  if (score >= exceeds) return "EXCEEDS_EXPECTATION";
  if (score >= meets) return "MEETS_EXPECTATION";
  return "BELOW_EXPECTATION";
}

export function evaluateWeightedGoalReviewCycle(input: WeightedGoalReviewCycleInput): WeightedGoalReviewCycleReceipt {
  rejectForbiddenRequests(input);
  const cycleStart = requireDate(input.cycle_start, 'cycle_start');
  const cycleEnd = requireDate(input.cycle_end, 'cycle_end');
  if (compareIsoDate(cycleStart, cycleEnd) > 0) throw new Error('cycle_start must be on or before cycle_end for weighted_goal_review_cycle.');
  const meets = requireNonNegativeNumber(input.meets_expectation_threshold, 'meets_expectation_threshold');
  const exceeds = requireNonNegativeNumber(input.exceeds_expectation_threshold, 'exceeds_expectation_threshold');
  if (meets > exceeds) throw new Error('meets_expectation_threshold cannot exceed exceeds_expectation_threshold for weighted_goal_review_cycle.');
  if (!Array.isArray(input.goals) || input.goals.length === 0) throw new Error('goals must contain at least one goal for weighted_goal_review_cycle.');

  const seen = new Set<string>();
  let totalWeight = 0;
  let scoredWeight = 0;
  let weightedScore = 0;
  const issues: string[] = [];
  for (const goal of input.goals) {
    const goalRef = requireNonEmpty(goal.goal_ref, 'goal_ref');
    if (seen.has(goalRef)) throw new Error('goal_ref values must be unique for weighted_goal_review_cycle.');
    seen.add(goalRef);
    requireNonEmpty(goal.label, 'goal.label');
    const weight = requirePositiveNumber(goal.weight_percent, 'weight_percent');
    const target = requirePositiveNumber(goal.target_value, 'target_value');
    const status = requireGoalStatus(goal.status);
    totalWeight += weight;
    if (status === "ACHIEVED" || status === "MISSED") {
      const actual = requireNonNegativeNumber(goal.actual_value, 'actual_value');
      scoredWeight += weight;
      weightedScore += Math.min(actual / target, 1) * weight;
    }
  }
  totalWeight = Number(totalWeight.toFixed(6));
  if (Math.abs(totalWeight - 100) > 0.000001) issues.push('goal weights must total 100 percent');
  const completion = Number(scoredWeight.toFixed(6));
  const score = totalWeight === 0 ? 0 : Number(((weightedScore / totalWeight) * 100).toFixed(6));
  const band = ratingBand(score, completion, meets, exceeds);
  const status: WeightedReviewCycleStatus = issues.length > 0 ? "REVIEW_REQUIRES_CONFIGURATION" : completion < 100 ? "REVIEW_IN_PROGRESS" : "REVIEW_READY";

  const receiptWithoutDigest: Omit<WeightedGoalReviewCycleReceipt, 'weighted_goal_review_cycle_evidence_digest'> = {
    seed_id: PHASE_6C_WEIGHTED_GOAL_REVIEW_CYCLE_SEED_ID,
    component_id: PHASE_6C_WEIGHTED_GOAL_REVIEW_CYCLE_COMPONENT_ID,
    component_slug: "hr_performance_commission_policy_and_offboarding",
    model_name: "Phase6CWeightedGoalReviewCycle",
    event_name: WEIGHTED_GOAL_REVIEW_CYCLE_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    employee_ref: requireNonEmpty(input.employee_ref, 'employee_ref'),
    framework_ref: requireNonEmpty(input.framework_ref, 'framework_ref'),
    review_cycle_ref: requireNonEmpty(input.review_cycle_ref, 'review_cycle_ref'),
    cycle_start: cycleStart,
    cycle_end: cycleEnd,
    goal_count: input.goals.length,
    scored_goal_count: input.goals.filter((goal) => goal.status === "ACHIEVED" || goal.status === "MISSED").length,
    total_weight_percent: totalWeight,
    weighted_score_percent: score,
    completion_percent: completion,
    rating_band: band,
    status,
    configuration_issues: issues,
    score_mutation_allowed: false,
    commission_mutation_allowed: false,
    provider_neutral_only: true,
    runtime_status: "WEIGHTED_GOAL_REVIEW_CYCLE_EVALUATED",
    decision_refs: DECISION_REFS,
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };
  return { ...receiptWithoutDigest, weighted_goal_review_cycle_evidence_digest: digestReview(receiptWithoutDigest) };
}
