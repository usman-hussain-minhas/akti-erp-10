export const PHASE_6C_ATTENDANCE_CERTIFICATE_EVIDENCE_SEED_ID = "seed_6c_124_attendance_certificate_evidence" as const;
export const PHASE_6C_ATTENDANCE_CERTIFICATE_EVIDENCE_COMPONENT_ID = "6C.09" as const;
export const ATTENDANCE_CERTIFICATE_EVIDENCE_SCAFFOLD_EVENT = "phase_6c.events_check_in_and_post_event_service.attendance_certificate_evidence.scaffold_control_evaluated" as const;

export type AttendanceCertificateEvidenceScaffoldInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  capability_execution_requested?: boolean;
  business_behavior_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type AttendanceCertificateEvidenceScaffoldReceipt = {
  seed_id: typeof PHASE_6C_ATTENDANCE_CERTIFICATE_EVIDENCE_SEED_ID;
  component_id: typeof PHASE_6C_ATTENDANCE_CERTIFICATE_EVIDENCE_COMPONENT_ID;
  component_slug: "events_check_in_and_post_event_service";
  model_name: "Phase6CAttendanceCertificateEvidence";
  event_name: typeof ATTENDANCE_CERTIFICATE_EVIDENCE_SCAFFOLD_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  scaffold_status: 'SCAFFOLD_CONTROL_ONLY';
  capability_implementation_allowed: false;
  business_behavior_allowed: false;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  scaffold_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
