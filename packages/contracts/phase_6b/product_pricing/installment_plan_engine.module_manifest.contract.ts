import { phase6BInstallmentPlanEngineComponentId, phase6BInstallmentPlanEngineModuleKey, phase6BInstallmentPlanEngineSeedId } from './installment_plan_engine.contract.js';

export const phase6BInstallmentPlanEngineManifest = {
  seed_id: phase6BInstallmentPlanEngineSeedId,
  component_id: phase6BInstallmentPlanEngineComponentId,
  module_key: phase6BInstallmentPlanEngineModuleKey,
  surface: 'installment_plan_engine',
  activation_lifecycle_required: true,
  foundry_activation_scope: 'tenant_toggleable_through_product_pricing_service',
  access_control_boundary: 'ACCESS_CORE_REQUIRED',
  pricing_authority: 'PRODUCT_PRICE_HISTORY',
  invoice_snapshot_required: true,
  adl_refs: ['ADL-013'],
  emits_evidence_event: 'PHASE_6B_INSTALLMENT_PLAN_VALIDATED',
  forbidden_behaviors: [
    'payment_allocation',
    'provider_charge',
    'independent_foundry_activation',
    'invoice_mutation_after_issue',
  ],
} as const;

export type Phase6BInstallmentPlanEngineManifest = typeof phase6BInstallmentPlanEngineManifest;
