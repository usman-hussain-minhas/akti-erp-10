import assert from 'node:assert/strict';

import { evaluatePrivateChannelApprovalScaffold, type PrivateChannelApprovalScaffoldInput } from './private_channel_approval.service';

const baseInput: PrivateChannelApprovalScaffoldInput = {
  organization_id: 'org_phase_6c_control',
  service_manifest_contract_id: 'smc_phase_6c_private_channel_approval',
  source_record_ref: 'private_channel_approval_record_001',
  evaluated_by_user_id: 'user_phase_6c_control',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  control_metadata: { source: 'phase_6c_scaffold_control' },
};

const receipt = evaluatePrivateChannelApprovalScaffold(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_065_private_channel_approval');
assert.equal(receipt.component_id, '6C.05');
assert.equal(receipt.component_slug, 'workspace_messaging_and_collaboration');
assert.equal(receipt.model_name, 'Phase6CPrivateChannelApproval');
assert.equal(receipt.scaffold_status, 'SCAFFOLD_CONTROL_ONLY');
assert.equal(receipt.capability_implementation_allowed, false);
assert.equal(receipt.business_behavior_allowed, false);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.match(receipt.scaffold_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluatePrivateChannelApprovalScaffold(baseInput);
assert.equal(repeatedReceipt.scaffold_evidence_digest, receipt.scaffold_evidence_digest);

assert.throws(() => evaluatePrivateChannelApprovalScaffold({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluatePrivateChannelApprovalScaffold({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluatePrivateChannelApprovalScaffold({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluatePrivateChannelApprovalScaffold({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluatePrivateChannelApprovalScaffold({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluatePrivateChannelApprovalScaffold({ ...baseInput, capability_execution_requested: true }), /must not execute capability behavior/);
assert.throws(() => evaluatePrivateChannelApprovalScaffold({ ...baseInput, business_behavior_requested: true }), /must not execute business behavior/);
assert.throws(() => evaluatePrivateChannelApprovalScaffold({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapter behavior/);

console.log('P6C scaffold-control private_channel_approval test passed.');
