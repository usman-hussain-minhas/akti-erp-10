import assert from 'node:assert/strict';

import { getPhase6AInfrastructureRuntimeFoundationScaffold } from './infrastructure_runtime_foundation.scaffold';

function testInfrastructureRuntimeFoundationScaffoldMetadata() {
  const scaffold = getPhase6AInfrastructureRuntimeFoundationScaffold();

  assert.equal(scaffold.phase, '6A');
  assert.equal(scaffold.ticket_id, 'P6A-FFET-002');
  assert.equal(scaffold.seed_id, 'seed_6a_infrastructure_runtime_foundation');
  assert.equal(scaffold.source_component_id, '6A.02');
  assert.equal(scaffold.scaffold_domain, '6_a_02_infrastructure_runtime_foundation');
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
  testInfrastructureRuntimeFoundationScaffoldMetadata();
  console.log('P6A-FFET-002 infrastructure runtime foundation scaffold test passed.');
}

run();
