export const PHASE_6B_META_WHATSAPP_INTAKE_CONNECTOR_SEED_ID = 'seed_6b_04_meta_whatsapp_intake_connector' as const;
export const PHASE_6B_META_WHATSAPP_INTAKE_CONNECTOR_COMPONENT_ID = '6B.04' as const;

export const META_WHATSAPP_INTAKE_CONNECTOR_EVENT = 'phase_6b.crm_lead_intake.meta_whatsapp_intake_connector.intake_recorded' as const;

export type LeadOptOutObservation = 'NOT_OBSERVED' | 'OBSERVED_OPTED_OUT' | 'OBSERVED_OPTED_IN';

export type MetaWhatsAppIntakeConnectorInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  lead_record_id: string;
  person_identity_graph_id: string;
  access_gatekeeper_decision_id: string;
  api_key_scope_registry_id: string;
  visual_workflow_definition_id: string;
  product_record_authority_id: string;
  intake_mapping_id: string;
  consent_basis_id: string;
  assignment_state_id: string;
  whatsapp_business_account_id: string;
  whatsapp_phone_number_id: string;
  inbound_message_id: string;
  sender_contact_ref: string;
  received_at: string;
  inbound_payload_fields: Record<string, string>;
  opt_out_observation?: LeadOptOutObservation;
  outbound_message_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  credential_material_included?: boolean;
};

export type MetaWhatsAppIntakeConnectorReceipt = {
  seed_id: typeof PHASE_6B_META_WHATSAPP_INTAKE_CONNECTOR_SEED_ID;
  component_id: typeof PHASE_6B_META_WHATSAPP_INTAKE_CONNECTOR_COMPONENT_ID;
  event_name: typeof META_WHATSAPP_INTAKE_CONNECTOR_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  lead_record_id: string;
  person_identity_graph_id: string;
  access_gatekeeper_decision_id: string;
  api_key_scope_registry_id: string;
  visual_workflow_definition_id: string;
  product_record_authority_id: string;
  intake_mapping_id: string;
  consent_basis_id: string;
  assignment_state_id: string;
  source_system: 'META_WHATSAPP_INTAKE';
  whatsapp_business_account_id: string;
  whatsapp_phone_number_id: string;
  inbound_message_id: string;
  sender_contact_ref: string;
  received_at: string;
  normalized_payload_field_count: number;
  normalized_payload_fields: Readonly<Record<string, string>>;
  opt_out_observation: LeadOptOutObservation;
  conditional_opt_out_dependency_observed: boolean;
  outbound_message_allowed: false;
  provider_callback_processing_allowed: false;
};

const OPT_OUT_OBSERVATIONS: readonly LeadOptOutObservation[] = ['NOT_OBSERVED', 'OBSERVED_OPTED_OUT', 'OBSERVED_OPTED_IN'] as const;

function requireNonEmpty(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for Meta WhatsApp intake connector.`);
  }
  return value.trim();
}

function normalizeOptOutObservation(value: LeadOptOutObservation | undefined): LeadOptOutObservation {
  if (value === undefined) {
    return 'NOT_OBSERVED';
  }
  if (!OPT_OUT_OBSERVATIONS.includes(value)) {
    throw new Error('opt_out_observation is not supported for Meta WhatsApp intake connector.');
  }
  return value;
}

function requireReceivedAt(value: string): string {
  const normalized = requireNonEmpty(value, 'received_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('received_at must be a valid ISO-compatible timestamp for Meta WhatsApp intake connector.');
  }
  return normalized;
}

function normalizePayloadFields(fields: Record<string, string>): Readonly<Record<string, string>> {
  if (fields === null || typeof fields !== 'object' || Array.isArray(fields)) {
    throw new Error('inbound_payload_fields must be an object for Meta WhatsApp intake connector.');
  }
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    const normalizedKey = requireNonEmpty(key, 'inbound_payload_fields key');
    const normalizedValue = requireNonEmpty(value, `inbound_payload_fields.${normalizedKey}`);
    normalized[normalizedKey] = normalizedValue;
  }
  if (Object.keys(normalized).length === 0) {
    throw new Error('inbound_payload_fields must contain at least one mapped WhatsApp intake field.');
  }
  return Object.freeze(normalized);
}

export function recordMetaWhatsAppIntakeConnector(input: MetaWhatsAppIntakeConnectorInput): MetaWhatsAppIntakeConnectorReceipt {
  if (input.outbound_message_requested === true) {
    throw new Error('Meta WhatsApp intake connector must not send outbound WhatsApp messages.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('Meta WhatsApp intake connector FFET does not process provider callbacks.');
  }
  if (input.credential_material_included === true) {
    throw new Error('Meta WhatsApp intake connector must reference API-key scope registry entries, not credential material.');
  }

  const normalizedPayloadFields = normalizePayloadFields(input.inbound_payload_fields);
  const optOutObservation = normalizeOptOutObservation(input.opt_out_observation);

  return {
    seed_id: PHASE_6B_META_WHATSAPP_INTAKE_CONNECTOR_SEED_ID,
    component_id: PHASE_6B_META_WHATSAPP_INTAKE_CONNECTOR_COMPONENT_ID,
    event_name: META_WHATSAPP_INTAKE_CONNECTOR_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    lead_record_id: requireNonEmpty(input.lead_record_id, 'lead_record_id'),
    person_identity_graph_id: requireNonEmpty(input.person_identity_graph_id, 'person_identity_graph_id'),
    access_gatekeeper_decision_id: requireNonEmpty(input.access_gatekeeper_decision_id, 'access_gatekeeper_decision_id'),
    api_key_scope_registry_id: requireNonEmpty(input.api_key_scope_registry_id, 'api_key_scope_registry_id'),
    visual_workflow_definition_id: requireNonEmpty(input.visual_workflow_definition_id, 'visual_workflow_definition_id'),
    product_record_authority_id: requireNonEmpty(input.product_record_authority_id, 'product_record_authority_id'),
    intake_mapping_id: requireNonEmpty(input.intake_mapping_id, 'intake_mapping_id'),
    consent_basis_id: requireNonEmpty(input.consent_basis_id, 'consent_basis_id'),
    assignment_state_id: requireNonEmpty(input.assignment_state_id, 'assignment_state_id'),
    source_system: 'META_WHATSAPP_INTAKE',
    whatsapp_business_account_id: requireNonEmpty(input.whatsapp_business_account_id, 'whatsapp_business_account_id'),
    whatsapp_phone_number_id: requireNonEmpty(input.whatsapp_phone_number_id, 'whatsapp_phone_number_id'),
    inbound_message_id: requireNonEmpty(input.inbound_message_id, 'inbound_message_id'),
    sender_contact_ref: requireNonEmpty(input.sender_contact_ref, 'sender_contact_ref'),
    received_at: requireReceivedAt(input.received_at),
    normalized_payload_field_count: Object.keys(normalizedPayloadFields).length,
    normalized_payload_fields: normalizedPayloadFields,
    opt_out_observation: optOutObservation,
    conditional_opt_out_dependency_observed: optOutObservation !== 'NOT_OBSERVED',
    outbound_message_allowed: false,
    provider_callback_processing_allowed: false,
  };
}
