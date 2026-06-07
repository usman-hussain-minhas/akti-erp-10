import assert from 'node:assert/strict';

import { getPhase6ARulesEngineScaffold } from './rules_engine.scaffold';

function testRulesEngineScaffoldMetadata() {
  const scaffold = getPhase6ARulesEngineScaffold();

  assert.equal(scaffold.phase, '6A');
  assert.equal(scaffold.ticket_id, 'P6A-FFET-047');
  assert.equal(scaffold.seed_id, 'seed_6a_rules_engine');
  assert.equal(scaffold.source_component_id, '6A.13');
  assert.equal(scaffold.scaffold_domain, '6_a_13_configuration_engine');
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
  testRulesEngineScaffoldMetadata();
  console.log('P6A-FFET-047 rules engine scaffold test passed.');
}

run();
