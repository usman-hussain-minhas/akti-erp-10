import { createHash } from 'node:crypto';

export const PHASE_6C_LEAVE_ENCASHMENT_SEED_ID = "seed_6c_036_leave_encashment" as const;
export const PHASE_6C_LEAVE_ENCASHMENT_COMPONENT_ID = "6C.03" as const;
export const LEAVE_ENCASHMENT_EVALUATED_EVENT = "phase_6c.hr_attendance_leave_and_time_tracking.leave_encashment.evaluated" as const;

export type LeaveEncashmentPolicy = "NOT_ALLOWED" | "FULL_BALANCE" | "CAPPED_UNITS" | "REQUESTED_UNITS_ONLY";
export type LeaveEncashmentDecision = "ENCASHMENT_NOT_ALLOWED" | "ENCASHMENT_EVIDENCE_READY" | "ENCASHMENT_CAPPED" | "ENCASHMENT_REJECTED_ZERO_BALANCE";

export type LeaveEncashmentInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  leave_type_ref: string;
  policy_ref: string;
  fiscal_period_ref: string;
  policy: LeaveEncashmentPolicy;
  available_balance_units: number;
  requested_encashment_units: number;
  max_encashment_units?: number;
  unit_rate_amount: number;
  currency: string;
  request_date: string;
  payout_evidence_date: string;
  approval_ref?: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  payroll_mutation_requested?: boolean;
  balance_mutation_requested?: boolean;
  provider_specific_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type LeaveEncashmentReceipt = {
  seed_id: typeof PHASE_6C_LEAVE_ENCASHMENT_SEED_ID;
  component_id: typeof PHASE_6C_LEAVE_ENCASHMENT_COMPONENT_ID;
  component_slug: "hr_attendance_leave_and_time_tracking";
  model_name: "Phase6CLeaveEncashment";
  event_name: typeof LEAVE_ENCASHMENT_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  leave_type_ref: string;
  policy_ref: string;
  fiscal_period_ref: string;
  policy: LeaveEncashmentPolicy;
  available_balance_units: number;
  requested_encashment_units: number;
  max_encashment_units: number | null;
  unit_rate_amount: number;
  currency: string;
  approved_encashment_units: number;
  rejected_units: number;
  gross_encashment_amount: number;
  approval_ref: string | null;
  request_date: string;
  payout_evidence_date: string;
  decision: LeaveEncashmentDecision;
  payroll_mutation_allowed: false;
  balance_mutation_allowed: false;
  provider_neutral_only: true;
  runtime_status: "LEAVE_ENCASHMENT_EVIDENCE_EVALUATED";
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  leave_encashment_evidence_digest: string;
};

const VALID_POLICIES: readonly LeaveEncashmentPolicy[] = ["NOT_ALLOWED", "FULL_BALANCE", "CAPPED_UNITS", "REQUESTED_UNITS_ONLY"];
const DECISION_REFS = ["6C-ATT-015"] as const;
const EVIDENCE_ARTIFACTS = [
  "leave_encashment_decision_receipt",
  "leave_encashment_amount_evidence",
  "payroll_boundary_evidence",
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for leave_encashment.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for leave_encashment.');
  }
  return normalized;
}

function requireDate(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error(field + ' must use YYYY-MM-DD format for leave_encashment.');
  }
  return normalized;
}

function requireNonNegativeNumber(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(field + ' must be a non-negative finite number for leave_encashment.');
  }
  return value;
}

function requirePositiveNumber(value: number | undefined, field: string): number {
  if (value === undefined || !Number.isFinite(value) || value <= 0) {
    throw new Error(field + ' must be a positive finite number for leave_encashment.');
  }
  return value;
}

function optionalPositiveNumber(value: number | undefined, field: string): number | null {
  if (value === undefined) {
    return null;
  }
  return requirePositiveNumber(value, field);
}

function requireCurrency(value: string): string {
  const normalized = requireNonEmpty(value, 'currency').toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new Error('currency must be an ISO-4217 three-letter code for leave_encashment.');
  }
  return normalized;
}

function requirePolicy(value: LeaveEncashmentPolicy): LeaveEncashmentPolicy {
  if (!VALID_POLICIES.includes(value)) {
    throw new Error('policy is not allowed for leave_encashment.');
  }
  return value;
}

function rejectForbiddenRequests(input: LeaveEncashmentInput): void {
  const forbiddenFlags: Array<[keyof LeaveEncashmentInput, string]> = [
    ['payroll_mutation_requested', 'leave_encashment must emit payroll evidence and must not mutate payroll surfaces.'],
    ['balance_mutation_requested', 'leave_encashment must not mutate leave balances directly.'],
    ['provider_specific_adapter_requested', 'leave_encashment must remain provider-neutral.'],
    ['schema_mutation_requested', 'leave_encashment must not request schema mutation.'],
    ['phase_6a_mutation_requested', 'leave_encashment must not mutate Phase 6A surfaces.'],
    ['phase_6b_mutation_requested', 'leave_encashment must not mutate Phase 6B surfaces.'],
    ['runtime_adapter_requested', 'leave_encashment must not execute runtime adapters.'],
    ['ticket_flag_flip_requested', 'leave_encashment must not flip ticket authorization flags.'],
  ];

  for (const [flag, message] of forbiddenFlags) {
    if (input[flag] === true) {
      throw new Error(message);
    }
  }
}

function digestEncashment(receiptWithoutDigest: Omit<LeaveEncashmentReceipt, 'leave_encashment_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function compareIsoDate(left: string, right: string): number {
  return Date.parse(left + 'T00:00:00.000Z') - Date.parse(right + 'T00:00:00.000Z');
}

function calculateApprovedUnits(policy: LeaveEncashmentPolicy, availableBalanceUnits: number, requestedUnits: number, maxUnits: number | null): { approvedUnits: number; decision: LeaveEncashmentDecision } {
  if (availableBalanceUnits === 0 || requestedUnits === 0) {
    return { approvedUnits: 0, decision: "ENCASHMENT_REJECTED_ZERO_BALANCE" };
  }
  if (policy === "NOT_ALLOWED") {
    return { approvedUnits: 0, decision: "ENCASHMENT_NOT_ALLOWED" };
  }
  if (policy === "FULL_BALANCE") {
    const approvedUnits = Math.min(availableBalanceUnits, requestedUnits);
    return { approvedUnits, decision: approvedUnits < requestedUnits ? "ENCASHMENT_CAPPED" : "ENCASHMENT_EVIDENCE_READY" };
  }
  if (policy === "REQUESTED_UNITS_ONLY") {
    const approvedUnits = Math.min(requestedUnits, availableBalanceUnits);
    return { approvedUnits, decision: approvedUnits < requestedUnits ? "ENCASHMENT_CAPPED" : "ENCASHMENT_EVIDENCE_READY" };
  }
  if (maxUnits === null) {
    throw new Error('max_encashment_units is required for capped leave encashment policy.');
  }
  const approvedUnits = Math.min(requestedUnits, availableBalanceUnits, maxUnits);
  return { approvedUnits, decision: approvedUnits < requestedUnits ? "ENCASHMENT_CAPPED" : "ENCASHMENT_EVIDENCE_READY" };
}

export function evaluateLeaveEncashment(input: LeaveEncashmentInput): LeaveEncashmentReceipt {
  rejectForbiddenRequests(input);

  const policy = requirePolicy(input.policy);
  const requestDate = requireDate(input.request_date, 'request_date');
  const payoutEvidenceDate = requireDate(input.payout_evidence_date, 'payout_evidence_date');
  if (compareIsoDate(requestDate, payoutEvidenceDate) > 0) {
    throw new Error('request_date must be on or before payout_evidence_date for leave_encashment.');
  }

  const availableBalanceUnits = requireNonNegativeNumber(input.available_balance_units, 'available_balance_units');
  const requestedEncashmentUnits = requireNonNegativeNumber(input.requested_encashment_units, 'requested_encashment_units');
  const maxEncashmentUnits = optionalPositiveNumber(input.max_encashment_units, 'max_encashment_units');
  const unitRateAmount = requirePositiveNumber(input.unit_rate_amount, 'unit_rate_amount');
  const { approvedUnits, decision } = calculateApprovedUnits(policy, availableBalanceUnits, requestedEncashmentUnits, maxEncashmentUnits);
  const rejectedUnits = Number((requestedEncashmentUnits - approvedUnits).toFixed(6));
  const grossAmount = Number((approvedUnits * unitRateAmount).toFixed(2));

  const receiptWithoutDigest: Omit<LeaveEncashmentReceipt, 'leave_encashment_evidence_digest'> = {
    seed_id: PHASE_6C_LEAVE_ENCASHMENT_SEED_ID,
    component_id: PHASE_6C_LEAVE_ENCASHMENT_COMPONENT_ID,
    component_slug: "hr_attendance_leave_and_time_tracking",
    model_name: "Phase6CLeaveEncashment",
    event_name: LEAVE_ENCASHMENT_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    employee_ref: requireNonEmpty(input.employee_ref, 'employee_ref'),
    leave_type_ref: requireNonEmpty(input.leave_type_ref, 'leave_type_ref'),
    policy_ref: requireNonEmpty(input.policy_ref, 'policy_ref'),
    fiscal_period_ref: requireNonEmpty(input.fiscal_period_ref, 'fiscal_period_ref'),
    policy,
    available_balance_units: availableBalanceUnits,
    requested_encashment_units: requestedEncashmentUnits,
    max_encashment_units: maxEncashmentUnits,
    unit_rate_amount: unitRateAmount,
    currency: requireCurrency(input.currency),
    approved_encashment_units: Number(approvedUnits.toFixed(6)),
    rejected_units: rejectedUnits,
    gross_encashment_amount: grossAmount,
    approval_ref: input.approval_ref === undefined ? null : requireNonEmpty(input.approval_ref, 'approval_ref'),
    request_date: requestDate,
    payout_evidence_date: payoutEvidenceDate,
    decision,
    payroll_mutation_allowed: false,
    balance_mutation_allowed: false,
    provider_neutral_only: true,
    runtime_status: "LEAVE_ENCASHMENT_EVIDENCE_EVALUATED",
    decision_refs: DECISION_REFS,
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    leave_encashment_evidence_digest: digestEncashment(receiptWithoutDigest),
  };
}
