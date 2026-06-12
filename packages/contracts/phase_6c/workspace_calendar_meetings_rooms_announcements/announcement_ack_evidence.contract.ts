export const PHASE_6C_ANNOUNCEMENT_ACK_EVIDENCE_SEED_ID = 'seed_6c_095_announcement_ack_evidence' as const;
export const PHASE_6C_ANNOUNCEMENT_ACK_EVIDENCE_COMPONENT_ID = '6C.07' as const;
export const ANNOUNCEMENT_ACK_EVIDENCE_RUNTIME_EVENT = 'phase_6c.workspace_calendar_meetings_rooms_announcements.announcement_ack_evidence.runtime_evaluated' as const;

export const ANNOUNCEMENT_ACK_EVIDENCE_DECISION_REFS = ['6C-CAL-014', '6C-GLOBAL-013', '6C-ADL-008', '6C-GLOBAL-018'] as const;
export const ANNOUNCEMENT_ACK_EVIDENCE_ADL_REFS = ['ADL-004'] as const;

export type AnnouncementAckStatus = 'ACKNOWLEDGED' | 'PENDING' | 'NOT_REQUIRED' | 'DECLINED';
export type AnnouncementAckMethod = 'USER_ACTION' | 'ADMIN_RECORDED' | 'SYSTEM_IMPORTED';
export type AnnouncementAckDecision = 'ACK_EVIDENCE_READY' | 'ACK_PENDING' | 'ACK_NOT_REQUIRED' | 'ACK_DECLINED_RECORDED';

export type AnnouncementAckEvidenceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  announcement_id: string;
  delivery_intent_id: string;
  recipient_user_id: string;
  source_record_ref: string;
  requested_by_user_id: string;
  evaluated_at: string;
  acknowledgement_required: boolean;
  acknowledgement_status: AnnouncementAckStatus;
  acknowledgement_method?: AnnouncementAckMethod;
  acknowledged_at?: string;
  source_ack_ref?: string;
  gateway_policy_ref: string;
  provider_callback_requested?: boolean;
  gateway_send_requested?: boolean;
  acknowledgement_mutation_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type AnnouncementAckEvidenceEntry = {
  evidence_id: string;
  acknowledgement_status: AnnouncementAckStatus;
  acknowledgement_method: AnnouncementAckMethod | null;
  acknowledged_at: string | null;
  source_ack_ref: string | null;
  workspace_evidence_mode: 'EVENT_REFERENCE_ONLY';
};

export type AnnouncementAckEvidenceReceipt = {
  seed_id: typeof PHASE_6C_ANNOUNCEMENT_ACK_EVIDENCE_SEED_ID;
  component_id: typeof PHASE_6C_ANNOUNCEMENT_ACK_EVIDENCE_COMPONENT_ID;
  component_slug: 'workspace_calendar_meetings_rooms_announcements';
  model_name: 'Phase6CAnnouncementAckEvidence';
  event_name: typeof ANNOUNCEMENT_ACK_EVIDENCE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  announcement_id: string;
  delivery_intent_id: string;
  recipient_user_id: string;
  source_record_ref: string;
  decision: AnnouncementAckDecision;
  ack_evidence: AnnouncementAckEvidenceEntry;
  gateway_route_required: true;
  refs_events_only: true;
  provider_callback_executed: false;
  gateway_send_executed: false;
  acknowledgement_mutation_executed: false;
  runtime_adapter_executed: false;
  persistence_executed: false;
  required_evidence_artifacts: readonly string[];
  decision_refs: typeof ANNOUNCEMENT_ACK_EVIDENCE_DECISION_REFS;
  adl_refs: typeof ANNOUNCEMENT_ACK_EVIDENCE_ADL_REFS;
  gateway_policy_ref: string;
  requested_by_user_id: string;
  evaluated_at: string;
  runtime_evidence_digest: string;
};
