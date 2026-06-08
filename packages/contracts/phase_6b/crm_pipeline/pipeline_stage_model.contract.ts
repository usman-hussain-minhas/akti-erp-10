export const PHASE_6B_PIPELINE_STAGE_MODEL_SEED_ID = 'seed_6b_06_pipeline_stage_model' as const;
export const PHASE_6B_PIPELINE_STAGE_MODEL_COMPONENT_ID = '6B.06' as const;

export const PIPELINE_STAGE_MODEL_EVENT = 'phase_6b.crm_pipeline.pipeline_stage_model.configured' as const;

export type PipelineStageCategory =
  | 'INTAKE'
  | 'QUALIFICATION'
  | 'DUPLICATE_REVIEW'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST'
  | 'FOLLOW_UP';

export type PipelineStageLifecycleState = 'ACTIVE' | 'INACTIVE' | 'RETIRED';

export type PipelineStageDefinition = {
  stage_id: string;
  stage_key: string;
  display_name: string;
  category: PipelineStageCategory;
  lifecycle_state: PipelineStageLifecycleState;
  sort_order: number;
  allowed_next_stage_keys: string[];
  is_terminal: boolean;
  requires_match_candidate_review: boolean;
  entry_activity_evidence_required: boolean;
  exit_activity_evidence_required: boolean;
  visual_workflow_node_ref?: string;
};

export type PipelineStageModelInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  pipeline_stage_model_id: string;
  lifecycle_config_ref: string;
  unified_lead_record_authority_id: string;
  match_candidate_generation_ref: string;
  visual_workflow_builder_ref: string;
  configured_by_user_id: string;
  configured_at: string;
  stages: PipelineStageDefinition[];
  stage_movement_requested?: boolean;
  timeline_entry_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type PipelineStageModelReceipt = {
  seed_id: typeof PHASE_6B_PIPELINE_STAGE_MODEL_SEED_ID;
  component_id: typeof PHASE_6B_PIPELINE_STAGE_MODEL_COMPONENT_ID;
  event_name: typeof PIPELINE_STAGE_MODEL_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  pipeline_stage_model_id: string;
  lifecycle_config_ref: string;
  unified_lead_record_authority_id: string;
  match_candidate_generation_ref: string;
  visual_workflow_builder_ref: string;
  configured_by_user_id: string;
  configured_at: string;
  stage_count: number;
  active_stage_count: number;
  terminal_stage_count: number;
  stages: readonly PipelineStageDefinition[];
  activation_lifecycle_required: true;
  timeline_evidence_required: true;
  stage_history_required: true;
  stage_movement_allowed: false;
  timeline_entry_creation_allowed: false;
  irreversible_action_allowed: false;
};
