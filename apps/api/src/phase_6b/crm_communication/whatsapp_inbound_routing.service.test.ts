import assert from 'node:assert/strict';
import { routeWhatsappInboundMessage, type WhatsappInboundRoutingInput } from './whatsapp_inbound_routing.service';

const baseInput: WhatsappInboundRoutingInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_crm_communication',
  inbound_message_id: 'whatsapp_inbound_001',
  channel_account_ref: 'whatsapp_channel_account_001',
  sender_contact_ref: 'contact_ref_hash_001',
  conversation_ref: 'whatsapp_conversation_001',
  lead_record_authority_id: 'lead_authority_001',
  pipeline_stage_model_ref: 'pipeline_stage_model_001',
  pipeline_stage_key: 'qualification',
  message_kind: 'TEXT',
  normalized_message_body: 'I am interested in the commerce package.',
  received_at: '2026-06-08T19:00:00.000Z',
  routing_decision: 'ROUTE_TO_PIPELINE_STAGE',
  route_reason: 'Existing lead authority and pipeline stage match.',
  assigned_work_queue_ref: 'work_queue_sales_001',
  global_opt_out_registry_ref: 'global_opt_out_registry_reference',
  evidence_refs: ['normalized_inbound_payload_001', 'lead_authority_match_001'],
};

const receipt = routeWhatsappInboundMessage(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_07_whatsapp_inbound_routing');
assert.equal(receipt.component_id, '6B.07');
assert.equal(receipt.event_name, 'phase_6b.crm_communication.whatsapp_inbound_routing.routed');
assert.equal(receipt.inbound_message_id, 'whatsapp_inbound_001');
assert.equal(receipt.channel_account_ref, 'whatsapp_channel_account_001');
assert.equal(receipt.sender_contact_ref, 'contact_ref_hash_001');
assert.equal(receipt.lead_record_authority_id, 'lead_authority_001');
assert.equal(receipt.pipeline_stage_model_ref, 'pipeline_stage_model_001');
assert.equal(receipt.routing_decision, 'ROUTE_TO_PIPELINE_STAGE');
assert.equal(receipt.assigned_work_queue_ref, 'work_queue_sales_001');
assert.deepEqual(receipt.evidence_refs, ['normalized_inbound_payload_001', 'lead_authority_match_001']);
assert.equal(receipt.evidence_count, 2);
assert.equal(receipt.opt_out_dependency_tier, 'CONDITIONAL_CAPTURE_REFERENCE');
assert.equal(receipt.inbound_capture_only, true);
assert.equal(receipt.outbound_send_allowed, false);
assert.equal(receipt.provider_callback_processing_allowed, false);
assert.equal(receipt.credential_material_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const reviewReceipt = routeWhatsappInboundMessage({
  ...baseInput,
  inbound_message_id: 'whatsapp_inbound_002',
  message_kind: 'UNKNOWN',
  routing_decision: 'MANUAL_REVIEW',
  assigned_work_queue_ref: undefined,
  global_opt_out_registry_ref: undefined,
});
assert.equal(reviewReceipt.routing_decision, 'MANUAL_REVIEW');
assert.equal(reviewReceipt.assigned_work_queue_ref, undefined);
assert.equal(reviewReceipt.global_opt_out_registry_ref, undefined);

assert.throws(() => routeWhatsappInboundMessage({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => routeWhatsappInboundMessage({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => routeWhatsappInboundMessage({ ...baseInput, inbound_message_id: '' }), /inbound_message_id is required/);
assert.throws(() => routeWhatsappInboundMessage({ ...baseInput, channel_account_ref: '' }), /channel_account_ref is required/);
assert.throws(() => routeWhatsappInboundMessage({ ...baseInput, sender_contact_ref: '' }), /sender_contact_ref is required/);
assert.throws(() => routeWhatsappInboundMessage({ ...baseInput, conversation_ref: '' }), /conversation_ref is required/);
assert.throws(() => routeWhatsappInboundMessage({ ...baseInput, lead_record_authority_id: '' }), /lead_record_authority_id is required/);
assert.throws(() => routeWhatsappInboundMessage({ ...baseInput, pipeline_stage_model_ref: '' }), /pipeline_stage_model_ref is required/);
assert.throws(() => routeWhatsappInboundMessage({ ...baseInput, pipeline_stage_key: '' }), /pipeline_stage_key is required/);
assert.throws(() => routeWhatsappInboundMessage({ ...baseInput, message_kind: 'VOICE_CALL' as never }), /message_kind is not supported/);
assert.throws(() => routeWhatsappInboundMessage({ ...baseInput, normalized_message_body: '' }), /normalized_message_body is required/);
assert.throws(() => routeWhatsappInboundMessage({ ...baseInput, normalized_message_body: 'x'.repeat(4097) }), /normalized_message_body must not exceed 4096 characters/);
assert.throws(() => routeWhatsappInboundMessage({ ...baseInput, received_at: 'not-a-date' }), /received_at must be a valid ISO-compatible timestamp/);
assert.throws(() => routeWhatsappInboundMessage({ ...baseInput, routing_decision: 'AUTO_REPLY' as never }), /routing_decision is not supported/);
assert.throws(() => routeWhatsappInboundMessage({ ...baseInput, route_reason: '' }), /route_reason is required/);
assert.throws(() => routeWhatsappInboundMessage({ ...baseInput, assigned_work_queue_ref: '' }), /assigned_work_queue_ref is required/);
assert.throws(() => routeWhatsappInboundMessage({ ...baseInput, global_opt_out_registry_ref: '' }), /global_opt_out_registry_ref is required/);
assert.throws(() => routeWhatsappInboundMessage({ ...baseInput, evidence_refs: [] }), /evidence_refs must contain at least one evidence reference/);
assert.throws(() => routeWhatsappInboundMessage({ ...baseInput, evidence_refs: ['evidence_1', 'evidence_1'] }), /evidence_refs must not contain duplicate/);
assert.throws(() => routeWhatsappInboundMessage({ ...baseInput, outbound_send_requested: true }), /must not send outbound messages/);
assert.throws(() => routeWhatsappInboundMessage({ ...baseInput, provider_callback_processing_requested: true }), /must not process provider callbacks/);
assert.throws(() => routeWhatsappInboundMessage({ ...baseInput, credential_material_requested: true }), /must not handle credential material/);
assert.throws(() => routeWhatsappInboundMessage({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-051 whatsapp inbound routing service test passed.');
