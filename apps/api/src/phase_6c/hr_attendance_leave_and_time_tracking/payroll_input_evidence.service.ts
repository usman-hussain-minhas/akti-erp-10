import { createHash } from 'node:crypto';

export const PHASE_6C_PAYROLL_INPUT_EVIDENCE_SEED_ID = "seed_6c_038_payroll_input_evidence" as const;
export const PHASE_6C_PAYROLL_INPUT_EVIDENCE_COMPONENT_ID = "6C.03" as const;
export const PAYROLL_INPUT_EVIDENCE_EVALUATED_EVENT = "phase_6c.hr_attendance_leave_and_time_tracking.payroll_input_evidence.evaluated" as const;

export type PayrollInputEvidenceKind = "ATTENDANCE_HOURS" | "OVERTIME_HOURS" | "PAID_LEAVE_UNITS" | "UNPAID_LEAVE_UNITS" | "ABSENCE_DEDUCTION_UNITS" | "LEAVE_ENCASHMENT_AMOUNT";
export type PayrollInputEvidenceStatus = "PAYROLL_INPUT_READY" | "PAYROLL_INPUT_REQUIRES_REVIEW";

export type PayrollInputEvidenceLine = {
  evidence_ref: string;
  source_seed_id: string;
  kind: PayrollInputEvidenceKind;
  quantity: number;
  amount?: number;
  currency?: string;
  approved: boolean;
};

export type PayrollInputEvidenceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  payroll_period_ref: string;
  attendance_period_start: string;
  attendance_period_end: string;
  evidence_lines: readonly PayrollInputEvidenceLine[];
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

export type PayrollInputEvidenceReceipt = {
  seed_id: typeof PHASE_6C_PAYROLL_INPUT_EVIDENCE_SEED_ID;
  component_id: typeof PHASE_6C_PAYROLL_INPUT_EVIDENCE_COMPONENT_ID;
  component_slug: "hr_attendance_leave_and_time_tracking";
  model_name: "Phase6CPayrollInputEvidence";
  event_name: typeof PAYROLL_INPUT_EVIDENCE_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  payroll_period_ref: string;
  attendance_period_start: string;
  attendance_period_end: string;
  evidence_line_count: number;
  approved_line_count: number;
  rejected_line_count: number;
  attendance_hours: number;
  overtime_hours: number;
  paid_leave_units: number;
  unpaid_leave_units: number;
  absence_deduction_units: number;
  leave_encashment_amount: number;
  currency: string | null;
  status: PayrollInputEvidenceStatus;
  payroll_mutation_allowed: false;
  balance_mutation_allowed: false;
  provider_neutral_only: true;
  runtime_status: "PAYROLL_INPUT_EVIDENCE_EVALUATED";
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  payroll_input_evidence_digest: string;
};

const VALID_KINDS: readonly PayrollInputEvidenceKind[] = ["ATTENDANCE_HOURS", "OVERTIME_HOURS", "PAID_LEAVE_UNITS", "UNPAID_LEAVE_UNITS", "ABSENCE_DEDUCTION_UNITS", "LEAVE_ENCASHMENT_AMOUNT"];
const DECISION_REFS = ["6C-ATT-017"] as const;
const EVIDENCE_ARTIFACTS = [
  "payroll_input_evidence_receipt",
  "attendance_payroll_summary_evidence",
  "leave_payroll_boundary_evidence",
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for payroll_input_evidence.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for payroll_input_evidence.');
  }
  return normalized;
}

function requireDate(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error(field + ' must use YYYY-MM-DD format for payroll_input_evidence.');
  }
  return normalized;
}

function requireNonNegativeNumber(value: number | undefined, field: string): number {
  if (value === undefined || !Number.isFinite(value) || value < 0) {
    throw new Error(field + ' must be a non-negative finite number for payroll_input_evidence.');
  }
  return value;
}

function requireCurrency(value: string | undefined): string | null {
  if (value === undefined) {
    return null;
  }
  const normalized = requireNonEmpty(value, 'currency').toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new Error('currency must be an ISO-4217 three-letter code for payroll_input_evidence.');
  }
  return normalized;
}

function requireKind(value: PayrollInputEvidenceKind): PayrollInputEvidenceKind {
  if (!VALID_KINDS.includes(value)) {
    throw new Error('evidence kind is not allowed for payroll_input_evidence.');
  }
  return value;
}

function rejectForbiddenRequests(input: PayrollInputEvidenceInput): void {
  const forbiddenFlags: Array<[keyof PayrollInputEvidenceInput, string]> = [
    ['payroll_mutation_requested', 'payroll_input_evidence must emit evidence and must not mutate payroll surfaces.'],
    ['balance_mutation_requested', 'payroll_input_evidence must not mutate leave balances directly.'],
    ['provider_specific_adapter_requested', 'payroll_input_evidence must remain provider-neutral.'],
    ['schema_mutation_requested', 'payroll_input_evidence must not request schema mutation.'],
    ['phase_6a_mutation_requested', 'payroll_input_evidence must not mutate Phase 6A surfaces.'],
    ['phase_6b_mutation_requested', 'payroll_input_evidence must not mutate Phase 6B surfaces.'],
    ['runtime_adapter_requested', 'payroll_input_evidence must not execute runtime adapters.'],
    ['ticket_flag_flip_requested', 'payroll_input_evidence must not flip ticket authorization flags.'],
  ];

  for (const [flag, message] of forbiddenFlags) {
    if (input[flag] === true) {
      throw new Error(message);
    }
  }
}

function digestPayrollInput(receiptWithoutDigest: Omit<PayrollInputEvidenceReceipt, 'payroll_input_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function compareIsoDate(left: string, right: string): number {
  return Date.parse(left + 'T00:00:00.000Z') - Date.parse(right + 'T00:00:00.000Z');
}

export function evaluatePayrollInputEvidence(input: PayrollInputEvidenceInput): PayrollInputEvidenceReceipt {
  rejectForbiddenRequests(input);

  const periodStart = requireDate(input.attendance_period_start, 'attendance_period_start');
  const periodEnd = requireDate(input.attendance_period_end, 'attendance_period_end');
  if (compareIsoDate(periodStart, periodEnd) > 0) {
    throw new Error('attendance_period_start must be on or before attendance_period_end for payroll_input_evidence.');
  }
  if (!Array.isArray(input.evidence_lines) || input.evidence_lines.length === 0) {
    throw new Error('evidence_lines must contain at least one line for payroll_input_evidence.');
  }

  let attendanceHours = 0;
  let overtimeHours = 0;
  let paidLeaveUnits = 0;
  let unpaidLeaveUnits = 0;
  let absenceDeductionUnits = 0;
  let leaveEncashmentAmount = 0;
  let approvedLineCount = 0;
  let rejectedLineCount = 0;
  let currency: string | null = null;

  for (const line of input.evidence_lines) {
    requireNonEmpty(line.evidence_ref, 'evidence_ref');
    requireNonEmpty(line.source_seed_id, 'source_seed_id');
    const kind = requireKind(line.kind);
    const quantity = requireNonNegativeNumber(line.quantity, 'quantity');
    const amount = line.amount === undefined ? 0 : requireNonNegativeNumber(line.amount, 'amount');
    const lineCurrency = requireCurrency(line.currency);
    if (lineCurrency !== null) {
      if (currency !== null && currency !== lineCurrency) {
        throw new Error('all monetary payroll input evidence lines must use the same currency.');
      }
      currency = lineCurrency;
    }
    if (line.approved !== true) {
      rejectedLineCount += 1;
      continue;
    }
    approvedLineCount += 1;
    if (kind === "ATTENDANCE_HOURS") attendanceHours += quantity;
    if (kind === "OVERTIME_HOURS") overtimeHours += quantity;
    if (kind === "PAID_LEAVE_UNITS") paidLeaveUnits += quantity;
    if (kind === "UNPAID_LEAVE_UNITS") unpaidLeaveUnits += quantity;
    if (kind === "ABSENCE_DEDUCTION_UNITS") absenceDeductionUnits += quantity;
    if (kind === "LEAVE_ENCASHMENT_AMOUNT") leaveEncashmentAmount += amount;
  }

  const receiptWithoutDigest: Omit<PayrollInputEvidenceReceipt, 'payroll_input_evidence_digest'> = {
    seed_id: PHASE_6C_PAYROLL_INPUT_EVIDENCE_SEED_ID,
    component_id: PHASE_6C_PAYROLL_INPUT_EVIDENCE_COMPONENT_ID,
    component_slug: "hr_attendance_leave_and_time_tracking",
    model_name: "Phase6CPayrollInputEvidence",
    event_name: PAYROLL_INPUT_EVIDENCE_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    employee_ref: requireNonEmpty(input.employee_ref, 'employee_ref'),
    payroll_period_ref: requireNonEmpty(input.payroll_period_ref, 'payroll_period_ref'),
    attendance_period_start: periodStart,
    attendance_period_end: periodEnd,
    evidence_line_count: input.evidence_lines.length,
    approved_line_count: approvedLineCount,
    rejected_line_count: rejectedLineCount,
    attendance_hours: Number(attendanceHours.toFixed(6)),
    overtime_hours: Number(overtimeHours.toFixed(6)),
    paid_leave_units: Number(paidLeaveUnits.toFixed(6)),
    unpaid_leave_units: Number(unpaidLeaveUnits.toFixed(6)),
    absence_deduction_units: Number(absenceDeductionUnits.toFixed(6)),
    leave_encashment_amount: Number(leaveEncashmentAmount.toFixed(2)),
    currency,
    status: rejectedLineCount > 0 || approvedLineCount === 0 ? "PAYROLL_INPUT_REQUIRES_REVIEW" : "PAYROLL_INPUT_READY",
    payroll_mutation_allowed: false,
    balance_mutation_allowed: false,
    provider_neutral_only: true,
    runtime_status: "PAYROLL_INPUT_EVIDENCE_EVALUATED",
    decision_refs: DECISION_REFS,
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    payroll_input_evidence_digest: digestPayrollInput(receiptWithoutDigest),
  };
}
