import type { Phase6AScaffoldSeed } from '../phase_6a_scaffold_control.contract.js';

export const phase6ATenantShellContract = {
  seed_id: 'seed_6a_tenant_shell',
  source_component_id: '6A.18',
  seed_type: 'core_planning_seed',
  scaffold_domain: '6_a_18_base_design_system_and_shell',
  contract_path: 'packages/contracts/phase_6a/6_a_18_base_design_system_and_shell/tenant_shell.contract.ts',
  api_scaffold_path: 'apps/api/src/phase_6a/6_a_18_base_design_system_and_shell/tenant_shell.scaffold.ts',
  api_test_path: 'apps/api/src/phase_6a/6_a_18_base_design_system_and_shell/tenant_shell.scaffold.test.ts',
  capability_implementation_allowed: false,
  business_behavior_allowed: false,
  runtime_adapter_allowed: false,
} as const satisfies Phase6AScaffoldSeed;

export type Phase6ATenantShellContract = typeof phase6ATenantShellContract;
