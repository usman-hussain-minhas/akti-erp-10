import { createHash } from 'node:crypto';

export const PHASE_6C_COMMISSION_DEFERRED_RELEASE_SEED_ID = "seed_6c_044_commission_deferred_release" as const;
export const PHASE_6C_COMMISSION_DEFERRED_RELEASE_COMPONENT_ID = "6C.04" as const;
export const COMMISSION_DEFERRED_RELEASE_SCHEDULED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.commission_deferred_release.scheduled" as const;

export type CommissionDeferredReleaseCadence =
  | "IMMEDIATE"
  | "MONTHLY"
  | "QUARTERLY"
  | "MILESTONE"
  | "HOLD_UNTIL_DATE";

export type CommissionDeferredReleaseOutcome =
  | "READY_FOR_RELEASE"
  | "SCHEDULED_FOR_FUTURE"
  | "HELD_FOR_REVIEW";

export type CommissionDeferredReleaseDecision =
  | "DEFERRED_RELEASE_PLAN_READY"
  | "DEFERRED_RELEASE_PARTIAL_HOLD"
  | "DEFERRED_RELEASE_REQUIRES_REVIEW";

export type CommissionDeferredReleaseItem = {
  commission_receipt_ref: string;
  employee_ref: string;
  commission_plan_ref: string;
  payable_commission_amount: number;
  currency?: string;
  earned_at: string;
  release_not_before: string;
  cadence: CommissionDeferredReleaseCadence;
  approved_for_release: boolean;
  risk_hold?: boolean;
  hold_reason?: string;
  evidence_refs: readonly string[];
};

export type CommissionDeferredReleaseInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  scheduler_run_ref: string;
  period_ref: string;
  currency: string;
  scheduler_run_at: string;
  release_items: readonly CommissionDeferredReleaseItem[];
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

export type CommissionDeferredReleasePlanItem = {
  commission_receipt_ref: string;
  employee_ref: string;
  commission_plan_ref: string;
  payable_commission_amount: number;
  currency: string;
  cadence: CommissionDeferredReleaseCadence;
  release_at: string;
  outcome: CommissionDeferredReleaseOutcome;
  hold_reason?: string;
  evidence_refs: readonly string[];
};

export type CommissionDeferredReleaseReceipt = {
  seed_id: typeof PHASE_6C_COMMISSION_DEFERRED_RELEASE_SEED_ID;
  component_id: typeof PHASE_6C_COMMISSION_DEFERRED_RELEASE_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6CCommissionDeferredRelease";
  event_name: typeof COMMISSION_DEFERRED_RELEASE_SCHEDULED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  scheduler_run_ref: string;
  period_ref: string;
  currency: string;
  release_item_count: number;
  ready_release_count: number;
  future_release_count: number;
  held_release_count: number;
  ready_release_amount: number;
  future_release_amount: number;
  held_release_amount: number;
  next_release_at: string | null;
  decision: CommissionDeferredReleaseDecision;
  planned_releases: readonly CommissionDeferredReleasePlanItem[];
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
  release_schedule_digest: string;
};

type ReceiptWithoutDigest = Omit<CommissionDeferredReleaseReceipt, 'release_schedule_digest'>;

const DECISION_REFS = ["6C-HR-OPS-006"] as const;
const EVIDENCE_ARTIFACTS = [
  "commission_deferred_release_runtime_receipt",
  "planned_release_schedule",
  "held_release_review_evidence",
  "deterministic_release_schedule_digest",
] as const;
const MONEY_SCALE = 100;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for commission_deferred_release.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for commission_deferred_release.');
  }
  return normalized;
}

function requireCurrency(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field).toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new Error(field + ' must be a three-letter ISO currency code for commission_deferred_release.');
  }
  return normalized;
}

function requireNonNegativeFinite(value: number | undefined, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(field + ' must be a non-negative finite number for commission_deferred_release.');
  }
  return value;
}

function requireCadence(value: CommissionDeferredReleaseCadence | undefined, field: string): CommissionDeferredReleaseCadence {
  if (
    value !== "IMMEDIATE" &&
    value !== "MONTHLY" &&
    value !== "QUARTERLY" &&
    value !== "MILESTONE" &&
    value !== "HOLD_UNTIL_DATE"
  ) {
    throw new Error(field + ' must be a supported release cadence for commission_deferred_release.');
  }
  return value;
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * MONEY_SCALE) / MONEY_SCALE;
}

function rejectForbiddenMutation(input: CommissionDeferredReleaseInput): void {
  const forbiddenRequests: Array<[keyof CommissionDeferredReleaseInput, string]> = [
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
      throw new Error('commission_deferred_release must not perform ' + label + '.');
    }
  }
}

function digestReceipt(receiptWithoutDigest: ReceiptWithoutDigest): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function buildPlanItem(
  item: CommissionDeferredReleaseItem,
  index: number,
  currency: string,
  schedulerRunMs: number,
): CommissionDeferredReleasePlanItem {
  const prefix = 'release_items[' + index + ']';
  const commissionReceiptRef = requireNonEmpty(item.commission_receipt_ref, prefix + '.commission_receipt_ref');
  const employeeRef = requireNonEmpty(item.employee_ref, prefix + '.employee_ref');
  const commissionPlanRef = requireNonEmpty(item.commission_plan_ref, prefix + '.commission_plan_ref');
  const itemCurrency = item.currency === undefined ? currency : requireCurrency(item.currency, prefix + '.currency');
  if (itemCurrency !== currency) {
    throw new Error(prefix + '.currency must match commission_deferred_release currency.');
  }

  const payableCommissionAmount = roundMoney(requireNonNegativeFinite(item.payable_commission_amount, prefix + '.payable_commission_amount'));
  requireTimestamp(item.earned_at, prefix + '.earned_at');
  const releaseAt = requireTimestamp(item.release_not_before, prefix + '.release_not_before');

  if (!Array.isArray(item.evidence_refs) || item.evidence_refs.length === 0) {
    throw new Error(prefix + '.evidence_refs must contain at least one evidence reference for commission_deferred_release.');
  }
  const evidenceRefs = item.evidence_refs.map((ref, refIndex) => requireNonEmpty(ref, prefix + '.evidence_refs[' + refIndex + ']'));

  const holdReason = item.hold_reason === undefined ? undefined : requireNonEmpty(item.hold_reason, prefix + '.hold_reason');
  const held = item.approved_for_release !== true || item.risk_hold === true;
  const releaseMs = Date.parse(releaseAt);
  const outcome: CommissionDeferredReleaseOutcome = held
    ? "HELD_FOR_REVIEW"
    : releaseMs <= schedulerRunMs
      ? "READY_FOR_RELEASE"
      : "SCHEDULED_FOR_FUTURE";

  return {
    commission_receipt_ref: commissionReceiptRef,
    employee_ref: employeeRef,
    commission_plan_ref: commissionPlanRef,
    payable_commission_amount: payableCommissionAmount,
    currency: itemCurrency,
    cadence: requireCadence(item.cadence, prefix + '.cadence'),
    release_at: releaseAt,
    outcome,
    ...(held ? { hold_reason: holdReason ?? 'release item is not approved or is under risk hold' } : {}),
    evidence_refs: evidenceRefs,
  };
}

export function scheduleDeferredCommissionRelease(input: CommissionDeferredReleaseInput): CommissionDeferredReleaseReceipt {
  rejectForbiddenMutation(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const schedulerRunRef = requireNonEmpty(input.scheduler_run_ref, 'scheduler_run_ref');
  const periodRef = requireNonEmpty(input.period_ref, 'period_ref');
  const currency = requireCurrency(input.currency, 'currency');
  const schedulerRunAt = requireTimestamp(input.scheduler_run_at, 'scheduler_run_at');
  const evaluatedByUserId = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');

  if (!Array.isArray(input.release_items)) {
    throw new Error('release_items must be an array for commission_deferred_release.');
  }

  const schedulerRunMs = Date.parse(schedulerRunAt);
  const plannedReleases = input.release_items.map((item, index) => buildPlanItem(item, index, currency, schedulerRunMs));

  let readyReleaseCount = 0;
  let futureReleaseCount = 0;
  let heldReleaseCount = 0;
  let readyReleaseAmount = 0;
  let futureReleaseAmount = 0;
  let heldReleaseAmount = 0;
  const eligibleReleaseDates: string[] = [];

  for (const item of plannedReleases) {
    if (item.outcome === "READY_FOR_RELEASE") {
      readyReleaseCount += 1;
      readyReleaseAmount = roundMoney(readyReleaseAmount + item.payable_commission_amount);
      eligibleReleaseDates.push(item.release_at);
    } else if (item.outcome === "SCHEDULED_FOR_FUTURE") {
      futureReleaseCount += 1;
      futureReleaseAmount = roundMoney(futureReleaseAmount + item.payable_commission_amount);
      eligibleReleaseDates.push(item.release_at);
    } else {
      heldReleaseCount += 1;
      heldReleaseAmount = roundMoney(heldReleaseAmount + item.payable_commission_amount);
    }
  }

  const hasReleasePlan = readyReleaseCount + futureReleaseCount > 0;
  const decision: CommissionDeferredReleaseDecision = hasReleasePlan
    ? heldReleaseCount > 0
      ? "DEFERRED_RELEASE_PARTIAL_HOLD"
      : "DEFERRED_RELEASE_PLAN_READY"
    : "DEFERRED_RELEASE_REQUIRES_REVIEW";
  const nextReleaseAt = eligibleReleaseDates.length === 0
    ? null
    : eligibleReleaseDates.sort((a, b) => Date.parse(a) - Date.parse(b))[0];

  const receiptWithoutDigest: ReceiptWithoutDigest = {
    seed_id: PHASE_6C_COMMISSION_DEFERRED_RELEASE_SEED_ID,
    component_id: PHASE_6C_COMMISSION_DEFERRED_RELEASE_COMPONENT_ID,
    component_slug: "hr_performance_commission_policy_and_offboarding",
    model_name: "Phase6CCommissionDeferredRelease",
    event_name: COMMISSION_DEFERRED_RELEASE_SCHEDULED_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    scheduler_run_ref: schedulerRunRef,
    period_ref: periodRef,
    currency,
    release_item_count: plannedReleases.length,
    ready_release_count: readyReleaseCount,
    future_release_count: futureReleaseCount,
    held_release_count: heldReleaseCount,
    ready_release_amount: roundMoney(readyReleaseAmount),
    future_release_amount: roundMoney(futureReleaseAmount),
    held_release_amount: roundMoney(heldReleaseAmount),
    next_release_at: nextReleaseAt,
    decision,
    planned_releases: plannedReleases,
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
    release_schedule_digest: digestReceipt(receiptWithoutDigest),
  };
}
