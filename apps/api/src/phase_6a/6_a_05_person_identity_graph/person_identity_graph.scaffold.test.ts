import assert from 'node:assert/strict';

import { getPhase6APersonIdentityGraphScaffold } from './person_identity_graph.scaffold';

function testPersonIdentityGraphScaffoldMetadata() {
  const scaffold = getPhase6APersonIdentityGraphScaffold();

  assert.equal(scaffold.phase, '6A');
  assert.equal(scaffold.ticket_id, 'P6A-FFET-009');
  assert.equal(scaffold.seed_id, 'seed_6a_person_identity_graph');
  assert.equal(scaffold.source_component_id, '6A.05');
  assert.equal(scaffold.scaffold_domain, '6_a_05_person_identity_graph');
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
  testPersonIdentityGraphScaffoldMetadata();
  console.log('P6A-FFET-009 person identity graph scaffold test passed.');
}

run();
