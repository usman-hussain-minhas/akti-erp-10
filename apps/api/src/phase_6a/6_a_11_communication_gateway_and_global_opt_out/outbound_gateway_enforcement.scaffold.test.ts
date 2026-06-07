import assert from 'node:assert/strict';

import { getPhase6AOutboundGatewayEnforcementScaffold } from './outbound_gateway_enforcement.scaffold';

function testOutboundGatewayEnforcementScaffoldMetadata() {
  const scaffold = getPhase6AOutboundGatewayEnforcementScaffold();

  assert.equal(scaffold.phase, '6A');
  assert.equal(scaffold.ticket_id, 'P6A-FFET-036');
  assert.equal(scaffold.seed_id, 'seed_6a_outbound_gateway_enforcement');
  assert.equal(scaffold.source_component_id, '6A.11');
  assert.equal(scaffold.scaffold_domain, '6_a_11_communication_gateway_and_global_opt_out');
  assert.equal(scaffold.ffet_template, 'provider_or_channel_runtime_ffet');
  assert.equal(scaffold.status, 'scaffold_control_only');
  assert.equal(scaffold.capability_implementation_allowed, false);
  assert.equal(scaffold.business_behavior_implemented, false);
  assert.equal(scaffold.runtime_adapter_implemented, false);
  assert.equal(scaffold.ticket_generation_allowed, false);
  assert.equal(scaffold.ticket_pack_generation_allowed, false);
  assert.equal(scaffold.execution_authorized, false);
}

function run() {
  testOutboundGatewayEnforcementScaffoldMetadata();
  console.log('P6A-FFET-036 outbound gateway enforcement scaffold test passed.');
}

run();
