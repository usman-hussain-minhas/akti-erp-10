export const PHASE_6C_COMMISSION_PAYROLL_BATCH_EVENT_SEED_ID = "seed_6c_048_commission_payroll_batch_event" as const;
export const PHASE_6C_COMMISSION_PAYROLL_BATCH_EVENT_COMPONENT_ID = "6C.04" as const;
export const COMMISSION_PAYROLL_BATCH_EVENT_SCAFFOLD_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.commission_payroll_batch_event.scaffold_control_evaluated" as const;

export type CommissionPayrollBatchEventScaffoldInput = {
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

export type CommissionPayrollBatchEventScaffoldReceipt = {
  seed_id: typeof PHASE_6C_COMMISSION_PAYROLL_BATCH_EVENT_SEED_ID;
  component_id: typeof PHASE_6C_COMMISSION_PAYROLL_BATCH_EVENT_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6CCommissionPayrollBatchEvent";
  event_name: typeof COMMISSION_PAYROLL_BATCH_EVENT_SCAFFOLD_EVENT;
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
