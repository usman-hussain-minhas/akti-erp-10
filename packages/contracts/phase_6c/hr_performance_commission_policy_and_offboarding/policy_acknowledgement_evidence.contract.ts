export const PHASE_6C_POLICY_ACKNOWLEDGEMENT_EVIDENCE_SEED_ID = "seed_6c_050_policy_acknowledgement_evidence" as const;
export const PHASE_6C_POLICY_ACKNOWLEDGEMENT_EVIDENCE_COMPONENT_ID = "6C.04" as const;
export const POLICY_ACKNOWLEDGEMENT_EVIDENCE_RECORDED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.policy_acknowledgement_evidence.recorded" as const;

export type PolicyAcknowledgementChannel =
  | "WEB_PORTAL"
  | "MOBILE_APP"
  | "IMPORTED_SIGNED_DOCUMENT"
  | "ADMIN_RECORDED_ATTESTATION";

export type PolicyAcknowledgementEvidenceDecision =
  | "ACKNOWLEDGEMENT_EVIDENCE_ACCEPTED"
  | "ACKNOWLEDGEMENT_EVIDENCE_REQUIRES_REVIEW";

export type PolicyAcknowledgementEvidenceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  acknowledgement_ref: string;
  employee_ref: string;
  policy_key: string;
  policy_version: string;
  policy_hash: string;
  acknowledgement_channel: PolicyAcknowledgementChannel;
  acknowledged_at: string;
  statement_text_hash: string;
  evidence_refs: readonly string[];
  signer_ip_hash?: string;
  user_agent_hash?: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  policy_mutation_requested?: boolean;
  acknowledgement_overwrite_requested?: boolean;
  acknowledgement_delete_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type PolicyAcknowledgementEvidenceReceipt = {
  seed_id: typeof PHASE_6C_POLICY_ACKNOWLEDGEMENT_EVIDENCE_SEED_ID;
  component_id: typeof PHASE_6C_POLICY_ACKNOWLEDGEMENT_EVIDENCE_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6CPolicyAcknowledgementEvidence";
  event_name: typeof POLICY_ACKNOWLEDGEMENT_EVIDENCE_RECORDED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  acknowledgement_ref: string;
  employee_ref: string;
  policy_key: string;
  policy_version: string;
  policy_hash: string;
  acknowledgement_channel: PolicyAcknowledgementChannel;
  acknowledged_at: string;
  statement_text_hash: string;
  canonical_payload_hash: string;
  decision: PolicyAcknowledgementEvidenceDecision;
  evidence_refs: readonly string[];
  signer_ip_hash: string | null;
  user_agent_hash: string | null;
  policy_mutation_allowed: false;
  acknowledgement_overwrite_allowed: false;
  acknowledgement_delete_allowed: false;
  schema_mutation_allowed: false;
  phase_6a_mutation_allowed: false;
  phase_6b_mutation_allowed: false;
  runtime_adapter_allowed: false;
  ticket_flag_flip_allowed: false;
  decision_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  evidence_artifacts: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  acknowledgement_evidence_digest: string;
};
