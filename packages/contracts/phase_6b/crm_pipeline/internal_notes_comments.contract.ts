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
