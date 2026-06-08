export const PHASE_6B_EMAIL_INTAKE_SEED_ID = 'seed_6b_04_email_intake' as const;
export const PHASE_6B_EMAIL_INTAKE_COMPONENT_ID = '6B.04' as const;

export const EMAIL_INTAKE_EVENT = 'phase_6b.crm_lead_intake.email_intake.recorded' as const;

export type EmailOptOutObservation = 'NOT_OBSERVED' | 'OBSERVED_OPTED_OUT' | 'OBSERVED_OPTED_IN';
export type EmailIntakeMessageType = 'INBOUND_EMAIL' | 'FORWARDED_EMAIL' | 'PARSED_FORM_EMAIL';

export type EmailIntakeInput = {
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
  inbound_mailbox_id: string;
  email_message_ref: string;
  email_thread_ref: string;
  sender_email_ref: string;
  subject_ref: string;
  message_type: EmailIntakeMessageType;
  received_at: string;
  lead_fields: Record<string, string>;
  email_evidence?: Record<string, string>;
  opt_out_observation?: EmailOptOutObservation;
  outbound_send_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  credential_material_included?: boolean;
};

export type EmailIntakeReceipt = {
  seed_id: typeof PHASE_6B_EMAIL_INTAKE_SEED_ID;
  component_id: typeof PHASE_6B_EMAIL_INTAKE_COMPONENT_ID;
  event_name: typeof EMAIL_INTAKE_EVENT;
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
  source_system: 'EMAIL_INTAKE';
  inbound_mailbox_id: string;
  email_message_ref: string;
  email_thread_ref: string;
  sender_email_ref: string;
  subject_ref: string;
  message_type: EmailIntakeMessageType;
  received_at: string;
  normalized_lead_field_count: number;
  normalized_lead_fields: Readonly<Record<string, string>>;
  normalized_email_evidence: Readonly<Record<string, string>>;
  opt_out_observation: EmailOptOutObservation;
  conditional_opt_out_dependency_observed: boolean;
  outbound_send_allowed: false;
  provider_callback_processing_allowed: false;
};

const MESSAGE_TYPES: readonly EmailIntakeMessageType[] = ['INBOUND_EMAIL', 'FORWARDED_EMAIL', 'PARSED_FORM_EMAIL'] as const;
const OPT_OUT_OBSERVATIONS: readonly EmailOptOutObservation[] = [
  'NOT_OBSERVED',
  'OBSERVED_OPTED_OUT',
  'OBSERVED_OPTED_IN',
] as const;

function requireNonEmpty(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for email intake.`);
  }
  return value.trim();
}

function requireReceivedAt(value: string): string {
  const normalized = requireNonEmpty(value, 'received_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('received_at must be a valid ISO-compatible timestamp for email intake.');
  }
  return normalized;
}

function normalizeMessageType(value: EmailIntakeMessageType): EmailIntakeMessageType {
  if (!MESSAGE_TYPES.includes(value)) {
    throw new Error('message_type is not supported for email intake.');
  }
  return value;
}

function normalizeOptOutObservation(value: EmailOptOutObservation | undefined): EmailOptOutObservation {
  if (value === undefined) {
    return 'NOT_OBSERVED';
  }
  if (!OPT_OUT_OBSERVATIONS.includes(value)) {
    throw new Error('opt_out_observation is not supported for email intake.');
  }
  return value;
}

function normalizeStringRecord(fields: Record<string, string> | undefined, label: string, requireValue: boolean): Readonly<Record<string, string>> {
  if (fields === undefined) {
    if (requireValue) {
      throw new Error(`${label} must contain at least one email intake field.`);
    }
    return Object.freeze({});
  }
  if (fields === null || typeof fields !== 'object' || Array.isArray(fields)) {
    throw new Error(`${label} must be an object for email intake.`);
  }
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    const normalizedKey = requireNonEmpty(key, `${label} key`);
    const normalizedValue = requireNonEmpty(value, `${label}.${normalizedKey}`);
    normalized[normalizedKey] = normalizedValue;
  }
  if (requireValue && Object.keys(normalized).length === 0) {
    throw new Error(`${label} must contain at least one email intake field.`);
  }
  return Object.freeze(normalized);
}

export function recordEmailIntake(input: EmailIntakeInput): EmailIntakeReceipt {
  if (input.outbound_send_requested === true) {
    throw new Error('email intake must not perform outbound sends.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('email intake FFET does not process provider callbacks.');
  }
  if (input.credential_material_included === true) {
    throw new Error('email intake must not include credential material.');
  }

  const normalizedLeadFields = normalizeStringRecord(input.lead_fields, 'lead_fields', true);
  const normalizedEmailEvidence = normalizeStringRecord(input.email_evidence, 'email_evidence', false);
  const optOutObservation = normalizeOptOutObservation(input.opt_out_observation);

  return {
    seed_id: PHASE_6B_EMAIL_INTAKE_SEED_ID,
    component_id: PHASE_6B_EMAIL_INTAKE_COMPONENT_ID,
    event_name: EMAIL_INTAKE_EVENT,
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
    source_system: 'EMAIL_INTAKE',
    inbound_mailbox_id: requireNonEmpty(input.inbound_mailbox_id, 'inbound_mailbox_id'),
    email_message_ref: requireNonEmpty(input.email_message_ref, 'email_message_ref'),
    email_thread_ref: requireNonEmpty(input.email_thread_ref, 'email_thread_ref'),
    sender_email_ref: requireNonEmpty(input.sender_email_ref, 'sender_email_ref'),
    subject_ref: requireNonEmpty(input.subject_ref, 'subject_ref'),
    message_type: normalizeMessageType(input.message_type),
    received_at: requireReceivedAt(input.received_at),
    normalized_lead_field_count: Object.keys(normalizedLeadFields).length,
    normalized_lead_fields: normalizedLeadFields,
    normalized_email_evidence: normalizedEmailEvidence,
    opt_out_observation: optOutObservation,
    conditional_opt_out_dependency_observed: optOutObservation !== 'NOT_OBSERVED',
    outbound_send_allowed: false,
    provider_callback_processing_allowed: false,
  };
}
