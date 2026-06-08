export const PHASE_6B_INTERNAL_NOTES_COMMENTS_SEED_ID = 'seed_6b_06_internal_notes_comments' as const;
export const PHASE_6B_INTERNAL_NOTES_COMMENTS_COMPONENT_ID = '6B.06' as const;

export const INTERNAL_NOTES_COMMENTS_EVENT = 'phase_6b.crm_pipeline.internal_notes_comments.recorded' as const;

export type InternalNoteKind = 'INTERNAL_NOTE' | 'COMMENT' | 'DEDUP_REVIEW_NOTE' | 'PIPELINE_REVIEW_COMMENT';
export type InternalNoteVisibility = 'INTERNAL_ONLY' | 'TEAM_INTERNAL' | 'SUPPORT_REVIEW';

export type InternalNotesCommentsInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  note_id: string;
  thread_id: string;
  parent_note_id?: string;
  lead_record_id: string;
  lead_record_authority_id: string;
  match_candidate_generation_ref: string;
  visual_workflow_builder_ref: string;
  timeline_entry_ref: string;
  pipeline_stage_key?: string;
  note_kind: InternalNoteKind;
  visibility: InternalNoteVisibility;
  body: string;
  mentioned_user_ids: string[];
  evidence_refs: string[];
  created_by_user_id: string;
  created_at: string;
  external_send_requested?: boolean;
  timeline_entry_creation_requested?: boolean;
  stage_history_mutation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type InternalNotesCommentsReceipt = {
  seed_id: typeof PHASE_6B_INTERNAL_NOTES_COMMENTS_SEED_ID;
  component_id: typeof PHASE_6B_INTERNAL_NOTES_COMMENTS_COMPONENT_ID;
  event_name: typeof INTERNAL_NOTES_COMMENTS_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  note_id: string;
  thread_id: string;
  parent_note_id?: string;
  lead_record_id: string;
  lead_record_authority_id: string;
  match_candidate_generation_ref: string;
  visual_workflow_builder_ref: string;
  timeline_entry_ref: string;
  pipeline_stage_key?: string;
  note_kind: InternalNoteKind;
  visibility: InternalNoteVisibility;
  body: string;
  mentioned_user_ids: readonly string[];
  evidence_refs: readonly string[];
  mention_count: number;
  evidence_count: number;
  is_thread_reply: boolean;
  created_by_user_id: string;
  created_at: string;
  activation_lifecycle_required: true;
  internal_only_enforced: true;
  external_send_allowed: false;
  timeline_entry_creation_allowed: false;
  stage_history_mutation_allowed: false;
  irreversible_action_allowed: false;
};

const NOTE_KINDS: readonly InternalNoteKind[] = ['INTERNAL_NOTE', 'COMMENT', 'DEDUP_REVIEW_NOTE', 'PIPELINE_REVIEW_COMMENT'] as const;
const VISIBILITIES: readonly InternalNoteVisibility[] = ['INTERNAL_ONLY', 'TEAM_INTERNAL', 'SUPPORT_REVIEW'] as const;
const MAX_BODY_LENGTH = 5000;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for internal notes comments.`);
  }
  return value.trim();
}

function normalizeOptional(value: string | undefined, field: string): string | undefined {
  if (value === undefined) return undefined;
  return requireNonEmpty(value, field);
}

function requireCreatedAt(value: string): string {
  const normalized = requireNonEmpty(value, 'created_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('created_at must be a valid ISO-compatible timestamp for internal notes comments.');
  }
  return normalized;
}

function normalizeNoteKind(value: InternalNoteKind): InternalNoteKind {
  if (!NOTE_KINDS.includes(value)) {
    throw new Error('note_kind is not supported for internal notes comments.');
  }
  return value;
}

function normalizeVisibility(value: InternalNoteVisibility): InternalNoteVisibility {
  if (!VISIBILITIES.includes(value)) {
    throw new Error('visibility is not supported for internal notes comments.');
  }
  return value;
}

function normalizeBody(value: string): string {
  const body = requireNonEmpty(value, 'body');
  if (body.length > MAX_BODY_LENGTH) {
    throw new Error('body must not exceed 5000 characters for internal notes comments.');
  }
  return body;
}

function normalizeStringList(values: string[], field: string, requireAtLeastOne: boolean): readonly string[] {
  if (!Array.isArray(values)) {
    throw new Error(`${field} must be an array for internal notes comments.`);
  }
  if (requireAtLeastOne && values.length === 0) {
    throw new Error(`${field} must contain at least one value for internal notes comments.`);
  }
  const normalized = values.map((value, index) => requireNonEmpty(value, `${field}.${index}`));
  if (new Set(normalized).size !== normalized.length) {
    throw new Error(`${field} must not contain duplicate values for internal notes comments.`);
  }
  return Object.freeze(normalized);
}

export function recordInternalNotesComments(input: InternalNotesCommentsInput): InternalNotesCommentsReceipt {
  if (input.external_send_requested === true) {
    throw new Error('internal notes comments must not send external communications.');
  }
  if (input.timeline_entry_creation_requested === true) {
    throw new Error('internal notes comments must not create timeline entries.');
  }
  if (input.stage_history_mutation_requested === true) {
    throw new Error('internal notes comments must not mutate stage history.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('internal notes comments must not perform irreversible actions.');
  }

  const noteId = requireNonEmpty(input.note_id, 'note_id');
  const parentNoteId = normalizeOptional(input.parent_note_id, 'parent_note_id');
  if (parentNoteId === noteId) {
    throw new Error('parent_note_id must not equal note_id for internal notes comments.');
  }

  const mentionedUserIds = normalizeStringList(input.mentioned_user_ids, 'mentioned_user_ids', false);
  const evidenceRefs = normalizeStringList(input.evidence_refs, 'evidence_refs', true);

  return {
    seed_id: PHASE_6B_INTERNAL_NOTES_COMMENTS_SEED_ID,
    component_id: PHASE_6B_INTERNAL_NOTES_COMMENTS_COMPONENT_ID,
    event_name: INTERNAL_NOTES_COMMENTS_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    note_id: noteId,
    thread_id: requireNonEmpty(input.thread_id, 'thread_id'),
    parent_note_id: parentNoteId,
    lead_record_id: requireNonEmpty(input.lead_record_id, 'lead_record_id'),
    lead_record_authority_id: requireNonEmpty(input.lead_record_authority_id, 'lead_record_authority_id'),
    match_candidate_generation_ref: requireNonEmpty(input.match_candidate_generation_ref, 'match_candidate_generation_ref'),
    visual_workflow_builder_ref: requireNonEmpty(input.visual_workflow_builder_ref, 'visual_workflow_builder_ref'),
    timeline_entry_ref: requireNonEmpty(input.timeline_entry_ref, 'timeline_entry_ref'),
    pipeline_stage_key: normalizeOptional(input.pipeline_stage_key, 'pipeline_stage_key'),
    note_kind: normalizeNoteKind(input.note_kind),
    visibility: normalizeVisibility(input.visibility),
    body: normalizeBody(input.body),
    mentioned_user_ids: mentionedUserIds,
    evidence_refs: evidenceRefs,
    mention_count: mentionedUserIds.length,
    evidence_count: evidenceRefs.length,
    is_thread_reply: parentNoteId !== undefined,
    created_by_user_id: requireNonEmpty(input.created_by_user_id, 'created_by_user_id'),
    created_at: requireCreatedAt(input.created_at),
    activation_lifecycle_required: true,
    internal_only_enforced: true,
    external_send_allowed: false,
    timeline_entry_creation_allowed: false,
    stage_history_mutation_allowed: false,
    irreversible_action_allowed: false,
  };
}
