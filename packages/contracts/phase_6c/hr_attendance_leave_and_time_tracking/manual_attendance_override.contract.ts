export const PHASE_6C_MANUAL_ATTENDANCE_OVERRIDE_SEED_ID = "seed_6c_028_manual_attendance_override" as const;
export const PHASE_6C_MANUAL_ATTENDANCE_OVERRIDE_COMPONENT_ID = "6C.03" as const;
export const MANUAL_ATTENDANCE_OVERRIDE_EVALUATED_EVENT = "phase_6c.hr_attendance_leave_and_time_tracking.manual_attendance_override.evaluated" as const;

export type ManualAttendanceOverrideAction =
  | "CREATE_CHECK_IN"
  | "CREATE_CHECK_OUT"
  | "CORRECT_CHECK_IN"
  | "CORRECT_CHECK_OUT"
  | "MARK_ABSENT";

export type ManualAttendanceOverrideDecision =
  | "APPROVED_FOR_RECORDING"
  | "PENDING_APPROVAL"
  | "REJECTED";

export type ManualAttendanceOverrideInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  override_action: ManualAttendanceOverrideAction;
  override_effective_at: string;
  server_recorded_at: string;
  reason_ref: string;
  reason_text: string;
  requested_by_user_id: string;
  approval_required?: boolean;
  approval_ref?: string;
  duplicate_detected?: boolean;
  duplicate_exception_ref?: string;
  fallback_method_ref?: string;
  control_metadata?: Record<string, unknown>;
  reasonless_override_requested?: boolean;
  approval_bypass_requested?: boolean;
  direct_attendance_record_mutation_requested?: boolean;
  provider_specific_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type ManualAttendanceOverrideReceipt = {
  seed_id: typeof PHASE_6C_MANUAL_ATTENDANCE_OVERRIDE_SEED_ID;
  component_id: typeof PHASE_6C_MANUAL_ATTENDANCE_OVERRIDE_COMPONENT_ID;
  component_slug: "hr_attendance_leave_and_time_tracking";
  model_name: "Phase6CManualAttendanceOverride";
  event_name: typeof MANUAL_ATTENDANCE_OVERRIDE_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  override_action: ManualAttendanceOverrideAction;
  override_effective_at: string;
  server_recorded_at: string;
  requested_by_user_id: string;
  reason_ref: string;
  reason_text: string;
  approval_required: boolean;
  approval_default_on: true;
  approval_ref: string | null;
  duplicate_detected: boolean;
  duplicate_exception_ref: string | null;
  duplicate_exception_recorded: boolean;
  fallback_method_ref: string | null;
  provider_neutral_only: true;
  fallback_methods_allowed: true;
  attendance_record_mutation_allowed: false;
  runtime_status: "MANUAL_ATTENDANCE_OVERRIDE_EVALUATED";
  decision: ManualAttendanceOverrideDecision;
  rejection_reasons: readonly string[];
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  override_evidence_digest: string;
};
