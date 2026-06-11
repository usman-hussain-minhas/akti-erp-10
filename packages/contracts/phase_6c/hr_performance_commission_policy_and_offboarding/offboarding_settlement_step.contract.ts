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
