import type { Phase6AScaffoldSeed } from '../phase_6a_scaffold_control.contract.js';

export const phase6AGlobalOptOutRegistryContract = {
  seed_id: 'seed_6a_global_opt_out_registry',
  source_component_id: '6A.11',
  seed_type: 'core_planning_seed',
  scaffold_domain: '6_a_11_communication_gateway_and_global_opt_out',
  contract_path: 'packages/contracts/phase_6a/6_a_11_communication_gateway_and_global_opt_out/global_opt_out_registry.contract.ts',
  api_scaffold_path: 'apps/api/src/phase_6a/6_a_11_communication_gateway_and_global_opt_out/global_opt_out_registry.scaffold.ts',
  api_test_path: 'apps/api/src/phase_6a/6_a_11_communication_gateway_and_global_opt_out/global_opt_out_registry.scaffold.test.ts',
  capability_implementation_allowed: false,
  business_behavior_allowed: false,
  runtime_adapter_allowed: false,
} as const satisfies Phase6AScaffoldSeed;

export type Phase6AGlobalOptOutRegistryContract = typeof phase6AGlobalOptOutRegistryContract;
