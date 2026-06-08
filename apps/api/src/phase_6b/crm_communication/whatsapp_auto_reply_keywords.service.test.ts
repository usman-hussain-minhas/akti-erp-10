import assert from 'node:assert/strict';
import { evaluateWhatsappAutoReplyKeywords, type WhatsappAutoReplyKeywordsInput } from './whatsapp_auto_reply_keywords.service';

const baseInput: WhatsappAutoReplyKeywordsInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_crm_communication',
  auto_reply_evaluation_id: 'auto_reply_eval_001',
  inbound_message_id: 'whatsapp_inbound_001',
  conversation_ref: 'whatsapp_conversation_001',
  lead_record_authority_id: 'lead_authority_001',
  pipeline_stage_model_ref: 'pipeline_stage_model_001',
  inbound_message_body: 'Pricing please',
  opt_out_state: 'NOT_OPTED_OUT',
  global_opt_out_registry_ref: 'global_opt_out_registry_reference',
  outbound_gateway_enforcement_ref: 'outbound_gateway_enforcement_001',
  evaluated_at: '2026-06-08T19:20:00.000Z',
  keyword_rules: [
    {
      keyword_rule_id: 'keyword_rule_later',
      keyword: 'pricing',
      match_type: 'CONTAINS',
      response_template_ref: 'whatsapp_template_pricing_details',
      priority: 20,
      active: true,
    },
    {
      keyword_rule_id: 'keyword_rule_first',
      keyword: 'pricing please',
      match_type: 'EXACT',
      response_template_ref: 'whatsapp_template_pricing_summary',
      priority: 10,
      active: true,
    },
  ],
};

const receipt = evaluateWhatsappAutoReplyKeywords(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_07_whatsapp_auto_reply_keywords');
assert.equal(receipt.component_id, '6B.07');
assert.equal(receipt.event_name, 'phase_6b.crm_communication.whatsapp_auto_reply_keywords.evaluated');
assert.equal(receipt.normalized_inbound_body, 'pricing please');
assert.equal(receipt.evaluated_rule_count, 2);
assert.equal(receipt.matched_keyword_rule_id, 'keyword_rule_first');
assert.equal(receipt.response_template_ref, 'whatsapp_template_pricing_summary');
assert.equal(receipt.candidate_status, 'REPLY_CANDIDATE_READY_FOR_GATEWAY');
assert.deepEqual(receipt.adl_refs, ['ADL-004']);
assert.equal(receipt.global_opt_out_required, true);
assert.equal(receipt.outbound_gateway_required, true);
assert.equal(receipt.outbound_send_allowed, false);
assert.equal(receipt.provider_send_allowed, false);
assert.equal(receipt.credential_material_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const noMatchReceipt = evaluateWhatsappAutoReplyKeywords({
  ...baseInput,
  auto_reply_evaluation_id: 'auto_reply_eval_002',
  inbound_message_body: 'Different request',
});
assert.equal(noMatchReceipt.candidate_status, 'NO_KEYWORD_MATCH');
assert.equal(noMatchReceipt.matched_keyword_rule_id, undefined);
assert.equal(noMatchReceipt.response_template_ref, undefined);

const optedOutReceipt = evaluateWhatsappAutoReplyKeywords({
  ...baseInput,
  auto_reply_evaluation_id: 'auto_reply_eval_003',
  opt_out_state: 'OPTED_OUT',
});
assert.equal(optedOutReceipt.candidate_status, 'BLOCKED_GLOBAL_OPT_OUT');

const reviewReceipt = evaluateWhatsappAutoReplyKeywords({
  ...baseInput,
  auto_reply_evaluation_id: 'auto_reply_eval_004',
  opt_out_state: 'UNKNOWN_REQUIRES_REVIEW',
});
assert.equal(reviewReceipt.candidate_status, 'REVIEW_REQUIRED');

assert.throws(() => evaluateWhatsappAutoReplyKeywords({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateWhatsappAutoReplyKeywords({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateWhatsappAutoReplyKeywords({ ...baseInput, auto_reply_evaluation_id: '' }), /auto_reply_evaluation_id is required/);
assert.throws(() => evaluateWhatsappAutoReplyKeywords({ ...baseInput, inbound_message_id: '' }), /inbound_message_id is required/);
assert.throws(() => evaluateWhatsappAutoReplyKeywords({ ...baseInput, conversation_ref: '' }), /conversation_ref is required/);
assert.throws(() => evaluateWhatsappAutoReplyKeywords({ ...baseInput, lead_record_authority_id: '' }), /lead_record_authority_id is required/);
assert.throws(() => evaluateWhatsappAutoReplyKeywords({ ...baseInput, pipeline_stage_model_ref: '' }), /pipeline_stage_model_ref is required/);
assert.throws(() => evaluateWhatsappAutoReplyKeywords({ ...baseInput, inbound_message_body: '' }), /inbound_message_body is required/);
assert.throws(() => evaluateWhatsappAutoReplyKeywords({ ...baseInput, opt_out_state: 'BYPASS' as never }), /opt_out_state is not supported/);
assert.throws(() => evaluateWhatsappAutoReplyKeywords({ ...baseInput, global_opt_out_registry_ref: '' }), /global_opt_out_registry_ref is required/);
assert.throws(() => evaluateWhatsappAutoReplyKeywords({ ...baseInput, outbound_gateway_enforcement_ref: '' }), /outbound_gateway_enforcement_ref is required/);
assert.throws(() => evaluateWhatsappAutoReplyKeywords({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateWhatsappAutoReplyKeywords({ ...baseInput, keyword_rules: [] }), /keyword_rules must contain at least one rule/);
assert.throws(
  () => evaluateWhatsappAutoReplyKeywords({ ...baseInput, keyword_rules: [baseInput.keyword_rules[0]!, baseInput.keyword_rules[0]!] }),
  /keyword_rule_id values must be unique/,
);
assert.throws(
  () => evaluateWhatsappAutoReplyKeywords({ ...baseInput, keyword_rules: [{ ...baseInput.keyword_rules[0]!, match_type: 'REGEX' as never }] }),
  /match_type is not supported/,
);
assert.throws(
  () => evaluateWhatsappAutoReplyKeywords({ ...baseInput, keyword_rules: [{ ...baseInput.keyword_rules[0]!, priority: 0 }] }),
  /priority must be a positive integer/,
);
assert.throws(() => evaluateWhatsappAutoReplyKeywords({ ...baseInput, outbound_send_requested: true }), /must not send outbound messages/);
assert.throws(() => evaluateWhatsappAutoReplyKeywords({ ...baseInput, provider_send_requested: true }), /must not perform provider sends/);
assert.throws(() => evaluateWhatsappAutoReplyKeywords({ ...baseInput, credential_material_requested: true }), /must not handle credential material/);
assert.throws(() => evaluateWhatsappAutoReplyKeywords({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-054 whatsapp auto reply keywords service test passed.');
