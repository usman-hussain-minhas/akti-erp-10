import { createHash } from 'node:crypto';

export const PHASE_6C_OFFLINE_CHECKIN_QUEUE_SEED_ID = 'seed_6c_118_offline_checkin_queue' as const;
export const PHASE_6C_OFFLINE_CHECKIN_QUEUE_COMPONENT_ID = '6C.09' as const;
export const OFFLINE_CHECKIN_QUEUE_RUNTIME_EVENT = 'phase_6c.events_check_in_and_post_event_service.offline_checkin_queue.runtime_evaluated' as const;

export type OfflineCheckinQueueDecision =
  | 'OFFLINE_QUEUE_ACCEPTED_FOR_SYNC'
  | 'OFFLINE_QUEUE_REQUIRES_REVIEW'
  | 'OFFLINE_QUEUE_REJECTED_EXPIRED'
  | 'OFFLINE_QUEUE_REJECTED_DUPLICATE'
  | 'OFFLINE_QUEUE_REJECTED_INVALID_PAYLOAD';

export type OfflineCheckinSyncState = 'queued' | 'ready_for_sync' | 'requires_review' | 'rejected';

export type OfflineCheckinQueueEntry = {
  local_entry_ref: string;
  ticket_ref: string;
  attendee_ref: string;
  registration_ref: string;
  event_ref: string;
  session_ref?: string;
  captured_at: string;
  captured_by_device_ref: string;
  captured_by_user_id: string;
  payload_digest: string;
};

export type OfflineCheckinQueueInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_at: string;
  max_offline_age_minutes: number;
  queue_entries: readonly OfflineCheckinQueueEntry[];
  known_synced_entry_refs?: readonly string[];
  control_metadata?: Record<string, unknown>;
  queue_persistence_requested?: boolean;
  network_sync_requested?: boolean;
  checkin_record_creation_requested?: boolean;
  ticket_mutation_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type OfflineCheckinQueueRuntimeReceipt = {
  seed_id: typeof PHASE_6C_OFFLINE_CHECKIN_QUEUE_SEED_ID;
  component_id: typeof PHASE_6C_OFFLINE_CHECKIN_QUEUE_COMPONENT_ID;
  component_slug: 'events_check_in_and_post_event_service';
  model_name: 'Phase6COfflineCheckinQueue';
  event_name: typeof OFFLINE_CHECKIN_QUEUE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_at: string;
  decision: OfflineCheckinQueueDecision;
  sync_state: OfflineCheckinSyncState;
  accepted_entry_refs: readonly string[];
  review_entry_refs: readonly string[];
  rejected_entry_refs: readonly string[];
  duplicate_entry_refs: readonly string[];
  expired_entry_refs: readonly string[];
  entry_count: number;
  max_offline_age_minutes: number;
  rejection_reasons: readonly string[];
  decision_refs: readonly string[];
  dependency_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for offline_checkin_queue runtime evaluation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for offline_checkin_queue runtime evaluation.');
  }
  return normalized;
}

function rejectForbiddenRequests(input: OfflineCheckinQueueInput): void {
  const forbidden: Array<[keyof OfflineCheckinQueueInput, string]> = [
    ['queue_persistence_requested', 'offline_checkin_queue must not persist queue entries.'],
    ['network_sync_requested', 'offline_checkin_queue must not perform network sync.'],
    ['checkin_record_creation_requested', 'offline_checkin_queue must not create check-in records.'],
    ['ticket_mutation_requested', 'offline_checkin_queue must not mutate tickets.'],
    ['schema_mutation_requested', 'offline_checkin_queue must not mutate schema.'],
    ['frontend_requested', 'offline_checkin_queue must not create frontend surfaces.'],
  ];

  for (const [field, message] of forbidden) {
    if (input[field] === true) {
      throw new Error(message);
    }
  }
}

function normalizeEntry(entry: OfflineCheckinQueueEntry, index: number): OfflineCheckinQueueEntry {
  return {
    local_entry_ref: requireNonEmpty(entry.local_entry_ref, 'queue_entries[' + index + '].local_entry_ref'),
    ticket_ref: requireNonEmpty(entry.ticket_ref, 'queue_entries[' + index + '].ticket_ref'),
    attendee_ref: requireNonEmpty(entry.attendee_ref, 'queue_entries[' + index + '].attendee_ref'),
    registration_ref: requireNonEmpty(entry.registration_ref, 'queue_entries[' + index + '].registration_ref'),
    event_ref: requireNonEmpty(entry.event_ref, 'queue_entries[' + index + '].event_ref'),
    session_ref: entry.session_ref === undefined ? undefined : requireNonEmpty(entry.session_ref, 'queue_entries[' + index + '].session_ref'),
    captured_at: requireTimestamp(entry.captured_at, 'queue_entries[' + index + '].captured_at'),
    captured_by_device_ref: requireNonEmpty(entry.captured_by_device_ref, 'queue_entries[' + index + '].captured_by_device_ref'),
    captured_by_user_id: requireNonEmpty(entry.captured_by_user_id, 'queue_entries[' + index + '].captured_by_user_id'),
    payload_digest: requireNonEmpty(entry.payload_digest, 'queue_entries[' + index + '].payload_digest'),
  };
}

function digestReceipt(receiptWithoutDigest: Omit<OfflineCheckinQueueRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateOfflineCheckinQueue(input: OfflineCheckinQueueInput): OfflineCheckinQueueRuntimeReceipt {
  rejectForbiddenRequests(input);

  if (!Number.isInteger(input.max_offline_age_minutes) || input.max_offline_age_minutes <= 0) {
    throw new Error('max_offline_age_minutes must be a positive integer for offline_checkin_queue runtime evaluation.');
  }

  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const evaluatedAtMs = Date.parse(evaluatedAt);
  const entries = input.queue_entries.map(normalizeEntry);
  const knownSynced = new Set((input.known_synced_entry_refs ?? []).map((ref, index) => requireNonEmpty(ref, 'known_synced_entry_refs[' + index + ']')));
  const seen = new Set<string>();
  const accepted: string[] = [];
  const review: string[] = [];
  const rejected: string[] = [];
  const duplicate: string[] = [];
  const expired: string[] = [];
  const reasons: string[] = [];

  for (const entry of entries) {
    const capturedAtMs = Date.parse(entry.captured_at);
    const ageMinutes = Math.floor((evaluatedAtMs - capturedAtMs) / 60000);
    const isDuplicate = seen.has(entry.local_entry_ref) || knownSynced.has(entry.local_entry_ref);
    seen.add(entry.local_entry_ref);

    if (ageMinutes < 0) {
      review.push(entry.local_entry_ref);
      reasons.push('entry_captured_after_evaluation:' + entry.local_entry_ref);
      continue;
    }
    if (isDuplicate) {
      duplicate.push(entry.local_entry_ref);
      rejected.push(entry.local_entry_ref);
      reasons.push('duplicate_offline_entry:' + entry.local_entry_ref);
      continue;
    }
    if (ageMinutes > input.max_offline_age_minutes) {
      expired.push(entry.local_entry_ref);
      rejected.push(entry.local_entry_ref);
      reasons.push('offline_entry_expired:' + entry.local_entry_ref);
      continue;
    }
    if (!/^[a-f0-9]{32,128}$/i.test(entry.payload_digest)) {
      review.push(entry.local_entry_ref);
      reasons.push('payload_digest_not_hex:' + entry.local_entry_ref);
      continue;
    }
    accepted.push(entry.local_entry_ref);
  }

  const decision: OfflineCheckinQueueDecision =
    entries.length === 0 || (accepted.length === 0 && review.length === 0 && rejected.length > 0)
      ? expired.length > 0 && duplicate.length === 0
        ? 'OFFLINE_QUEUE_REJECTED_EXPIRED'
        : duplicate.length > 0
          ? 'OFFLINE_QUEUE_REJECTED_DUPLICATE'
          : 'OFFLINE_QUEUE_REJECTED_INVALID_PAYLOAD'
      : review.length > 0 || (accepted.length > 0 && rejected.length > 0)
        ? 'OFFLINE_QUEUE_REQUIRES_REVIEW'
        : 'OFFLINE_QUEUE_ACCEPTED_FOR_SYNC';

  const syncState: OfflineCheckinSyncState =
    decision === 'OFFLINE_QUEUE_ACCEPTED_FOR_SYNC'
      ? 'ready_for_sync'
      : decision === 'OFFLINE_QUEUE_REQUIRES_REVIEW'
        ? 'requires_review'
        : 'rejected';

  const receiptWithoutDigest: Omit<OfflineCheckinQueueRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_OFFLINE_CHECKIN_QUEUE_SEED_ID,
    component_id: PHASE_6C_OFFLINE_CHECKIN_QUEUE_COMPONENT_ID,
    component_slug: 'events_check_in_and_post_event_service',
    model_name: 'Phase6COfflineCheckinQueue',
    event_name: OFFLINE_CHECKIN_QUEUE_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    evaluated_at: evaluatedAt,
    decision,
    sync_state: syncState,
    accepted_entry_refs: accepted,
    review_entry_refs: review,
    rejected_entry_refs: rejected,
    duplicate_entry_refs: duplicate,
    expired_entry_refs: expired,
    entry_count: entries.length,
    max_offline_age_minutes: input.max_offline_age_minutes,
    rejection_reasons: reasons,
    decision_refs: ['6C-EVENT-CHECK-008', '6C-EVENT-CHECK-014', '6C-EVENT-REG-012'],
    dependency_refs: ['seed_6a_service_manifest_contract', '6C.08'],
    control_metadata: input.control_metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
