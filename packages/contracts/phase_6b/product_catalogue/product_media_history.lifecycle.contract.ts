export const phase6BProductMediaHistorySeedId = 'seed_6b_01_product_media_history' as const;
export const phase6BProductMediaHistoryComponentId = '6B.01' as const;
export const phase6BProductMediaHistoryModuleKey = 'phase-6b.product-catalogue' as const;

export type Phase6BProductMediaHistoryAction =
  | 'media_attached'
  | 'media_replaced'
  | 'media_archived'
  | 'history_recorded';

export type Phase6BProductMediaHistoryEventType = 'product.updated' | 'product.archived';

export type Phase6BProductMediaHistoryInput = {
  organization_id: string;
  product_id: string;
  media_id: string;
  history_id: string;
  source_seed_id?: typeof phase6BProductMediaHistorySeedId;
  storage_object_id: string;
  actor_user_id: string;
  action: Phase6BProductMediaHistoryAction;
  requested_event: Phase6BProductMediaHistoryEventType;
  previous_media_id?: string;
  replacement_media_id?: string;
  archive_reason?: string;
  sequence_number?: number;
};

export type Phase6BProductMediaHistoryEvidence = {
  seed_id: typeof phase6BProductMediaHistorySeedId;
  source_component_id: typeof phase6BProductMediaHistoryComponentId;
  module_key: typeof phase6BProductMediaHistoryModuleKey;
  organization_id: string;
  product_id: string;
  media_id: string;
  history_id: string;
  storage_object_id: string;
  actor_user_id: string;
  action: Phase6BProductMediaHistoryAction;
  event_type: Phase6BProductMediaHistoryEventType;
  evidence_subject: 'product_media_history';
  schema_models: ['Phase6BProductMedia', 'Phase6BProductHistory'];
  svfs_object_store_required: true;
  internal_lifecycle_primitive: true;
  foundry_activation_required: false;
  archive_over_delete_enforced: boolean;
};

export type Phase6BProductMediaHistoryDecision = {
  accepted: boolean;
  emitted_event: Phase6BProductMediaHistoryEventType;
  evidence: Phase6BProductMediaHistoryEvidence;
  violations: string[];
};

const allowedActions = new Set<Phase6BProductMediaHistoryAction>([
  'media_attached',
  'media_replaced',
  'media_archived',
  'history_recorded',
]);
const allowedEvents = new Set<Phase6BProductMediaHistoryEventType>(['product.updated', 'product.archived']);

function hasText(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validatePhase6BProductMediaHistoryInput(input: Phase6BProductMediaHistoryInput): string[] {
  const violations: string[] = [];

  if (!hasText(input.organization_id)) violations.push('organization_id is required for tenant isolation');
  if (!hasText(input.product_id)) violations.push('product_id is required for product media history');
  if (!hasText(input.media_id)) violations.push('media_id is required for product media history');
  if (!hasText(input.history_id)) violations.push('history_id is required for product history evidence');
  if (!hasText(input.storage_object_id)) violations.push('storage_object_id is required from SVFS object store');
  if (!hasText(input.actor_user_id)) violations.push('actor_user_id is required for product media history evidence');
  if (input.source_seed_id !== undefined && input.source_seed_id !== phase6BProductMediaHistorySeedId) {
    violations.push('source_seed_id must remain bound to seed_6b_01_product_media_history');
  }
  if (!allowedActions.has(input.action)) violations.push('action must be a supported product media history action');
  if (!allowedEvents.has(input.requested_event)) violations.push('requested_event must be product.updated or product.archived');
  if (input.action === 'media_replaced' && !hasText(input.previous_media_id)) {
    violations.push('media_replaced requires previous_media_id');
  }
  if (input.action === 'media_replaced' && !hasText(input.replacement_media_id)) {
    violations.push('media_replaced requires replacement_media_id');
  }
  if (input.action === 'media_replaced' && input.previous_media_id === input.replacement_media_id) {
    violations.push('replacement_media_id must differ from previous_media_id');
  }
  if (input.action === 'media_archived' && input.requested_event !== 'product.archived') {
    violations.push('media_archived requires product.archived event');
  }
  if (input.action === 'media_archived' && !hasText(input.archive_reason)) {
    violations.push('media_archived requires archive_reason to enforce archive over delete');
  }
  if (input.sequence_number !== undefined && (!Number.isInteger(input.sequence_number) || input.sequence_number < 0)) {
    violations.push('sequence_number must be a non-negative integer when provided');
  }

  return violations;
}

export function buildPhase6BProductMediaHistoryDecision(
  input: Phase6BProductMediaHistoryInput,
): Phase6BProductMediaHistoryDecision {
  const violations = validatePhase6BProductMediaHistoryInput(input);
  const emitted_event: Phase6BProductMediaHistoryEventType = input.action === 'media_archived' ? 'product.archived' : input.requested_event;

  return {
    accepted: violations.length === 0,
    emitted_event,
    evidence: {
      seed_id: phase6BProductMediaHistorySeedId,
      source_component_id: phase6BProductMediaHistoryComponentId,
      module_key: phase6BProductMediaHistoryModuleKey,
      organization_id: input.organization_id,
      product_id: input.product_id,
      media_id: input.media_id,
      history_id: input.history_id,
      storage_object_id: input.storage_object_id,
      actor_user_id: input.actor_user_id,
      action: input.action,
      event_type: emitted_event,
      evidence_subject: 'product_media_history',
      schema_models: ['Phase6BProductMedia', 'Phase6BProductHistory'],
      svfs_object_store_required: true,
      internal_lifecycle_primitive: true,
      foundry_activation_required: false,
      archive_over_delete_enforced: true,
    },
    violations,
  };
}
