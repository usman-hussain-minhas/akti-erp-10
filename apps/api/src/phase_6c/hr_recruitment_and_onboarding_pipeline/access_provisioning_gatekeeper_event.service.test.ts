import assert from 'node:assert/strict';

import { evaluateAccessProvisioningGatekeeperEventScaffold, type AccessProvisioningGatekeeperEventScaffoldInput } from './access_provisioning_gatekeeper_event.service';

const baseInput: AccessProvisioningGatekeeperEventScaffoldInput = {
  organization_id: 'org_phase_6c_control',
  service_manifest_contract_id: 'smc_phase_6c_access_provisioning_gatekeeper_event',
  source_record_ref: 'access_provisioning_gatekeeper_event_record_001',
  evaluated_by_user_id: 'user_phase_6c_control',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  control_metadata: { source: 'phase_6c_scaffold_control' },
};

const receipt = evaluateAccessProvisioningGatekeeperEventScaffold(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_018_access_provisioning_gatekeeper_event');
assert.equal(receipt.component_id, '6C.02');
assert.equal(receipt.component_slug, 'hr_recruitment_and_onboarding_pipeline');
assert.equal(receipt.model_name, 'Phase6CAccessProvisioningGatekeeperEvent');
assert.equal(receipt.scaffold_status, 'SCAFFOLD_CONTROL_ONLY');
assert.equal(receipt.capability_implementation_allowed, false);
assert.equal(receipt.business_behavior_allowed, false);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.match(receipt.scaffold_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateAccessProvisioningGatekeeperEventScaffold(baseInput);
assert.equal(repeatedReceipt.scaffold_evidence_digest, receipt.scaffold_evidence_digest);

assert.throws(() => evaluateAccessProvisioningGatekeeperEventScaffold({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateAccessProvisioningGatekeeperEventScaffold({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateAccessProvisioningGatekeeperEventScaffold({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateAccessProvisioningGatekeeperEventScaffold({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateAccessProvisioningGatekeeperEventScaffold({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateAccessProvisioningGatekeeperEventScaffold({ ...baseInput, capability_execution_requested: true }), /must not execute capability behavior/);
assert.throws(() => evaluateAccessProvisioningGatekeeperEventScaffold({ ...baseInput, business_behavior_requested: true }), /must not execute business behavior/);
assert.throws(() => evaluateAccessProvisioningGatekeeperEventScaffold({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapter behavior/);

console.log('P6C scaffold-control access_provisioning_gatekeeper_event test passed.');
