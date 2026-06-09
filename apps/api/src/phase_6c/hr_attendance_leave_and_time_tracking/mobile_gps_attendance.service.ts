import { createHash } from 'node:crypto';

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

type ReceiptWithoutDigest = Omit<MobileGpsAttendanceReceipt, 'mobile_gps_attendance_evidence_digest'>;

const DECISION_REFS = ['6C-ATT-001', '6C-ATT-002', '6C-ATT-005', '6C-ATT-006', '6C-ATT-007', '6C-ATT-019', '6C-ATT-020'] as const;
const EVIDENCE_ARTIFACTS = [
  'mobile_gps_attendance_runtime_receipt',
  'mobile_gps_attendance_validation_result',
  'mobile_gps_attendance_forbidden_behavior_rejection_evidence',
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for mobile_gps_attendance runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for mobile_gps_attendance runtime.');
  }
  return normalized;
}

function rejectForbiddenRequests(input: MobileGpsAttendanceInput): void {
  if (input.raw_location_storage_requested === true) {
    throw new Error('mobile_gps_attendance runtime must redact location and must not store raw coordinates.');
  }
  if (input.provider_specific_adapter_requested === true) {
    throw new Error('mobile_gps_attendance runtime must remain provider-neutral and must not execute provider-specific adapters.');
  }
  if (input.attendance_record_mutation_requested === true) {
    throw new Error('mobile_gps_attendance runtime must emit evidence receipts, not mutate attendance records.');
  }
  if (input.schema_mutation_requested === true) {
    throw new Error('mobile_gps_attendance runtime must not mutate Prisma schema or migrations.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('mobile_gps_attendance runtime must not mutate Phase 6A surfaces.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('mobile_gps_attendance runtime must not mutate Phase 6B surfaces.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('mobile_gps_attendance runtime must not execute runtime adapters.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('mobile_gps_attendance runtime must not flip ticket or execution authorization flags.');
  }
}

function requireCoordinate(value: number, min: number, max: number, field: string): number {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(field + ' must be between ' + min + ' and ' + max + ' for mobile_gps_attendance runtime.');
  }
  return value;
}

function distanceMeters(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const earthRadiusMeters = 6371000;
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const deltaLat = toRad(bLat - aLat);
  const deltaLon = toRad(bLon - aLon);
  const first = Math.sin(deltaLat / 2) ** 2;
  const second = Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(deltaLon / 2) ** 2;
  return Math.round(earthRadiusMeters * 2 * Math.atan2(Math.sqrt(first + second), Math.sqrt(1 - first - second)));
}

function digestReceipt(receiptWithoutDigest: ReceiptWithoutDigest): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateMobileGpsAttendanceRuntime(input: MobileGpsAttendanceInput): MobileGpsAttendanceReceipt {
  rejectForbiddenRequests(input);
  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const employeeRef = requireNonEmpty(input.employee_ref, 'employee_ref');
  requireNonEmpty(input.mobile_device_ref, 'mobile_device_ref');
  const evaluatedByUserId = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const deviceObservedAt = requireTimestamp(input.device_observed_at, 'device_observed_at');
  const serverReceivedAt = requireTimestamp(input.server_received_at, 'server_received_at');
  if (!Number.isInteger(input.max_clock_skew_seconds) || input.max_clock_skew_seconds < 0) {
    throw new Error('max_clock_skew_seconds must be a non-negative integer.');
  }
  if (typeof input.offline_capture !== 'boolean') {
    throw new Error('offline_capture must be boolean for mobile_gps_attendance runtime.');
  }
  if (typeof input.liveness_photo_required !== 'boolean') {
    throw new Error('liveness_photo_required must be configurable boolean for mobile_gps_attendance runtime.');
  }
  if (input.liveness_photo_evidence_ref !== undefined && !requireNonEmpty(input.liveness_photo_evidence_ref, 'liveness_photo_evidence_ref').startsWith('liveness_photo:')) {
    throw new Error('liveness_photo_evidence_ref must use liveness_photo: prefix.');
  }
  const offlineQueueRef = input.offline_queue_ref === undefined ? null : requireNonEmpty(input.offline_queue_ref, 'offline_queue_ref');
  const fallbackMethodRef = input.fallback_method_ref === undefined ? null : requireNonEmpty(input.fallback_method_ref, 'fallback_method_ref');

  const policyRef = requireNonEmpty(input.location_policy.policy_ref, 'location_policy.policy_ref');
  if (!policyRef.startsWith('mobile_gps_policy:')) {
    throw new Error('location_policy.policy_ref must use mobile_gps_policy: prefix.');
  }
  const centerLatitude = requireCoordinate(input.location_policy.center_latitude, -90, 90, 'location_policy.center_latitude');
  const centerLongitude = requireCoordinate(input.location_policy.center_longitude, -180, 180, 'location_policy.center_longitude');
  if (!Number.isFinite(input.location_policy.radius_meters) || input.location_policy.radius_meters <= 0) {
    throw new Error('location_policy.radius_meters must be positive.');
  }
  if (!Number.isFinite(input.location_policy.max_accuracy_meters) || input.location_policy.max_accuracy_meters < 0) {
    throw new Error('location_policy.max_accuracy_meters must be non-negative.');
  }
  const proofLatitude = requireCoordinate(input.location_proof.latitude, -90, 90, 'location_proof.latitude');
  const proofLongitude = requireCoordinate(input.location_proof.longitude, -180, 180, 'location_proof.longitude');
  if (!Number.isFinite(input.location_proof.accuracy_meters) || input.location_proof.accuracy_meters < 0) {
    throw new Error('location_proof.accuracy_meters must be non-negative.');
  }

  const distanceFromCenter = distanceMeters(centerLatitude, centerLongitude, proofLatitude, proofLongitude);
  const withinLocationPolicy = distanceFromCenter <= input.location_policy.radius_meters + input.location_proof.accuracy_meters;
  const withinAccuracyTolerance = input.location_proof.accuracy_meters <= input.location_policy.max_accuracy_meters;
  const clockSkewSeconds = Math.abs(Math.round((Date.parse(serverReceivedAt) - Date.parse(deviceObservedAt)) / 1000));
  const withinClockSkewTolerance = clockSkewSeconds <= input.max_clock_skew_seconds;
  const livenessPhotoSatisfied = !input.liveness_photo_required || Boolean(input.liveness_photo_evidence_ref?.trim());

  const rejectionReasons = [
    withinLocationPolicy ? null : 'OUTSIDE_CONFIGURED_LOCATION_POLICY',
    withinAccuracyTolerance ? null : 'LOCATION_ACCURACY_EXCEEDS_CONFIGURED_TOLERANCE',
    withinClockSkewTolerance ? null : 'CLOCK_SKEW_EXCEEDS_CONFIGURED_TOLERANCE',
    livenessPhotoSatisfied ? null : 'LIVENESS_PHOTO_REQUIRED',
    input.offline_capture && offlineQueueRef === null ? 'OFFLINE_CAPTURE_REQUIRES_QUEUE_REF' : null,
    offlineQueueRef !== null && !offlineQueueRef.startsWith('offline_attendance_queue:') ? 'INVALID_OFFLINE_QUEUE_REF' : null,
    fallbackMethodRef !== null && !fallbackMethodRef.startsWith('attendance_fallback:') ? 'INVALID_FALLBACK_METHOD_REF' : null,
  ].filter((reason): reason is string => reason !== null).sort();

  const receiptWithoutDigest: ReceiptWithoutDigest = {
    seed_id: PHASE_6C_MOBILE_GPS_ATTENDANCE_SEED_ID,
    component_id: PHASE_6C_MOBILE_GPS_ATTENDANCE_COMPONENT_ID,
    component_slug: 'hr_attendance_leave_and_time_tracking',
    model_name: 'Phase6CMobileGpsAttendance',
    event_name: MOBILE_GPS_ATTENDANCE_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    employee_ref: employeeRef,
    runtime_status: 'MOBILE_GPS_ATTENDANCE_EVALUATED',
    decision: rejectionReasons.length === 0 ? 'ACCEPTED' : 'REJECTED',
    rejection_reasons: rejectionReasons,
    provider_neutral_only: true,
    location_redacted: true,
    raw_location_storage_allowed: false,
    attendance_record_mutation_allowed: false,
    offline_queue_supported: true,
    fallback_methods_allowed: true,
    location_policy_ref: policyRef,
    within_location_policy: withinLocationPolicy,
    distance_from_policy_center_meters: distanceFromCenter,
    location_accuracy_meters: input.location_proof.accuracy_meters,
    within_accuracy_tolerance: withinAccuracyTolerance,
    clock_skew_seconds: clockSkewSeconds,
    within_clock_skew_tolerance: withinClockSkewTolerance,
    liveness_photo_required: input.liveness_photo_required,
    liveness_photo_satisfied: livenessPhotoSatisfied,
    offline_capture: input.offline_capture,
    offline_queue_ref: offlineQueueRef,
    fallback_method_ref: fallbackMethodRef,
    decision_refs: DECISION_REFS,
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: evaluatedByUserId,
    server_received_at: serverReceivedAt,
  };

  return {
    ...receiptWithoutDigest,
    mobile_gps_attendance_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
