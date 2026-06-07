import assert from 'node:assert/strict';

import { getPhase6AShareLinkManagementScaffold } from './share_link_management.scaffold';

function testShareLinkManagementScaffoldMetadata() {
  const scaffold = getPhase6AShareLinkManagementScaffold();

  assert.equal(scaffold.phase, '6A');
  assert.equal(scaffold.ticket_id, 'P6A-FFET-055');
  assert.equal(scaffold.seed_id, 'seed_6a_share_link_management');
  assert.equal(scaffold.source_component_id, '6A.14');
  assert.equal(scaffold.scaffold_domain, '6_a_14_search_and_file_service_layer');
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
  testShareLinkManagementScaffoldMetadata();
  console.log('P6A-FFET-055 share link management scaffold test passed.');
}

run();
