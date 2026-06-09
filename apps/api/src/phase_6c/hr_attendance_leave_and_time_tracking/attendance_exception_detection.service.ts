import { createHash } from 'node:crypto';

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

const DECISION_REFS = [
  "6C-ATT-001",
  "6C-ATT-002",
  "6C-ATT-007",
  "6C-ATT-008",
  "6C-ATT-019",
] as const;

const EVIDENCE_ARTIFACTS = [
  "attendance_exception_detection_decision_receipt",
  "attendance_exception_detection_threshold_evidence",
  "attendance_exception_detection_exception_records",
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for attendance_exception_detection.');
  }
  return value.trim();
}

function optionalNonEmpty(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' must be non-empty when supplied for attendance_exception_detection.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for attendance_exception_detection.');
  }
  return normalized;
}

function optionalTimestamp(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  return requireTimestamp(value, field);
}

function requireNonNegativeNumber(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(field + ' must be a non-negative finite number for attendance_exception_detection.');
  }
  return value;
}

function requireAttendanceDate(value: string | undefined): string {
  const normalized = requireNonEmpty(value, 'attendance_date');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error('attendance_date must use YYYY-MM-DD format for attendance_exception_detection.');
  }
  return normalized;
}

function rejectForbiddenRequests(input: AttendanceExceptionDetectionInput): void {
  const forbiddenFlags: Array<[keyof AttendanceExceptionDetectionInput, string]> = [
    ['direct_attendance_record_mutation_requested', 'attendance_exception_detection must emit evidence and must not mutate attendance records directly.'],
    ['provider_specific_adapter_requested', 'attendance_exception_detection must remain provider-neutral.'],
    ['schema_mutation_requested', 'attendance_exception_detection must not request schema mutation.'],
    ['phase_6a_mutation_requested', 'attendance_exception_detection must not mutate Phase 6A surfaces.'],
    ['phase_6b_mutation_requested', 'attendance_exception_detection must not mutate Phase 6B surfaces.'],
    ['runtime_adapter_requested', 'attendance_exception_detection must not execute runtime adapters.'],
    ['ticket_flag_flip_requested', 'attendance_exception_detection must not flip ticket authorization flags.'],
  ];

  for (const [flag, message] of forbiddenFlags) {
    if (input[flag] === true) {
      throw new Error(message);
    }
  }
}

function secondsBetween(a: string, b: string): number {
  return Math.abs(Date.parse(a) - Date.parse(b)) / 1000;
}

function positiveMinutesBetween(later: string, earlier: string): number {
  return Math.max(0, (Date.parse(later) - Date.parse(earlier)) / 60000);
}

function createException(exceptionType: AttendanceExceptionType, severity: AttendanceExceptionSeverity, sourceRecordRef: string, measuredValue: number | null, thresholdValue: number | null): AttendanceExceptionRecord {
  return {
    exception_type: exceptionType,
    severity,
    evidence_ref: sourceRecordRef + ':' + exceptionType.toLowerCase(),
    measured_value: measuredValue,
    threshold_value: thresholdValue,
  };
}

function digestException(receiptWithoutDigest: Omit<AttendanceExceptionDetectionReceipt, 'exception_detection_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateAttendanceExceptionDetection(input: AttendanceExceptionDetectionInput): AttendanceExceptionDetectionReceipt {
  rejectForbiddenRequests(input);

  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const scheduledStartAt = requireTimestamp(input.scheduled_start_at, 'scheduled_start_at');
  const scheduledEndAt = requireTimestamp(input.scheduled_end_at, 'scheduled_end_at');
  const serverRecordedAt = requireTimestamp(input.server_recorded_at, 'server_recorded_at');
  const actualCheckInAt = optionalTimestamp(input.actual_check_in_at, 'actual_check_in_at');
  const actualCheckOutAt = optionalTimestamp(input.actual_check_out_at, 'actual_check_out_at');
  const deviceCapturedAt = optionalTimestamp(input.device_captured_at, 'device_captured_at');
  const maxClockSkewSeconds = requireNonNegativeNumber(input.max_clock_skew_seconds, 'max_clock_skew_seconds');
  const lateGracePeriodMinutes = requireNonNegativeNumber(input.late_grace_period_minutes, 'late_grace_period_minutes');
  const missingCheckoutGracePeriodMinutes = requireNonNegativeNumber(input.missing_checkout_grace_period_minutes, 'missing_checkout_grace_period_minutes');
  const duplicateDetected = input.duplicate_detected === true;
  const observedClockSkewSeconds = deviceCapturedAt === null ? null : secondsBetween(deviceCapturedAt, serverRecordedAt);
  const observedLateMinutes = actualCheckInAt === null ? null : positiveMinutesBetween(actualCheckInAt, scheduledStartAt);
  const missingCheckoutElapsedMinutes = actualCheckOutAt === null ? positiveMinutesBetween(serverRecordedAt, scheduledEndAt) : null;
  const exceptions: AttendanceExceptionRecord[] = [];

  if (duplicateDetected) {
    exceptions.push(createException("DUPLICATE_ATTENDANCE", "REVIEW_REQUIRED", sourceRecordRef, null, null));
  }
  if (observedClockSkewSeconds !== null && observedClockSkewSeconds > maxClockSkewSeconds) {
    exceptions.push(createException("CLOCK_SKEW_EXCEEDED", "REVIEW_REQUIRED", sourceRecordRef, observedClockSkewSeconds, maxClockSkewSeconds));
  }
  if (observedLateMinutes !== null && observedLateMinutes > lateGracePeriodMinutes) {
    exceptions.push(createException("LATE_CHECK_IN", "WARNING", sourceRecordRef, observedLateMinutes, lateGracePeriodMinutes));
  }
  if (missingCheckoutElapsedMinutes !== null && missingCheckoutElapsedMinutes > missingCheckoutGracePeriodMinutes) {
    exceptions.push(createException("MISSING_CHECKOUT", "REVIEW_REQUIRED", sourceRecordRef, missingCheckoutElapsedMinutes, missingCheckoutGracePeriodMinutes));
  }

  const receiptWithoutDigest: Omit<AttendanceExceptionDetectionReceipt, 'exception_detection_evidence_digest'> = {
    seed_id: PHASE_6C_ATTENDANCE_EXCEPTION_DETECTION_SEED_ID,
    component_id: PHASE_6C_ATTENDANCE_EXCEPTION_DETECTION_COMPONENT_ID,
    component_slug: "hr_attendance_leave_and_time_tracking",
    model_name: "Phase6CAttendanceExceptionDetection",
    event_name: ATTENDANCE_EXCEPTION_DETECTION_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: sourceRecordRef,
    employee_ref: requireNonEmpty(input.employee_ref, 'employee_ref'),
    attendance_date: requireAttendanceDate(input.attendance_date),
    scheduled_start_at: scheduledStartAt,
    scheduled_end_at: scheduledEndAt,
    server_recorded_at: serverRecordedAt,
    actual_check_in_at: actualCheckInAt,
    actual_check_out_at: actualCheckOutAt,
    device_captured_at: deviceCapturedAt,
    max_clock_skew_seconds: maxClockSkewSeconds,
    late_grace_period_minutes: lateGracePeriodMinutes,
    missing_checkout_grace_period_minutes: missingCheckoutGracePeriodMinutes,
    observed_clock_skew_seconds: observedClockSkewSeconds,
    observed_late_minutes: observedLateMinutes,
    missing_checkout_elapsed_minutes: missingCheckoutElapsedMinutes,
    duplicate_detected: duplicateDetected,
    fallback_method_ref: optionalNonEmpty(input.fallback_method_ref, 'fallback_method_ref'),
    provider_channel_ref: optionalNonEmpty(input.provider_channel_ref, 'provider_channel_ref'),
    provider_neutral_only: true,
    fallback_methods_allowed: true,
    attendance_record_mutation_allowed: false,
    runtime_status: "ATTENDANCE_EXCEPTION_DETECTION_EVALUATED",
    decision: exceptions.length === 0 ? "NO_EXCEPTION" : "EXCEPTION_DETECTED",
    exceptions,
    decision_refs: DECISION_REFS,
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    control_metadata: input.control_metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    exception_detection_evidence_digest: digestException(receiptWithoutDigest),
  };
}
