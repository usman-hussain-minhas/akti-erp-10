export const PHASE_6C_COMMISSION_CLAWBACK_REVERSAL_SEED_ID = "seed_6c_045_commission_clawback_reversal" as const;
export const PHASE_6C_COMMISSION_CLAWBACK_REVERSAL_COMPONENT_ID = "6C.04" as const;
export const COMMISSION_CLAWBACK_REVERSAL_EVALUATED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.commission_clawback_reversal.evaluated" as const;

export type CommissionClawbackReversalReason =
  | "CUSTOMER_REFUND"
  | "DEAL_CANCELLATION"
  | "PAYMENT_REVERSAL"
  | "COMPLIANCE_HOLD"
  | "MANUAL_CORRECTION";

export type CommissionClawbackReversalOutcome =
  | "FULL_REVERSAL_READY"
  | "PARTIAL_REVERSAL_READY"
  | "REVERSAL_REQUIRES_REVIEW";

export type CommissionClawbackReversalDecision =
  | "CLAWBACK_REVERSAL_READY"
  | "CLAWBACK_REVERSAL_PARTIAL"
  | "CLAWBACK_REVERSAL_REQUIRES_REVIEW";

export type CommissionClawbackReversalItem = {
  commission_receipt_ref: string;
  employee_ref: string;
  commission_plan_ref: string;
  original_commission_amount: number;
  paid_commission_amount: number;
  prior_reversal_amount?: number;
  reversal_requested_amount: number;
  reason: CommissionClawbackReversalReason;
  approved_for_reversal: boolean;
  source_evidence_ref: string;
  currency?: string;
  review_note?: string;
  evidence_refs: readonly string[];
};

export type CommissionClawbackReversalInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  reversal_batch_ref: string;
  period_ref: string;
  currency: string;
  reversal_items: readonly CommissionClawbackReversalItem[];
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

export type CommissionClawbackReversalPlanItem = {
  commission_receipt_ref: string;
  employee_ref: string;
  commission_plan_ref: string;
  reason: CommissionClawbackReversalReason;
  currency: string;
  original_commission_amount: number;
  paid_commission_amount: number;
  prior_reversal_amount: number;
  reversal_requested_amount: number;
  maximum_reversible_amount: number;
  approved_reversal_amount: number;
  unreversed_requested_amount: number;
  outcome: CommissionClawbackReversalOutcome;
  source_evidence_ref: string;
  review_note?: string;
  evidence_refs: readonly string[];
};

export type CommissionClawbackReversalReceipt = {
  seed_id: typeof PHASE_6C_COMMISSION_CLAWBACK_REVERSAL_SEED_ID;
  component_id: typeof PHASE_6C_COMMISSION_CLAWBACK_REVERSAL_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6CCommissionClawbackReversal";
  event_name: typeof COMMISSION_CLAWBACK_REVERSAL_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  reversal_batch_ref: string;
  period_ref: string;
  currency: string;
  reversal_item_count: number;
  full_reversal_count: number;
  partial_reversal_count: number;
  review_reversal_count: number;
  requested_reversal_amount_total: number;
  approved_reversal_amount_total: number;
  unreversed_requested_amount_total: number;
  decision: CommissionClawbackReversalDecision;
  planned_reversals: readonly CommissionClawbackReversalPlanItem[];
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
  clawback_reversal_digest: string;
};
