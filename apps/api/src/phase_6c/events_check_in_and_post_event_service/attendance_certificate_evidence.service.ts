import { createHash } from 'node:crypto';

export const PHASE_6C_ATTENDANCE_CERTIFICATE_EVIDENCE_SEED_ID = "seed_6c_124_attendance_certificate_evidence" as const;
export const PHASE_6C_ATTENDANCE_CERTIFICATE_EVIDENCE_COMPONENT_ID = "6C.09" as const;
export const ATTENDANCE_CERTIFICATE_EVIDENCE_RUNTIME_EVENT = "phase_6c.events_check_in_and_post_event_service.attendance_certificate_evidence.runtime_evaluated" as const;

export type AttendanceCertificateEvidenceScope = "event_attendance" | "session_attendance";
export type AttendanceCertificateEvidenceIdentityPolicy = "identified" | "pseudonymous" | "anonymous";
export type AttendanceCertificateEvidenceDecision =
  | "CERTIFICATE_EVIDENCE_READY"
  | "CERTIFICATE_EVIDENCE_REVIEW_REQUIRED"
  | "CERTIFICATE_EVIDENCE_REJECTED";

export type AttendanceCertificateAttendanceSummary = {
  required_sessions: number;
  attended_sessions: number;
  minimum_attendance_percent: number;
  attended_minutes?: number;
  required_minutes?: number;
};

export type AttendanceCertificateEvidenceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  attendee_ref: string;
  registration_ref: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  certificate_scope: AttendanceCertificateEvidenceScope;
  identity_policy: AttendanceCertificateEvidenceIdentityPolicy;
  person_ref?: string;
  contact_ref?: string;
  certificate_policy_ref: string;
  attendance_summary: AttendanceCertificateAttendanceSummary;
  checkin_evidence_refs: readonly string[];
  certificate_reason: string;
  lms_certification_requested?: boolean;
  credential_issuance_requested?: boolean;
  certificate_file_generation_requested?: boolean;
  file_storage_requested?: boolean;
  outbound_communication_requested?: boolean;
};

export type AttendanceCertificateEvidenceReceipt = {
  seed_id: typeof PHASE_6C_ATTENDANCE_CERTIFICATE_EVIDENCE_SEED_ID;
  component_id: typeof PHASE_6C_ATTENDANCE_CERTIFICATE_EVIDENCE_COMPONENT_ID;
  component_slug: "events_check_in_and_post_event_service";
  model_name: "Phase6CAttendanceCertificateEvidence";
  event_name: typeof ATTENDANCE_CERTIFICATE_EVIDENCE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  attendee_ref: string;
  registration_ref: string;
  source_record_ref: string;
  certificate_scope: AttendanceCertificateEvidenceScope;
  identity_policy: AttendanceCertificateEvidenceIdentityPolicy;
  decision: AttendanceCertificateEvidenceDecision;
  certificate_policy_ref: string;
  attendance_percent: number;
  attendance_summary: AttendanceCertificateAttendanceSummary;
  checkin_evidence_refs: readonly string[];
  identity_refs: readonly string[];
  review_reasons: readonly string[];
  rejection_reasons: readonly string[];
  certificate_reason: string;
  lms_certification_deferred_to_phase: "6D";
  lms_certificate_issued: false;
  credential_issued: false;
  certificate_file_generated: false;
  file_storage_performed: false;
  outbound_communication_performed: false;
  decision_refs: readonly string[];
  runtime_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};

const CERTIFICATE_SCOPES = new Set<AttendanceCertificateEvidenceScope>(["event_attendance", "session_attendance"]);
const IDENTITY_POLICIES = new Set<AttendanceCertificateEvidenceIdentityPolicy>(["identified", "pseudonymous", "anonymous"]);

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for attendance certificate evidence.');
  }
  return value.trim();
}

function optionalNonEmpty(value: string | undefined, field: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(field + ' cannot be blank for attendance certificate evidence.');
  }
  return normalized;
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for attendance certificate evidence.');
  }
  return normalized;
}

function requireEnum<T extends string>(value: T | undefined, values: Set<T>, field: string): T {
  const normalized = requireNonEmpty(value, field) as T;
  if (!values.has(normalized)) {
    throw new Error(field + ' is not supported for attendance certificate evidence.');
  }
  return normalized;
}

function requireWholeNumber(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(field + ' must be a non-negative whole number for attendance certificate evidence.');
  }
  return value;
}

function requirePercent(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(field + ' must be between 0 and 100 for attendance certificate evidence.');
  }
  return value;
}

function normalizeSummary(summary: AttendanceCertificateAttendanceSummary): AttendanceCertificateAttendanceSummary {
  const requiredSessions = requireWholeNumber(summary.required_sessions, 'required_sessions');
  const attendedSessions = requireWholeNumber(summary.attended_sessions, 'attended_sessions');
  const minimumAttendancePercent = requirePercent(summary.minimum_attendance_percent, 'minimum_attendance_percent');
  if (requiredSessions === 0) {
    throw new Error('required_sessions must be greater than zero for attendance certificate evidence.');
  }
  if (attendedSessions > requiredSessions) {
    throw new Error('attended_sessions cannot exceed required_sessions for attendance certificate evidence.');
  }

  const normalized: AttendanceCertificateAttendanceSummary = {
    required_sessions: requiredSessions,
    attended_sessions: attendedSessions,
    minimum_attendance_percent: minimumAttendancePercent,
  };

  if (summary.attended_minutes !== undefined || summary.required_minutes !== undefined) {
    const attendedMinutes = requireWholeNumber(summary.attended_minutes ?? -1, 'attended_minutes');
    const requiredMinutes = requireWholeNumber(summary.required_minutes ?? -1, 'required_minutes');
    if (requiredMinutes === 0) {
      throw new Error('required_minutes must be greater than zero when minute evidence is provided.');
    }
    if (attendedMinutes > requiredMinutes) {
      throw new Error('attended_minutes cannot exceed required_minutes for attendance certificate evidence.');
    }
    normalized.attended_minutes = attendedMinutes;
    normalized.required_minutes = requiredMinutes;
  }

  return normalized;
}

function attendancePercent(summary: AttendanceCertificateAttendanceSummary): number {
  const sessionPercent = (summary.attended_sessions / summary.required_sessions) * 100;
  if (summary.attended_minutes !== undefined && summary.required_minutes !== undefined) {
    const minutePercent = (summary.attended_minutes / summary.required_minutes) * 100;
    return Math.min(sessionPercent, minutePercent);
  }
  return sessionPercent;
}

function normalizeRefs(values: readonly string[], field: string): string[] {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error(field + ' must include at least one reference for attendance certificate evidence.');
  }
  return Array.from(new Set(values.map((value) => requireNonEmpty(value, field)).sort()));
}

function digestReceipt(receiptWithoutDigest: Omit<AttendanceCertificateEvidenceReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function assertForbiddenRequests(input: AttendanceCertificateEvidenceInput): void {
  if (input.lms_certification_requested === true) {
    throw new Error('attendance certificate evidence must not issue LMS certification; LMS certification is deferred to Phase 6D.');
  }
  if (input.credential_issuance_requested === true) {
    throw new Error('attendance certificate evidence must not issue credentials.');
  }
  if (input.certificate_file_generation_requested === true) {
    throw new Error('attendance certificate evidence must not generate certificate files.');
  }
  if (input.file_storage_requested === true) {
    throw new Error('attendance certificate evidence must not store files.');
  }
  if (input.outbound_communication_requested === true) {
    throw new Error('attendance certificate evidence must not send outbound communications.');
  }
}

export function evaluateAttendanceCertificateEvidence(input: AttendanceCertificateEvidenceInput): AttendanceCertificateEvidenceReceipt {
  assertForbiddenRequests(input);

  const certificateScope = requireEnum(input.certificate_scope, CERTIFICATE_SCOPES, 'certificate_scope');
  const identityPolicy = requireEnum(input.identity_policy, IDENTITY_POLICIES, 'identity_policy');
  const normalizedSummary = normalizeSummary(input.attendance_summary);
  const checkinEvidenceRefs = normalizeRefs(input.checkin_evidence_refs, 'checkin_evidence_refs');
  const identityRefs = Array.from(new Set([
    optionalNonEmpty(input.person_ref, 'person_ref'),
    optionalNonEmpty(input.contact_ref, 'contact_ref'),
  ].filter((value): value is string => value !== undefined))).sort();
  const percent = Number(attendancePercent(normalizedSummary).toFixed(2));

  const reviewReasons: string[] = [];
  const rejectionReasons: string[] = [];

  if (identityPolicy === 'anonymous') {
    rejectionReasons.push('ANONYMOUS_ATTENDEE_CANNOT_RECEIVE_ATTENDANCE_CERTIFICATE_EVIDENCE');
  }
  if (identityRefs.length === 0) {
    rejectionReasons.push('CERTIFICATE_IDENTITY_REF_REQUIRED');
  }
  if (percent < normalizedSummary.minimum_attendance_percent) {
    rejectionReasons.push('ATTENDANCE_BELOW_CERTIFICATE_POLICY_THRESHOLD');
  }
  if (identityPolicy === 'pseudonymous') {
    reviewReasons.push('PSEUDONYMOUS_CERTIFICATE_EVIDENCE_REQUIRES_REVIEW');
  }
  if (certificateScope === 'session_attendance' && checkinEvidenceRefs.length < normalizedSummary.attended_sessions) {
    reviewReasons.push('SESSION_CERTIFICATE_EVIDENCE_HAS_FEWER_CHECKIN_REFS_THAN_ATTENDED_SESSIONS');
  }

  const decision: AttendanceCertificateEvidenceDecision = rejectionReasons.length > 0
    ? 'CERTIFICATE_EVIDENCE_REJECTED'
    : reviewReasons.length > 0
      ? 'CERTIFICATE_EVIDENCE_REVIEW_REQUIRED'
      : 'CERTIFICATE_EVIDENCE_READY';

  const receiptWithoutDigest: Omit<AttendanceCertificateEvidenceReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_ATTENDANCE_CERTIFICATE_EVIDENCE_SEED_ID,
    component_id: PHASE_6C_ATTENDANCE_CERTIFICATE_EVIDENCE_COMPONENT_ID,
    component_slug: "events_check_in_and_post_event_service",
    model_name: "Phase6CAttendanceCertificateEvidence",
    event_name: ATTENDANCE_CERTIFICATE_EVIDENCE_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    event_ref: requireNonEmpty(input.event_ref, 'event_ref'),
    attendee_ref: requireNonEmpty(input.attendee_ref, 'attendee_ref'),
    registration_ref: requireNonEmpty(input.registration_ref, 'registration_ref'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    certificate_scope: certificateScope,
    identity_policy: identityPolicy,
    decision,
    certificate_policy_ref: requireNonEmpty(input.certificate_policy_ref, 'certificate_policy_ref'),
    attendance_percent: percent,
    attendance_summary: normalizedSummary,
    checkin_evidence_refs: checkinEvidenceRefs,
    identity_refs: identityRefs,
    review_reasons: reviewReasons.sort(),
    rejection_reasons: rejectionReasons.sort(),
    certificate_reason: requireNonEmpty(input.certificate_reason, 'certificate_reason'),
    lms_certification_deferred_to_phase: '6D',
    lms_certificate_issued: false,
    credential_issued: false,
    certificate_file_generated: false,
    file_storage_performed: false,
    outbound_communication_performed: false,
    decision_refs: ["6C-EVENT-CHECK-014", "6C-EVENT-REG-012", "6C-GLOBAL-018", "6C-NON-001"],
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
