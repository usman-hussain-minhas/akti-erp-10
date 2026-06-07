import { phase6BStockLevelLocationAuthorityComponentId, phase6BStockLevelLocationAuthorityModuleKey, phase6BStockLevelLocationAuthoritySeedId } from './stock_level_location_authority.contract.js';

export const phase6BStockLevelLocationAuthorityManifest = {
  seed_id: phase6BStockLevelLocationAuthoritySeedId,
  component_id: phase6BStockLevelLocationAuthorityComponentId,
  module_key: phase6BStockLevelLocationAuthorityModuleKey,
  surface: 'stock_level_location_authority',
  tenant_service: true,
  activation_lifecycle_required: true,
  foundry_activation_scope: 'optional_for_non_inventory_businesses_required_for_retail_ecommerce_packages',
  access_control_boundary: 'ACCESS_CORE_REQUIRED',
  product_record_authority_required: true,
  product_price_history_required: true,
  emits_evidence_event: 'PHASE_6B_STOCK_LEVEL_LOCATION_AUTHORITY_VALIDATED',
  forbidden_behaviors: ['stock_movement', 'allocation', 'provider_behavior', 'independent_foundry_activation'],
} as const;

export type Phase6BStockLevelLocationAuthorityManifest = typeof phase6BStockLevelLocationAuthorityManifest;
