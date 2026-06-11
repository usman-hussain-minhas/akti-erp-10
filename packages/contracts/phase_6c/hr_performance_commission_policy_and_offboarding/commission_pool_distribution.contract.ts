export const PHASE_6C_COMMISSION_POOL_DISTRIBUTION_SEED_ID = "seed_6c_047_commission_pool_distribution" as const;
export const PHASE_6C_COMMISSION_POOL_DISTRIBUTION_COMPONENT_ID = "6C.04" as const;
export const COMMISSION_POOL_DISTRIBUTION_EVALUATED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.commission_pool_distribution.evaluated" as const;

export type CommissionPoolDistributionOutcome =
  | "ALLOCATED"
  | "CAPPED"
  | "INELIGIBLE"
  | "REQUIRES_REVIEW";

export type CommissionPoolDistributionDecision =
  | "POOL_DISTRIBUTION_READY"
  | "POOL_DISTRIBUTION_PARTIAL"
  | "POOL_DISTRIBUTION_REQUIRES_REVIEW";

export type CommissionPoolParticipant = {
  employee_ref: string;
  commission_plan_ref: string;
  eligibility_weight: number;
  eligible: boolean;
  minimum_guarantee_amount?: number;
  maximum_distribution_amount?: number;
  evidence_refs: readonly string[];
};

export type CommissionPoolDistributionInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  pool_ref: string;
  period_ref: string;
  currency: string;
  pool_amount: number;
  participants: readonly CommissionPoolParticipant[];
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

export type CommissionPoolDistributionLine = {
  employee_ref: string;
  commission_plan_ref: string;
  eligibility_weight: number;
  minimum_guarantee_amount: number;
  maximum_distribution_amount: number | null;
  allocated_amount: number;
  outcome: CommissionPoolDistributionOutcome;
  evidence_refs: readonly string[];
};

export type CommissionPoolDistributionReceipt = {
  seed_id: typeof PHASE_6C_COMMISSION_POOL_DISTRIBUTION_SEED_ID;
  component_id: typeof PHASE_6C_COMMISSION_POOL_DISTRIBUTION_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6CCommissionPoolDistribution";
  event_name: typeof COMMISSION_POOL_DISTRIBUTION_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  pool_ref: string;
  period_ref: string;
  currency: string;
  pool_amount: number;
  participant_count: number;
  eligible_participant_count: number;
  allocated_amount_total: number;
  undistributed_amount: number;
  capped_participant_count: number;
  decision: CommissionPoolDistributionDecision;
  distribution_lines: readonly CommissionPoolDistributionLine[];
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
  pool_distribution_digest: string;
};
