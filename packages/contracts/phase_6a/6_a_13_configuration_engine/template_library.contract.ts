import type { Phase6AScaffoldSeed } from '../phase_6a_scaffold_control.contract.js';

export const phase6ATemplateLibraryContract = {
  seed_id: 'seed_6a_template_library',
  source_component_id: '6A.13',
  seed_type: 'core_planning_seed',
  scaffold_domain: '6_a_13_configuration_engine',
  contract_path: 'packages/contracts/phase_6a/6_a_13_configuration_engine/template_library.contract.ts',
  api_scaffold_path: 'apps/api/src/phase_6a/6_a_13_configuration_engine/template_library.scaffold.ts',
  api_test_path: 'apps/api/src/phase_6a/6_a_13_configuration_engine/template_library.scaffold.test.ts',
  capability_implementation_allowed: false,
  business_behavior_allowed: false,
  runtime_adapter_allowed: false,
} as const satisfies Phase6AScaffoldSeed;

export type Phase6ATemplateLibraryContract = typeof phase6ATemplateLibraryContract;
