export const PHASE_6B_REFERRAL_INTAKE_SEED_ID = 'seed_6b_04_referral_intake' as const;
export const PHASE_6B_REFERRAL_INTAKE_COMPONENT_ID = '6B.04' as const;

export const REFERRAL_INTAKE_EVENT = 'phase_6b.crm_lead_intake.referral_intake.recorded' as const;

export type ReferralOptOutObservation = 'NOT_OBSERVED' | 'OBSERVED_OPTED_OUT' | 'OBSERVED_OPTED_IN';
export type ReferralRelationship = 'STUDENT' | 'PARENT' | 'ALUMNI' | 'STAFF' | 'PARTNER' | 'OTHER';

export type ReferralIntakeInput = {
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
  referral_source_id: string;
  referrer_person_identity_graph_id: string;
  referrer_relationship: ReferralRelationship;
  referral_reference: string;
  referred_at: string;
  lead_fields: Record<string, string>;
  referral_context?: Record<string, string>;
  opt_out_observation?: ReferralOptOutObservation;
  direct_provider_messaging_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  credential_material_included?: boolean;
};

export type ReferralIntakeReceipt = {
  seed_id: typeof PHASE_6B_REFERRAL_INTAKE_SEED_ID;
  component_id: typeof PHASE_6B_REFERRAL_INTAKE_COMPONENT_ID;
  event_name: typeof REFERRAL_INTAKE_EVENT;
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
  source_system: 'REFERRAL_INTAKE';
  referral_source_id: string;
  referrer_person_identity_graph_id: string;
  referrer_relationship: ReferralRelationship;
  referral_reference: string;
  referred_at: string;
  normalized_lead_field_count: number;
  normalized_lead_fields: Readonly<Record<string, string>>;
  normalized_referral_context: Readonly<Record<string, string>>;
  opt_out_observation: ReferralOptOutObservation;
  conditional_opt_out_dependency_observed: boolean;
  direct_provider_messaging_allowed: false;
  provider_callback_processing_allowed: false;
};

const REFERRAL_OPT_OUT_OBSERVATIONS: readonly ReferralOptOutObservation[] = [
  'NOT_OBSERVED',
  'OBSERVED_OPTED_OUT',
  'OBSERVED_OPTED_IN',
] as const;
const REFERRAL_RELATIONSHIPS: readonly ReferralRelationship[] = ['STUDENT', 'PARENT', 'ALUMNI', 'STAFF', 'PARTNER', 'OTHER'] as const;

function requireNonEmpty(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for referral intake.`);
  }
  return value.trim();
}

function requireReferredAt(value: string): string {
  const normalized = requireNonEmpty(value, 'referred_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('referred_at must be a valid ISO-compatible timestamp for referral intake.');
  }
  return normalized;
}

function normalizeRelationship(value: ReferralRelationship): ReferralRelationship {
  if (!REFERRAL_RELATIONSHIPS.includes(value)) {
    throw new Error('referrer_relationship is not supported for referral intake.');
  }
  return value;
}

function normalizeOptOutObservation(value: ReferralOptOutObservation | undefined): ReferralOptOutObservation {
  if (value === undefined) {
    return 'NOT_OBSERVED';
  }
  if (!REFERRAL_OPT_OUT_OBSERVATIONS.includes(value)) {
    throw new Error('opt_out_observation is not supported for referral intake.');
  }
  return value;
}

function normalizeStringRecord(fields: Record<string, string> | undefined, label: string, requireValue: boolean): Readonly<Record<string, string>> {
  if (fields === undefined) {
    if (requireValue) {
      throw new Error(`${label} must contain at least one referral intake field.`);
    }
    return Object.freeze({});
  }
  if (fields === null || typeof fields !== 'object' || Array.isArray(fields)) {
    throw new Error(`${label} must be an object for referral intake.`);
  }
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    const normalizedKey = requireNonEmpty(key, `${label} key`);
    const normalizedValue = requireNonEmpty(value, `${label}.${normalizedKey}`);
    normalized[normalizedKey] = normalizedValue;
  }
  if (requireValue && Object.keys(normalized).length === 0) {
    throw new Error(`${label} must contain at least one referral intake field.`);
  }
  return Object.freeze(normalized);
}

export function recordReferralIntake(input: ReferralIntakeInput): ReferralIntakeReceipt {
  if (input.direct_provider_messaging_requested === true) {
    throw new Error('referral intake must not perform direct provider messaging.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('referral intake FFET does not process provider callbacks.');
  }
  if (input.credential_material_included === true) {
    throw new Error('referral intake must not include credential material.');
  }

  const normalizedLeadFields = normalizeStringRecord(input.lead_fields, 'lead_fields', true);
  const normalizedReferralContext = normalizeStringRecord(input.referral_context, 'referral_context', false);
  const optOutObservation = normalizeOptOutObservation(input.opt_out_observation);

  return {
    seed_id: PHASE_6B_REFERRAL_INTAKE_SEED_ID,
    component_id: PHASE_6B_REFERRAL_INTAKE_COMPONENT_ID,
    event_name: REFERRAL_INTAKE_EVENT,
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
    source_system: 'REFERRAL_INTAKE',
    referral_source_id: requireNonEmpty(input.referral_source_id, 'referral_source_id'),
    referrer_person_identity_graph_id: requireNonEmpty(input.referrer_person_identity_graph_id, 'referrer_person_identity_graph_id'),
    referrer_relationship: normalizeRelationship(input.referrer_relationship),
    referral_reference: requireNonEmpty(input.referral_reference, 'referral_reference'),
    referred_at: requireReferredAt(input.referred_at),
    normalized_lead_field_count: Object.keys(normalizedLeadFields).length,
    normalized_lead_fields: normalizedLeadFields,
    normalized_referral_context: normalizedReferralContext,
    opt_out_observation: optOutObservation,
    conditional_opt_out_dependency_observed: optOutObservation !== 'NOT_OBSERVED',
    direct_provider_messaging_allowed: false,
    provider_callback_processing_allowed: false,
  };
}
