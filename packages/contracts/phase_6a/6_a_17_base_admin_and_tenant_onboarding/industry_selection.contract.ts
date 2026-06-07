import type { Phase6AScaffoldSeed } from '../phase_6a_scaffold_control.contract.js';

export const phase6AIndustrySelectionContract = {
  seed_id: 'seed_6a_industry_selection',
  source_component_id: '6A.17',
  seed_type: 'core_planning_seed',
  scaffold_domain: '6_a_17_base_admin_and_tenant_onboarding',
  contract_path: 'packages/contracts/phase_6a/6_a_17_base_admin_and_tenant_onboarding/industry_selection.contract.ts',
  api_scaffold_path: 'apps/api/src/phase_6a/6_a_17_base_admin_and_tenant_onboarding/industry_selection.scaffold.ts',
  api_test_path: 'apps/api/src/phase_6a/6_a_17_base_admin_and_tenant_onboarding/industry_selection.scaffold.test.ts',
  capability_implementation_allowed: false,
  business_behavior_allowed: false,
  runtime_adapter_allowed: false,
} as const satisfies Phase6AScaffoldSeed;

export type Phase6AIndustrySelectionContract = typeof phase6AIndustrySelectionContract;
