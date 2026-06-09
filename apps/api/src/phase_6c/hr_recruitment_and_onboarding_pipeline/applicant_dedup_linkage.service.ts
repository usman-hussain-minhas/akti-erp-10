import { createHash } from 'node:crypto';

export const PHASE_6C_APPLICANT_DEDUP_LINKAGE_SEED_ID = 'seed_6c_022_applicant_dedup_linkage' as const;
export const PHASE_6C_APPLICANT_DEDUP_LINKAGE_COMPONENT_ID = '6C.02' as const;
export const APPLICANT_DEDUP_LINKAGE_RUNTIME_EVENT = 'phase_6c.hr_recruitment_and_onboarding_pipeline.applicant_dedup_linkage.evaluated' as const;

export type ApplicantDedupSignalType = 'EMAIL_HASH' | 'PHONE_HASH' | 'PERSON_IDENTITY_REF' | 'CRM_LEAD_REF' | 'EXTERNAL_APPLICANT_REF';
export type ApplicantDedupCandidateSource = 'APPLICANT' | 'CRM_LEAD' | 'PERSON_IDENTITY_REF';
export type ApplicantDedupOutcome = 'NO_DUPLICATE_MATCH' | 'POTENTIAL_DUPLICATE_LINKS_FOUND';

export type ApplicantDedupSignal = {
  signal_type: ApplicantDedupSignalType;
  signal_value: string;
};

export type ApplicantDedupPatternWeight = {
  signal_type: ApplicantDedupSignalType;
  weight: number;
};

export type ApplicantDedupPattern = {
  pattern_ref: string;
  threshold_score: number;
  signal_weights: readonly ApplicantDedupPatternWeight[];
};

export type ApplicantDedupCandidate = {
  candidate_ref: string;
  source: ApplicantDedupCandidateSource;
  active: boolean;
  signals: readonly ApplicantDedupSignal[];
};

export type ApplicantDedupLinkageInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  applicant_ref: string;
  dedup_pattern: ApplicantDedupPattern;
  applicant_signals: readonly ApplicantDedupSignal[];
  candidates: readonly ApplicantDedupCandidate[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  destructive_merge_requested?: boolean;
  direct_crm_mutation_requested?: boolean;
  applicant_record_mutation_requested?: boolean;
  person_identity_graph_mutation_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type ApplicantDedupCandidateMatch = {
  candidate_ref: string;
  source: ApplicantDedupCandidateSource;
  score: number;
  matched_signal_types: readonly ApplicantDedupSignalType[];
  recommended_linkage_ref: string;
};

export type ApplicantDedupLinkageReceipt = {
  seed_id: typeof PHASE_6C_APPLICANT_DEDUP_LINKAGE_SEED_ID;
  component_id: typeof PHASE_6C_APPLICANT_DEDUP_LINKAGE_COMPONENT_ID;
  component_slug: 'hr_recruitment_and_onboarding_pipeline';
  model_name: 'Phase6CApplicantDedupLinkage';
  event_name: typeof APPLICANT_DEDUP_LINKAGE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  applicant_ref: string;
  runtime_status: 'APPLICANT_DEDUP_LINKAGE_EVALUATED';
  dedup_pattern_ref: string;
  threshold_score: number;
  outcome: ApplicantDedupOutcome;
  retain_and_link_only: true;
  destructive_merge_allowed: false;
  direct_crm_mutation_allowed: false;
  applicant_record_mutation_allowed: false;
  person_identity_graph_mutation_allowed: false;
  crm_patterns_reused: true;
  candidate_count: number;
  active_candidate_count: number;
  match_count: number;
  matches: readonly ApplicantDedupCandidateMatch[];
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  applicant_dedup_linkage_evidence_digest: string;
};

type ReceiptWithoutDigest = Omit<ApplicantDedupLinkageReceipt, 'applicant_dedup_linkage_evidence_digest'>;

const SIGNAL_TYPES = new Set<ApplicantDedupSignalType>([
  'EMAIL_HASH',
  'PHONE_HASH',
  'PERSON_IDENTITY_REF',
  'CRM_LEAD_REF',
  'EXTERNAL_APPLICANT_REF',
]);
const CANDIDATE_SOURCES = new Set<ApplicantDedupCandidateSource>(['APPLICANT', 'CRM_LEAD', 'PERSON_IDENTITY_REF']);
const DECISION_REFS = ['6C-RECRUIT-014', '6C-RECRUIT-002'] as const;
const EVIDENCE_ARTIFACTS = [
  'applicant_dedup_linkage_runtime_receipt',
  'applicant_dedup_linkage_validation_result',
  'applicant_dedup_linkage_forbidden_behavior_rejection_evidence',
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for applicant_dedup_linkage runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for applicant_dedup_linkage runtime.');
  }
  return normalized;
}

function rejectForbiddenRequests(input: ApplicantDedupLinkageInput): void {
  if (input.destructive_merge_requested === true) {
    throw new Error('applicant_dedup_linkage runtime must retain and link, not destructively merge applicants or CRM leads.');
  }
  if (input.direct_crm_mutation_requested === true) {
    throw new Error('applicant_dedup_linkage runtime must not mutate CRM records.');
  }
  if (input.applicant_record_mutation_requested === true) {
    throw new Error('applicant_dedup_linkage runtime must not mutate applicant records.');
  }
  if (input.person_identity_graph_mutation_requested === true) {
    throw new Error('applicant_dedup_linkage runtime must not mutate the Person/Identity Graph.');
  }
  if (input.schema_mutation_requested === true) {
    throw new Error('applicant_dedup_linkage runtime must not mutate Prisma schema or migrations.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('applicant_dedup_linkage runtime must not mutate Phase 6A surfaces.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('applicant_dedup_linkage runtime must not mutate Phase 6B surfaces.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('applicant_dedup_linkage runtime must not execute runtime adapters.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('applicant_dedup_linkage runtime must not flip ticket or execution authorization flags.');
  }
}

function normalizeSignal(signal: ApplicantDedupSignal, context: string): ApplicantDedupSignal {
  if (!SIGNAL_TYPES.has(signal.signal_type)) {
    throw new Error('unsupported dedup signal_type for applicant_dedup_linkage runtime: ' + signal.signal_type);
  }
  return {
    signal_type: signal.signal_type,
    signal_value: requireNonEmpty(signal.signal_value, context + ' signal_value').toLowerCase(),
  };
}

function normalizeSignals(signals: readonly ApplicantDedupSignal[], context: string): ApplicantDedupSignal[] {
  if (!Array.isArray(signals) || signals.length === 0) {
    throw new Error(context + ' must include at least one dedup signal for applicant_dedup_linkage runtime.');
  }
  const seen = new Set<string>();
  return signals.map((signal) => normalizeSignal(signal, context)).filter((signal) => {
    const key = signal.signal_type + ':' + signal.signal_value;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function normalizePattern(pattern: ApplicantDedupPattern): Map<ApplicantDedupSignalType, number> {
  const patternRef = requireNonEmpty(pattern.pattern_ref, 'dedup_pattern.pattern_ref');
  if (!patternRef.startsWith('crm_dedup_pattern:')) {
    throw new Error('dedup_pattern.pattern_ref must reuse a CRM dedup pattern reference.');
  }
  if (!Number.isFinite(pattern.threshold_score) || pattern.threshold_score <= 0) {
    throw new Error('dedup_pattern.threshold_score must be a positive number for applicant_dedup_linkage runtime.');
  }
  if (!Array.isArray(pattern.signal_weights) || pattern.signal_weights.length === 0) {
    throw new Error('dedup_pattern.signal_weights must include at least one weighted signal.');
  }

  const weights = new Map<ApplicantDedupSignalType, number>();
  for (const weight of pattern.signal_weights) {
    if (!SIGNAL_TYPES.has(weight.signal_type)) {
      throw new Error('unsupported dedup pattern signal_type: ' + weight.signal_type);
    }
    if (!Number.isFinite(weight.weight) || weight.weight <= 0) {
      throw new Error('dedup pattern weight must be positive for signal_type: ' + weight.signal_type);
    }
    if (weights.has(weight.signal_type)) {
      throw new Error('dedup pattern signal_type weight must be unique: ' + weight.signal_type);
    }
    weights.set(weight.signal_type, weight.weight);
  }
  return weights;
}

function scoreCandidate(
  applicantSignals: readonly ApplicantDedupSignal[],
  candidate: ApplicantDedupCandidate,
  weights: ReadonlyMap<ApplicantDedupSignalType, number>,
  thresholdScore: number,
): ApplicantDedupCandidateMatch | null {
  const candidateRef = requireNonEmpty(candidate.candidate_ref, 'candidate_ref');
  if (!CANDIDATE_SOURCES.has(candidate.source)) {
    throw new Error('unsupported candidate source for applicant_dedup_linkage runtime: ' + candidate.source);
  }
  if (typeof candidate.active !== 'boolean') {
    throw new Error('candidate active flag must be boolean for applicant_dedup_linkage runtime: ' + candidateRef);
  }
  const candidateSignals = normalizeSignals(candidate.signals, 'candidate ' + candidateRef);
  if (!candidate.active) {
    return null;
  }

  const applicantSignalValues = new Set(applicantSignals.map((signal) => signal.signal_type + ':' + signal.signal_value));
  const matchedSignalTypes = new Set<ApplicantDedupSignalType>();
  let score = 0;
  for (const signal of candidateSignals) {
    if (applicantSignalValues.has(signal.signal_type + ':' + signal.signal_value)) {
      const weight = weights.get(signal.signal_type) ?? 0;
      if (weight > 0 && !matchedSignalTypes.has(signal.signal_type)) {
        score += weight;
        matchedSignalTypes.add(signal.signal_type);
      }
    }
  }

  if (score < thresholdScore) {
    return null;
  }
  const matchedTypes = [...matchedSignalTypes].sort();
  return {
    candidate_ref: candidateRef,
    source: candidate.source,
    score,
    matched_signal_types: matchedTypes,
    recommended_linkage_ref: 'dedup_linkage:' + createHash('sha256').update(candidateRef + ':' + matchedTypes.join('|')).digest('hex').slice(0, 24),
  };
}

function digestReceipt(receiptWithoutDigest: ReceiptWithoutDigest): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateApplicantDedupLinkageRuntime(input: ApplicantDedupLinkageInput): ApplicantDedupLinkageReceipt {
  rejectForbiddenRequests(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const applicantRef = requireNonEmpty(input.applicant_ref, 'applicant_ref');
  const evaluatedByUserId = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const weights = normalizePattern(input.dedup_pattern);
  const applicantSignals = normalizeSignals(input.applicant_signals, 'applicant_signals');
  if (!Array.isArray(input.candidates)) {
    throw new Error('candidates must be provided for applicant_dedup_linkage runtime.');
  }

  const matches = input.candidates
    .map((candidate) => scoreCandidate(applicantSignals, candidate, weights, input.dedup_pattern.threshold_score))
    .filter((match): match is ApplicantDedupCandidateMatch => match !== null)
    .sort((a, b) => b.score - a.score || a.candidate_ref.localeCompare(b.candidate_ref));
  const activeCandidateCount = input.candidates.filter((candidate) => candidate.active === true).length;

  const receiptWithoutDigest: ReceiptWithoutDigest = {
    seed_id: PHASE_6C_APPLICANT_DEDUP_LINKAGE_SEED_ID,
    component_id: PHASE_6C_APPLICANT_DEDUP_LINKAGE_COMPONENT_ID,
    component_slug: 'hr_recruitment_and_onboarding_pipeline',
    model_name: 'Phase6CApplicantDedupLinkage',
    event_name: APPLICANT_DEDUP_LINKAGE_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    applicant_ref: applicantRef,
    runtime_status: 'APPLICANT_DEDUP_LINKAGE_EVALUATED',
    dedup_pattern_ref: input.dedup_pattern.pattern_ref,
    threshold_score: input.dedup_pattern.threshold_score,
    outcome: matches.length > 0 ? 'POTENTIAL_DUPLICATE_LINKS_FOUND' : 'NO_DUPLICATE_MATCH',
    retain_and_link_only: true,
    destructive_merge_allowed: false,
    direct_crm_mutation_allowed: false,
    applicant_record_mutation_allowed: false,
    person_identity_graph_mutation_allowed: false,
    crm_patterns_reused: true,
    candidate_count: input.candidates.length,
    active_candidate_count: activeCandidateCount,
    match_count: matches.length,
    matches,
    decision_refs: DECISION_REFS,
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: evaluatedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    applicant_dedup_linkage_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
