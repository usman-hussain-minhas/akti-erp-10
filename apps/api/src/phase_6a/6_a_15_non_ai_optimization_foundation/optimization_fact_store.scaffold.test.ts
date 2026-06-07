import assert from 'node:assert/strict';

import { getPhase6AOptimizationFactStoreScaffold } from './optimization_fact_store.scaffold';

function testOptimizationFactStoreScaffoldMetadata() {
  const scaffold = getPhase6AOptimizationFactStoreScaffold();

  assert.equal(scaffold.phase, '6A');
  assert.equal(scaffold.ticket_id, 'P6A-FFET-059');
  assert.equal(scaffold.seed_id, 'seed_6a_optimization_fact_store');
  assert.equal(scaffold.source_component_id, '6A.15');
  assert.equal(scaffold.scaffold_domain, '6_a_15_non_ai_optimization_foundation');
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
  testOptimizationFactStoreScaffoldMetadata();
  console.log('P6A-FFET-059 optimization fact store scaffold test passed.');
}

run();
