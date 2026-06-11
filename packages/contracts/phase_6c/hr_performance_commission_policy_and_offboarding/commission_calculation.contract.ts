export const PHASE_6C_COMMISSION_CALCULATION_SEED_ID = "seed_6c_043_commission_calculation" as const;
export const PHASE_6C_COMMISSION_CALCULATION_COMPONENT_ID = "6C.04" as const;
export const COMMISSION_CALCULATION_EVALUATED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.commission_calculation.evaluated" as const;

export type CommissionCalculationBasis =
  | "CRM_REVENUE"
  | "PAYMENT_COLLECTION"
  | "INVOICE_MARGIN"
  | "MANUAL_EVIDENCE_ADJUSTMENT";

export type CommissionCalculationDecision =
  | "COMMISSION_EVIDENCE_READY"
  | "COMMISSION_CAPPED"
  | "COMMISSION_REQUIRES_REVIEW";

export type CommissionCalculationEvidenceLine = {
  evidence_ref: string;
  source_phase_ref: "6B_CRM" | "6B_PAYMENTS" | "6B_INVOICING" | "MANUAL_APPROVED_EVIDENCE";
  basis: CommissionCalculationBasis;
  eligible_amount: number;
  approved: boolean;
  commission_rate_percent?: number;
  currency?: string;
  evidence_note?: string;
};

export type CommissionCalculationInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  commission_plan_ref: string;
  period_ref: string;
  default_commission_rate_percent: number;
  max_commission_amount?: number;
  currency: string;
  evidence_lines: readonly CommissionCalculationEvidenceLine[];
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

export type CommissionCalculationReceipt = {
  seed_id: typeof PHASE_6C_COMMISSION_CALCULATION_SEED_ID;
  component_id: typeof PHASE_6C_COMMISSION_CALCULATION_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6CCommissionCalculation";
  event_name: typeof COMMISSION_CALCULATION_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  commission_plan_ref: string;
  period_ref: string;
  currency: string;
  evidence_line_count: number;
  approved_line_count: number;
  rejected_line_count: number;
  eligible_amount_total: number;
  gross_commission_amount: number;
  cap_adjustment_amount: number;
  payable_commission_amount: number;
  decision: CommissionCalculationDecision;
  payroll_mutation_allowed: false;
  payment_mutation_allowed: false;
  crm_mutation_allowed: false;
  provider_specific_adapter_allowed: false;
  schema_mutation_allowed: false;
  phase_6a_mutation_allowed: false;
  phase_6b_mutation_allowed: false;
  runtime_adapter_allowed: false;
  ticket_flag_flip_allowed: false;
  source_evidence_refs: readonly string[];
  decision_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  evidence_artifacts: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  commission_evidence_digest: string;
};
