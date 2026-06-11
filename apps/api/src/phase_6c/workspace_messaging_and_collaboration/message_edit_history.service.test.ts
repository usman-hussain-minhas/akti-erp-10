import assert from 'node:assert/strict';

import { evaluateMessageEditHistory, hashMessageEditHistoryBody, type MessageEditHistoryInput } from './message_edit_history.service';

const originalHash = hashMessageEditHistoryBody('Initial message body');
const firstEditHash = hashMessageEditHistoryBody('Initial message body with typo fixed');
const secondEditHash = hashMessageEditHistoryBody('Initial message body with typo fixed and context added');

const baseInput: MessageEditHistoryInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_message_edit_history',
  source_record_ref: 'message_edit_history_record_001',
  conversation_ref: 'channel_sales_ops_001',
  message_ref: 'message_editable_001',
  original_author_user_ref: 'user_author_059',
  original_body_hash: originalHash,
  evaluated_by_user_id: 'workspace_admin_059',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  edits: [
    {
      edit_ref: 'edit_001',
      editor_user_ref: 'user_author_059',
      edited_at: '2026-06-09T09:05:00.000Z',
      previous_body_hash: originalHash,
      new_body: 'Initial message body with typo fixed',
      edit_reason: 'TYPO',
      evidence_refs: ['evidence_edit_001'],
    },
    {
      edit_ref: 'edit_002',
      editor_user_ref: 'user_author_059',
      edited_at: '2026-06-09T09:10:00.000Z',
      previous_body_hash: firstEditHash,
      new_body: 'Initial message body with typo fixed and context added',
      edit_reason: 'CLARIFICATION',
      evidence_refs: ['evidence_edit_002'],
    },
  ],
};

const receipt = evaluateMessageEditHistory(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_059_message_edit_history');
assert.equal(receipt.component_id, '6C.05');
assert.equal(receipt.component_slug, 'workspace_messaging_and_collaboration');
assert.equal(receipt.model_name, 'Phase6CMessageEditHistory');
assert.equal(receipt.event_name, 'phase_6c.workspace_messaging_and_collaboration.message_edit_history.evaluated');
assert.equal(receipt.decision, 'EDIT_HISTORY_ACCEPTED');
assert.equal(receipt.edit_count, 2);
assert.equal(receipt.compliance_redaction_count, 0);
assert.deepEqual(receipt.blockers, []);
assert.deepEqual(receipt.review_reasons, []);
assert.equal(receipt.original_body_hash, originalHash);
assert.equal(receipt.latest_body_hash, secondEditHash);
assert.equal(receipt.edit_chain[0].new_body_hash, firstEditHash);
assert.equal(receipt.edit_chain[1].previous_body_hash, firstEditHash);
assert.equal(receipt.content_overwrite_performed, false);
assert.equal(receipt.history_delete_performed, false);
assert.equal(receipt.realtime_delivery_performed, false);
assert.equal(receipt.event_dispatch_performed, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.phase_6a_mutation_performed, false);
assert.equal(receipt.phase_6b_mutation_performed, false);
assert.equal(receipt.runtime_adapter_performed, false);
assert.equal(receipt.ticket_flag_flip_performed, false);
assert.match(receipt.edit_history_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateMessageEditHistory(baseInput);
assert.equal(repeatedReceipt.edit_history_evidence_digest, receipt.edit_history_evidence_digest);

const tamperedChain = evaluateMessageEditHistory({
  ...baseInput,
  edits: [
    baseInput.edits[0],
    { ...baseInput.edits[1], previous_body_hash: originalHash },
  ],
});
assert.equal(tamperedChain.decision, 'EDIT_HISTORY_BLOCKED');
assert.deepEqual(tamperedChain.blockers, ['edit_1_previous_hash_mismatch']);

const redactionNeedsReview = evaluateMessageEditHistory({
  ...baseInput,
  edits: [
    {
      edit_ref: 'edit_redaction_001',
      editor_user_ref: 'compliance_user_059',
      edited_at: '2026-06-09T09:15:00.000Z',
      previous_body_hash: originalHash,
      new_body: 'Initial message body with sensitive detail redacted',
      edit_reason: 'COMPLIANCE_REDACTION',
      evidence_refs: ['evidence_redaction'],
    },
  ],
});
assert.equal(redactionNeedsReview.decision, 'EDIT_HISTORY_REQUIRES_REVIEW');
assert.deepEqual(redactionNeedsReview.review_reasons, ['edit_0_missing_compliance_review_ref']);

const duplicateEdit = evaluateMessageEditHistory({
  ...baseInput,
  edits: [
    baseInput.edits[0],
    { ...baseInput.edits[1], edit_ref: 'edit_001' },
  ],
});
assert.equal(duplicateEdit.decision, 'EDIT_HISTORY_BLOCKED');
assert.deepEqual(duplicateEdit.blockers, ['duplicate_edit_ref']);

assert.throws(() => evaluateMessageEditHistory({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, conversation_ref: '' }), /conversation_ref is required/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, message_ref: '' }), /message_ref is required/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, original_author_user_ref: '' }), /original_author_user_ref is required/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, original_body_hash: 'bad_hash' }), /original_body_hash must be a sha256 hex digest/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, edits: [] }), /edits must include at least one/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, edits: [{ ...baseInput.edits[0], edit_ref: '' }] }), /edit_ref is required/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, edits: [{ ...baseInput.edits[0], editor_user_ref: '' }] }), /editor_user_ref is required/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, edits: [{ ...baseInput.edits[0], edited_at: 'not-a-date' }] }), /edited_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, edits: [{ ...baseInput.edits[0], previous_body_hash: 'bad_hash' }] }), /previous_body_hash must be a sha256 hex digest/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, edits: [{ ...baseInput.edits[0], new_body: '' }] }), /new_body is required/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, edits: [{ ...baseInput.edits[0], edit_reason: 'BAD' as never }] }), /edit_reason must be TYPO/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, edits: [{ ...baseInput.edits[0], evidence_refs: [] }] }), /evidence_refs must include at least one/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, content_overwrite_requested: true }), /must not perform content overwrite/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, history_delete_requested: true }), /must not perform history delete/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, realtime_delivery_requested: true }), /must not perform realtime delivery execution/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, event_dispatch_requested: true }), /must not perform event dispatch/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, schema_mutation_requested: true }), /must not perform schema mutation/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, phase_6a_mutation_requested: true }), /must not perform Phase 6A mutation/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, phase_6b_mutation_requested: true }), /must not perform Phase 6B mutation/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, runtime_adapter_requested: true }), /must not perform runtime adapter execution/);
assert.throws(() => evaluateMessageEditHistory({ ...baseInput, ticket_flag_flip_requested: true }), /must not perform ticket flag flip/);

console.log('P6C message_edit_history runtime FFET test passed.');
