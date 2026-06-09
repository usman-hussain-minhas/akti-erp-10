export const PHASE_6C_EMPLOYEE_DOCUMENT_BOUNDARY_SEED_ID = "seed_6c_006_employee_document_boundary" as const;
export const PHASE_6C_EMPLOYEE_DOCUMENT_BOUNDARY_COMPONENT_ID = "6C.01" as const;
export const EMPLOYEE_DOCUMENT_BOUNDARY_EVENT = "phase_6c.hr_employee_records_and_organisation_structure.employee_document_boundary.runtime_evaluated" as const;

export type EmployeeDocumentType = 'CONTRACT' | 'IDENTITY_PROOF' | 'CERTIFICATION' | 'VISA' | 'POLICY_ACKNOWLEDGEMENT' | 'OTHER';
export type EmployeeDocumentSensitivity = 'STANDARD' | 'CONFIDENTIAL' | 'RESTRICTED';
export type EmployeeDocumentLifecycleStatus = 'ACTIVE' | 'EXPIRED' | 'EXPIRING_SOON';

export type EmployeeDocumentReference = {
  document_ref: string;
  employee_record_ref: string;
  person_identity_anchor_id: string;
  file_service_object_ref: string;
  document_type: EmployeeDocumentType;
  sensitivity: EmployeeDocumentSensitivity;
  issued_at?: string;
  expires_at?: string;
  retention_policy_ref: string;
  evidence_hash: string;
};

export type EmployeeDocumentBoundaryRuntimeInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  documents: readonly EmployeeDocumentReference[];
  control_metadata?: Record<string, unknown>;
  raw_file_bytes_requested?: boolean;
  direct_storage_uri_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedEmployeeDocumentReference = EmployeeDocumentReference & {
  lifecycle_status: EmployeeDocumentLifecycleStatus;
};

export type EmployeeDocumentBoundaryRuntimeReceipt = {
  seed_id: typeof PHASE_6C_EMPLOYEE_DOCUMENT_BOUNDARY_SEED_ID;
  component_id: typeof PHASE_6C_EMPLOYEE_DOCUMENT_BOUNDARY_COMPONENT_ID;
  component_slug: "hr_employee_records_and_organisation_structure";
  model_name: "Phase6CEmployeeDocumentBoundary";
  event_name: typeof EMPLOYEE_DOCUMENT_BOUNDARY_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: 'EMPLOYEE_DOCUMENT_BOUNDARY_VALIDATED';
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  documents: readonly NormalizedEmployeeDocumentReference[];
  document_counts: {
    total_documents: number;
    confidential_or_restricted: number;
    expired_documents: number;
    expiring_soon_documents: number;
  };
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
