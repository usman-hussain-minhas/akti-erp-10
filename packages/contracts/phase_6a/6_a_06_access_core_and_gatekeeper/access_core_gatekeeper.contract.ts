import type { Phase6AScaffoldSeed } from '../phase_6a_scaffold_control.contract.js';

export const phase6AAccessCoreGatekeeperContract = {
  seed_id: 'seed_6a_access_core_gatekeeper',
  source_component_id: '6A.06',
  seed_type: 'core_planning_seed',
  scaffold_domain: '6_a_06_access_core_and_gatekeeper',
  contract_path: 'packages/contracts/phase_6a/6_a_06_access_core_and_gatekeeper/access_core_gatekeeper.contract.ts',
  api_scaffold_path: 'apps/api/src/phase_6a/6_a_06_access_core_and_gatekeeper/access_core_gatekeeper.scaffold.ts',
  api_test_path: 'apps/api/src/phase_6a/6_a_06_access_core_and_gatekeeper/access_core_gatekeeper.scaffold.test.ts',
  capability_implementation_allowed: false,
  business_behavior_allowed: false,
  runtime_adapter_allowed: false,
} as const satisfies Phase6AScaffoldSeed;

export type Phase6AAccessCoreGatekeeperContract = typeof phase6AAccessCoreGatekeeperContract;
