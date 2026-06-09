import { createHash } from 'node:crypto';

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

const VALID_METHODS: readonly OfflineAttendanceQueueMethod[] = [
  "QR",
  "BIOMETRIC",
  "RFID_NFC",
  "MOBILE_GPS",
  "MANUAL_OVERRIDE",
];

const VALID_EVENT_TYPES: readonly OfflineAttendanceQueueEventType[] = [
  "CHECK_IN",
  "CHECK_OUT",
  "BREAK_START",
  "BREAK_END",
];

const DECISION_REFS = [
  "6C-ATT-001",
  "6C-ATT-002",
  "6C-ATT-006",
  "6C-ATT-007",
  "6C-ATT-008",
  "6C-ATT-019",
] as const;

const EVIDENCE_ARTIFACTS = [
  "offline_attendance_queue_decision_receipt",
  "offline_attendance_replay_evidence",
  "offline_attendance_clock_skew_evidence",
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for offline_attendance_queue.');
  }
  return value.trim();
}

function optionalNonEmpty(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' must be non-empty when supplied for offline_attendance_queue.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for offline_attendance_queue.');
  }
  return normalized;
}

function requireNonNegativeNumber(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(field + ' must be a non-negative finite number for offline_attendance_queue.');
  }
  return value;
}

function requireMethod(value: OfflineAttendanceQueueMethod): OfflineAttendanceQueueMethod {
  if (!VALID_METHODS.includes(value)) {
    throw new Error('attendance_method is not allowed for offline_attendance_queue.');
  }
  return value;
}

function requireEventType(value: OfflineAttendanceQueueEventType): OfflineAttendanceQueueEventType {
  if (!VALID_EVENT_TYPES.includes(value)) {
    throw new Error('attendance_event_type is not allowed for offline_attendance_queue.');
  }
  return value;
}

function rejectForbiddenRequests(input: OfflineAttendanceQueueInput): void {
  const forbiddenFlags: Array<[keyof OfflineAttendanceQueueInput, string]> = [
    ['direct_attendance_record_mutation_requested', 'offline_attendance_queue must emit replay evidence and must not mutate attendance records directly.'],
    ['provider_specific_adapter_requested', 'offline_attendance_queue must remain provider-neutral.'],
    ['schema_mutation_requested', 'offline_attendance_queue must not request schema mutation.'],
    ['phase_6a_mutation_requested', 'offline_attendance_queue must not mutate Phase 6A surfaces.'],
    ['phase_6b_mutation_requested', 'offline_attendance_queue must not mutate Phase 6B surfaces.'],
    ['runtime_adapter_requested', 'offline_attendance_queue must not execute runtime adapters.'],
    ['ticket_flag_flip_requested', 'offline_attendance_queue must not flip ticket authorization flags.'],
  ];

  for (const [flag, message] of forbiddenFlags) {
    if (input[flag] === true) {
      throw new Error(message);
    }
  }
}

function computeClockSkewSeconds(capturedAtDevice: string, serverReceivedAt: string): number {
  return Math.abs(Date.parse(serverReceivedAt) - Date.parse(capturedAtDevice)) / 1000;
}

function decideReplay(connectivityRestored: boolean, observedClockSkewSeconds: number, maxClockSkewSeconds: number, duplicateDetected: boolean, duplicateExceptionRef: string | null): {
  decision: OfflineAttendanceQueueDecision;
  rejectionReasons: string[];
} {
  if (!connectivityRestored) {
    return {
      decision: "QUEUED_PENDING_CONNECTIVITY",
      rejectionReasons: [],
    };
  }

  const rejectionReasons: string[] = [];
  if (observedClockSkewSeconds > maxClockSkewSeconds) {
    rejectionReasons.push('CLOCK_SKEW_EXCEEDS_CONFIGURED_TOLERANCE');
  }
  if (duplicateDetected && duplicateExceptionRef === null) {
    rejectionReasons.push('DUPLICATE_DETECTED_EXCEPTION_REQUIRED');
  }

  if (rejectionReasons.length > 0) {
    return {
      decision: "REPLAY_REJECTED",
      rejectionReasons,
    };
  }

  return {
    decision: "REPLAY_ACCEPTED_FOR_PROCESSING",
    rejectionReasons,
  };
}

function digestQueue(receiptWithoutDigest: Omit<OfflineAttendanceQueueReceipt, 'offline_queue_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateOfflineAttendanceQueue(input: OfflineAttendanceQueueInput): OfflineAttendanceQueueReceipt {
  rejectForbiddenRequests(input);

  const capturedAtDevice = requireTimestamp(input.captured_at_device, 'captured_at_device');
  const queuedAt = requireTimestamp(input.queued_at, 'queued_at');
  const serverReceivedAt = requireTimestamp(input.server_received_at, 'server_received_at');
  const replayRequestedAt = requireTimestamp(input.replay_requested_at, 'replay_requested_at');
  const maxClockSkewSeconds = requireNonNegativeNumber(input.max_clock_skew_seconds, 'max_clock_skew_seconds');
  const observedClockSkewSeconds = computeClockSkewSeconds(capturedAtDevice, serverReceivedAt);
  const duplicateDetected = input.duplicate_detected === true;
  const duplicateExceptionRef = optionalNonEmpty(input.duplicate_exception_ref, 'duplicate_exception_ref');
  const decision = decideReplay(input.connectivity_restored, observedClockSkewSeconds, maxClockSkewSeconds, duplicateDetected, duplicateExceptionRef);

  const receiptWithoutDigest: Omit<OfflineAttendanceQueueReceipt, 'offline_queue_evidence_digest'> = {
    seed_id: PHASE_6C_OFFLINE_ATTENDANCE_QUEUE_SEED_ID,
    component_id: PHASE_6C_OFFLINE_ATTENDANCE_QUEUE_COMPONENT_ID,
    component_slug: "hr_attendance_leave_and_time_tracking",
    model_name: "Phase6COfflineAttendanceQueue",
    event_name: OFFLINE_ATTENDANCE_QUEUE_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    employee_ref: requireNonEmpty(input.employee_ref, 'employee_ref'),
    offline_capture_ref: requireNonEmpty(input.offline_capture_ref, 'offline_capture_ref'),
    attendance_method: requireMethod(input.attendance_method),
    attendance_event_type: requireEventType(input.attendance_event_type),
    captured_at_device: capturedAtDevice,
    queued_at: queuedAt,
    server_received_at: serverReceivedAt,
    replay_requested_at: replayRequestedAt,
    connectivity_restored: input.connectivity_restored,
    max_clock_skew_seconds: maxClockSkewSeconds,
    observed_clock_skew_seconds: observedClockSkewSeconds,
    duplicate_detected: duplicateDetected,
    duplicate_exception_ref: duplicateExceptionRef,
    duplicate_exception_recorded: duplicateDetected && duplicateExceptionRef !== null,
    fallback_method_ref: optionalNonEmpty(input.fallback_method_ref, 'fallback_method_ref'),
    provider_channel_ref: optionalNonEmpty(input.provider_channel_ref, 'provider_channel_ref'),
    provider_neutral_only: true,
    fallback_methods_allowed: true,
    attendance_record_mutation_allowed: false,
    runtime_status: "OFFLINE_ATTENDANCE_QUEUE_EVALUATED",
    decision: decision.decision,
    rejection_reasons: decision.rejectionReasons,
    decision_refs: DECISION_REFS,
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    control_metadata: input.control_metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    offline_queue_evidence_digest: digestQueue(receiptWithoutDigest),
  };
}
