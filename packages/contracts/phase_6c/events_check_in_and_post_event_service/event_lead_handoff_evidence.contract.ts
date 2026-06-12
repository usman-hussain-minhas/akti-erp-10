export const PHASE_6C_EVENT_LEAD_HANDOFF_EVIDENCE_SEED_ID = "seed_6c_123_event_lead_handoff_evidence" as const;
export const PHASE_6C_EVENT_LEAD_HANDOFF_EVIDENCE_COMPONENT_ID = "6C.09" as const;
export const EVENT_LEAD_HANDOFF_EVIDENCE_RUNTIME_EVENT = "phase_6c.events_check_in_and_post_event_service.event_lead_handoff_evidence.runtime_evaluated" as const;

export type EventLeadHandoffSource = "registration" | "check_in" | "feedback" | "attendee_update";
export type EventLeadHandoffDecision =
  | "HANDOFF_EVIDENCE_READY"
  | "HANDOFF_EVIDENCE_REVIEW_REQUIRED"
  | "HANDOFF_EVIDENCE_REJECTED";

export type EventLeadHandoffIdentityPolicy = "identified" | "pseudonymous" | "anonymous";

export type EventLeadHandoffEvidenceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  handoff_source: EventLeadHandoffSource;
  identity_policy: EventLeadHandoffIdentityPolicy;
  attendee_ref?: string;
  registration_ref?: string;
  feedback_ref?: string;
  person_ref?: string;
  crm_lead_ref?: string;
  contact_ref?: string;
  handoff_reason: string;
  consent_basis_ref?: string;
  evidence_payload?: Record<string, string | number | boolean>;
  direct_crm_write_requested?: boolean;
  outbound_communication_requested?: boolean;
  provider_adapter_requested?: boolean;
};

export type EventLeadHandoffEvidenceReceipt = {
  seed_id: typeof PHASE_6C_EVENT_LEAD_HANDOFF_EVIDENCE_SEED_ID;
  component_id: typeof PHASE_6C_EVENT_LEAD_HANDOFF_EVIDENCE_COMPONENT_ID;
  component_slug: "events_check_in_and_post_event_service";
  model_name: "Phase6CEventLeadHandoffEvidence";
  event_name: typeof EVENT_LEAD_HANDOFF_EVIDENCE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  source_record_ref: string;
  handoff_source: EventLeadHandoffSource;
  identity_policy: EventLeadHandoffIdentityPolicy;
  decision: EventLeadHandoffDecision;
  crm_handoff_target_component: "6B.06";
  crm_handoff_mode: "EVENT_REF_ONLY_NO_DIRECT_WRITE";
  direct_crm_write_performed: false;
  outbound_communication_performed: false;
  provider_adapter_invoked: false;
  lead_identity_refs: readonly string[];
  source_refs: readonly string[];
  review_reasons: readonly string[];
  rejection_reasons: readonly string[];
  handoff_reason: string;
  consent_basis_ref?: string;
  evidence_payload: Record<string, string | number | boolean>;
  decision_refs: readonly string[];
  runtime_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
