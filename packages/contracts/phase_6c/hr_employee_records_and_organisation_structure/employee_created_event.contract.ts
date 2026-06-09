export const PHASE_6C_EMPLOYEE_CREATED_EVENT_SEED_ID = "seed_6c_010_employee_created_event" as const;
export const PHASE_6C_EMPLOYEE_CREATED_EVENT_COMPONENT_ID = "6C.01" as const;
export const EMPLOYEE_CREATED_EVENT = "phase_6c.hr_employee_records_and_organisation_structure.employee_created" as const;

export type EmployeeCreationOrigin = 'DIRECT_HR_CREATE' | 'RECRUITMENT_OFFER_ACCEPTANCE_RECOMMENDATION' | 'BULK_IMPORT';
export type EmployeeCreatedEventTarget = 'WORKSPACE_FOUNDATION_REFERENCE' | 'PHASE_6B_PAYROLL_FOUNDATION_REFERENCE';

export type EmployeeCreatedEventInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  employee_record_ref: string;
  person_identity_anchor_id: string;
  employee_number_ref: string;
  lifecycle_anchor: 'active' | 'inactive';
  creation_origin: EmployeeCreationOrigin;
  event_targets: readonly EmployeeCreatedEventTarget[];
  control_metadata?: Record<string, unknown>;
  workspace_provisioning_requested?: boolean;
  payroll_record_creation_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type EmployeeCreatedEventEnvelope = {
  event_ref: string;
  event_name: typeof EMPLOYEE_CREATED_EVENT;
  event_target: EmployeeCreatedEventTarget;
  employee_record_ref: string;
  person_identity_anchor_id: string;
  employee_number_ref: string;
  creation_origin: EmployeeCreationOrigin;
  evidence_mode: 'REFERENCE_ONLY';
  evidence_hash: string;
};

export type EmployeeCreatedEventReceipt = {
  seed_id: typeof PHASE_6C_EMPLOYEE_CREATED_EVENT_SEED_ID;
  component_id: typeof PHASE_6C_EMPLOYEE_CREATED_EVENT_COMPONENT_ID;
  component_slug: "hr_employee_records_and_organisation_structure";
  model_name: "Phase6CEmployeeCreatedEvent";
  event_name: typeof EMPLOYEE_CREATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: 'EMPLOYEE_CREATED_EVENT_EMITTED';
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  workspace_provisioning_allowed: false;
  payroll_record_creation_allowed: false;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  employee_record_ref: string;
  person_identity_anchor_id: string;
  employee_number_ref: string;
  lifecycle_anchor: 'active' | 'inactive';
  creation_origin: EmployeeCreationOrigin;
  event_envelopes: readonly EmployeeCreatedEventEnvelope[];
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
