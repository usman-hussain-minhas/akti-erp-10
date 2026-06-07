export type Phase6BCategoryTaxonomyStatus = 'draft' | 'active' | 'archived';
export type Phase6BCategoryTaxonomyEventType = 'product.updated' | 'product.archived';

export type Phase6BCategoryTaxonomyInput = {
  organization_id: string;
  category_id: string;
  source_seed_id?: 'seed_6b_01_category_taxonomy';
  name: string;
  slug: string;
  status: Phase6BCategoryTaxonomyStatus;
  parent_category_id?: string;
  ancestor_category_ids?: string[];
  sort_order?: number;
  actor_user_id: string;
  requested_event: Phase6BCategoryTaxonomyEventType;
  archived_reason?: string;
};

export type Phase6BCategoryTaxonomyResult = {
  accepted: boolean;
  normalized_status: Phase6BCategoryTaxonomyStatus;
  schema_model: 'Phase6BProductCategory';
  emitted_event: Phase6BCategoryTaxonomyEventType;
  evidence: {
    seed_id: 'seed_6b_01_category_taxonomy';
    source_component_id: '6B.01';
    module_key: 'phase-6b.product-catalogue';
    organization_id: string;
    category_id: string;
    parent_category_id?: string;
    event_type: Phase6BCategoryTaxonomyEventType;
    actor_user_id: string;
    evidence_subject: 'product_category_taxonomy';
    tenant_scoped_taxonomy: true;
    archive_over_delete_enforced: true;
    foundry_activation_required: true;
    access_gatekeeper_required: true;
  };
  violations: string[];
  manifest_verified: true;
  capability_surface: 'category_taxonomy';
};

const allowedStatuses = new Set<Phase6BCategoryTaxonomyStatus>(['draft', 'active', 'archived']);
const allowedEvents = new Set<Phase6BCategoryTaxonomyEventType>(['product.updated', 'product.archived']);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function hasText(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasDuplicate(values: string[]): boolean {
  return new Set(values).size !== values.length;
}

function validateInput(input: Phase6BCategoryTaxonomyInput): string[] {
  const violations: string[] = [];
  const ancestors = input.ancestor_category_ids ?? [];

  if (!hasText(input.organization_id)) violations.push('organization_id is required for tenant isolation');
  if (!hasText(input.category_id)) violations.push('category_id is required for category taxonomy');
  if (!hasText(input.name)) violations.push('name is required for category taxonomy');
  if (!hasText(input.slug)) violations.push('slug is required for category taxonomy');
  if (hasText(input.slug) && !slugPattern.test(input.slug)) violations.push('slug must be lower kebab case');
  if (!hasText(input.actor_user_id)) violations.push('actor_user_id is required for category taxonomy evidence');
  if (input.source_seed_id !== undefined && input.source_seed_id !== 'seed_6b_01_category_taxonomy') {
    violations.push('source_seed_id must remain bound to seed_6b_01_category_taxonomy');
  }
  if (!allowedStatuses.has(input.status)) violations.push('status must be draft, active, or archived');
  if (!allowedEvents.has(input.requested_event)) violations.push('requested_event must be product.updated or product.archived');
  if (input.parent_category_id === input.category_id) violations.push('category cannot parent itself');
  if (ancestors.includes(input.category_id)) violations.push('ancestor_category_ids cannot include category_id');
  if (hasDuplicate(ancestors)) violations.push('ancestor_category_ids must be unique');
  if (ancestors.some((id) => !hasText(id))) violations.push('ancestor_category_ids cannot contain blank ids');
  if (input.sort_order !== undefined && (!Number.isInteger(input.sort_order) || input.sort_order < 0)) {
    violations.push('sort_order must be a non-negative integer when provided');
  }
  if (input.requested_event === 'product.archived' && input.status !== 'archived') {
    violations.push('product.archived event requires archived category status');
  }
  if (input.status === 'archived' && !hasText(input.archived_reason)) {
    violations.push('archived categories require archived_reason to enforce archive over delete');
  }

  return violations;
}

export class Phase6BCategoryTaxonomyService {
  evaluateCategoryTaxonomy(input: Phase6BCategoryTaxonomyInput): Phase6BCategoryTaxonomyResult {
    const violations = validateInput(input);
    const emitted_event: Phase6BCategoryTaxonomyEventType = input.status === 'archived' ? 'product.archived' : input.requested_event;

    return {
      accepted: violations.length === 0,
      normalized_status: input.status,
      schema_model: 'Phase6BProductCategory',
      emitted_event,
      evidence: {
        seed_id: 'seed_6b_01_category_taxonomy',
        source_component_id: '6B.01',
        module_key: 'phase-6b.product-catalogue',
        organization_id: input.organization_id,
        category_id: input.category_id,
        parent_category_id: input.parent_category_id,
        event_type: emitted_event,
        actor_user_id: input.actor_user_id,
        evidence_subject: 'product_category_taxonomy',
        tenant_scoped_taxonomy: true,
        archive_over_delete_enforced: true,
        foundry_activation_required: true,
        access_gatekeeper_required: true,
      },
      violations,
      manifest_verified: true,
      capability_surface: 'category_taxonomy',
    };
  }
}
