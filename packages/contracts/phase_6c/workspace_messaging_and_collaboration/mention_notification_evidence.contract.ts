export const PHASE_6C_MENTION_NOTIFICATION_EVIDENCE_SEED_ID = "seed_6c_063_mention_notification_evidence" as const;
export const PHASE_6C_MENTION_NOTIFICATION_EVIDENCE_COMPONENT_ID = "6C.05" as const;
export const MENTION_NOTIFICATION_EVIDENCE_RECORDED_EVENT =
  "phase_6c.workspace_messaging_and_collaboration.mention_notification_evidence.recorded" as const;

export type MentionNotificationType = "USER_MENTION" | "ROLE_MENTION" | "CHANNEL_MENTION" | "TEAM_MENTION";
export type MentionNotificationEvidenceStatus =
  | "GATEWAY_ENVELOPE_PREPARED"
  | "SUPPRESSED_BY_OPT_OUT"
  | "REQUIRES_REVIEW";
export type MentionNotificationEvidenceDecision =
  | "MENTION_EVIDENCE_COMPLETE"
  | "MENTION_EVIDENCE_PARTIAL"
  | "MENTION_EVIDENCE_REQUIRES_REVIEW";

export type MentionNotificationEvidenceItem = {
  mention_ref: string;
  mention_type: MentionNotificationType;
  token: string;
  target_ref: string;
  recipient_ref: string;
  evidence_status: MentionNotificationEvidenceStatus;
  gateway_envelope_ref?: string;
  gateway_policy_evidence_ref?: string;
  suppression_reason?: "GLOBAL_OPT_OUT" | "MISSING_GATEWAY_POLICY_EVIDENCE" | "NO_CHANNELS";
  review_reason?: string;
};

export type MentionNotificationEvidenceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  workspace_ref: string;
  conversation_ref: string;
  message_ref: string;
  notification_ref: string;
  actor_user_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  mentions: MentionNotificationEvidenceItem[];
  send_requested?: boolean;
  provider_adapter_requested?: boolean;
  gateway_bypass_requested?: boolean;
  opt_out_override_requested?: boolean;
  event_dispatch_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  frontend_route_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type RecordedMentionNotificationEvidence = {
  mention_ref: string;
  mention_type: MentionNotificationType;
  token: string;
  target_ref: string;
  recipient_ref: string;
  evidence_status: MentionNotificationEvidenceStatus;
  gateway_envelope_ref?: string;
  gateway_policy_evidence_ref?: string;
  suppression_reason?: "GLOBAL_OPT_OUT" | "MISSING_GATEWAY_POLICY_EVIDENCE" | "NO_CHANNELS";
  review_reason?: string;
  evidence_ref: string;
};

export type MentionNotificationEvidenceReceipt = {
  seed_id: typeof PHASE_6C_MENTION_NOTIFICATION_EVIDENCE_SEED_ID;
  component_id: typeof PHASE_6C_MENTION_NOTIFICATION_EVIDENCE_COMPONENT_ID;
  event_name: typeof MENTION_NOTIFICATION_EVIDENCE_RECORDED_EVENT;
  organization_id: string;
  source_record_ref: string;
  workspace_ref: string;
  conversation_ref: string;
  message_ref: string;
  notification_ref: string;
  decision: MentionNotificationEvidenceDecision;
  mention_count: number;
  gateway_prepared_count: number;
  suppressed_count: number;
  review_count: number;
  records: RecordedMentionNotificationEvidence[];
  review_reasons: string[];
  send_performed: false;
  provider_adapter_performed: false;
  gateway_bypass_performed: false;
  opt_out_override_performed: false;
  event_dispatch_performed: false;
  schema_mutation_performed: false;
  phase_6a_mutation_performed: false;
  phase_6b_mutation_performed: false;
  frontend_route_performed: false;
  ticket_flag_flip_performed: false;
  decision_refs: readonly ["6C-WORK-MSG-008", "6C-GLOBAL-013", "6C-ADL-008"];
  adl_refs: readonly ["ADL-004"];
  evidence_artifacts: string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  deterministic_digest: string;
};
