import assert from 'node:assert/strict';

import { getPhase6AProjectedCostAlternativeCalculatorScaffold } from './projected_cost_alternative_calculator.scaffold';

function testProjectedCostAlternativeCalculatorScaffoldMetadata() {
  const scaffold = getPhase6AProjectedCostAlternativeCalculatorScaffold();

  assert.equal(scaffold.phase, '6A');
  assert.equal(scaffold.ticket_id, 'P6A-FFET-060');
  assert.equal(scaffold.seed_id, 'seed_6a_projected_cost_alternative_calculator');
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
  testProjectedCostAlternativeCalculatorScaffoldMetadata();
  console.log('P6A-FFET-060 projected cost alternative calculator scaffold test passed.');
}

run();
