export const PHASE_6C_COMMISSION_TIER_ACCELERATOR_SEED_ID = "seed_6c_046_commission_tier_accelerator" as const;
export const PHASE_6C_COMMISSION_TIER_ACCELERATOR_COMPONENT_ID = "6C.04" as const;
export const COMMISSION_TIER_ACCELERATOR_EVALUATED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.commission_tier_accelerator.evaluated" as const;

export type CommissionTierAcceleratorDecision =
  | "TIER_ACCELERATOR_QUALIFIED"
  | "TIER_ACCELERATOR_CAPPED"
  | "TIER_ACCELERATOR_NOT_QUALIFIED"
  | "TIER_ACCELERATOR_REQUIRES_REVIEW";

export type CommissionTierDefinition = {
  tier_id: string;
  tier_label: string;
  threshold_amount: number;
  accelerator_rate_percent: number;
  active: boolean;
  max_accelerator_amount?: number;
};

export type CommissionTierAcceleratorInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  commission_plan_ref: string;
  period_ref: string;
  currency: string;
  attainment_amount: number;
  base_commission_amount: number;
  evidence_refs: readonly string[];
  tier_definitions: readonly CommissionTierDefinition[];
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

export type CommissionTierAcceleratorReceipt = {
  seed_id: typeof PHASE_6C_COMMISSION_TIER_ACCELERATOR_SEED_ID;
  component_id: typeof PHASE_6C_COMMISSION_TIER_ACCELERATOR_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6CCommissionTierAccelerator";
  event_name: typeof COMMISSION_TIER_ACCELERATOR_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  commission_plan_ref: string;
  period_ref: string;
  currency: string;
  attainment_amount: number;
  base_commission_amount: number;
  selected_tier_id: string | null;
  selected_tier_label: string | null;
  selected_tier_threshold_amount: number | null;
  accelerator_rate_percent: number;
  gross_accelerator_amount: number;
  capped_adjustment_amount: number;
  payable_accelerator_amount: number;
  total_commission_with_accelerator: number;
  qualified_tier_count: number;
  decision: CommissionTierAcceleratorDecision;
  source_evidence_refs: readonly string[];
  payroll_mutation_allowed: false;
  payment_mutation_allowed: false;
  crm_mutation_allowed: false;
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
  tier_accelerator_digest: string;
};
