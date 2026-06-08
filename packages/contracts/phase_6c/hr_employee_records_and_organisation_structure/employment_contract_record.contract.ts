export const PHASE_6C_EMPLOYMENT_CONTRACT_RECORD_SEED_ID = "seed_6c_005_employment_contract_record" as const;
export const PHASE_6C_EMPLOYMENT_CONTRACT_RECORD_COMPONENT_ID = "6C.01" as const;
export const EMPLOYMENT_CONTRACT_RECORD_SCAFFOLD_EVENT = "phase_6c.hr_employee_records_and_organisation_structure.employment_contract_record.scaffold_control_evaluated" as const;

export type EmploymentContractRecordScaffoldInput = {
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

export type EmploymentContractRecordScaffoldReceipt = {
  seed_id: typeof PHASE_6C_EMPLOYMENT_CONTRACT_RECORD_SEED_ID;
  component_id: typeof PHASE_6C_EMPLOYMENT_CONTRACT_RECORD_COMPONENT_ID;
  component_slug: "hr_employee_records_and_organisation_structure";
  model_name: "Phase6CEmploymentContractRecord";
  event_name: typeof EMPLOYMENT_CONTRACT_RECORD_SCAFFOLD_EVENT;
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
