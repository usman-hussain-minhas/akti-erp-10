import {
  phase6BCategoryTaxonomyComponentId,
  phase6BCategoryTaxonomyModuleKey,
  phase6BCategoryTaxonomySeedId,
} from './category_taxonomy.contract.js';

export type Phase6BCategoryTaxonomyModuleManifest = {
  phase: '6B';
  source_component_id: typeof phase6BCategoryTaxonomyComponentId;
  module_key: typeof phase6BCategoryTaxonomyModuleKey;
  seed_id: typeof phase6BCategoryTaxonomySeedId;
  owned_models: ['Phase6BProductCategory'];
  related_catalogue_models: ['Phase6BProduct', 'Phase6BProductHistory'];
  emitted_events: ['product.updated', 'product.archived'];
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
  category_taxonomy_evidence_required: true;
  direct_person_identity_owner_allowed: false;
};

export const phase6BCategoryTaxonomyModuleManifest = {
  phase: '6B',
  source_component_id: phase6BCategoryTaxonomyComponentId,
  module_key: phase6BCategoryTaxonomyModuleKey,
  seed_id: phase6BCategoryTaxonomySeedId,
  owned_models: ['Phase6BProductCategory'],
  related_catalogue_models: ['Phase6BProduct', 'Phase6BProductHistory'],
  emitted_events: ['product.updated', 'product.archived'],
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
  category_taxonomy_evidence_required: true,
  direct_person_identity_owner_allowed: false,
} as const satisfies Phase6BCategoryTaxonomyModuleManifest;

export function assertPhase6BCategoryTaxonomyModuleManifest(
  manifest: Phase6BCategoryTaxonomyModuleManifest,
): void {
  if (manifest.phase !== '6B') throw new Error('Category taxonomy must remain Phase 6B scoped');
  if (manifest.seed_id !== phase6BCategoryTaxonomySeedId) throw new Error('Manifest seed id drift');
  if (manifest.tenant_isolation_key !== 'organization_id') throw new Error('Category taxonomy requires organization tenant isolation');
  if (manifest.lifecycle_policy !== 'foundry_managed_archive_over_delete') throw new Error('Category taxonomy must archive over delete');
  if (!manifest.category_taxonomy_evidence_required) throw new Error('Category taxonomy evidence is required');
  if (manifest.direct_person_identity_owner_allowed) throw new Error('Category taxonomy must not directly own Person identity');
  if (!manifest.required_phase_6a_dependencies.includes('seed_6a_service_manifest_contract')) {
    throw new Error('Foundry service manifest dependency is required');
  }
}

assertPhase6BCategoryTaxonomyModuleManifest(phase6BCategoryTaxonomyModuleManifest);
