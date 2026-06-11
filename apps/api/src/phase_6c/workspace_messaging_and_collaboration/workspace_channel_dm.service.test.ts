import assert from 'node:assert/strict';

import { evaluateWorkspaceChannelDm, type WorkspaceChannelDmInput } from './workspace_channel_dm.service';

const baseInput: WorkspaceChannelDmInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_workspace_channel_dm',
  source_record_ref: 'workspace_channel_dm_record_001',
  conversation_ref: 'channel_sales_ops_001',
  conversation_kind: 'CHANNEL',
  visibility: 'PRIVATE',
  created_by_user_ref: 'user_owner_057',
  evaluated_by_user_id: 'workspace_admin_057',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  retention_policy_ref: 'retention_workspace_standard',
  participants: [
    {
      user_ref: 'user_owner_057',
      employee_ref: 'employee_owner_057',
      role: 'OWNER',
      evidence_refs: ['evidence_owner_membership'],
    },
    {
      user_ref: 'user_member_057',
      employee_ref: 'employee_member_057',
      role: 'MEMBER',
      muted: true,
      evidence_refs: ['evidence_member_membership'],
    },
  ],
  message_draft: {
    sender_user_ref: 'user_owner_057',
    body: 'Welcome to the sales operations channel.',
    classification: 'NORMAL',
    mention_user_refs: ['user_member_057'],
    evidence_refs: ['evidence_message_draft'],
  },
};

const receipt = evaluateWorkspaceChannelDm(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_057_workspace_channel_dm');
assert.equal(receipt.component_id, '6C.05');
assert.equal(receipt.component_slug, 'workspace_messaging_and_collaboration');
assert.equal(receipt.model_name, 'Phase6CWorkspaceChannelDm');
assert.equal(receipt.event_name, 'phase_6c.workspace_messaging_and_collaboration.workspace_channel_dm.evaluated');
assert.equal(receipt.conversation_kind, 'CHANNEL');
assert.equal(receipt.visibility, 'PRIVATE');
assert.equal(receipt.participant_count, 2);
assert.equal(receipt.owner_count, 1);
assert.equal(receipt.guest_count, 0);
assert.equal(receipt.muted_count, 1);
assert.equal(receipt.decision, 'CONVERSATION_READY');
assert.deepEqual(receipt.blockers, []);
assert.deepEqual(receipt.review_reasons, []);
assert.equal(receipt.message_draft?.body_length, 40);
assert.equal(receipt.message_draft?.moderation_required, false);
assert.equal(receipt.external_transport_performed, false);
assert.equal(receipt.notification_send_performed, false);
assert.equal(receipt.realtime_delivery_performed, false);
assert.equal(receipt.event_dispatch_performed, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.phase_6a_mutation_performed, false);
assert.equal(receipt.phase_6b_mutation_performed, false);
assert.equal(receipt.runtime_adapter_performed, false);
assert.equal(receipt.ticket_flag_flip_performed, false);
assert.match(receipt.channel_dm_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateWorkspaceChannelDm(baseInput);
assert.equal(repeatedReceipt.channel_dm_evidence_digest, receipt.channel_dm_evidence_digest);

const directMessage = evaluateWorkspaceChannelDm({
  ...baseInput,
  conversation_ref: 'dm_owner_member_057',
  conversation_kind: 'DIRECT_MESSAGE',
  visibility: 'PRIVATE',
  message_draft: undefined,
});
assert.equal(directMessage.decision, 'CONVERSATION_READY');
assert.equal(directMessage.message_draft, null);

const restrictedGuestReview = evaluateWorkspaceChannelDm({
  ...baseInput,
  visibility: 'RESTRICTED',
  participants: [
    baseInput.participants[0],
    { ...baseInput.participants[1], role: 'GUEST' },
  ],
  message_draft: {
    sender_user_ref: 'user_owner_057',
    body: 'Sensitive attachment for review.',
    classification: 'SENSITIVE',
    attachment_refs: ['attachment_policy_pdf'],
    evidence_refs: ['evidence_sensitive_message'],
  },
});
assert.equal(restrictedGuestReview.decision, 'CONVERSATION_REQUIRES_REVIEW');
assert.deepEqual(restrictedGuestReview.review_reasons, ['restricted_conversation_contains_guest', 'message_draft_requires_moderation']);

const blockedDm = evaluateWorkspaceChannelDm({
  ...baseInput,
  conversation_kind: 'DIRECT_MESSAGE',
  participants: [baseInput.participants[0]],
  message_draft: undefined,
});
assert.equal(blockedDm.decision, 'CONVERSATION_BLOCKED');
assert.deepEqual(blockedDm.blockers, ['direct_message_requires_exactly_two_participants']);

const noOwner = evaluateWorkspaceChannelDm({
  ...baseInput,
  participants: [
    { ...baseInput.participants[0], role: 'MEMBER' },
    baseInput.participants[1],
  ],
  message_draft: undefined,
});
assert.equal(noOwner.decision, 'CONVERSATION_BLOCKED');
assert.deepEqual(noOwner.blockers, ['conversation_requires_owner']);

assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, conversation_ref: '' }), /conversation_ref is required/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, conversation_kind: 'BAD' as never }), /conversation_kind must be CHANNEL/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, visibility: 'BAD' as never }), /visibility must be PUBLIC/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, created_by_user_ref: 'not_a_participant' }), /created_by_user_ref must be one of/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, participants: [] }), /participants must include at least one/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, participants: [{ ...baseInput.participants[0], role: 'BAD' as never }] }), /role must be OWNER/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, participants: [{ ...baseInput.participants[0], evidence_refs: [] }] }), /evidence_refs must include at least one/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, message_draft: { ...baseInput.message_draft!, sender_user_ref: 'external_user' } }), /sender_user_ref must be a conversation participant/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, message_draft: { ...baseInput.message_draft!, body: '' } }), /message_draft.body is required/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, message_draft: { ...baseInput.message_draft!, classification: 'BAD' as never } }), /classification must be NORMAL/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, message_draft: { ...baseInput.message_draft!, mention_user_refs: ['external_user'] } }), /mention_user_refs must reference/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, external_transport_requested: true }), /must not perform external transport execution/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, notification_send_requested: true }), /must not perform notification send execution/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, realtime_delivery_requested: true }), /must not perform realtime delivery execution/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, event_dispatch_requested: true }), /must not perform event dispatch/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, schema_mutation_requested: true }), /must not perform schema mutation/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, phase_6a_mutation_requested: true }), /must not perform Phase 6A mutation/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, phase_6b_mutation_requested: true }), /must not perform Phase 6B mutation/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, runtime_adapter_requested: true }), /must not perform runtime adapter execution/);
assert.throws(() => evaluateWorkspaceChannelDm({ ...baseInput, ticket_flag_flip_requested: true }), /must not perform ticket flag flip/);

console.log('P6C workspace_channel_dm runtime FFET test passed.');
