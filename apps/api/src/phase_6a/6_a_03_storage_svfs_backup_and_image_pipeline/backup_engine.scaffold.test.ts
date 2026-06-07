import assert from 'node:assert/strict';

import { getPhase6ABackupEngineScaffold } from './backup_engine.scaffold';

function testBackupEngineScaffoldMetadata() {
  const scaffold = getPhase6ABackupEngineScaffold();

  assert.equal(scaffold.phase, '6A');
  assert.equal(scaffold.ticket_id, 'P6A-FFET-004');
  assert.equal(scaffold.seed_id, 'seed_6a_backup_engine');
  assert.equal(scaffold.source_component_id, '6A.03');
  assert.equal(scaffold.scaffold_domain, '6_a_03_storage_svfs_backup_and_image_pipeline');
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
  testBackupEngineScaffoldMetadata();
  console.log('P6A-FFET-004 backup engine scaffold test passed.');
}

run();
