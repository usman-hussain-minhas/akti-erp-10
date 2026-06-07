export const PHASE_6B_UNIFIED_LEAD_RECORD_AUTHORITY_SEED_ID = 'seed_6b_04_unified_lead_record_authority' as const;
export const PHASE_6B_UNIFIED_LEAD_RECORD_AUTHORITY_COMPONENT_ID = '6B.04' as const;

export const UNIFIED_LEAD_RECORD_AUTHORITY_EVENT = 'phase_6b.crm_lead_intake.unified_lead_record_authority.recorded' as const;

export type LeadOptOutObservation = 'NOT_OBSERVED' | 'OBSERVED_OPTED_OUT' | 'OBSERVED_OPTED_IN';

export type UnifiedLeadRecordAuthorityInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  lead_record_id: string;
  person_identity_graph_id: string;
  access_gatekeeper_decision_id: string;
  api_key_scope_registry_id: string;
  visual_workflow_definition_id: string;
  product_record_authority_id: string;
  lead_source_id: string;
  lead_source_record_id: string;
  intake_mapping_id: string;
  consent_basis_id: string;
  assignment_state_id: string;
  opt_out_observation?: LeadOptOutObservation;
  direct_provider_messaging_requested?: boolean;
  duplicate_parallel_lead_requested?: boolean;
};

export type UnifiedLeadRecordAuthorityReceipt = {
  seed_id: typeof PHASE_6B_UNIFIED_LEAD_RECORD_AUTHORITY_SEED_ID;
  component_id: typeof PHASE_6B_UNIFIED_LEAD_RECORD_AUTHORITY_COMPONENT_ID;
  event_name: typeof UNIFIED_LEAD_RECORD_AUTHORITY_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  lead_record_id: string;
  person_identity_graph_id: string;
  access_gatekeeper_decision_id: string;
  api_key_scope_registry_id: string;
  visual_workflow_definition_id: string;
  product_record_authority_id: string;
  lead_source_id: string;
  lead_source_record_id: string;
  intake_mapping_id: string;
  consent_basis_id: string;
  assignment_state_id: string;
  opt_out_observation: LeadOptOutObservation;
  canonical_authority: 'LEAD_RECORD';
  direct_provider_messaging_allowed: false;
  conditional_opt_out_dependency_observed: boolean;
  dependency_basis: readonly [
    'activation_lifecycle_required',
    'person_identity_graph_required',
    'access_core_gatekeeper_required',
    'api_key_scope_registry_required',
    'visual_workflow_builder_required',
    'product_record_authority_required',
  ];
};

const OPT_OUT_OBSERVATIONS: readonly LeadOptOutObservation[] = ['NOT_OBSERVED', 'OBSERVED_OPTED_OUT', 'OBSERVED_OPTED_IN'] as const;

function requireNonEmpty(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for unified lead record authority.`);
  }
  return value.trim();
}

function normalizeOptOutObservation(value: LeadOptOutObservation | undefined): LeadOptOutObservation {
  if (value === undefined) {
    return 'NOT_OBSERVED';
  }
  if (!OPT_OUT_OBSERVATIONS.includes(value)) {
    throw new Error('opt_out_observation is not supported for unified lead record authority.');
  }
  return value;
}

export function recordUnifiedLeadRecordAuthority(
  input: UnifiedLeadRecordAuthorityInput,
): UnifiedLeadRecordAuthorityReceipt {
  if (input.direct_provider_messaging_requested === true) {
    throw new Error('unified lead record authority must not perform direct provider messaging.');
  }
  if (input.duplicate_parallel_lead_requested === true) {
    throw new Error('unified lead record authority must reference the canonical LeadRecord instead of creating a parallel lead authority.');
  }

  const optOutObservation = normalizeOptOutObservation(input.opt_out_observation);

  return {
    seed_id: PHASE_6B_UNIFIED_LEAD_RECORD_AUTHORITY_SEED_ID,
    component_id: PHASE_6B_UNIFIED_LEAD_RECORD_AUTHORITY_COMPONENT_ID,
    event_name: UNIFIED_LEAD_RECORD_AUTHORITY_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    lead_record_id: requireNonEmpty(input.lead_record_id, 'lead_record_id'),
    person_identity_graph_id: requireNonEmpty(input.person_identity_graph_id, 'person_identity_graph_id'),
    access_gatekeeper_decision_id: requireNonEmpty(input.access_gatekeeper_decision_id, 'access_gatekeeper_decision_id'),
    api_key_scope_registry_id: requireNonEmpty(input.api_key_scope_registry_id, 'api_key_scope_registry_id'),
    visual_workflow_definition_id: requireNonEmpty(input.visual_workflow_definition_id, 'visual_workflow_definition_id'),
    product_record_authority_id: requireNonEmpty(input.product_record_authority_id, 'product_record_authority_id'),
    lead_source_id: requireNonEmpty(input.lead_source_id, 'lead_source_id'),
    lead_source_record_id: requireNonEmpty(input.lead_source_record_id, 'lead_source_record_id'),
    intake_mapping_id: requireNonEmpty(input.intake_mapping_id, 'intake_mapping_id'),
    consent_basis_id: requireNonEmpty(input.consent_basis_id, 'consent_basis_id'),
    assignment_state_id: requireNonEmpty(input.assignment_state_id, 'assignment_state_id'),
    opt_out_observation: optOutObservation,
    canonical_authority: 'LEAD_RECORD',
    direct_provider_messaging_allowed: false,
    conditional_opt_out_dependency_observed: optOutObservation !== 'NOT_OBSERVED',
    dependency_basis: [
      'activation_lifecycle_required',
      'person_identity_graph_required',
      'access_core_gatekeeper_required',
      'api_key_scope_registry_required',
      'visual_workflow_builder_required',
      'product_record_authority_required',
    ],
  };
}
