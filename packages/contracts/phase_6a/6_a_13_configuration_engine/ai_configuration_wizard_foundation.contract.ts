import type { Phase6AScaffoldSeed } from '../phase_6a_scaffold_control.contract.js';

export const phase6AAiConfigurationWizardFoundationContract = {
  seed_id: 'seed_6a_ai_configuration_wizard_foundation',
  source_component_id: '6A.13',
  seed_type: 'core_planning_seed',
  scaffold_domain: '6_a_13_configuration_engine',
  contract_path: 'packages/contracts/phase_6a/6_a_13_configuration_engine/ai_configuration_wizard_foundation.contract.ts',
  api_scaffold_path: 'apps/api/src/phase_6a/6_a_13_configuration_engine/ai_configuration_wizard_foundation.scaffold.ts',
  api_test_path: 'apps/api/src/phase_6a/6_a_13_configuration_engine/ai_configuration_wizard_foundation.scaffold.test.ts',
  capability_implementation_allowed: false,
  business_behavior_allowed: false,
  runtime_adapter_allowed: false,
} as const satisfies Phase6AScaffoldSeed;

export type Phase6AAiConfigurationWizardFoundationContract = typeof phase6AAiConfigurationWizardFoundationContract;
