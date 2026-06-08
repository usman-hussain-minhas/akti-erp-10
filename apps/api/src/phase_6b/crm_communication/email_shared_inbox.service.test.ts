import assert from 'node:assert/strict';
import { configureEmailSharedInbox, type EmailSharedInboxInput } from './email_shared_inbox.service';

const baseInput: EmailSharedInboxInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_crm_communication',
  shared_inbox_id: 'email_shared_inbox_001',
  inbox_address: 'Shared.Inbox@Example.com',
  display_name: 'Admissions shared inbox',
  pipeline_stage_model_ref: 'pipeline_stage_model_001',
  global_opt_out_registry_ref: 'global_opt_out_registry_001',
  outbound_gateway_enforcement_ref: 'outbound_gateway_enforcement_001',
  thread_policy: 'ASSIGN_TO_QUEUE',
  visibility: 'TEAM_SHARED',
  owner_group_refs: ['owner_group_admissions', 'owner_group_support'],
  routing_queue_ref: 'routing_queue_admissions',
  lifecycle_status: 'ACTIVE',
  configured_by_user_id: 'user_comms_owner_001',
  configured_at: '2026-06-08T20:45:00.000Z',
};

const receipt = configureEmailSharedInbox(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_07_email_shared_inbox');
assert.equal(receipt.component_id, '6B.07');
assert.equal(receipt.event_name, 'phase_6b.crm_communication.email_shared_inbox.configured');
assert.equal(receipt.inbox_address, 'shared.inbox@example.com');
assert.equal(receipt.inbox_domain, 'example.com');
assert.equal(receipt.thread_policy, 'ASSIGN_TO_QUEUE');
assert.equal(receipt.visibility, 'TEAM_SHARED');
assert.deepEqual(receipt.owner_group_refs, ['owner_group_admissions', 'owner_group_support']);
assert.equal(receipt.owner_group_count, 2);
assert.equal(receipt.lifecycle_status, 'ACTIVE');
assert.equal(receipt.opt_out_adl_ref, 'ADL-004');
assert.equal(receipt.outbound_gateway_adl_ref, 'ADL-004');
assert.equal(receipt.outbound_send_allowed, false);
assert.equal(receipt.mailbox_sync_allowed, false);
assert.equal(receipt.credential_material_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const manualReceipt = configureEmailSharedInbox({
  ...baseInput,
  shared_inbox_id: 'email_shared_inbox_002',
  thread_policy: 'MANUAL_TRIAGE',
  visibility: 'OWNER_GROUP_SHARED',
  owner_group_refs: ['owner_group_finance'],
  lifecycle_status: 'PAUSED',
});
assert.equal(manualReceipt.thread_policy, 'MANUAL_TRIAGE');
assert.equal(manualReceipt.visibility, 'OWNER_GROUP_SHARED');
assert.equal(manualReceipt.owner_group_count, 1);
assert.equal(manualReceipt.lifecycle_status, 'PAUSED');

assert.throws(() => configureEmailSharedInbox({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => configureEmailSharedInbox({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => configureEmailSharedInbox({ ...baseInput, shared_inbox_id: '' }), /shared_inbox_id is required/);
assert.throws(() => configureEmailSharedInbox({ ...baseInput, inbox_address: 'not-an-email' }), /inbox_address must be a valid email address/);
assert.throws(() => configureEmailSharedInbox({ ...baseInput, display_name: '' }), /display_name is required/);
assert.throws(() => configureEmailSharedInbox({ ...baseInput, pipeline_stage_model_ref: '' }), /pipeline_stage_model_ref is required/);
assert.throws(() => configureEmailSharedInbox({ ...baseInput, global_opt_out_registry_ref: '' }), /global_opt_out_registry_ref is required/);
assert.throws(() => configureEmailSharedInbox({ ...baseInput, outbound_gateway_enforcement_ref: '' }), /outbound_gateway_enforcement_ref is required/);
assert.throws(() => configureEmailSharedInbox({ ...baseInput, thread_policy: 'AUTO_REPLY' as never }), /thread_policy is not supported/);
assert.throws(() => configureEmailSharedInbox({ ...baseInput, visibility: 'PUBLIC' as never }), /visibility is not supported/);
assert.throws(() => configureEmailSharedInbox({ ...baseInput, owner_group_refs: [] }), /owner_group_refs must include at least one/);
assert.throws(() => configureEmailSharedInbox({ ...baseInput, owner_group_refs: ['owner_group_admissions', 'owner_group_admissions'] }), /owner_group_refs must not contain duplicates/);
assert.throws(() => configureEmailSharedInbox({ ...baseInput, owner_group_refs: [''] }), /owner_group_refs is required/);
assert.throws(() => configureEmailSharedInbox({ ...baseInput, routing_queue_ref: '' }), /routing_queue_ref is required/);
assert.throws(() => configureEmailSharedInbox({ ...baseInput, lifecycle_status: 'DELETED' as never }), /lifecycle_status is not supported/);
assert.throws(() => configureEmailSharedInbox({ ...baseInput, configured_by_user_id: '' }), /configured_by_user_id is required/);
assert.throws(() => configureEmailSharedInbox({ ...baseInput, configured_at: 'not-a-date' }), /configured_at must be a valid ISO-compatible timestamp/);
assert.throws(() => configureEmailSharedInbox({ ...baseInput, outbound_send_requested: true }), /must not send outbound email/);
assert.throws(() => configureEmailSharedInbox({ ...baseInput, mailbox_sync_requested: true }), /must not execute mailbox sync/);
assert.throws(() => configureEmailSharedInbox({ ...baseInput, credential_material_requested: true }), /must not handle credential material/);
assert.throws(() => configureEmailSharedInbox({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-058 email shared inbox service test passed.');
