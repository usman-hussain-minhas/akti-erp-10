import { createHash } from 'node:crypto';

export const PHASE_6C_LEAVE_CARRYFORWARD_EXPIRY_SEED_ID = "seed_6c_035_leave_carryforward_expiry" as const;
export const PHASE_6C_LEAVE_CARRYFORWARD_EXPIRY_COMPONENT_ID = "6C.03" as const;
export const LEAVE_CARRYFORWARD_EXPIRY_EVALUATED_EVENT = "phase_6c.hr_attendance_leave_and_time_tracking.leave_carryforward_expiry.evaluated" as const;

export type LeaveCarryforwardExpiryPolicy = "NO_CARRY_FORWARD" | "FULL_CARRY_FORWARD" | "CAPPED_CARRY_FORWARD" | "EXPIRY_DATE_CAPPED";
export type LeaveCarryforwardExpiryDecision = "NO_CARRY_FORWARD_ALLOWED" | "CARRY_FORWARD_APPLIED" | "CARRY_FORWARD_CAPPED" | "CARRY_FORWARD_EXPIRED";

export type LeaveCarryforwardExpiryInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  leave_type_ref: string;
  policy_ref: string;
  policy: LeaveCarryforwardExpiryPolicy;
  source_period_start: string;
  source_period_end: string;
  target_period_start: string;
  available_balance_units: number;
  already_carried_forward_units: number;
  max_carryforward_units?: number;
  expiry_date?: string;
  evaluation_date: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  balance_mutation_requested?: boolean;
  payroll_mutation_requested?: boolean;
  provider_specific_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type LeaveCarryforwardExpiryReceipt = {
  seed_id: typeof PHASE_6C_LEAVE_CARRYFORWARD_EXPIRY_SEED_ID;
  component_id: typeof PHASE_6C_LEAVE_CARRYFORWARD_EXPIRY_COMPONENT_ID;
  component_slug: "hr_attendance_leave_and_time_tracking";
  model_name: "Phase6CLeaveCarryforwardExpiry";
  event_name: typeof LEAVE_CARRYFORWARD_EXPIRY_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  leave_type_ref: string;
  policy_ref: string;
  policy: LeaveCarryforwardExpiryPolicy;
  source_period_start: string;
  source_period_end: string;
  target_period_start: string;
  available_balance_units: number;
  already_carried_forward_units: number;
  max_carryforward_units: number | null;
  expiry_date: string | null;
  evaluation_date: string;
  eligible_balance_units: number;
  carryforward_units: number;
  capped_units: number;
  expired_units: number;
  forfeited_units: number;
  decision: LeaveCarryforwardExpiryDecision;
  balance_mutation_allowed: false;
  payroll_mutation_allowed: false;
  provider_neutral_only: true;
  runtime_status: "LEAVE_CARRYFORWARD_EXPIRY_EVALUATED";
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  leave_carryforward_expiry_evidence_digest: string;
};

const VALID_POLICIES: readonly LeaveCarryforwardExpiryPolicy[] = ["NO_CARRY_FORWARD", "FULL_CARRY_FORWARD", "CAPPED_CARRY_FORWARD", "EXPIRY_DATE_CAPPED"];
const DECISION_REFS = ["6C-ATT-015"] as const;
const EVIDENCE_ARTIFACTS = [
  "leave_carryforward_expiry_decision_receipt",
  "leave_carryforward_cap_evidence",
  "leave_expiry_forfeiture_evidence",
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for leave_carryforward_expiry.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for leave_carryforward_expiry.');
  }
  return normalized;
}

function requireDate(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error(field + ' must use YYYY-MM-DD format for leave_carryforward_expiry.');
  }
  return normalized;
}

function requireNonNegativeNumber(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(field + ' must be a non-negative finite number for leave_carryforward_expiry.');
  }
  return value;
}

function requirePositiveNumber(value: number | undefined, field: string): number {
  if (value === undefined || !Number.isFinite(value) || value <= 0) {
    throw new Error(field + ' must be a positive finite number for leave_carryforward_expiry.');
  }
  return value;
}

function optionalPositiveNumber(value: number | undefined, field: string): number | null {
  if (value === undefined) {
    return null;
  }
  return requirePositiveNumber(value, field);
}

function requirePolicy(value: LeaveCarryforwardExpiryPolicy): LeaveCarryforwardExpiryPolicy {
  if (!VALID_POLICIES.includes(value)) {
    throw new Error('policy is not allowed for leave_carryforward_expiry.');
  }
  return value;
}

function rejectForbiddenRequests(input: LeaveCarryforwardExpiryInput): void {
  const forbiddenFlags: Array<[keyof LeaveCarryforwardExpiryInput, string]> = [
    ['balance_mutation_requested', 'leave_carryforward_expiry must emit carry-forward evidence and must not mutate leave balances directly.'],
    ['payroll_mutation_requested', 'leave_carryforward_expiry must not mutate payroll surfaces.'],
    ['provider_specific_adapter_requested', 'leave_carryforward_expiry must remain provider-neutral.'],
    ['schema_mutation_requested', 'leave_carryforward_expiry must not request schema mutation.'],
    ['phase_6a_mutation_requested', 'leave_carryforward_expiry must not mutate Phase 6A surfaces.'],
    ['phase_6b_mutation_requested', 'leave_carryforward_expiry must not mutate Phase 6B surfaces.'],
    ['runtime_adapter_requested', 'leave_carryforward_expiry must not execute runtime adapters.'],
    ['ticket_flag_flip_requested', 'leave_carryforward_expiry must not flip ticket authorization flags.'],
  ];

  for (const [flag, message] of forbiddenFlags) {
    if (input[flag] === true) {
      throw new Error(message);
    }
  }
}

function digestCarryforward(receiptWithoutDigest: Omit<LeaveCarryforwardExpiryReceipt, 'leave_carryforward_expiry_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function compareIsoDate(left: string, right: string): number {
  return Date.parse(left + 'T00:00:00.000Z') - Date.parse(right + 'T00:00:00.000Z');
}

function assertPeriodOrder(sourceStart: string, sourceEnd: string, targetStart: string): void {
  if (compareIsoDate(sourceStart, sourceEnd) > 0) {
    throw new Error('source_period_start must be on or before source_period_end for leave_carryforward_expiry.');
  }
  if (compareIsoDate(sourceEnd, targetStart) >= 0) {
    throw new Error('target_period_start must be after source_period_end for leave_carryforward_expiry.');
  }
}

export function evaluateLeaveCarryforwardExpiry(input: LeaveCarryforwardExpiryInput): LeaveCarryforwardExpiryReceipt {
  rejectForbiddenRequests(input);

  const policy = requirePolicy(input.policy);
  const sourcePeriodStart = requireDate(input.source_period_start, 'source_period_start');
  const sourcePeriodEnd = requireDate(input.source_period_end, 'source_period_end');
  const targetPeriodStart = requireDate(input.target_period_start, 'target_period_start');
  const evaluationDate = requireDate(input.evaluation_date, 'evaluation_date');
  assertPeriodOrder(sourcePeriodStart, sourcePeriodEnd, targetPeriodStart);

  const availableBalanceUnits = requireNonNegativeNumber(input.available_balance_units, 'available_balance_units');
  const alreadyCarriedForwardUnits = requireNonNegativeNumber(input.already_carried_forward_units, 'already_carried_forward_units');
  if (alreadyCarriedForwardUnits > availableBalanceUnits) {
    throw new Error('already_carried_forward_units cannot exceed available_balance_units for leave_carryforward_expiry.');
  }

  const remainingEligibleUnits = Number((availableBalanceUnits - alreadyCarriedForwardUnits).toFixed(6));
  const maxCarryforwardUnits = optionalPositiveNumber(input.max_carryforward_units, 'max_carryforward_units');
  const expiryDate = input.expiry_date === undefined ? null : requireDate(input.expiry_date, 'expiry_date');
  const isExpired = expiryDate !== null && compareIsoDate(evaluationDate, expiryDate) > 0;

  let carryforwardUnits = 0;
  let cappedUnits = 0;
  let expiredUnits = 0;
  let decision: LeaveCarryforwardExpiryDecision = "NO_CARRY_FORWARD_ALLOWED";

  if (policy === "NO_CARRY_FORWARD") {
    carryforwardUnits = 0;
    decision = "NO_CARRY_FORWARD_ALLOWED";
  } else if (policy === "EXPIRY_DATE_CAPPED" && isExpired) {
    expiredUnits = remainingEligibleUnits;
    decision = "CARRY_FORWARD_EXPIRED";
  } else if (policy === "FULL_CARRY_FORWARD") {
    carryforwardUnits = remainingEligibleUnits;
    decision = carryforwardUnits > 0 ? "CARRY_FORWARD_APPLIED" : "NO_CARRY_FORWARD_ALLOWED";
  } else {
    if (maxCarryforwardUnits === null) {
      throw new Error('max_carryforward_units is required for capped carry-forward policy.');
    }
    carryforwardUnits = Math.min(remainingEligibleUnits, maxCarryforwardUnits);
    cappedUnits = Math.max(0, remainingEligibleUnits - carryforwardUnits);
    decision = cappedUnits > 0 ? "CARRY_FORWARD_CAPPED" : carryforwardUnits > 0 ? "CARRY_FORWARD_APPLIED" : "NO_CARRY_FORWARD_ALLOWED";
  }

  const forfeitedUnits = Number((remainingEligibleUnits - carryforwardUnits).toFixed(6));

  const receiptWithoutDigest: Omit<LeaveCarryforwardExpiryReceipt, 'leave_carryforward_expiry_evidence_digest'> = {
    seed_id: PHASE_6C_LEAVE_CARRYFORWARD_EXPIRY_SEED_ID,
    component_id: PHASE_6C_LEAVE_CARRYFORWARD_EXPIRY_COMPONENT_ID,
    component_slug: "hr_attendance_leave_and_time_tracking",
    model_name: "Phase6CLeaveCarryforwardExpiry",
    event_name: LEAVE_CARRYFORWARD_EXPIRY_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    employee_ref: requireNonEmpty(input.employee_ref, 'employee_ref'),
    leave_type_ref: requireNonEmpty(input.leave_type_ref, 'leave_type_ref'),
    policy_ref: requireNonEmpty(input.policy_ref, 'policy_ref'),
    policy,
    source_period_start: sourcePeriodStart,
    source_period_end: sourcePeriodEnd,
    target_period_start: targetPeriodStart,
    available_balance_units: availableBalanceUnits,
    already_carried_forward_units: alreadyCarriedForwardUnits,
    max_carryforward_units: maxCarryforwardUnits,
    expiry_date: expiryDate,
    evaluation_date: evaluationDate,
    eligible_balance_units: remainingEligibleUnits,
    carryforward_units: Number(carryforwardUnits.toFixed(6)),
    capped_units: Number(cappedUnits.toFixed(6)),
    expired_units: Number(expiredUnits.toFixed(6)),
    forfeited_units: forfeitedUnits,
    decision,
    balance_mutation_allowed: false,
    payroll_mutation_allowed: false,
    provider_neutral_only: true,
    runtime_status: "LEAVE_CARRYFORWARD_EXPIRY_EVALUATED",
    decision_refs: DECISION_REFS,
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    leave_carryforward_expiry_evidence_digest: digestCarryforward(receiptWithoutDigest),
  };
}
