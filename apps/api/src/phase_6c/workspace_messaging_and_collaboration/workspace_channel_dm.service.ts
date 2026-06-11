import { createHash } from 'node:crypto';

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

const KINDS: readonly WorkspaceConversationKind[] = ["CHANNEL", "DIRECT_MESSAGE"] as const;
const VISIBILITIES: readonly WorkspaceConversationVisibility[] = ["PUBLIC", "PRIVATE", "RESTRICTED"] as const;
const ROLES: readonly WorkspaceParticipantRole[] = ["OWNER", "MODERATOR", "MEMBER", "GUEST"] as const;
const CLASSIFICATIONS: readonly WorkspaceMessageClassification[] = ["NORMAL", "SENSITIVE", "ANNOUNCEMENT"] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for workspace_channel_dm.');
  }
  return value.trim();
}

function requireOptionalNonEmpty(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  return requireNonEmpty(value, field);
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for workspace_channel_dm.');
  }
  return normalized;
}

function requireEvidenceRefs(value: string[] | undefined, field: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(field + ' must include at least one evidence reference for workspace_channel_dm.');
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

function requireKind(value: WorkspaceConversationKind): WorkspaceConversationKind {
  if (!KINDS.includes(value)) {
    throw new Error('conversation_kind must be CHANNEL or DIRECT_MESSAGE.');
  }
  return value;
}

function requireVisibility(value: WorkspaceConversationVisibility): WorkspaceConversationVisibility {
  if (!VISIBILITIES.includes(value)) {
    throw new Error('visibility must be PUBLIC, PRIVATE, or RESTRICTED.');
  }
  return value;
}

function requireRole(value: WorkspaceParticipantRole): WorkspaceParticipantRole {
  if (!ROLES.includes(value)) {
    throw new Error('role must be OWNER, MODERATOR, MEMBER, or GUEST.');
  }
  return value;
}

function requireClassification(value: WorkspaceMessageClassification): WorkspaceMessageClassification {
  if (!CLASSIFICATIONS.includes(value)) {
    throw new Error('classification must be NORMAL, SENSITIVE, or ANNOUNCEMENT.');
  }
  return value;
}

function rejectForbiddenMutation(input: WorkspaceChannelDmInput): void {
  const forbidden: Array<[keyof WorkspaceChannelDmInput, string]> = [
    ['external_transport_requested', 'external transport execution'],
    ['notification_send_requested', 'notification send execution'],
    ['realtime_delivery_requested', 'realtime delivery execution'],
    ['event_dispatch_requested', 'event dispatch'],
    ['schema_mutation_requested', 'schema mutation'],
    ['phase_6a_mutation_requested', 'Phase 6A mutation'],
    ['phase_6b_mutation_requested', 'Phase 6B mutation'],
    ['runtime_adapter_requested', 'runtime adapter execution'],
    ['ticket_flag_flip_requested', 'ticket flag flip'],
  ];

  for (const [field, label] of forbidden) {
    if (input[field] === true) {
      throw new Error('workspace_channel_dm must not perform ' + label + '.');
    }
  }
}

function digestReceipt(receiptWithoutDigest: Omit<WorkspaceChannelDmReceipt, 'channel_dm_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function normalizeParticipant(participant: WorkspaceChannelDmParticipant, participantIndex: number): WorkspaceChannelDmPreparedParticipant {
  return {
    participant_index: participantIndex,
    user_ref: requireNonEmpty(participant.user_ref, 'participants[' + participantIndex + '].user_ref'),
    employee_ref: requireOptionalNonEmpty(participant.employee_ref, 'participants[' + participantIndex + '].employee_ref'),
    role: requireRole(participant.role),
    muted: participant.muted === true,
    evidence_refs: requireEvidenceRefs(participant.evidence_refs, 'participants[' + participantIndex + '].evidence_refs'),
  };
}

function normalizeMessageDraft(
  messageDraft: WorkspaceChannelDmMessageDraft | undefined,
  participantUserRefs: readonly string[],
): WorkspaceChannelDmPreparedMessageDraft | null {
  if (messageDraft === undefined) {
    return null;
  }
  const senderUserRef = requireNonEmpty(messageDraft.sender_user_ref, 'message_draft.sender_user_ref');
  if (!participantUserRefs.includes(senderUserRef)) {
    throw new Error('message_draft.sender_user_ref must be a conversation participant.');
  }
  const body = requireNonEmpty(messageDraft.body, 'message_draft.body');
  if (body.length > 4000) {
    throw new Error('message_draft.body must be 4000 characters or fewer for workspace_channel_dm.');
  }
  const mentionUserRefs = requireStringArray(messageDraft.mention_user_refs, 'message_draft.mention_user_refs');
  for (const mentionUserRef of mentionUserRefs) {
    if (!participantUserRefs.includes(mentionUserRef)) {
      throw new Error('message_draft.mention_user_refs must reference conversation participants.');
    }
  }
  const attachmentRefs = requireStringArray(messageDraft.attachment_refs, 'message_draft.attachment_refs');
  const classification = requireClassification(messageDraft.classification);
  return {
    sender_user_ref: senderUserRef,
    body_length: body.length,
    classification,
    mention_user_refs: mentionUserRefs,
    attachment_refs: attachmentRefs,
    evidence_refs: requireEvidenceRefs(messageDraft.evidence_refs, 'message_draft.evidence_refs'),
    moderation_required: classification === "SENSITIVE" || classification === "ANNOUNCEMENT" || attachmentRefs.length > 0,
  };
}

function buildConversationFindings(
  kind: WorkspaceConversationKind,
  visibility: WorkspaceConversationVisibility,
  participants: WorkspaceChannelDmPreparedParticipant[],
  messageDraft: WorkspaceChannelDmPreparedMessageDraft | null,
): { blockers: string[]; reviewReasons: string[] } {
  const blockers: string[] = [];
  const reviewReasons: string[] = [];
  const participantUserRefs = participants.map((participant) => participant.user_ref);
  if (new Set(participantUserRefs).size !== participantUserRefs.length) {
    blockers.push('duplicate_participant_user_ref');
  }
  if (kind === "DIRECT_MESSAGE" && participants.length !== 2) {
    blockers.push('direct_message_requires_exactly_two_participants');
  }
  if (kind === "CHANNEL" && participants.length < 2) {
    blockers.push('channel_requires_at_least_two_participants');
  }
  if (participants.filter((participant) => participant.role === "OWNER").length === 0) {
    blockers.push('conversation_requires_owner');
  }
  if (visibility === "RESTRICTED" && participants.some((participant) => participant.role === "GUEST")) {
    reviewReasons.push('restricted_conversation_contains_guest');
  }
  if (messageDraft?.moderation_required === true) {
    reviewReasons.push('message_draft_requires_moderation');
  }
  return { blockers, reviewReasons };
}

export function evaluateWorkspaceChannelDm(input: WorkspaceChannelDmInput): WorkspaceChannelDmReceipt {
  rejectForbiddenMutation(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const conversationRef = requireNonEmpty(input.conversation_ref, 'conversation_ref');
  const kind = requireKind(input.conversation_kind);
  const visibility = requireVisibility(input.visibility);
  const createdByUserRef = requireNonEmpty(input.created_by_user_ref, 'created_by_user_ref');
  const evaluatedByUserId = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');

  if (!Array.isArray(input.participants) || input.participants.length === 0) {
    throw new Error('participants must include at least one participant for workspace_channel_dm.');
  }

  const participants = input.participants.map((participant, index) => normalizeParticipant(participant, index));
  const participantUserRefs = participants.map((participant) => participant.user_ref);
  if (!participantUserRefs.includes(createdByUserRef)) {
    throw new Error('created_by_user_ref must be one of the conversation participants.');
  }
  const messageDraft = normalizeMessageDraft(input.message_draft, participantUserRefs);
  const findings = buildConversationFindings(kind, visibility, participants, messageDraft);
  const decision: WorkspaceChannelDmDecision = findings.blockers.length > 0
    ? "CONVERSATION_BLOCKED"
    : findings.reviewReasons.length > 0
      ? "CONVERSATION_REQUIRES_REVIEW"
      : "CONVERSATION_READY";

  const receiptWithoutDigest: Omit<WorkspaceChannelDmReceipt, 'channel_dm_evidence_digest'> = {
    seed_id: PHASE_6C_WORKSPACE_CHANNEL_DM_SEED_ID,
    component_id: PHASE_6C_WORKSPACE_CHANNEL_DM_COMPONENT_ID,
    component_slug: "workspace_messaging_and_collaboration",
    model_name: "Phase6CWorkspaceChannelDm",
    event_name: WORKSPACE_CHANNEL_DM_EVALUATED_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    conversation_ref: conversationRef,
    conversation_kind: kind,
    visibility,
    created_by_user_ref: createdByUserRef,
    participant_count: participants.length,
    owner_count: participants.filter((participant) => participant.role === "OWNER").length,
    guest_count: participants.filter((participant) => participant.role === "GUEST").length,
    muted_count: participants.filter((participant) => participant.muted).length,
    decision,
    blockers: findings.blockers,
    review_reasons: findings.reviewReasons,
    participants,
    message_draft: messageDraft,
    retention_policy_ref: requireOptionalNonEmpty(input.retention_policy_ref, 'retention_policy_ref'),
    external_transport_performed: false,
    notification_send_performed: false,
    realtime_delivery_performed: false,
    event_dispatch_performed: false,
    schema_mutation_performed: false,
    phase_6a_mutation_performed: false,
    phase_6b_mutation_performed: false,
    runtime_adapter_performed: false,
    ticket_flag_flip_performed: false,
    decision_refs: ["6C-WORK-MSG-001", "6C-GLOBAL-018"],
    evidence_artifacts: [
      "workspace_channel_dm_runtime_receipt",
      "workspace_channel_dm_validation_result",
      "workspace_channel_dm_forbidden_behavior_rejection_evidence",
    ],
    evaluated_by_user_id: evaluatedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    channel_dm_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
