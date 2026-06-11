import { createHash } from 'node:crypto';

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

const INTERACTION_TYPES: readonly MessageThreadReactionInteractionType[] = ["THREAD_REPLY", "MENTION", "REACTION", "READ_RECEIPT"] as const;
const REACTIONS: readonly MessageThreadReactionKind[] = ["THUMBS_UP", "HEART", "ACK", "CELEBRATE", "EYES"] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for message_thread_reaction.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for message_thread_reaction.');
  }
  return normalized;
}

function requireEvidenceRefs(value: string[] | undefined, field: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(field + ' must include at least one evidence reference for message_thread_reaction.');
  }
  const refs = value.map((ref, index) => requireNonEmpty(ref, field + '[' + index + ']'));
  return Array.from(new Set(refs)).sort();
}

function requireStringArray(value: string[] | undefined, field: string): string[] {
  if (value === undefined) {
    return [];
  }
  return Array.from(new Set(value.map((item, index) => requireNonEmpty(item, field + '[' + index + ']')))).sort();
}

function requireInteractionType(value: MessageThreadReactionInteractionType): MessageThreadReactionInteractionType {
  if (!INTERACTION_TYPES.includes(value)) {
    throw new Error('interaction_type must be THREAD_REPLY, MENTION, REACTION, or READ_RECEIPT.');
  }
  return value;
}

function requireReaction(value: MessageThreadReactionKind | undefined): MessageThreadReactionKind {
  if (value === undefined || !REACTIONS.includes(value)) {
    throw new Error('reaction must be THUMBS_UP, HEART, ACK, CELEBRATE, or EYES.');
  }
  return value;
}

function rejectForbiddenMutation(input: MessageThreadReactionInput): void {
  const forbidden: Array<[keyof MessageThreadReactionInput, string]> = [
    ['realtime_delivery_requested', 'realtime delivery execution'],
    ['notification_send_requested', 'notification send execution'],
    ['event_dispatch_requested', 'event dispatch'],
    ['schema_mutation_requested', 'schema mutation'],
    ['phase_6a_mutation_requested', 'Phase 6A mutation'],
    ['phase_6b_mutation_requested', 'Phase 6B mutation'],
    ['runtime_adapter_requested', 'runtime adapter execution'],
    ['ticket_flag_flip_requested', 'ticket flag flip'],
  ];

  for (const [field, label] of forbidden) {
    if (input[field] === true) {
      throw new Error('message_thread_reaction must not perform ' + label + '.');
    }
  }
}

function digestReceipt(receiptWithoutDigest: Omit<MessageThreadReactionReceipt, 'message_interaction_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function normalizeInteraction(
  interaction: MessageThreadReactionInteractionInput,
  interactionIndex: number,
  participantUserRefs: readonly string[],
): MessageThreadReactionPreparedInteraction {
  const interactionRef = requireNonEmpty(interaction.interaction_ref, 'interactions[' + interactionIndex + '].interaction_ref');
  const interactionType = requireInteractionType(interaction.interaction_type);
  const messageRef = requireNonEmpty(interaction.message_ref, 'interactions[' + interactionIndex + '].message_ref');
  const actorUserRef = requireNonEmpty(interaction.actor_user_ref, 'interactions[' + interactionIndex + '].actor_user_ref');
  if (!participantUserRefs.includes(actorUserRef)) {
    throw new Error('interactions[' + interactionIndex + '].actor_user_ref must be a conversation participant.');
  }

  let parentMessageRef: string | null = null;
  let bodyLength = 0;
  let mentionUserRefs: string[] = [];
  let reaction: MessageThreadReactionKind | null = null;
  let readAt: string | null = null;

  if (interactionType === "THREAD_REPLY") {
    parentMessageRef = requireNonEmpty(interaction.parent_message_ref, 'interactions[' + interactionIndex + '].parent_message_ref');
    const body = requireNonEmpty(interaction.body, 'interactions[' + interactionIndex + '].body');
    if (body.length > 4000) {
      throw new Error('interactions[' + interactionIndex + '].body must be 4000 characters or fewer.');
    }
    bodyLength = body.length;
  }

  if (interactionType === "MENTION") {
    mentionUserRefs = requireStringArray(interaction.mention_user_refs, 'interactions[' + interactionIndex + '].mention_user_refs');
    if (mentionUserRefs.length === 0) {
      throw new Error('interactions[' + interactionIndex + '].mention_user_refs must include at least one mentioned participant.');
    }
    for (const mentionUserRef of mentionUserRefs) {
      if (!participantUserRefs.includes(mentionUserRef)) {
        throw new Error('interactions[' + interactionIndex + '].mention_user_refs must reference conversation participants.');
      }
    }
  }

  if (interactionType === "REACTION") {
    reaction = requireReaction(interaction.reaction);
  }

  if (interactionType === "READ_RECEIPT") {
    readAt = requireTimestamp(interaction.read_at, 'interactions[' + interactionIndex + '].read_at');
  }

  return {
    interaction_index: interactionIndex,
    interaction_ref: interactionRef,
    interaction_type: interactionType,
    message_ref: messageRef,
    actor_user_ref: actorUserRef,
    parent_message_ref: parentMessageRef,
    body_length: bodyLength,
    mention_user_refs: mentionUserRefs,
    reaction,
    read_at: readAt,
    evidence_refs: requireEvidenceRefs(interaction.evidence_refs, 'interactions[' + interactionIndex + '].evidence_refs'),
  };
}

function buildBlockers(interactions: readonly MessageThreadReactionPreparedInteraction[]): string[] {
  const blockers: string[] = [];
  const refs = interactions.map((interaction) => interaction.interaction_ref);
  if (new Set(refs).size !== refs.length) {
    blockers.push('duplicate_interaction_ref');
  }
  const reactionKeys = interactions
    .filter((interaction) => interaction.interaction_type === "REACTION")
    .map((interaction) => interaction.message_ref + ':' + interaction.actor_user_ref + ':' + interaction.reaction);
  if (new Set(reactionKeys).size !== reactionKeys.length) {
    blockers.push('duplicate_reaction_for_message_actor');
  }
  const readReceiptKeys = interactions
    .filter((interaction) => interaction.interaction_type === "READ_RECEIPT")
    .map((interaction) => interaction.message_ref + ':' + interaction.actor_user_ref);
  if (new Set(readReceiptKeys).size !== readReceiptKeys.length) {
    blockers.push('duplicate_read_receipt_for_message_actor');
  }
  return blockers;
}

export function evaluateMessageThreadReaction(input: MessageThreadReactionInput): MessageThreadReactionReceipt {
  rejectForbiddenMutation(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const conversationRef = requireNonEmpty(input.conversation_ref, 'conversation_ref');
  const evaluatedByUserId = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const participantUserRefs = requireStringArray(input.participant_user_refs, 'participant_user_refs');
  if (participantUserRefs.length === 0) {
    throw new Error('participant_user_refs must include at least one participant for message_thread_reaction.');
  }
  if (!Array.isArray(input.interactions) || input.interactions.length === 0) {
    throw new Error('interactions must include at least one message interaction for message_thread_reaction.');
  }

  const interactions = input.interactions.map((interaction, index) => normalizeInteraction(interaction, index, participantUserRefs));
  const blockers = buildBlockers(interactions);
  const decision: MessageThreadReactionDecision = blockers.length > 0 ? "MESSAGE_INTERACTIONS_BLOCKED" : "MESSAGE_INTERACTIONS_READY";

  const receiptWithoutDigest: Omit<MessageThreadReactionReceipt, 'message_interaction_evidence_digest'> = {
    seed_id: PHASE_6C_MESSAGE_THREAD_REACTION_SEED_ID,
    component_id: PHASE_6C_MESSAGE_THREAD_REACTION_COMPONENT_ID,
    component_slug: "workspace_messaging_and_collaboration",
    model_name: "Phase6CMessageThreadReaction",
    event_name: MESSAGE_THREAD_REACTION_EVALUATED_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    conversation_ref: conversationRef,
    participant_count: participantUserRefs.length,
    interaction_count: interactions.length,
    thread_reply_count: interactions.filter((interaction) => interaction.interaction_type === "THREAD_REPLY").length,
    mention_count: interactions.filter((interaction) => interaction.interaction_type === "MENTION").length,
    reaction_count: interactions.filter((interaction) => interaction.interaction_type === "REACTION").length,
    read_receipt_count: interactions.filter((interaction) => interaction.interaction_type === "READ_RECEIPT").length,
    decision,
    blockers,
    interactions,
    realtime_delivery_performed: false,
    notification_send_performed: false,
    event_dispatch_performed: false,
    schema_mutation_performed: false,
    phase_6a_mutation_performed: false,
    phase_6b_mutation_performed: false,
    runtime_adapter_performed: false,
    ticket_flag_flip_performed: false,
    decision_refs: ["6C-WORK-MSG-001", "6C-GLOBAL-018"],
    evidence_artifacts: [
      "message_thread_reaction_runtime_receipt",
      "message_thread_reaction_validation_result",
      "message_thread_reaction_forbidden_behavior_rejection_evidence",
    ],
    evaluated_by_user_id: evaluatedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    message_interaction_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
