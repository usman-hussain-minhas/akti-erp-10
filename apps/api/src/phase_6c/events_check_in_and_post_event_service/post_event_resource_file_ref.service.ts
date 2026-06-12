import { createHash } from 'node:crypto';

export const PHASE_6C_POST_EVENT_RESOURCE_FILE_REF_SEED_ID = 'seed_6c_122_post_event_resource_file_ref' as const;
export const PHASE_6C_POST_EVENT_RESOURCE_FILE_REF_COMPONENT_ID = '6C.09' as const;
export const POST_EVENT_RESOURCE_FILE_REF_RUNTIME_EVENT = 'phase_6c.events_check_in_and_post_event_service.post_event_resource_file_ref.runtime_evaluated' as const;

export type PostEventResourceVisibility = 'attendees_only' | 'registrants' | 'public_link';
export type PostEventResourceDecision = 'RESOURCE_FILE_REFS_READY' | 'RESOURCE_FILE_REFS_REQUIRE_REVIEW' | 'RESOURCE_FILE_REFS_REJECTED_EMPTY' | 'RESOURCE_FILE_REFS_REJECTED_WINDOW_CLOSED';

export type PostEventResourceFileRef = {
  file_ref: string;
  title: string;
  content_type: string;
  checksum_digest?: string;
  visibility: PostEventResourceVisibility;
  available_from?: string;
  available_until?: string;
};

export type PostEventResourceFileRefInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  resources: readonly PostEventResourceFileRef[];
  control_metadata?: Record<string, unknown>;
  file_upload_requested?: boolean;
  file_storage_requested?: boolean;
  file_mutation_requested?: boolean;
  public_url_generation_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type PostEventResourceFileRefRuntimeReceipt = {
  seed_id: typeof PHASE_6C_POST_EVENT_RESOURCE_FILE_REF_SEED_ID;
  component_id: typeof PHASE_6C_POST_EVENT_RESOURCE_FILE_REF_COMPONENT_ID;
  component_slug: 'events_check_in_and_post_event_service';
  model_name: 'Phase6CPostEventResourceFileRef';
  event_name: typeof POST_EVENT_RESOURCE_FILE_REF_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  source_record_ref: string;
  decision: PostEventResourceDecision;
  ready_file_refs: readonly string[];
  review_file_refs: readonly string[];
  resource_count: number;
  rejection_reasons: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  decision_refs: readonly string[];
  dependency_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for post_event_resource_file_ref runtime evaluation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for post_event_resource_file_ref runtime evaluation.');
  }
  return normalized;
}

function normalizeOptionalTimestamp(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  return requireTimestamp(value, field);
}

function rejectForbiddenRequests(input: PostEventResourceFileRefInput): void {
  const forbidden: Array<[keyof PostEventResourceFileRefInput, string]> = [
    ['file_upload_requested', 'post_event_resource_file_ref must not upload files.'],
    ['file_storage_requested', 'post_event_resource_file_ref must not store files.'],
    ['file_mutation_requested', 'post_event_resource_file_ref must not mutate files.'],
    ['public_url_generation_requested', 'post_event_resource_file_ref must not generate public URLs.'],
    ['schema_mutation_requested', 'post_event_resource_file_ref must not mutate schema.'],
    ['frontend_requested', 'post_event_resource_file_ref must not create frontend surfaces.'],
  ];

  for (const [field, message] of forbidden) {
    if (input[field] === true) {
      throw new Error(message);
    }
  }
}

function digestReceipt(receiptWithoutDigest: Omit<PostEventResourceFileRefRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function evaluateResource(resource: PostEventResourceFileRef, index: number, evaluatedAtMs: number): { fileRef: string; reviewReasons: string[]; closed: boolean } {
  const fileRef = requireNonEmpty(resource.file_ref, 'resources[' + index + '].file_ref');
  const title = requireNonEmpty(resource.title, 'resources[' + index + '].title');
  const contentType = requireNonEmpty(resource.content_type, 'resources[' + index + '].content_type');
  const availableFrom = normalizeOptionalTimestamp(resource.available_from, 'resources[' + index + '].available_from');
  const availableUntil = normalizeOptionalTimestamp(resource.available_until, 'resources[' + index + '].available_until');
  const reasons: string[] = [];
  if (title.length < 3) {
    reasons.push('resource_title_too_short:' + fileRef);
  }
  if (!/^[a-z0-9.+-]+\/[a-z0-9.+-]+$/i.test(contentType)) {
    reasons.push('content_type_invalid:' + fileRef);
  }
  if (resource.visibility === 'public_link') {
    reasons.push('public_link_visibility_requires_review:' + fileRef);
  }
  if (resource.checksum_digest !== undefined && !/^[a-f0-9]{32,128}$/i.test(requireNonEmpty(resource.checksum_digest, 'resources[' + index + '].checksum_digest'))) {
    reasons.push('checksum_digest_invalid:' + fileRef);
  }
  if (availableFrom !== null && Date.parse(availableFrom) > evaluatedAtMs) {
    reasons.push('resource_not_yet_available:' + fileRef);
  }
  const closed = availableUntil !== null && Date.parse(availableUntil) < evaluatedAtMs;
  if (closed) {
    reasons.push('resource_window_closed:' + fileRef);
  }
  return { fileRef, reviewReasons: reasons, closed };
}

export function evaluatePostEventResourceFileRef(input: PostEventResourceFileRefInput): PostEventResourceFileRefRuntimeReceipt {
  rejectForbiddenRequests(input);

  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const evaluatedAtMs = Date.parse(evaluatedAt);
  const ready: string[] = [];
  const review: string[] = [];
  const reasons: string[] = [];
  let closedCount = 0;

  for (let index = 0; index < input.resources.length; index += 1) {
    const result = evaluateResource(input.resources[index], index, evaluatedAtMs);
    if (result.closed) {
      closedCount += 1;
    }
    if (result.reviewReasons.length > 0) {
      review.push(result.fileRef);
      reasons.push(...result.reviewReasons);
    } else {
      ready.push(result.fileRef);
    }
  }

  const decision: PostEventResourceDecision =
    input.resources.length === 0
      ? 'RESOURCE_FILE_REFS_REJECTED_EMPTY'
      : closedCount === input.resources.length
        ? 'RESOURCE_FILE_REFS_REJECTED_WINDOW_CLOSED'
        : review.length > 0
          ? 'RESOURCE_FILE_REFS_REQUIRE_REVIEW'
          : 'RESOURCE_FILE_REFS_READY';

  const receiptWithoutDigest: Omit<PostEventResourceFileRefRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_POST_EVENT_RESOURCE_FILE_REF_SEED_ID,
    component_id: PHASE_6C_POST_EVENT_RESOURCE_FILE_REF_COMPONENT_ID,
    component_slug: 'events_check_in_and_post_event_service',
    model_name: 'Phase6CPostEventResourceFileRef',
    event_name: POST_EVENT_RESOURCE_FILE_REF_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    event_ref: requireNonEmpty(input.event_ref, 'event_ref'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    decision,
    ready_file_refs: ready,
    review_file_refs: review,
    resource_count: input.resources.length,
    rejection_reasons: input.resources.length === 0 ? ['post_event_resource_file_refs_required'] : reasons,
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: evaluatedAt,
    decision_refs: ['6C-EVENT-CHECK-012', '6C-EVENT-CHECK-014', '6C-EVENT-REG-012'],
    dependency_refs: ['seed_6a_service_manifest_contract', '6C.08'],
    control_metadata: input.control_metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
