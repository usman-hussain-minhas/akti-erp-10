import { createHash } from 'node:crypto';

export const PHASE_6C_RECRUITMENT_EVIDENCE_FEED_SEED_ID = 'seed_6c_023_recruitment_evidence_feed' as const;
export const PHASE_6C_RECRUITMENT_EVIDENCE_FEED_COMPONENT_ID = '6C.02' as const;
export const RECRUITMENT_EVIDENCE_FEED_RUNTIME_EVENT = 'phase_6c.hr_recruitment_and_onboarding_pipeline.recruitment_evidence_feed.emitted' as const;

export type RecruitmentEvidenceType =
  | 'APPLICATION_CREATED'
  | 'STAGE_CHANGED'
  | 'INTERVIEW_COMPLETED'
  | 'OFFER_DECISION'
  | 'OFFER_ACCEPTED'
  | 'ONBOARDING_STARTED'
  | 'REJECTION_RECORDED';

export type RecruitmentEvidenceEvent = {
  evidence_ref: string;
  evidence_type: RecruitmentEvidenceType;
  subject_ref: string;
  source_seed_id: string;
  occurred_at: string;
  outcome_code?: string;
  evidence_value?: string;
};

export type RecruitmentEvidenceFeedInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  feed_ref: string;
  emitted_by_user_id: string;
  emitted_at: string;
  events: readonly RecruitmentEvidenceEvent[];
  control_metadata?: Record<string, unknown>;
  performance_calculation_requested?: boolean;
  optimization_execution_requested?: boolean;
  direct_6d_write_requested?: boolean;
  direct_crm_mutation_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type RecruitmentEvidenceTypeCount = {
  evidence_type: RecruitmentEvidenceType;
  count: number;
};

export type RecruitmentEvidenceFeedReceipt = {
  seed_id: typeof PHASE_6C_RECRUITMENT_EVIDENCE_FEED_SEED_ID;
  component_id: typeof PHASE_6C_RECRUITMENT_EVIDENCE_FEED_COMPONENT_ID;
  component_slug: 'hr_recruitment_and_onboarding_pipeline';
  model_name: 'Phase6CRecruitmentEvidenceFeed';
  event_name: typeof RECRUITMENT_EVIDENCE_FEED_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: 'RECRUITMENT_EVIDENCE_FEED_READY';
  feed_ref: string;
  event_feed_only: true;
  performance_calculation_executed: false;
  optimization_execution_allowed: false;
  phase_6d_dependency_allowed: false;
  direct_crm_mutation_allowed: false;
  event_count: number;
  subject_count: number;
  evidence_refs: readonly string[];
  type_counts: readonly RecruitmentEvidenceTypeCount[];
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  emitted_by_user_id: string;
  emitted_at: string;
  recruitment_evidence_feed_digest: string;
};

type ReceiptWithoutDigest = Omit<RecruitmentEvidenceFeedReceipt, 'recruitment_evidence_feed_digest'>;

const EVIDENCE_TYPES = new Set<RecruitmentEvidenceType>([
  'APPLICATION_CREATED',
  'STAGE_CHANGED',
  'INTERVIEW_COMPLETED',
  'OFFER_DECISION',
  'OFFER_ACCEPTED',
  'ONBOARDING_STARTED',
  'REJECTION_RECORDED',
]);
const DECISION_REFS = ['6C-RECRUIT-015'] as const;
const EVIDENCE_ARTIFACTS = [
  'recruitment_evidence_feed_runtime_receipt',
  'recruitment_evidence_feed_validation_result',
  'recruitment_evidence_feed_forbidden_behavior_rejection_evidence',
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for recruitment_evidence_feed runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for recruitment_evidence_feed runtime.');
  }
  return normalized;
}

function rejectForbiddenRequests(input: RecruitmentEvidenceFeedInput): void {
  if (input.performance_calculation_requested === true) {
    throw new Error('recruitment_evidence_feed runtime must emit evidence only, not calculate performance.');
  }
  if (input.optimization_execution_requested === true) {
    throw new Error('recruitment_evidence_feed runtime must not execute optimization behavior.');
  }
  if (input.direct_6d_write_requested === true) {
    throw new Error('recruitment_evidence_feed runtime must not write to or depend on Phase 6D surfaces.');
  }
  if (input.direct_crm_mutation_requested === true) {
    throw new Error('recruitment_evidence_feed runtime must not mutate CRM records.');
  }
  if (input.schema_mutation_requested === true) {
    throw new Error('recruitment_evidence_feed runtime must not mutate Prisma schema or migrations.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('recruitment_evidence_feed runtime must not mutate Phase 6A surfaces.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('recruitment_evidence_feed runtime must not mutate Phase 6B surfaces.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('recruitment_evidence_feed runtime must not execute runtime adapters.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('recruitment_evidence_feed runtime must not flip ticket or execution authorization flags.');
  }
}

function normalizeEvents(events: readonly RecruitmentEvidenceEvent[]): {
  evidenceRefs: string[];
  subjectCount: number;
  typeCounts: RecruitmentEvidenceTypeCount[];
} {
  if (!Array.isArray(events) || events.length === 0) {
    throw new Error('events must include at least one recruitment evidence event.');
  }
  const evidenceRefs = new Set<string>();
  const subjectRefs = new Set<string>();
  const typeCounts = new Map<RecruitmentEvidenceType, number>();

  for (const event of events) {
    const evidenceRef = requireNonEmpty(event.evidence_ref, 'evidence_ref');
    if (!evidenceRef.startsWith('recruitment_evidence:')) {
      throw new Error('evidence_ref must use recruitment_evidence: prefix.');
    }
    if (evidenceRefs.has(evidenceRef)) {
      throw new Error('evidence_ref must be unique for recruitment_evidence_feed runtime: ' + evidenceRef);
    }
    evidenceRefs.add(evidenceRef);
    if (!EVIDENCE_TYPES.has(event.evidence_type)) {
      throw new Error('unsupported evidence_type for recruitment_evidence_feed runtime: ' + event.evidence_type);
    }
    const subjectRef = requireNonEmpty(event.subject_ref, 'subject_ref');
    subjectRefs.add(subjectRef);
    const sourceSeedId = requireNonEmpty(event.source_seed_id, 'source_seed_id');
    if (!sourceSeedId.startsWith('seed_6c_')) {
      throw new Error('source_seed_id must reference a Phase 6C seed for recruitment evidence.');
    }
    requireTimestamp(event.occurred_at, 'occurred_at');
    if (event.outcome_code !== undefined) {
      requireNonEmpty(event.outcome_code, 'outcome_code');
    }
    if (event.evidence_value !== undefined) {
      requireNonEmpty(event.evidence_value, 'evidence_value');
    }
    typeCounts.set(event.evidence_type, (typeCounts.get(event.evidence_type) ?? 0) + 1);
  }

  return {
    evidenceRefs: [...evidenceRefs].sort(),
    subjectCount: subjectRefs.size,
    typeCounts: [...typeCounts.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([evidence_type, count]) => ({ evidence_type, count })),
  };
}

function digestReceipt(receiptWithoutDigest: ReceiptWithoutDigest): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateRecruitmentEvidenceFeedRuntime(input: RecruitmentEvidenceFeedInput): RecruitmentEvidenceFeedReceipt {
  rejectForbiddenRequests(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const feedRef = requireNonEmpty(input.feed_ref, 'feed_ref');
  if (!feedRef.startsWith('recruitment_evidence_feed:')) {
    throw new Error('feed_ref must use recruitment_evidence_feed: prefix.');
  }
  const emittedByUserId = requireNonEmpty(input.emitted_by_user_id, 'emitted_by_user_id');
  const emittedAt = requireTimestamp(input.emitted_at, 'emitted_at');
  const eventSummary = normalizeEvents(input.events);

  const receiptWithoutDigest: ReceiptWithoutDigest = {
    seed_id: PHASE_6C_RECRUITMENT_EVIDENCE_FEED_SEED_ID,
    component_id: PHASE_6C_RECRUITMENT_EVIDENCE_FEED_COMPONENT_ID,
    component_slug: 'hr_recruitment_and_onboarding_pipeline',
    model_name: 'Phase6CRecruitmentEvidenceFeed',
    event_name: RECRUITMENT_EVIDENCE_FEED_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    runtime_status: 'RECRUITMENT_EVIDENCE_FEED_READY',
    feed_ref: feedRef,
    event_feed_only: true,
    performance_calculation_executed: false,
    optimization_execution_allowed: false,
    phase_6d_dependency_allowed: false,
    direct_crm_mutation_allowed: false,
    event_count: input.events.length,
    subject_count: eventSummary.subjectCount,
    evidence_refs: eventSummary.evidenceRefs,
    type_counts: eventSummary.typeCounts,
    decision_refs: DECISION_REFS,
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    control_metadata: input.control_metadata ?? {},
    emitted_by_user_id: emittedByUserId,
    emitted_at: emittedAt,
  };

  return {
    ...receiptWithoutDigest,
    recruitment_evidence_feed_digest: digestReceipt(receiptWithoutDigest),
  };
}
