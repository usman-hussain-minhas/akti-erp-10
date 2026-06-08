export const PHASE_6B_INBOUND_WHATSAPP_INTAKE_SEED_ID = 'seed_6b_04_inbound_whatsapp_intake' as const;
export const PHASE_6B_INBOUND_WHATSAPP_INTAKE_COMPONENT_ID = '6B.04' as const;

export const INBOUND_WHATSAPP_INTAKE_EVENT = 'phase_6b.crm_lead_intake.inbound_whatsapp_intake.recorded' as const;

export type InboundWhatsappOptOutObservation = 'NOT_OBSERVED' | 'OBSERVED_OPTED_OUT' | 'OBSERVED_OPTED_IN';
export type InboundWhatsappMessageType = 'TEXT' | 'MEDIA' | 'INTERACTIVE' | 'UNKNOWN';

export type InboundWhatsappIntakeInput = {
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
  inbound_channel_id: string;
  whatsapp_sender_ref: string;
  whatsapp_conversation_ref: string;
  inbound_message_ref: string;
  message_type: InboundWhatsappMessageType;
  received_at: string;
  lead_fields: Record<string, string>;
  source_metadata?: Record<string, string>;
  opt_out_observation?: InboundWhatsappOptOutObservation;
  outbound_send_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  credential_material_included?: boolean;
};

export type InboundWhatsappIntakeReceipt = {
  seed_id: typeof PHASE_6B_INBOUND_WHATSAPP_INTAKE_SEED_ID;
  component_id: typeof PHASE_6B_INBOUND_WHATSAPP_INTAKE_COMPONENT_ID;
  event_name: typeof INBOUND_WHATSAPP_INTAKE_EVENT;
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
  source_system: 'INBOUND_WHATSAPP_INTAKE';
  inbound_channel_id: string;
  whatsapp_sender_ref: string;
  whatsapp_conversation_ref: string;
  inbound_message_ref: string;
  message_type: InboundWhatsappMessageType;
  received_at: string;
  normalized_lead_field_count: number;
  normalized_lead_fields: Readonly<Record<string, string>>;
  normalized_source_metadata: Readonly<Record<string, string>>;
  opt_out_observation: InboundWhatsappOptOutObservation;
  conditional_opt_out_dependency_observed: boolean;
  outbound_send_allowed: false;
  provider_callback_processing_allowed: false;
};

const MESSAGE_TYPES: readonly InboundWhatsappMessageType[] = ['TEXT', 'MEDIA', 'INTERACTIVE', 'UNKNOWN'] as const;
const OPT_OUT_OBSERVATIONS: readonly InboundWhatsappOptOutObservation[] = [
  'NOT_OBSERVED',
  'OBSERVED_OPTED_OUT',
  'OBSERVED_OPTED_IN',
] as const;

function requireNonEmpty(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for inbound WhatsApp intake.`);
  }
  return value.trim();
}

function requireReceivedAt(value: string): string {
  const normalized = requireNonEmpty(value, 'received_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('received_at must be a valid ISO-compatible timestamp for inbound WhatsApp intake.');
  }
  return normalized;
}

function normalizeMessageType(value: InboundWhatsappMessageType): InboundWhatsappMessageType {
  if (!MESSAGE_TYPES.includes(value)) {
    throw new Error('message_type is not supported for inbound WhatsApp intake.');
  }
  return value;
}

function normalizeOptOutObservation(value: InboundWhatsappOptOutObservation | undefined): InboundWhatsappOptOutObservation {
  if (value === undefined) {
    return 'NOT_OBSERVED';
  }
  if (!OPT_OUT_OBSERVATIONS.includes(value)) {
    throw new Error('opt_out_observation is not supported for inbound WhatsApp intake.');
  }
  return value;
}

function normalizeStringRecord(fields: Record<string, string> | undefined, label: string, requireValue: boolean): Readonly<Record<string, string>> {
  if (fields === undefined) {
    if (requireValue) {
      throw new Error(`${label} must contain at least one inbound WhatsApp intake field.`);
    }
    return Object.freeze({});
  }
  if (fields === null || typeof fields !== 'object' || Array.isArray(fields)) {
    throw new Error(`${label} must be an object for inbound WhatsApp intake.`);
  }
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    const normalizedKey = requireNonEmpty(key, `${label} key`);
    const normalizedValue = requireNonEmpty(value, `${label}.${normalizedKey}`);
    normalized[normalizedKey] = normalizedValue;
  }
  if (requireValue && Object.keys(normalized).length === 0) {
    throw new Error(`${label} must contain at least one inbound WhatsApp intake field.`);
  }
  return Object.freeze(normalized);
}

export function recordInboundWhatsappIntake(input: InboundWhatsappIntakeInput): InboundWhatsappIntakeReceipt {
  if (input.outbound_send_requested === true) {
    throw new Error('inbound WhatsApp intake must not perform outbound sends.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('inbound WhatsApp intake FFET does not process provider callbacks.');
  }
  if (input.credential_material_included === true) {
    throw new Error('inbound WhatsApp intake must not include credential material.');
  }

  const normalizedLeadFields = normalizeStringRecord(input.lead_fields, 'lead_fields', true);
  const normalizedSourceMetadata = normalizeStringRecord(input.source_metadata, 'source_metadata', false);
  const optOutObservation = normalizeOptOutObservation(input.opt_out_observation);

  return {
    seed_id: PHASE_6B_INBOUND_WHATSAPP_INTAKE_SEED_ID,
    component_id: PHASE_6B_INBOUND_WHATSAPP_INTAKE_COMPONENT_ID,
    event_name: INBOUND_WHATSAPP_INTAKE_EVENT,
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
    source_system: 'INBOUND_WHATSAPP_INTAKE',
    inbound_channel_id: requireNonEmpty(input.inbound_channel_id, 'inbound_channel_id'),
    whatsapp_sender_ref: requireNonEmpty(input.whatsapp_sender_ref, 'whatsapp_sender_ref'),
    whatsapp_conversation_ref: requireNonEmpty(input.whatsapp_conversation_ref, 'whatsapp_conversation_ref'),
    inbound_message_ref: requireNonEmpty(input.inbound_message_ref, 'inbound_message_ref'),
    message_type: normalizeMessageType(input.message_type),
    received_at: requireReceivedAt(input.received_at),
    normalized_lead_field_count: Object.keys(normalizedLeadFields).length,
    normalized_lead_fields: normalizedLeadFields,
    normalized_source_metadata: normalizedSourceMetadata,
    opt_out_observation: optOutObservation,
    conditional_opt_out_dependency_observed: optOutObservation !== 'NOT_OBSERVED',
    outbound_send_allowed: false,
    provider_callback_processing_allowed: false,
  };
}
