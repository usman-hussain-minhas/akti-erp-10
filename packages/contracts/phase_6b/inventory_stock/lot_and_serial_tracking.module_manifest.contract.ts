import { phase6BLotAndSerialTrackingComponentId, phase6BLotAndSerialTrackingModuleKey, phase6BLotAndSerialTrackingSeedId } from './lot_and_serial_tracking.contract.js';

export const phase6BLotAndSerialTrackingManifest = {
  seed_id: phase6BLotAndSerialTrackingSeedId,
  component_id: phase6BLotAndSerialTrackingComponentId,
  module_key: phase6BLotAndSerialTrackingModuleKey,
  surface: 'lot_and_serial_tracking',
  tenant_service: true,
  activation_lifecycle_required: true,
  foundry_activation_scope: 'optional_for_non_inventory_businesses_required_for_retail_ecommerce_packages',
  access_control_boundary: 'ACCESS_CORE_REQUIRED',
  product_record_authority_required: true,
  product_price_history_required: true,
  emits_evidence_event: 'PHASE_6B_LOT_AND_SERIAL_TRACKING_VALIDATED',
  forbidden_behaviors: ['stock_movement', 'provider_behavior', 'independent_foundry_activation'],
} as const;

export type Phase6BLotAndSerialTrackingManifest = typeof phase6BLotAndSerialTrackingManifest;
