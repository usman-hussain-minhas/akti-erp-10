import assert from 'node:assert/strict';
import { recordChatbotIntake, type ChatbotIntakeInput } from './chatbot_intake.service';

const baseInput: ChatbotIntakeInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_lead_intake',
  lead_record_id: 'lead_record_chatbot_001',
  person_identity_graph_id: 'person_graph_chatbot_001',
  access_gatekeeper_decision_id: 'gatekeeper_allow_chatbot_001',
  visual_workflow_definition_id: 'workflow_chatbot_intake',
  product_record_authority_id: 'product_authority_001',
  intake_mapping_id: 'mapping_chatbot_to_lead',
  consent_basis_id: 'consent_basis_chatbot_capture',
  assignment_state_id: 'assignment_state_new',
  chatbot_surface_id: 'web_widget_admissions_001',
  chatbot_session_id: 'chatbot_session_001',
  chatbot_conversation_ref: 'chatbot_conversation_001',
  chatbot_flow_id: 'chatbot_flow_admissions_qualification',
  channel: 'WEB_WIDGET',
  handoff_state: 'HUMAN_HANDOFF_REQUESTED',
  captured_at: '2026-06-08T12:00:00.000Z',
  lead_fields: {
    full_name: 'Chatbot Student Six',
    phone: '+923338888888',
    program_interest: 'Admissions',
  },
  conversation_evidence: {
    last_prompt_id: 'program_interest_prompt',
    handoff_reason: 'requested_counsellor_call',
  },
};

const receipt = recordChatbotIntake(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_04_chatbot_intake');
assert.equal(receipt.component_id, '6B.04');
assert.equal(receipt.event_name, 'phase_6b.crm_lead_intake.chatbot_intake.recorded');
assert.equal(receipt.source_system, 'CHATBOT_INTAKE');
assert.equal(receipt.chatbot_surface_id, 'web_widget_admissions_001');
assert.equal(receipt.chatbot_session_id, 'chatbot_session_001');
assert.equal(receipt.chatbot_conversation_ref, 'chatbot_conversation_001');
assert.equal(receipt.chatbot_flow_id, 'chatbot_flow_admissions_qualification');
assert.equal(receipt.channel, 'WEB_WIDGET');
assert.equal(receipt.handoff_state, 'HUMAN_HANDOFF_REQUESTED');
assert.equal(receipt.normalized_lead_field_count, 3);
assert.deepEqual(receipt.normalized_lead_fields, {
  full_name: 'Chatbot Student Six',
  phone: '+923338888888',
  program_interest: 'Admissions',
});
assert.deepEqual(receipt.normalized_conversation_evidence, {
  last_prompt_id: 'program_interest_prompt',
  handoff_reason: 'requested_counsellor_call',
});
assert.equal(receipt.opt_out_observation, 'NOT_OBSERVED');
assert.equal(receipt.conditional_opt_out_dependency_observed, false);
assert.equal(receipt.outbound_send_allowed, false);
assert.equal(receipt.provider_callback_processing_allowed, false);
assert.equal(receipt.runtime_ai_decision_allowed, false);

const optedOut = recordChatbotIntake({ ...baseInput, opt_out_observation: 'OBSERVED_OPTED_OUT' });
assert.equal(optedOut.conditional_opt_out_dependency_observed, true);

const mobileNoEvidence = recordChatbotIntake({
  ...baseInput,
  chatbot_session_id: 'chatbot_session_002',
  channel: 'MOBILE_WIDGET',
  handoff_state: 'SELF_SERVE_CAPTURED',
  conversation_evidence: undefined,
});
assert.equal(mobileNoEvidence.channel, 'MOBILE_WIDGET');
assert.equal(mobileNoEvidence.handoff_state, 'SELF_SERVE_CAPTURED');
assert.deepEqual(mobileNoEvidence.normalized_conversation_evidence, {});

assert.throws(() => recordChatbotIntake({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => recordChatbotIntake({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => recordChatbotIntake({ ...baseInput, lead_record_id: '' }), /lead_record_id is required/);
assert.throws(() => recordChatbotIntake({ ...baseInput, person_identity_graph_id: '' }), /person_identity_graph_id is required/);
assert.throws(() => recordChatbotIntake({ ...baseInput, access_gatekeeper_decision_id: '' }), /access_gatekeeper_decision_id is required/);
assert.throws(() => recordChatbotIntake({ ...baseInput, visual_workflow_definition_id: '' }), /visual_workflow_definition_id is required/);
assert.throws(() => recordChatbotIntake({ ...baseInput, chatbot_surface_id: '' }), /chatbot_surface_id is required/);
assert.throws(() => recordChatbotIntake({ ...baseInput, chatbot_session_id: '' }), /chatbot_session_id is required/);
assert.throws(() => recordChatbotIntake({ ...baseInput, chatbot_conversation_ref: '' }), /chatbot_conversation_ref is required/);
assert.throws(() => recordChatbotIntake({ ...baseInput, chatbot_flow_id: '' }), /chatbot_flow_id is required/);
assert.throws(() => recordChatbotIntake({ ...baseInput, captured_at: 'not-a-date' }), /captured_at must be a valid ISO-compatible timestamp/);
assert.throws(() => recordChatbotIntake({ ...baseInput, channel: 'VOICE_BOT' as never }), /channel is not supported/);
assert.throws(() => recordChatbotIntake({ ...baseInput, handoff_state: 'AUTO_APPROVED' as never }), /handoff_state is not supported/);
assert.throws(() => recordChatbotIntake({ ...baseInput, lead_fields: {} }), /lead_fields must contain at least one chatbot intake field/);
assert.throws(() => recordChatbotIntake({ ...baseInput, lead_fields: { ' ': 'value' } }), /lead_fields key is required/);
assert.throws(() => recordChatbotIntake({ ...baseInput, lead_fields: { full_name: ' ' } }), /lead_fields.full_name is required/);
assert.throws(() => recordChatbotIntake({ ...baseInput, conversation_evidence: { ' ': 'value' } }), /conversation_evidence key is required/);
assert.throws(() => recordChatbotIntake({ ...baseInput, conversation_evidence: { handoff_reason: ' ' } }), /conversation_evidence.handoff_reason is required/);
assert.throws(() => recordChatbotIntake({ ...baseInput, outbound_send_requested: true }), /must not perform outbound sends/);
assert.throws(() => recordChatbotIntake({ ...baseInput, provider_callback_processing_requested: true }), /does not process provider callbacks/);
assert.throws(() => recordChatbotIntake({ ...baseInput, credential_material_included: true }), /must not include credential material/);
assert.throws(() => recordChatbotIntake({ ...baseInput, runtime_ai_decision_requested: true }), /must not make runtime AI decisions/);
assert.throws(() => recordChatbotIntake({ ...baseInput, opt_out_observation: 'SEND_ALLOWED' as never }), /opt_out_observation is not supported/);

console.log('P6B-FFET-036 chatbot intake service test passed.');
