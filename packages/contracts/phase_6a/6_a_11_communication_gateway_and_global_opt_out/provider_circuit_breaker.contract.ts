import type { Phase6AScaffoldSeed } from '../phase_6a_scaffold_control.contract.js';

export const phase6AProviderCircuitBreakerContract = {
  seed_id: 'seed_6a_provider_circuit_breaker',
  source_component_id: '6A.11',
  seed_type: 'provider_or_channel_planning_seed',
  scaffold_domain: '6_a_11_communication_gateway_and_global_opt_out',
  contract_path: 'packages/contracts/phase_6a/6_a_11_communication_gateway_and_global_opt_out/provider_circuit_breaker.contract.ts',
  api_scaffold_path: 'apps/api/src/phase_6a/6_a_11_communication_gateway_and_global_opt_out/provider_circuit_breaker.scaffold.ts',
  api_test_path: 'apps/api/src/phase_6a/6_a_11_communication_gateway_and_global_opt_out/provider_circuit_breaker.scaffold.test.ts',
  capability_implementation_allowed: false,
  business_behavior_allowed: false,
  runtime_adapter_allowed: false,
} as const satisfies Phase6AScaffoldSeed;

export type Phase6AProviderCircuitBreakerContract = typeof phase6AProviderCircuitBreakerContract;
