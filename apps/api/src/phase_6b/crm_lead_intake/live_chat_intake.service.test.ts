import assert from 'node:assert/strict';
import { recordLiveChatIntake, type LiveChatIntakeInput } from './live_chat_intake.service';

const baseInput: LiveChatIntakeInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_lead_intake',
  lead_record_id: 'lead_record_live_chat_001',
  person_identity_graph_id: 'person_graph_live_chat_001',
  access_gatekeeper_decision_id: 'gatekeeper_allow_live_chat_001',
  visual_workflow_definition_id: 'workflow_live_chat_intake',
  product_record_authority_id: 'product_authority_001',
  intake_mapping_id: 'mapping_live_chat_to_lead',
  consent_basis_id: 'consent_basis_live_chat_capture',
  assignment_state_id: 'assignment_state_new',
  live_chat_surface_id: 'web_chat_admissions_001',
  live_chat_session_id: 'live_chat_session_001',
  live_chat_transcript_ref: 'live_chat_transcript_001',
  operator_user_id: 'user_live_chat_agent_001',
  queue_id: 'queue_admissions_chat',
  channel: 'WEB_CHAT',
  handoff_state: 'AGENT_CAPTURED',
  captured_at: '2026-06-08T12:40:00.000Z',
  lead_fields: {
    full_name: 'Live Chat Student Six',
    phone: '+923339999999',
    program_interest: 'Admissions',
  },
  transcript_evidence: {
    transcript_excerpt_ref: 'transcript_excerpt_001',
    operator_note: 'asked for morning classes',
  },
};

const receipt = recordLiveChatIntake(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_04_live_chat_intake');
assert.equal(receipt.component_id, '6B.04');
assert.equal(receipt.event_name, 'phase_6b.crm_lead_intake.live_chat_intake.recorded');
assert.equal(receipt.source_system, 'LIVE_CHAT_INTAKE');
assert.equal(receipt.live_chat_surface_id, 'web_chat_admissions_001');
assert.equal(receipt.live_chat_session_id, 'live_chat_session_001');
assert.equal(receipt.live_chat_transcript_ref, 'live_chat_transcript_001');
assert.equal(receipt.operator_user_id, 'user_live_chat_agent_001');
assert.equal(receipt.queue_id, 'queue_admissions_chat');
assert.equal(receipt.channel, 'WEB_CHAT');
assert.equal(receipt.handoff_state, 'AGENT_CAPTURED');
assert.equal(receipt.normalized_lead_field_count, 3);
assert.deepEqual(receipt.normalized_lead_fields, {
  full_name: 'Live Chat Student Six',
  phone: '+923339999999',
  program_interest: 'Admissions',
});
assert.deepEqual(receipt.normalized_transcript_evidence, {
  transcript_excerpt_ref: 'transcript_excerpt_001',
  operator_note: 'asked for morning classes',
});
assert.equal(receipt.opt_out_observation, 'NOT_OBSERVED');
assert.equal(receipt.conditional_opt_out_dependency_observed, false);
assert.equal(receipt.outbound_send_allowed, false);
assert.equal(receipt.provider_callback_processing_allowed, false);

const optedOut = recordLiveChatIntake({ ...baseInput, opt_out_observation: 'OBSERVED_OPTED_OUT' });
assert.equal(optedOut.conditional_opt_out_dependency_observed, true);

const queuedNoEvidence = recordLiveChatIntake({
  ...baseInput,
  live_chat_session_id: 'live_chat_session_002',
  channel: 'PORTAL_CHAT',
  handoff_state: 'QUEUE_CAPTURED',
  transcript_evidence: undefined,
});
assert.equal(queuedNoEvidence.channel, 'PORTAL_CHAT');
assert.equal(queuedNoEvidence.handoff_state, 'QUEUE_CAPTURED');
assert.deepEqual(queuedNoEvidence.normalized_transcript_evidence, {});

assert.throws(() => recordLiveChatIntake({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => recordLiveChatIntake({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => recordLiveChatIntake({ ...baseInput, lead_record_id: '' }), /lead_record_id is required/);
assert.throws(() => recordLiveChatIntake({ ...baseInput, person_identity_graph_id: '' }), /person_identity_graph_id is required/);
assert.throws(() => recordLiveChatIntake({ ...baseInput, access_gatekeeper_decision_id: '' }), /access_gatekeeper_decision_id is required/);
assert.throws(() => recordLiveChatIntake({ ...baseInput, visual_workflow_definition_id: '' }), /visual_workflow_definition_id is required/);
assert.throws(() => recordLiveChatIntake({ ...baseInput, live_chat_surface_id: '' }), /live_chat_surface_id is required/);
assert.throws(() => recordLiveChatIntake({ ...baseInput, live_chat_session_id: '' }), /live_chat_session_id is required/);
assert.throws(() => recordLiveChatIntake({ ...baseInput, live_chat_transcript_ref: '' }), /live_chat_transcript_ref is required/);
assert.throws(() => recordLiveChatIntake({ ...baseInput, operator_user_id: '' }), /operator_user_id is required/);
assert.throws(() => recordLiveChatIntake({ ...baseInput, queue_id: '' }), /queue_id is required/);
assert.throws(() => recordLiveChatIntake({ ...baseInput, captured_at: 'not-a-date' }), /captured_at must be a valid ISO-compatible timestamp/);
assert.throws(() => recordLiveChatIntake({ ...baseInput, channel: 'VOICE_CHAT' as never }), /channel is not supported/);
assert.throws(() => recordLiveChatIntake({ ...baseInput, handoff_state: 'AUTO_APPROVED' as never }), /handoff_state is not supported/);
assert.throws(() => recordLiveChatIntake({ ...baseInput, lead_fields: {} }), /lead_fields must contain at least one live chat intake field/);
assert.throws(() => recordLiveChatIntake({ ...baseInput, lead_fields: { ' ': 'value' } }), /lead_fields key is required/);
assert.throws(() => recordLiveChatIntake({ ...baseInput, lead_fields: { full_name: ' ' } }), /lead_fields.full_name is required/);
assert.throws(() => recordLiveChatIntake({ ...baseInput, transcript_evidence: { ' ': 'value' } }), /transcript_evidence key is required/);
assert.throws(() => recordLiveChatIntake({ ...baseInput, transcript_evidence: { operator_note: ' ' } }), /transcript_evidence.operator_note is required/);
assert.throws(() => recordLiveChatIntake({ ...baseInput, outbound_send_requested: true }), /must not perform outbound sends/);
assert.throws(() => recordLiveChatIntake({ ...baseInput, provider_callback_processing_requested: true }), /does not process provider callbacks/);
assert.throws(() => recordLiveChatIntake({ ...baseInput, credential_material_included: true }), /must not include credential material/);
assert.throws(() => recordLiveChatIntake({ ...baseInput, opt_out_observation: 'SEND_ALLOWED' as never }), /opt_out_observation is not supported/);

console.log('P6B-FFET-037 live chat intake service test passed.');
