import { createHash } from 'node:crypto';

export const PHASE_6C_COMMISSION_PAYROLL_BATCH_EVENT_SEED_ID = "seed_6c_048_commission_payroll_batch_event" as const;
export const PHASE_6C_COMMISSION_PAYROLL_BATCH_EVENT_COMPONENT_ID = "6C.04" as const;
export const COMMISSION_PAYROLL_BATCH_EVENT_PREPARED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.commission_payroll_batch_event.prepared" as const;

export type CommissionPayrollBatchEventDecision =
  | "PAYROLL_BATCH_EVENT_READY"
  | "PAYROLL_BATCH_EVENT_PARTIAL_REVIEW"
  | "PAYROLL_BATCH_EVENT_REQUIRES_REVIEW";

export type CommissionPayrollBatchLine = {
  commission_receipt_ref: string;
  employee_ref: string;
  commission_plan_ref: string;
  payable_commission_amount: number;
  currency?: string;
  approved_for_payroll: boolean;
  payroll_input_code: "COMMISSION_EARNING" | "COMMISSION_REVERSAL" | "COMMISSION_ADJUSTMENT";
  evidence_refs: readonly string[];
  review_note?: string;
};

export type CommissionPayrollBatchEventInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  payroll_batch_ref: string;
  payroll_period_ref: string;
  currency: string;
  event_sequence: number;
  commission_lines: readonly CommissionPayrollBatchLine[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  payroll_mutation_requested?: boolean;
  payment_mutation_requested?: boolean;
  crm_mutation_requested?: boolean;
  event_dispatch_requested?: boolean;
  provider_specific_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type CommissionPayrollBatchEventLine = {
  commission_receipt_ref: string;
  employee_ref: string;
  commission_plan_ref: string;
  payroll_input_code: "COMMISSION_EARNING" | "COMMISSION_REVERSAL" | "COMMISSION_ADJUSTMENT";
  payable_commission_amount: number;
  currency: string;
  evidence_refs: readonly string[];
};

export type CommissionPayrollBatchEventPayload = {
  event_id: string;
  event_name: "phase_6c.commission.payroll_batch.approved";
  organization_id: string;
  payroll_batch_ref: string;
  payroll_period_ref: string;
  currency: string;
  sequence: number;
  total_payroll_amount: number;
  line_count: number;
  lines: readonly CommissionPayrollBatchEventLine[];
};

export type CommissionPayrollBatchEventReceipt = {
  seed_id: typeof PHASE_6C_COMMISSION_PAYROLL_BATCH_EVENT_SEED_ID;
  component_id: typeof PHASE_6C_COMMISSION_PAYROLL_BATCH_EVENT_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6CCommissionPayrollBatchEvent";
  event_name: typeof COMMISSION_PAYROLL_BATCH_EVENT_PREPARED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  payroll_batch_ref: string;
  payroll_period_ref: string;
  currency: string;
  approved_line_count: number;
  review_line_count: number;
  approved_payroll_amount_total: number;
  decision: CommissionPayrollBatchEventDecision;
  event_payload: CommissionPayrollBatchEventPayload | null;
  payroll_mutation_allowed: false;
  payment_mutation_allowed: false;
  crm_mutation_allowed: false;
  event_dispatch_allowed: false;
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
  payroll_batch_event_digest: string;
};

type ReceiptWithoutDigest = Omit<CommissionPayrollBatchEventReceipt, 'payroll_batch_event_digest'>;

const DECISION_REFS = ["6C-HR-OPS-007"] as const;
const EVIDENCE_ARTIFACTS = [
  "commission_payroll_batch_event_runtime_receipt",
  "prepared_payroll_event_payload",
  "review_line_rejection_evidence",
  "deterministic_payroll_batch_event_digest",
] as const;
const MONEY_SCALE = 100;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for commission_payroll_batch_event.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for commission_payroll_batch_event.');
  }
  return normalized;
}

function requireCurrency(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field).toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new Error(field + ' must be a three-letter ISO currency code for commission_payroll_batch_event.');
  }
  return normalized;
}

function requireNonNegativeFinite(value: number | undefined, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(field + ' must be a non-negative finite number for commission_payroll_batch_event.');
  }
  return value;
}

function requirePositiveInteger(value: number | undefined, field: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new Error(field + ' must be a positive integer for commission_payroll_batch_event.');
  }
  return value;
}

function requirePayrollInputCode(value: CommissionPayrollBatchLine['payroll_input_code'] | undefined, field: string): CommissionPayrollBatchLine['payroll_input_code'] {
  if (value !== "COMMISSION_EARNING" && value !== "COMMISSION_REVERSAL" && value !== "COMMISSION_ADJUSTMENT") {
    throw new Error(field + ' must be a supported payroll input code for commission_payroll_batch_event.');
  }
  return value;
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * MONEY_SCALE) / MONEY_SCALE;
}

function rejectForbiddenMutation(input: CommissionPayrollBatchEventInput): void {
  const forbiddenRequests: Array<[keyof CommissionPayrollBatchEventInput, string]> = [
    ['payroll_mutation_requested', 'payroll mutation'],
    ['payment_mutation_requested', 'payment mutation'],
    ['crm_mutation_requested', 'CRM mutation'],
    ['event_dispatch_requested', 'event dispatch'],
    ['provider_specific_adapter_requested', 'provider-specific adapter execution'],
    ['schema_mutation_requested', 'schema mutation'],
    ['phase_6a_mutation_requested', 'Phase 6A mutation'],
    ['phase_6b_mutation_requested', 'Phase 6B mutation'],
    ['runtime_adapter_requested', 'runtime adapter execution'],
    ['ticket_flag_flip_requested', 'ticket flag flip'],
  ];

  for (const [field, label] of forbiddenRequests) {
    if (input[field] === true) {
      throw new Error('commission_payroll_batch_event must not perform ' + label + '.');
    }
  }
}

function digestReceipt(receiptWithoutDigest: ReceiptWithoutDigest): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function buildEventId(organizationId: string, payrollBatchRef: string, eventSequence: number): string {
  return createHash('sha256')
    .update([organizationId, payrollBatchRef, String(eventSequence)].join('|'))
    .digest('hex')
    .slice(0, 24);
}

function normalizeLine(line: CommissionPayrollBatchLine, index: number, currency: string): CommissionPayrollBatchEventLine | null {
  const prefix = 'commission_lines[' + index + ']';
  const commissionReceiptRef = requireNonEmpty(line.commission_receipt_ref, prefix + '.commission_receipt_ref');
  const employeeRef = requireNonEmpty(line.employee_ref, prefix + '.employee_ref');
  const commissionPlanRef = requireNonEmpty(line.commission_plan_ref, prefix + '.commission_plan_ref');
  const lineCurrency = line.currency === undefined ? currency : requireCurrency(line.currency, prefix + '.currency');
  if (lineCurrency !== currency) {
    throw new Error(prefix + '.currency must match commission_payroll_batch_event currency.');
  }
  const payableCommissionAmount = roundMoney(requireNonNegativeFinite(line.payable_commission_amount, prefix + '.payable_commission_amount'));
  const payrollInputCode = requirePayrollInputCode(line.payroll_input_code, prefix + '.payroll_input_code');
  if (!Array.isArray(line.evidence_refs) || line.evidence_refs.length === 0) {
    throw new Error(prefix + '.evidence_refs must contain at least one evidence reference for commission_payroll_batch_event.');
  }
  const evidenceRefs = line.evidence_refs.map((ref: string, refIndex: number) => requireNonEmpty(ref, prefix + '.evidence_refs[' + refIndex + ']'));
  if (line.review_note !== undefined) {
    requireNonEmpty(line.review_note, prefix + '.review_note');
  }
  if (line.approved_for_payroll !== true || payableCommissionAmount === 0) {
    return null;
  }

  return {
    commission_receipt_ref: commissionReceiptRef,
    employee_ref: employeeRef,
    commission_plan_ref: commissionPlanRef,
    payroll_input_code: payrollInputCode,
    payable_commission_amount: payableCommissionAmount,
    currency: lineCurrency,
    evidence_refs: evidenceRefs,
  };
}

export function prepareCommissionPayrollBatchEvent(input: CommissionPayrollBatchEventInput): CommissionPayrollBatchEventReceipt {
  rejectForbiddenMutation(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const payrollBatchRef = requireNonEmpty(input.payroll_batch_ref, 'payroll_batch_ref');
  const payrollPeriodRef = requireNonEmpty(input.payroll_period_ref, 'payroll_period_ref');
  const currency = requireCurrency(input.currency, 'currency');
  const eventSequence = requirePositiveInteger(input.event_sequence, 'event_sequence');
  const evaluatedByUserId = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');

  if (!Array.isArray(input.commission_lines)) {
    throw new Error('commission_lines must be an array for commission_payroll_batch_event.');
  }

  const eventLines = input.commission_lines
    .map((line, index) => normalizeLine(line, index, currency))
    .filter((line): line is CommissionPayrollBatchEventLine => line !== null);
  const reviewLineCount = input.commission_lines.length - eventLines.length;
  const approvedPayrollAmountTotal = roundMoney(eventLines.reduce((sum, line) => sum + line.payable_commission_amount, 0));
  const decision: CommissionPayrollBatchEventDecision = eventLines.length === 0
    ? "PAYROLL_BATCH_EVENT_REQUIRES_REVIEW"
    : reviewLineCount > 0
      ? "PAYROLL_BATCH_EVENT_PARTIAL_REVIEW"
      : "PAYROLL_BATCH_EVENT_READY";
  const eventPayload: CommissionPayrollBatchEventPayload | null = eventLines.length === 0
    ? null
    : {
      event_id: buildEventId(organizationId, payrollBatchRef, eventSequence),
      event_name: "phase_6c.commission.payroll_batch.approved",
      organization_id: organizationId,
      payroll_batch_ref: payrollBatchRef,
      payroll_period_ref: payrollPeriodRef,
      currency,
      sequence: eventSequence,
      total_payroll_amount: approvedPayrollAmountTotal,
      line_count: eventLines.length,
      lines: eventLines,
    };

  const receiptWithoutDigest: ReceiptWithoutDigest = {
    seed_id: PHASE_6C_COMMISSION_PAYROLL_BATCH_EVENT_SEED_ID,
    component_id: PHASE_6C_COMMISSION_PAYROLL_BATCH_EVENT_COMPONENT_ID,
    component_slug: "hr_performance_commission_policy_and_offboarding",
    model_name: "Phase6CCommissionPayrollBatchEvent",
    event_name: COMMISSION_PAYROLL_BATCH_EVENT_PREPARED_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    payroll_batch_ref: payrollBatchRef,
    payroll_period_ref: payrollPeriodRef,
    currency,
    approved_line_count: eventLines.length,
    review_line_count: reviewLineCount,
    approved_payroll_amount_total: approvedPayrollAmountTotal,
    decision,
    event_payload: eventPayload,
    payroll_mutation_allowed: false,
    payment_mutation_allowed: false,
    crm_mutation_allowed: false,
    event_dispatch_allowed: false,
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
    payroll_batch_event_digest: digestReceipt(receiptWithoutDigest),
  };
}
