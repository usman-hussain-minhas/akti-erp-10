import assert from 'node:assert/strict';
import { evaluateWhatsappBroadcastCompliance, type WhatsappBroadcastComplianceInput } from './whatsapp_broadcast_compliance.service';

const baseInput: WhatsappBroadcastComplianceInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_crm_communication',
  broadcast_compliance_check_id: 'whatsapp_broadcast_check_001',
  pipeline_stage_model_ref: 'pipeline_stage_model_001',
  whatsapp_template_ref: 'whatsapp_template_001',
  global_opt_out_registry_ref: 'global_opt_out_registry_reference',
  outbound_gateway_enforcement_ref: 'outbound_gateway_enforcement_001',
  evaluated_by_user_id: 'user_comms_owner_001',
  evaluated_at: '2026-06-08T19:10:00.000Z',
  recipients: [
    {
      recipient_ref: 'recipient_001',
      lead_record_authority_id: 'lead_authority_001',
      conversation_ref: 'conversation_001',
      opt_out_state: 'NOT_OPTED_OUT',
      outbound_window_state: 'ELIGIBLE_WITHIN_WINDOW',
      compliance_evidence_refs: ['opt_out_check_001', 'window_check_001'],
    },
    {
      recipient_ref: 'recipient_002',
      lead_record_authority_id: 'lead_authority_002',
      conversation_ref: 'conversation_002',
      opt_out_state: 'OPTED_OUT',
      outbound_window_state: 'ELIGIBLE_WITHIN_WINDOW',
      compliance_evidence_refs: ['opt_out_check_002', 'window_check_002'],
    },
    {
      recipient_ref: 'recipient_003',
      lead_record_authority_id: 'lead_authority_003',
      conversation_ref: 'conversation_003',
      opt_out_state: 'UNKNOWN_REQUIRES_REVIEW',
      outbound_window_state: 'ELIGIBLE_WITHIN_WINDOW',
      compliance_evidence_refs: ['opt_out_check_003', 'window_check_003'],
    },
  ],
};

const receipt = evaluateWhatsappBroadcastCompliance(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_07_whatsapp_broadcast_compliance');
assert.equal(receipt.component_id, '6B.07');
assert.equal(receipt.event_name, 'phase_6b.crm_communication.whatsapp_broadcast_compliance.evaluated');
assert.equal(receipt.broadcast_compliance_check_id, 'whatsapp_broadcast_check_001');
assert.equal(receipt.recipient_count, 3);
assert.equal(receipt.eligible_recipient_count, 1);
assert.equal(receipt.blocked_recipient_count, 1);
assert.equal(receipt.review_required_count, 1);
assert.equal(receipt.recipients[0]?.recipient_status, 'ELIGIBLE_FOR_GATEWAY');
assert.equal(receipt.recipients[1]?.recipient_status, 'BLOCKED_GLOBAL_OPT_OUT');
assert.equal(receipt.recipients[2]?.recipient_status, 'REVIEW_REQUIRED');
assert.deepEqual(receipt.adl_refs, ['ADL-004']);
assert.equal(receipt.global_opt_out_required, true);
assert.equal(receipt.outbound_gateway_required, true);
assert.equal(receipt.broadcast_send_allowed, false);
assert.equal(receipt.provider_send_allowed, false);
assert.equal(receipt.credential_material_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const expiredReceipt = evaluateWhatsappBroadcastCompliance({
  ...baseInput,
  broadcast_compliance_check_id: 'whatsapp_broadcast_check_002',
  recipients: [{ ...baseInput.recipients[0]!, outbound_window_state: 'BLOCKED_WINDOW_EXPIRED' }],
});
assert.equal(expiredReceipt.recipients[0]?.recipient_status, 'BLOCKED_WINDOW_EXPIRED');
assert.equal(expiredReceipt.blocked_recipient_count, 1);

assert.throws(() => evaluateWhatsappBroadcastCompliance({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateWhatsappBroadcastCompliance({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateWhatsappBroadcastCompliance({ ...baseInput, broadcast_compliance_check_id: '' }), /broadcast_compliance_check_id is required/);
assert.throws(() => evaluateWhatsappBroadcastCompliance({ ...baseInput, pipeline_stage_model_ref: '' }), /pipeline_stage_model_ref is required/);
assert.throws(() => evaluateWhatsappBroadcastCompliance({ ...baseInput, whatsapp_template_ref: '' }), /whatsapp_template_ref is required/);
assert.throws(() => evaluateWhatsappBroadcastCompliance({ ...baseInput, global_opt_out_registry_ref: '' }), /global_opt_out_registry_ref is required/);
assert.throws(() => evaluateWhatsappBroadcastCompliance({ ...baseInput, outbound_gateway_enforcement_ref: '' }), /outbound_gateway_enforcement_ref is required/);
assert.throws(() => evaluateWhatsappBroadcastCompliance({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateWhatsappBroadcastCompliance({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateWhatsappBroadcastCompliance({ ...baseInput, recipients: [] }), /recipients must contain at least one recipient/);
assert.throws(
  () => evaluateWhatsappBroadcastCompliance({ ...baseInput, recipients: [baseInput.recipients[0]!, baseInput.recipients[0]!] }),
  /recipient_ref values must be unique/,
);
assert.throws(
  () => evaluateWhatsappBroadcastCompliance({ ...baseInput, recipients: [{ ...baseInput.recipients[0]!, opt_out_state: 'BYPASS' as never }] }),
  /opt_out_state is not supported/,
);
assert.throws(
  () => evaluateWhatsappBroadcastCompliance({ ...baseInput, recipients: [{ ...baseInput.recipients[0]!, outbound_window_state: 'SEND_NOW' as never }] }),
  /outbound_window_state is not supported/,
);
assert.throws(
  () => evaluateWhatsappBroadcastCompliance({ ...baseInput, recipients: [{ ...baseInput.recipients[0]!, compliance_evidence_refs: [] }] }),
  /compliance_evidence_refs must contain at least one value/,
);
assert.throws(() => evaluateWhatsappBroadcastCompliance({ ...baseInput, broadcast_send_requested: true }), /must not send broadcasts/);
assert.throws(() => evaluateWhatsappBroadcastCompliance({ ...baseInput, provider_send_requested: true }), /must not perform provider sends/);
assert.throws(() => evaluateWhatsappBroadcastCompliance({ ...baseInput, credential_material_requested: true }), /must not handle credential material/);
assert.throws(() => evaluateWhatsappBroadcastCompliance({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-053 whatsapp broadcast compliance service test passed.');
