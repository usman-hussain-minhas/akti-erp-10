import { createHash } from 'node:crypto';

export const PHASE_6C_WIKI_PAGE_VERSIONING_SEED_ID = "seed_6c_075_wiki_page_versioning" as const;
export const PHASE_6C_WIKI_PAGE_VERSIONING_COMPONENT_ID = "6C.06" as const;
export const WIKI_PAGE_VERSIONING_EVALUATED_EVENT = "phase_6c.workspace_tasks_projects_documents_and_knowledge.wiki_page_versioning.evaluated" as const;

export const wikiPageVersionChangeTypes = ["CREATE", "UPDATE", "PUBLISH", "RESTORE"] as const;

type WikiPageVersionChangeType = (typeof wikiPageVersionChangeTypes)[number];
type WikiPageVersioningDecision = "WIKI_VERSION_HISTORY_READY" | "WIKI_VERSION_HISTORY_REQUIRES_REVIEW" | "WIKI_VERSION_HISTORY_REJECTED";

export type WikiPageVersionInput = {
  version_number: number;
  title: string;
  content: string;
  author_user_ref: string;
  created_at: string;
  change_type: WikiPageVersionChangeType;
  change_summary?: string;
  published?: boolean;
  restored_from_version_number?: number;
  evidence_refs?: readonly string[];
};

export type WikiPageVersioningInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  page_ref: string;
  current_version_number: number;
  versions: readonly WikiPageVersionInput[];
  restore_candidate_version_number?: number;
  evaluated_by_user_id: string;
  evaluated_at: string;
  persistence_requested?: boolean;
  restore_execution_requested?: boolean;
  realtime_collaboration_requested?: boolean;
  frontend_editor_requested?: boolean;
  runtime_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  cross_phase_write_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedWikiPageVersion = {
  version_number: number;
  title: string;
  content_hash: string;
  author_user_ref: string;
  created_at: string;
  change_type: WikiPageVersionChangeType;
  change_summary: string | null;
  published: boolean;
  restored_from_version_number: number | null;
  evidence_refs: readonly string[];
};

export type WikiPageVersioningReceipt = {
  seed_id: typeof PHASE_6C_WIKI_PAGE_VERSIONING_SEED_ID;
  component_id: typeof PHASE_6C_WIKI_PAGE_VERSIONING_COMPONENT_ID;
  component_slug: "workspace_tasks_projects_documents_and_knowledge";
  model_name: "Phase6CWikiPageVersioning";
  event_name: typeof WIKI_PAGE_VERSIONING_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  page_ref: string;
  decision: WikiPageVersioningDecision;
  current_version_number: number;
  normalized_versions: readonly NormalizedWikiPageVersion[];
  restore_candidate_version_number: number | null;
  restore_candidate_available: boolean;
  review_reasons: readonly string[];
  rejection_reasons: readonly string[];
  decision_refs: readonly string[];
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  persistence_performed: false;
  restore_executed: false;
  realtime_collaboration_enabled: false;
  frontend_editor_published: false;
  schema_mutation_performed: false;
  cross_phase_write_performed: false;
  ticket_flags_changed: false;
  wiki_page_versioning_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for wiki_page_versioning.');
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
    throw new Error(field + ' must be a valid ISO-compatible timestamp for wiki_page_versioning.');
  }
  return normalized;
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

function digestText(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function digestHistory(receiptWithoutDigest: Omit<WikiPageVersioningReceipt, 'wiki_page_versioning_evidence_digest'>): string {
  return createHash('sha256').update(stableJson(receiptWithoutDigest)).digest('hex');
}

function assertForbiddenRequests(input: WikiPageVersioningInput): void {
  const forbiddenRequests: Array<[boolean | undefined, string]> = [
    [input.persistence_requested, 'wiki_page_versioning must not persist database changes inside this FFET.'],
    [input.restore_execution_requested, 'wiki_page_versioning must not execute restore inside this FFET.'],
    [input.realtime_collaboration_requested, 'wiki_page_versioning must not enable real-time collaboration inside this FFET.'],
    [input.frontend_editor_requested, 'wiki_page_versioning must not publish frontend editor behavior inside this FFET.'],
    [input.runtime_adapter_requested, 'wiki_page_versioning must not execute runtime adapters inside this FFET.'],
    [input.schema_mutation_requested, 'wiki_page_versioning must not mutate schema inside this FFET.'],
    [input.cross_phase_write_requested, 'wiki_page_versioning must not write cross-phase data inside this FFET.'],
    [input.ticket_flag_flip_requested, 'wiki_page_versioning must not change ticket authorization flags.'],
  ];

  const violation = forbiddenRequests.find(([requested]) => requested === true);
  if (violation !== undefined) {
    throw new Error(violation[1]);
  }
}

function normalizeVersions(versions: readonly WikiPageVersionInput[]): readonly NormalizedWikiPageVersion[] {
  if (versions.length === 0) {
    throw new Error('versions must include at least one wiki page version.');
  }

  return versions.map((version) => {
    if (!Number.isInteger(version.version_number) || version.version_number <= 0) {
      throw new Error('version_number must be a positive integer for wiki_page_versioning.');
    }
    const createdAt = requireTimestamp(version.created_at, 'created_at');
    const content = requireNonEmpty(version.content, 'content');
    return {
      version_number: version.version_number,
      title: requireNonEmpty(version.title, 'title'),
      content_hash: digestText(content),
      author_user_ref: requireNonEmpty(version.author_user_ref, 'author_user_ref'),
      created_at: createdAt,
      change_type: requireOneOf(requireNonEmpty(version.change_type, 'change_type'), wikiPageVersionChangeTypes, 'change_type'),
      change_summary: optionalText(version.change_summary),
      published: version.published === true,
      restored_from_version_number: version.restored_from_version_number ?? null,
      evidence_refs: normalizeList(version.evidence_refs, 'evidence_refs'),
    };
  }).sort((left, right) => left.version_number - right.version_number);
}

function evaluateHistory(
  versions: readonly NormalizedWikiPageVersion[],
  currentVersionNumber: number,
  restoreCandidateVersionNumber: number | null,
): { restore_candidate_available: boolean; review_reasons: readonly string[]; rejection_reasons: readonly string[] } {
  const reviewReasons: string[] = [];
  const rejectionReasons: string[] = [];
  const seenVersions = new Set<number>();
  let previousTimestamp: number | null = null;

  for (const version of versions) {
    if (seenVersions.has(version.version_number)) {
      rejectionReasons.push('duplicate_version_number:' + String(version.version_number));
    }
    seenVersions.add(version.version_number);

    const timestamp = Date.parse(version.created_at);
    if (previousTimestamp !== null && timestamp < previousTimestamp) {
      reviewReasons.push('version_timestamp_regressed:' + String(version.version_number));
    }
    previousTimestamp = timestamp;

    if (version.version_number === 1 && version.change_type !== 'CREATE') {
      reviewReasons.push('first_version_should_be_create');
    }
    if (version.change_type === 'RESTORE' && version.restored_from_version_number === null) {
      rejectionReasons.push('restore_version_requires_source_version:' + String(version.version_number));
    }
    if (version.restored_from_version_number !== null && !seenVersions.has(version.restored_from_version_number)) {
      rejectionReasons.push('restored_from_version_missing:' + String(version.restored_from_version_number));
    }
  }

  if (!seenVersions.has(currentVersionNumber)) {
    rejectionReasons.push('current_version_number_missing:' + String(currentVersionNumber));
  }

  const publishedVersions = versions.filter((version) => version.published).map((version) => version.version_number);
  if (publishedVersions.length > 1) {
    reviewReasons.push('multiple_versions_marked_published');
  }
  if (publishedVersions.length === 1 && publishedVersions[0] !== currentVersionNumber) {
    reviewReasons.push('published_version_is_not_current');
  }

  const restoreCandidateAvailable = restoreCandidateVersionNumber !== null && seenVersions.has(restoreCandidateVersionNumber) && restoreCandidateVersionNumber !== currentVersionNumber;
  if (restoreCandidateVersionNumber !== null && !seenVersions.has(restoreCandidateVersionNumber)) {
    rejectionReasons.push('restore_candidate_version_missing:' + String(restoreCandidateVersionNumber));
  }
  if (restoreCandidateVersionNumber !== null && restoreCandidateVersionNumber === currentVersionNumber) {
    reviewReasons.push('restore_candidate_is_current_version');
  }

  return {
    restore_candidate_available: restoreCandidateAvailable,
    review_reasons: Array.from(new Set(reviewReasons)).sort(),
    rejection_reasons: Array.from(new Set(rejectionReasons)).sort(),
  };
}

export function evaluateWikiPageVersioning(input: WikiPageVersioningInput): WikiPageVersioningReceipt {
  assertForbiddenRequests(input);

  if (!Number.isInteger(input.current_version_number) || input.current_version_number <= 0) {
    throw new Error('current_version_number must be a positive integer for wiki_page_versioning.');
  }
  const restoreCandidateVersionNumber = input.restore_candidate_version_number ?? null;
  if (restoreCandidateVersionNumber !== null && (!Number.isInteger(restoreCandidateVersionNumber) || restoreCandidateVersionNumber <= 0)) {
    throw new Error('restore_candidate_version_number must be a positive integer for wiki_page_versioning.');
  }

  const normalizedVersions = normalizeVersions(input.versions);
  const evaluation = evaluateHistory(normalizedVersions, input.current_version_number, restoreCandidateVersionNumber);
  const decision: WikiPageVersioningDecision = evaluation.rejection_reasons.length > 0
    ? 'WIKI_VERSION_HISTORY_REJECTED'
    : evaluation.review_reasons.length > 0
      ? 'WIKI_VERSION_HISTORY_REQUIRES_REVIEW'
      : 'WIKI_VERSION_HISTORY_READY';

  const receiptWithoutDigest: Omit<WikiPageVersioningReceipt, 'wiki_page_versioning_evidence_digest'> = {
    seed_id: PHASE_6C_WIKI_PAGE_VERSIONING_SEED_ID,
    component_id: PHASE_6C_WIKI_PAGE_VERSIONING_COMPONENT_ID,
    component_slug: "workspace_tasks_projects_documents_and_knowledge",
    model_name: "Phase6CWikiPageVersioning",
    event_name: WIKI_PAGE_VERSIONING_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    page_ref: requireNonEmpty(input.page_ref, 'page_ref'),
    decision,
    current_version_number: input.current_version_number,
    normalized_versions: normalizedVersions,
    restore_candidate_version_number: restoreCandidateVersionNumber,
    restore_candidate_available: evaluation.restore_candidate_available,
    review_reasons: evaluation.review_reasons,
    rejection_reasons: evaluation.rejection_reasons,
    decision_refs: ["6C-WORK-TASK-007", "6C-WORK-TASK-008"],
    capability_implementation_allowed: true,
    business_behavior_allowed: true,
    runtime_adapter_allowed: false,
    persistence_performed: false,
    restore_executed: false,
    realtime_collaboration_enabled: false,
    frontend_editor_published: false,
    schema_mutation_performed: false,
    cross_phase_write_performed: false,
    ticket_flags_changed: false,
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    wiki_page_versioning_evidence_digest: digestHistory(receiptWithoutDigest),
  };
}
