export const PHASE_6B_META_LEAD_FORMS_CONNECTOR_SEED_ID = 'seed_6b_04_meta_lead_forms_connector' as const;
export const PHASE_6B_META_LEAD_FORMS_CONNECTOR_COMPONENT_ID = '6B.04' as const;

export const META_LEAD_FORMS_CONNECTOR_EVENT = 'phase_6b.crm_lead_intake.meta_lead_forms_connector.intake_recorded' as const;

export type LeadOptOutObservation = 'NOT_OBSERVED' | 'OBSERVED_OPTED_OUT' | 'OBSERVED_OPTED_IN';

export type MetaLeadFormsConnectorInput = {
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
  meta_form_id: string;
  meta_lead_id: string;
  captured_at: string;
  field_values: Record<string, string>;
  opt_out_observation?: LeadOptOutObservation;
  direct_provider_messaging_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  credential_material_included?: boolean;
};

export type MetaLeadFormsConnectorReceipt = {
  seed_id: typeof PHASE_6B_META_LEAD_FORMS_CONNECTOR_SEED_ID;
  component_id: typeof PHASE_6B_META_LEAD_FORMS_CONNECTOR_COMPONENT_ID;
  event_name: typeof META_LEAD_FORMS_CONNECTOR_EVENT;
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
  source_system: 'META_LEAD_FORMS';
  meta_form_id: string;
  meta_lead_id: string;
  captured_at: string;
  normalized_field_count: number;
  normalized_fields: Readonly<Record<string, string>>;
  opt_out_observation: LeadOptOutObservation;
  conditional_opt_out_dependency_observed: boolean;
  direct_provider_messaging_allowed: false;
  provider_callback_processing_allowed: false;
};

const OPT_OUT_OBSERVATIONS: readonly LeadOptOutObservation[] = ['NOT_OBSERVED', 'OBSERVED_OPTED_OUT', 'OBSERVED_OPTED_IN'] as const;

function requireNonEmpty(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for Meta lead forms connector.`);
  }
  return value.trim();
}

function normalizeOptOutObservation(value: LeadOptOutObservation | undefined): LeadOptOutObservation {
  if (value === undefined) {
    return 'NOT_OBSERVED';
  }
  if (!OPT_OUT_OBSERVATIONS.includes(value)) {
    throw new Error('opt_out_observation is not supported for Meta lead forms connector.');
  }
  return value;
}

function requireCapturedAt(value: string): string {
  const normalized = requireNonEmpty(value, 'captured_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('captured_at must be a valid ISO-compatible timestamp for Meta lead forms connector.');
  }
  return normalized;
}

function normalizeFields(fields: Record<string, string>): Readonly<Record<string, string>> {
  if (fields === null || typeof fields !== 'object' || Array.isArray(fields)) {
    throw new Error('field_values must be an object for Meta lead forms connector.');
  }
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    const normalizedKey = requireNonEmpty(key, 'field_values key');
    const normalizedValue = requireNonEmpty(value, `field_values.${normalizedKey}`);
    normalized[normalizedKey] = normalizedValue;
  }
  if (Object.keys(normalized).length === 0) {
    throw new Error('field_values must contain at least one mapped Meta lead form field.');
  }
  return Object.freeze(normalized);
}

export function recordMetaLeadFormsConnectorIntake(input: MetaLeadFormsConnectorInput): MetaLeadFormsConnectorReceipt {
  if (input.direct_provider_messaging_requested === true) {
    throw new Error('Meta lead forms connector must not perform direct provider messaging.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('Meta lead forms connector FFET does not process provider callbacks.');
  }
  if (input.credential_material_included === true) {
    throw new Error('Meta lead forms connector must reference API-key scope registry entries, not credential material.');
  }

  const normalizedFields = normalizeFields(input.field_values);
  const optOutObservation = normalizeOptOutObservation(input.opt_out_observation);

  return {
    seed_id: PHASE_6B_META_LEAD_FORMS_CONNECTOR_SEED_ID,
    component_id: PHASE_6B_META_LEAD_FORMS_CONNECTOR_COMPONENT_ID,
    event_name: META_LEAD_FORMS_CONNECTOR_EVENT,
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
    source_system: 'META_LEAD_FORMS',
    meta_form_id: requireNonEmpty(input.meta_form_id, 'meta_form_id'),
    meta_lead_id: requireNonEmpty(input.meta_lead_id, 'meta_lead_id'),
    captured_at: requireCapturedAt(input.captured_at),
    normalized_field_count: Object.keys(normalizedFields).length,
    normalized_fields: normalizedFields,
    opt_out_observation: optOutObservation,
    conditional_opt_out_dependency_observed: optOutObservation !== 'NOT_OBSERVED',
    direct_provider_messaging_allowed: false,
    provider_callback_processing_allowed: false,
  };
}
