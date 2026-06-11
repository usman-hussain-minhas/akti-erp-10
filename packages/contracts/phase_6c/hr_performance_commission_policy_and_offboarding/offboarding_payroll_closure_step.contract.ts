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
