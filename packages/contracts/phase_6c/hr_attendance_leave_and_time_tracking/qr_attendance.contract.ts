export const PHASE_6C_QR_ATTENDANCE_SEED_ID = 'seed_6c_024_qr_attendance' as const;
export const PHASE_6C_QR_ATTENDANCE_COMPONENT_ID = '6C.03' as const;
export const QR_ATTENDANCE_RUNTIME_EVENT = 'phase_6c.hr_attendance_leave_and_time_tracking.qr_attendance.evaluated' as const;

export type QrAttendanceScanMode = 'SELF_SCAN' | 'SUPERVISOR_SCAN';
export type QrAttendanceDecision = 'ACCEPTED' | 'REJECTED';

export type QrAttendanceWindow = {
  window_ref: string;
  starts_at: string;
  ends_at: string;
  max_clock_skew_seconds: number;
};

export type QrAttendanceGeofence = {
  geofence_ref: string;
  center_latitude: number;
  center_longitude: number;
  radius_meters: number;
};

export type QrAttendanceLocation = {
  latitude: number;
  longitude: number;
  accuracy_meters: number;
};

export type QrAttendanceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  qr_token_ref: string;
  scan_mode: QrAttendanceScanMode;
  scanned_by_user_ref: string;
  device_ref: string;
  device_scan_at: string;
  server_received_at: string;
  attendance_window: QrAttendanceWindow;
  geofence: QrAttendanceGeofence;
  scan_location: QrAttendanceLocation;
  liveness_photo_required: boolean;
  liveness_photo_evidence_ref?: string;
  control_metadata?: Record<string, unknown>;
  provider_specific_adapter_requested?: boolean;
  biometric_capture_requested?: boolean;
  raw_location_storage_requested?: boolean;
  attendance_record_mutation_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type QrAttendanceReceipt = {
  seed_id: typeof PHASE_6C_QR_ATTENDANCE_SEED_ID;
  component_id: typeof PHASE_6C_QR_ATTENDANCE_COMPONENT_ID;
  component_slug: 'hr_attendance_leave_and_time_tracking';
  model_name: 'Phase6CQrAttendance';
  event_name: typeof QR_ATTENDANCE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  runtime_status: 'QR_ATTENDANCE_EVALUATED';
  scan_mode: QrAttendanceScanMode;
  decision: QrAttendanceDecision;
  rejection_reasons: readonly string[];
  time_window_ref: string;
  within_time_window: boolean;
  clock_skew_seconds: number;
  within_clock_skew_tolerance: boolean;
  geofence_ref: string;
  within_geofence: boolean;
  distance_from_geofence_center_meters: number;
  location_redacted: true;
  liveness_photo_required: boolean;
  liveness_photo_satisfied: boolean;
  provider_neutral_only: true;
  fallback_methods_allowed: true;
  attendance_record_mutation_allowed: false;
  raw_location_storage_allowed: false;
  decision_refs: readonly string[];
  adl_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  scanned_by_user_ref: string;
  server_received_at: string;
  qr_attendance_evidence_digest: string;
};
