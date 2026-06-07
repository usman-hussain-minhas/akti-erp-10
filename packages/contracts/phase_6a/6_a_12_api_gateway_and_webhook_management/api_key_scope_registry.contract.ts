import type { Phase6AScaffoldSeed } from '../phase_6a_scaffold_control.contract.js';

export const phase6AApiKeyScopeRegistryContract = {
  seed_id: 'seed_6a_api_key_scope_registry',
  source_component_id: '6A.12',
  seed_type: 'provider_or_channel_planning_seed',
  scaffold_domain: '6_a_12_api_gateway_and_webhook_management',
  contract_path: 'packages/contracts/phase_6a/6_a_12_api_gateway_and_webhook_management/api_key_scope_registry.contract.ts',
  api_scaffold_path: 'apps/api/src/phase_6a/6_a_12_api_gateway_and_webhook_management/api_key_scope_registry.scaffold.ts',
  api_test_path: 'apps/api/src/phase_6a/6_a_12_api_gateway_and_webhook_management/api_key_scope_registry.scaffold.test.ts',
  capability_implementation_allowed: false,
  business_behavior_allowed: false,
  runtime_adapter_allowed: false,
} as const satisfies Phase6AScaffoldSeed;

export type Phase6AApiKeyScopeRegistryContract = typeof phase6AApiKeyScopeRegistryContract;
