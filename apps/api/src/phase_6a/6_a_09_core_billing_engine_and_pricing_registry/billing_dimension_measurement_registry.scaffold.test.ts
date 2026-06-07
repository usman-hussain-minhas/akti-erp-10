import assert from 'node:assert/strict';

import { getPhase6ABillingDimensionMeasurementRegistryScaffold } from './billing_dimension_measurement_registry.scaffold';

function testBillingDimensionMeasurementRegistryScaffoldMetadata() {
  const scaffold = getPhase6ABillingDimensionMeasurementRegistryScaffold();

  assert.equal(scaffold.phase, '6A');
  assert.equal(scaffold.ticket_id, 'P6A-FFET-019');
  assert.equal(scaffold.seed_id, 'seed_6a_billing_dimension_measurement_registry');
  assert.equal(scaffold.source_component_id, '6A.09');
  assert.equal(scaffold.scaffold_domain, '6_a_09_core_billing_engine_and_pricing_registry');
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
  testBillingDimensionMeasurementRegistryScaffoldMetadata();
  console.log('P6A-FFET-019 billing dimension measurement registry scaffold test passed.');
}

run();
