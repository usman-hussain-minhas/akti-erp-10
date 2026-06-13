import assert from 'node:assert/strict';
import { configureEmailConnectedInbox, type EmailConnectedInboxInput } from './email_connected_inbox.service';

const baseInput: EmailConnectedInboxInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_communication',
  connected_inbox_id: 'email_inbox_001',
  inbox_address: 'Admissions.Team@Example.COM',
  display_name: 'Admissions team inbox',
  pipeline_stage_model_ref: 'pipeline_stage_model_001',
  inbound_route_ref: 'email_inbound_route_001',
  lifecycle_status: 'ACTIVE',
  health_status: 'HEALTHY',
  allowed_sender_domain: 'Example.com',
  global_opt_out_registry_ref: 'global_opt_out_registry_reference',
  configured_by_user_id: 'user_comms_owner_001',
  configured_at: '2026-06-08T19:30:00.000Z',
};

const receipt = configureEmailConnectedInbox(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_07_email_connected_inbox');
assert.equal(receipt.component_id, '6B.07');
assert.equal(receipt.event_name, 'phase_6b.crm_communication.email_connected_inbox.configured');
assert.equal(receipt.inbox_address, 'admissions.team@example.com');
assert.equal(receipt.inbox_domain, 'example.com');
assert.equal(receipt.allowed_sender_domain, 'example.com');
assert.equal(receipt.lifecycle_status, 'ACTIVE');
assert.equal(receipt.health_status, 'HEALTHY');
assert.equal(receipt.opt_out_dependency_tier, 'CONDITIONAL_SETUP_REFERENCE');
assert.equal(receipt.outbound_send_allowed, false);
assert.equal(receipt.mailbox_sync_allowed, false);
assert.equal(receipt.credential_material_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const draftReceipt = configureEmailConnectedInbox({
  ...baseInput,
  connected_inbox_id: 'email_inbox_002',
  lifecycle_status: 'DRAFT',
  health_status: 'NOT_CHECKED',
  global_opt_out_registry_ref: undefined,
});
assert.equal(draftReceipt.lifecycle_status, 'DRAFT');
assert.equal(draftReceipt.global_opt_out_registry_ref, undefined);

assert.throws(() => configureEmailConnectedInbox({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => configureEmailConnectedInbox({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => configureEmailConnectedInbox({ ...baseInput, connected_inbox_id: '' }), /connected_inbox_id is required/);
assert.throws(() => configureEmailConnectedInbox({ ...baseInput, inbox_address: 'not-an-email' }), /inbox_address must be a valid email address/);
assert.throws(() => configureEmailConnectedInbox({ ...baseInput, display_name: '' }), /display_name is required/);
assert.throws(() => configureEmailConnectedInbox({ ...baseInput, pipeline_stage_model_ref: '' }), /pipeline_stage_model_ref is required/);
assert.throws(() => configureEmailConnectedInbox({ ...baseInput, inbound_route_ref: '' }), /inbound_route_ref is required/);
assert.throws(() => configureEmailConnectedInbox({ ...baseInput, lifecycle_status: 'DELETED' as never }), /lifecycle_status is not supported/);
assert.throws(() => configureEmailConnectedInbox({ ...baseInput, health_status: 'SYNCING' as never }), /health_status is not supported/);
assert.throws(() => configureEmailConnectedInbox({ ...baseInput, allowed_sender_domain: 'bad_domain' }), /allowed_sender_domain must be a valid domain/);
assert.throws(() => configureEmailConnectedInbox({ ...baseInput, global_opt_out_registry_ref: '' }), /global_opt_out_registry_ref is required/);
assert.throws(() => configureEmailConnectedInbox({ ...baseInput, configured_by_user_id: '' }), /configured_by_user_id is required/);
assert.throws(() => configureEmailConnectedInbox({ ...baseInput, configured_at: 'not-a-date' }), /configured_at must be a valid ISO-compatible timestamp/);
assert.throws(() => configureEmailConnectedInbox({ ...baseInput, outbound_send_requested: true }), /must not send outbound email/);
assert.throws(() => configureEmailConnectedInbox({ ...baseInput, mailbox_sync_requested: true }), /must not execute mailbox sync/);
assert.throws(() => configureEmailConnectedInbox({ ...baseInput, credential_material_requested: true }), /must not handle credential material/);
assert.throws(() => configureEmailConnectedInbox({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-055 email connected inbox service test passed.');
