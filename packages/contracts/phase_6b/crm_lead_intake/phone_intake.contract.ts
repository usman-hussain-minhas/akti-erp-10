export const PHASE_6B_PHONE_INTAKE_SEED_ID = 'seed_6b_04_phone_intake' as const;
export const PHASE_6B_PHONE_INTAKE_COMPONENT_ID = '6B.04' as const;

export const PHONE_INTAKE_EVENT = 'phase_6b.crm_lead_intake.phone_intake.recorded' as const;

export type PhoneOptOutObservation = 'NOT_OBSERVED' | 'OBSERVED_OPTED_OUT' | 'OBSERVED_OPTED_IN';
export type PhoneIntakeDirection = 'INBOUND_CALL' | 'WALK_IN_PHONE_CAPTURE' | 'MISSED_CALL_FOLLOW_UP_REQUEST';
export type PhoneCallOutcome = 'LEAD_CAPTURED' | 'FOLLOW_UP_REQUIRED' | 'QUALIFICATION_INCOMPLETE';

export type PhoneIntakeInput = {
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
  phone_channel_id: string;
  caller_phone_ref: string;
  call_reference_id: string;
  operator_user_id: string;
  call_direction: PhoneIntakeDirection;
  call_outcome: PhoneCallOutcome;
  captured_at: string;
  lead_fields: Record<string, string>;
  call_evidence?: Record<string, string>;
  opt_out_observation?: PhoneOptOutObservation;
  outbound_call_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  credential_material_included?: boolean;
};

export type PhoneIntakeReceipt = {
  seed_id: typeof PHASE_6B_PHONE_INTAKE_SEED_ID;
  component_id: typeof PHASE_6B_PHONE_INTAKE_COMPONENT_ID;
  event_name: typeof PHONE_INTAKE_EVENT;
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
  source_system: 'PHONE_INTAKE';
  phone_channel_id: string;
  caller_phone_ref: string;
  call_reference_id: string;
  operator_user_id: string;
  call_direction: PhoneIntakeDirection;
  call_outcome: PhoneCallOutcome;
  captured_at: string;
  normalized_lead_field_count: number;
  normalized_lead_fields: Readonly<Record<string, string>>;
  normalized_call_evidence: Readonly<Record<string, string>>;
  opt_out_observation: PhoneOptOutObservation;
  conditional_opt_out_dependency_observed: boolean;
  outbound_call_allowed: false;
  provider_callback_processing_allowed: false;
};

const DIRECTIONS: readonly PhoneIntakeDirection[] = ['INBOUND_CALL', 'WALK_IN_PHONE_CAPTURE', 'MISSED_CALL_FOLLOW_UP_REQUEST'] as const;
const OUTCOMES: readonly PhoneCallOutcome[] = ['LEAD_CAPTURED', 'FOLLOW_UP_REQUIRED', 'QUALIFICATION_INCOMPLETE'] as const;
const OPT_OUT_OBSERVATIONS: readonly PhoneOptOutObservation[] = [
  'NOT_OBSERVED',
  'OBSERVED_OPTED_OUT',
  'OBSERVED_OPTED_IN',
] as const;

function requireNonEmpty(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for phone intake.`);
  }
  return value.trim();
}

function requireCapturedAt(value: string): string {
  const normalized = requireNonEmpty(value, 'captured_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('captured_at must be a valid ISO-compatible timestamp for phone intake.');
  }
  return normalized;
}

function normalizeDirection(value: PhoneIntakeDirection): PhoneIntakeDirection {
  if (!DIRECTIONS.includes(value)) {
    throw new Error('call_direction is not supported for phone intake.');
  }
  return value;
}

function normalizeOutcome(value: PhoneCallOutcome): PhoneCallOutcome {
  if (!OUTCOMES.includes(value)) {
    throw new Error('call_outcome is not supported for phone intake.');
  }
  return value;
}

function normalizeOptOutObservation(value: PhoneOptOutObservation | undefined): PhoneOptOutObservation {
  if (value === undefined) {
    return 'NOT_OBSERVED';
  }
  if (!OPT_OUT_OBSERVATIONS.includes(value)) {
    throw new Error('opt_out_observation is not supported for phone intake.');
  }
  return value;
}

function normalizeStringRecord(fields: Record<string, string> | undefined, label: string, requireValue: boolean): Readonly<Record<string, string>> {
  if (fields === undefined) {
    if (requireValue) {
      throw new Error(`${label} must contain at least one phone intake field.`);
    }
    return Object.freeze({});
  }
  if (fields === null || typeof fields !== 'object' || Array.isArray(fields)) {
    throw new Error(`${label} must be an object for phone intake.`);
  }
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    const normalizedKey = requireNonEmpty(key, `${label} key`);
    const normalizedValue = requireNonEmpty(value, `${label}.${normalizedKey}`);
    normalized[normalizedKey] = normalizedValue;
  }
  if (requireValue && Object.keys(normalized).length === 0) {
    throw new Error(`${label} must contain at least one phone intake field.`);
  }
  return Object.freeze(normalized);
}

export function recordPhoneIntake(input: PhoneIntakeInput): PhoneIntakeReceipt {
  if (input.outbound_call_requested === true) {
    throw new Error('phone intake must not perform outbound calls.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('phone intake FFET does not process provider callbacks.');
  }
  if (input.credential_material_included === true) {
    throw new Error('phone intake must not include credential material.');
  }

  const normalizedLeadFields = normalizeStringRecord(input.lead_fields, 'lead_fields', true);
  const normalizedCallEvidence = normalizeStringRecord(input.call_evidence, 'call_evidence', false);
  const optOutObservation = normalizeOptOutObservation(input.opt_out_observation);

  return {
    seed_id: PHASE_6B_PHONE_INTAKE_SEED_ID,
    component_id: PHASE_6B_PHONE_INTAKE_COMPONENT_ID,
    event_name: PHONE_INTAKE_EVENT,
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
    source_system: 'PHONE_INTAKE',
    phone_channel_id: requireNonEmpty(input.phone_channel_id, 'phone_channel_id'),
    caller_phone_ref: requireNonEmpty(input.caller_phone_ref, 'caller_phone_ref'),
    call_reference_id: requireNonEmpty(input.call_reference_id, 'call_reference_id'),
    operator_user_id: requireNonEmpty(input.operator_user_id, 'operator_user_id'),
    call_direction: normalizeDirection(input.call_direction),
    call_outcome: normalizeOutcome(input.call_outcome),
    captured_at: requireCapturedAt(input.captured_at),
    normalized_lead_field_count: Object.keys(normalizedLeadFields).length,
    normalized_lead_fields: normalizedLeadFields,
    normalized_call_evidence: normalizedCallEvidence,
    opt_out_observation: optOutObservation,
    conditional_opt_out_dependency_observed: optOutObservation !== 'NOT_OBSERVED',
    outbound_call_allowed: false,
    provider_callback_processing_allowed: false,
  };
}
