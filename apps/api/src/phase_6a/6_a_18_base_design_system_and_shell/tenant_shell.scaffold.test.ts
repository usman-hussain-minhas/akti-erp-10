import assert from 'node:assert/strict';

import { getPhase6ATenantShellScaffold } from './tenant_shell.scaffold';

function testTenantShellScaffoldMetadata() {
  const scaffold = getPhase6ATenantShellScaffold();

  assert.equal(scaffold.phase, '6A');
  assert.equal(scaffold.ticket_id, 'P6A-FFET-074');
  assert.equal(scaffold.seed_id, 'seed_6a_tenant_shell');
  assert.equal(scaffold.source_component_id, '6A.18');
  assert.equal(scaffold.scaffold_domain, '6_a_18_base_design_system_and_shell');
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
  testTenantShellScaffoldMetadata();
  console.log('P6A-FFET-074 tenant shell scaffold test passed.');
}

run();
