import { createHash } from 'node:crypto';

export const PHASE_6C_OFFBOARDING_ASSET_RECOVERY_STEP_SEED_ID = "seed_6c_053_offboarding_asset_recovery_step" as const;
export const PHASE_6C_OFFBOARDING_ASSET_RECOVERY_STEP_COMPONENT_ID = "6C.04" as const;
export const OFFBOARDING_ASSET_RECOVERY_STEP_EVALUATED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.offboarding_asset_recovery_step.evaluated" as const;

export type OffboardingAssetRecoveryCategory =
  | "DEVICE"
  | "ACCESS_CARD"
  | "VEHICLE"
  | "UNIFORM"
  | "TOOLING"
  | "DOCUMENT"
  | "OTHER";

export type OffboardingAssetRecoveryCondition = "GOOD" | "DAMAGED" | "LOST" | "NOT_RETURNED";

export type OffboardingAssetRecoveryDisposition =
  | "RETURNED"
  | "RECOVERY_PENDING"
  | "DEDUCTION_REQUIRED"
  | "REVIEW_REQUIRED";

export type OffboardingAssetRecoveryDecision =
  | "ASSET_RECOVERY_CLEAR"
  | "ASSET_RECOVERY_HOLD"
  | "ASSET_RECOVERY_DEDUCTION_REVIEW"
  | "ASSET_RECOVERY_REQUIRES_REVIEW";

export type OffboardingAssetRecoveryItemInput = {
  asset_ref: string;
  category: OffboardingAssetRecoveryCategory;
  assigned_to_employee_ref: string;
  expected_return_by: string;
  declared_value: number;
  currency: string;
  returned_at?: string;
  recovered_condition?: OffboardingAssetRecoveryCondition;
  custodian_user_id?: string;
  evidence_refs: string[];
  recovery_note?: string;
};

export type OffboardingAssetRecoveryStepInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  offboarding_case_ref: string;
  employee_ref: string;
  currency: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  assets: OffboardingAssetRecoveryItemInput[];
  payroll_mutation_requested?: boolean;
  payment_mutation_requested?: boolean;
  event_dispatch_requested?: boolean;
  dlq_write_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type OffboardingAssetRecoveryPreparedItem = {
  item_index: number;
  asset_ref: string;
  category: OffboardingAssetRecoveryCategory;
  disposition: OffboardingAssetRecoveryDisposition;
  recovered_condition: OffboardingAssetRecoveryCondition;
  expected_return_by: string;
  returned_at: string | null;
  declared_value: number;
  recovery_value_at_risk: number;
  recommended_deduction: number;
  hold_recommended: boolean;
  evidence_refs: string[];
  reason: string;
};

export type OffboardingAssetRecoveryStepReceipt = {
  seed_id: typeof PHASE_6C_OFFBOARDING_ASSET_RECOVERY_STEP_SEED_ID;
  component_id: typeof PHASE_6C_OFFBOARDING_ASSET_RECOVERY_STEP_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6COffboardingAssetRecoveryStep";
  event_name: typeof OFFBOARDING_ASSET_RECOVERY_STEP_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  offboarding_case_ref: string;
  employee_ref: string;
  currency: string;
  asset_count: number;
  returned_count: number;
  pending_count: number;
  deduction_required_count: number;
  review_required_count: number;
  value_at_risk_total: number;
  recommended_deduction_total: number;
  holds_required: boolean;
  decision: OffboardingAssetRecoveryDecision;
  prepared_items: OffboardingAssetRecoveryPreparedItem[];
  payroll_mutation_performed: false;
  payment_mutation_performed: false;
  event_dispatch_performed: false;
  dlq_write_performed: false;
  schema_mutation_performed: false;
  phase_6a_mutation_performed: false;
  phase_6b_mutation_performed: false;
  runtime_adapter_performed: false;
  ticket_flag_flip_performed: false;
  decision_refs: readonly string[];
  adl_refs: readonly string[];
  evidence_artifacts: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  recovery_evidence_digest: string;
};

const ALLOWED_CATEGORIES: readonly OffboardingAssetRecoveryCategory[] = [
  "DEVICE",
  "ACCESS_CARD",
  "VEHICLE",
  "UNIFORM",
  "TOOLING",
  "DOCUMENT",
  "OTHER",
] as const;

const ALLOWED_CONDITIONS: readonly OffboardingAssetRecoveryCondition[] = ["GOOD", "DAMAGED", "LOST", "NOT_RETURNED"] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for offboarding_asset_recovery_step.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for offboarding_asset_recovery_step.');
  }
  return normalized;
}

function requireCurrency(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field).toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new Error(field + ' must be an ISO-4217 currency code for offboarding_asset_recovery_step.');
  }
  return normalized;
}

function requireNonNegativeFinite(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(field + ' must be a non-negative finite number for offboarding_asset_recovery_step.');
  }
  return Math.round(value * 100) / 100;
}

function requireCategory(value: OffboardingAssetRecoveryCategory): OffboardingAssetRecoveryCategory {
  if (!ALLOWED_CATEGORIES.includes(value)) {
    throw new Error('category must be a supported offboarding asset category.');
  }
  return value;
}

function requireCondition(value: OffboardingAssetRecoveryCondition | undefined, returnedAt: string | undefined): OffboardingAssetRecoveryCondition {
  if (value === undefined) {
    return returnedAt === undefined ? "NOT_RETURNED" : "GOOD";
  }
  if (!ALLOWED_CONDITIONS.includes(value)) {
    throw new Error('recovered_condition must be GOOD, DAMAGED, LOST, or NOT_RETURNED.');
  }
  if (returnedAt !== undefined && value === "NOT_RETURNED") {
    throw new Error('recovered_condition cannot be NOT_RETURNED when returned_at is present.');
  }
  if (returnedAt === undefined && (value === "GOOD" || value === "DAMAGED")) {
    throw new Error('returned_at is required when recovered_condition is GOOD or DAMAGED.');
  }
  return value;
}

function requireEvidenceRefs(value: string[] | undefined, field: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(field + ' must include at least one evidence reference for offboarding_asset_recovery_step.');
  }
  const refs = value.map((ref, index) => requireNonEmpty(ref, field + '[' + index + ']'));
  return Array.from(new Set(refs)).sort();
}

function rejectForbiddenMutation(input: OffboardingAssetRecoveryStepInput): void {
  const forbidden: Array<[keyof OffboardingAssetRecoveryStepInput, string]> = [
    ['payroll_mutation_requested', 'payroll mutation'],
    ['payment_mutation_requested', 'payment mutation'],
    ['event_dispatch_requested', 'event dispatch'],
    ['dlq_write_requested', 'DLQ write'],
    ['schema_mutation_requested', 'schema mutation'],
    ['phase_6a_mutation_requested', 'Phase 6A mutation'],
    ['phase_6b_mutation_requested', 'Phase 6B mutation'],
    ['runtime_adapter_requested', 'runtime adapter execution'],
    ['ticket_flag_flip_requested', 'ticket flag flip'],
  ];

  for (const [field, label] of forbidden) {
    if (input[field] === true) {
      throw new Error('offboarding_asset_recovery_step must not perform ' + label + '.');
    }
  }
}

function digestReceipt(receiptWithoutDigest: Omit<OffboardingAssetRecoveryStepReceipt, 'recovery_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function classifyDisposition(asset: OffboardingAssetRecoveryItemInput, expectedReturnBy: string, evaluatedAt: string): {
  disposition: OffboardingAssetRecoveryDisposition;
  recoveredCondition: OffboardingAssetRecoveryCondition;
  recoveryValueAtRisk: number;
  recommendedDeduction: number;
  holdRecommended: boolean;
  reason: string;
} {
  const condition = requireCondition(asset.recovered_condition, asset.returned_at);
  const declaredValue = requireNonNegativeFinite(asset.declared_value, 'declared_value');
  const overdue = Date.parse(expectedReturnBy) < Date.parse(evaluatedAt);

  if (condition === "GOOD") {
    return {
      disposition: "RETURNED",
      recoveredCondition: condition,
      recoveryValueAtRisk: 0,
      recommendedDeduction: 0,
      holdRecommended: false,
      reason: 'Asset returned in good condition; no deduction or hold is recommended.',
    };
  }

  if (condition === "DAMAGED") {
    return {
      disposition: "DEDUCTION_REQUIRED",
      recoveredCondition: condition,
      recoveryValueAtRisk: declaredValue,
      recommendedDeduction: declaredValue,
      holdRecommended: true,
      reason: 'Asset returned damaged; declared value is recommended for settlement deduction review.',
    };
  }

  if (condition === "LOST") {
    return {
      disposition: "DEDUCTION_REQUIRED",
      recoveredCondition: condition,
      recoveryValueAtRisk: declaredValue,
      recommendedDeduction: declaredValue,
      holdRecommended: true,
      reason: 'Asset marked lost; declared value is recommended for settlement deduction review.',
    };
  }

  if (overdue) {
    return {
      disposition: "REVIEW_REQUIRED",
      recoveredCondition: condition,
      recoveryValueAtRisk: declaredValue,
      recommendedDeduction: 0,
      holdRecommended: true,
      reason: 'Asset not returned and return date has passed; offboarding settlement should be held for review.',
    };
  }

  return {
    disposition: "RECOVERY_PENDING",
    recoveredCondition: condition,
    recoveryValueAtRisk: declaredValue,
    recommendedDeduction: 0,
    holdRecommended: true,
    reason: 'Asset recovery is pending before the expected return date; settlement hold is recommended until evidence arrives.',
  };
}

function normalizeItem(
  asset: OffboardingAssetRecoveryItemInput,
  itemIndex: number,
  expectedCurrency: string,
  expectedEmployeeRef: string,
  evaluatedAt: string,
): OffboardingAssetRecoveryPreparedItem {
  const assetRef = requireNonEmpty(asset.asset_ref, 'assets[' + itemIndex + '].asset_ref');
  const category = requireCategory(asset.category);
  const assignedEmployee = requireNonEmpty(asset.assigned_to_employee_ref, 'assets[' + itemIndex + '].assigned_to_employee_ref');
  if (assignedEmployee !== expectedEmployeeRef) {
    throw new Error('assets[' + itemIndex + '].assigned_to_employee_ref must match employee_ref for offboarding_asset_recovery_step.');
  }
  const expectedReturnBy = requireTimestamp(asset.expected_return_by, 'assets[' + itemIndex + '].expected_return_by');
  const returnedAt = asset.returned_at === undefined ? null : requireTimestamp(asset.returned_at, 'assets[' + itemIndex + '].returned_at');
  const currency = requireCurrency(asset.currency, 'assets[' + itemIndex + '].currency');
  if (currency !== expectedCurrency) {
    throw new Error('assets[' + itemIndex + '].currency must match the offboarding currency.');
  }

  const classification = classifyDisposition(asset, expectedReturnBy, evaluatedAt);

  return {
    item_index: itemIndex,
    asset_ref: assetRef,
    category,
    disposition: classification.disposition,
    recovered_condition: classification.recoveredCondition,
    expected_return_by: expectedReturnBy,
    returned_at: returnedAt,
    declared_value: requireNonNegativeFinite(asset.declared_value, 'assets[' + itemIndex + '].declared_value'),
    recovery_value_at_risk: classification.recoveryValueAtRisk,
    recommended_deduction: classification.recommendedDeduction,
    hold_recommended: classification.holdRecommended,
    evidence_refs: requireEvidenceRefs(asset.evidence_refs, 'assets[' + itemIndex + '].evidence_refs'),
    reason: classification.reason,
  };
}

export function evaluateOffboardingAssetRecoveryStep(input: OffboardingAssetRecoveryStepInput): OffboardingAssetRecoveryStepReceipt {
  rejectForbiddenMutation(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const offboardingCaseRef = requireNonEmpty(input.offboarding_case_ref, 'offboarding_case_ref');
  const employeeRef = requireNonEmpty(input.employee_ref, 'employee_ref');
  const currency = requireCurrency(input.currency, 'currency');
  const evaluatedByUserId = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');

  if (!Array.isArray(input.assets) || input.assets.length === 0) {
    throw new Error('assets must include at least one asset recovery item for offboarding_asset_recovery_step.');
  }

  const preparedItems = input.assets.map((asset, index) => normalizeItem(asset, index, currency, employeeRef, evaluatedAt));
  const returnedCount = preparedItems.filter((item) => item.disposition === "RETURNED").length;
  const pendingCount = preparedItems.filter((item) => item.disposition === "RECOVERY_PENDING").length;
  const deductionRequiredCount = preparedItems.filter((item) => item.disposition === "DEDUCTION_REQUIRED").length;
  const reviewRequiredCount = preparedItems.filter((item) => item.disposition === "REVIEW_REQUIRED").length;
  const valueAtRiskTotal = Math.round(preparedItems.reduce((sum, item) => sum + item.recovery_value_at_risk, 0) * 100) / 100;
  const recommendedDeductionTotal = Math.round(preparedItems.reduce((sum, item) => sum + item.recommended_deduction, 0) * 100) / 100;
  const holdsRequired = preparedItems.some((item) => item.hold_recommended);

  let decision: OffboardingAssetRecoveryDecision = "ASSET_RECOVERY_CLEAR";
  if (reviewRequiredCount > 0) {
    decision = "ASSET_RECOVERY_REQUIRES_REVIEW";
  } else if (deductionRequiredCount > 0) {
    decision = "ASSET_RECOVERY_DEDUCTION_REVIEW";
  } else if (pendingCount > 0 || holdsRequired) {
    decision = "ASSET_RECOVERY_HOLD";
  }

  const receiptWithoutDigest: Omit<OffboardingAssetRecoveryStepReceipt, 'recovery_evidence_digest'> = {
    seed_id: PHASE_6C_OFFBOARDING_ASSET_RECOVERY_STEP_SEED_ID,
    component_id: PHASE_6C_OFFBOARDING_ASSET_RECOVERY_STEP_COMPONENT_ID,
    component_slug: "hr_performance_commission_policy_and_offboarding",
    model_name: "Phase6COffboardingAssetRecoveryStep",
    event_name: OFFBOARDING_ASSET_RECOVERY_STEP_EVALUATED_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    offboarding_case_ref: offboardingCaseRef,
    employee_ref: employeeRef,
    currency,
    asset_count: preparedItems.length,
    returned_count: returnedCount,
    pending_count: pendingCount,
    deduction_required_count: deductionRequiredCount,
    review_required_count: reviewRequiredCount,
    value_at_risk_total: valueAtRiskTotal,
    recommended_deduction_total: recommendedDeductionTotal,
    holds_required: holdsRequired,
    decision,
    prepared_items: preparedItems,
    payroll_mutation_performed: false,
    payment_mutation_performed: false,
    event_dispatch_performed: false,
    dlq_write_performed: false,
    schema_mutation_performed: false,
    phase_6a_mutation_performed: false,
    phase_6b_mutation_performed: false,
    runtime_adapter_performed: false,
    ticket_flag_flip_performed: false,
    decision_refs: ["6C-HR-OPS-012", "6C-HR-OPS-011", "6C-ADL-002", "6C-ADL-004"],
    adl_refs: ["ADL-001", "ADL-002"],
    evidence_artifacts: [
      "offboarding_asset_recovery_step_runtime_receipt",
      "offboarding_asset_recovery_step_validation_result",
      "offboarding_asset_recovery_step_forbidden_behavior_rejection_evidence",
    ],
    evaluated_by_user_id: evaluatedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    recovery_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
