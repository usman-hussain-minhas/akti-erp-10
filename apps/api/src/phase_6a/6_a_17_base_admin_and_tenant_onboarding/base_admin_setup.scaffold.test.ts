import assert from 'node:assert/strict';

import { getPhase6ABaseAdminSetupScaffold } from './base_admin_setup.scaffold';

function testBaseAdminSetupScaffoldMetadata() {
  const scaffold = getPhase6ABaseAdminSetupScaffold();

  assert.equal(scaffold.phase, '6A');
  assert.equal(scaffold.ticket_id, 'P6A-FFET-068');
  assert.equal(scaffold.seed_id, 'seed_6a_base_admin_setup');
  assert.equal(scaffold.source_component_id, '6A.17');
  assert.equal(scaffold.scaffold_domain, '6_a_17_base_admin_and_tenant_onboarding');
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
  testBaseAdminSetupScaffoldMetadata();
  console.log('P6A-FFET-068 base admin setup scaffold test passed.');
}

run();
