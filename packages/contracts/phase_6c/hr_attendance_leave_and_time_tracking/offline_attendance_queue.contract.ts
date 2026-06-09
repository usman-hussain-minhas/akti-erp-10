export const PHASE_6C_OFFLINE_ATTENDANCE_QUEUE_SEED_ID = "seed_6c_029_offline_attendance_queue" as const;
export const PHASE_6C_OFFLINE_ATTENDANCE_QUEUE_COMPONENT_ID = "6C.03" as const;
export const OFFLINE_ATTENDANCE_QUEUE_EVALUATED_EVENT = "phase_6c.hr_attendance_leave_and_time_tracking.offline_attendance_queue.evaluated" as const;

export type OfflineAttendanceQueueMethod =
  | "QR"
  | "BIOMETRIC"
  | "RFID_NFC"
  | "MOBILE_GPS"
  | "MANUAL_OVERRIDE";

export type OfflineAttendanceQueueEventType =
  | "CHECK_IN"
  | "CHECK_OUT"
  | "BREAK_START"
  | "BREAK_END";

export type OfflineAttendanceQueueDecision =
  | "QUEUED_PENDING_CONNECTIVITY"
  | "REPLAY_ACCEPTED_FOR_PROCESSING"
  | "REPLAY_REJECTED";

export type OfflineAttendanceQueueInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  offline_capture_ref: string;
  attendance_method: OfflineAttendanceQueueMethod;
  attendance_event_type: OfflineAttendanceQueueEventType;
  captured_at_device: string;
  queued_at: string;
  server_received_at: string;
  replay_requested_at: string;
  connectivity_restored: boolean;
  max_clock_skew_seconds: number;
  duplicate_detected?: boolean;
  duplicate_exception_ref?: string;
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

export type OfflineAttendanceQueueReceipt = {
  seed_id: typeof PHASE_6C_OFFLINE_ATTENDANCE_QUEUE_SEED_ID;
  component_id: typeof PHASE_6C_OFFLINE_ATTENDANCE_QUEUE_COMPONENT_ID;
  component_slug: "hr_attendance_leave_and_time_tracking";
  model_name: "Phase6COfflineAttendanceQueue";
  event_name: typeof OFFLINE_ATTENDANCE_QUEUE_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  offline_capture_ref: string;
  attendance_method: OfflineAttendanceQueueMethod;
  attendance_event_type: OfflineAttendanceQueueEventType;
  captured_at_device: string;
  queued_at: string;
  server_received_at: string;
  replay_requested_at: string;
  connectivity_restored: boolean;
  max_clock_skew_seconds: number;
  observed_clock_skew_seconds: number;
  duplicate_detected: boolean;
  duplicate_exception_ref: string | null;
  duplicate_exception_recorded: boolean;
  fallback_method_ref: string | null;
  provider_channel_ref: string | null;
  provider_neutral_only: true;
  fallback_methods_allowed: true;
  attendance_record_mutation_allowed: false;
  runtime_status: "OFFLINE_ATTENDANCE_QUEUE_EVALUATED";
  decision: OfflineAttendanceQueueDecision;
  rejection_reasons: readonly string[];
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  offline_queue_evidence_digest: string;
};
