export const PHASE_6B_CHATBOT_INTAKE_SEED_ID = 'seed_6b_04_chatbot_intake' as const;
export const PHASE_6B_CHATBOT_INTAKE_COMPONENT_ID = '6B.04' as const;

export const CHATBOT_INTAKE_EVENT = 'phase_6b.crm_lead_intake.chatbot_intake.recorded' as const;

export type ChatbotOptOutObservation = 'NOT_OBSERVED' | 'OBSERVED_OPTED_OUT' | 'OBSERVED_OPTED_IN';
export type ChatbotChannel = 'WEB_WIDGET' | 'MOBILE_WIDGET' | 'MESSAGING_WIDGET' | 'KIOSK_WIDGET';
export type ChatbotHandoffState = 'SELF_SERVE_CAPTURED' | 'HUMAN_HANDOFF_REQUESTED' | 'QUALIFICATION_INCOMPLETE';

export type ChatbotIntakeInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  lead_record_id: string;
  person_identity_graph_id: string;
  access_gatekeeper_decision_id: string;
  visual_workflow_definition_id: string;
  product_record_authority_id: string;
  intake_mapping_id: string;
  consent_basis_id: string;
  assignment_state_id: string;
  chatbot_surface_id: string;
  chatbot_session_id: string;
  chatbot_conversation_ref: string;
  chatbot_flow_id: string;
  channel: ChatbotChannel;
  handoff_state: ChatbotHandoffState;
  captured_at: string;
  lead_fields: Record<string, string>;
  conversation_evidence?: Record<string, string>;
  opt_out_observation?: ChatbotOptOutObservation;
  outbound_send_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  credential_material_included?: boolean;
  runtime_ai_decision_requested?: boolean;
};

export type ChatbotIntakeReceipt = {
  seed_id: typeof PHASE_6B_CHATBOT_INTAKE_SEED_ID;
  component_id: typeof PHASE_6B_CHATBOT_INTAKE_COMPONENT_ID;
  event_name: typeof CHATBOT_INTAKE_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  lead_record_id: string;
  person_identity_graph_id: string;
  access_gatekeeper_decision_id: string;
  visual_workflow_definition_id: string;
  product_record_authority_id: string;
  intake_mapping_id: string;
  consent_basis_id: string;
  assignment_state_id: string;
  source_system: 'CHATBOT_INTAKE';
  chatbot_surface_id: string;
  chatbot_session_id: string;
  chatbot_conversation_ref: string;
  chatbot_flow_id: string;
  channel: ChatbotChannel;
  handoff_state: ChatbotHandoffState;
  captured_at: string;
  normalized_lead_field_count: number;
  normalized_lead_fields: Readonly<Record<string, string>>;
  normalized_conversation_evidence: Readonly<Record<string, string>>;
  opt_out_observation: ChatbotOptOutObservation;
  conditional_opt_out_dependency_observed: boolean;
  outbound_send_allowed: false;
  provider_callback_processing_allowed: false;
  runtime_ai_decision_allowed: false;
};

const CHANNELS: readonly ChatbotChannel[] = ['WEB_WIDGET', 'MOBILE_WIDGET', 'MESSAGING_WIDGET', 'KIOSK_WIDGET'] as const;
const HANDOFF_STATES: readonly ChatbotHandoffState[] = [
  'SELF_SERVE_CAPTURED',
  'HUMAN_HANDOFF_REQUESTED',
  'QUALIFICATION_INCOMPLETE',
] as const;
const OPT_OUT_OBSERVATIONS: readonly ChatbotOptOutObservation[] = [
  'NOT_OBSERVED',
  'OBSERVED_OPTED_OUT',
  'OBSERVED_OPTED_IN',
] as const;

function requireNonEmpty(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for chatbot intake.`);
  }
  return value.trim();
}

function requireCapturedAt(value: string): string {
  const normalized = requireNonEmpty(value, 'captured_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('captured_at must be a valid ISO-compatible timestamp for chatbot intake.');
  }
  return normalized;
}

function normalizeChannel(value: ChatbotChannel): ChatbotChannel {
  if (!CHANNELS.includes(value)) {
    throw new Error('channel is not supported for chatbot intake.');
  }
  return value;
}

function normalizeHandoffState(value: ChatbotHandoffState): ChatbotHandoffState {
  if (!HANDOFF_STATES.includes(value)) {
    throw new Error('handoff_state is not supported for chatbot intake.');
  }
  return value;
}

function normalizeOptOutObservation(value: ChatbotOptOutObservation | undefined): ChatbotOptOutObservation {
  if (value === undefined) {
    return 'NOT_OBSERVED';
  }
  if (!OPT_OUT_OBSERVATIONS.includes(value)) {
    throw new Error('opt_out_observation is not supported for chatbot intake.');
  }
  return value;
}

function normalizeStringRecord(fields: Record<string, string> | undefined, label: string, requireValue: boolean): Readonly<Record<string, string>> {
  if (fields === undefined) {
    if (requireValue) {
      throw new Error(`${label} must contain at least one chatbot intake field.`);
    }
    return Object.freeze({});
  }
  if (fields === null || typeof fields !== 'object' || Array.isArray(fields)) {
    throw new Error(`${label} must be an object for chatbot intake.`);
  }
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    const normalizedKey = requireNonEmpty(key, `${label} key`);
    const normalizedValue = requireNonEmpty(value, `${label}.${normalizedKey}`);
    normalized[normalizedKey] = normalizedValue;
  }
  if (requireValue && Object.keys(normalized).length === 0) {
    throw new Error(`${label} must contain at least one chatbot intake field.`);
  }
  return Object.freeze(normalized);
}

export function recordChatbotIntake(input: ChatbotIntakeInput): ChatbotIntakeReceipt {
  if (input.outbound_send_requested === true) {
    throw new Error('chatbot intake must not perform outbound sends.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('chatbot intake FFET does not process provider callbacks.');
  }
  if (input.credential_material_included === true) {
    throw new Error('chatbot intake must not include credential material.');
  }
  if (input.runtime_ai_decision_requested === true) {
    throw new Error('chatbot intake FFET records intake evidence and must not make runtime AI decisions.');
  }

  const normalizedLeadFields = normalizeStringRecord(input.lead_fields, 'lead_fields', true);
  const normalizedConversationEvidence = normalizeStringRecord(input.conversation_evidence, 'conversation_evidence', false);
  const optOutObservation = normalizeOptOutObservation(input.opt_out_observation);

  return {
    seed_id: PHASE_6B_CHATBOT_INTAKE_SEED_ID,
    component_id: PHASE_6B_CHATBOT_INTAKE_COMPONENT_ID,
    event_name: CHATBOT_INTAKE_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    lead_record_id: requireNonEmpty(input.lead_record_id, 'lead_record_id'),
    person_identity_graph_id: requireNonEmpty(input.person_identity_graph_id, 'person_identity_graph_id'),
    access_gatekeeper_decision_id: requireNonEmpty(input.access_gatekeeper_decision_id, 'access_gatekeeper_decision_id'),
    visual_workflow_definition_id: requireNonEmpty(input.visual_workflow_definition_id, 'visual_workflow_definition_id'),
    product_record_authority_id: requireNonEmpty(input.product_record_authority_id, 'product_record_authority_id'),
    intake_mapping_id: requireNonEmpty(input.intake_mapping_id, 'intake_mapping_id'),
    consent_basis_id: requireNonEmpty(input.consent_basis_id, 'consent_basis_id'),
    assignment_state_id: requireNonEmpty(input.assignment_state_id, 'assignment_state_id'),
    source_system: 'CHATBOT_INTAKE',
    chatbot_surface_id: requireNonEmpty(input.chatbot_surface_id, 'chatbot_surface_id'),
    chatbot_session_id: requireNonEmpty(input.chatbot_session_id, 'chatbot_session_id'),
    chatbot_conversation_ref: requireNonEmpty(input.chatbot_conversation_ref, 'chatbot_conversation_ref'),
    chatbot_flow_id: requireNonEmpty(input.chatbot_flow_id, 'chatbot_flow_id'),
    channel: normalizeChannel(input.channel),
    handoff_state: normalizeHandoffState(input.handoff_state),
    captured_at: requireCapturedAt(input.captured_at),
    normalized_lead_field_count: Object.keys(normalizedLeadFields).length,
    normalized_lead_fields: normalizedLeadFields,
    normalized_conversation_evidence: normalizedConversationEvidence,
    opt_out_observation: optOutObservation,
    conditional_opt_out_dependency_observed: optOutObservation !== 'NOT_OBSERVED',
    outbound_send_allowed: false,
    provider_callback_processing_allowed: false,
    runtime_ai_decision_allowed: false,
  };
}
