export const PHASE_6C_EMPLOYEE_NUMBER_POLICY_SEED_ID = "seed_6c_002_employee_number_policy" as const;
export const PHASE_6C_EMPLOYEE_NUMBER_POLICY_COMPONENT_ID = "6C.01" as const;
export const EMPLOYEE_NUMBER_POLICY_EVENT = "phase_6c.hr_employee_records_and_organisation_structure.employee_number_policy.evaluated" as const;

export type EmployeeDisplayNumberPolicyConfig = {
  prefix: string;
  sequence_value: number;
  padding_width: number;
  separator?: string;
  suffix?: string;
};

export type EmployeeNumberPolicyInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  stable_employee_uuid: string;
  employee_person_extension_ref: string;
  policy_config: EmployeeDisplayNumberPolicyConfig;
  evaluated_by_user_id: string;
  evaluated_at: string;
  source_record_ref?: string;
  control_metadata?: Record<string, unknown>;
  hardcoded_display_number_requested?: boolean;
  schema_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type EmployeeNumberPolicyReceipt = {
  seed_id: typeof PHASE_6C_EMPLOYEE_NUMBER_POLICY_SEED_ID;
  component_id: typeof PHASE_6C_EMPLOYEE_NUMBER_POLICY_COMPONENT_ID;
  component_slug: "hr_employee_records_and_organisation_structure";
  model_name: "Phase6CEmployeeNumberPolicy";
  event_name: typeof EMPLOYEE_NUMBER_POLICY_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  stable_employee_uuid: string;
  employee_person_extension_ref: string;
  display_employee_number: string;
  policy_config: Required<EmployeeDisplayNumberPolicyConfig>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  source_record_ref: string;
  decision_refs: readonly string[];
  dependency_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  runtime_status: 'EMPLOYEE_NUMBER_POLICY_EVALUATED';
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  employee_number_policy_evidence_digest: string;
};
