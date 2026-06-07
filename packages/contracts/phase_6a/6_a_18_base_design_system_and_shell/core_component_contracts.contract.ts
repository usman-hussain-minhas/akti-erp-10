import type { Phase6AScaffoldSeed } from '../phase_6a_scaffold_control.contract.js';

export const phase6ACoreComponentContractsContract = {
  seed_id: 'seed_6a_core_component_contracts',
  source_component_id: '6A.18',
  seed_type: 'core_planning_seed',
  scaffold_domain: '6_a_18_base_design_system_and_shell',
  contract_path: 'packages/contracts/phase_6a/6_a_18_base_design_system_and_shell/core_component_contracts.contract.ts',
  api_scaffold_path: 'apps/api/src/phase_6a/6_a_18_base_design_system_and_shell/core_component_contracts.scaffold.ts',
  api_test_path: 'apps/api/src/phase_6a/6_a_18_base_design_system_and_shell/core_component_contracts.scaffold.test.ts',
  capability_implementation_allowed: false,
  business_behavior_allowed: false,
  runtime_adapter_allowed: false,
} as const satisfies Phase6AScaffoldSeed;

export type Phase6ACoreComponentContractsContract = typeof phase6ACoreComponentContractsContract;
