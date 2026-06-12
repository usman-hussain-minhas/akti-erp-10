import { createHash } from 'node:crypto';

export const PHASE_6C_WIKI_RESTORE_SEED_ID = "seed_6c_076_wiki_restore" as const;
export const PHASE_6C_WIKI_RESTORE_COMPONENT_ID = "6C.06" as const;
export const WIKI_RESTORE_EVALUATED_EVENT = "phase_6c.workspace_tasks_projects_documents_and_knowledge.wiki_restore.evaluated" as const;

export const wikiRestoreModes = ["CREATE_NEW_VERSION_FROM_PRIOR"] as const;

type WikiRestoreMode = (typeof wikiRestoreModes)[number];
type WikiRestoreDecision = "WIKI_RESTORE_READY" | "WIKI_RESTORE_REQUIRES_REVIEW" | "WIKI_RESTORE_REJECTED";

export type WikiRestoreVersionSnapshot = {
  version_number: number;
  content_hash: string;
  author_user_ref: string;
  created_at: string;
  is_current?: boolean;
};

export type WikiRestoreInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  page_ref: string;
  current_version_number: number;
  target_version_number: number;
  restore_mode: WikiRestoreMode;
  restore_reason: string;
  requested_by_user_ref: string;
  reviewer_user_ref?: string;
  require_reviewer?: boolean;
  version_snapshots: readonly WikiRestoreVersionSnapshot[];
  evidence_refs?: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  overwrite_current_requested?: boolean;
  history_deletion_requested?: boolean;
  restore_execution_requested?: boolean;
  persistence_requested?: boolean;
  frontend_publication_requested?: boolean;
  runtime_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  cross_phase_write_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedWikiRestoreVersionSnapshot = {
  version_number: number;
  content_hash: string;
  author_user_ref: string;
  created_at: string;
  is_current: boolean;
};

export type WikiRestoreReceipt = {
  seed_id: typeof PHASE_6C_WIKI_RESTORE_SEED_ID;
  component_id: typeof PHASE_6C_WIKI_RESTORE_COMPONENT_ID;
  component_slug: "workspace_tasks_projects_documents_and_knowledge";
  model_name: "Phase6CWikiRestore";
  event_name: typeof WIKI_RESTORE_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  page_ref: string;
  decision: WikiRestoreDecision;
  current_version_number: number;
  target_version_number: number;
  restore_mode: WikiRestoreMode;
  restore_reason: string;
  requested_by_user_ref: string;
  reviewer_user_ref: string | null;
  normalized_version_snapshots: readonly NormalizedWikiRestoreVersionSnapshot[];
  evidence_artifacts: readonly string[];
  review_reasons: readonly string[];
  rejection_reasons: readonly string[];
  decision_refs: readonly string[];
  customer_first_restore_policy: "CREATE_NEW_VERSION_ONLY";
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  restore_executed: false;
  persistence_performed: false;
  overwrite_current_performed: false;
  history_deletion_performed: false;
  frontend_publication_performed: false;
  schema_mutation_performed: false;
  cross_phase_write_performed: false;
  ticket_flags_changed: false;
  wiki_restore_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for wiki_restore.');
  }
  return value.trim();
}

function optionalText(value: string | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for wiki_restore.');
  }
  return normalized;
}

function requirePositiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(field + ' must be a positive integer for wiki_restore.');
  }
  return value;
}

function requireOneOf<T extends string>(value: string, allowed: readonly T[], field: string): T {
  if (!allowed.includes(value as T)) {
    throw new Error(field + ' must be one of: ' + allowed.join(', '));
  }
  return value as T;
}

function normalizeList(values: readonly string[] | undefined, field: string): readonly string[] {
  if (values === undefined) {
    return [];
  }
  const normalized = values.map((value) => requireNonEmpty(value, field + ' entry'));
  return Array.from(new Set(normalized)).sort();
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return '[' + value.map((entry) => stableJson(entry)).join(',') + ']';
  }
  if (value !== null && typeof value === 'object') {
    return '{' + Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => JSON.stringify(key) + ':' + stableJson(entry))
      .join(',') + '}';
  }
  return JSON.stringify(value);
}

function digestRestore(receiptWithoutDigest: Omit<WikiRestoreReceipt, 'wiki_restore_evidence_digest'>): string {
  return createHash('sha256').update(stableJson(receiptWithoutDigest)).digest('hex');
}

function assertForbiddenRequests(input: WikiRestoreInput): void {
  const forbiddenRequests: Array<[boolean | undefined, string]> = [
    [input.overwrite_current_requested, 'wiki_restore must not overwrite current content inside this FFET.'],
    [input.history_deletion_requested, 'wiki_restore must not delete version history inside this FFET.'],
    [input.restore_execution_requested, 'wiki_restore must not execute restore inside this FFET.'],
    [input.persistence_requested, 'wiki_restore must not persist database changes inside this FFET.'],
    [input.frontend_publication_requested, 'wiki_restore must not publish frontend routes inside this FFET.'],
    [input.runtime_adapter_requested, 'wiki_restore must not execute runtime adapters inside this FFET.'],
    [input.schema_mutation_requested, 'wiki_restore must not mutate schema inside this FFET.'],
    [input.cross_phase_write_requested, 'wiki_restore must not write cross-phase data inside this FFET.'],
    [input.ticket_flag_flip_requested, 'wiki_restore must not change ticket authorization flags.'],
  ];

  const violation = forbiddenRequests.find(([requested]) => requested === true);
  if (violation !== undefined) {
    throw new Error(violation[1]);
  }
}

function normalizeSnapshots(snapshots: readonly WikiRestoreVersionSnapshot[]): readonly NormalizedWikiRestoreVersionSnapshot[] {
  if (snapshots.length === 0) {
    throw new Error('version_snapshots must include at least one wiki/document version snapshot.');
  }
  return snapshots.map((snapshot) => ({
    version_number: requirePositiveInteger(snapshot.version_number, 'version_number'),
    content_hash: requireNonEmpty(snapshot.content_hash, 'content_hash'),
    author_user_ref: requireNonEmpty(snapshot.author_user_ref, 'author_user_ref'),
    created_at: requireTimestamp(snapshot.created_at, 'created_at'),
    is_current: snapshot.is_current === true,
  })).sort((left, right) => left.version_number - right.version_number);
}

function evaluateRestoreRules(
  snapshots: readonly NormalizedWikiRestoreVersionSnapshot[],
  currentVersionNumber: number,
  targetVersionNumber: number,
  restoreReason: string,
  requestedByUserRef: string,
  reviewerUserRef: string | null,
  requireReviewer: boolean,
): { review_reasons: readonly string[]; rejection_reasons: readonly string[] } {
  const reviewReasons: string[] = [];
  const rejectionReasons: string[] = [];
  const versions = new Set<number>();
  const currentMarked = snapshots.filter((snapshot) => snapshot.is_current).map((snapshot) => snapshot.version_number);

  for (const snapshot of snapshots) {
    if (versions.has(snapshot.version_number)) {
      rejectionReasons.push('duplicate_version_snapshot:' + String(snapshot.version_number));
    }
    versions.add(snapshot.version_number);
    if (!/^[a-f0-9]{64}$/.test(snapshot.content_hash)) {
      rejectionReasons.push('content_hash_must_be_sha256:' + String(snapshot.version_number));
    }
  }

  if (!versions.has(currentVersionNumber)) {
    rejectionReasons.push('current_version_missing:' + String(currentVersionNumber));
  }
  if (!versions.has(targetVersionNumber)) {
    rejectionReasons.push('target_version_missing:' + String(targetVersionNumber));
  }
  if (targetVersionNumber === currentVersionNumber) {
    reviewReasons.push('target_version_is_current_version');
  }
  if (targetVersionNumber > currentVersionNumber) {
    rejectionReasons.push('target_version_is_newer_than_current_version');
  }
  if (currentMarked.length !== 1) {
    reviewReasons.push('exactly_one_snapshot_should_be_marked_current');
  } else if (currentMarked[0] !== currentVersionNumber) {
    reviewReasons.push('marked_current_snapshot_does_not_match_current_version');
  }
  if (restoreReason.trim().length < 12) {
    rejectionReasons.push('restore_reason_requires_customer_visible_detail');
  }
  if (requireReviewer && reviewerUserRef === null) {
    reviewReasons.push('reviewer_required_before_restore_execution');
  }
  if (reviewerUserRef !== null && reviewerUserRef === requestedByUserRef) {
    reviewReasons.push('restore_reviewer_matches_requester');
  }

  return {
    review_reasons: Array.from(new Set(reviewReasons)).sort(),
    rejection_reasons: Array.from(new Set(rejectionReasons)).sort(),
  };
}

export function evaluateWikiRestore(input: WikiRestoreInput): WikiRestoreReceipt {
  assertForbiddenRequests(input);

  const currentVersionNumber = requirePositiveInteger(input.current_version_number, 'current_version_number');
  const targetVersionNumber = requirePositiveInteger(input.target_version_number, 'target_version_number');
  const restoreMode = requireOneOf(requireNonEmpty(input.restore_mode, 'restore_mode'), wikiRestoreModes, 'restore_mode');
  const restoreReason = requireNonEmpty(input.restore_reason, 'restore_reason');
  const requestedByUserRef = requireNonEmpty(input.requested_by_user_ref, 'requested_by_user_ref');
  const reviewerUserRef = optionalText(input.reviewer_user_ref);
  const normalizedSnapshots = normalizeSnapshots(input.version_snapshots);
  const evidenceArtifacts = normalizeList(input.evidence_refs, 'evidence_refs');
  const evaluation = evaluateRestoreRules(
    normalizedSnapshots,
    currentVersionNumber,
    targetVersionNumber,
    restoreReason,
    requestedByUserRef,
    reviewerUserRef,
    input.require_reviewer === true,
  );
  const decision: WikiRestoreDecision = evaluation.rejection_reasons.length > 0
    ? 'WIKI_RESTORE_REJECTED'
    : evaluation.review_reasons.length > 0
      ? 'WIKI_RESTORE_REQUIRES_REVIEW'
      : 'WIKI_RESTORE_READY';

  const receiptWithoutDigest: Omit<WikiRestoreReceipt, 'wiki_restore_evidence_digest'> = {
    seed_id: PHASE_6C_WIKI_RESTORE_SEED_ID,
    component_id: PHASE_6C_WIKI_RESTORE_COMPONENT_ID,
    component_slug: "workspace_tasks_projects_documents_and_knowledge",
    model_name: "Phase6CWikiRestore",
    event_name: WIKI_RESTORE_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    page_ref: requireNonEmpty(input.page_ref, 'page_ref'),
    decision,
    current_version_number: currentVersionNumber,
    target_version_number: targetVersionNumber,
    restore_mode: restoreMode,
    restore_reason: restoreReason,
    requested_by_user_ref: requestedByUserRef,
    reviewer_user_ref: reviewerUserRef,
    normalized_version_snapshots: normalizedSnapshots,
    evidence_artifacts: evidenceArtifacts,
    review_reasons: evaluation.review_reasons,
    rejection_reasons: evaluation.rejection_reasons,
    decision_refs: ["6C-WORK-TASK-014"],
    customer_first_restore_policy: "CREATE_NEW_VERSION_ONLY",
    capability_implementation_allowed: true,
    business_behavior_allowed: true,
    runtime_adapter_allowed: false,
    restore_executed: false,
    persistence_performed: false,
    overwrite_current_performed: false,
    history_deletion_performed: false,
    frontend_publication_performed: false,
    schema_mutation_performed: false,
    cross_phase_write_performed: false,
    ticket_flags_changed: false,
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    wiki_restore_evidence_digest: digestRestore(receiptWithoutDigest),
  };
}
