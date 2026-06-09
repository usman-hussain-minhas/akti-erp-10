export const PHASE_6C_LEAVE_TYPE_REGISTRY_SEED_ID = "seed_6c_033_leave_type_registry" as const;
export const PHASE_6C_LEAVE_TYPE_REGISTRY_COMPONENT_ID = "6C.03" as const;
export const LEAVE_TYPE_REGISTRY_EVALUATED_EVENT = "phase_6c.hr_attendance_leave_and_time_tracking.leave_type_registry.evaluated" as const;

export type LeaveTypeCategory = "PAID" | "UNPAID" | "STATUTORY" | "SPECIAL";
export type LeaveEntitlementUnit = "DAYS" | "HOURS";
export type LeaveTypeRegistryDecision = "REGISTRY_ACCEPTED" | "REGISTRY_REJECTED";

export type LeaveTypeDefinition = {
  leave_type_ref: string;
  leave_code: string;
  display_name: string;
  category: LeaveTypeCategory;
  entitlement_unit: LeaveEntitlementUnit;
  paid: boolean;
  requestable_by_employee: boolean;
  accrual_enabled: boolean;
  carry_forward_enabled: boolean;
  requires_approval: boolean;
  negative_balance_allowed: boolean;
  annual_entitlement_units?: number;
  max_carry_forward_units?: number;
};

export type LeaveTypeRegistryInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  registry_ref: string;
  effective_from: string;
  effective_to: string;
  leave_types: readonly LeaveTypeDefinition[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  direct_attendance_record_mutation_requested?: boolean;
  provider_specific_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type LeaveTypeRegistryIssue = {
  issue_type: "DUPLICATE_LEAVE_CODE" | "ACCRUAL_REQUIRES_ENTITLEMENT" | "CARRY_FORWARD_REQUIRES_ACCRUAL" | "CARRY_FORWARD_REQUIRES_LIMIT";
  leave_type_ref: string;
  leave_code: string;
  evidence_ref: string;
};

export type LeaveTypeRegistryReceipt = {
  seed_id: typeof PHASE_6C_LEAVE_TYPE_REGISTRY_SEED_ID;
  component_id: typeof PHASE_6C_LEAVE_TYPE_REGISTRY_COMPONENT_ID;
  component_slug: "hr_attendance_leave_and_time_tracking";
  model_name: "Phase6CLeaveTypeRegistry";
  event_name: typeof LEAVE_TYPE_REGISTRY_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  registry_ref: string;
  effective_from: string;
  effective_to: string;
  leave_type_count: number;
  paid_leave_type_count: number;
  employee_requestable_count: number;
  accrual_enabled_count: number;
  carry_forward_enabled_count: number;
  decision: LeaveTypeRegistryDecision;
  issues: readonly LeaveTypeRegistryIssue[];
  provider_neutral_only: true;
  attendance_record_mutation_allowed: false;
  runtime_status: "LEAVE_TYPE_REGISTRY_EVALUATED";
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  leave_type_registry_evidence_digest: string;
};
