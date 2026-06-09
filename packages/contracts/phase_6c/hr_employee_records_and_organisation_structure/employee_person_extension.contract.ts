export const PHASE_6C_EMPLOYEE_PERSON_EXTENSION_SEED_ID = "seed_6c_001_employee_person_extension" as const;
export const PHASE_6C_EMPLOYEE_PERSON_EXTENSION_COMPONENT_ID = "6C.01" as const;
export const EMPLOYEE_PERSON_EXTENSION_EVENT = "phase_6c.hr_employee_records_and_organisation_structure.employee_person_extension.recorded" as const;

export type EmployeePersonExtensionStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_ONBOARDING';

export type EmployeePersonExtensionInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  person_identity_graph_ref: string;
  employee_record_ref: string;
  employee_number?: string;
  extension_status: EmployeePersonExtensionStatus;
  effective_at: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  source_record_ref?: string;
  control_metadata?: Record<string, unknown>;
  identity_anchor?: {
    organization_id: string;
    person_identity_graph_ref: string;
  };
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type EmployeePersonExtensionReceipt = {
  seed_id: typeof PHASE_6C_EMPLOYEE_PERSON_EXTENSION_SEED_ID;
  component_id: typeof PHASE_6C_EMPLOYEE_PERSON_EXTENSION_COMPONENT_ID;
  component_slug: "hr_employee_records_and_organisation_structure";
  model_name: "Phase6CEmployeePersonExtension";
  event_name: typeof EMPLOYEE_PERSON_EXTENSION_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  person_identity_graph_ref: string;
  employee_record_ref: string;
  employee_number: string | null;
  extension_status: EmployeePersonExtensionStatus;
  effective_at: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  source_record_ref: string;
  decision_refs: readonly string[];
  dependency_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  runtime_status: 'RUNTIME_BEHAVIOR_RECORDED';
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  employee_person_extension_evidence_digest: string;
};
