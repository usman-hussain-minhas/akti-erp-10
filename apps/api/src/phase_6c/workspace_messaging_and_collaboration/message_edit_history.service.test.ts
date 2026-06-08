import assert from 'node:assert/strict';

import { evaluateMessageEditHistoryScaffold, type MessageEditHistoryScaffoldInput } from './message_edit_history.service';

const baseInput: MessageEditHistoryScaffoldInput = {
  organization_id: 'org_phase_6c_control',
  service_manifest_contract_id: 'smc_phase_6c_message_edit_history',
  source_record_ref: 'message_edit_history_record_001',
  evaluated_by_user_id: 'user_phase_6c_control',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  control_metadata: { source: 'phase_6c_scaffold_control' },
};

const receipt = evaluateMessageEditHistoryScaffold(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_059_message_edit_history');
assert.equal(receipt.component_id, '6C.05');
assert.equal(receipt.component_slug, 'workspace_messaging_and_collaboration');
assert.equal(receipt.model_name, 'Phase6CMessageEditHistory');
assert.equal(receipt.scaffold_status, 'SCAFFOLD_CONTROL_ONLY');
assert.equal(receipt.capability_implementation_allowed, false);
assert.equal(receipt.business_behavior_allowed, false);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.match(receipt.scaffold_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateMessageEditHistoryScaffold(baseInput);
assert.equal(repeatedReceipt.scaffold_evidence_digest, receipt.scaffold_evidence_digest);

assert.throws(() => evaluateMessageEditHistoryScaffold({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateMessageEditHistoryScaffold({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateMessageEditHistoryScaffold({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateMessageEditHistoryScaffold({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateMessageEditHistoryScaffold({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateMessageEditHistoryScaffold({ ...baseInput, capability_execution_requested: true }), /must not execute capability behavior/);
assert.throws(() => evaluateMessageEditHistoryScaffold({ ...baseInput, business_behavior_requested: true }), /must not execute business behavior/);
assert.throws(() => evaluateMessageEditHistoryScaffold({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapter behavior/);

console.log('P6C scaffold-control message_edit_history test passed.');
