export const PHASE_6C_EMPLOYEE_LIFECYCLE_STATUS_HISTORY_SEED_ID = "seed_6c_008_employee_lifecycle_status_history" as const;
export const PHASE_6C_EMPLOYEE_LIFECYCLE_STATUS_HISTORY_COMPONENT_ID = "6C.01" as const;
export const EMPLOYEE_LIFECYCLE_STATUS_HISTORY_EVENT = "phase_6c.hr_employee_records_and_organisation_structure.employee_lifecycle_status_history.runtime_evaluated" as const;

export type EmployeeLifecycleHardAnchor = 'active' | 'inactive' | 'terminated';

export type EmployeeLifecycleStatusLabel = {
  label_code: string;
  label_text: string;
  anchor: EmployeeLifecycleHardAnchor;
  is_default_for_anchor?: boolean;
};

export type EmployeeLifecycleStatusChange = {
  change_ref: string;
  employee_record_ref: string;
  person_identity_anchor_id: string;
  status_label_code: string;
  effective_at: string;
  reason_ref?: string;
  evidence_ref: string;
};

export type EmployeeLifecycleStatusHistoryRuntimeInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  status_labels: readonly EmployeeLifecycleStatusLabel[];
  status_changes: readonly EmployeeLifecycleStatusChange[];
  control_metadata?: Record<string, unknown>;
  hard_anchor_mutation_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedEmployeeLifecycleStatusChange = EmployeeLifecycleStatusChange & {
  anchor: EmployeeLifecycleHardAnchor;
  label_text: string;
};

export type EmployeeLifecycleStatusHistoryRuntimeReceipt = {
  seed_id: typeof PHASE_6C_EMPLOYEE_LIFECYCLE_STATUS_HISTORY_SEED_ID;
  component_id: typeof PHASE_6C_EMPLOYEE_LIFECYCLE_STATUS_HISTORY_COMPONENT_ID;
  component_slug: "hr_employee_records_and_organisation_structure";
  model_name: "Phase6CEmployeeLifecycleStatusHistory";
  event_name: typeof EMPLOYEE_LIFECYCLE_STATUS_HISTORY_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: 'EMPLOYEE_LIFECYCLE_STATUS_HISTORY_VALIDATED';
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  hard_anchors: readonly EmployeeLifecycleHardAnchor[];
  status_labels: readonly EmployeeLifecycleStatusLabel[];
  status_changes: readonly NormalizedEmployeeLifecycleStatusChange[];
  current_status_by_employee: Record<string, NormalizedEmployeeLifecycleStatusChange>;
  status_counts: {
    labels: number;
    changes: number;
    active_employees: number;
    inactive_employees: number;
    terminated_employees: number;
  };
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
