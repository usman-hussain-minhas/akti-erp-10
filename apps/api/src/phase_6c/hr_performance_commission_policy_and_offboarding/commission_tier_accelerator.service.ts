import { createHash } from 'node:crypto';

export const PHASE_6C_COMMISSION_TIER_ACCELERATOR_SEED_ID = "seed_6c_046_commission_tier_accelerator" as const;
export const PHASE_6C_COMMISSION_TIER_ACCELERATOR_COMPONENT_ID = "6C.04" as const;
export const COMMISSION_TIER_ACCELERATOR_EVALUATED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.commission_tier_accelerator.evaluated" as const;

export type CommissionTierAcceleratorDecision =
  | "TIER_ACCELERATOR_QUALIFIED"
  | "TIER_ACCELERATOR_CAPPED"
  | "TIER_ACCELERATOR_NOT_QUALIFIED"
  | "TIER_ACCELERATOR_REQUIRES_REVIEW";

export type CommissionTierDefinition = {
  tier_id: string;
  tier_label: string;
  threshold_amount: number;
  accelerator_rate_percent: number;
  active: boolean;
  max_accelerator_amount?: number;
};

export type CommissionTierAcceleratorInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  commission_plan_ref: string;
  period_ref: string;
  currency: string;
  attainment_amount: number;
  base_commission_amount: number;
  evidence_refs: readonly string[];
  tier_definitions: readonly CommissionTierDefinition[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  payroll_mutation_requested?: boolean;
  payment_mutation_requested?: boolean;
  crm_mutation_requested?: boolean;
  provider_specific_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type CommissionTierAcceleratorReceipt = {
  seed_id: typeof PHASE_6C_COMMISSION_TIER_ACCELERATOR_SEED_ID;
  component_id: typeof PHASE_6C_COMMISSION_TIER_ACCELERATOR_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6CCommissionTierAccelerator";
  event_name: typeof COMMISSION_TIER_ACCELERATOR_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  commission_plan_ref: string;
  period_ref: string;
  currency: string;
  attainment_amount: number;
  base_commission_amount: number;
  selected_tier_id: string | null;
  selected_tier_label: string | null;
  selected_tier_threshold_amount: number | null;
  accelerator_rate_percent: number;
  gross_accelerator_amount: number;
  capped_adjustment_amount: number;
  payable_accelerator_amount: number;
  total_commission_with_accelerator: number;
  qualified_tier_count: number;
  decision: CommissionTierAcceleratorDecision;
  source_evidence_refs: readonly string[];
  payroll_mutation_allowed: false;
  payment_mutation_allowed: false;
  crm_mutation_allowed: false;
  provider_specific_adapter_allowed: false;
  schema_mutation_allowed: false;
  phase_6a_mutation_allowed: false;
  phase_6b_mutation_allowed: false;
  runtime_adapter_allowed: false;
  ticket_flag_flip_allowed: false;
  decision_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  evidence_artifacts: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  tier_accelerator_digest: string;
};

type ReceiptWithoutDigest = Omit<CommissionTierAcceleratorReceipt, 'tier_accelerator_digest'>;

const DECISION_REFS = ["6C-HR-OPS-006"] as const;
const EVIDENCE_ARTIFACTS = [
  "commission_tier_accelerator_runtime_receipt",
  "qualified_tier_evidence_refs",
  "deterministic_tier_accelerator_digest",
] as const;
const MONEY_SCALE = 100;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for commission_tier_accelerator.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for commission_tier_accelerator.');
  }
  return normalized;
}

function requireCurrency(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field).toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new Error(field + ' must be a three-letter ISO currency code for commission_tier_accelerator.');
  }
  return normalized;
}

function requireNonNegativeFinite(value: number | undefined, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(field + ' must be a non-negative finite number for commission_tier_accelerator.');
  }
  return value;
}

function requireAcceleratorRate(value: number | undefined, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(field + ' must be between 0 and 100 for commission_tier_accelerator.');
  }
  return value;
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * MONEY_SCALE) / MONEY_SCALE;
}

function rejectForbiddenMutation(input: CommissionTierAcceleratorInput): void {
  const forbiddenRequests: Array<[keyof CommissionTierAcceleratorInput, string]> = [
    ['payroll_mutation_requested', 'payroll mutation'],
    ['payment_mutation_requested', 'payment mutation'],
    ['crm_mutation_requested', 'CRM mutation'],
    ['provider_specific_adapter_requested', 'provider-specific adapter execution'],
    ['schema_mutation_requested', 'schema mutation'],
    ['phase_6a_mutation_requested', 'Phase 6A mutation'],
    ['phase_6b_mutation_requested', 'Phase 6B mutation'],
    ['runtime_adapter_requested', 'runtime adapter execution'],
    ['ticket_flag_flip_requested', 'ticket flag flip'],
  ];

  for (const [field, label] of forbiddenRequests) {
    if (input[field] === true) {
      throw new Error('commission_tier_accelerator must not perform ' + label + '.');
    }
  }
}

function digestReceipt(receiptWithoutDigest: ReceiptWithoutDigest): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function normalizeTiers(tierDefinitions: readonly CommissionTierDefinition[]): CommissionTierDefinition[] {
  if (!Array.isArray(tierDefinitions)) {
    throw new Error('tier_definitions must be an array for commission_tier_accelerator.');
  }
  const seenTierIds = new Set<string>();

  return tierDefinitions.map((tier, index) => {
    const prefix = 'tier_definitions[' + index + ']';
    const tierId = requireNonEmpty(tier.tier_id, prefix + '.tier_id');
    if (seenTierIds.has(tierId)) {
      throw new Error(prefix + '.tier_id must be unique for commission_tier_accelerator.');
    }
    seenTierIds.add(tierId);

    return {
      tier_id: tierId,
      tier_label: requireNonEmpty(tier.tier_label, prefix + '.tier_label'),
      threshold_amount: requireNonNegativeFinite(tier.threshold_amount, prefix + '.threshold_amount'),
      accelerator_rate_percent: requireAcceleratorRate(tier.accelerator_rate_percent, prefix + '.accelerator_rate_percent'),
      active: tier.active === true,
      max_accelerator_amount: tier.max_accelerator_amount === undefined
        ? undefined
        : requireNonNegativeFinite(tier.max_accelerator_amount, prefix + '.max_accelerator_amount'),
    };
  });
}

export function evaluateCommissionTierAccelerator(input: CommissionTierAcceleratorInput): CommissionTierAcceleratorReceipt {
  rejectForbiddenMutation(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const employeeRef = requireNonEmpty(input.employee_ref, 'employee_ref');
  const commissionPlanRef = requireNonEmpty(input.commission_plan_ref, 'commission_plan_ref');
  const periodRef = requireNonEmpty(input.period_ref, 'period_ref');
  const currency = requireCurrency(input.currency, 'currency');
  const attainmentAmount = roundMoney(requireNonNegativeFinite(input.attainment_amount, 'attainment_amount'));
  const baseCommissionAmount = roundMoney(requireNonNegativeFinite(input.base_commission_amount, 'base_commission_amount'));
  const evaluatedByUserId = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');

  if (!Array.isArray(input.evidence_refs) || input.evidence_refs.length === 0) {
    throw new Error('evidence_refs must contain at least one evidence reference for commission_tier_accelerator.');
  }
  const sourceEvidenceRefs = input.evidence_refs.map((ref, index) => requireNonEmpty(ref, 'evidence_refs[' + index + ']'));
  const activeTiers = normalizeTiers(input.tier_definitions)
    .filter((tier) => tier.active)
    .sort((a, b) => a.threshold_amount - b.threshold_amount);
  const qualifiedTiers = activeTiers.filter((tier) => attainmentAmount >= tier.threshold_amount);
  const selectedTier = qualifiedTiers[qualifiedTiers.length - 1] ?? null;

  const grossAcceleratorAmount = selectedTier === null
    ? 0
    : roundMoney(baseCommissionAmount * (selectedTier.accelerator_rate_percent / 100));
  const payableAcceleratorAmount = selectedTier === null
    ? 0
    : roundMoney(selectedTier.max_accelerator_amount === undefined
      ? grossAcceleratorAmount
      : Math.min(grossAcceleratorAmount, selectedTier.max_accelerator_amount));
  const cappedAdjustmentAmount = roundMoney(grossAcceleratorAmount - payableAcceleratorAmount);
  const decision: CommissionTierAcceleratorDecision = activeTiers.length === 0
    ? "TIER_ACCELERATOR_REQUIRES_REVIEW"
    : selectedTier === null
      ? "TIER_ACCELERATOR_NOT_QUALIFIED"
      : cappedAdjustmentAmount > 0
        ? "TIER_ACCELERATOR_CAPPED"
        : "TIER_ACCELERATOR_QUALIFIED";

  const receiptWithoutDigest: ReceiptWithoutDigest = {
    seed_id: PHASE_6C_COMMISSION_TIER_ACCELERATOR_SEED_ID,
    component_id: PHASE_6C_COMMISSION_TIER_ACCELERATOR_COMPONENT_ID,
    component_slug: "hr_performance_commission_policy_and_offboarding",
    model_name: "Phase6CCommissionTierAccelerator",
    event_name: COMMISSION_TIER_ACCELERATOR_EVALUATED_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    employee_ref: employeeRef,
    commission_plan_ref: commissionPlanRef,
    period_ref: periodRef,
    currency,
    attainment_amount: attainmentAmount,
    base_commission_amount: baseCommissionAmount,
    selected_tier_id: selectedTier?.tier_id ?? null,
    selected_tier_label: selectedTier?.tier_label ?? null,
    selected_tier_threshold_amount: selectedTier?.threshold_amount ?? null,
    accelerator_rate_percent: selectedTier?.accelerator_rate_percent ?? 0,
    gross_accelerator_amount: grossAcceleratorAmount,
    capped_adjustment_amount: cappedAdjustmentAmount,
    payable_accelerator_amount: payableAcceleratorAmount,
    total_commission_with_accelerator: roundMoney(baseCommissionAmount + payableAcceleratorAmount),
    qualified_tier_count: qualifiedTiers.length,
    decision,
    source_evidence_refs: sourceEvidenceRefs,
    payroll_mutation_allowed: false,
    payment_mutation_allowed: false,
    crm_mutation_allowed: false,
    provider_specific_adapter_allowed: false,
    schema_mutation_allowed: false,
    phase_6a_mutation_allowed: false,
    phase_6b_mutation_allowed: false,
    runtime_adapter_allowed: false,
    ticket_flag_flip_allowed: false,
    decision_refs: DECISION_REFS,
    control_metadata: input.control_metadata ?? {},
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    evaluated_by_user_id: evaluatedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    tier_accelerator_digest: digestReceipt(receiptWithoutDigest),
  };
}
