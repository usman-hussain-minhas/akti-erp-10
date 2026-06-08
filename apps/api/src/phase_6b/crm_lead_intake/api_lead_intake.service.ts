export const PHASE_6B_API_LEAD_INTAKE_SEED_ID = 'seed_6b_04_api_lead_intake' as const;
export const PHASE_6B_API_LEAD_INTAKE_COMPONENT_ID = '6B.04' as const;

export const API_LEAD_INTAKE_EVENT = 'phase_6b.crm_lead_intake.api_lead_intake.recorded' as const;

export type ApiLeadIntakeMethod = 'POST' | 'PUT' | 'PATCH';
export type ApiLeadOptOutObservation = 'NOT_OBSERVED' | 'OBSERVED_OPTED_OUT' | 'OBSERVED_OPTED_IN';

export type ApiLeadIntakeInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  lead_record_id: string;
  person_identity_graph_id: string;
  access_gatekeeper_decision_id: string;
  api_key_scope_registry_id: string;
  api_client_id: string;
  visual_workflow_definition_id: string;
  product_record_authority_id: string;
  intake_mapping_id: string;
  consent_basis_id: string;
  assignment_state_id: string;
  api_request_id: string;
  api_endpoint_id: string;
  request_method: ApiLeadIntakeMethod;
  external_source_reference: string;
  received_at: string;
  payload_fields: Record<string, string>;
  source_metadata?: Record<string, string>;
  opt_out_observation?: ApiLeadOptOutObservation;
  direct_provider_messaging_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  credential_material_included?: boolean;
};

export type ApiLeadIntakeReceipt = {
  seed_id: typeof PHASE_6B_API_LEAD_INTAKE_SEED_ID;
  component_id: typeof PHASE_6B_API_LEAD_INTAKE_COMPONENT_ID;
  event_name: typeof API_LEAD_INTAKE_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  lead_record_id: string;
  person_identity_graph_id: string;
  access_gatekeeper_decision_id: string;
  api_key_scope_registry_id: string;
  api_client_id: string;
  visual_workflow_definition_id: string;
  product_record_authority_id: string;
  intake_mapping_id: string;
  consent_basis_id: string;
  assignment_state_id: string;
  source_system: 'API_LEAD_INTAKE';
  api_request_id: string;
  api_endpoint_id: string;
  request_method: ApiLeadIntakeMethod;
  external_source_reference: string;
  received_at: string;
  normalized_payload_field_count: number;
  normalized_payload_fields: Readonly<Record<string, string>>;
  normalized_source_metadata: Readonly<Record<string, string>>;
  opt_out_observation: ApiLeadOptOutObservation;
  conditional_opt_out_dependency_observed: boolean;
  api_key_scope_dependency_enforced: true;
  direct_provider_messaging_allowed: false;
  provider_callback_processing_allowed: false;
};

const API_LEAD_INTAKE_METHODS: readonly ApiLeadIntakeMethod[] = ['POST', 'PUT', 'PATCH'] as const;
const API_LEAD_OPT_OUT_OBSERVATIONS: readonly ApiLeadOptOutObservation[] = [
  'NOT_OBSERVED',
  'OBSERVED_OPTED_OUT',
  'OBSERVED_OPTED_IN',
] as const;

function requireNonEmpty(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for API lead intake.`);
  }
  return value.trim();
}

function requireReceivedAt(value: string): string {
  const normalized = requireNonEmpty(value, 'received_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('received_at must be a valid ISO-compatible timestamp for API lead intake.');
  }
  return normalized;
}

function normalizeRequestMethod(value: ApiLeadIntakeMethod): ApiLeadIntakeMethod {
  if (!API_LEAD_INTAKE_METHODS.includes(value)) {
    throw new Error('request_method is not supported for API lead intake.');
  }
  return value;
}

function normalizeOptOutObservation(value: ApiLeadOptOutObservation | undefined): ApiLeadOptOutObservation {
  if (value === undefined) {
    return 'NOT_OBSERVED';
  }
  if (!API_LEAD_OPT_OUT_OBSERVATIONS.includes(value)) {
    throw new Error('opt_out_observation is not supported for API lead intake.');
  }
  return value;
}

function normalizeStringRecord(fields: Record<string, string> | undefined, label: string, requireValue: boolean): Readonly<Record<string, string>> {
  if (fields === undefined) {
    if (requireValue) {
      throw new Error(`${label} must contain at least one API lead intake field.`);
    }
    return Object.freeze({});
  }
  if (fields === null || typeof fields !== 'object' || Array.isArray(fields)) {
    throw new Error(`${label} must be an object for API lead intake.`);
  }
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    const normalizedKey = requireNonEmpty(key, `${label} key`);
    const normalizedValue = requireNonEmpty(value, `${label}.${normalizedKey}`);
    normalized[normalizedKey] = normalizedValue;
  }
  if (requireValue && Object.keys(normalized).length === 0) {
    throw new Error(`${label} must contain at least one API lead intake field.`);
  }
  return Object.freeze(normalized);
}

export function recordApiLeadIntake(input: ApiLeadIntakeInput): ApiLeadIntakeReceipt {
  if (input.direct_provider_messaging_requested === true) {
    throw new Error('API lead intake must not perform direct provider messaging.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('API lead intake FFET does not process provider callbacks.');
  }
  if (input.credential_material_included === true) {
    throw new Error('API lead intake must not include credential material.');
  }

  const normalizedPayloadFields = normalizeStringRecord(input.payload_fields, 'payload_fields', true);
  const normalizedSourceMetadata = normalizeStringRecord(input.source_metadata, 'source_metadata', false);
  const optOutObservation = normalizeOptOutObservation(input.opt_out_observation);

  return {
    seed_id: PHASE_6B_API_LEAD_INTAKE_SEED_ID,
    component_id: PHASE_6B_API_LEAD_INTAKE_COMPONENT_ID,
    event_name: API_LEAD_INTAKE_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    lead_record_id: requireNonEmpty(input.lead_record_id, 'lead_record_id'),
    person_identity_graph_id: requireNonEmpty(input.person_identity_graph_id, 'person_identity_graph_id'),
    access_gatekeeper_decision_id: requireNonEmpty(input.access_gatekeeper_decision_id, 'access_gatekeeper_decision_id'),
    api_key_scope_registry_id: requireNonEmpty(input.api_key_scope_registry_id, 'api_key_scope_registry_id'),
    api_client_id: requireNonEmpty(input.api_client_id, 'api_client_id'),
    visual_workflow_definition_id: requireNonEmpty(input.visual_workflow_definition_id, 'visual_workflow_definition_id'),
    product_record_authority_id: requireNonEmpty(input.product_record_authority_id, 'product_record_authority_id'),
    intake_mapping_id: requireNonEmpty(input.intake_mapping_id, 'intake_mapping_id'),
    consent_basis_id: requireNonEmpty(input.consent_basis_id, 'consent_basis_id'),
    assignment_state_id: requireNonEmpty(input.assignment_state_id, 'assignment_state_id'),
    source_system: 'API_LEAD_INTAKE',
    api_request_id: requireNonEmpty(input.api_request_id, 'api_request_id'),
    api_endpoint_id: requireNonEmpty(input.api_endpoint_id, 'api_endpoint_id'),
    request_method: normalizeRequestMethod(input.request_method),
    external_source_reference: requireNonEmpty(input.external_source_reference, 'external_source_reference'),
    received_at: requireReceivedAt(input.received_at),
    normalized_payload_field_count: Object.keys(normalizedPayloadFields).length,
    normalized_payload_fields: normalizedPayloadFields,
    normalized_source_metadata: normalizedSourceMetadata,
    opt_out_observation: optOutObservation,
    conditional_opt_out_dependency_observed: optOutObservation !== 'NOT_OBSERVED',
    api_key_scope_dependency_enforced: true,
    direct_provider_messaging_allowed: false,
    provider_callback_processing_allowed: false,
  };
}
