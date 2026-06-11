export const PHASE_6C_PERFORMANCE_FRAMEWORK_SEED_ID = "seed_6c_040_performance_framework" as const;
export const PHASE_6C_PERFORMANCE_FRAMEWORK_COMPONENT_ID = "6C.04" as const;
export const PERFORMANCE_FRAMEWORK_EVALUATED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.performance_framework.evaluated" as const;

export type PerformanceFrameworkDimensionType = "GOAL" | "COMPETENCY" | "BEHAVIOR" | "KPI";
export type PerformanceFrameworkStatus = "FRAMEWORK_READY" | "FRAMEWORK_REQUIRES_CONFIGURATION";

export type PerformanceFrameworkDimension = {
  dimension_ref: string;
  label: string;
  dimension_type: PerformanceFrameworkDimensionType;
  weight_percent: number;
  required: boolean;
};

export type PerformanceFrameworkRating = {
  rating_ref: string;
  label: string;
  numeric_value: number;
  passing: boolean;
};

export type PerformanceFrameworkInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  framework_ref: string;
  framework_name: string;
  cycle_ref: string;
  cycle_start: string;
  cycle_end: string;
  dimensions: readonly PerformanceFrameworkDimension[];
  rating_scale: readonly PerformanceFrameworkRating[];
  reviewer_role_refs: readonly string[];
  calibration_required: boolean;
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

export type PerformanceFrameworkReceipt = {
  seed_id: typeof PHASE_6C_PERFORMANCE_FRAMEWORK_SEED_ID;
  component_id: typeof PHASE_6C_PERFORMANCE_FRAMEWORK_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6CPerformanceFramework";
  event_name: typeof PERFORMANCE_FRAMEWORK_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  framework_ref: string;
  framework_name: string;
  cycle_ref: string;
  cycle_start: string;
  cycle_end: string;
  dimension_count: number;
  required_dimension_count: number;
  rating_count: number;
  reviewer_role_count: number;
  total_weight_percent: number;
  minimum_passing_rating_value: number | null;
  calibration_required: boolean;
  configuration_issues: readonly string[];
  status: PerformanceFrameworkStatus;
  score_mutation_allowed: false;
  commission_mutation_allowed: false;
  provider_neutral_only: true;
  runtime_status: "PERFORMANCE_FRAMEWORK_EVALUATED";
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  performance_framework_evidence_digest: string;
};
