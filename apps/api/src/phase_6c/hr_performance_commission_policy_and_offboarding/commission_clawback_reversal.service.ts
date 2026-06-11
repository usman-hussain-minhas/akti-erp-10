import { createHash } from 'node:crypto';

export const PHASE_6C_COMMISSION_CLAWBACK_REVERSAL_SEED_ID = "seed_6c_045_commission_clawback_reversal" as const;
export const PHASE_6C_COMMISSION_CLAWBACK_REVERSAL_COMPONENT_ID = "6C.04" as const;
export const COMMISSION_CLAWBACK_REVERSAL_EVALUATED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.commission_clawback_reversal.evaluated" as const;

export type CommissionClawbackReversalReason =
  | "CUSTOMER_REFUND"
  | "DEAL_CANCELLATION"
  | "PAYMENT_REVERSAL"
  | "COMPLIANCE_HOLD"
  | "MANUAL_CORRECTION";

export type CommissionClawbackReversalOutcome =
  | "FULL_REVERSAL_READY"
  | "PARTIAL_REVERSAL_READY"
  | "REVERSAL_REQUIRES_REVIEW";

export type CommissionClawbackReversalDecision =
  | "CLAWBACK_REVERSAL_READY"
  | "CLAWBACK_REVERSAL_PARTIAL"
  | "CLAWBACK_REVERSAL_REQUIRES_REVIEW";

export type CommissionClawbackReversalItem = {
  commission_receipt_ref: string;
  employee_ref: string;
  commission_plan_ref: string;
  original_commission_amount: number;
  paid_commission_amount: number;
  prior_reversal_amount?: number;
  reversal_requested_amount: number;
  reason: CommissionClawbackReversalReason;
  approved_for_reversal: boolean;
  source_evidence_ref: string;
  currency?: string;
  review_note?: string;
  evidence_refs: readonly string[];
};

export type CommissionClawbackReversalInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  reversal_batch_ref: string;
  period_ref: string;
  currency: string;
  reversal_items: readonly CommissionClawbackReversalItem[];
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

export type CommissionClawbackReversalPlanItem = {
  commission_receipt_ref: string;
  employee_ref: string;
  commission_plan_ref: string;
  reason: CommissionClawbackReversalReason;
  currency: string;
  original_commission_amount: number;
  paid_commission_amount: number;
  prior_reversal_amount: number;
  reversal_requested_amount: number;
  maximum_reversible_amount: number;
  approved_reversal_amount: number;
  unreversed_requested_amount: number;
  outcome: CommissionClawbackReversalOutcome;
  source_evidence_ref: string;
  review_note?: string;
  evidence_refs: readonly string[];
};

export type CommissionClawbackReversalReceipt = {
  seed_id: typeof PHASE_6C_COMMISSION_CLAWBACK_REVERSAL_SEED_ID;
  component_id: typeof PHASE_6C_COMMISSION_CLAWBACK_REVERSAL_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6CCommissionClawbackReversal";
  event_name: typeof COMMISSION_CLAWBACK_REVERSAL_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  reversal_batch_ref: string;
  period_ref: string;
  currency: string;
  reversal_item_count: number;
  full_reversal_count: number;
  partial_reversal_count: number;
  review_reversal_count: number;
  requested_reversal_amount_total: number;
  approved_reversal_amount_total: number;
  unreversed_requested_amount_total: number;
  decision: CommissionClawbackReversalDecision;
  planned_reversals: readonly CommissionClawbackReversalPlanItem[];
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
  clawback_reversal_digest: string;
};

type ReceiptWithoutDigest = Omit<CommissionClawbackReversalReceipt, 'clawback_reversal_digest'>;

const DECISION_REFS = ["6C-HR-OPS-008"] as const;
const EVIDENCE_ARTIFACTS = [
  "commission_clawback_reversal_runtime_receipt",
  "planned_reversal_ledger",
  "review_required_reversal_evidence",
  "deterministic_clawback_reversal_digest",
] as const;
const MONEY_SCALE = 100;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for commission_clawback_reversal.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for commission_clawback_reversal.');
  }
  return normalized;
}

function requireCurrency(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field).toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new Error(field + ' must be a three-letter ISO currency code for commission_clawback_reversal.');
  }
  return normalized;
}

function requireNonNegativeFinite(value: number | undefined, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(field + ' must be a non-negative finite number for commission_clawback_reversal.');
  }
  return value;
}

function requireReason(value: CommissionClawbackReversalReason | undefined, field: string): CommissionClawbackReversalReason {
  if (
    value !== "CUSTOMER_REFUND" &&
    value !== "DEAL_CANCELLATION" &&
    value !== "PAYMENT_REVERSAL" &&
    value !== "COMPLIANCE_HOLD" &&
    value !== "MANUAL_CORRECTION"
  ) {
    throw new Error(field + ' must be a supported clawback reason for commission_clawback_reversal.');
  }
  return value;
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * MONEY_SCALE) / MONEY_SCALE;
}

function rejectForbiddenMutation(input: CommissionClawbackReversalInput): void {
  const forbiddenRequests: Array<[keyof CommissionClawbackReversalInput, string]> = [
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
      throw new Error('commission_clawback_reversal must not perform ' + label + '.');
    }
  }
}

function digestReceipt(receiptWithoutDigest: ReceiptWithoutDigest): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function buildPlanItem(item: CommissionClawbackReversalItem, index: number, currency: string): CommissionClawbackReversalPlanItem {
  const prefix = 'reversal_items[' + index + ']';
  const commissionReceiptRef = requireNonEmpty(item.commission_receipt_ref, prefix + '.commission_receipt_ref');
  const employeeRef = requireNonEmpty(item.employee_ref, prefix + '.employee_ref');
  const commissionPlanRef = requireNonEmpty(item.commission_plan_ref, prefix + '.commission_plan_ref');
  const itemCurrency = item.currency === undefined ? currency : requireCurrency(item.currency, prefix + '.currency');
  if (itemCurrency !== currency) {
    throw new Error(prefix + '.currency must match commission_clawback_reversal currency.');
  }

  const originalCommissionAmount = roundMoney(requireNonNegativeFinite(item.original_commission_amount, prefix + '.original_commission_amount'));
  const paidCommissionAmount = roundMoney(requireNonNegativeFinite(item.paid_commission_amount, prefix + '.paid_commission_amount'));
  const priorReversalAmount = roundMoney(requireNonNegativeFinite(item.prior_reversal_amount ?? 0, prefix + '.prior_reversal_amount'));
  const reversalRequestedAmount = roundMoney(requireNonNegativeFinite(item.reversal_requested_amount, prefix + '.reversal_requested_amount'));
  const sourceEvidenceRef = requireNonEmpty(item.source_evidence_ref, prefix + '.source_evidence_ref');
  const reason = requireReason(item.reason, prefix + '.reason');

  if (paidCommissionAmount > originalCommissionAmount) {
    throw new Error(prefix + '.paid_commission_amount must not exceed original_commission_amount for commission_clawback_reversal.');
  }
  if (priorReversalAmount > paidCommissionAmount) {
    throw new Error(prefix + '.prior_reversal_amount must not exceed paid_commission_amount for commission_clawback_reversal.');
  }
  if (!Array.isArray(item.evidence_refs) || item.evidence_refs.length === 0) {
    throw new Error(prefix + '.evidence_refs must contain at least one evidence reference for commission_clawback_reversal.');
  }

  const evidenceRefs = item.evidence_refs.map((ref, refIndex) => requireNonEmpty(ref, prefix + '.evidence_refs[' + refIndex + ']'));
  const maximumReversibleAmount = roundMoney(paidCommissionAmount - priorReversalAmount);
  const approvedReversalAmount = item.approved_for_reversal === true
    ? roundMoney(Math.min(reversalRequestedAmount, maximumReversibleAmount))
    : 0;
  const unreversedRequestedAmount = roundMoney(reversalRequestedAmount - approvedReversalAmount);
  const reviewNote = item.review_note === undefined ? undefined : requireNonEmpty(item.review_note, prefix + '.review_note');
  const outcome: CommissionClawbackReversalOutcome = item.approved_for_reversal !== true || approvedReversalAmount === 0
    ? "REVERSAL_REQUIRES_REVIEW"
    : unreversedRequestedAmount > 0
      ? "PARTIAL_REVERSAL_READY"
      : "FULL_REVERSAL_READY";

  return {
    commission_receipt_ref: commissionReceiptRef,
    employee_ref: employeeRef,
    commission_plan_ref: commissionPlanRef,
    reason,
    currency: itemCurrency,
    original_commission_amount: originalCommissionAmount,
    paid_commission_amount: paidCommissionAmount,
    prior_reversal_amount: priorReversalAmount,
    reversal_requested_amount: reversalRequestedAmount,
    maximum_reversible_amount: maximumReversibleAmount,
    approved_reversal_amount: approvedReversalAmount,
    unreversed_requested_amount: unreversedRequestedAmount,
    outcome,
    source_evidence_ref: sourceEvidenceRef,
    ...(outcome === "REVERSAL_REQUIRES_REVIEW" || reviewNote !== undefined ? { review_note: reviewNote ?? 'reversal is not approved or has no reversible balance' } : {}),
    evidence_refs: evidenceRefs,
  };
}

export function evaluateCommissionClawbackReversal(input: CommissionClawbackReversalInput): CommissionClawbackReversalReceipt {
  rejectForbiddenMutation(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const reversalBatchRef = requireNonEmpty(input.reversal_batch_ref, 'reversal_batch_ref');
  const periodRef = requireNonEmpty(input.period_ref, 'period_ref');
  const currency = requireCurrency(input.currency, 'currency');
  const evaluatedByUserId = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');

  if (!Array.isArray(input.reversal_items)) {
    throw new Error('reversal_items must be an array for commission_clawback_reversal.');
  }

  const plannedReversals = input.reversal_items.map((item, index) => buildPlanItem(item, index, currency));

  let fullReversalCount = 0;
  let partialReversalCount = 0;
  let reviewReversalCount = 0;
  let requestedReversalAmountTotal = 0;
  let approvedReversalAmountTotal = 0;
  let unreversedRequestedAmountTotal = 0;

  for (const item of plannedReversals) {
    requestedReversalAmountTotal = roundMoney(requestedReversalAmountTotal + item.reversal_requested_amount);
    approvedReversalAmountTotal = roundMoney(approvedReversalAmountTotal + item.approved_reversal_amount);
    unreversedRequestedAmountTotal = roundMoney(unreversedRequestedAmountTotal + item.unreversed_requested_amount);
    if (item.outcome === "FULL_REVERSAL_READY") {
      fullReversalCount += 1;
    } else if (item.outcome === "PARTIAL_REVERSAL_READY") {
      partialReversalCount += 1;
    } else {
      reviewReversalCount += 1;
    }
  }

  const hasApprovedReversal = fullReversalCount + partialReversalCount > 0;
  const decision: CommissionClawbackReversalDecision = hasApprovedReversal
    ? reviewReversalCount > 0 || partialReversalCount > 0
      ? "CLAWBACK_REVERSAL_PARTIAL"
      : "CLAWBACK_REVERSAL_READY"
    : "CLAWBACK_REVERSAL_REQUIRES_REVIEW";

  const receiptWithoutDigest: ReceiptWithoutDigest = {
    seed_id: PHASE_6C_COMMISSION_CLAWBACK_REVERSAL_SEED_ID,
    component_id: PHASE_6C_COMMISSION_CLAWBACK_REVERSAL_COMPONENT_ID,
    component_slug: "hr_performance_commission_policy_and_offboarding",
    model_name: "Phase6CCommissionClawbackReversal",
    event_name: COMMISSION_CLAWBACK_REVERSAL_EVALUATED_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    reversal_batch_ref: reversalBatchRef,
    period_ref: periodRef,
    currency,
    reversal_item_count: plannedReversals.length,
    full_reversal_count: fullReversalCount,
    partial_reversal_count: partialReversalCount,
    review_reversal_count: reviewReversalCount,
    requested_reversal_amount_total: roundMoney(requestedReversalAmountTotal),
    approved_reversal_amount_total: roundMoney(approvedReversalAmountTotal),
    unreversed_requested_amount_total: roundMoney(unreversedRequestedAmountTotal),
    decision,
    planned_reversals: plannedReversals,
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
    clawback_reversal_digest: digestReceipt(receiptWithoutDigest),
  };
}
