import {
  phase6BProductRecordAuthorityComponentId,
  phase6BProductRecordAuthorityModuleKey,
  phase6BProductRecordAuthoritySeedId,
} from './product_record_authority.contract.js';

export type Phase6BProductRecordAuthorityModuleManifest = {
  phase: '6B';
  source_component_id: typeof phase6BProductRecordAuthorityComponentId;
  module_key: typeof phase6BProductRecordAuthorityModuleKey;
  seed_id: typeof phase6BProductRecordAuthoritySeedId;
  owned_models: ['Phase6BProduct', 'Phase6BProductMedia', 'Phase6BProductHistory', 'Phase6BProductPriceHistory'];
  emitted_events: ['product.created', 'product.updated', 'product.archived'];
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
  product_record_evidence_required: true;
  optional_per_record_pricing_allowed: true;
  direct_person_identity_owner_allowed: false;
};

export const phase6BProductRecordAuthorityModuleManifest = {
  phase: '6B',
  source_component_id: phase6BProductRecordAuthorityComponentId,
  module_key: phase6BProductRecordAuthorityModuleKey,
  seed_id: phase6BProductRecordAuthoritySeedId,
  owned_models: ['Phase6BProduct', 'Phase6BProductMedia', 'Phase6BProductHistory', 'Phase6BProductPriceHistory'],
  emitted_events: ['product.created', 'product.updated', 'product.archived'],
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
  product_record_evidence_required: true,
  optional_per_record_pricing_allowed: true,
  direct_person_identity_owner_allowed: false,
} as const satisfies Phase6BProductRecordAuthorityModuleManifest;

export function assertPhase6BProductRecordAuthorityModuleManifest(
  manifest: Phase6BProductRecordAuthorityModuleManifest,
): void {
  if (manifest.phase !== '6B') throw new Error('Product record authority must remain Phase 6B scoped');
  if (manifest.seed_id !== phase6BProductRecordAuthoritySeedId) throw new Error('Manifest seed id drift');
  if (manifest.tenant_isolation_key !== 'organization_id') throw new Error('Product records require organization tenant isolation');
  if (manifest.lifecycle_policy !== 'foundry_managed_archive_over_delete') throw new Error('Product records must archive over delete');
  if (!manifest.product_record_evidence_required) throw new Error('Product record evidence is required');
  if (manifest.direct_person_identity_owner_allowed) throw new Error('Product records must not directly own Person identity');
  if (!manifest.required_phase_6a_dependencies.includes('seed_6a_service_manifest_contract')) {
    throw new Error('Foundry service manifest dependency is required');
  }
}

assertPhase6BProductRecordAuthorityModuleManifest(phase6BProductRecordAuthorityModuleManifest);
