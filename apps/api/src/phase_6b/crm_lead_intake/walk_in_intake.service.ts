export const PHASE_6B_WALK_IN_INTAKE_SEED_ID = 'seed_6b_04_walk_in_intake' as const;
export const PHASE_6B_WALK_IN_INTAKE_COMPONENT_ID = '6B.04' as const;

export const WALK_IN_INTAKE_EVENT = 'phase_6b.crm_lead_intake.walk_in_intake.recorded' as const;

export type WalkInOptOutObservation = 'NOT_OBSERVED' | 'OBSERVED_OPTED_OUT' | 'OBSERVED_OPTED_IN';
export type WalkInVisitType = 'FRONT_DESK' | 'ADMISSIONS_DESK' | 'EVENT_DESK' | 'COUNSELLOR_DESK';
export type WalkInOutcome = 'LEAD_CAPTURED' | 'COUNSELLOR_ASSIGNED' | 'FOLLOW_UP_REQUIRED';

export type WalkInIntakeInput = {
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
  walk_in_location_ref: string;
  visit_reference_id: string;
  captured_by_user_id: string;
  visit_type: WalkInVisitType;
  visit_outcome: WalkInOutcome;
  captured_at: string;
  lead_fields: Record<string, string>;
  visit_evidence?: Record<string, string>;
  opt_out_observation?: WalkInOptOutObservation;
  outbound_send_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  credential_material_included?: boolean;
};

export type WalkInIntakeReceipt = {
  seed_id: typeof PHASE_6B_WALK_IN_INTAKE_SEED_ID;
  component_id: typeof PHASE_6B_WALK_IN_INTAKE_COMPONENT_ID;
  event_name: typeof WALK_IN_INTAKE_EVENT;
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
  source_system: 'WALK_IN_INTAKE';
  walk_in_location_ref: string;
  visit_reference_id: string;
  captured_by_user_id: string;
  visit_type: WalkInVisitType;
  visit_outcome: WalkInOutcome;
  captured_at: string;
  normalized_lead_field_count: number;
  normalized_lead_fields: Readonly<Record<string, string>>;
  normalized_visit_evidence: Readonly<Record<string, string>>;
  opt_out_observation: WalkInOptOutObservation;
  conditional_opt_out_dependency_observed: boolean;
  outbound_send_allowed: false;
  provider_callback_processing_allowed: false;
};

const VISIT_TYPES: readonly WalkInVisitType[] = ['FRONT_DESK', 'ADMISSIONS_DESK', 'EVENT_DESK', 'COUNSELLOR_DESK'] as const;
const OUTCOMES: readonly WalkInOutcome[] = ['LEAD_CAPTURED', 'COUNSELLOR_ASSIGNED', 'FOLLOW_UP_REQUIRED'] as const;
const OPT_OUT_OBSERVATIONS: readonly WalkInOptOutObservation[] = [
  'NOT_OBSERVED',
  'OBSERVED_OPTED_OUT',
  'OBSERVED_OPTED_IN',
] as const;

function requireNonEmpty(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for walk-in intake.`);
  }
  return value.trim();
}

function requireCapturedAt(value: string): string {
  const normalized = requireNonEmpty(value, 'captured_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('captured_at must be a valid ISO-compatible timestamp for walk-in intake.');
  }
  return normalized;
}

function normalizeVisitType(value: WalkInVisitType): WalkInVisitType {
  if (!VISIT_TYPES.includes(value)) {
    throw new Error('visit_type is not supported for walk-in intake.');
  }
  return value;
}

function normalizeOutcome(value: WalkInOutcome): WalkInOutcome {
  if (!OUTCOMES.includes(value)) {
    throw new Error('visit_outcome is not supported for walk-in intake.');
  }
  return value;
}

function normalizeOptOutObservation(value: WalkInOptOutObservation | undefined): WalkInOptOutObservation {
  if (value === undefined) {
    return 'NOT_OBSERVED';
  }
  if (!OPT_OUT_OBSERVATIONS.includes(value)) {
    throw new Error('opt_out_observation is not supported for walk-in intake.');
  }
  return value;
}

function normalizeStringRecord(fields: Record<string, string> | undefined, label: string, requireValue: boolean): Readonly<Record<string, string>> {
  if (fields === undefined) {
    if (requireValue) {
      throw new Error(`${label} must contain at least one walk-in intake field.`);
    }
    return Object.freeze({});
  }
  if (fields === null || typeof fields !== 'object' || Array.isArray(fields)) {
    throw new Error(`${label} must be an object for walk-in intake.`);
  }
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    const normalizedKey = requireNonEmpty(key, `${label} key`);
    const normalizedValue = requireNonEmpty(value, `${label}.${normalizedKey}`);
    normalized[normalizedKey] = normalizedValue;
  }
  if (requireValue && Object.keys(normalized).length === 0) {
    throw new Error(`${label} must contain at least one walk-in intake field.`);
  }
  return Object.freeze(normalized);
}

export function recordWalkInIntake(input: WalkInIntakeInput): WalkInIntakeReceipt {
  if (input.outbound_send_requested === true) {
    throw new Error('walk-in intake must not perform outbound sends.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('walk-in intake FFET does not process provider callbacks.');
  }
  if (input.credential_material_included === true) {
    throw new Error('walk-in intake must not include credential material.');
  }

  const normalizedLeadFields = normalizeStringRecord(input.lead_fields, 'lead_fields', true);
  const normalizedVisitEvidence = normalizeStringRecord(input.visit_evidence, 'visit_evidence', false);
  const optOutObservation = normalizeOptOutObservation(input.opt_out_observation);

  return {
    seed_id: PHASE_6B_WALK_IN_INTAKE_SEED_ID,
    component_id: PHASE_6B_WALK_IN_INTAKE_COMPONENT_ID,
    event_name: WALK_IN_INTAKE_EVENT,
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
    source_system: 'WALK_IN_INTAKE',
    walk_in_location_ref: requireNonEmpty(input.walk_in_location_ref, 'walk_in_location_ref'),
    visit_reference_id: requireNonEmpty(input.visit_reference_id, 'visit_reference_id'),
    captured_by_user_id: requireNonEmpty(input.captured_by_user_id, 'captured_by_user_id'),
    visit_type: normalizeVisitType(input.visit_type),
    visit_outcome: normalizeOutcome(input.visit_outcome),
    captured_at: requireCapturedAt(input.captured_at),
    normalized_lead_field_count: Object.keys(normalizedLeadFields).length,
    normalized_lead_fields: normalizedLeadFields,
    normalized_visit_evidence: normalizedVisitEvidence,
    opt_out_observation: optOutObservation,
    conditional_opt_out_dependency_observed: optOutObservation !== 'NOT_OBSERVED',
    outbound_send_allowed: false,
    provider_callback_processing_allowed: false,
  };
}
