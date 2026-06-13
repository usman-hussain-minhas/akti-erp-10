import assert from 'node:assert/strict';
import { recordInternalNotesComments, type InternalNotesCommentsInput } from './internal_notes_comments.service';

const baseInput: InternalNotesCommentsInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_pipeline',
  note_id: 'internal_note_001',
  thread_id: 'note_thread_001',
  lead_record_id: 'lead_record_001',
  lead_record_authority_id: 'lead_authority_001',
  match_candidate_generation_ref: 'match_candidate_generation_001',
  visual_workflow_builder_ref: 'visual_workflow_builder_crm_pipeline_001',
  timeline_entry_ref: 'timeline_entry_001',
  pipeline_stage_key: 'qualification',
  note_kind: 'INTERNAL_NOTE',
  visibility: 'TEAM_INTERNAL',
  body: 'Review duplicate evidence before advancing the lead to proposal.',
  mentioned_user_ids: ['user_pipeline_owner_001', 'user_dedup_reviewer_001'],
  evidence_refs: ['timeline_entry_001', 'match_candidate_generation_001'],
  created_by_user_id: 'user_pipeline_owner_001',
  created_at: '2026-06-08T18:20:00.000Z',
};

const receipt = recordInternalNotesComments(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_06_internal_notes_comments');
assert.equal(receipt.component_id, '6B.06');
assert.equal(receipt.event_name, 'phase_6b.crm_pipeline.internal_notes_comments.recorded');
assert.equal(receipt.note_id, 'internal_note_001');
assert.equal(receipt.thread_id, 'note_thread_001');
assert.equal(receipt.parent_note_id, undefined);
assert.equal(receipt.lead_record_authority_id, 'lead_authority_001');
assert.equal(receipt.match_candidate_generation_ref, 'match_candidate_generation_001');
assert.equal(receipt.visual_workflow_builder_ref, 'visual_workflow_builder_crm_pipeline_001');
assert.equal(receipt.timeline_entry_ref, 'timeline_entry_001');
assert.equal(receipt.note_kind, 'INTERNAL_NOTE');
assert.equal(receipt.visibility, 'TEAM_INTERNAL');
assert.equal(receipt.mention_count, 2);
assert.equal(receipt.evidence_count, 2);
assert.equal(receipt.is_thread_reply, false);
assert.equal(receipt.activation_lifecycle_required, true);
assert.equal(receipt.internal_only_enforced, true);
assert.equal(receipt.external_send_allowed, false);
assert.equal(receipt.timeline_entry_creation_allowed, false);
assert.equal(receipt.stage_history_mutation_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const commentReceipt = recordInternalNotesComments({
  ...baseInput,
  note_id: 'internal_note_002',
  parent_note_id: 'internal_note_001',
  note_kind: 'COMMENT',
  visibility: 'INTERNAL_ONLY',
  mentioned_user_ids: [],
  evidence_refs: ['timeline_entry_001'],
});
assert.equal(commentReceipt.is_thread_reply, true);
assert.equal(commentReceipt.mention_count, 0);
assert.equal(commentReceipt.visibility, 'INTERNAL_ONLY');

assert.throws(() => recordInternalNotesComments({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => recordInternalNotesComments({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => recordInternalNotesComments({ ...baseInput, note_id: '' }), /note_id is required/);
assert.throws(() => recordInternalNotesComments({ ...baseInput, thread_id: '' }), /thread_id is required/);
assert.throws(() => recordInternalNotesComments({ ...baseInput, parent_note_id: 'internal_note_001' }), /parent_note_id must not equal note_id/);
assert.throws(() => recordInternalNotesComments({ ...baseInput, lead_record_id: '' }), /lead_record_id is required/);
assert.throws(() => recordInternalNotesComments({ ...baseInput, lead_record_authority_id: '' }), /lead_record_authority_id is required/);
assert.throws(() => recordInternalNotesComments({ ...baseInput, match_candidate_generation_ref: '' }), /match_candidate_generation_ref is required/);
assert.throws(() => recordInternalNotesComments({ ...baseInput, visual_workflow_builder_ref: '' }), /visual_workflow_builder_ref is required/);
assert.throws(() => recordInternalNotesComments({ ...baseInput, timeline_entry_ref: '' }), /timeline_entry_ref is required/);
assert.throws(() => recordInternalNotesComments({ ...baseInput, pipeline_stage_key: '' }), /pipeline_stage_key is required/);
assert.throws(() => recordInternalNotesComments({ ...baseInput, note_kind: 'PUBLIC_NOTE' as never }), /note_kind is not supported/);
assert.throws(() => recordInternalNotesComments({ ...baseInput, visibility: 'CUSTOMER_VISIBLE' as never }), /visibility is not supported/);
assert.throws(() => recordInternalNotesComments({ ...baseInput, body: '' }), /body is required/);
assert.throws(() => recordInternalNotesComments({ ...baseInput, body: 'x'.repeat(5001) }), /body must not exceed 5000 characters/);
assert.throws(() => recordInternalNotesComments({ ...baseInput, mentioned_user_ids: ['user_1', 'user_1'] }), /mentioned_user_ids must not contain duplicate/);
assert.throws(() => recordInternalNotesComments({ ...baseInput, evidence_refs: [] }), /evidence_refs must contain at least one value/);
assert.throws(() => recordInternalNotesComments({ ...baseInput, evidence_refs: ['evidence_1', 'evidence_1'] }), /evidence_refs must not contain duplicate/);
assert.throws(() => recordInternalNotesComments({ ...baseInput, created_by_user_id: '' }), /created_by_user_id is required/);
assert.throws(() => recordInternalNotesComments({ ...baseInput, created_at: 'not-a-date' }), /created_at must be a valid ISO-compatible timestamp/);
assert.throws(() => recordInternalNotesComments({ ...baseInput, external_send_requested: true }), /must not send external communications/);
assert.throws(() => recordInternalNotesComments({ ...baseInput, timeline_entry_creation_requested: true }), /must not create timeline entries/);
assert.throws(() => recordInternalNotesComments({ ...baseInput, stage_history_mutation_requested: true }), /must not mutate stage history/);
assert.throws(() => recordInternalNotesComments({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-047 internal notes comments service test passed.');
