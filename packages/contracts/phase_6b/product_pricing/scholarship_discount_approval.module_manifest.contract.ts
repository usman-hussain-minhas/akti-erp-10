import { phase6BScholarshipDiscountApprovalComponentId, phase6BScholarshipDiscountApprovalModuleKey, phase6BScholarshipDiscountApprovalSeedId } from './scholarship_discount_approval.contract.js';

export const phase6BScholarshipDiscountApprovalManifest = {
  seed_id: phase6BScholarshipDiscountApprovalSeedId,
  component_id: phase6BScholarshipDiscountApprovalComponentId,
  module_key: phase6BScholarshipDiscountApprovalModuleKey,
  surface: 'scholarship_discount_approval',
  activation_lifecycle_required: true,
  foundry_activation_scope: 'tenant_toggleable_through_product_pricing_service',
  access_control_boundary: 'ACCESS_CORE_REQUIRED',
  pricing_authority: 'PRODUCT_PRICE_HISTORY',
  invoice_snapshot_required: true,
  emits_evidence_event: 'PHASE_6B_SCHOLARSHIP_DISCOUNT_APPROVAL_RECORDED',
  forbidden_behaviors: [
    'discount_calculation',
    'pricing_engine_execution',
    'independent_foundry_activation',
    'invoice_mutation_after_issue',
  ],
} as const;

export type Phase6BScholarshipDiscountApprovalManifest = typeof phase6BScholarshipDiscountApprovalManifest;
