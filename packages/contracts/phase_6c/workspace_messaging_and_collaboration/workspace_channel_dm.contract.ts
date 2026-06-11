export const PHASE_6C_WORKSPACE_CHANNEL_DM_SEED_ID = "seed_6c_057_workspace_channel_dm" as const;
export const PHASE_6C_WORKSPACE_CHANNEL_DM_COMPONENT_ID = "6C.05" as const;
export const WORKSPACE_CHANNEL_DM_EVALUATED_EVENT = "phase_6c.workspace_messaging_and_collaboration.workspace_channel_dm.evaluated" as const;

export type WorkspaceConversationKind = "CHANNEL" | "DIRECT_MESSAGE";
export type WorkspaceConversationVisibility = "PUBLIC" | "PRIVATE" | "RESTRICTED";
export type WorkspaceParticipantRole = "OWNER" | "MODERATOR" | "MEMBER" | "GUEST";
export type WorkspaceMessageClassification = "NORMAL" | "SENSITIVE" | "ANNOUNCEMENT";
export type WorkspaceChannelDmDecision = "CONVERSATION_READY" | "CONVERSATION_REQUIRES_REVIEW" | "CONVERSATION_BLOCKED";

export type WorkspaceChannelDmParticipant = {
  user_ref: string;
  employee_ref?: string;
  role: WorkspaceParticipantRole;
  muted?: boolean;
  evidence_refs: string[];
};

export type WorkspaceChannelDmMessageDraft = {
  sender_user_ref: string;
  body: string;
  classification: WorkspaceMessageClassification;
  mention_user_refs?: string[];
  attachment_refs?: string[];
  evidence_refs: string[];
};

export type WorkspaceChannelDmInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  conversation_ref: string;
  conversation_kind: WorkspaceConversationKind;
  visibility: WorkspaceConversationVisibility;
  created_by_user_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  participants: WorkspaceChannelDmParticipant[];
  message_draft?: WorkspaceChannelDmMessageDraft;
  retention_policy_ref?: string;
  external_transport_requested?: boolean;
  notification_send_requested?: boolean;
  realtime_delivery_requested?: boolean;
  event_dispatch_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type WorkspaceChannelDmPreparedParticipant = {
  participant_index: number;
  user_ref: string;
  employee_ref: string | null;
  role: WorkspaceParticipantRole;
  muted: boolean;
  evidence_refs: string[];
};

export type WorkspaceChannelDmPreparedMessageDraft = {
  sender_user_ref: string;
  body_length: number;
  classification: WorkspaceMessageClassification;
  mention_user_refs: string[];
  attachment_refs: string[];
  evidence_refs: string[];
  moderation_required: boolean;
};

export type WorkspaceChannelDmReceipt = {
  seed_id: typeof PHASE_6C_WORKSPACE_CHANNEL_DM_SEED_ID;
  component_id: typeof PHASE_6C_WORKSPACE_CHANNEL_DM_COMPONENT_ID;
  component_slug: "workspace_messaging_and_collaboration";
  model_name: "Phase6CWorkspaceChannelDm";
  event_name: typeof WORKSPACE_CHANNEL_DM_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  conversation_ref: string;
  conversation_kind: WorkspaceConversationKind;
  visibility: WorkspaceConversationVisibility;
  created_by_user_ref: string;
  participant_count: number;
  owner_count: number;
  guest_count: number;
  muted_count: number;
  decision: WorkspaceChannelDmDecision;
  blockers: readonly string[];
  review_reasons: readonly string[];
  participants: WorkspaceChannelDmPreparedParticipant[];
  message_draft: WorkspaceChannelDmPreparedMessageDraft | null;
  retention_policy_ref: string | null;
  external_transport_performed: false;
  notification_send_performed: false;
  realtime_delivery_performed: false;
  event_dispatch_performed: false;
  schema_mutation_performed: false;
  phase_6a_mutation_performed: false;
  phase_6b_mutation_performed: false;
  runtime_adapter_performed: false;
  ticket_flag_flip_performed: false;
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  channel_dm_evidence_digest: string;
};
