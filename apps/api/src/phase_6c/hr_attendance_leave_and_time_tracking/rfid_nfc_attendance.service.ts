import { createHash } from 'node:crypto';

export const PHASE_6C_RFID_NFC_ATTENDANCE_SEED_ID = 'seed_6c_026_rfid_nfc_attendance' as const;
export const PHASE_6C_RFID_NFC_ATTENDANCE_COMPONENT_ID = '6C.03' as const;
export const RFID_NFC_ATTENDANCE_RUNTIME_EVENT = 'phase_6c.hr_attendance_leave_and_time_tracking.rfid_nfc_attendance.evaluated' as const;

export type RfidNfcMethod = 'RFID' | 'NFC';
export type RfidNfcDecision = 'ACCEPTED' | 'REJECTED';

export type RfidNfcAttendanceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  method: RfidNfcMethod;
  provider_neutral_reader_ref: string;
  token_evidence_ref: string;
  device_observed_at: string;
  server_received_at: string;
  max_clock_skew_seconds: number;
  offline_capture: boolean;
  offline_queue_ref?: string;
  fallback_method_ref?: string;
  evaluated_by_user_id: string;
  control_metadata?: Record<string, unknown>;
  provider_specific_adapter_requested?: boolean;
  raw_tag_storage_requested?: boolean;
  external_reader_call_requested?: boolean;
  attendance_record_mutation_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type RfidNfcAttendanceReceipt = {
  seed_id: typeof PHASE_6C_RFID_NFC_ATTENDANCE_SEED_ID;
  component_id: typeof PHASE_6C_RFID_NFC_ATTENDANCE_COMPONENT_ID;
  component_slug: 'hr_attendance_leave_and_time_tracking';
  model_name: 'Phase6CRfidNfcAttendance';
  event_name: typeof RFID_NFC_ATTENDANCE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  employee_ref: string;
  runtime_status: 'RFID_NFC_ATTENDANCE_EVALUATED';
  method: RfidNfcMethod;
  decision: RfidNfcDecision;
  rejection_reasons: readonly string[];
  provider_neutral_only: true;
  raw_tag_storage_allowed: false;
  external_reader_call_allowed: false;
  attendance_record_mutation_allowed: false;
  offline_queue_supported: true;
  fallback_methods_allowed: true;
  provider_neutral_reader_ref: string;
  token_evidence_ref: string;
  clock_skew_seconds: number;
  within_clock_skew_tolerance: boolean;
  offline_capture: boolean;
  offline_queue_ref: string | null;
  fallback_method_ref: string | null;
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  server_received_at: string;
  rfid_nfc_attendance_evidence_digest: string;
};

type ReceiptWithoutDigest = Omit<RfidNfcAttendanceReceipt, 'rfid_nfc_attendance_evidence_digest'>;

const METHODS = new Set<RfidNfcMethod>(['RFID', 'NFC']);
const DECISION_REFS = ['6C-ATT-001', '6C-ATT-002', '6C-ATT-006', '6C-ATT-007', '6C-ATT-019'] as const;
const EVIDENCE_ARTIFACTS = [
  'rfid_nfc_attendance_runtime_receipt',
  'rfid_nfc_attendance_validation_result',
  'rfid_nfc_attendance_forbidden_behavior_rejection_evidence',
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for rfid_nfc_attendance runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for rfid_nfc_attendance runtime.');
  }
  return normalized;
}

function rejectForbiddenRequests(input: RfidNfcAttendanceInput): void {
  if (input.provider_specific_adapter_requested === true) {
    throw new Error('rfid_nfc_attendance runtime must remain provider-neutral and must not execute provider-specific adapters.');
  }
  if (input.raw_tag_storage_requested === true) {
    throw new Error('rfid_nfc_attendance runtime must not store raw RFID/NFC tag values.');
  }
  if (input.external_reader_call_requested === true) {
    throw new Error('rfid_nfc_attendance runtime must not call external readers.');
  }
  if (input.attendance_record_mutation_requested === true) {
    throw new Error('rfid_nfc_attendance runtime must emit evidence receipts, not mutate attendance records.');
  }
  if (input.schema_mutation_requested === true) {
    throw new Error('rfid_nfc_attendance runtime must not mutate Prisma schema or migrations.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('rfid_nfc_attendance runtime must not mutate Phase 6A surfaces.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('rfid_nfc_attendance runtime must not mutate Phase 6B surfaces.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('rfid_nfc_attendance runtime must not execute runtime adapters.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('rfid_nfc_attendance runtime must not flip ticket or execution authorization flags.');
  }
}

function digestReceipt(receiptWithoutDigest: ReceiptWithoutDigest): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateRfidNfcAttendanceRuntime(input: RfidNfcAttendanceInput): RfidNfcAttendanceReceipt {
  rejectForbiddenRequests(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const employeeRef = requireNonEmpty(input.employee_ref, 'employee_ref');
  if (!METHODS.has(input.method)) {
    throw new Error('method is not supported for rfid_nfc_attendance runtime: ' + input.method);
  }
  const providerNeutralReaderRef = requireNonEmpty(input.provider_neutral_reader_ref, 'provider_neutral_reader_ref');
  if (!providerNeutralReaderRef.startsWith('provider_neutral_reader:')) {
    throw new Error('provider_neutral_reader_ref must use provider_neutral_reader: prefix.');
  }
  const tokenEvidenceRef = requireNonEmpty(input.token_evidence_ref, 'token_evidence_ref');
  if (!tokenEvidenceRef.startsWith('rfid_nfc_token_evidence:')) {
    throw new Error('token_evidence_ref must use rfid_nfc_token_evidence: prefix.');
  }
  const deviceObservedAt = requireTimestamp(input.device_observed_at, 'device_observed_at');
  const serverReceivedAt = requireTimestamp(input.server_received_at, 'server_received_at');
  if (!Number.isInteger(input.max_clock_skew_seconds) || input.max_clock_skew_seconds < 0) {
    throw new Error('max_clock_skew_seconds must be a non-negative integer.');
  }
  if (typeof input.offline_capture !== 'boolean') {
    throw new Error('offline_capture must be boolean for rfid_nfc_attendance runtime.');
  }
  const offlineQueueRef = input.offline_queue_ref === undefined ? null : requireNonEmpty(input.offline_queue_ref, 'offline_queue_ref');
  const fallbackMethodRef = input.fallback_method_ref === undefined ? null : requireNonEmpty(input.fallback_method_ref, 'fallback_method_ref');
  const evaluatedByUserId = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const clockSkewSeconds = Math.abs(Math.round((Date.parse(serverReceivedAt) - Date.parse(deviceObservedAt)) / 1000));
  const withinClockSkewTolerance = clockSkewSeconds <= input.max_clock_skew_seconds;

  const rejectionReasons = [
    withinClockSkewTolerance ? null : 'CLOCK_SKEW_EXCEEDS_CONFIGURED_TOLERANCE',
    input.offline_capture && offlineQueueRef === null ? 'OFFLINE_CAPTURE_REQUIRES_QUEUE_REF' : null,
    offlineQueueRef !== null && !offlineQueueRef.startsWith('offline_attendance_queue:') ? 'INVALID_OFFLINE_QUEUE_REF' : null,
    fallbackMethodRef !== null && !fallbackMethodRef.startsWith('attendance_fallback:') ? 'INVALID_FALLBACK_METHOD_REF' : null,
  ].filter((reason): reason is string => reason !== null).sort();

  const receiptWithoutDigest: ReceiptWithoutDigest = {
    seed_id: PHASE_6C_RFID_NFC_ATTENDANCE_SEED_ID,
    component_id: PHASE_6C_RFID_NFC_ATTENDANCE_COMPONENT_ID,
    component_slug: 'hr_attendance_leave_and_time_tracking',
    model_name: 'Phase6CRfidNfcAttendance',
    event_name: RFID_NFC_ATTENDANCE_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    employee_ref: employeeRef,
    runtime_status: 'RFID_NFC_ATTENDANCE_EVALUATED',
    method: input.method,
    decision: rejectionReasons.length === 0 ? 'ACCEPTED' : 'REJECTED',
    rejection_reasons: rejectionReasons,
    provider_neutral_only: true,
    raw_tag_storage_allowed: false,
    external_reader_call_allowed: false,
    attendance_record_mutation_allowed: false,
    offline_queue_supported: true,
    fallback_methods_allowed: true,
    provider_neutral_reader_ref: providerNeutralReaderRef,
    token_evidence_ref: tokenEvidenceRef,
    clock_skew_seconds: clockSkewSeconds,
    within_clock_skew_tolerance: withinClockSkewTolerance,
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
    rfid_nfc_attendance_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
