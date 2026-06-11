import { createHash } from 'node:crypto';

export const PHASE_6C_COMMISSION_POOL_DISTRIBUTION_SEED_ID = "seed_6c_047_commission_pool_distribution" as const;
export const PHASE_6C_COMMISSION_POOL_DISTRIBUTION_COMPONENT_ID = "6C.04" as const;
export const COMMISSION_POOL_DISTRIBUTION_EVALUATED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.commission_pool_distribution.evaluated" as const;

export type CommissionPoolDistributionOutcome =
  | "ALLOCATED"
  | "CAPPED"
  | "INELIGIBLE"
  | "REQUIRES_REVIEW";

export type CommissionPoolDistributionDecision =
  | "POOL_DISTRIBUTION_READY"
  | "POOL_DISTRIBUTION_PARTIAL"
  | "POOL_DISTRIBUTION_REQUIRES_REVIEW";

export type CommissionPoolParticipant = {
  employee_ref: string;
  commission_plan_ref: string;
  eligibility_weight: number;
  eligible: boolean;
  minimum_guarantee_amount?: number;
  maximum_distribution_amount?: number;
  evidence_refs: readonly string[];
};

export type CommissionPoolDistributionInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  pool_ref: string;
  period_ref: string;
  currency: string;
  pool_amount: number;
  participants: readonly CommissionPoolParticipant[];
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

export type CommissionPoolDistributionLine = {
  employee_ref: string;
  commission_plan_ref: string;
  eligibility_weight: number;
  minimum_guarantee_amount: number;
  maximum_distribution_amount: number | null;
  allocated_amount: number;
  outcome: CommissionPoolDistributionOutcome;
  evidence_refs: readonly string[];
};

export type CommissionPoolDistributionReceipt = {
  seed_id: typeof PHASE_6C_COMMISSION_POOL_DISTRIBUTION_SEED_ID;
  component_id: typeof PHASE_6C_COMMISSION_POOL_DISTRIBUTION_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6CCommissionPoolDistribution";
  event_name: typeof COMMISSION_POOL_DISTRIBUTION_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  pool_ref: string;
  period_ref: string;
  currency: string;
  pool_amount: number;
  participant_count: number;
  eligible_participant_count: number;
  allocated_amount_total: number;
  undistributed_amount: number;
  capped_participant_count: number;
  decision: CommissionPoolDistributionDecision;
  distribution_lines: readonly CommissionPoolDistributionLine[];
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
  pool_distribution_digest: string;
};

type ReceiptWithoutDigest = Omit<CommissionPoolDistributionReceipt, 'pool_distribution_digest'>;
type NormalizedParticipant = CommissionPoolParticipant & {
  employee_ref: string;
  commission_plan_ref: string;
  minimum_guarantee_amount: number;
  maximum_distribution_amount?: number;
  evidence_refs: readonly string[];
};

const DECISION_REFS = ["6C-HR-OPS-006"] as const;
const EVIDENCE_ARTIFACTS = [
  "commission_pool_distribution_runtime_receipt",
  "weighted_distribution_lines",
  "undistributed_pool_evidence",
  "deterministic_pool_distribution_digest",
] as const;
const MONEY_SCALE = 100;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for commission_pool_distribution.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for commission_pool_distribution.');
  }
  return normalized;
}

function requireCurrency(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field).toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new Error(field + ' must be a three-letter ISO currency code for commission_pool_distribution.');
  }
  return normalized;
}

function requireNonNegativeFinite(value: number | undefined, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(field + ' must be a non-negative finite number for commission_pool_distribution.');
  }
  return value;
}

function requirePositiveWeight(value: number | undefined, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new Error(field + ' must be a positive finite number for commission_pool_distribution.');
  }
  return value;
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * MONEY_SCALE) / MONEY_SCALE;
}

function toCents(value: number): number {
  return Math.round(roundMoney(value) * MONEY_SCALE);
}

function fromCents(value: number): number {
  return roundMoney(value / MONEY_SCALE);
}

function rejectForbiddenMutation(input: CommissionPoolDistributionInput): void {
  const forbiddenRequests: Array<[keyof CommissionPoolDistributionInput, string]> = [
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
      throw new Error('commission_pool_distribution must not perform ' + label + '.');
    }
  }
}

function digestReceipt(receiptWithoutDigest: ReceiptWithoutDigest): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function normalizeParticipants(participants: readonly CommissionPoolParticipant[]): NormalizedParticipant[] {
  if (!Array.isArray(participants)) {
    throw new Error('participants must be an array for commission_pool_distribution.');
  }

  return participants.map((participant, index) => {
    const prefix = 'participants[' + index + ']';
    if (!Array.isArray(participant.evidence_refs) || participant.evidence_refs.length === 0) {
      throw new Error(prefix + '.evidence_refs must contain at least one evidence reference for commission_pool_distribution.');
    }
    const maximumDistributionAmount = participant.maximum_distribution_amount === undefined
      ? undefined
      : requireNonNegativeFinite(participant.maximum_distribution_amount, prefix + '.maximum_distribution_amount');
    const minimumGuaranteeAmount = requireNonNegativeFinite(participant.minimum_guarantee_amount ?? 0, prefix + '.minimum_guarantee_amount');
    if (maximumDistributionAmount !== undefined && minimumGuaranteeAmount > maximumDistributionAmount) {
      throw new Error(prefix + '.minimum_guarantee_amount must not exceed maximum_distribution_amount for commission_pool_distribution.');
    }

    return {
      employee_ref: requireNonEmpty(participant.employee_ref, prefix + '.employee_ref'),
      commission_plan_ref: requireNonEmpty(participant.commission_plan_ref, prefix + '.commission_plan_ref'),
      eligibility_weight: requirePositiveWeight(participant.eligibility_weight, prefix + '.eligibility_weight'),
      eligible: participant.eligible === true,
      minimum_guarantee_amount: minimumGuaranteeAmount,
      maximum_distribution_amount: maximumDistributionAmount,
      evidence_refs: participant.evidence_refs.map((ref: string, refIndex: number) => requireNonEmpty(ref, prefix + '.evidence_refs[' + refIndex + ']')),
    };
  });
}

function buildReviewLines(participants: readonly NormalizedParticipant[]): CommissionPoolDistributionLine[] {
  return participants.map((participant) => ({
    employee_ref: participant.employee_ref,
    commission_plan_ref: participant.commission_plan_ref,
    eligibility_weight: participant.eligibility_weight,
    minimum_guarantee_amount: roundMoney(participant.minimum_guarantee_amount),
    maximum_distribution_amount: participant.maximum_distribution_amount === undefined ? null : roundMoney(participant.maximum_distribution_amount),
    allocated_amount: 0,
    outcome: participant.eligible ? "REQUIRES_REVIEW" : "INELIGIBLE",
    evidence_refs: participant.evidence_refs,
  }));
}

export function distributeCommissionPool(input: CommissionPoolDistributionInput): CommissionPoolDistributionReceipt {
  rejectForbiddenMutation(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const poolRef = requireNonEmpty(input.pool_ref, 'pool_ref');
  const periodRef = requireNonEmpty(input.period_ref, 'period_ref');
  const currency = requireCurrency(input.currency, 'currency');
  const poolAmount = roundMoney(requireNonNegativeFinite(input.pool_amount, 'pool_amount'));
  const evaluatedByUserId = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const participants = normalizeParticipants(input.participants);
  const eligibleParticipants = participants.filter((participant) => participant.eligible);
  const poolCents = toCents(poolAmount);
  const guaranteeCents = eligibleParticipants.reduce((sum, participant) => sum + toCents(participant.minimum_guarantee_amount), 0);

  let distributionLines: CommissionPoolDistributionLine[];
  let decision: CommissionPoolDistributionDecision;

  if (eligibleParticipants.length === 0 || guaranteeCents > poolCents) {
    distributionLines = buildReviewLines(participants);
    decision = "POOL_DISTRIBUTION_REQUIRES_REVIEW";
  } else {
    const totalWeight = eligibleParticipants.reduce((sum, participant) => sum + participant.eligibility_weight, 0);
    let allocatedCentsTotal = 0;
    const remainingCents = poolCents - guaranteeCents;
    const allocationDrafts = eligibleParticipants.map((participant, index) => {
      const exactVariableShare = (remainingCents * participant.eligibility_weight) / totalWeight;
      const floorVariableShare = Math.floor(exactVariableShare);
      allocatedCentsTotal += toCents(participant.minimum_guarantee_amount) + floorVariableShare;
      return {
        participant,
        index,
        variableShareCents: floorVariableShare,
        remainder: exactVariableShare - floorVariableShare,
      };
    });

    let residualCents = poolCents - allocatedCentsTotal;
    allocationDrafts
      .slice()
      .sort((a, b) => b.remainder - a.remainder || a.index - b.index)
      .forEach((draft) => {
        if (residualCents > 0) {
          draft.variableShareCents += 1;
          residualCents -= 1;
        }
      });

    const allocationsByEmployee = new Map<string, { amountCents: number; outcome: CommissionPoolDistributionOutcome }>();
    for (const draft of allocationDrafts) {
      const uncappedAmountCents = toCents(draft.participant.minimum_guarantee_amount) + draft.variableShareCents;
      const maxCents = draft.participant.maximum_distribution_amount === undefined ? undefined : toCents(draft.participant.maximum_distribution_amount);
      const cappedAmountCents = maxCents === undefined ? uncappedAmountCents : Math.min(uncappedAmountCents, maxCents);
      allocationsByEmployee.set(draft.participant.employee_ref, {
        amountCents: cappedAmountCents,
        outcome: cappedAmountCents < uncappedAmountCents ? "CAPPED" : "ALLOCATED",
      });
    }

    distributionLines = participants.map((participant) => {
      const allocation = allocationsByEmployee.get(participant.employee_ref);
      return {
        employee_ref: participant.employee_ref,
        commission_plan_ref: participant.commission_plan_ref,
        eligibility_weight: participant.eligibility_weight,
        minimum_guarantee_amount: roundMoney(participant.minimum_guarantee_amount),
        maximum_distribution_amount: participant.maximum_distribution_amount === undefined ? null : roundMoney(participant.maximum_distribution_amount),
        allocated_amount: allocation === undefined ? 0 : fromCents(allocation.amountCents),
        outcome: allocation === undefined ? "INELIGIBLE" : allocation.outcome,
        evidence_refs: participant.evidence_refs,
      };
    });

    const allocatedCents = distributionLines.reduce((sum, line) => sum + toCents(line.allocated_amount), 0);
    const hasCapped = distributionLines.some((line) => line.outcome === "CAPPED");
    decision = allocatedCents === poolCents && !hasCapped
      ? "POOL_DISTRIBUTION_READY"
      : "POOL_DISTRIBUTION_PARTIAL";
  }

  const allocatedAmountTotal = roundMoney(distributionLines.reduce((sum, line) => sum + line.allocated_amount, 0));
  const undistributedAmount = roundMoney(poolAmount - allocatedAmountTotal);
  const cappedParticipantCount = distributionLines.filter((line) => line.outcome === "CAPPED").length;
  const receiptWithoutDigest: ReceiptWithoutDigest = {
    seed_id: PHASE_6C_COMMISSION_POOL_DISTRIBUTION_SEED_ID,
    component_id: PHASE_6C_COMMISSION_POOL_DISTRIBUTION_COMPONENT_ID,
    component_slug: "hr_performance_commission_policy_and_offboarding",
    model_name: "Phase6CCommissionPoolDistribution",
    event_name: COMMISSION_POOL_DISTRIBUTION_EVALUATED_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    pool_ref: poolRef,
    period_ref: periodRef,
    currency,
    pool_amount: poolAmount,
    participant_count: participants.length,
    eligible_participant_count: eligibleParticipants.length,
    allocated_amount_total: allocatedAmountTotal,
    undistributed_amount: undistributedAmount,
    capped_participant_count: cappedParticipantCount,
    decision,
    distribution_lines: distributionLines,
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
    pool_distribution_digest: digestReceipt(receiptWithoutDigest),
  };
}
