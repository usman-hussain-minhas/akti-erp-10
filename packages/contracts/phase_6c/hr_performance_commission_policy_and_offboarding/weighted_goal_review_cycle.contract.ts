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
