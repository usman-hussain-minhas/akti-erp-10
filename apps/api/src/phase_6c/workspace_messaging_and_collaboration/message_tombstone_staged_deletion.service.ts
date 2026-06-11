import { createHash } from 'node:crypto';

export const PHASE_6C_MESSAGE_TOMBSTONE_STAGED_DELETION_SEED_ID = "seed_6c_060_message_tombstone_staged_deletion" as const;
export const PHASE_6C_MESSAGE_TOMBSTONE_STAGED_DELETION_COMPONENT_ID = "6C.05" as const;
export const MESSAGE_TOMBSTONE_STAGED_DELETION_EVALUATED_EVENT = "phase_6c.workspace_messaging_and_collaboration.message_tombstone_staged_deletion.evaluated" as const;

export type MessageTombstoneDeletionReason = "USER_REQUEST" | "MODERATION" | "RETENTION_POLICY" | "COMPLIANCE_REDACTION";
export type MessageTombstoneDeletionDecision =
  | "TOMBSTONE_READY"
  | "STAGED_DELETION_READY"
  | "HUMAN_APPROVAL_REQUIRED"
  | "DELETION_BLOCKED";

export type MessageTombstoneStagedDeletionInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  conversation_ref: string;
  message_ref: string;
  requested_by_user_ref: string;
  deletion_reason: MessageTombstoneDeletionReason;
  message_created_at: string;
  retention_until: string;
  purge_not_before: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  legal_hold_active?: boolean;
  approval_required?: boolean;
  approval_ref?: string;
  evidence_refs: string[];
  tombstone_mutation_requested?: boolean;
  physical_delete_requested?: boolean;
  purge_execution_requested?: boolean;
  event_dispatch_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type MessageTombstoneStagedDeletionReceipt = {
  seed_id: typeof PHASE_6C_MESSAGE_TOMBSTONE_STAGED_DELETION_SEED_ID;
  component_id: typeof PHASE_6C_MESSAGE_TOMBSTONE_STAGED_DELETION_COMPONENT_ID;
  component_slug: "workspace_messaging_and_collaboration";
  model_name: "Phase6CMessageTombstoneStagedDeletion";
  event_name: typeof MESSAGE_TOMBSTONE_STAGED_DELETION_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  conversation_ref: string;
  message_ref: string;
  requested_by_user_ref: string;
  deletion_reason: MessageTombstoneDeletionReason;
  message_created_at: string;
  retention_until: string;
  purge_not_before: string;
  legal_hold_active: boolean;
  approval_ref: string | null;
  purge_window_open: boolean;
  retention_satisfied: boolean;
  decision: MessageTombstoneDeletionDecision;
  blockers: readonly string[];
  review_reasons: readonly string[];
  evidence_refs: string[];
  tombstone_plan_created: true;
  staged_deletion_plan_created: boolean;
  tombstone_mutation_performed: false;
  physical_delete_performed: false;
  purge_execution_performed: false;
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
  tombstone_evidence_digest: string;
};

const REASONS: readonly MessageTombstoneDeletionReason[] = ["USER_REQUEST", "MODERATION", "RETENTION_POLICY", "COMPLIANCE_REDACTION"] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for message_tombstone_staged_deletion.');
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
    throw new Error(field + ' must be a valid ISO-compatible timestamp for message_tombstone_staged_deletion.');
  }
  return normalized;
}

function requireReason(value: MessageTombstoneDeletionReason): MessageTombstoneDeletionReason {
  if (!REASONS.includes(value)) {
    throw new Error('deletion_reason must be USER_REQUEST, MODERATION, RETENTION_POLICY, or COMPLIANCE_REDACTION.');
  }
  return value;
}

function requireEvidenceRefs(value: string[] | undefined, field: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(field + ' must include at least one evidence reference for message_tombstone_staged_deletion.');
  }
  const refs = value.map((ref, index) => requireNonEmpty(ref, field + '[' + index + ']'));
  return Array.from(new Set(refs)).sort();
}

function rejectForbiddenMutation(input: MessageTombstoneStagedDeletionInput): void {
  const forbidden: Array<[keyof MessageTombstoneStagedDeletionInput, string]> = [
    ['tombstone_mutation_requested', 'tombstone mutation'],
    ['physical_delete_requested', 'physical delete'],
    ['purge_execution_requested', 'purge execution'],
    ['event_dispatch_requested', 'event dispatch'],
    ['schema_mutation_requested', 'schema mutation'],
    ['phase_6a_mutation_requested', 'Phase 6A mutation'],
    ['phase_6b_mutation_requested', 'Phase 6B mutation'],
    ['runtime_adapter_requested', 'runtime adapter execution'],
    ['ticket_flag_flip_requested', 'ticket flag flip'],
  ];

  for (const [field, label] of forbidden) {
    if (input[field] === true) {
      throw new Error('message_tombstone_staged_deletion must not perform ' + label + '.');
    }
  }
}

function digestReceipt(receiptWithoutDigest: Omit<MessageTombstoneStagedDeletionReceipt, 'tombstone_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateMessageTombstoneStagedDeletion(input: MessageTombstoneStagedDeletionInput): MessageTombstoneStagedDeletionReceipt {
  rejectForbiddenMutation(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const conversationRef = requireNonEmpty(input.conversation_ref, 'conversation_ref');
  const messageRef = requireNonEmpty(input.message_ref, 'message_ref');
  const requestedByUserRef = requireNonEmpty(input.requested_by_user_ref, 'requested_by_user_ref');
  const deletionReason = requireReason(input.deletion_reason);
  const messageCreatedAt = requireTimestamp(input.message_created_at, 'message_created_at');
  const retentionUntil = requireTimestamp(input.retention_until, 'retention_until');
  const purgeNotBefore = requireTimestamp(input.purge_not_before, 'purge_not_before');
  const evaluatedByUserId = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const approvalRef = requireOptionalNonEmpty(input.approval_ref, 'approval_ref');
  const legalHoldActive = input.legal_hold_active === true;
  const retentionSatisfied = Date.parse(evaluatedAt) >= Date.parse(retentionUntil);
  const purgeWindowOpen = Date.parse(evaluatedAt) >= Date.parse(purgeNotBefore);

  const blockers: string[] = [];
  const reviewReasons: string[] = [];
  if (Date.parse(messageCreatedAt) > Date.parse(evaluatedAt)) {
    blockers.push('message_created_after_evaluation');
  }
  if (Date.parse(purgeNotBefore) < Date.parse(retentionUntil)) {
    blockers.push('purge_window_before_retention');
  }
  if (legalHoldActive) {
    blockers.push('legal_hold_active');
  }
  if (input.approval_required === true && approvalRef === null) {
    reviewReasons.push('approval_required_for_staged_deletion');
  }
  if (deletionReason === "COMPLIANCE_REDACTION" && approvalRef === null) {
    reviewReasons.push('compliance_redaction_requires_approval_ref');
  }

  let decision: MessageTombstoneDeletionDecision = "TOMBSTONE_READY";
  if (blockers.length > 0) {
    decision = "DELETION_BLOCKED";
  } else if (reviewReasons.length > 0) {
    decision = "HUMAN_APPROVAL_REQUIRED";
  } else if (retentionSatisfied && purgeWindowOpen) {
    decision = "STAGED_DELETION_READY";
  }

  const receiptWithoutDigest: Omit<MessageTombstoneStagedDeletionReceipt, 'tombstone_evidence_digest'> = {
    seed_id: PHASE_6C_MESSAGE_TOMBSTONE_STAGED_DELETION_SEED_ID,
    component_id: PHASE_6C_MESSAGE_TOMBSTONE_STAGED_DELETION_COMPONENT_ID,
    component_slug: "workspace_messaging_and_collaboration",
    model_name: "Phase6CMessageTombstoneStagedDeletion",
    event_name: MESSAGE_TOMBSTONE_STAGED_DELETION_EVALUATED_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    conversation_ref: conversationRef,
    message_ref: messageRef,
    requested_by_user_ref: requestedByUserRef,
    deletion_reason: deletionReason,
    message_created_at: messageCreatedAt,
    retention_until: retentionUntil,
    purge_not_before: purgeNotBefore,
    legal_hold_active: legalHoldActive,
    approval_ref: approvalRef,
    purge_window_open: purgeWindowOpen,
    retention_satisfied: retentionSatisfied,
    decision,
    blockers,
    review_reasons: reviewReasons,
    evidence_refs: requireEvidenceRefs(input.evidence_refs, 'evidence_refs'),
    tombstone_plan_created: true,
    staged_deletion_plan_created: decision === "STAGED_DELETION_READY",
    tombstone_mutation_performed: false,
    physical_delete_performed: false,
    purge_execution_performed: false,
    event_dispatch_performed: false,
    schema_mutation_performed: false,
    phase_6a_mutation_performed: false,
    phase_6b_mutation_performed: false,
    runtime_adapter_performed: false,
    ticket_flag_flip_performed: false,
    decision_refs: ["6C-WORK-MSG-005", "6C-GLOBAL-018"],
    evidence_artifacts: [
      "message_tombstone_staged_deletion_runtime_receipt",
      "message_tombstone_staged_deletion_validation_result",
      "message_tombstone_staged_deletion_forbidden_behavior_rejection_evidence",
    ],
    evaluated_by_user_id: evaluatedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    tombstone_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
