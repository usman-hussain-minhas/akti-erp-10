import assert from 'node:assert/strict';

import { getPhase6ACoreComponentContractsScaffold } from './core_component_contracts.scaffold';

function testCoreComponentContractsScaffoldMetadata() {
  const scaffold = getPhase6ACoreComponentContractsScaffold();

  assert.equal(scaffold.phase, '6A');
  assert.equal(scaffold.ticket_id, 'P6A-FFET-073');
  assert.equal(scaffold.seed_id, 'seed_6a_core_component_contracts');
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
  testCoreComponentContractsScaffoldMetadata();
  console.log('P6A-FFET-073 core component contracts scaffold test passed.');
}

run();
