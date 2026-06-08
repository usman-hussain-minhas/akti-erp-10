import assert from 'node:assert/strict';

import { evaluatePolicyVersionLibraryScaffold, type PolicyVersionLibraryScaffoldInput } from './policy_version_library.service';

const baseInput: PolicyVersionLibraryScaffoldInput = {
  organization_id: 'org_phase_6c_control',
  service_manifest_contract_id: 'smc_phase_6c_policy_version_library',
  source_record_ref: 'policy_version_library_record_001',
  evaluated_by_user_id: 'user_phase_6c_control',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  control_metadata: { source: 'phase_6c_scaffold_control' },
};

const receipt = evaluatePolicyVersionLibraryScaffold(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_049_policy_version_library');
assert.equal(receipt.component_id, '6C.04');
assert.equal(receipt.component_slug, 'hr_performance_commission_policy_and_offboarding');
assert.equal(receipt.model_name, 'Phase6CPolicyVersionLibrary');
assert.equal(receipt.scaffold_status, 'SCAFFOLD_CONTROL_ONLY');
assert.equal(receipt.capability_implementation_allowed, false);
assert.equal(receipt.business_behavior_allowed, false);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.match(receipt.scaffold_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluatePolicyVersionLibraryScaffold(baseInput);
assert.equal(repeatedReceipt.scaffold_evidence_digest, receipt.scaffold_evidence_digest);

assert.throws(() => evaluatePolicyVersionLibraryScaffold({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluatePolicyVersionLibraryScaffold({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluatePolicyVersionLibraryScaffold({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluatePolicyVersionLibraryScaffold({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluatePolicyVersionLibraryScaffold({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluatePolicyVersionLibraryScaffold({ ...baseInput, capability_execution_requested: true }), /must not execute capability behavior/);
assert.throws(() => evaluatePolicyVersionLibraryScaffold({ ...baseInput, business_behavior_requested: true }), /must not execute business behavior/);
assert.throws(() => evaluatePolicyVersionLibraryScaffold({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapter behavior/);

console.log('P6C scaffold-control policy_version_library test passed.');
