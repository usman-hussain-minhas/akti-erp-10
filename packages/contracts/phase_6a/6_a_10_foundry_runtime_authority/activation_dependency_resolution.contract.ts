import type { Phase6AScaffoldSeed } from '../phase_6a_scaffold_control.contract.js';

export const phase6AActivationDependencyResolutionContract = {
  seed_id: 'seed_6a_activation_dependency_resolution',
  source_component_id: '6A.10',
  seed_type: 'foundry_manifest_lifecycle_planning_seed',
  scaffold_domain: '6_a_10_foundry_runtime_authority',
  contract_path: 'packages/contracts/phase_6a/6_a_10_foundry_runtime_authority/activation_dependency_resolution.contract.ts',
  api_scaffold_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/activation_dependency_resolution.scaffold.ts',
  api_test_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/activation_dependency_resolution.scaffold.test.ts',
  capability_implementation_allowed: false,
  business_behavior_allowed: false,
  runtime_adapter_allowed: false,
} as const satisfies Phase6AScaffoldSeed;

export type Phase6AActivationDependencyResolutionContract = typeof phase6AActivationDependencyResolutionContract;
