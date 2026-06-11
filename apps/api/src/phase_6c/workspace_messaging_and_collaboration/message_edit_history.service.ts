import { createHash } from 'node:crypto';

export const PHASE_6C_MESSAGE_EDIT_HISTORY_SEED_ID = "seed_6c_059_message_edit_history" as const;
export const PHASE_6C_MESSAGE_EDIT_HISTORY_COMPONENT_ID = "6C.05" as const;
export const MESSAGE_EDIT_HISTORY_EVALUATED_EVENT = "phase_6c.workspace_messaging_and_collaboration.message_edit_history.evaluated" as const;

export type MessageEditHistoryReason = "TYPO" | "CLARIFICATION" | "COMPLIANCE_REDACTION" | "ATTACHMENT_CORRECTION";
export type MessageEditHistoryDecision = "EDIT_HISTORY_ACCEPTED" | "EDIT_HISTORY_BLOCKED" | "EDIT_HISTORY_REQUIRES_REVIEW";

export type MessageEditHistoryEntryInput = {
  edit_ref: string;
  editor_user_ref: string;
  edited_at: string;
  previous_body_hash: string;
  new_body: string;
  edit_reason: MessageEditHistoryReason;
  compliance_review_ref?: string;
  evidence_refs: string[];
};

export type MessageEditHistoryInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  conversation_ref: string;
  message_ref: string;
  original_author_user_ref: string;
  original_body_hash: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  edits: MessageEditHistoryEntryInput[];
  content_overwrite_requested?: boolean;
  history_delete_requested?: boolean;
  realtime_delivery_requested?: boolean;
  event_dispatch_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type MessageEditHistoryPreparedEntry = {
  edit_index: number;
  edit_ref: string;
  editor_user_ref: string;
  edited_at: string;
  previous_body_hash: string;
  new_body_hash: string;
  body_length: number;
  edit_reason: MessageEditHistoryReason;
  compliance_review_ref: string | null;
  evidence_refs: string[];
};

export type MessageEditHistoryReceipt = {
  seed_id: typeof PHASE_6C_MESSAGE_EDIT_HISTORY_SEED_ID;
  component_id: typeof PHASE_6C_MESSAGE_EDIT_HISTORY_COMPONENT_ID;
  component_slug: "workspace_messaging_and_collaboration";
  model_name: "Phase6CMessageEditHistory";
  event_name: typeof MESSAGE_EDIT_HISTORY_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  conversation_ref: string;
  message_ref: string;
  original_author_user_ref: string;
  original_body_hash: string;
  latest_body_hash: string;
  edit_count: number;
  compliance_redaction_count: number;
  decision: MessageEditHistoryDecision;
  blockers: readonly string[];
  review_reasons: readonly string[];
  edit_chain: MessageEditHistoryPreparedEntry[];
  content_overwrite_performed: false;
  history_delete_performed: false;
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
  edit_history_evidence_digest: string;
};

const REASONS: readonly MessageEditHistoryReason[] = ["TYPO", "CLARIFICATION", "COMPLIANCE_REDACTION", "ATTACHMENT_CORRECTION"] as const;

export function hashMessageEditHistoryBody(body: string): string {
  return createHash('sha256').update(body).digest('hex');
}

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for message_edit_history.');
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
    throw new Error(field + ' must be a valid ISO-compatible timestamp for message_edit_history.');
  }
  return normalized;
}

function requireHash(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!/^[a-f0-9]{64}$/.test(normalized)) {
    throw new Error(field + ' must be a sha256 hex digest for message_edit_history.');
  }
  return normalized;
}

function requireEvidenceRefs(value: string[] | undefined, field: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(field + ' must include at least one evidence reference for message_edit_history.');
  }
  const refs = value.map((ref, index) => requireNonEmpty(ref, field + '[' + index + ']'));
  return Array.from(new Set(refs)).sort();
}

function requireReason(value: MessageEditHistoryReason): MessageEditHistoryReason {
  if (!REASONS.includes(value)) {
    throw new Error('edit_reason must be TYPO, CLARIFICATION, COMPLIANCE_REDACTION, or ATTACHMENT_CORRECTION.');
  }
  return value;
}

function rejectForbiddenMutation(input: MessageEditHistoryInput): void {
  const forbidden: Array<[keyof MessageEditHistoryInput, string]> = [
    ['content_overwrite_requested', 'content overwrite'],
    ['history_delete_requested', 'history delete'],
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
      throw new Error('message_edit_history must not perform ' + label + '.');
    }
  }
}

function digestReceipt(receiptWithoutDigest: Omit<MessageEditHistoryReceipt, 'edit_history_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function normalizeEdit(
  edit: MessageEditHistoryEntryInput,
  editIndex: number,
  expectedPreviousHash: string,
): { entry: MessageEditHistoryPreparedEntry; blocker: string | null; reviewReason: string | null; nextHash: string } {
  const editRef = requireNonEmpty(edit.edit_ref, 'edits[' + editIndex + '].edit_ref');
  const editorUserRef = requireNonEmpty(edit.editor_user_ref, 'edits[' + editIndex + '].editor_user_ref');
  const editedAt = requireTimestamp(edit.edited_at, 'edits[' + editIndex + '].edited_at');
  const previousBodyHash = requireHash(edit.previous_body_hash, 'edits[' + editIndex + '].previous_body_hash');
  const newBody = requireNonEmpty(edit.new_body, 'edits[' + editIndex + '].new_body');
  if (newBody.length > 4000) {
    throw new Error('edits[' + editIndex + '].new_body must be 4000 characters or fewer.');
  }
  const editReason = requireReason(edit.edit_reason);
  const complianceReviewRef = requireOptionalNonEmpty(edit.compliance_review_ref, 'edits[' + editIndex + '].compliance_review_ref');
  const newBodyHash = hashMessageEditHistoryBody(newBody);
  const blocker = previousBodyHash === expectedPreviousHash ? null : 'edit_' + editIndex + '_previous_hash_mismatch';
  const reviewReason = editReason === "COMPLIANCE_REDACTION" && complianceReviewRef === null ? 'edit_' + editIndex + '_missing_compliance_review_ref' : null;

  return {
    entry: {
      edit_index: editIndex,
      edit_ref: editRef,
      editor_user_ref: editorUserRef,
      edited_at: editedAt,
      previous_body_hash: previousBodyHash,
      new_body_hash: newBodyHash,
      body_length: newBody.length,
      edit_reason: editReason,
      compliance_review_ref: complianceReviewRef,
      evidence_refs: requireEvidenceRefs(edit.evidence_refs, 'edits[' + editIndex + '].evidence_refs'),
    },
    blocker,
    reviewReason,
    nextHash: newBodyHash,
  };
}

export function evaluateMessageEditHistory(input: MessageEditHistoryInput): MessageEditHistoryReceipt {
  rejectForbiddenMutation(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const conversationRef = requireNonEmpty(input.conversation_ref, 'conversation_ref');
  const messageRef = requireNonEmpty(input.message_ref, 'message_ref');
  const originalAuthorUserRef = requireNonEmpty(input.original_author_user_ref, 'original_author_user_ref');
  const originalBodyHash = requireHash(input.original_body_hash, 'original_body_hash');
  const evaluatedByUserId = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');

  if (!Array.isArray(input.edits) || input.edits.length === 0) {
    throw new Error('edits must include at least one append-only edit entry for message_edit_history.');
  }

  let expectedPreviousHash = originalBodyHash;
  const blockers: string[] = [];
  const reviewReasons: string[] = [];
  const editChain: MessageEditHistoryPreparedEntry[] = [];
  for (const [index, edit] of input.edits.entries()) {
    const normalized = normalizeEdit(edit, index, expectedPreviousHash);
    editChain.push(normalized.entry);
    if (normalized.blocker !== null) {
      blockers.push(normalized.blocker);
    }
    if (normalized.reviewReason !== null) {
      reviewReasons.push(normalized.reviewReason);
    }
    expectedPreviousHash = normalized.nextHash;
  }

  const editRefs = editChain.map((edit) => edit.edit_ref);
  if (new Set(editRefs).size !== editRefs.length) {
    blockers.push('duplicate_edit_ref');
  }

  const decision: MessageEditHistoryDecision = blockers.length > 0
    ? "EDIT_HISTORY_BLOCKED"
    : reviewReasons.length > 0
      ? "EDIT_HISTORY_REQUIRES_REVIEW"
      : "EDIT_HISTORY_ACCEPTED";

  const receiptWithoutDigest: Omit<MessageEditHistoryReceipt, 'edit_history_evidence_digest'> = {
    seed_id: PHASE_6C_MESSAGE_EDIT_HISTORY_SEED_ID,
    component_id: PHASE_6C_MESSAGE_EDIT_HISTORY_COMPONENT_ID,
    component_slug: "workspace_messaging_and_collaboration",
    model_name: "Phase6CMessageEditHistory",
    event_name: MESSAGE_EDIT_HISTORY_EVALUATED_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    conversation_ref: conversationRef,
    message_ref: messageRef,
    original_author_user_ref: originalAuthorUserRef,
    original_body_hash: originalBodyHash,
    latest_body_hash: expectedPreviousHash,
    edit_count: editChain.length,
    compliance_redaction_count: editChain.filter((edit) => edit.edit_reason === "COMPLIANCE_REDACTION").length,
    decision,
    blockers,
    review_reasons: reviewReasons,
    edit_chain: editChain,
    content_overwrite_performed: false,
    history_delete_performed: false,
    realtime_delivery_performed: false,
    event_dispatch_performed: false,
    schema_mutation_performed: false,
    phase_6a_mutation_performed: false,
    phase_6b_mutation_performed: false,
    runtime_adapter_performed: false,
    ticket_flag_flip_performed: false,
    decision_refs: ["6C-WORK-MSG-004", "6C-GLOBAL-018"],
    evidence_artifacts: [
      "message_edit_history_runtime_receipt",
      "message_edit_history_validation_result",
      "message_edit_history_forbidden_behavior_rejection_evidence",
    ],
    evaluated_by_user_id: evaluatedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    edit_history_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
