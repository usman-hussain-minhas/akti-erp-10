import { createHash } from 'node:crypto';

export const PHASE_6C_LEAVE_ACCRUAL_ENGINE_SEED_ID = "seed_6c_034_leave_accrual_engine" as const;
export const PHASE_6C_LEAVE_ACCRUAL_ENGINE_COMPONENT_ID = "6C.03" as const;
export const LEAVE_ACCRUAL_ENGINE_EVALUATED_EVENT = "phase_6c.hr_attendance_leave_and_time_tracking.leave_accrual_engine.evaluated" as const;

export type LeaveAccrualFrequency = "MONTHLY" | "PER_PAY_PERIOD" | "ANNUAL_GRANT" | "PRORATED_PERIOD";
export type LeaveAccrualRoundingPolicy = "NONE" | "FLOOR" | "CEILING" | "NEAREST_HALF";
export type LeaveAccrualDecision = "ACCRUAL_CALCULATED" | "ACCRUAL_CAPPED";

export type LeaveAccrualEngineInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  leave_type_ref: string;
  accrual_rule_ref: string;
  accrual_frequency: LeaveAccrualFrequency;
  accrual_period_start: string;
  accrual_period_end: string;
  annual_entitlement_units: number;
  opening_balance_units: number;
  used_units: number;
  carry_forward_units: number;
  max_balance_units?: number;
  pay_periods_in_year?: number;
  completed_pay_periods?: number;
  period_year_days?: number;
  rounding_policy: LeaveAccrualRoundingPolicy;
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  direct_balance_mutation_requested?: boolean;
  provider_specific_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type LeaveAccrualEngineReceipt = {
  seed_id: typeof PHASE_6C_LEAVE_ACCRUAL_ENGINE_SEED_ID;
  component_id: typeof PHASE_6C_LEAVE_ACCRUAL_ENGINE_COMPONENT_ID;
  component_slug: "hr_attendance_leave_and_time_tracking";
  model_name: "Phase6CLeaveAccrualEngine";
  event_name: typeof LEAVE_ACCRUAL_ENGINE_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  leave_type_ref: string;
  accrual_rule_ref: string;
  accrual_frequency: LeaveAccrualFrequency;
  accrual_period_start: string;
  accrual_period_end: string;
  annual_entitlement_units: number;
  opening_balance_units: number;
  used_units: number;
  carry_forward_units: number;
  raw_accrual_units: number;
  rounded_accrual_units: number;
  cap_adjustment_units: number;
  projected_balance_units: number;
  max_balance_units: number | null;
  rounding_policy: LeaveAccrualRoundingPolicy;
  decision: LeaveAccrualDecision;
  balance_mutation_allowed: false;
  provider_neutral_only: true;
  runtime_status: "LEAVE_ACCRUAL_ENGINE_EVALUATED";
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  leave_accrual_evidence_digest: string;
};

const VALID_FREQUENCIES: readonly LeaveAccrualFrequency[] = ["MONTHLY", "PER_PAY_PERIOD", "ANNUAL_GRANT", "PRORATED_PERIOD"];
const VALID_ROUNDING: readonly LeaveAccrualRoundingPolicy[] = ["NONE", "FLOOR", "CEILING", "NEAREST_HALF"];
const DECISION_REFS = ["6C-ATT-002", "6C-ATT-014", "6C-ATT-015", "6C-ATT-019"] as const;
const EVIDENCE_ARTIFACTS = [
  "leave_accrual_decision_receipt",
  "leave_accrual_formula_evidence",
  "leave_accrual_cap_evidence",
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for leave_accrual_engine.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for leave_accrual_engine.');
  }
  return normalized;
}

function requireDate(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error(field + ' must use YYYY-MM-DD format for leave_accrual_engine.');
  }
  return normalized;
}

function requireNonNegativeNumber(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(field + ' must be a non-negative finite number for leave_accrual_engine.');
  }
  return value;
}

function requirePositiveNumber(value: number | undefined, field: string): number {
  if (!Number.isFinite(value) || value === undefined || value <= 0) {
    throw new Error(field + ' must be a positive finite number for leave_accrual_engine.');
  }
  return value;
}

function optionalPositiveNumber(value: number | undefined, field: string): number | null {
  if (value === undefined) {
    return null;
  }
  return requirePositiveNumber(value, field);
}

function requireFrequency(value: LeaveAccrualFrequency): LeaveAccrualFrequency {
  if (!VALID_FREQUENCIES.includes(value)) {
    throw new Error('accrual_frequency is not allowed for leave_accrual_engine.');
  }
  return value;
}

function requireRounding(value: LeaveAccrualRoundingPolicy): LeaveAccrualRoundingPolicy {
  if (!VALID_ROUNDING.includes(value)) {
    throw new Error('rounding_policy is not allowed for leave_accrual_engine.');
  }
  return value;
}

function rejectForbiddenRequests(input: LeaveAccrualEngineInput): void {
  const forbiddenFlags: Array<[keyof LeaveAccrualEngineInput, string]> = [
    ['direct_balance_mutation_requested', 'leave_accrual_engine must emit calculation evidence and must not mutate leave balances directly.'],
    ['provider_specific_adapter_requested', 'leave_accrual_engine must remain provider-neutral.'],
    ['schema_mutation_requested', 'leave_accrual_engine must not request schema mutation.'],
    ['phase_6a_mutation_requested', 'leave_accrual_engine must not mutate Phase 6A surfaces.'],
    ['phase_6b_mutation_requested', 'leave_accrual_engine must not mutate Phase 6B surfaces.'],
    ['runtime_adapter_requested', 'leave_accrual_engine must not execute runtime adapters.'],
    ['ticket_flag_flip_requested', 'leave_accrual_engine must not flip ticket authorization flags.'],
  ];

  for (const [flag, message] of forbiddenFlags) {
    if (input[flag] === true) {
      throw new Error(message);
    }
  }
}

function inclusiveDays(startDate: string, endDate: string): number {
  return Math.floor((Date.parse(endDate + 'T00:00:00.000Z') - Date.parse(startDate + 'T00:00:00.000Z')) / 86400000) + 1;
}

function rawAccrual(input: LeaveAccrualEngineInput, annualEntitlementUnits: number): number {
  switch (input.accrual_frequency) {
    case "MONTHLY":
      return annualEntitlementUnits / 12;
    case "PER_PAY_PERIOD": {
      const payPeriods = requirePositiveNumber(input.pay_periods_in_year, 'pay_periods_in_year');
      const completedPayPeriods = requireNonNegativeNumber(input.completed_pay_periods ?? 0, 'completed_pay_periods');
      return (annualEntitlementUnits / payPeriods) * completedPayPeriods;
    }
    case "ANNUAL_GRANT":
      return annualEntitlementUnits;
    case "PRORATED_PERIOD": {
      const yearDays = requirePositiveNumber(input.period_year_days, 'period_year_days');
      const periodDays = inclusiveDays(input.accrual_period_start, input.accrual_period_end);
      return annualEntitlementUnits * (periodDays / yearDays);
    }
  }
}

function roundAccrual(value: number, roundingPolicy: LeaveAccrualRoundingPolicy): number {
  switch (roundingPolicy) {
    case "NONE":
      return Number(value.toFixed(6));
    case "FLOOR":
      return Math.floor(value);
    case "CEILING":
      return Math.ceil(value);
    case "NEAREST_HALF":
      return Math.round(value * 2) / 2;
  }
}

function digestAccrual(receiptWithoutDigest: Omit<LeaveAccrualEngineReceipt, 'leave_accrual_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateLeaveAccrualEngine(input: LeaveAccrualEngineInput): LeaveAccrualEngineReceipt {
  rejectForbiddenRequests(input);

  const periodStart = requireDate(input.accrual_period_start, 'accrual_period_start');
  const periodEnd = requireDate(input.accrual_period_end, 'accrual_period_end');
  if (periodStart > periodEnd) {
    throw new Error('accrual_period_start must be on or before accrual_period_end for leave_accrual_engine.');
  }

  const annualEntitlementUnits = requireNonNegativeNumber(input.annual_entitlement_units, 'annual_entitlement_units');
  const openingBalanceUnits = requireNonNegativeNumber(input.opening_balance_units, 'opening_balance_units');
  const usedUnits = requireNonNegativeNumber(input.used_units, 'used_units');
  const carryForwardUnits = requireNonNegativeNumber(input.carry_forward_units, 'carry_forward_units');
  const maxBalanceUnits = optionalPositiveNumber(input.max_balance_units, 'max_balance_units');
  const frequency = requireFrequency(input.accrual_frequency);
  const roundingPolicy = requireRounding(input.rounding_policy);
  const rawUnits = rawAccrual(input, annualEntitlementUnits);
  const roundedUnits = roundAccrual(rawUnits, roundingPolicy);
  const uncappedProjectedBalance = openingBalanceUnits + carryForwardUnits + roundedUnits - usedUnits;
  const projectedBalanceUnits = maxBalanceUnits === null ? uncappedProjectedBalance : Math.min(uncappedProjectedBalance, maxBalanceUnits);
  const capAdjustmentUnits = maxBalanceUnits === null ? 0 : Math.max(0, uncappedProjectedBalance - maxBalanceUnits);

  const receiptWithoutDigest: Omit<LeaveAccrualEngineReceipt, 'leave_accrual_evidence_digest'> = {
    seed_id: PHASE_6C_LEAVE_ACCRUAL_ENGINE_SEED_ID,
    component_id: PHASE_6C_LEAVE_ACCRUAL_ENGINE_COMPONENT_ID,
    component_slug: "hr_attendance_leave_and_time_tracking",
    model_name: "Phase6CLeaveAccrualEngine",
    event_name: LEAVE_ACCRUAL_ENGINE_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    employee_ref: requireNonEmpty(input.employee_ref, 'employee_ref'),
    leave_type_ref: requireNonEmpty(input.leave_type_ref, 'leave_type_ref'),
    accrual_rule_ref: requireNonEmpty(input.accrual_rule_ref, 'accrual_rule_ref'),
    accrual_frequency: frequency,
    accrual_period_start: periodStart,
    accrual_period_end: periodEnd,
    annual_entitlement_units: annualEntitlementUnits,
    opening_balance_units: openingBalanceUnits,
    used_units: usedUnits,
    carry_forward_units: carryForwardUnits,
    raw_accrual_units: Number(rawUnits.toFixed(6)),
    rounded_accrual_units: roundedUnits,
    cap_adjustment_units: Number(capAdjustmentUnits.toFixed(6)),
    projected_balance_units: Number(projectedBalanceUnits.toFixed(6)),
    max_balance_units: maxBalanceUnits,
    rounding_policy: roundingPolicy,
    decision: capAdjustmentUnits > 0 ? "ACCRUAL_CAPPED" : "ACCRUAL_CALCULATED",
    balance_mutation_allowed: false,
    provider_neutral_only: true,
    runtime_status: "LEAVE_ACCRUAL_ENGINE_EVALUATED",
    decision_refs: DECISION_REFS,
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    leave_accrual_evidence_digest: digestAccrual(receiptWithoutDigest),
  };
}
