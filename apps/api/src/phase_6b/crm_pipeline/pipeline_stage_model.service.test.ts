import assert from 'node:assert/strict';
import { configurePipelineStageModel, type PipelineStageModelInput } from './pipeline_stage_model.service';

const baseInput: PipelineStageModelInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_pipeline',
  pipeline_stage_model_id: 'pipeline_stage_model_001',
  lifecycle_config_ref: 'foundry_lifecycle_config_crm_pipeline_001',
  unified_lead_record_authority_id: 'lead_authority_crm_pipeline_001',
  match_candidate_generation_ref: 'match_candidate_generation_001',
  visual_workflow_builder_ref: 'visual_workflow_builder_crm_pipeline_001',
  configured_by_user_id: 'user_pipeline_owner_001',
  configured_at: '2026-06-08T18:00:00.000Z',
  stages: [
    {
      stage_id: 'pipeline_stage_intake_001',
      stage_key: 'intake',
      display_name: 'Intake',
      category: 'INTAKE',
      lifecycle_state: 'ACTIVE',
      sort_order: 1,
      allowed_next_stage_keys: ['qualification'],
      is_terminal: false,
      requires_match_candidate_review: true,
      entry_activity_evidence_required: true,
      exit_activity_evidence_required: true,
      visual_workflow_node_ref: 'workflow_node_intake',
    },
    {
      stage_id: 'pipeline_stage_qualification_001',
      stage_key: 'qualification',
      display_name: 'Qualification',
      category: 'QUALIFICATION',
      lifecycle_state: 'ACTIVE',
      sort_order: 2,
      allowed_next_stage_keys: ['won', 'lost'],
      is_terminal: false,
      requires_match_candidate_review: false,
      entry_activity_evidence_required: true,
      exit_activity_evidence_required: true,
      visual_workflow_node_ref: 'workflow_node_qualification',
    },
    {
      stage_id: 'pipeline_stage_won_001',
      stage_key: 'won',
      display_name: 'Won',
      category: 'WON',
      lifecycle_state: 'ACTIVE',
      sort_order: 3,
      allowed_next_stage_keys: [],
      is_terminal: true,
      requires_match_candidate_review: false,
      entry_activity_evidence_required: true,
      exit_activity_evidence_required: false,
    },
    {
      stage_id: 'pipeline_stage_lost_001',
      stage_key: 'lost',
      display_name: 'Lost',
      category: 'LOST',
      lifecycle_state: 'INACTIVE',
      sort_order: 4,
      allowed_next_stage_keys: [],
      is_terminal: true,
      requires_match_candidate_review: false,
      entry_activity_evidence_required: true,
      exit_activity_evidence_required: false,
    },
  ],
};

const receipt = configurePipelineStageModel(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_06_pipeline_stage_model');
assert.equal(receipt.component_id, '6B.06');
assert.equal(receipt.event_name, 'phase_6b.crm_pipeline.pipeline_stage_model.configured');
assert.equal(receipt.pipeline_stage_model_id, 'pipeline_stage_model_001');
assert.equal(receipt.lifecycle_config_ref, 'foundry_lifecycle_config_crm_pipeline_001');
assert.equal(receipt.unified_lead_record_authority_id, 'lead_authority_crm_pipeline_001');
assert.equal(receipt.match_candidate_generation_ref, 'match_candidate_generation_001');
assert.equal(receipt.visual_workflow_builder_ref, 'visual_workflow_builder_crm_pipeline_001');
assert.equal(receipt.stage_count, 4);
assert.equal(receipt.active_stage_count, 3);
assert.equal(receipt.terminal_stage_count, 2);
assert.deepEqual(receipt.stages.map((stage) => stage.stage_key), ['intake', 'qualification', 'won', 'lost']);
assert.equal(receipt.stages[0]?.requires_match_candidate_review, true);
assert.equal(receipt.activation_lifecycle_required, true);
assert.equal(receipt.timeline_evidence_required, true);
assert.equal(receipt.stage_history_required, true);
assert.equal(receipt.stage_movement_allowed, false);
assert.equal(receipt.timeline_entry_creation_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const sortedReceipt = configurePipelineStageModel({
  ...baseInput,
  stages: [...baseInput.stages].reverse(),
});
assert.deepEqual(sortedReceipt.stages.map((stage) => stage.stage_key), ['intake', 'qualification', 'won', 'lost']);

assert.throws(() => configurePipelineStageModel({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => configurePipelineStageModel({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => configurePipelineStageModel({ ...baseInput, pipeline_stage_model_id: '' }), /pipeline_stage_model_id is required/);
assert.throws(() => configurePipelineStageModel({ ...baseInput, lifecycle_config_ref: '' }), /lifecycle_config_ref is required/);
assert.throws(() => configurePipelineStageModel({ ...baseInput, unified_lead_record_authority_id: '' }), /unified_lead_record_authority_id is required/);
assert.throws(() => configurePipelineStageModel({ ...baseInput, match_candidate_generation_ref: '' }), /match_candidate_generation_ref is required/);
assert.throws(() => configurePipelineStageModel({ ...baseInput, visual_workflow_builder_ref: '' }), /visual_workflow_builder_ref is required/);
assert.throws(() => configurePipelineStageModel({ ...baseInput, configured_by_user_id: '' }), /configured_by_user_id is required/);
assert.throws(() => configurePipelineStageModel({ ...baseInput, configured_at: 'not-a-date' }), /configured_at must be a valid ISO-compatible timestamp/);
assert.throws(() => configurePipelineStageModel({ ...baseInput, stages: [] }), /stages must contain at least one stage/);
assert.throws(
  () => configurePipelineStageModel({
    ...baseInput,
    stages: [{ ...baseInput.stages[0]!, category: 'UNDECLARED_STAGE' as never }],
  }),
  /category is not supported/,
);
assert.throws(
  () => configurePipelineStageModel({
    ...baseInput,
    stages: [{ ...baseInput.stages[0]!, lifecycle_state: 'DELETED' as never }],
  }),
  /lifecycle_state is not supported/,
);
assert.throws(
  () => configurePipelineStageModel({
    ...baseInput,
    stages: [{ ...baseInput.stages[0]!, sort_order: 0 }],
  }),
  /sort_order must be a positive integer/,
);
assert.throws(
  () => configurePipelineStageModel({
    ...baseInput,
    stages: [baseInput.stages[0]!, { ...baseInput.stages[1]!, stage_key: 'intake' }],
  }),
  /stage_key values must be unique/,
);
assert.throws(
  () => configurePipelineStageModel({
    ...baseInput,
    stages: [baseInput.stages[0]!, { ...baseInput.stages[1]!, sort_order: 1 }],
  }),
  /sort_order values must be unique/,
);
assert.throws(
  () => configurePipelineStageModel({
    ...baseInput,
    stages: [{ ...baseInput.stages[0]!, allowed_next_stage_keys: ['missing_stage'] }],
  }),
  /allowed_next_stage_keys must reference declared stage_key values/,
);
assert.throws(
  () => configurePipelineStageModel({
    ...baseInput,
    stages: [{ ...baseInput.stages[0]!, allowed_next_stage_keys: ['intake'] }],
  }),
  /allowed_next_stage_keys must not self-reference/,
);
assert.throws(
  () => configurePipelineStageModel({
    ...baseInput,
    stages: baseInput.stages.map((stage) =>
      stage.stage_key === 'won' ? { ...stage, allowed_next_stage_keys: ['intake'] } : stage,
    ),
  }),
  /terminal stages must not define allowed_next_stage_keys/,
);
assert.throws(() => configurePipelineStageModel({ ...baseInput, stage_movement_requested: true }), /must not execute stage movement/);
assert.throws(() => configurePipelineStageModel({ ...baseInput, timeline_entry_requested: true }), /must not create timeline entries/);
assert.throws(() => configurePipelineStageModel({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-045 pipeline stage model service test passed.');
