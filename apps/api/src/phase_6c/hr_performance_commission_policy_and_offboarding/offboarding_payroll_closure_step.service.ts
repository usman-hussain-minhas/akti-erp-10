import { createHash } from 'node:crypto';

export const PHASE_6C_OFFBOARDING_PAYROLL_CLOSURE_STEP_SEED_ID = "seed_6c_056_offboarding_payroll_closure_step" as const;
export const PHASE_6C_OFFBOARDING_PAYROLL_CLOSURE_STEP_COMPONENT_ID = "6C.04" as const;
export const OFFBOARDING_PAYROLL_CLOSURE_STEP_EVALUATED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.offboarding_payroll_closure_step.evaluated" as const;

export type OffboardingPayrollClosureBlocker =
  | "SETTLEMENT_NOT_READY"
  | "ASSET_RECOVERY_OPEN"
  | "ACCESS_REVOCATION_REVIEW_OPEN"
  | "APPROVAL_MISSING"
  | "PAYROLL_PERIOD_LOCKED"
  | "EVIDENCE_MISSING";

export type OffboardingPayrollClosureDecision =
  | "PAYROLL_CLOSURE_READY"
  | "PAYROLL_CLOSURE_BLOCKED"
  | "PAYROLL_CLOSURE_REQUIRES_REVIEW";

export type OffboardingPayrollClosureMoneyComponentType =
  | "FINAL_SALARY"
  | "LEAVE_ENCASHMENT"
  | "COMMISSION_RELEASE"
  | "COMMISSION_CLAWBACK"
  | "ASSET_DEDUCTION"
  | "TAX_WITHHOLDING"
  | "SETTLEMENT_HOLD";

export type OffboardingPayrollClosureMoneyComponent = {
  component_ref: string;
  component_type: OffboardingPayrollClosureMoneyComponentType;
  amount: number;
  currency: string;
  evidence_refs: string[];
};

export type OffboardingPayrollClosureStepInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  offboarding_case_ref: string;
  employee_ref: string;
  payroll_period_ref: string;
  currency: string;
  closure_effective_at: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  settlement_ready: boolean;
  asset_recovery_closed: boolean;
  access_revocation_review_closed: boolean;
  payroll_period_locked?: boolean;
  approval_required?: boolean;
  approval_ref?: string;
  settlement_receipt_ref?: string;
  asset_recovery_receipt_ref?: string;
  access_revocation_receipt_ref?: string;
  money_components: OffboardingPayrollClosureMoneyComponent[];
  evidence_refs: string[];
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

export type OffboardingPayrollClosurePreparedComponent = {
  component_index: number;
  component_ref: string;
  component_type: OffboardingPayrollClosureMoneyComponentType;
  amount: number;
  currency: string;
  evidence_refs: string[];
};

export type OffboardingPayrollClosureStepReceipt = {
  seed_id: typeof PHASE_6C_OFFBOARDING_PAYROLL_CLOSURE_STEP_SEED_ID;
  component_id: typeof PHASE_6C_OFFBOARDING_PAYROLL_CLOSURE_STEP_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6COffboardingPayrollClosureStep";
  event_name: typeof OFFBOARDING_PAYROLL_CLOSURE_STEP_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  offboarding_case_ref: string;
  employee_ref: string;
  payroll_period_ref: string;
  currency: string;
  closure_effective_at: string;
  decision: OffboardingPayrollClosureDecision;
  blockers: OffboardingPayrollClosureBlocker[];
  component_count: number;
  gross_earning_total: number;
  deduction_total: number;
  hold_total: number;
  net_closure_amount: number;
  prepared_components: OffboardingPayrollClosurePreparedComponent[];
  settlement_receipt_ref: string | null;
  asset_recovery_receipt_ref: string | null;
  access_revocation_receipt_ref: string | null;
  approval_ref: string | null;
  evidence_refs: string[];
  payroll_mutation_performed: false;
  payment_mutation_performed: false;
  event_dispatch_performed: false;
  dlq_write_performed: false;
  schema_mutation_performed: false;
  phase_6a_mutation_performed: false;
  phase_6b_mutation_performed: false;
  runtime_adapter_performed: false;
  ticket_flag_flip_performed: false;
  decision_refs: readonly string[];
  adl_refs: readonly string[];
  evidence_artifacts: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  payroll_closure_evidence_digest: string;
};

const ALLOWED_COMPONENT_TYPES: readonly OffboardingPayrollClosureMoneyComponentType[] = [
  "FINAL_SALARY",
  "LEAVE_ENCASHMENT",
  "COMMISSION_RELEASE",
  "COMMISSION_CLAWBACK",
  "ASSET_DEDUCTION",
  "TAX_WITHHOLDING",
  "SETTLEMENT_HOLD",
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for offboarding_payroll_closure_step.');
  }
  return value.trim();
}

function requireOptionalNonEmpty(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  return requireNonEmpty(value, field);
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for offboarding_payroll_closure_step.');
  }
  return normalized;
}

function requireCurrency(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field).toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new Error(field + ' must be an ISO-4217 currency code for offboarding_payroll_closure_step.');
  }
  return normalized;
}

function requireFiniteAmount(value: number, field: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(field + ' must be a finite number for offboarding_payroll_closure_step.');
  }
  return Math.round(value * 100) / 100;
}

function requireEvidenceRefs(value: string[] | undefined, field: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(field + ' must include at least one evidence reference for offboarding_payroll_closure_step.');
  }
  const refs = value.map((ref, index) => requireNonEmpty(ref, field + '[' + index + ']'));
  return Array.from(new Set(refs)).sort();
}

function requireComponentType(value: OffboardingPayrollClosureMoneyComponentType): OffboardingPayrollClosureMoneyComponentType {
  if (!ALLOWED_COMPONENT_TYPES.includes(value)) {
    throw new Error('component_type must be a supported payroll closure component type.');
  }
  return value;
}

function rejectForbiddenMutation(input: OffboardingPayrollClosureStepInput): void {
  const forbidden: Array<[keyof OffboardingPayrollClosureStepInput, string]> = [
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

  for (const [field, label] of forbidden) {
    if (input[field] === true) {
      throw new Error('offboarding_payroll_closure_step must not perform ' + label + '.');
    }
  }
}

function digestReceipt(receiptWithoutDigest: Omit<OffboardingPayrollClosureStepReceipt, 'payroll_closure_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function normalizeComponent(
  component: OffboardingPayrollClosureMoneyComponent,
  componentIndex: number,
  expectedCurrency: string,
): OffboardingPayrollClosurePreparedComponent {
  const componentRef = requireNonEmpty(component.component_ref, 'money_components[' + componentIndex + '].component_ref');
  const componentType = requireComponentType(component.component_type);
  const currency = requireCurrency(component.currency, 'money_components[' + componentIndex + '].currency');
  if (currency !== expectedCurrency) {
    throw new Error('money_components[' + componentIndex + '].currency must match closure currency.');
  }

  return {
    component_index: componentIndex,
    component_ref: componentRef,
    component_type: componentType,
    amount: requireFiniteAmount(component.amount, 'money_components[' + componentIndex + '].amount'),
    currency,
    evidence_refs: requireEvidenceRefs(component.evidence_refs, 'money_components[' + componentIndex + '].evidence_refs'),
  };
}

function buildBlockers(input: OffboardingPayrollClosureStepInput, preparedComponents: OffboardingPayrollClosurePreparedComponent[]): OffboardingPayrollClosureBlocker[] {
  const blockers: OffboardingPayrollClosureBlocker[] = [];
  if (input.settlement_ready !== true) {
    blockers.push("SETTLEMENT_NOT_READY");
  }
  if (input.asset_recovery_closed !== true) {
    blockers.push("ASSET_RECOVERY_OPEN");
  }
  if (input.access_revocation_review_closed !== true) {
    blockers.push("ACCESS_REVOCATION_REVIEW_OPEN");
  }
  if (input.approval_required === true && requireOptionalNonEmpty(input.approval_ref, 'approval_ref') === null) {
    blockers.push("APPROVAL_MISSING");
  }
  if (input.payroll_period_locked === true) {
    blockers.push("PAYROLL_PERIOD_LOCKED");
  }
  if (preparedComponents.length === 0 || !Array.isArray(input.evidence_refs) || input.evidence_refs.length === 0) {
    blockers.push("EVIDENCE_MISSING");
  }
  return blockers;
}

function sumComponents(preparedComponents: OffboardingPayrollClosurePreparedComponent[], includedTypes: readonly OffboardingPayrollClosureMoneyComponentType[]): number {
  return Math.round(preparedComponents
    .filter((component) => includedTypes.includes(component.component_type))
    .reduce((sum, component) => sum + component.amount, 0) * 100) / 100;
}

export function evaluateOffboardingPayrollClosureStep(input: OffboardingPayrollClosureStepInput): OffboardingPayrollClosureStepReceipt {
  rejectForbiddenMutation(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const offboardingCaseRef = requireNonEmpty(input.offboarding_case_ref, 'offboarding_case_ref');
  const employeeRef = requireNonEmpty(input.employee_ref, 'employee_ref');
  const payrollPeriodRef = requireNonEmpty(input.payroll_period_ref, 'payroll_period_ref');
  const currency = requireCurrency(input.currency, 'currency');
  const closureEffectiveAt = requireTimestamp(input.closure_effective_at, 'closure_effective_at');
  const evaluatedByUserId = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');

  if (!Array.isArray(input.money_components) || input.money_components.length === 0) {
    throw new Error('money_components must include at least one component for offboarding_payroll_closure_step.');
  }

  const preparedComponents = input.money_components.map((component, index) => normalizeComponent(component, index, currency));
  const evidenceRefs = requireEvidenceRefs(input.evidence_refs, 'evidence_refs');
  const blockers = buildBlockers(input, preparedComponents);
  const grossEarningTotal = sumComponents(preparedComponents, ["FINAL_SALARY", "LEAVE_ENCASHMENT", "COMMISSION_RELEASE"]);
  const deductionTotal = sumComponents(preparedComponents, ["COMMISSION_CLAWBACK", "ASSET_DEDUCTION", "TAX_WITHHOLDING"]);
  const holdTotal = sumComponents(preparedComponents, ["SETTLEMENT_HOLD"]);
  const netClosureAmount = Math.round((grossEarningTotal - deductionTotal - holdTotal) * 100) / 100;

  let decision: OffboardingPayrollClosureDecision = "PAYROLL_CLOSURE_READY";
  if (blockers.includes("PAYROLL_PERIOD_LOCKED") || netClosureAmount < 0) {
    decision = "PAYROLL_CLOSURE_REQUIRES_REVIEW";
  } else if (blockers.length > 0) {
    decision = "PAYROLL_CLOSURE_BLOCKED";
  }

  const receiptWithoutDigest: Omit<OffboardingPayrollClosureStepReceipt, 'payroll_closure_evidence_digest'> = {
    seed_id: PHASE_6C_OFFBOARDING_PAYROLL_CLOSURE_STEP_SEED_ID,
    component_id: PHASE_6C_OFFBOARDING_PAYROLL_CLOSURE_STEP_COMPONENT_ID,
    component_slug: "hr_performance_commission_policy_and_offboarding",
    model_name: "Phase6COffboardingPayrollClosureStep",
    event_name: OFFBOARDING_PAYROLL_CLOSURE_STEP_EVALUATED_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    offboarding_case_ref: offboardingCaseRef,
    employee_ref: employeeRef,
    payroll_period_ref: payrollPeriodRef,
    currency,
    closure_effective_at: closureEffectiveAt,
    decision,
    blockers,
    component_count: preparedComponents.length,
    gross_earning_total: grossEarningTotal,
    deduction_total: deductionTotal,
    hold_total: holdTotal,
    net_closure_amount: netClosureAmount,
    prepared_components: preparedComponents,
    settlement_receipt_ref: requireOptionalNonEmpty(input.settlement_receipt_ref, 'settlement_receipt_ref'),
    asset_recovery_receipt_ref: requireOptionalNonEmpty(input.asset_recovery_receipt_ref, 'asset_recovery_receipt_ref'),
    access_revocation_receipt_ref: requireOptionalNonEmpty(input.access_revocation_receipt_ref, 'access_revocation_receipt_ref'),
    approval_ref: requireOptionalNonEmpty(input.approval_ref, 'approval_ref'),
    evidence_refs: evidenceRefs,
    payroll_mutation_performed: false,
    payment_mutation_performed: false,
    event_dispatch_performed: false,
    dlq_write_performed: false,
    schema_mutation_performed: false,
    phase_6a_mutation_performed: false,
    phase_6b_mutation_performed: false,
    runtime_adapter_performed: false,
    ticket_flag_flip_performed: false,
    decision_refs: ["6C-HR-OPS-012", "6C-HR-OPS-011", "6C-ADL-002", "6C-ADL-004", "6C-GLOBAL-018"],
    adl_refs: ["ADL-001", "ADL-002"],
    evidence_artifacts: [
      "offboarding_payroll_closure_step_runtime_receipt",
      "offboarding_payroll_closure_step_validation_result",
      "offboarding_payroll_closure_step_forbidden_behavior_rejection_evidence",
    ],
    evaluated_by_user_id: evaluatedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    payroll_closure_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
