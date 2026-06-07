import { phase6BProductPriceHistoryEffectiveDatesComponentId, phase6BProductPriceHistoryEffectiveDatesModuleKey, phase6BProductPriceHistoryEffectiveDatesSeedId } from './product_price_history_effective_dates.contract.js';

export const phase6BProductPriceHistoryEffectiveDatesManifest = {
  seed_id: phase6BProductPriceHistoryEffectiveDatesSeedId,
  component_id: phase6BProductPriceHistoryEffectiveDatesComponentId,
  module_key: phase6BProductPriceHistoryEffectiveDatesModuleKey,
  surface: 'product_price_history_effective_dates',
  activation_lifecycle_required: true,
  foundry_activation_scope: 'tenant_toggleable_through_product_pricing_service',
  access_control_boundary: 'ACCESS_CORE_REQUIRED',
  pricing_authority: 'PRODUCT_PRICE_HISTORY',
  canonical_pricing_authority: true,
  invoice_snapshot_required: true,
  emits_evidence_event: 'PHASE_6B_PRODUCT_PRICE_HISTORY_EFFECTIVE_DATES_VALIDATED',
  forbidden_behaviors: [
    'retroactive_invoice_mutation',
    'overlapping_effective_date_ranges',
    'independent_foundry_activation',
  ],
} as const;

export type Phase6BProductPriceHistoryEffectiveDatesManifest = typeof phase6BProductPriceHistoryEffectiveDatesManifest;
