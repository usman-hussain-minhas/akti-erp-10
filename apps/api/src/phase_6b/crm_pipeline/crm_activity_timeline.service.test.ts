import assert from 'node:assert/strict';
import { recordCrmActivityTimeline, type CrmActivityTimelineInput } from './crm_activity_timeline.service';

const baseInput: CrmActivityTimelineInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_crm_pipeline',
  timeline_entry_id: 'timeline_entry_001',
  lead_record_id: 'lead_record_001',
  lead_record_authority_id: 'lead_authority_001',
  match_candidate_generation_ref: 'match_candidate_generation_001',
  visual_workflow_builder_ref: 'visual_workflow_builder_crm_pipeline_001',
  activity_type: 'PIPELINE_STAGE_ACTIVITY',
  activity_direction: 'INTERNAL',
  activity_title: 'Lead moved into qualification review evidence trail.',
  occurred_at: '2026-06-08T18:10:00.000Z',
  recorded_at: '2026-06-08T18:11:00.000Z',
  recorded_by_user_id: 'user_pipeline_owner_001',
  timeline_order: 12,
  pipeline_stage_key: 'qualification',
  workflow_node_ref: 'workflow_node_qualification',
  source_event_ref: 'pipeline_stage_model_configured_001',
  evidence_refs: ['lead_authority_event_001', 'match_candidate_generation_001'],
};

const receipt = recordCrmActivityTimeline(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_06_crm_activity_timeline');
assert.equal(receipt.component_id, '6B.06');
assert.equal(receipt.event_name, 'phase_6b.crm_pipeline.crm_activity_timeline.recorded');
assert.equal(receipt.timeline_entry_id, 'timeline_entry_001');
assert.equal(receipt.lead_record_authority_id, 'lead_authority_001');
assert.equal(receipt.match_candidate_generation_ref, 'match_candidate_generation_001');
assert.equal(receipt.visual_workflow_builder_ref, 'visual_workflow_builder_crm_pipeline_001');
assert.equal(receipt.activity_type, 'PIPELINE_STAGE_ACTIVITY');
assert.equal(receipt.activity_direction, 'INTERNAL');
assert.equal(receipt.timeline_order, 12);
assert.equal(receipt.pipeline_stage_key, 'qualification');
assert.equal(receipt.workflow_node_ref, 'workflow_node_qualification');
assert.deepEqual(receipt.evidence_refs, ['lead_authority_event_001', 'match_candidate_generation_001']);
assert.equal(receipt.evidence_count, 2);
assert.equal(receipt.activation_lifecycle_required, true);
assert.equal(receipt.timeline_evidence_recorded, true);
assert.equal(receipt.note_creation_allowed, false);
assert.equal(receipt.stage_history_mutation_allowed, false);
assert.equal(receipt.communication_send_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const outboundEvidenceReceipt = recordCrmActivityTimeline({
  ...baseInput,
  timeline_entry_id: 'timeline_entry_002',
  activity_type: 'CUSTOMER_INTERACTION_ACTIVITY',
  activity_direction: 'OUTBOUND_EVIDENCE_ONLY',
  pipeline_stage_key: undefined,
  workflow_node_ref: undefined,
  source_event_ref: 'communication_attempt_evidence_001',
  evidence_refs: ['communication_attempt_receipt_001'],
});
assert.equal(outboundEvidenceReceipt.activity_direction, 'OUTBOUND_EVIDENCE_ONLY');
assert.equal(outboundEvidenceReceipt.pipeline_stage_key, undefined);
assert.equal(outboundEvidenceReceipt.communication_send_allowed, false);

assert.throws(() => recordCrmActivityTimeline({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => recordCrmActivityTimeline({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => recordCrmActivityTimeline({ ...baseInput, timeline_entry_id: '' }), /timeline_entry_id is required/);
assert.throws(() => recordCrmActivityTimeline({ ...baseInput, lead_record_id: '' }), /lead_record_id is required/);
assert.throws(() => recordCrmActivityTimeline({ ...baseInput, lead_record_authority_id: '' }), /lead_record_authority_id is required/);
assert.throws(() => recordCrmActivityTimeline({ ...baseInput, match_candidate_generation_ref: '' }), /match_candidate_generation_ref is required/);
assert.throws(() => recordCrmActivityTimeline({ ...baseInput, visual_workflow_builder_ref: '' }), /visual_workflow_builder_ref is required/);
assert.throws(() => recordCrmActivityTimeline({ ...baseInput, activity_type: 'UNDECLARED_ACTIVITY' as never }), /activity_type is not supported/);
assert.throws(() => recordCrmActivityTimeline({ ...baseInput, activity_direction: 'SEND_NOW' as never }), /activity_direction is not supported/);
assert.throws(() => recordCrmActivityTimeline({ ...baseInput, activity_title: '' }), /activity_title is required/);
assert.throws(() => recordCrmActivityTimeline({ ...baseInput, occurred_at: 'not-a-date' }), /occurred_at must be a valid ISO-compatible timestamp/);
assert.throws(() => recordCrmActivityTimeline({ ...baseInput, recorded_at: 'not-a-date' }), /recorded_at must be a valid ISO-compatible timestamp/);
assert.throws(() => recordCrmActivityTimeline({ ...baseInput, recorded_by_user_id: '' }), /recorded_by_user_id is required/);
assert.throws(() => recordCrmActivityTimeline({ ...baseInput, timeline_order: 0 }), /timeline_order must be a positive integer/);
assert.throws(() => recordCrmActivityTimeline({ ...baseInput, source_event_ref: '' }), /source_event_ref is required/);
assert.throws(() => recordCrmActivityTimeline({ ...baseInput, evidence_refs: [] }), /evidence_refs must contain at least one evidence reference/);
assert.throws(() => recordCrmActivityTimeline({ ...baseInput, evidence_refs: ['evidence_ref_001', 'evidence_ref_001'] }), /evidence_refs must not contain duplicate/);
assert.throws(() => recordCrmActivityTimeline({ ...baseInput, pipeline_stage_key: '' }), /pipeline_stage_key is required/);
assert.throws(() => recordCrmActivityTimeline({ ...baseInput, workflow_node_ref: '' }), /workflow_node_ref is required/);
assert.throws(() => recordCrmActivityTimeline({ ...baseInput, note_creation_requested: true }), /must not create notes/);
assert.throws(() => recordCrmActivityTimeline({ ...baseInput, stage_history_mutation_requested: true }), /must not mutate stage history/);
assert.throws(() => recordCrmActivityTimeline({ ...baseInput, communication_send_requested: true }), /must not send communications/);
assert.throws(() => recordCrmActivityTimeline({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-046 crm activity timeline service test passed.');
