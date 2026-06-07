import assert from 'node:assert/strict';

import { getPhase6AActivationDeactivationInterceptWizardScaffold } from './activation_deactivation_intercept_wizard.scaffold';

function testActivationDeactivationInterceptWizardScaffoldMetadata() {
  const scaffold = getPhase6AActivationDeactivationInterceptWizardScaffold();

  assert.equal(scaffold.phase, '6A');
  assert.equal(scaffold.ticket_id, 'P6A-FFET-063');
  assert.equal(scaffold.seed_id, 'seed_6a_activation_deactivation_intercept_wizard');
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
  testActivationDeactivationInterceptWizardScaffoldMetadata();
  console.log('P6A-FFET-063 activation deactivation intercept wizard scaffold test passed.');
}

run();
