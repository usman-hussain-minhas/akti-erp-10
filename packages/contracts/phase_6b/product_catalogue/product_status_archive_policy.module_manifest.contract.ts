import {
  phase6BProductStatusArchivePolicyComponentId,
  phase6BProductStatusArchivePolicyModuleKey,
  phase6BProductStatusArchivePolicySeedId,
} from './product_status_archive_policy.contract.js';

export type Phase6BProductStatusArchivePolicyModuleManifest = {
  phase: '6B';
  source_component_id: typeof phase6BProductStatusArchivePolicyComponentId;
  module_key: typeof phase6BProductStatusArchivePolicyModuleKey;
  seed_id: typeof phase6BProductStatusArchivePolicySeedId;
  governed_models: ['Phase6BProduct', 'Phase6BProductHistory'];
  governed_events: ['product.created', 'product.updated', 'product.archived'];
  forbidden_actions: ['delete'];
  required_phase_6a_dependencies: [
    'seed_6a_service_manifest_contract',
    'seed_6a_svfs_object_store',
    'seed_6a_person_identity_graph',
    'seed_6a_access_core_gatekeeper',
    'seed_6a_visual_workflow_builder',
    'seed_6a_base_design_tokens',
  ];
  lifecycle_policy: 'foundry_managed_archive_over_delete';
  tenant_isolation_key: 'organization_id';
  product_status_evidence_required: true;
};

export const phase6BProductStatusArchivePolicyModuleManifest = {
  phase: '6B',
  source_component_id: phase6BProductStatusArchivePolicyComponentId,
  module_key: phase6BProductStatusArchivePolicyModuleKey,
  seed_id: phase6BProductStatusArchivePolicySeedId,
  governed_models: ['Phase6BProduct', 'Phase6BProductHistory'],
  governed_events: ['product.created', 'product.updated', 'product.archived'],
  forbidden_actions: ['delete'],
  required_phase_6a_dependencies: [
    'seed_6a_service_manifest_contract',
    'seed_6a_svfs_object_store',
    'seed_6a_person_identity_graph',
    'seed_6a_access_core_gatekeeper',
    'seed_6a_visual_workflow_builder',
    'seed_6a_base_design_tokens',
  ],
  lifecycle_policy: 'foundry_managed_archive_over_delete',
  tenant_isolation_key: 'organization_id',
  product_status_evidence_required: true,
} as const satisfies Phase6BProductStatusArchivePolicyModuleManifest;

export function assertPhase6BProductStatusArchivePolicyModuleManifest(
  manifest: Phase6BProductStatusArchivePolicyModuleManifest,
): void {
  if (manifest.phase !== '6B') throw new Error('Product status archive policy must remain Phase 6B scoped');
  if (manifest.seed_id !== phase6BProductStatusArchivePolicySeedId) throw new Error('Manifest seed id drift');
  if (manifest.tenant_isolation_key !== 'organization_id') throw new Error('Product status policy requires organization tenant isolation');
  if (manifest.lifecycle_policy !== 'foundry_managed_archive_over_delete') throw new Error('Product status policy must archive over delete');
  if (!manifest.forbidden_actions.includes('delete')) throw new Error('Delete must remain forbidden for product status policy');
  if (!manifest.product_status_evidence_required) throw new Error('Product status evidence is required');
  if (!manifest.required_phase_6a_dependencies.includes('seed_6a_service_manifest_contract')) {
    throw new Error('Foundry service manifest dependency is required');
  }
}

assertPhase6BProductStatusArchivePolicyModuleManifest(phase6BProductStatusArchivePolicyModuleManifest);
