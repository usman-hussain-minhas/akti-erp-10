export const PHASE_6B_LIVE_CHAT_INTAKE_SEED_ID = 'seed_6b_04_live_chat_intake' as const;
export const PHASE_6B_LIVE_CHAT_INTAKE_COMPONENT_ID = '6B.04' as const;

export const LIVE_CHAT_INTAKE_EVENT = 'phase_6b.crm_lead_intake.live_chat_intake.recorded' as const;

export type LiveChatOptOutObservation = 'NOT_OBSERVED' | 'OBSERVED_OPTED_OUT' | 'OBSERVED_OPTED_IN';
export type LiveChatChannel = 'WEB_CHAT' | 'MOBILE_CHAT' | 'PORTAL_CHAT' | 'EMBEDDED_CHAT';
export type LiveChatHandoffState = 'AGENT_CAPTURED' | 'QUEUE_CAPTURED' | 'FOLLOW_UP_REQUIRED';

export type LiveChatIntakeInput = {
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
  live_chat_surface_id: string;
  live_chat_session_id: string;
  live_chat_transcript_ref: string;
  operator_user_id: string;
  queue_id: string;
  channel: LiveChatChannel;
  handoff_state: LiveChatHandoffState;
  captured_at: string;
  lead_fields: Record<string, string>;
  transcript_evidence?: Record<string, string>;
  opt_out_observation?: LiveChatOptOutObservation;
  outbound_send_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  credential_material_included?: boolean;
};

export type LiveChatIntakeReceipt = {
  seed_id: typeof PHASE_6B_LIVE_CHAT_INTAKE_SEED_ID;
  component_id: typeof PHASE_6B_LIVE_CHAT_INTAKE_COMPONENT_ID;
  event_name: typeof LIVE_CHAT_INTAKE_EVENT;
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
  source_system: 'LIVE_CHAT_INTAKE';
  live_chat_surface_id: string;
  live_chat_session_id: string;
  live_chat_transcript_ref: string;
  operator_user_id: string;
  queue_id: string;
  channel: LiveChatChannel;
  handoff_state: LiveChatHandoffState;
  captured_at: string;
  normalized_lead_field_count: number;
  normalized_lead_fields: Readonly<Record<string, string>>;
  normalized_transcript_evidence: Readonly<Record<string, string>>;
  opt_out_observation: LiveChatOptOutObservation;
  conditional_opt_out_dependency_observed: boolean;
  outbound_send_allowed: false;
  provider_callback_processing_allowed: false;
};

const CHANNELS: readonly LiveChatChannel[] = ['WEB_CHAT', 'MOBILE_CHAT', 'PORTAL_CHAT', 'EMBEDDED_CHAT'] as const;
const HANDOFF_STATES: readonly LiveChatHandoffState[] = ['AGENT_CAPTURED', 'QUEUE_CAPTURED', 'FOLLOW_UP_REQUIRED'] as const;
const OPT_OUT_OBSERVATIONS: readonly LiveChatOptOutObservation[] = [
  'NOT_OBSERVED',
  'OBSERVED_OPTED_OUT',
  'OBSERVED_OPTED_IN',
] as const;

function requireNonEmpty(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for live chat intake.`);
  }
  return value.trim();
}

function requireCapturedAt(value: string): string {
  const normalized = requireNonEmpty(value, 'captured_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('captured_at must be a valid ISO-compatible timestamp for live chat intake.');
  }
  return normalized;
}

function normalizeChannel(value: LiveChatChannel): LiveChatChannel {
  if (!CHANNELS.includes(value)) {
    throw new Error('channel is not supported for live chat intake.');
  }
  return value;
}

function normalizeHandoffState(value: LiveChatHandoffState): LiveChatHandoffState {
  if (!HANDOFF_STATES.includes(value)) {
    throw new Error('handoff_state is not supported for live chat intake.');
  }
  return value;
}

function normalizeOptOutObservation(value: LiveChatOptOutObservation | undefined): LiveChatOptOutObservation {
  if (value === undefined) {
    return 'NOT_OBSERVED';
  }
  if (!OPT_OUT_OBSERVATIONS.includes(value)) {
    throw new Error('opt_out_observation is not supported for live chat intake.');
  }
  return value;
}

function normalizeStringRecord(fields: Record<string, string> | undefined, label: string, requireValue: boolean): Readonly<Record<string, string>> {
  if (fields === undefined) {
    if (requireValue) {
      throw new Error(`${label} must contain at least one live chat intake field.`);
    }
    return Object.freeze({});
  }
  if (fields === null || typeof fields !== 'object' || Array.isArray(fields)) {
    throw new Error(`${label} must be an object for live chat intake.`);
  }
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    const normalizedKey = requireNonEmpty(key, `${label} key`);
    const normalizedValue = requireNonEmpty(value, `${label}.${normalizedKey}`);
    normalized[normalizedKey] = normalizedValue;
  }
  if (requireValue && Object.keys(normalized).length === 0) {
    throw new Error(`${label} must contain at least one live chat intake field.`);
  }
  return Object.freeze(normalized);
}

export function recordLiveChatIntake(input: LiveChatIntakeInput): LiveChatIntakeReceipt {
  if (input.outbound_send_requested === true) {
    throw new Error('live chat intake must not perform outbound sends.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('live chat intake FFET does not process provider callbacks.');
  }
  if (input.credential_material_included === true) {
    throw new Error('live chat intake must not include credential material.');
  }

  const normalizedLeadFields = normalizeStringRecord(input.lead_fields, 'lead_fields', true);
  const normalizedTranscriptEvidence = normalizeStringRecord(input.transcript_evidence, 'transcript_evidence', false);
  const optOutObservation = normalizeOptOutObservation(input.opt_out_observation);

  return {
    seed_id: PHASE_6B_LIVE_CHAT_INTAKE_SEED_ID,
    component_id: PHASE_6B_LIVE_CHAT_INTAKE_COMPONENT_ID,
    event_name: LIVE_CHAT_INTAKE_EVENT,
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
    source_system: 'LIVE_CHAT_INTAKE',
    live_chat_surface_id: requireNonEmpty(input.live_chat_surface_id, 'live_chat_surface_id'),
    live_chat_session_id: requireNonEmpty(input.live_chat_session_id, 'live_chat_session_id'),
    live_chat_transcript_ref: requireNonEmpty(input.live_chat_transcript_ref, 'live_chat_transcript_ref'),
    operator_user_id: requireNonEmpty(input.operator_user_id, 'operator_user_id'),
    queue_id: requireNonEmpty(input.queue_id, 'queue_id'),
    channel: normalizeChannel(input.channel),
    handoff_state: normalizeHandoffState(input.handoff_state),
    captured_at: requireCapturedAt(input.captured_at),
    normalized_lead_field_count: Object.keys(normalizedLeadFields).length,
    normalized_lead_fields: normalizedLeadFields,
    normalized_transcript_evidence: normalizedTranscriptEvidence,
    opt_out_observation: optOutObservation,
    conditional_opt_out_dependency_observed: optOutObservation !== 'NOT_OBSERVED',
    outbound_send_allowed: false,
    provider_callback_processing_allowed: false,
  };
}
