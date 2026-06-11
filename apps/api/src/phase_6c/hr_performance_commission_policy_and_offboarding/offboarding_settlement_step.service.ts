import { createHash } from 'node:crypto';

export const PHASE_6C_OFFBOARDING_SETTLEMENT_STEP_SEED_ID = "seed_6c_052_offboarding_settlement_step" as const;
export const PHASE_6C_OFFBOARDING_SETTLEMENT_STEP_COMPONENT_ID = "6C.04" as const;
export const OFFBOARDING_SETTLEMENT_STEP_EVALUATED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.offboarding_settlement_step.evaluated" as const;

export type OffboardingSettlementLineType =
  | "FINAL_SALARY"
  | "LEAVE_ENCASHMENT"
  | "COMMISSION"
  | "DEDUCTION"
  | "ASSET_RECOVERY_DEDUCTION"
  | "TAX_WITHHOLDING"
  | "SETTLEMENT_HOLD";

export type OffboardingSettlementLineDirection = "EARNING" | "DEDUCTION" | "HOLD";

export type OffboardingSettlementDecision =
  | "SETTLEMENT_READY"
  | "SETTLEMENT_PARTIAL_REVIEW"
  | "SETTLEMENT_REQUIRES_REVIEW";

export type OffboardingSettlementLine = {
  line_ref: string;
  line_type: OffboardingSettlementLineType;
  direction: OffboardingSettlementLineDirection;
  amount: number;
  currency?: string;
  approved: boolean;
  evidence_refs: readonly string[];
  review_note?: string;
};

export type OffboardingSettlementStepInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  saga_ref: string;
  settlement_ref: string;
  employee_ref: string;
  currency: string;
  settlement_lines: readonly OffboardingSettlementLine[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  payroll_mutation_requested?: boolean;
  payment_mutation_requested?: boolean;
  event_dispatch_requested?: boolean;
  dlq_write_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type OffboardingSettlementPreparedLine = OffboardingSettlementLine & {
  currency: string;
  outcome: "INCLUDED" | "REVIEW_REQUIRED";
};

export type OffboardingSettlementStepReceipt = {
  seed_id: typeof PHASE_6C_OFFBOARDING_SETTLEMENT_STEP_SEED_ID;
  component_id: typeof PHASE_6C_OFFBOARDING_SETTLEMENT_STEP_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6COffboardingSettlementStep";
  event_name: typeof OFFBOARDING_SETTLEMENT_STEP_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  saga_ref: string;
  settlement_ref: string;
  employee_ref: string;
  currency: string;
  earning_total: number;
  deduction_total: number;
  hold_total: number;
  net_settlement_amount: number;
  review_line_count: number;
  decision: OffboardingSettlementDecision;
  prepared_lines: readonly OffboardingSettlementPreparedLine[];
  payroll_mutation_allowed: false;
  payment_mutation_allowed: false;
  event_dispatch_allowed: false;
  dlq_write_allowed: false;
  schema_mutation_allowed: false;
  phase_6a_mutation_allowed: false;
  phase_6b_mutation_allowed: false;
  runtime_adapter_allowed: false;
  ticket_flag_flip_allowed: false;
  adl_refs: readonly string[];
  decision_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  evidence_artifacts: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  settlement_step_digest: string;
};

type ReceiptWithoutDigest = Omit<OffboardingSettlementStepReceipt, 'settlement_step_digest'>;

const DECISION_REFS = ["6C-HR-OPS-012", "6C-HR-OPS-011", "6C-ADL-002", "6C-ADL-004"] as const;
const ADL_REFS = ["ADL-001", "ADL-002"] as const;
const EVIDENCE_ARTIFACTS = [
  "offboarding_settlement_step_runtime_receipt",
  "settlement_line_evidence",
  "review_required_settlement_evidence",
  "deterministic_settlement_step_digest",
] as const;
const MONEY_SCALE = 100;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for offboarding_settlement_step.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for offboarding_settlement_step.');
  }
  return normalized;
}

function requireCurrency(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field).toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new Error(field + ' must be a three-letter ISO currency code for offboarding_settlement_step.');
  }
  return normalized;
}

function requireNonNegativeFinite(value: number | undefined, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(field + ' must be a non-negative finite number for offboarding_settlement_step.');
  }
  return value;
}

function requireLineType(value: OffboardingSettlementLineType | undefined, field: string): OffboardingSettlementLineType {
  if (
    value !== "FINAL_SALARY" &&
    value !== "LEAVE_ENCASHMENT" &&
    value !== "COMMISSION" &&
    value !== "DEDUCTION" &&
    value !== "ASSET_RECOVERY_DEDUCTION" &&
    value !== "TAX_WITHHOLDING" &&
    value !== "SETTLEMENT_HOLD"
  ) {
    throw new Error(field + ' must be a supported line type for offboarding_settlement_step.');
  }
  return value;
}

function requireDirection(value: OffboardingSettlementLineDirection | undefined, field: string): OffboardingSettlementLineDirection {
  if (value !== "EARNING" && value !== "DEDUCTION" && value !== "HOLD") {
    throw new Error(field + ' must be a supported line direction for offboarding_settlement_step.');
  }
  return value;
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * MONEY_SCALE) / MONEY_SCALE;
}

function rejectForbiddenMutation(input: OffboardingSettlementStepInput): void {
  const forbiddenRequests: Array<[keyof OffboardingSettlementStepInput, string]> = [
    ['payroll_mutation_requested', 'payroll mutation'],
    ['payment_mutation_requested', 'payment mutation'],
    ['event_dispatch_requested', 'event dispatch'],
    ['dlq_write_requested', 'DLQ write'],
    ['schema_mutation_requested', 'schema mutation'],
    ['phase_6a_mutation_requested', 'Phase 6A mutation'],
    ['phase_6b_mutation_requested', 'Phase 6B mutation'],
    ['runtime_adapter_requested', 'runtime adapter execution'],
    ['ticket_flag_flip_requested', 'ticket flag flip'],
  ];

  for (const [field, label] of forbiddenRequests) {
    if (input[field] === true) {
      throw new Error('offboarding_settlement_step must not perform ' + label + '.');
    }
  }
}

function digestReceipt(receiptWithoutDigest: ReceiptWithoutDigest): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function normalizeLine(line: OffboardingSettlementLine, index: number, currency: string): OffboardingSettlementPreparedLine {
  const prefix = 'settlement_lines[' + index + ']';
  const lineCurrency = line.currency === undefined ? currency : requireCurrency(line.currency, prefix + '.currency');
  if (lineCurrency !== currency) {
    throw new Error(prefix + '.currency must match offboarding_settlement_step currency.');
  }
  if (!Array.isArray(line.evidence_refs) || line.evidence_refs.length === 0) {
    throw new Error(prefix + '.evidence_refs must contain at least one evidence reference for offboarding_settlement_step.');
  }
  const reviewNote = line.review_note === undefined ? undefined : requireNonEmpty(line.review_note, prefix + '.review_note');

  return {
    line_ref: requireNonEmpty(line.line_ref, prefix + '.line_ref'),
    line_type: requireLineType(line.line_type, prefix + '.line_type'),
    direction: requireDirection(line.direction, prefix + '.direction'),
    amount: roundMoney(requireNonNegativeFinite(line.amount, prefix + '.amount')),
    currency: lineCurrency,
    approved: line.approved === true,
    evidence_refs: line.evidence_refs.map((ref: string, refIndex: number) => requireNonEmpty(ref, prefix + '.evidence_refs[' + refIndex + ']')),
    ...(reviewNote === undefined ? {} : { review_note: reviewNote }),
    outcome: line.approved === true ? "INCLUDED" : "REVIEW_REQUIRED",
  };
}

export function evaluateOffboardingSettlementStep(input: OffboardingSettlementStepInput): OffboardingSettlementStepReceipt {
  rejectForbiddenMutation(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const sagaRef = requireNonEmpty(input.saga_ref, 'saga_ref');
  const settlementRef = requireNonEmpty(input.settlement_ref, 'settlement_ref');
  const employeeRef = requireNonEmpty(input.employee_ref, 'employee_ref');
  const currency = requireCurrency(input.currency, 'currency');
  const evaluatedByUserId = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');

  if (!Array.isArray(input.settlement_lines) || input.settlement_lines.length === 0) {
    throw new Error('settlement_lines must contain at least one line for offboarding_settlement_step.');
  }

  const preparedLines = input.settlement_lines.map((line, index) => normalizeLine(line, index, currency));
  const includedLines = preparedLines.filter((line) => line.outcome === "INCLUDED");
  const earningTotal = roundMoney(includedLines.filter((line) => line.direction === "EARNING").reduce((sum, line) => sum + line.amount, 0));
  const deductionTotal = roundMoney(includedLines.filter((line) => line.direction === "DEDUCTION").reduce((sum, line) => sum + line.amount, 0));
  const holdTotal = roundMoney(includedLines.filter((line) => line.direction === "HOLD").reduce((sum, line) => sum + line.amount, 0));
  const netSettlementAmount = roundMoney(earningTotal - deductionTotal - holdTotal);
  const reviewLineCount = preparedLines.length - includedLines.length;
  const decision: OffboardingSettlementDecision = netSettlementAmount < 0 || includedLines.length === 0
    ? "SETTLEMENT_REQUIRES_REVIEW"
    : reviewLineCount > 0 || holdTotal > 0
      ? "SETTLEMENT_PARTIAL_REVIEW"
      : "SETTLEMENT_READY";

  const receiptWithoutDigest: ReceiptWithoutDigest = {
    seed_id: PHASE_6C_OFFBOARDING_SETTLEMENT_STEP_SEED_ID,
    component_id: PHASE_6C_OFFBOARDING_SETTLEMENT_STEP_COMPONENT_ID,
    component_slug: "hr_performance_commission_policy_and_offboarding",
    model_name: "Phase6COffboardingSettlementStep",
    event_name: OFFBOARDING_SETTLEMENT_STEP_EVALUATED_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    saga_ref: sagaRef,
    settlement_ref: settlementRef,
    employee_ref: employeeRef,
    currency,
    earning_total: earningTotal,
    deduction_total: deductionTotal,
    hold_total: holdTotal,
    net_settlement_amount: netSettlementAmount,
    review_line_count: reviewLineCount,
    decision,
    prepared_lines: preparedLines,
    payroll_mutation_allowed: false,
    payment_mutation_allowed: false,
    event_dispatch_allowed: false,
    dlq_write_allowed: false,
    schema_mutation_allowed: false,
    phase_6a_mutation_allowed: false,
    phase_6b_mutation_allowed: false,
    runtime_adapter_allowed: false,
    ticket_flag_flip_allowed: false,
    adl_refs: ADL_REFS,
    decision_refs: DECISION_REFS,
    control_metadata: input.control_metadata ?? {},
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    evaluated_by_user_id: evaluatedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    settlement_step_digest: digestReceipt(receiptWithoutDigest),
  };
}
