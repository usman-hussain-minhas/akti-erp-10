import assert from 'node:assert/strict';

import { getPhase6AAiCostCapEnforcementScaffold } from './ai_cost_cap_enforcement.scaffold';

function testAiCostCapEnforcementScaffoldMetadata() {
  const scaffold = getPhase6AAiCostCapEnforcementScaffold();

  assert.equal(scaffold.phase, '6A');
  assert.equal(scaffold.ticket_id, 'P6A-FFET-066');
  assert.equal(scaffold.seed_id, 'seed_6a_ai_cost_cap_enforcement');
  assert.equal(scaffold.source_component_id, '6A.16');
  assert.equal(scaffold.scaffold_domain, '6_a_16_ai_proxy_and_ai_governance_foundation');
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
  testAiCostCapEnforcementScaffoldMetadata();
  console.log('P6A-FFET-066 ai cost cap enforcement scaffold test passed.');
}

run();
