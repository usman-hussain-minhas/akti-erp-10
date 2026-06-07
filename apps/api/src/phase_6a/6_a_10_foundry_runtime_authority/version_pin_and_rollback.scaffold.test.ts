import assert from 'node:assert/strict';

import { getPhase6AVersionPinAndRollbackScaffold } from './version_pin_and_rollback.scaffold';

function testVersionPinAndRollbackScaffoldMetadata() {
  const scaffold = getPhase6AVersionPinAndRollbackScaffold();

  assert.equal(scaffold.phase, '6A');
  assert.equal(scaffold.ticket_id, 'P6A-FFET-029');
  assert.equal(scaffold.seed_id, 'seed_6a_version_pin_and_rollback');
  assert.equal(scaffold.source_component_id, '6A.10');
  assert.equal(scaffold.scaffold_domain, '6_a_10_foundry_runtime_authority');
  assert.equal(scaffold.ffet_template, 'foundry_manifest_lifecycle_runtime_ffet');
  assert.equal(scaffold.status, 'scaffold_control_only');
  assert.equal(scaffold.capability_implementation_allowed, false);
  assert.equal(scaffold.business_behavior_implemented, false);
  assert.equal(scaffold.runtime_adapter_implemented, false);
  assert.equal(scaffold.ticket_generation_allowed, false);
  assert.equal(scaffold.ticket_pack_generation_allowed, false);
  assert.equal(scaffold.execution_authorized, false);
}

function run() {
  testVersionPinAndRollbackScaffoldMetadata();
  console.log('P6A-FFET-029 version pin and rollback scaffold test passed.');
}

run();
