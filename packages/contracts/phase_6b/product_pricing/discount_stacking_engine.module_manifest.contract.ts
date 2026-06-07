import { phase6BDiscountStackingEngineComponentId, phase6BDiscountStackingEngineModuleKey, phase6BDiscountStackingEngineSeedId } from './discount_stacking_engine.contract.js';

export const phase6BDiscountStackingEngineManifest = {
  seed_id: phase6BDiscountStackingEngineSeedId,
  component_id: phase6BDiscountStackingEngineComponentId,
  module_key: phase6BDiscountStackingEngineModuleKey,
  surface: 'discount_stacking_engine',
  activation_lifecycle_required: true,
  foundry_activation_scope: 'tenant_toggleable_through_product_pricing_service',
  access_control_boundary: 'ACCESS_CORE_REQUIRED',
  pricing_authority: 'PRODUCT_PRICE_HISTORY',
  invoice_snapshot_required: true,
  adl_refs: ['ADL-015'],
  configurable_order_required: true,
  emits_evidence_event: 'PHASE_6B_DISCOUNT_STACKING_EVALUATED',
  forbidden_behaviors: [
    'undisclosed_discount_policy',
    'independent_foundry_activation',
    'invoice_mutation_after_issue',
  ],
} as const;

export type Phase6BDiscountStackingEngineManifest = typeof phase6BDiscountStackingEngineManifest;
