import assert from 'node:assert/strict';

import { evaluateOffboardingAccessRevocationGatekeeperScaffold, type OffboardingAccessRevocationGatekeeperScaffoldInput } from './offboarding_access_revocation_gatekeeper.service';

const baseInput: OffboardingAccessRevocationGatekeeperScaffoldInput = {
  organization_id: 'org_phase_6c_control',
  service_manifest_contract_id: 'smc_phase_6c_offboarding_access_revocation_gatekeeper',
  source_record_ref: 'offboarding_access_revocation_gatekeeper_record_001',
  evaluated_by_user_id: 'user_phase_6c_control',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  control_metadata: { source: 'phase_6c_scaffold_control' },
};

const receipt = evaluateOffboardingAccessRevocationGatekeeperScaffold(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_055_offboarding_access_revocation_gatekeeper');
assert.equal(receipt.component_id, '6C.04');
assert.equal(receipt.component_slug, 'hr_performance_commission_policy_and_offboarding');
assert.equal(receipt.model_name, 'Phase6COffboardingAccessRevocationGatekeeper');
assert.equal(receipt.scaffold_status, 'SCAFFOLD_CONTROL_ONLY');
assert.equal(receipt.capability_implementation_allowed, false);
assert.equal(receipt.business_behavior_allowed, false);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.match(receipt.scaffold_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateOffboardingAccessRevocationGatekeeperScaffold(baseInput);
assert.equal(repeatedReceipt.scaffold_evidence_digest, receipt.scaffold_evidence_digest);

assert.throws(() => evaluateOffboardingAccessRevocationGatekeeperScaffold({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeperScaffold({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeperScaffold({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeperScaffold({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeperScaffold({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeperScaffold({ ...baseInput, capability_execution_requested: true }), /must not execute capability behavior/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeperScaffold({ ...baseInput, business_behavior_requested: true }), /must not execute business behavior/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeperScaffold({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapter behavior/);

console.log('P6C scaffold-control offboarding_access_revocation_gatekeeper test passed.');
