export const PHASE_6B_IDENTITY_RESOLUTION_LINKING_SEED_ID = 'seed_6b_05_identity_resolution_linking' as const;
export const PHASE_6B_IDENTITY_RESOLUTION_LINKING_COMPONENT_ID = '6B.05' as const;

export const IDENTITY_RESOLUTION_LINKING_EVENT = 'phase_6b.crm_deduplication.identity_resolution_linking.recorded' as const;

export type IdentityResolutionLinkType = 'SAME_PERSON' | 'POSSIBLE_SAME_PERSON' | 'NOT_SAME_PERSON';
export type IdentityResolutionLinkBasis = 'PERSON_IDENTITY_GRAPH' | 'MATCH_CANDIDATE_EVIDENCE' | 'MERGE_DECISION_RECORD' | 'OPERATOR_REVIEW';

export type IdentityResolutionLinkEvidence = {
  evidence_ref: string;
  evidence_type: IdentityResolutionLinkBasis;
  confidence_score: number;
};

export type IdentityResolutionLinkingInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  identity_resolution_link_id: string;
  source_lead_record_id: string;
  source_lead_record_authority_id: string;
  target_lead_record_id: string;
  target_lead_record_authority_id: string;
  person_identity_graph_id: string;
  link_type: IdentityResolutionLinkType;
  link_basis: IdentityResolutionLinkBasis;
  linked_by_user_id: string;
  linked_at: string;
  evidence: IdentityResolutionLinkEvidence[];
  merge_execution_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type IdentityResolutionLinkingReceipt = {
  seed_id: typeof PHASE_6B_IDENTITY_RESOLUTION_LINKING_SEED_ID;
  component_id: typeof PHASE_6B_IDENTITY_RESOLUTION_LINKING_COMPONENT_ID;
  event_name: typeof IDENTITY_RESOLUTION_LINKING_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  identity_resolution_link_id: string;
  source_lead_record_id: string;
  source_lead_record_authority_id: string;
  target_lead_record_id: string;
  target_lead_record_authority_id: string;
  person_identity_graph_id: string;
  link_type: IdentityResolutionLinkType;
  link_basis: IdentityResolutionLinkBasis;
  linked_by_user_id: string;
  linked_at: string;
  evidence_count: number;
  evidence: readonly IdentityResolutionLinkEvidence[];
  strongest_confidence_score: number;
  merge_execution_allowed: false;
  irreversible_action_allowed: false;
};

const LINK_TYPES: readonly IdentityResolutionLinkType[] = ['SAME_PERSON', 'POSSIBLE_SAME_PERSON', 'NOT_SAME_PERSON'] as const;
const LINK_BASES: readonly IdentityResolutionLinkBasis[] = [
  'PERSON_IDENTITY_GRAPH',
  'MATCH_CANDIDATE_EVIDENCE',
  'MERGE_DECISION_RECORD',
  'OPERATOR_REVIEW',
] as const;

function requireNonEmpty(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for identity resolution linking.`);
  }
  return value.trim();
}

function requireLinkedAt(value: string): string {
  const normalized = requireNonEmpty(value, 'linked_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('linked_at must be a valid ISO-compatible timestamp for identity resolution linking.');
  }
  return normalized;
}

function normalizeLinkType(value: IdentityResolutionLinkType): IdentityResolutionLinkType {
  if (!LINK_TYPES.includes(value)) {
    throw new Error('link_type is not supported for identity resolution linking.');
  }
  return value;
}

function normalizeLinkBasis(value: IdentityResolutionLinkBasis): IdentityResolutionLinkBasis {
  if (!LINK_BASES.includes(value)) {
    throw new Error('link_basis is not supported for identity resolution linking.');
  }
  return value;
}

function requireConfidenceScore(value: number): number {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error('confidence_score must be between 0 and 100 for identity resolution linking.');
  }
  return value;
}

function normalizeEvidence(item: IdentityResolutionLinkEvidence): IdentityResolutionLinkEvidence {
  return {
    evidence_ref: requireNonEmpty(item.evidence_ref, 'evidence.evidence_ref'),
    evidence_type: normalizeLinkBasis(item.evidence_type),
    confidence_score: requireConfidenceScore(item.confidence_score),
  };
}

export function recordIdentityResolutionLink(input: IdentityResolutionLinkingInput): IdentityResolutionLinkingReceipt {
  if (input.merge_execution_requested === true) {
    throw new Error('identity resolution linking must not execute a merge.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('identity resolution linking must not perform irreversible actions.');
  }
  if (input.source_lead_record_id === input.target_lead_record_id) {
    throw new Error('source and target lead records must be distinct for identity resolution linking.');
  }
  if (!Array.isArray(input.evidence) || input.evidence.length === 0) {
    throw new Error('evidence must contain at least one item for identity resolution linking.');
  }

  const evidence = input.evidence.map(normalizeEvidence);
  const strongestScore = evidence.reduce((max, item) => Math.max(max, item.confidence_score), 0);

  return {
    seed_id: PHASE_6B_IDENTITY_RESOLUTION_LINKING_SEED_ID,
    component_id: PHASE_6B_IDENTITY_RESOLUTION_LINKING_COMPONENT_ID,
    event_name: IDENTITY_RESOLUTION_LINKING_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    identity_resolution_link_id: requireNonEmpty(input.identity_resolution_link_id, 'identity_resolution_link_id'),
    source_lead_record_id: requireNonEmpty(input.source_lead_record_id, 'source_lead_record_id'),
    source_lead_record_authority_id: requireNonEmpty(input.source_lead_record_authority_id, 'source_lead_record_authority_id'),
    target_lead_record_id: requireNonEmpty(input.target_lead_record_id, 'target_lead_record_id'),
    target_lead_record_authority_id: requireNonEmpty(input.target_lead_record_authority_id, 'target_lead_record_authority_id'),
    person_identity_graph_id: requireNonEmpty(input.person_identity_graph_id, 'person_identity_graph_id'),
    link_type: normalizeLinkType(input.link_type),
    link_basis: normalizeLinkBasis(input.link_basis),
    linked_by_user_id: requireNonEmpty(input.linked_by_user_id, 'linked_by_user_id'),
    linked_at: requireLinkedAt(input.linked_at),
    evidence_count: evidence.length,
    evidence: Object.freeze(evidence),
    strongest_confidence_score: strongestScore,
    merge_execution_allowed: false,
    irreversible_action_allowed: false,
  };
}
