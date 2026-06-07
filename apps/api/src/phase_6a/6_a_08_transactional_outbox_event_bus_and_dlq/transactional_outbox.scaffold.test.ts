import assert from 'node:assert/strict';

import { getPhase6ATransactionalOutboxScaffold } from './transactional_outbox.scaffold';

function testTransactionalOutboxScaffoldMetadata() {
  const scaffold = getPhase6ATransactionalOutboxScaffold();

  assert.equal(scaffold.phase, '6A');
  assert.equal(scaffold.ticket_id, 'P6A-FFET-012');
  assert.equal(scaffold.seed_id, 'seed_6a_transactional_outbox');
  assert.equal(scaffold.source_component_id, '6A.08');
  assert.equal(scaffold.scaffold_domain, '6_a_08_transactional_outbox_event_bus_and_dlq');
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
  testTransactionalOutboxScaffoldMetadata();
  console.log('P6A-FFET-012 transactional outbox scaffold test passed.');
}

run();
