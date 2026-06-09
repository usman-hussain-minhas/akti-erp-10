export const PHASE_6C_ATTENDANCE_EXCEPTION_DETECTION_SEED_ID = "seed_6c_030_attendance_exception_detection" as const;
export const PHASE_6C_ATTENDANCE_EXCEPTION_DETECTION_COMPONENT_ID = "6C.03" as const;
export const ATTENDANCE_EXCEPTION_DETECTION_EVALUATED_EVENT = "phase_6c.hr_attendance_leave_and_time_tracking.attendance_exception_detection.evaluated" as const;

export type AttendanceExceptionType =
  | "DUPLICATE_ATTENDANCE"
  | "CLOCK_SKEW_EXCEEDED"
  | "LATE_CHECK_IN"
  | "MISSING_CHECKOUT";

export type AttendanceExceptionDecision =
  | "NO_EXCEPTION"
  | "EXCEPTION_DETECTED";

export type AttendanceExceptionSeverity =
  | "INFO"
  | "WARNING"
  | "REVIEW_REQUIRED";

export type AttendanceExceptionDetectionInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  attendance_date: string;
  scheduled_start_at: string;
  scheduled_end_at: string;
  server_recorded_at: string;
  actual_check_in_at?: string;
  actual_check_out_at?: string;
  device_captured_at?: string;
  duplicate_detected?: boolean;
  max_clock_skew_seconds: number;
  late_grace_period_minutes: number;
  missing_checkout_grace_period_minutes: number;
  fallback_method_ref?: string;
  provider_channel_ref?: string;
  control_metadata?: Record<string, unknown>;
  direct_attendance_record_mutation_requested?: boolean;
  provider_specific_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type AttendanceExceptionRecord = {
  exception_type: AttendanceExceptionType;
  severity: AttendanceExceptionSeverity;
  evidence_ref: string;
  measured_value: number | null;
  threshold_value: number | null;
};

export type AttendanceExceptionDetectionReceipt = {
  seed_id: typeof PHASE_6C_ATTENDANCE_EXCEPTION_DETECTION_SEED_ID;
  component_id: typeof PHASE_6C_ATTENDANCE_EXCEPTION_DETECTION_COMPONENT_ID;
  component_slug: "hr_attendance_leave_and_time_tracking";
  model_name: "Phase6CAttendanceExceptionDetection";
  event_name: typeof ATTENDANCE_EXCEPTION_DETECTION_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  attendance_date: string;
  scheduled_start_at: string;
  scheduled_end_at: string;
  server_recorded_at: string;
  actual_check_in_at: string | null;
  actual_check_out_at: string | null;
  device_captured_at: string | null;
  max_clock_skew_seconds: number;
  late_grace_period_minutes: number;
  missing_checkout_grace_period_minutes: number;
  observed_clock_skew_seconds: number | null;
  observed_late_minutes: number | null;
  missing_checkout_elapsed_minutes: number | null;
  duplicate_detected: boolean;
  fallback_method_ref: string | null;
  provider_channel_ref: string | null;
  provider_neutral_only: true;
  fallback_methods_allowed: true;
  attendance_record_mutation_allowed: false;
  runtime_status: "ATTENDANCE_EXCEPTION_DETECTION_EVALUATED";
  decision: AttendanceExceptionDecision;
  exceptions: readonly AttendanceExceptionRecord[];
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  exception_detection_evidence_digest: string;
};
