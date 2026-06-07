import assert from 'node:assert/strict';

import { getPhase6APlatformCoreUpdateBaselineScaffold } from './platform_core_update_baseline.scaffold';

function testPlatformCoreUpdateBaselineScaffoldMetadata() {
  const scaffold = getPhase6APlatformCoreUpdateBaselineScaffold();

  assert.equal(scaffold.phase, '6A');
  assert.equal(scaffold.ticket_id, 'P6A-FFET-001');
  assert.equal(scaffold.seed_id, 'seed_6a_platform_core_update_baseline');
  assert.equal(scaffold.source_component_id, '6A.01');
  assert.equal(scaffold.scaffold_domain, '6_a_01_platform_core_update_baseline');
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
  testPlatformCoreUpdateBaselineScaffoldMetadata();
  console.log('P6A-FFET-001 platform core update baseline scaffold test passed.');
}

run();
