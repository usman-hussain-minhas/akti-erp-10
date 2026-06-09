import { createHash } from 'node:crypto';

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

type ReceiptWithoutDigest = Omit<QrAttendanceReceipt, 'qr_attendance_evidence_digest'>;

const SCAN_MODES = new Set<QrAttendanceScanMode>(['SELF_SCAN', 'SUPERVISOR_SCAN']);
const DECISION_REFS = ['6C-ATT-004', '6C-ATT-005', '6C-ATT-007', '6C-ATT-018', '6C-ATT-019', '6C-ATT-020', '6C-ADL-007'] as const;
const ADL_REFS = ['ADL-024'] as const;
const EVIDENCE_ARTIFACTS = [
  'qr_attendance_runtime_receipt',
  'qr_attendance_validation_result',
  'qr_attendance_forbidden_behavior_rejection_evidence',
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for qr_attendance runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for qr_attendance runtime.');
  }
  return normalized;
}

function rejectForbiddenRequests(input: QrAttendanceInput): void {
  if (input.provider_specific_adapter_requested === true) {
    throw new Error('qr_attendance runtime must remain provider-neutral and must not execute provider-specific adapters.');
  }
  if (input.biometric_capture_requested === true) {
    throw new Error('qr_attendance runtime must not capture biometric data.');
  }
  if (input.raw_location_storage_requested === true) {
    throw new Error('qr_attendance runtime must redact location and must not store raw coordinates.');
  }
  if (input.attendance_record_mutation_requested === true) {
    throw new Error('qr_attendance runtime must emit evidence receipts, not mutate attendance records.');
  }
  if (input.schema_mutation_requested === true) {
    throw new Error('qr_attendance runtime must not mutate Prisma schema or migrations.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('qr_attendance runtime must not mutate Phase 6A surfaces.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('qr_attendance runtime must not mutate Phase 6B surfaces.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('qr_attendance runtime must not execute runtime adapters.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('qr_attendance runtime must not flip ticket or execution authorization flags.');
  }
}

function requireCoordinate(value: number, min: number, max: number, field: string): number {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(field + ' must be between ' + min + ' and ' + max + ' for qr_attendance runtime.');
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

export function evaluateQrAttendanceRuntime(input: QrAttendanceInput): QrAttendanceReceipt {
  rejectForbiddenRequests(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const employeeRef = requireNonEmpty(input.employee_ref, 'employee_ref');
  requireNonEmpty(input.qr_token_ref, 'qr_token_ref');
  if (!SCAN_MODES.has(input.scan_mode)) {
    throw new Error('scan_mode is not supported for qr_attendance runtime: ' + input.scan_mode);
  }
  const scannedByUserRef = requireNonEmpty(input.scanned_by_user_ref, 'scanned_by_user_ref');
  requireNonEmpty(input.device_ref, 'device_ref');
  const deviceScanAt = requireTimestamp(input.device_scan_at, 'device_scan_at');
  const serverReceivedAt = requireTimestamp(input.server_received_at, 'server_received_at');
  if (typeof input.liveness_photo_required !== 'boolean') {
    throw new Error('liveness_photo_required must be configurable boolean for qr_attendance runtime.');
  }
  if (input.scan_mode === 'SUPERVISOR_SCAN' && scannedByUserRef === employeeRef) {
    throw new Error('SUPERVISOR_SCAN requires scanned_by_user_ref to differ from employee_ref.');
  }
  if (
    input.liveness_photo_evidence_ref !== undefined &&
    requireNonEmpty(input.liveness_photo_evidence_ref, 'liveness_photo_evidence_ref').startsWith('liveness_photo:') === false
  ) {
    throw new Error('liveness_photo_evidence_ref must use liveness_photo: prefix when liveness is required.');
  }

  const windowRef = requireNonEmpty(input.attendance_window.window_ref, 'attendance_window.window_ref');
  const startsAt = requireTimestamp(input.attendance_window.starts_at, 'attendance_window.starts_at');
  const endsAt = requireTimestamp(input.attendance_window.ends_at, 'attendance_window.ends_at');
  if (Date.parse(startsAt) >= Date.parse(endsAt)) {
    throw new Error('attendance window starts_at must be before ends_at.');
  }
  if (!Number.isInteger(input.attendance_window.max_clock_skew_seconds) || input.attendance_window.max_clock_skew_seconds < 0) {
    throw new Error('max_clock_skew_seconds must be a non-negative integer.');
  }

  const scanTime = Date.parse(deviceScanAt);
  const withinTimeWindow = scanTime >= Date.parse(startsAt) && scanTime <= Date.parse(endsAt);
  const clockSkewSeconds = Math.abs(Math.round((Date.parse(serverReceivedAt) - scanTime) / 1000));
  const withinClockSkewTolerance = clockSkewSeconds <= input.attendance_window.max_clock_skew_seconds;

  const geofenceRef = requireNonEmpty(input.geofence.geofence_ref, 'geofence.geofence_ref');
  const centerLatitude = requireCoordinate(input.geofence.center_latitude, -90, 90, 'geofence.center_latitude');
  const centerLongitude = requireCoordinate(input.geofence.center_longitude, -180, 180, 'geofence.center_longitude');
  if (!Number.isFinite(input.geofence.radius_meters) || input.geofence.radius_meters <= 0) {
    throw new Error('geofence.radius_meters must be positive for qr_attendance runtime.');
  }
  const scanLatitude = requireCoordinate(input.scan_location.latitude, -90, 90, 'scan_location.latitude');
  const scanLongitude = requireCoordinate(input.scan_location.longitude, -180, 180, 'scan_location.longitude');
  if (!Number.isFinite(input.scan_location.accuracy_meters) || input.scan_location.accuracy_meters < 0) {
    throw new Error('scan_location.accuracy_meters must be non-negative for qr_attendance runtime.');
  }
  const distanceFromCenter = distanceMeters(centerLatitude, centerLongitude, scanLatitude, scanLongitude);
  const withinGeofence = distanceFromCenter <= input.geofence.radius_meters + input.scan_location.accuracy_meters;
  const livenessPhotoSatisfied = !input.liveness_photo_required || Boolean(input.liveness_photo_evidence_ref?.trim());

  const rejectionReasons = [
    withinTimeWindow ? null : 'OUTSIDE_ADL_024_ATTENDANCE_WINDOW',
    withinClockSkewTolerance ? null : 'CLOCK_SKEW_EXCEEDS_CONFIGURED_TOLERANCE',
    withinGeofence ? null : 'OUTSIDE_CONFIGURED_GEOFENCE',
    livenessPhotoSatisfied ? null : 'LIVENESS_PHOTO_REQUIRED',
  ].filter((reason): reason is string => reason !== null).sort();

  const receiptWithoutDigest: ReceiptWithoutDigest = {
    seed_id: PHASE_6C_QR_ATTENDANCE_SEED_ID,
    component_id: PHASE_6C_QR_ATTENDANCE_COMPONENT_ID,
    component_slug: 'hr_attendance_leave_and_time_tracking',
    model_name: 'Phase6CQrAttendance',
    event_name: QR_ATTENDANCE_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    employee_ref: employeeRef,
    runtime_status: 'QR_ATTENDANCE_EVALUATED',
    scan_mode: input.scan_mode,
    decision: rejectionReasons.length === 0 ? 'ACCEPTED' : 'REJECTED',
    rejection_reasons: rejectionReasons,
    time_window_ref: windowRef,
    within_time_window: withinTimeWindow,
    clock_skew_seconds: clockSkewSeconds,
    within_clock_skew_tolerance: withinClockSkewTolerance,
    geofence_ref: geofenceRef,
    within_geofence: withinGeofence,
    distance_from_geofence_center_meters: distanceFromCenter,
    location_redacted: true,
    liveness_photo_required: input.liveness_photo_required,
    liveness_photo_satisfied: livenessPhotoSatisfied,
    provider_neutral_only: true,
    fallback_methods_allowed: true,
    attendance_record_mutation_allowed: false,
    raw_location_storage_allowed: false,
    decision_refs: DECISION_REFS,
    adl_refs: ADL_REFS,
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    control_metadata: input.control_metadata ?? {},
    scanned_by_user_ref: scannedByUserRef,
    server_received_at: serverReceivedAt,
  };

  return {
    ...receiptWithoutDigest,
    qr_attendance_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
