import type { Phase6AScaffoldSeed } from '../phase_6a_scaffold_control.contract.js';

export const phase6APlatformCoreUpdateBaselineContract = {
  seed_id: 'seed_6a_platform_core_update_baseline',
  source_component_id: '6A.01',
  seed_type: 'core_planning_seed',
  scaffold_domain: '6_a_01_platform_core_update_baseline',
  contract_path: 'packages/contracts/phase_6a/6_a_01_platform_core_update_baseline/platform_core_update_baseline.contract.ts',
  api_scaffold_path: 'apps/api/src/phase_6a/6_a_01_platform_core_update_baseline/platform_core_update_baseline.scaffold.ts',
  api_test_path: 'apps/api/src/phase_6a/6_a_01_platform_core_update_baseline/platform_core_update_baseline.scaffold.test.ts',
  capability_implementation_allowed: false,
  business_behavior_allowed: false,
  runtime_adapter_allowed: false,
} as const satisfies Phase6AScaffoldSeed;

export type Phase6APlatformCoreUpdateBaselineContract = typeof phase6APlatformCoreUpdateBaselineContract;
