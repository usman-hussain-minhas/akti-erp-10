import type { Phase6AScaffoldSeed } from '../phase_6a_scaffold_control.contract.js';

export const phase6ABillingDimensionMeasurementRegistryContract = {
  seed_id: 'seed_6a_billing_dimension_measurement_registry',
  source_component_id: '6A.09',
  seed_type: 'core_planning_seed',
  scaffold_domain: '6_a_09_core_billing_engine_and_pricing_registry',
  contract_path: 'packages/contracts/phase_6a/6_a_09_core_billing_engine_and_pricing_registry/billing_dimension_measurement_registry.contract.ts',
  api_scaffold_path: 'apps/api/src/phase_6a/6_a_09_core_billing_engine_and_pricing_registry/billing_dimension_measurement_registry.scaffold.ts',
  api_test_path: 'apps/api/src/phase_6a/6_a_09_core_billing_engine_and_pricing_registry/billing_dimension_measurement_registry.scaffold.test.ts',
  capability_implementation_allowed: false,
  business_behavior_allowed: false,
  runtime_adapter_allowed: false,
} as const satisfies Phase6AScaffoldSeed;

export type Phase6ABillingDimensionMeasurementRegistryContract = typeof phase6ABillingDimensionMeasurementRegistryContract;
