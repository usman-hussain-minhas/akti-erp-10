import assert from 'node:assert/strict';

import { getPhase6APrepaidBalanceScaffold } from './prepaid_balance.scaffold';

function testPrepaidBalanceScaffoldMetadata() {
  const scaffold = getPhase6APrepaidBalanceScaffold();

  assert.equal(scaffold.phase, '6A');
  assert.equal(scaffold.ticket_id, 'P6A-FFET-023');
  assert.equal(scaffold.seed_id, 'seed_6a_prepaid_balance');
  assert.equal(scaffold.source_component_id, '6A.09');
  assert.equal(scaffold.scaffold_domain, '6_a_09_core_billing_engine_and_pricing_registry');
  assert.equal(scaffold.ffet_template, 'lifecycle_runtime_ffet');
  assert.equal(scaffold.status, 'scaffold_control_only');
  assert.equal(scaffold.capability_implementation_allowed, false);
  assert.equal(scaffold.business_behavior_implemented, false);
  assert.equal(scaffold.runtime_adapter_implemented, false);
  assert.equal(scaffold.ticket_generation_allowed, false);
  assert.equal(scaffold.ticket_pack_generation_allowed, false);
  assert.equal(scaffold.execution_authorized, false);
}

function run() {
  testPrepaidBalanceScaffoldMetadata();
  console.log('P6A-FFET-023 prepaid balance scaffold test passed.');
}

run();
