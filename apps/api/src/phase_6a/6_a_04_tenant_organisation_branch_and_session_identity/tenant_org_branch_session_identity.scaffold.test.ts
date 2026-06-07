import assert from 'node:assert/strict';

import { getPhase6ATenantOrgBranchSessionIdentityScaffold } from './tenant_org_branch_session_identity.scaffold';

function testTenantOrgBranchSessionIdentityScaffoldMetadata() {
  const scaffold = getPhase6ATenantOrgBranchSessionIdentityScaffold();

  assert.equal(scaffold.phase, '6A');
  assert.equal(scaffold.ticket_id, 'P6A-FFET-008');
  assert.equal(scaffold.seed_id, 'seed_6a_tenant_org_branch_session_identity');
  assert.equal(scaffold.source_component_id, '6A.04');
  assert.equal(scaffold.scaffold_domain, '6_a_04_tenant_organisation_branch_and_session_identity');
  assert.equal(scaffold.ffet_template, 'core_runtime_ffet');
  assert.equal(scaffold.status, 'scaffold_control_only');
  assert.equal(scaffold.capability_implementation_allowed, false);
  assert.equal(scaffold.business_behavior_implemented, false);
  assert.equal(scaffold.runtime_adapter_implemented, false);
  assert.equal(scaffold.ticket_generation_allowed, false);
  assert.equal(scaffold.ticket_pack_generation_allowed, false);
  assert.equal(scaffold.execution_authorized, false);
}

function run() {
  testTenantOrgBranchSessionIdentityScaffoldMetadata();
  console.log('P6A-FFET-008 tenant org branch session identity scaffold test passed.');
}

run();
