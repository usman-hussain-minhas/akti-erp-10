import assert from 'node:assert/strict';

import { evaluateMessageThreadReaction, type MessageThreadReactionInput } from './message_thread_reaction.service';

const baseInput: MessageThreadReactionInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_message_thread_reaction',
  source_record_ref: 'message_thread_reaction_record_001',
  conversation_ref: 'channel_sales_ops_001',
  participant_user_refs: ['user_owner_058', 'user_member_058', 'user_reader_058'],
  evaluated_by_user_id: 'workspace_admin_058',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  interactions: [
    {
      interaction_ref: 'thread_reply_001',
      interaction_type: 'THREAD_REPLY',
      message_ref: 'message_reply_001',
      parent_message_ref: 'message_root_001',
      actor_user_ref: 'user_owner_058',
      body: 'Threaded follow-up for the workspace message.',
      evidence_refs: ['evidence_thread_reply'],
    },
    {
      interaction_ref: 'mention_001',
      interaction_type: 'MENTION',
      message_ref: 'message_root_001',
      actor_user_ref: 'user_owner_058',
      mention_user_refs: ['user_member_058'],
      evidence_refs: ['evidence_mention'],
    },
    {
      interaction_ref: 'reaction_001',
      interaction_type: 'REACTION',
      message_ref: 'message_root_001',
      actor_user_ref: 'user_member_058',
      reaction: 'ACK',
      evidence_refs: ['evidence_reaction'],
    },
    {
      interaction_ref: 'read_001',
      interaction_type: 'READ_RECEIPT',
      message_ref: 'message_root_001',
      actor_user_ref: 'user_reader_058',
      read_at: '2026-06-09T09:10:00.000Z',
      evidence_refs: ['evidence_read_receipt'],
    },
  ],
};

const receipt = evaluateMessageThreadReaction(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_058_message_thread_reaction');
assert.equal(receipt.component_id, '6C.05');
assert.equal(receipt.component_slug, 'workspace_messaging_and_collaboration');
assert.equal(receipt.model_name, 'Phase6CMessageThreadReaction');
assert.equal(receipt.event_name, 'phase_6c.workspace_messaging_and_collaboration.message_thread_reaction.evaluated');
assert.equal(receipt.participant_count, 3);
assert.equal(receipt.interaction_count, 4);
assert.equal(receipt.thread_reply_count, 1);
assert.equal(receipt.mention_count, 1);
assert.equal(receipt.reaction_count, 1);
assert.equal(receipt.read_receipt_count, 1);
assert.equal(receipt.decision, 'MESSAGE_INTERACTIONS_READY');
assert.deepEqual(receipt.blockers, []);
assert.equal(receipt.interactions[0].body_length, 45);
assert.equal(receipt.realtime_delivery_performed, false);
assert.equal(receipt.notification_send_performed, false);
assert.equal(receipt.event_dispatch_performed, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.phase_6a_mutation_performed, false);
assert.equal(receipt.phase_6b_mutation_performed, false);
assert.equal(receipt.runtime_adapter_performed, false);
assert.equal(receipt.ticket_flag_flip_performed, false);
assert.match(receipt.message_interaction_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateMessageThreadReaction(baseInput);
assert.equal(repeatedReceipt.message_interaction_evidence_digest, receipt.message_interaction_evidence_digest);

const duplicateReaction = evaluateMessageThreadReaction({
  ...baseInput,
  interactions: [
    baseInput.interactions[2],
    { ...baseInput.interactions[2], interaction_ref: 'reaction_002' },
  ],
});
assert.equal(duplicateReaction.decision, 'MESSAGE_INTERACTIONS_BLOCKED');
assert.deepEqual(duplicateReaction.blockers, ['duplicate_reaction_for_message_actor']);

const duplicateRead = evaluateMessageThreadReaction({
  ...baseInput,
  interactions: [
    baseInput.interactions[3],
    { ...baseInput.interactions[3], interaction_ref: 'read_002', read_at: '2026-06-09T09:11:00.000Z' },
  ],
});
assert.equal(duplicateRead.decision, 'MESSAGE_INTERACTIONS_BLOCKED');
assert.deepEqual(duplicateRead.blockers, ['duplicate_read_receipt_for_message_actor']);

assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, conversation_ref: '' }), /conversation_ref is required/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, participant_user_refs: [] }), /participant_user_refs must include at least one/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, interactions: [] }), /interactions must include at least one/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, interactions: [{ ...baseInput.interactions[0], interaction_type: 'BAD' as never }] }), /interaction_type must be THREAD_REPLY/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, interactions: [{ ...baseInput.interactions[0], actor_user_ref: 'external_user' }] }), /actor_user_ref must be a conversation participant/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, interactions: [{ ...baseInput.interactions[0], parent_message_ref: undefined }] }), /parent_message_ref is required/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, interactions: [{ ...baseInput.interactions[0], body: '' }] }), /body is required/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, interactions: [{ ...baseInput.interactions[1], mention_user_refs: [] }] }), /mention_user_refs must include at least one/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, interactions: [{ ...baseInput.interactions[1], mention_user_refs: ['external_user'] }] }), /mention_user_refs must reference conversation participants/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, interactions: [{ ...baseInput.interactions[2], reaction: 'BAD' as never }] }), /reaction must be THUMBS_UP/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, interactions: [{ ...baseInput.interactions[3], read_at: 'not-a-date' }] }), /read_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, interactions: [{ ...baseInput.interactions[0], evidence_refs: [] }] }), /evidence_refs must include at least one/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, realtime_delivery_requested: true }), /must not perform realtime delivery execution/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, notification_send_requested: true }), /must not perform notification send execution/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, event_dispatch_requested: true }), /must not perform event dispatch/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, schema_mutation_requested: true }), /must not perform schema mutation/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, phase_6a_mutation_requested: true }), /must not perform Phase 6A mutation/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, phase_6b_mutation_requested: true }), /must not perform Phase 6B mutation/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, runtime_adapter_requested: true }), /must not perform runtime adapter execution/);
assert.throws(() => evaluateMessageThreadReaction({ ...baseInput, ticket_flag_flip_requested: true }), /must not perform ticket flag flip/);

console.log('P6C message_thread_reaction runtime FFET test passed.');
