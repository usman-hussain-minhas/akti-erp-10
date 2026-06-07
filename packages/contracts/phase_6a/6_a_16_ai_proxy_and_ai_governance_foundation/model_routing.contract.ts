import type { Phase6AScaffoldSeed } from '../phase_6a_scaffold_control.contract.js';

export const phase6AModelRoutingContract = {
  seed_id: 'seed_6a_model_routing',
  source_component_id: '6A.16',
  seed_type: 'core_planning_seed',
  scaffold_domain: '6_a_16_ai_proxy_and_ai_governance_foundation',
  contract_path: 'packages/contracts/phase_6a/6_a_16_ai_proxy_and_ai_governance_foundation/model_routing.contract.ts',
  api_scaffold_path: 'apps/api/src/phase_6a/6_a_16_ai_proxy_and_ai_governance_foundation/model_routing.scaffold.ts',
  api_test_path: 'apps/api/src/phase_6a/6_a_16_ai_proxy_and_ai_governance_foundation/model_routing.scaffold.test.ts',
  capability_implementation_allowed: false,
  business_behavior_allowed: false,
  runtime_adapter_allowed: false,
} as const satisfies Phase6AScaffoldSeed;

export type Phase6AModelRoutingContract = typeof phase6AModelRoutingContract;
