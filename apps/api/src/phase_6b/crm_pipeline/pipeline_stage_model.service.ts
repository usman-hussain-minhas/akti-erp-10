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

const CATEGORIES: readonly PipelineStageCategory[] = [
  'INTAKE',
  'QUALIFICATION',
  'DUPLICATE_REVIEW',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST',
  'FOLLOW_UP',
] as const;

const LIFECYCLE_STATES: readonly PipelineStageLifecycleState[] = ['ACTIVE', 'INACTIVE', 'RETIRED'] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for pipeline stage model.`);
  }
  return value.trim();
}

function requireConfiguredAt(value: string): string {
  const normalized = requireNonEmpty(value, 'configured_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('configured_at must be a valid ISO-compatible timestamp for pipeline stage model.');
  }
  return normalized;
}

function normalizeCategory(value: PipelineStageCategory): PipelineStageCategory {
  if (!CATEGORIES.includes(value)) {
    throw new Error('category is not supported for pipeline stage model.');
  }
  return value;
}

function normalizeLifecycleState(value: PipelineStageLifecycleState): PipelineStageLifecycleState {
  if (!LIFECYCLE_STATES.includes(value)) {
    throw new Error('lifecycle_state is not supported for pipeline stage model.');
  }
  return value;
}

function normalizeSortOrder(value: number): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error('sort_order must be a positive integer for pipeline stage model.');
  }
  return value;
}

function normalizeNextStageKeys(keys: string[], field: string): readonly string[] {
  if (!Array.isArray(keys)) {
    throw new Error(`${field} must be an array for pipeline stage model.`);
  }
  const normalized = keys.map((key, index) => requireNonEmpty(key, `${field}.${index}`));
  if (new Set(normalized).size !== normalized.length) {
    throw new Error(`${field} must not contain duplicate stage keys for pipeline stage model.`);
  }
  return Object.freeze(normalized);
}

function normalizeStage(stage: PipelineStageDefinition): PipelineStageDefinition {
  return {
    stage_id: requireNonEmpty(stage.stage_id, 'stage_id'),
    stage_key: requireNonEmpty(stage.stage_key, 'stage_key'),
    display_name: requireNonEmpty(stage.display_name, 'display_name'),
    category: normalizeCategory(stage.category),
    lifecycle_state: normalizeLifecycleState(stage.lifecycle_state),
    sort_order: normalizeSortOrder(stage.sort_order),
    allowed_next_stage_keys: [...normalizeNextStageKeys(stage.allowed_next_stage_keys, 'allowed_next_stage_keys')],
    is_terminal: stage.is_terminal === true,
    requires_match_candidate_review: stage.requires_match_candidate_review === true,
    entry_activity_evidence_required: stage.entry_activity_evidence_required === true,
    exit_activity_evidence_required: stage.exit_activity_evidence_required === true,
    visual_workflow_node_ref: stage.visual_workflow_node_ref === undefined ? undefined : requireNonEmpty(stage.visual_workflow_node_ref, 'visual_workflow_node_ref'),
  };
}

function validateStageGraph(stages: readonly PipelineStageDefinition[]): void {
  const stageKeys = new Set<string>();
  const sortOrders = new Set<number>();
  for (const stage of stages) {
    if (stageKeys.has(stage.stage_key)) {
      throw new Error('stage_key values must be unique for pipeline stage model.');
    }
    stageKeys.add(stage.stage_key);
    if (sortOrders.has(stage.sort_order)) {
      throw new Error('sort_order values must be unique for pipeline stage model.');
    }
    sortOrders.add(stage.sort_order);
  }

  for (const stage of stages) {
    if (stage.is_terminal && stage.allowed_next_stage_keys.length > 0) {
      throw new Error('terminal stages must not define allowed_next_stage_keys for pipeline stage model.');
    }
    for (const nextStageKey of stage.allowed_next_stage_keys) {
      if (!stageKeys.has(nextStageKey)) {
        throw new Error('allowed_next_stage_keys must reference declared stage_key values for pipeline stage model.');
      }
      if (nextStageKey === stage.stage_key) {
        throw new Error('allowed_next_stage_keys must not self-reference for pipeline stage model.');
      }
    }
  }
}

export function configurePipelineStageModel(input: PipelineStageModelInput): PipelineStageModelReceipt {
  if (input.stage_movement_requested === true) {
    throw new Error('pipeline stage model must not execute stage movement.');
  }
  if (input.timeline_entry_requested === true) {
    throw new Error('pipeline stage model must not create timeline entries.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('pipeline stage model must not perform irreversible actions.');
  }
  if (!Array.isArray(input.stages) || input.stages.length === 0) {
    throw new Error('stages must contain at least one stage for pipeline stage model.');
  }

  const stages = input.stages.map(normalizeStage).sort((left, right) => left.sort_order - right.sort_order);
  validateStageGraph(stages);

  return {
    seed_id: PHASE_6B_PIPELINE_STAGE_MODEL_SEED_ID,
    component_id: PHASE_6B_PIPELINE_STAGE_MODEL_COMPONENT_ID,
    event_name: PIPELINE_STAGE_MODEL_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    pipeline_stage_model_id: requireNonEmpty(input.pipeline_stage_model_id, 'pipeline_stage_model_id'),
    lifecycle_config_ref: requireNonEmpty(input.lifecycle_config_ref, 'lifecycle_config_ref'),
    unified_lead_record_authority_id: requireNonEmpty(input.unified_lead_record_authority_id, 'unified_lead_record_authority_id'),
    match_candidate_generation_ref: requireNonEmpty(input.match_candidate_generation_ref, 'match_candidate_generation_ref'),
    visual_workflow_builder_ref: requireNonEmpty(input.visual_workflow_builder_ref, 'visual_workflow_builder_ref'),
    configured_by_user_id: requireNonEmpty(input.configured_by_user_id, 'configured_by_user_id'),
    configured_at: requireConfiguredAt(input.configured_at),
    stage_count: stages.length,
    active_stage_count: stages.filter((stage) => stage.lifecycle_state === 'ACTIVE').length,
    terminal_stage_count: stages.filter((stage) => stage.is_terminal).length,
    stages: Object.freeze(stages),
    activation_lifecycle_required: true,
    timeline_evidence_required: true,
    stage_history_required: true,
    stage_movement_allowed: false,
    timeline_entry_creation_allowed: false,
    irreversible_action_allowed: false,
  };
}
