export const PHASE_6C_MESSAGE_THREAD_REACTION_SEED_ID = "seed_6c_058_message_thread_reaction" as const;
export const PHASE_6C_MESSAGE_THREAD_REACTION_COMPONENT_ID = "6C.05" as const;
export const MESSAGE_THREAD_REACTION_EVALUATED_EVENT = "phase_6c.workspace_messaging_and_collaboration.message_thread_reaction.evaluated" as const;

export type MessageThreadReactionInteractionType = "THREAD_REPLY" | "MENTION" | "REACTION" | "READ_RECEIPT";
export type MessageThreadReactionKind = "THUMBS_UP" | "HEART" | "ACK" | "CELEBRATE" | "EYES";
export type MessageThreadReactionDecision = "MESSAGE_INTERACTIONS_READY" | "MESSAGE_INTERACTIONS_BLOCKED";

export type MessageThreadReactionInteractionInput = {
  interaction_ref: string;
  interaction_type: MessageThreadReactionInteractionType;
  message_ref: string;
  actor_user_ref: string;
  parent_message_ref?: string;
  body?: string;
  mention_user_refs?: string[];
  reaction?: MessageThreadReactionKind;
  read_at?: string;
  evidence_refs: string[];
};

export type MessageThreadReactionInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  conversation_ref: string;
  participant_user_refs: string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  interactions: MessageThreadReactionInteractionInput[];
  realtime_delivery_requested?: boolean;
  notification_send_requested?: boolean;
  event_dispatch_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type MessageThreadReactionPreparedInteraction = {
  interaction_index: number;
  interaction_ref: string;
  interaction_type: MessageThreadReactionInteractionType;
  message_ref: string;
  actor_user_ref: string;
  parent_message_ref: string | null;
  body_length: number;
  mention_user_refs: string[];
  reaction: MessageThreadReactionKind | null;
  read_at: string | null;
  evidence_refs: string[];
};

export type MessageThreadReactionReceipt = {
  seed_id: typeof PHASE_6C_MESSAGE_THREAD_REACTION_SEED_ID;
  component_id: typeof PHASE_6C_MESSAGE_THREAD_REACTION_COMPONENT_ID;
  component_slug: "workspace_messaging_and_collaboration";
  model_name: "Phase6CMessageThreadReaction";
  event_name: typeof MESSAGE_THREAD_REACTION_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  conversation_ref: string;
  participant_count: number;
  interaction_count: number;
  thread_reply_count: number;
  mention_count: number;
  reaction_count: number;
  read_receipt_count: number;
  decision: MessageThreadReactionDecision;
  blockers: readonly string[];
  interactions: MessageThreadReactionPreparedInteraction[];
  realtime_delivery_performed: false;
  notification_send_performed: false;
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
  message_interaction_evidence_digest: string;
};
