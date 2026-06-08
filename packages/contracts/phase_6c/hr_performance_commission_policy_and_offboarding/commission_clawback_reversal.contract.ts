export const PHASE_6C_COMMISSION_CLAWBACK_REVERSAL_SEED_ID = "seed_6c_045_commission_clawback_reversal" as const;
export const PHASE_6C_COMMISSION_CLAWBACK_REVERSAL_COMPONENT_ID = "6C.04" as const;
export const COMMISSION_CLAWBACK_REVERSAL_SCAFFOLD_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.commission_clawback_reversal.scaffold_control_evaluated" as const;

export type CommissionClawbackReversalScaffoldInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  capability_execution_requested?: boolean;
  business_behavior_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type CommissionClawbackReversalScaffoldReceipt = {
  seed_id: typeof PHASE_6C_COMMISSION_CLAWBACK_REVERSAL_SEED_ID;
  component_id: typeof PHASE_6C_COMMISSION_CLAWBACK_REVERSAL_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6CCommissionClawbackReversal";
  event_name: typeof COMMISSION_CLAWBACK_REVERSAL_SCAFFOLD_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  scaffold_status: 'SCAFFOLD_CONTROL_ONLY';
  capability_implementation_allowed: false;
  business_behavior_allowed: false;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  scaffold_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
