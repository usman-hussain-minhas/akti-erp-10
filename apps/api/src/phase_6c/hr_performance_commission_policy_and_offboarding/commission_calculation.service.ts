import { createHash } from 'node:crypto';

export const PHASE_6C_COMMISSION_CALCULATION_SEED_ID = "seed_6c_043_commission_calculation" as const;
export const PHASE_6C_COMMISSION_CALCULATION_COMPONENT_ID = "6C.04" as const;
export const COMMISSION_CALCULATION_EVALUATED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.commission_calculation.evaluated" as const;

export type CommissionCalculationBasis =
  | "CRM_REVENUE"
  | "PAYMENT_COLLECTION"
  | "INVOICE_MARGIN"
  | "MANUAL_EVIDENCE_ADJUSTMENT";

export type CommissionCalculationDecision =
  | "COMMISSION_EVIDENCE_READY"
  | "COMMISSION_CAPPED"
  | "COMMISSION_REQUIRES_REVIEW";

export type CommissionCalculationEvidenceLine = {
  evidence_ref: string;
  source_phase_ref: "6B_CRM" | "6B_PAYMENTS" | "6B_INVOICING" | "MANUAL_APPROVED_EVIDENCE";
  basis: CommissionCalculationBasis;
  eligible_amount: number;
  approved: boolean;
  commission_rate_percent?: number;
  currency?: string;
  evidence_note?: string;
};

export type CommissionCalculationInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  commission_plan_ref: string;
  period_ref: string;
  default_commission_rate_percent: number;
  max_commission_amount?: number;
  currency: string;
  evidence_lines: readonly CommissionCalculationEvidenceLine[];
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

export type CommissionCalculationReceipt = {
  seed_id: typeof PHASE_6C_COMMISSION_CALCULATION_SEED_ID;
  component_id: typeof PHASE_6C_COMMISSION_CALCULATION_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6CCommissionCalculation";
  event_name: typeof COMMISSION_CALCULATION_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  commission_plan_ref: string;
  period_ref: string;
  currency: string;
  evidence_line_count: number;
  approved_line_count: number;
  rejected_line_count: number;
  eligible_amount_total: number;
  gross_commission_amount: number;
  cap_adjustment_amount: number;
  payable_commission_amount: number;
  decision: CommissionCalculationDecision;
  payroll_mutation_allowed: false;
  payment_mutation_allowed: false;
  crm_mutation_allowed: false;
  provider_specific_adapter_allowed: false;
  schema_mutation_allowed: false;
  phase_6a_mutation_allowed: false;
  phase_6b_mutation_allowed: false;
  runtime_adapter_allowed: false;
  ticket_flag_flip_allowed: false;
  source_evidence_refs: readonly string[];
  decision_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  evidence_artifacts: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  commission_evidence_digest: string;
};

type ReceiptWithoutDigest = Omit<CommissionCalculationReceipt, 'commission_evidence_digest'>;

const DECISION_REFS = ["6C-HR-OPS-005"] as const;
const EVIDENCE_ARTIFACTS = [
  "commission_calculation_receipt",
  "approved_source_evidence_refs",
  "deterministic_commission_digest",
] as const;
const MONEY_SCALE = 100;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for commission_calculation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for commission_calculation.');
  }
  return normalized;
}

function requireCurrency(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field).toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new Error(field + ' must be a three-letter ISO currency code for commission_calculation.');
  }
  return normalized;
}

function requireNonNegativeFinite(value: number | undefined, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(field + ' must be a non-negative finite number for commission_calculation.');
  }
  return value;
}

function requirePositiveRate(value: number | undefined, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value > 100) {
    throw new Error(field + ' must be greater than 0 and no more than 100 for commission_calculation.');
  }
  return value;
}

function rejectForbiddenMutation(input: CommissionCalculationInput): void {
  const forbiddenRequests: Array<[keyof CommissionCalculationInput, string]> = [
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
      throw new Error('commission_calculation must not perform ' + label + '.');
    }
  }
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * MONEY_SCALE) / MONEY_SCALE;
}

function digestReceipt(receiptWithoutDigest: ReceiptWithoutDigest): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function calculateCommissionFromEvidence(input: CommissionCalculationInput): CommissionCalculationReceipt {
  rejectForbiddenMutation(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const employeeRef = requireNonEmpty(input.employee_ref, 'employee_ref');
  const commissionPlanRef = requireNonEmpty(input.commission_plan_ref, 'commission_plan_ref');
  const periodRef = requireNonEmpty(input.period_ref, 'period_ref');
  const currency = requireCurrency(input.currency, 'currency');
  const defaultRate = requirePositiveRate(input.default_commission_rate_percent, 'default_commission_rate_percent');
  const maxCommissionAmount = input.max_commission_amount === undefined
    ? undefined
    : requireNonNegativeFinite(input.max_commission_amount, 'max_commission_amount');
  const evaluatedByUserId = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');

  if (!Array.isArray(input.evidence_lines)) {
    throw new Error('evidence_lines must be an array for commission_calculation.');
  }

  let approvedLineCount = 0;
  let eligibleAmountTotal = 0;
  let grossCommissionAmount = 0;
  const sourceEvidenceRefs: string[] = [];

  input.evidence_lines.forEach((line, index) => {
    const linePrefix = 'evidence_lines[' + index + ']';
    const evidenceRef = requireNonEmpty(line.evidence_ref, linePrefix + '.evidence_ref');
    const lineCurrency = line.currency === undefined ? currency : requireCurrency(line.currency, linePrefix + '.currency');
    if (lineCurrency !== currency) {
      throw new Error(linePrefix + '.currency must match commission_calculation currency.');
    }

    const eligibleAmount = requireNonNegativeFinite(line.eligible_amount, linePrefix + '.eligible_amount');
    const lineRate = line.commission_rate_percent === undefined
      ? defaultRate
      : requirePositiveRate(line.commission_rate_percent, linePrefix + '.commission_rate_percent');

    if (line.approved === true) {
      approvedLineCount += 1;
      eligibleAmountTotal = roundMoney(eligibleAmountTotal + eligibleAmount);
      grossCommissionAmount = roundMoney(grossCommissionAmount + eligibleAmount * (lineRate / 100));
      sourceEvidenceRefs.push(evidenceRef);
    }
  });

  const cappedAmount = maxCommissionAmount === undefined
    ? grossCommissionAmount
    : Math.min(grossCommissionAmount, maxCommissionAmount);
  const payableCommissionAmount = approvedLineCount === 0 ? 0 : roundMoney(cappedAmount);
  const capAdjustmentAmount = approvedLineCount === 0 ? 0 : roundMoney(grossCommissionAmount - payableCommissionAmount);
  const decision: CommissionCalculationDecision = approvedLineCount === 0
    ? "COMMISSION_REQUIRES_REVIEW"
    : capAdjustmentAmount > 0
      ? "COMMISSION_CAPPED"
      : "COMMISSION_EVIDENCE_READY";

  const receiptWithoutDigest: ReceiptWithoutDigest = {
    seed_id: PHASE_6C_COMMISSION_CALCULATION_SEED_ID,
    component_id: PHASE_6C_COMMISSION_CALCULATION_COMPONENT_ID,
    component_slug: "hr_performance_commission_policy_and_offboarding",
    model_name: "Phase6CCommissionCalculation",
    event_name: COMMISSION_CALCULATION_EVALUATED_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    employee_ref: employeeRef,
    commission_plan_ref: commissionPlanRef,
    period_ref: periodRef,
    currency,
    evidence_line_count: input.evidence_lines.length,
    approved_line_count: approvedLineCount,
    rejected_line_count: input.evidence_lines.length - approvedLineCount,
    eligible_amount_total: roundMoney(eligibleAmountTotal),
    gross_commission_amount: roundMoney(grossCommissionAmount),
    cap_adjustment_amount: capAdjustmentAmount,
    payable_commission_amount: payableCommissionAmount,
    decision,
    payroll_mutation_allowed: false,
    payment_mutation_allowed: false,
    crm_mutation_allowed: false,
    provider_specific_adapter_allowed: false,
    schema_mutation_allowed: false,
    phase_6a_mutation_allowed: false,
    phase_6b_mutation_allowed: false,
    runtime_adapter_allowed: false,
    ticket_flag_flip_allowed: false,
    source_evidence_refs: sourceEvidenceRefs,
    decision_refs: DECISION_REFS,
    control_metadata: input.control_metadata ?? {},
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    evaluated_by_user_id: evaluatedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    commission_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
