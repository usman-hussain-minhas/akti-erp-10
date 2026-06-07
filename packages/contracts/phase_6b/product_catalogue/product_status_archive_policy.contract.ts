export const phase6BProductStatusArchivePolicySeedId = 'seed_6b_01_product_status_archive_policy' as const;
export const phase6BProductStatusArchivePolicyComponentId = '6B.01' as const;
export const phase6BProductStatusArchivePolicyModuleKey = 'phase-6b.product-catalogue' as const;

export type Phase6BProductStatus = 'draft' | 'active' | 'archived';
export type Phase6BProductStatusEventType = 'product.created' | 'product.updated' | 'product.archived';
export type Phase6BProductStatusRequestedAction = 'create' | 'update_status' | 'archive' | 'delete';

export type Phase6BProductStatusArchivePolicyInput = {
  organization_id: string;
  product_id: string;
  source_seed_id?: typeof phase6BProductStatusArchivePolicySeedId;
  current_status?: Phase6BProductStatus;
  requested_status: Phase6BProductStatus;
  requested_action: Phase6BProductStatusRequestedAction;
  requested_event: Phase6BProductStatusEventType;
  actor_user_id: string;
  archive_reason?: string;
  status_change_reason?: string;
};

export type Phase6BProductStatusArchivePolicyEvidence = {
  seed_id: typeof phase6BProductStatusArchivePolicySeedId;
  source_component_id: typeof phase6BProductStatusArchivePolicyComponentId;
  module_key: typeof phase6BProductStatusArchivePolicyModuleKey;
  organization_id: string;
  product_id: string;
  event_type: Phase6BProductStatusEventType;
  actor_user_id: string;
  evidence_subject: 'product_status_archive_policy';
  schema_models: ['Phase6BProduct', 'Phase6BProductHistory'];
  archive_over_delete_enforced: boolean;
  delete_action_blocked: boolean;
  foundry_activation_required: true;
  access_gatekeeper_required: true;
};

export type Phase6BProductStatusArchivePolicyDecision = {
  accepted: boolean;
  normalized_status: Phase6BProductStatus;
  emitted_event: Phase6BProductStatusEventType;
  evidence: Phase6BProductStatusArchivePolicyEvidence;
  violations: string[];
};

const allowedStatuses = new Set<Phase6BProductStatus>(['draft', 'active', 'archived']);
const allowedEvents = new Set<Phase6BProductStatusEventType>(['product.created', 'product.updated', 'product.archived']);
const allowedActions = new Set<Phase6BProductStatusRequestedAction>(['create', 'update_status', 'archive', 'delete']);

function hasText(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validatePhase6BProductStatusArchivePolicyInput(
  input: Phase6BProductStatusArchivePolicyInput,
): string[] {
  const violations: string[] = [];

  if (!hasText(input.organization_id)) violations.push('organization_id is required for tenant isolation');
  if (!hasText(input.product_id)) violations.push('product_id is required for product status archive policy');
  if (!hasText(input.actor_user_id)) violations.push('actor_user_id is required for product status evidence');
  if (input.source_seed_id !== undefined && input.source_seed_id !== phase6BProductStatusArchivePolicySeedId) {
    violations.push('source_seed_id must remain bound to seed_6b_01_product_status_archive_policy');
  }
  if (input.current_status !== undefined && !allowedStatuses.has(input.current_status)) {
    violations.push('current_status must be draft, active, or archived when provided');
  }
  if (!allowedStatuses.has(input.requested_status)) violations.push('requested_status must be draft, active, or archived');
  if (!allowedEvents.has(input.requested_event)) violations.push('requested_event must be product.created, product.updated, or product.archived');
  if (!allowedActions.has(input.requested_action)) violations.push('requested_action must be create, update_status, archive, or delete');
  if (input.requested_action === 'delete') violations.push('delete action is forbidden; archive over delete is required');
  if (input.requested_action === 'create' && input.requested_event !== 'product.created') {
    violations.push('create action requires product.created event');
  }
  if (input.requested_action === 'archive' && input.requested_status !== 'archived') {
    violations.push('archive action requires archived status');
  }
  if (input.requested_status === 'archived' && input.requested_event !== 'product.archived') {
    violations.push('archived status requires product.archived event');
  }
  if (input.requested_event === 'product.archived' && input.requested_status !== 'archived') {
    violations.push('product.archived event requires archived status');
  }
  if (input.requested_status === 'archived' && !hasText(input.archive_reason)) {
    violations.push('archived status requires archive_reason to enforce archive over delete');
  }
  if (input.requested_status !== input.current_status && input.requested_action === 'update_status' && !hasText(input.status_change_reason)) {
    violations.push('status changes require status_change_reason');
  }

  return violations;
}

export function buildPhase6BProductStatusArchivePolicyDecision(
  input: Phase6BProductStatusArchivePolicyInput,
): Phase6BProductStatusArchivePolicyDecision {
  const violations = validatePhase6BProductStatusArchivePolicyInput(input);
  const emitted_event: Phase6BProductStatusEventType = input.requested_status === 'archived' ? 'product.archived' : input.requested_event;

  return {
    accepted: violations.length === 0,
    normalized_status: input.requested_status,
    emitted_event,
    evidence: {
      seed_id: phase6BProductStatusArchivePolicySeedId,
      source_component_id: phase6BProductStatusArchivePolicyComponentId,
      module_key: phase6BProductStatusArchivePolicyModuleKey,
      organization_id: input.organization_id,
      product_id: input.product_id,
      event_type: emitted_event,
      actor_user_id: input.actor_user_id,
      evidence_subject: 'product_status_archive_policy',
      schema_models: ['Phase6BProduct', 'Phase6BProductHistory'],
      archive_over_delete_enforced: true,
      delete_action_blocked: input.requested_action === 'delete',
      foundry_activation_required: true,
      access_gatekeeper_required: true,
    },
    violations,
  };
}
