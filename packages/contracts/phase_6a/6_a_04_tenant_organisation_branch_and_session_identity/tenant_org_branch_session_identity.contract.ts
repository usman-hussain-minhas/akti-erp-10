import type { Phase6AScaffoldSeed } from '../phase_6a_scaffold_control.contract.js';

export const phase6ATenantOrgBranchSessionIdentityContract = {
  seed_id: 'seed_6a_tenant_org_branch_session_identity',
  source_component_id: '6A.04',
  seed_type: 'core_planning_seed',
  scaffold_domain: '6_a_04_tenant_organisation_branch_and_session_identity',
  contract_path: 'packages/contracts/phase_6a/6_a_04_tenant_organisation_branch_and_session_identity/tenant_org_branch_session_identity.contract.ts',
  api_scaffold_path: 'apps/api/src/phase_6a/6_a_04_tenant_organisation_branch_and_session_identity/tenant_org_branch_session_identity.scaffold.ts',
  api_test_path: 'apps/api/src/phase_6a/6_a_04_tenant_organisation_branch_and_session_identity/tenant_org_branch_session_identity.scaffold.test.ts',
  capability_implementation_allowed: false,
  business_behavior_allowed: false,
  runtime_adapter_allowed: false,
} as const satisfies Phase6AScaffoldSeed;

export type Phase6ATenantOrgBranchSessionIdentityContract = typeof phase6ATenantOrgBranchSessionIdentityContract;
