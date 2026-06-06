import assert from 'node:assert/strict';

import { Phase6BService } from './phase_6b.service';

function testPhase6BScaffoldReadinessIsMetadataOnly() {
  const readiness = new Phase6BService().getScaffoldReadiness();

  assert.equal(readiness.phase, '6B');
  assert.equal(readiness.status, 'scaffold_control_only');
  assert.equal(readiness.surface_count, 15);
  assert.equal(readiness.model_count, 47);
  assert.equal(readiness.capability_implementation_allowed, false);
  assert.equal(readiness.business_behavior_implemented, false);
  assert.equal(readiness.runtime_adapter_implemented, false);
  assert.equal(readiness.ticket_generation_allowed, false);
}

function run() {
  testPhase6BScaffoldReadinessIsMetadataOnly();
  console.log('Phase 6B scaffold-control metadata tests passed.');
}

run();
