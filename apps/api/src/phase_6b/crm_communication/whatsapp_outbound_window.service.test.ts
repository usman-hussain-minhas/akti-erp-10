import assert from 'node:assert/strict';
import { evaluateWhatsappOutboundWindow, type WhatsappOutboundWindowInput } from './whatsapp_outbound_window.service';

const baseInput: WhatsappOutboundWindowInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_communication',
  outbound_window_check_id: 'whatsapp_window_check_001',
  lead_record_authority_id: 'lead_authority_001',
  pipeline_stage_model_ref: 'pipeline_stage_model_001',
  conversation_ref: 'whatsapp_conversation_001',
  whatsapp_template_ref: 'whatsapp_template_001',
  global_opt_out_registry_ref: 'global_opt_out_registry_reference',
  outbound_gateway_enforcement_ref: 'outbound_gateway_enforcement_001',
  last_inbound_at: '2026-06-08T08:00:00.000Z',
  candidate_send_at: '2026-06-08T20:00:00.000Z',
  configured_window_minutes: 1440,
  opt_out_state: 'NOT_OPTED_OUT',
  evaluated_by_user_id: 'user_comms_owner_001',
};

const receipt = evaluateWhatsappOutboundWindow(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_07_whatsapp_outbound_window');
assert.equal(receipt.component_id, '6B.07');
assert.equal(receipt.event_name, 'phase_6b.crm_communication.whatsapp_outbound_window.evaluated');
assert.equal(receipt.window_expires_at, '2026-06-09T08:00:00.000Z');
assert.equal(receipt.window_status, 'ELIGIBLE_WITHIN_WINDOW');
assert.deepEqual(receipt.adl_refs, ['ADL-004']);
assert.equal(receipt.global_opt_out_required, true);
assert.equal(receipt.outbound_gateway_required, true);
assert.equal(receipt.outbound_send_allowed, false);
assert.equal(receipt.provider_send_allowed, false);
assert.equal(receipt.credential_material_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const expiredReceipt = evaluateWhatsappOutboundWindow({
  ...baseInput,
  outbound_window_check_id: 'whatsapp_window_check_002',
  candidate_send_at: '2026-06-09T08:01:00.000Z',
});
assert.equal(expiredReceipt.window_status, 'BLOCKED_WINDOW_EXPIRED');

const optedOutReceipt = evaluateWhatsappOutboundWindow({
  ...baseInput,
  outbound_window_check_id: 'whatsapp_window_check_003',
  opt_out_state: 'OPTED_OUT',
});
assert.equal(optedOutReceipt.window_status, 'BLOCKED_GLOBAL_OPT_OUT');

const reviewReceipt = evaluateWhatsappOutboundWindow({
  ...baseInput,
  outbound_window_check_id: 'whatsapp_window_check_004',
  opt_out_state: 'UNKNOWN_REQUIRES_REVIEW',
});
assert.equal(reviewReceipt.window_status, 'REVIEW_REQUIRED');

assert.throws(() => evaluateWhatsappOutboundWindow({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateWhatsappOutboundWindow({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateWhatsappOutboundWindow({ ...baseInput, outbound_window_check_id: '' }), /outbound_window_check_id is required/);
assert.throws(() => evaluateWhatsappOutboundWindow({ ...baseInput, lead_record_authority_id: '' }), /lead_record_authority_id is required/);
assert.throws(() => evaluateWhatsappOutboundWindow({ ...baseInput, pipeline_stage_model_ref: '' }), /pipeline_stage_model_ref is required/);
assert.throws(() => evaluateWhatsappOutboundWindow({ ...baseInput, conversation_ref: '' }), /conversation_ref is required/);
assert.throws(() => evaluateWhatsappOutboundWindow({ ...baseInput, whatsapp_template_ref: '' }), /whatsapp_template_ref is required/);
assert.throws(() => evaluateWhatsappOutboundWindow({ ...baseInput, global_opt_out_registry_ref: '' }), /global_opt_out_registry_ref is required/);
assert.throws(() => evaluateWhatsappOutboundWindow({ ...baseInput, outbound_gateway_enforcement_ref: '' }), /outbound_gateway_enforcement_ref is required/);
assert.throws(() => evaluateWhatsappOutboundWindow({ ...baseInput, last_inbound_at: 'not-a-date' }), /last_inbound_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateWhatsappOutboundWindow({ ...baseInput, candidate_send_at: 'not-a-date' }), /candidate_send_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateWhatsappOutboundWindow({ ...baseInput, configured_window_minutes: 0 }), /configured_window_minutes must be a positive integer/);
assert.throws(() => evaluateWhatsappOutboundWindow({ ...baseInput, opt_out_state: 'BYPASS' as never }), /opt_out_state is not supported/);
assert.throws(() => evaluateWhatsappOutboundWindow({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateWhatsappOutboundWindow({ ...baseInput, outbound_send_requested: true }), /must not send outbound messages/);
assert.throws(() => evaluateWhatsappOutboundWindow({ ...baseInput, provider_send_requested: true }), /must not perform provider sends/);
assert.throws(() => evaluateWhatsappOutboundWindow({ ...baseInput, credential_material_requested: true }), /must not handle credential material/);
assert.throws(() => evaluateWhatsappOutboundWindow({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-052 whatsapp outbound window service test passed.');
