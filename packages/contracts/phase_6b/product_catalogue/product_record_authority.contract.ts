export const phase6BProductRecordAuthoritySeedId = 'seed_6b_01_product_record_authority' as const;
export const phase6BProductRecordAuthorityComponentId = '6B.01' as const;
export const phase6BProductRecordAuthorityModuleKey = 'phase-6b.product-catalogue' as const;

export type Phase6BProductRecordLifecycleStatus = 'draft' | 'active' | 'archived';
export type Phase6BProductRecordEventType = 'product.created' | 'product.updated' | 'product.archived';

export type Phase6BProductRecordAuthorityInput = {
  organization_id: string;
  product_id: string;
  source_seed_id?: typeof phase6BProductRecordAuthoritySeedId;
  status: Phase6BProductRecordLifecycleStatus;
  name: string;
  sku?: string;
  category_ids?: string[];
  media_ids?: string[];
  price_history_ids?: string[];
  actor_user_id: string;
  requested_event: Phase6BProductRecordEventType;
  archived_reason?: string;
};

export type Phase6BProductRecordAuthorityEvidence = {
  seed_id: typeof phase6BProductRecordAuthoritySeedId;
  source_component_id: typeof phase6BProductRecordAuthorityComponentId;
  module_key: typeof phase6BProductRecordAuthorityModuleKey;
  organization_id: string;
  product_id: string;
  event_type: Phase6BProductRecordEventType;
  actor_user_id: string;
  evidence_subject: 'product_record';
  archive_over_delete_enforced: boolean;
  foundry_activation_required: true;
  access_gatekeeper_required: true;
};

export type Phase6BProductRecordAuthorityDecision = {
  accepted: boolean;
  normalized_status: Phase6BProductRecordLifecycleStatus;
  schema_model: 'Phase6BProduct';
  owned_related_models: ['Phase6BProductMedia', 'Phase6BProductHistory', 'Phase6BProductPriceHistory'];
  emitted_event: Phase6BProductRecordEventType;
  evidence: Phase6BProductRecordAuthorityEvidence;
  violations: string[];
};

const allowedStatuses = new Set<Phase6BProductRecordLifecycleStatus>(['draft', 'active', 'archived']);
const allowedEvents = new Set<Phase6BProductRecordEventType>(['product.created', 'product.updated', 'product.archived']);

function hasText(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasDuplicate(values: string[]): boolean {
  return new Set(values).size !== values.length;
}

export function validatePhase6BProductRecordAuthorityInput(
  input: Phase6BProductRecordAuthorityInput,
): string[] {
  const violations: string[] = [];

  if (!hasText(input.organization_id)) violations.push('organization_id is required for tenant isolation');
  if (!hasText(input.product_id)) violations.push('product_id is required for product record authority');
  if (!hasText(input.name)) violations.push('name is required for product record authority');
  if (!hasText(input.actor_user_id)) violations.push('actor_user_id is required for product record evidence');
  if (input.source_seed_id !== undefined && input.source_seed_id !== phase6BProductRecordAuthoritySeedId) {
    violations.push('source_seed_id must remain bound to seed_6b_01_product_record_authority');
  }
  if (!allowedStatuses.has(input.status)) violations.push('status must be draft, active, or archived');
  if (!allowedEvents.has(input.requested_event)) violations.push('requested_event must be product.created, product.updated, or product.archived');
  if (input.requested_event === 'product.archived' && input.status !== 'archived') {
    violations.push('product.archived event requires archived status');
  }
  if (input.status === 'archived' && !hasText(input.archived_reason)) {
    violations.push('archived products require archived_reason to enforce archive over delete');
  }
  if ((input.category_ids ?? []).some((id) => !hasText(id))) violations.push('category_ids cannot contain blank ids');
  if ((input.media_ids ?? []).some((id) => !hasText(id))) violations.push('media_ids cannot contain blank ids');
  if ((input.price_history_ids ?? []).some((id) => !hasText(id))) violations.push('price_history_ids cannot contain blank ids');
  if (hasDuplicate(input.category_ids ?? [])) violations.push('category_ids must be unique');
  if (hasDuplicate(input.media_ids ?? [])) violations.push('media_ids must be unique');
  if (hasDuplicate(input.price_history_ids ?? [])) violations.push('price_history_ids must be unique');

  return violations;
}

export function buildPhase6BProductRecordAuthorityDecision(
  input: Phase6BProductRecordAuthorityInput,
): Phase6BProductRecordAuthorityDecision {
  const violations = validatePhase6BProductRecordAuthorityInput(input);
  const emitted_event: Phase6BProductRecordEventType = input.status === 'archived' ? 'product.archived' : input.requested_event;

  return {
    accepted: violations.length === 0,
    normalized_status: input.status,
    schema_model: 'Phase6BProduct',
    owned_related_models: ['Phase6BProductMedia', 'Phase6BProductHistory', 'Phase6BProductPriceHistory'],
    emitted_event,
    evidence: {
      seed_id: phase6BProductRecordAuthoritySeedId,
      source_component_id: phase6BProductRecordAuthorityComponentId,
      module_key: phase6BProductRecordAuthorityModuleKey,
      organization_id: input.organization_id,
      product_id: input.product_id,
      event_type: emitted_event,
      actor_user_id: input.actor_user_id,
      evidence_subject: 'product_record',
      archive_over_delete_enforced: true,
      foundry_activation_required: true,
      access_gatekeeper_required: true,
    },
    violations,
  };
}
