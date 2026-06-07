import assert from 'node:assert/strict';

import { getPhase6AWebhookRetryScheduleScaffold } from './webhook_retry_schedule.scaffold';

function testWebhookRetryScheduleScaffoldMetadata() {
  const scaffold = getPhase6AWebhookRetryScheduleScaffold();

  assert.equal(scaffold.phase, '6A');
  assert.equal(scaffold.ticket_id, 'P6A-FFET-043');
  assert.equal(scaffold.seed_id, 'seed_6a_webhook_retry_schedule');
  assert.equal(scaffold.source_component_id, '6A.12');
  assert.equal(scaffold.scaffold_domain, '6_a_12_api_gateway_and_webhook_management');
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
  testWebhookRetryScheduleScaffoldMetadata();
  console.log('P6A-FFET-043 webhook retry schedule scaffold test passed.');
}

run();
