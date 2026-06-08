export const PHASE_6B_MATCH_CANDIDATE_GENERATION_SEED_ID = 'seed_6b_05_match_candidate_generation' as const;
export const PHASE_6B_MATCH_CANDIDATE_GENERATION_COMPONENT_ID = '6B.05' as const;

export const MATCH_CANDIDATE_GENERATION_EVENT = 'phase_6b.crm_deduplication.match_candidate_generation.generated' as const;

export type MatchSignalField = 'EMAIL_REF' | 'PHONE_REF' | 'NAME_KEY' | 'EXTERNAL_REF' | 'PERSON_IDENTITY_GRAPH' | 'PRODUCT_INTEREST';

export type MatchIdentitySignals = {
  email_ref?: string;
  phone_ref?: string;
  normalized_name_key?: string;
  external_source_ref?: string;
  person_identity_graph_id?: string;
  product_interest_ref?: string;
};

export type MatchCandidateLead = {
  lead_record_id: string;
  lead_record_authority_id: string;
  person_identity_graph_id: string;
  source_system: string;
  signals: MatchIdentitySignals;
};

export type MatchCandidateGenerationInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_lead_record_id: string;
  source_lead_record_authority_id: string;
  source_person_identity_graph_id: string;
  dedup_run_id: string;
  generated_at: string;
  source_signals: MatchIdentitySignals;
  candidates: MatchCandidateLead[];
  minimum_score: number;
  merge_decision_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type MatchCandidateEvidence = {
  field: MatchSignalField;
  source_value: string;
  candidate_value: string;
  weight: number;
};

export type GeneratedMatchCandidate = {
  candidate_lead_record_id: string;
  candidate_lead_record_authority_id: string;
  candidate_person_identity_graph_id: string;
  candidate_source_system: string;
  score: number;
  evidence: readonly MatchCandidateEvidence[];
};

export type MatchCandidateGenerationReceipt = {
  seed_id: typeof PHASE_6B_MATCH_CANDIDATE_GENERATION_SEED_ID;
  component_id: typeof PHASE_6B_MATCH_CANDIDATE_GENERATION_COMPONENT_ID;
  event_name: typeof MATCH_CANDIDATE_GENERATION_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_lead_record_id: string;
  source_lead_record_authority_id: string;
  source_person_identity_graph_id: string;
  dedup_run_id: string;
  generated_at: string;
  minimum_score: number;
  evaluated_candidate_count: number;
  generated_candidate_count: number;
  candidates: readonly GeneratedMatchCandidate[];
  merge_decision_allowed: false;
  irreversible_action_allowed: false;
};

const SIGNAL_WEIGHTS: Readonly<Record<MatchSignalField, number>> = {
  EMAIL_REF: 40,
  PHONE_REF: 40,
  NAME_KEY: 15,
  EXTERNAL_REF: 10,
  PERSON_IDENTITY_GRAPH: 25,
  PRODUCT_INTEREST: 5,
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for match candidate generation.`);
  }
  return value.trim();
}

function requireGeneratedAt(value: string): string {
  const normalized = requireNonEmpty(value, 'generated_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('generated_at must be a valid ISO-compatible timestamp for match candidate generation.');
  }
  return normalized;
}

function requireMinimumScore(value: number): number {
  if (!Number.isFinite(value) || value < 1 || value > 100) {
    throw new Error('minimum_score must be between 1 and 100 for match candidate generation.');
  }
  return value;
}

function normalizeSignal(value: string | undefined): string | null {
  if (value === undefined) return null;
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function compareSignal(source: string | undefined, candidate: string | undefined, field: MatchSignalField): MatchCandidateEvidence | null {
  const sourceValue = normalizeSignal(source);
  const candidateValue = normalizeSignal(candidate);
  if (sourceValue === null || candidateValue === null || sourceValue !== candidateValue) {
    return null;
  }
  return {
    field,
    source_value: sourceValue,
    candidate_value: candidateValue,
    weight: SIGNAL_WEIGHTS[field],
  };
}

function scoreCandidate(sourceSignals: MatchIdentitySignals, candidate: MatchCandidateLead): GeneratedMatchCandidate {
  const evidence = [
    compareSignal(sourceSignals.email_ref, candidate.signals.email_ref, 'EMAIL_REF'),
    compareSignal(sourceSignals.phone_ref, candidate.signals.phone_ref, 'PHONE_REF'),
    compareSignal(sourceSignals.normalized_name_key, candidate.signals.normalized_name_key, 'NAME_KEY'),
    compareSignal(sourceSignals.external_source_ref, candidate.signals.external_source_ref, 'EXTERNAL_REF'),
    compareSignal(sourceSignals.person_identity_graph_id, candidate.signals.person_identity_graph_id, 'PERSON_IDENTITY_GRAPH'),
    compareSignal(sourceSignals.product_interest_ref, candidate.signals.product_interest_ref, 'PRODUCT_INTEREST'),
  ].filter((item): item is MatchCandidateEvidence => item !== null);

  return {
    candidate_lead_record_id: requireNonEmpty(candidate.lead_record_id, 'candidate.lead_record_id'),
    candidate_lead_record_authority_id: requireNonEmpty(candidate.lead_record_authority_id, 'candidate.lead_record_authority_id'),
    candidate_person_identity_graph_id: requireNonEmpty(candidate.person_identity_graph_id, 'candidate.person_identity_graph_id'),
    candidate_source_system: requireNonEmpty(candidate.source_system, 'candidate.source_system'),
    score: evidence.reduce((sum, item) => sum + item.weight, 0),
    evidence: Object.freeze(evidence),
  };
}

export function generateMatchCandidates(input: MatchCandidateGenerationInput): MatchCandidateGenerationReceipt {
  if (input.merge_decision_requested === true) {
    throw new Error('match candidate generation must not make merge decisions.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('match candidate generation must not perform irreversible actions.');
  }
  if (!Array.isArray(input.candidates)) {
    throw new Error('candidates must be an array for match candidate generation.');
  }

  const minimumScore = requireMinimumScore(input.minimum_score);
  const sourceLeadRecordId = requireNonEmpty(input.source_lead_record_id, 'source_lead_record_id');
  const sourcePersonIdentityGraphId = requireNonEmpty(input.source_person_identity_graph_id, 'source_person_identity_graph_id');
  const sourceSignals = {
    ...input.source_signals,
    person_identity_graph_id: input.source_signals.person_identity_graph_id ?? sourcePersonIdentityGraphId,
  };

  const generatedCandidates = input.candidates
    .filter((candidate) => candidate.lead_record_id !== sourceLeadRecordId)
    .map((candidate) => scoreCandidate(sourceSignals, candidate))
    .filter((candidate) => candidate.score >= minimumScore && candidate.evidence.length > 0)
    .sort((left, right) => right.score - left.score || left.candidate_lead_record_id.localeCompare(right.candidate_lead_record_id));

  return {
    seed_id: PHASE_6B_MATCH_CANDIDATE_GENERATION_SEED_ID,
    component_id: PHASE_6B_MATCH_CANDIDATE_GENERATION_COMPONENT_ID,
    event_name: MATCH_CANDIDATE_GENERATION_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_lead_record_id: sourceLeadRecordId,
    source_lead_record_authority_id: requireNonEmpty(input.source_lead_record_authority_id, 'source_lead_record_authority_id'),
    source_person_identity_graph_id: sourcePersonIdentityGraphId,
    dedup_run_id: requireNonEmpty(input.dedup_run_id, 'dedup_run_id'),
    generated_at: requireGeneratedAt(input.generated_at),
    minimum_score: minimumScore,
    evaluated_candidate_count: input.candidates.filter((candidate) => candidate.lead_record_id !== sourceLeadRecordId).length,
    generated_candidate_count: generatedCandidates.length,
    candidates: Object.freeze(generatedCandidates),
    merge_decision_allowed: false,
    irreversible_action_allowed: false,
  };
}
