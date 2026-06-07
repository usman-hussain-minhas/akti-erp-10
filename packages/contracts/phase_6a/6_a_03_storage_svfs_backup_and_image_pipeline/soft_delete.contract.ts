import type { Phase6AScaffoldSeed } from '../phase_6a_scaffold_control.contract.js';

export const phase6ASoftDeleteContract = {
  seed_id: 'seed_6a_soft_delete',
  source_component_id: '6A.03',
  seed_type: 'lifecycle_planning_seed',
  scaffold_domain: '6_a_03_storage_svfs_backup_and_image_pipeline',
  contract_path: 'packages/contracts/phase_6a/6_a_03_storage_svfs_backup_and_image_pipeline/soft_delete.contract.ts',
  api_scaffold_path: 'apps/api/src/phase_6a/6_a_03_storage_svfs_backup_and_image_pipeline/soft_delete.scaffold.ts',
  api_test_path: 'apps/api/src/phase_6a/6_a_03_storage_svfs_backup_and_image_pipeline/soft_delete.scaffold.test.ts',
  capability_implementation_allowed: false,
  business_behavior_allowed: false,
  runtime_adapter_allowed: false,
} as const satisfies Phase6AScaffoldSeed;

export type Phase6ASoftDeleteContract = typeof phase6ASoftDeleteContract;
