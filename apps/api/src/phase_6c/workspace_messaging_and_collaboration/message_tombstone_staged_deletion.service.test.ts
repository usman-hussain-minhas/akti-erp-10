import assert from 'node:assert/strict';

import { evaluateMessageTombstoneStagedDeletion, type MessageTombstoneStagedDeletionInput } from './message_tombstone_staged_deletion.service';

const baseInput: MessageTombstoneStagedDeletionInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_message_tombstone_staged_deletion',
  source_record_ref: 'message_tombstone_staged_deletion_record_001',
  conversation_ref: 'channel_sales_ops_001',
  message_ref: 'message_delete_candidate_001',
  requested_by_user_ref: 'user_requester_060',
  deletion_reason: 'USER_REQUEST',
  message_created_at: '2026-06-01T09:00:00.000Z',
  retention_until: '2026-07-01T09:00:00.000Z',
  purge_not_before: '2026-08-01T09:00:00.000Z',
  evaluated_by_user_id: 'workspace_admin_060',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  evidence_refs: ['evidence_tombstone_request'],
};

const receipt = evaluateMessageTombstoneStagedDeletion(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_060_message_tombstone_staged_deletion');
assert.equal(receipt.component_id, '6C.05');
assert.equal(receipt.component_slug, 'workspace_messaging_and_collaboration');
assert.equal(receipt.model_name, 'Phase6CMessageTombstoneStagedDeletion');
assert.equal(receipt.event_name, 'phase_6c.workspace_messaging_and_collaboration.message_tombstone_staged_deletion.evaluated');
assert.equal(receipt.decision, 'TOMBSTONE_READY');
assert.equal(receipt.tombstone_plan_created, true);
assert.equal(receipt.staged_deletion_plan_created, false);
assert.equal(receipt.retention_satisfied, false);
assert.equal(receipt.purge_window_open, false);
assert.deepEqual(receipt.blockers, []);
assert.deepEqual(receipt.review_reasons, []);
assert.equal(receipt.tombstone_mutation_performed, false);
assert.equal(receipt.physical_delete_performed, false);
assert.equal(receipt.purge_execution_performed, false);
assert.equal(receipt.event_dispatch_performed, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.phase_6a_mutation_performed, false);
assert.equal(receipt.phase_6b_mutation_performed, false);
assert.equal(receipt.runtime_adapter_performed, false);
assert.equal(receipt.ticket_flag_flip_performed, false);
assert.match(receipt.tombstone_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateMessageTombstoneStagedDeletion(baseInput);
assert.equal(repeatedReceipt.tombstone_evidence_digest, receipt.tombstone_evidence_digest);

const stagedReady = evaluateMessageTombstoneStagedDeletion({
  ...baseInput,
  retention_until: '2026-06-01T09:00:00.000Z',
  purge_not_before: '2026-06-05T09:00:00.000Z',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  approval_required: true,
  approval_ref: 'approval_staged_deletion_060',
});
assert.equal(stagedReady.decision, 'STAGED_DELETION_READY');
assert.equal(stagedReady.staged_deletion_plan_created, true);
assert.equal(stagedReady.retention_satisfied, true);
assert.equal(stagedReady.purge_window_open, true);

const approvalRequired = evaluateMessageTombstoneStagedDeletion({
  ...baseInput,
  deletion_reason: 'COMPLIANCE_REDACTION',
  approval_required: true,
});
assert.equal(approvalRequired.decision, 'HUMAN_APPROVAL_REQUIRED');
assert.deepEqual(approvalRequired.review_reasons, ['approval_required_for_staged_deletion', 'compliance_redaction_requires_approval_ref']);

const legalHoldBlocked = evaluateMessageTombstoneStagedDeletion({
  ...baseInput,
  legal_hold_active: true,
});
assert.equal(legalHoldBlocked.decision, 'DELETION_BLOCKED');
assert.deepEqual(legalHoldBlocked.blockers, ['legal_hold_active']);

const invalidWindow = evaluateMessageTombstoneStagedDeletion({
  ...baseInput,
  retention_until: '2026-08-01T09:00:00.000Z',
  purge_not_before: '2026-07-01T09:00:00.000Z',
});
assert.equal(invalidWindow.decision, 'DELETION_BLOCKED');
assert.deepEqual(invalidWindow.blockers, ['purge_window_before_retention']);

assert.throws(() => evaluateMessageTombstoneStagedDeletion({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateMessageTombstoneStagedDeletion({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateMessageTombstoneStagedDeletion({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateMessageTombstoneStagedDeletion({ ...baseInput, conversation_ref: '' }), /conversation_ref is required/);
assert.throws(() => evaluateMessageTombstoneStagedDeletion({ ...baseInput, message_ref: '' }), /message_ref is required/);
assert.throws(() => evaluateMessageTombstoneStagedDeletion({ ...baseInput, requested_by_user_ref: '' }), /requested_by_user_ref is required/);
assert.throws(() => evaluateMessageTombstoneStagedDeletion({ ...baseInput, deletion_reason: 'BAD' as never }), /deletion_reason must be USER_REQUEST/);
assert.throws(() => evaluateMessageTombstoneStagedDeletion({ ...baseInput, message_created_at: 'not-a-date' }), /message_created_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateMessageTombstoneStagedDeletion({ ...baseInput, retention_until: 'not-a-date' }), /retention_until must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateMessageTombstoneStagedDeletion({ ...baseInput, purge_not_before: 'not-a-date' }), /purge_not_before must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateMessageTombstoneStagedDeletion({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateMessageTombstoneStagedDeletion({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateMessageTombstoneStagedDeletion({ ...baseInput, evidence_refs: [] }), /evidence_refs must include at least one/);
assert.throws(() => evaluateMessageTombstoneStagedDeletion({ ...baseInput, tombstone_mutation_requested: true }), /must not perform tombstone mutation/);
assert.throws(() => evaluateMessageTombstoneStagedDeletion({ ...baseInput, physical_delete_requested: true }), /must not perform physical delete/);
assert.throws(() => evaluateMessageTombstoneStagedDeletion({ ...baseInput, purge_execution_requested: true }), /must not perform purge execution/);
assert.throws(() => evaluateMessageTombstoneStagedDeletion({ ...baseInput, event_dispatch_requested: true }), /must not perform event dispatch/);
assert.throws(() => evaluateMessageTombstoneStagedDeletion({ ...baseInput, schema_mutation_requested: true }), /must not perform schema mutation/);
assert.throws(() => evaluateMessageTombstoneStagedDeletion({ ...baseInput, phase_6a_mutation_requested: true }), /must not perform Phase 6A mutation/);
assert.throws(() => evaluateMessageTombstoneStagedDeletion({ ...baseInput, phase_6b_mutation_requested: true }), /must not perform Phase 6B mutation/);
assert.throws(() => evaluateMessageTombstoneStagedDeletion({ ...baseInput, runtime_adapter_requested: true }), /must not perform runtime adapter execution/);
assert.throws(() => evaluateMessageTombstoneStagedDeletion({ ...baseInput, ticket_flag_flip_requested: true }), /must not perform ticket flag flip/);

console.log('P6C message_tombstone_staged_deletion runtime FFET test passed.');
