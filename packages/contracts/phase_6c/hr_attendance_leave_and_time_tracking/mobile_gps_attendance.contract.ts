export const PHASE_6C_MOBILE_GPS_ATTENDANCE_SEED_ID = 'seed_6c_027_mobile_gps_attendance' as const;
export const PHASE_6C_MOBILE_GPS_ATTENDANCE_COMPONENT_ID = '6C.03' as const;
export const MOBILE_GPS_ATTENDANCE_RUNTIME_EVENT = 'phase_6c.hr_attendance_leave_and_time_tracking.mobile_gps_attendance.evaluated' as const;

export type MobileGpsDecision = 'ACCEPTED' | 'REJECTED';

export type MobileGpsLocationPolicy = {
  policy_ref: string;
  center_latitude: number;
  center_longitude: number;
  radius_meters: number;
  max_accuracy_meters: number;
};

export type MobileGpsLocationProof = {
  latitude: number;
  longitude: number;
  accuracy_meters: number;
};

export type MobileGpsAttendanceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  mobile_device_ref: string;
  location_policy: MobileGpsLocationPolicy;
  location_proof: MobileGpsLocationProof;
  device_observed_at: string;
  server_received_at: string;
  max_clock_skew_seconds: number;
  liveness_photo_required: boolean;
  liveness_photo_evidence_ref?: string;
  offline_capture: boolean;
  offline_queue_ref?: string;
  fallback_method_ref?: string;
  evaluated_by_user_id: string;
  control_metadata?: Record<string, unknown>;
  raw_location_storage_requested?: boolean;
  provider_specific_adapter_requested?: boolean;
  attendance_record_mutation_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type MobileGpsAttendanceReceipt = {
  seed_id: typeof PHASE_6C_MOBILE_GPS_ATTENDANCE_SEED_ID;
  component_id: typeof PHASE_6C_MOBILE_GPS_ATTENDANCE_COMPONENT_ID;
  component_slug: 'hr_attendance_leave_and_time_tracking';
  model_name: 'Phase6CMobileGpsAttendance';
  event_name: typeof MOBILE_GPS_ATTENDANCE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  runtime_status: 'MOBILE_GPS_ATTENDANCE_EVALUATED';
  decision: MobileGpsDecision;
  rejection_reasons: readonly string[];
  provider_neutral_only: true;
  location_redacted: true;
  raw_location_storage_allowed: false;
  attendance_record_mutation_allowed: false;
  offline_queue_supported: true;
  fallback_methods_allowed: true;
  location_policy_ref: string;
  within_location_policy: boolean;
  distance_from_policy_center_meters: number;
  location_accuracy_meters: number;
  within_accuracy_tolerance: boolean;
  clock_skew_seconds: number;
  within_clock_skew_tolerance: boolean;
  liveness_photo_required: boolean;
  liveness_photo_satisfied: boolean;
  offline_capture: boolean;
  offline_queue_ref: string | null;
  fallback_method_ref: string | null;
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  server_received_at: string;
  mobile_gps_attendance_evidence_digest: string;
};
