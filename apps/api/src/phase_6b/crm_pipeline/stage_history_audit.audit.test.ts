import assert from 'node:assert/strict';
import { recordStageHistoryAudit, type StageHistoryAuditInput } from './stage_history_audit.audit';

const baseInput: StageHistoryAuditInput = {
  organization_id: 'org_akti_demo',
  stage_history_audit_id: 'stage_history_audit_001',
  lead_record_id: 'lead_record_001',
  lead_record_authority_id: 'lead_authority_001',
  match_candidate_generation_ref: 'match_candidate_generation_001',
  visual_workflow_builder_ref: 'visual_workflow_builder_crm_pipeline_001',
  workflow_node_ref: 'workflow_node_qualification',
  previous_stage_key: 'intake',
  next_stage_key: 'qualification',
  transition_reason: 'PIPELINE_ADVANCEMENT',
  transition_evidence_ref: 'timeline_entry_001',
  changed_by_user_id: 'user_pipeline_owner_001',
  changed_at: '2026-06-08T18:30:00.000Z',
  evidence_refs: ['pipeline_stage_model_001', 'crm_activity_timeline_001'],
};

const receipt = recordStageHistoryAudit(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_06_stage_history_audit');
assert.equal(receipt.component_id, '6B.06');
assert.equal(receipt.event_name, 'phase_6b.crm_pipeline.stage_history_audit.recorded');
assert.equal(receipt.stage_history_audit_id, 'stage_history_audit_001');
assert.equal(receipt.lead_record_authority_id, 'lead_authority_001');
assert.equal(receipt.match_candidate_generation_ref, 'match_candidate_generation_001');
assert.equal(receipt.visual_workflow_builder_ref, 'visual_workflow_builder_crm_pipeline_001');
assert.equal(receipt.previous_stage_key, 'intake');
assert.equal(receipt.next_stage_key, 'qualification');
assert.equal(receipt.transition_reason, 'PIPELINE_ADVANCEMENT');
assert.equal(receipt.transition_evidence_ref, 'timeline_entry_001');
assert.deepEqual(receipt.evidence_refs, ['pipeline_stage_model_001', 'crm_activity_timeline_001']);
assert.equal(receipt.evidence_count, 2);
assert.equal(receipt.append_only_audit_log_enforced, true);
assert.equal(receipt.stage_transition_evidence_recorded, true);
assert.equal(receipt.stage_movement_execution_allowed, false);
assert.equal(receipt.timeline_entry_mutation_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const correctionReceipt = recordStageHistoryAudit({
  ...baseInput,
  stage_history_audit_id: 'stage_history_audit_002',
  transition_reason: 'OPERATOR_CORRECTION',
});
assert.equal(correctionReceipt.transition_reason, 'OPERATOR_CORRECTION');

assert.throws(() => recordStageHistoryAudit({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => recordStageHistoryAudit({ ...baseInput, stage_history_audit_id: '' }), /stage_history_audit_id is required/);
assert.throws(() => recordStageHistoryAudit({ ...baseInput, lead_record_id: '' }), /lead_record_id is required/);
assert.throws(() => recordStageHistoryAudit({ ...baseInput, lead_record_authority_id: '' }), /lead_record_authority_id is required/);
assert.throws(() => recordStageHistoryAudit({ ...baseInput, match_candidate_generation_ref: '' }), /match_candidate_generation_ref is required/);
assert.throws(() => recordStageHistoryAudit({ ...baseInput, visual_workflow_builder_ref: '' }), /visual_workflow_builder_ref is required/);
assert.throws(() => recordStageHistoryAudit({ ...baseInput, workflow_node_ref: '' }), /workflow_node_ref is required/);
assert.throws(() => recordStageHistoryAudit({ ...baseInput, previous_stage_key: '' }), /previous_stage_key is required/);
assert.throws(() => recordStageHistoryAudit({ ...baseInput, next_stage_key: '' }), /next_stage_key is required/);
assert.throws(() => recordStageHistoryAudit({ ...baseInput, next_stage_key: 'intake' }), /previous_stage_key and next_stage_key must differ/);
assert.throws(() => recordStageHistoryAudit({ ...baseInput, transition_reason: 'AUTO_MOVE' as never }), /transition_reason is not supported/);
assert.throws(() => recordStageHistoryAudit({ ...baseInput, transition_evidence_ref: '' }), /transition_evidence_ref is required/);
assert.throws(() => recordStageHistoryAudit({ ...baseInput, changed_by_user_id: '' }), /changed_by_user_id is required/);
assert.throws(() => recordStageHistoryAudit({ ...baseInput, changed_at: 'not-a-date' }), /changed_at must be a valid ISO-compatible timestamp/);
assert.throws(() => recordStageHistoryAudit({ ...baseInput, evidence_refs: [] }), /evidence_refs must contain at least one evidence reference/);
assert.throws(() => recordStageHistoryAudit({ ...baseInput, evidence_refs: ['evidence_1', 'evidence_1'] }), /evidence_refs must not contain duplicate/);
assert.throws(() => recordStageHistoryAudit({ ...baseInput, stage_movement_execution_requested: true }), /must not execute stage movement/);
assert.throws(() => recordStageHistoryAudit({ ...baseInput, timeline_entry_mutation_requested: true }), /must not mutate timeline entries/);
assert.throws(() => recordStageHistoryAudit({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-048 stage history audit test passed.');
