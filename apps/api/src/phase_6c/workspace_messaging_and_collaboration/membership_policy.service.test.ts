import assert from 'node:assert/strict';

import { evaluateMembershipPolicyScaffold, type MembershipPolicyScaffoldInput } from './membership_policy.service';

const baseInput: MembershipPolicyScaffoldInput = {
  organization_id: 'org_phase_6c_control',
  service_manifest_contract_id: 'smc_phase_6c_membership_policy',
  source_record_ref: 'membership_policy_record_001',
  evaluated_by_user_id: 'user_phase_6c_control',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  control_metadata: { source: 'phase_6c_scaffold_control' },
};

const receipt = evaluateMembershipPolicyScaffold(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_064_membership_policy');
assert.equal(receipt.component_id, '6C.05');
assert.equal(receipt.component_slug, 'workspace_messaging_and_collaboration');
assert.equal(receipt.model_name, 'Phase6CMembershipPolicy');
assert.equal(receipt.scaffold_status, 'SCAFFOLD_CONTROL_ONLY');
assert.equal(receipt.capability_implementation_allowed, false);
assert.equal(receipt.business_behavior_allowed, false);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.match(receipt.scaffold_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateMembershipPolicyScaffold(baseInput);
assert.equal(repeatedReceipt.scaffold_evidence_digest, receipt.scaffold_evidence_digest);

assert.throws(() => evaluateMembershipPolicyScaffold({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateMembershipPolicyScaffold({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateMembershipPolicyScaffold({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateMembershipPolicyScaffold({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateMembershipPolicyScaffold({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateMembershipPolicyScaffold({ ...baseInput, capability_execution_requested: true }), /must not execute capability behavior/);
assert.throws(() => evaluateMembershipPolicyScaffold({ ...baseInput, business_behavior_requested: true }), /must not execute business behavior/);
assert.throws(() => evaluateMembershipPolicyScaffold({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapter behavior/);

console.log('P6C scaffold-control membership_policy test passed.');
