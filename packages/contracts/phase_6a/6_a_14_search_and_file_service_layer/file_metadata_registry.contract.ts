import type { Phase6AScaffoldSeed } from '../phase_6a_scaffold_control.contract.js';

export const phase6AFileMetadataRegistryContract = {
  seed_id: 'seed_6a_file_metadata_registry',
  source_component_id: '6A.14',
  seed_type: 'core_planning_seed',
  scaffold_domain: '6_a_14_search_and_file_service_layer',
  contract_path: 'packages/contracts/phase_6a/6_a_14_search_and_file_service_layer/file_metadata_registry.contract.ts',
  api_scaffold_path: 'apps/api/src/phase_6a/6_a_14_search_and_file_service_layer/file_metadata_registry.scaffold.ts',
  api_test_path: 'apps/api/src/phase_6a/6_a_14_search_and_file_service_layer/file_metadata_registry.scaffold.test.ts',
  capability_implementation_allowed: false,
  business_behavior_allowed: false,
  runtime_adapter_allowed: false,
} as const satisfies Phase6AScaffoldSeed;

export type Phase6AFileMetadataRegistryContract = typeof phase6AFileMetadataRegistryContract;
