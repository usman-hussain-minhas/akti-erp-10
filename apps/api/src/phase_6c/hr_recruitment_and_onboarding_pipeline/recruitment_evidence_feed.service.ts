import { createHash } from 'node:crypto';

export const PHASE_6C_RECRUITMENT_EVIDENCE_FEED_SEED_ID = "seed_6c_023_recruitment_evidence_feed" as const;
export const PHASE_6C_RECRUITMENT_EVIDENCE_FEED_COMPONENT_ID = "6C.02" as const;
export const RECRUITMENT_EVIDENCE_FEED_SCAFFOLD_EVENT = "phase_6c.hr_recruitment_and_onboarding_pipeline.recruitment_evidence_feed.scaffold_control_evaluated" as const;

export type RecruitmentEvidenceFeedScaffoldInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  capability_execution_requested?: boolean;
  business_behavior_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type RecruitmentEvidenceFeedScaffoldReceipt = {
  seed_id: typeof PHASE_6C_RECRUITMENT_EVIDENCE_FEED_SEED_ID;
  component_id: typeof PHASE_6C_RECRUITMENT_EVIDENCE_FEED_COMPONENT_ID;
  component_slug: "hr_recruitment_and_onboarding_pipeline";
  model_name: "Phase6CRecruitmentEvidenceFeed";
  event_name: typeof RECRUITMENT_EVIDENCE_FEED_SCAFFOLD_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  scaffold_status: 'SCAFFOLD_CONTROL_ONLY';
  capability_implementation_allowed: false;
  business_behavior_allowed: false;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  scaffold_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for recruitment_evidence_feed scaffold control.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for recruitment_evidence_feed scaffold control.');
  }
  return normalized;
}

function digestScaffold(receiptWithoutDigest: Omit<RecruitmentEvidenceFeedScaffoldReceipt, 'scaffold_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateRecruitmentEvidenceFeedScaffold(input: RecruitmentEvidenceFeedScaffoldInput): RecruitmentEvidenceFeedScaffoldReceipt {
  if (input.capability_execution_requested === true) {
    throw new Error('recruitment_evidence_feed scaffold control must not execute capability behavior.');
  }
  if (input.business_behavior_requested === true) {
    throw new Error('recruitment_evidence_feed scaffold control must not execute business behavior.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('recruitment_evidence_feed scaffold control must not execute runtime adapter behavior.');
  }

  const receiptWithoutDigest: Omit<RecruitmentEvidenceFeedScaffoldReceipt, 'scaffold_evidence_digest'> = {
    seed_id: PHASE_6C_RECRUITMENT_EVIDENCE_FEED_SEED_ID,
    component_id: PHASE_6C_RECRUITMENT_EVIDENCE_FEED_COMPONENT_ID,
    component_slug: "hr_recruitment_and_onboarding_pipeline",
    model_name: "Phase6CRecruitmentEvidenceFeed",
    event_name: RECRUITMENT_EVIDENCE_FEED_SCAFFOLD_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    scaffold_status: 'SCAFFOLD_CONTROL_ONLY',
    capability_implementation_allowed: false,
    business_behavior_allowed: false,
    runtime_adapter_allowed: false,
    decision_refs: ["6C-RECRUIT-015"],
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    scaffold_evidence_digest: digestScaffold(receiptWithoutDigest),
  };
}
