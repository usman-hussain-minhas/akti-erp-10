export const PHASE_6C_EMPLOYEE_LIFECYCLE_STATUS_HISTORY_SEED_ID = "seed_6c_008_employee_lifecycle_status_history" as const;
export const PHASE_6C_EMPLOYEE_LIFECYCLE_STATUS_HISTORY_COMPONENT_ID = "6C.01" as const;
export const EMPLOYEE_LIFECYCLE_STATUS_HISTORY_SCAFFOLD_EVENT = "phase_6c.hr_employee_records_and_organisation_structure.employee_lifecycle_status_history.scaffold_control_evaluated" as const;

export type EmployeeLifecycleStatusHistoryScaffoldInput = {
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

export type EmployeeLifecycleStatusHistoryScaffoldReceipt = {
  seed_id: typeof PHASE_6C_EMPLOYEE_LIFECYCLE_STATUS_HISTORY_SEED_ID;
  component_id: typeof PHASE_6C_EMPLOYEE_LIFECYCLE_STATUS_HISTORY_COMPONENT_ID;
  component_slug: "hr_employee_records_and_organisation_structure";
  model_name: "Phase6CEmployeeLifecycleStatusHistory";
  event_name: typeof EMPLOYEE_LIFECYCLE_STATUS_HISTORY_SCAFFOLD_EVENT;
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
