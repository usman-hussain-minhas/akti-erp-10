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
