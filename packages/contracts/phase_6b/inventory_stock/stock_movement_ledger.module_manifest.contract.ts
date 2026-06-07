import { phase6BStockMovementLedgerComponentId, phase6BStockMovementLedgerModuleKey, phase6BStockMovementLedgerSeedId } from './stock_movement_ledger.contract.js';

export const phase6BStockMovementLedgerManifest = {
  seed_id: phase6BStockMovementLedgerSeedId,
  component_id: phase6BStockMovementLedgerComponentId,
  module_key: phase6BStockMovementLedgerModuleKey,
  surface: 'stock_movement_ledger',
  tenant_service: true,
  activation_lifecycle_required: true,
  foundry_activation_scope: 'optional_for_non_inventory_businesses_required_for_retail_ecommerce_packages',
  access_control_boundary: 'ACCESS_CORE_REQUIRED',
  product_record_authority_required: true,
  product_price_history_required: true,
  emits_evidence_event: 'PHASE_6B_STOCK_MOVEMENT_LEDGER_ENTRY_RECORDED',
  forbidden_behaviors: ['provider_operation', 'pricing_engine', 'independent_foundry_activation'],
} as const;

export type Phase6BStockMovementLedgerManifest = typeof phase6BStockMovementLedgerManifest;
