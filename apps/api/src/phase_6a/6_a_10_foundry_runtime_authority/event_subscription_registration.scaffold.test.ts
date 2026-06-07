import assert from 'node:assert/strict';

import { getPhase6AEventSubscriptionRegistrationScaffold } from './event_subscription_registration.scaffold';

function testEventSubscriptionRegistrationScaffoldMetadata() {
  const scaffold = getPhase6AEventSubscriptionRegistrationScaffold();

  assert.equal(scaffold.phase, '6A');
  assert.equal(scaffold.ticket_id, 'P6A-FFET-032');
  assert.equal(scaffold.seed_id, 'seed_6a_event_subscription_registration');
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
  testEventSubscriptionRegistrationScaffoldMetadata();
  console.log('P6A-FFET-032 event subscription registration scaffold test passed.');
}

run();
