export const PHASE_6C_EMPLOYEE_SENSITIVE_FIELD_REDACTION_SEED_ID = "seed_6c_009_employee_sensitive_field_redaction" as const;
export const PHASE_6C_EMPLOYEE_SENSITIVE_FIELD_REDACTION_COMPONENT_ID = "6C.01" as const;
export const EMPLOYEE_SENSITIVE_FIELD_REDACTION_EVENT = "phase_6c.hr_employee_records_and_organisation_structure.employee_sensitive_field_redaction.runtime_evaluated" as const;

export type EmployeeSensitiveFieldKey = 'compensation' | 'national_id' | 'bank' | 'health' | 'emergency_contact' | 'performance' | 'disciplinary';
export type EmployeeSensitiveViewerRole = 'SELF' | 'HR_AUTHORIZED' | 'MANAGER' | 'WORKSPACE_ADMIN' | 'SUPPORT_OPERATOR';

export type EmployeeSensitiveRecord = {
  employee_record_ref: string;
  person_identity_anchor_id: string;
  sensitive_fields: Record<EmployeeSensitiveFieldKey, string>;
};

export type EmployeeSupportWindow = {
  support_window_ref: string;
  authorized_by_user_id: string;
  audit_reason_ref: string;
  expires_at: string;
};

export type EmployeeSensitiveFieldRedactionRuntimeInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  viewer_role: EmployeeSensitiveViewerRole;
  viewer_employee_record_ref?: string;
  support_window?: EmployeeSupportWindow;
  records: readonly EmployeeSensitiveRecord[];
  control_metadata?: Record<string, unknown>;
  support_window_bypass_requested?: boolean;
  unrestricted_export_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type RedactedEmployeeSensitiveRecord = {
  employee_record_ref: string;
  person_identity_anchor_id: string;
  visible_fields: Partial<Record<EmployeeSensitiveFieldKey, string>>;
  redacted_fields: readonly EmployeeSensitiveFieldKey[];
};

export type EmployeeSensitiveFieldRedactionRuntimeReceipt = {
  seed_id: typeof PHASE_6C_EMPLOYEE_SENSITIVE_FIELD_REDACTION_SEED_ID;
  component_id: typeof PHASE_6C_EMPLOYEE_SENSITIVE_FIELD_REDACTION_COMPONENT_ID;
  component_slug: "hr_employee_records_and_organisation_structure";
  model_name: "Phase6CEmployeeSensitiveFieldRedaction";
  event_name: typeof EMPLOYEE_SENSITIVE_FIELD_REDACTION_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: 'EMPLOYEE_SENSITIVE_FIELDS_REDACTED';
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  viewer_role: EmployeeSensitiveViewerRole;
  support_window_applied: boolean;
  support_window_ref?: string;
  redacted_records: readonly RedactedEmployeeSensitiveRecord[];
  redaction_counts: {
    records: number;
    visible_field_count: number;
    redacted_field_count: number;
  };
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
