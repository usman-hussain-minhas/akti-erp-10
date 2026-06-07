import assert from 'node:assert/strict';

import { getPhase6AAcceptedRejectedRecommendationEvidenceScaffold } from './accepted_rejected_recommendation_evidence.scaffold';

function testAcceptedRejectedRecommendationEvidenceScaffoldMetadata() {
  const scaffold = getPhase6AAcceptedRejectedRecommendationEvidenceScaffold();

  assert.equal(scaffold.phase, '6A');
  assert.equal(scaffold.ticket_id, 'P6A-FFET-062');
  assert.equal(scaffold.seed_id, 'seed_6a_accepted_rejected_recommendation_evidence');
  assert.equal(scaffold.source_component_id, '6A.15');
  assert.equal(scaffold.scaffold_domain, '6_a_15_non_ai_optimization_foundation');
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
  testAcceptedRejectedRecommendationEvidenceScaffoldMetadata();
  console.log('P6A-FFET-062 accepted rejected recommendation evidence scaffold test passed.');
}

run();
