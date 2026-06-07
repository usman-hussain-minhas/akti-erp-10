import assert from 'node:assert/strict';

import { getPhase6AManifestValidationScaffold } from './manifest_validation.scaffold';

function testManifestValidationScaffoldMetadata() {
  const scaffold = getPhase6AManifestValidationScaffold();

  assert.equal(scaffold.phase, '6A');
  assert.equal(scaffold.ticket_id, 'P6A-FFET-026');
  assert.equal(scaffold.seed_id, 'seed_6a_manifest_validation');
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
  testManifestValidationScaffoldMetadata();
  console.log('P6A-FFET-026 manifest validation scaffold test passed.');
}

run();
