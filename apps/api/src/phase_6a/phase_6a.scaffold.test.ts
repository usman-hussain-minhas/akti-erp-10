import assert from 'node:assert/strict';

import { Phase6AService } from './phase_6a.service';

function testPhase6AScaffoldReadinessIsMetadataOnly() {
  const readiness = new Phase6AService().getScaffoldReadiness();

  assert.equal(readiness.phase, '6A');
  assert.equal(readiness.status, 'scaffold_control_only');
  assert.equal(readiness.seed_count, 74);
  assert.equal(readiness.surface_count, 18);
  assert.equal(new Set(readiness.seed_ids).size, 74);
  assert.equal(new Set(readiness.scaffold_domains).size, 18);
  assert.equal(readiness.seed_ids.every((seedId) => seedId.startsWith('seed_6a_')), true);
  assert.equal(readiness.seed_ids.includes('seed_6a_service_manifest_contract'), true);
  assert.equal(readiness.seed_ids.includes('seed_6a_outbound_gateway_enforcement'), true);
  assert.equal(readiness.capability_implementation_allowed, false);
  assert.equal(readiness.business_behavior_implemented, false);
  assert.equal(readiness.runtime_adapter_implemented, false);
  assert.equal(readiness.ticket_generation_allowed, false);
  assert.equal(readiness.ticket_pack_generation_allowed, false);
  assert.equal(readiness.execution_authorized, false);
}

function run() {
  testPhase6AScaffoldReadinessIsMetadataOnly();
  console.log('Phase 6A scaffold-control metadata tests passed.');
}

run();
