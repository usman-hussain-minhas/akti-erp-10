import type { Phase6AScaffoldSeed } from '../phase_6a_scaffold_control.contract.js';

export const phase6ABackupEngineContract = {
  seed_id: 'seed_6a_backup_engine',
  source_component_id: '6A.03',
  seed_type: 'core_planning_seed',
  scaffold_domain: '6_a_03_storage_svfs_backup_and_image_pipeline',
  contract_path: 'packages/contracts/phase_6a/6_a_03_storage_svfs_backup_and_image_pipeline/backup_engine.contract.ts',
  api_scaffold_path: 'apps/api/src/phase_6a/6_a_03_storage_svfs_backup_and_image_pipeline/backup_engine.scaffold.ts',
  api_test_path: 'apps/api/src/phase_6a/6_a_03_storage_svfs_backup_and_image_pipeline/backup_engine.scaffold.test.ts',
  capability_implementation_allowed: false,
  business_behavior_allowed: false,
  runtime_adapter_allowed: false,
} as const satisfies Phase6AScaffoldSeed;

export type Phase6ABackupEngineContract = typeof phase6ABackupEngineContract;
