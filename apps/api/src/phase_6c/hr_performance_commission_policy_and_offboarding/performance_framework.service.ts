import { createHash } from 'node:crypto';

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

const VALID_DIMENSION_TYPES: readonly PerformanceFrameworkDimensionType[] = ["GOAL", "COMPETENCY", "BEHAVIOR", "KPI"];
const DECISION_REFS = ["6C-HR-OPS-001"] as const;
const EVIDENCE_ARTIFACTS = [
  "performance_framework_configuration_receipt",
  "performance_dimension_weight_evidence",
  "performance_rating_scale_evidence",
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for performance_framework.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for performance_framework.');
  }
  return normalized;
}

function requireDate(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error(field + ' must use YYYY-MM-DD format for performance_framework.');
  }
  return normalized;
}

function requireNonNegativeNumber(value: number | undefined, field: string): number {
  if (value === undefined || !Number.isFinite(value) || value < 0) {
    throw new Error(field + ' must be a non-negative finite number for performance_framework.');
  }
  return value;
}

function requireDimensionType(value: PerformanceFrameworkDimensionType): PerformanceFrameworkDimensionType {
  if (!VALID_DIMENSION_TYPES.includes(value)) {
    throw new Error('dimension_type is not allowed for performance_framework.');
  }
  return value;
}

function rejectForbiddenRequests(input: PerformanceFrameworkInput): void {
  const forbiddenFlags: Array<[keyof PerformanceFrameworkInput, string]> = [
    ['score_mutation_requested', 'performance_framework must evaluate configuration and must not mutate scores.'],
    ['commission_mutation_requested', 'performance_framework must not mutate commission surfaces.'],
    ['provider_specific_adapter_requested', 'performance_framework must remain provider-neutral.'],
    ['schema_mutation_requested', 'performance_framework must not request schema mutation.'],
    ['phase_6a_mutation_requested', 'performance_framework must not mutate Phase 6A surfaces.'],
    ['phase_6b_mutation_requested', 'performance_framework must not mutate Phase 6B surfaces.'],
    ['runtime_adapter_requested', 'performance_framework must not execute runtime adapters.'],
    ['ticket_flag_flip_requested', 'performance_framework must not flip ticket authorization flags.'],
  ];

  for (const [flag, message] of forbiddenFlags) {
    if (input[flag] === true) {
      throw new Error(message);
    }
  }
}

function digestFramework(receiptWithoutDigest: Omit<PerformanceFrameworkReceipt, 'performance_framework_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function compareIsoDate(left: string, right: string): number {
  return Date.parse(left + 'T00:00:00.000Z') - Date.parse(right + 'T00:00:00.000Z');
}

function inspectDimensions(dimensions: readonly PerformanceFrameworkDimension[]): { totalWeight: number; requiredCount: number; issues: string[] } {
  if (!Array.isArray(dimensions) || dimensions.length === 0) {
    throw new Error('dimensions must contain at least one dimension for performance_framework.');
  }
  const seen = new Set<string>();
  let totalWeight = 0;
  let requiredCount = 0;
  const issues: string[] = [];
  for (const dimension of dimensions) {
    const dimensionRef = requireNonEmpty(dimension.dimension_ref, 'dimension_ref');
    if (seen.has(dimensionRef)) {
      throw new Error('dimension_ref values must be unique for performance_framework.');
    }
    seen.add(dimensionRef);
    requireNonEmpty(dimension.label, 'dimension.label');
    requireDimensionType(dimension.dimension_type);
    const weight = requireNonNegativeNumber(dimension.weight_percent, 'weight_percent');
    if (weight === 0) issues.push('dimension ' + dimensionRef + ' has zero weight');
    totalWeight += weight;
    if (dimension.required === true) requiredCount += 1;
  }
  return { totalWeight: Number(totalWeight.toFixed(6)), requiredCount, issues };
}

function inspectRatings(ratings: readonly PerformanceFrameworkRating[]): { count: number; minimumPassing: number | null; issues: string[] } {
  if (!Array.isArray(ratings) || ratings.length < 2) {
    throw new Error('rating_scale must contain at least two ratings for performance_framework.');
  }
  const seen = new Set<string>();
  const values: number[] = [];
  const passingValues: number[] = [];
  for (const rating of ratings) {
    const ratingRef = requireNonEmpty(rating.rating_ref, 'rating_ref');
    if (seen.has(ratingRef)) {
      throw new Error('rating_ref values must be unique for performance_framework.');
    }
    seen.add(ratingRef);
    requireNonEmpty(rating.label, 'rating.label');
    const value = requireNonNegativeNumber(rating.numeric_value, 'numeric_value');
    values.push(value);
    if (rating.passing === true) passingValues.push(value);
  }
  const uniqueValues = new Set(values);
  if (uniqueValues.size !== values.length) {
    throw new Error('rating numeric_value values must be unique for performance_framework.');
  }
  return {
    count: ratings.length,
    minimumPassing: passingValues.length === 0 ? null : Math.min(...passingValues),
    issues: passingValues.length === 0 ? ['rating scale has no passing rating'] : [],
  };
}

export function evaluatePerformanceFramework(input: PerformanceFrameworkInput): PerformanceFrameworkReceipt {
  rejectForbiddenRequests(input);

  const cycleStart = requireDate(input.cycle_start, 'cycle_start');
  const cycleEnd = requireDate(input.cycle_end, 'cycle_end');
  if (compareIsoDate(cycleStart, cycleEnd) > 0) {
    throw new Error('cycle_start must be on or before cycle_end for performance_framework.');
  }

  const dimensionSummary = inspectDimensions(input.dimensions);
  const ratingSummary = inspectRatings(input.rating_scale);
  if (!Array.isArray(input.reviewer_role_refs) || input.reviewer_role_refs.length === 0) {
    throw new Error('reviewer_role_refs must contain at least one reviewer role for performance_framework.');
  }
  const reviewerRoles = [...new Set(input.reviewer_role_refs.map((role) => requireNonEmpty(role, 'reviewer_role_ref')))];
  const issues = [...dimensionSummary.issues, ...ratingSummary.issues];
  if (Math.abs(dimensionSummary.totalWeight - 100) > 0.000001) {
    issues.push('dimension weights must total 100 percent');
  }
  if (dimensionSummary.requiredCount === 0) {
    issues.push('at least one required dimension is needed');
  }

  const receiptWithoutDigest: Omit<PerformanceFrameworkReceipt, 'performance_framework_evidence_digest'> = {
    seed_id: PHASE_6C_PERFORMANCE_FRAMEWORK_SEED_ID,
    component_id: PHASE_6C_PERFORMANCE_FRAMEWORK_COMPONENT_ID,
    component_slug: "hr_performance_commission_policy_and_offboarding",
    model_name: "Phase6CPerformanceFramework",
    event_name: PERFORMANCE_FRAMEWORK_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    framework_ref: requireNonEmpty(input.framework_ref, 'framework_ref'),
    framework_name: requireNonEmpty(input.framework_name, 'framework_name'),
    cycle_ref: requireNonEmpty(input.cycle_ref, 'cycle_ref'),
    cycle_start: cycleStart,
    cycle_end: cycleEnd,
    dimension_count: input.dimensions.length,
    required_dimension_count: dimensionSummary.requiredCount,
    rating_count: ratingSummary.count,
    reviewer_role_count: reviewerRoles.length,
    total_weight_percent: dimensionSummary.totalWeight,
    minimum_passing_rating_value: ratingSummary.minimumPassing,
    calibration_required: input.calibration_required === true,
    configuration_issues: issues,
    status: issues.length === 0 ? "FRAMEWORK_READY" : "FRAMEWORK_REQUIRES_CONFIGURATION",
    score_mutation_allowed: false,
    commission_mutation_allowed: false,
    provider_neutral_only: true,
    runtime_status: "PERFORMANCE_FRAMEWORK_EVALUATED",
    decision_refs: DECISION_REFS,
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    performance_framework_evidence_digest: digestFramework(receiptWithoutDigest),
  };
}
