import { createHash } from 'node:crypto';

export const PHASE_6C_SYNC_FAILURE_DEGRADATION_SEED_ID = 'seed_6c_094_sync_failure_degradation' as const;
export const PHASE_6C_SYNC_FAILURE_DEGRADATION_COMPONENT_ID = '6C.07' as const;
export const SYNC_FAILURE_DEGRADATION_RUNTIME_EVENT = 'phase_6c.workspace_calendar_meetings_rooms_announcements.sync_failure_degradation.runtime_evaluated' as const;

export const SYNC_FAILURE_DEGRADATION_DECISION_REFS = ['6C-CAL-012'] as const;

export type CalendarSyncSurface = 'CALENDAR_PROVIDER' | 'CONFERENCING_PROVIDER' | 'ROOM_RESOURCE_PROVIDER';
export type CalendarSyncFailureClass = 'NETWORK_TIMEOUT' | 'RATE_LIMIT' | 'PROVIDER_5XX' | 'AUTH_EXPIRED' | 'CONFLICT_DETECTED' | 'VALIDATION_REJECTED' | 'UNKNOWN';
export type CalendarSyncDegradationDecision = 'RETRY_WITH_BACKOFF' | 'DEGRADED_LOCAL_ONLY' | 'MANUAL_REVIEW_REQUIRED' | 'BLOCK_UNSAFE_SYNC';

export type SyncFailureDegradationInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  sync_job_ref: string;
  source_record_ref: string;
  requested_by_user_id: string;
  evaluated_at: string;
  sync_surface: CalendarSyncSurface;
  failure_class: CalendarSyncFailureClass;
  failure_message_ref: string;
  attempt_count: number;
  max_retry_attempts: number;
  last_successful_sync_at?: string;
  provider_correlation_id: string;
  provider_retry_execution_requested?: boolean;
  provider_mutation_requested?: boolean;
  credential_access_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type SyncFailureDegradationReceipt = {
  seed_id: typeof PHASE_6C_SYNC_FAILURE_DEGRADATION_SEED_ID;
  component_id: typeof PHASE_6C_SYNC_FAILURE_DEGRADATION_COMPONENT_ID;
  component_slug: 'workspace_calendar_meetings_rooms_announcements';
  model_name: 'Phase6CSyncFailureDegradation';
  event_name: typeof SYNC_FAILURE_DEGRADATION_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  sync_job_ref: string;
  source_record_ref: string;
  sync_surface: CalendarSyncSurface;
  failure_class: CalendarSyncFailureClass;
  decision: CalendarSyncDegradationDecision;
  fallback_surface: 'LOCAL_CALENDAR_READMODEL';
  provider_retry_executed: false;
  provider_mutation_executed: false;
  credential_access_executed: false;
  runtime_adapter_executed: false;
  persistence_executed: false;
  next_retry_after_seconds: number | null;
  manual_review_reason: string | null;
  operator_message: string;
  required_evidence_artifacts: readonly string[];
  decision_refs: typeof SYNC_FAILURE_DEGRADATION_DECISION_REFS;
  provider_correlation_id: string;
  requested_by_user_id: string;
  evaluated_at: string;
  runtime_evidence_digest: string;
};

const SURFACES = new Set<CalendarSyncSurface>(['CALENDAR_PROVIDER', 'CONFERENCING_PROVIDER', 'ROOM_RESOURCE_PROVIDER']);
const FAILURE_CLASSES = new Set<CalendarSyncFailureClass>(['NETWORK_TIMEOUT', 'RATE_LIMIT', 'PROVIDER_5XX', 'AUTH_EXPIRED', 'CONFLICT_DETECTED', 'VALIDATION_REJECTED', 'UNKNOWN']);

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for sync failure degradation evaluation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for sync failure degradation evaluation.');
  }
  return normalized;
}

function requireNonNegativeInteger(value: number | undefined, field: string): number {
  if (!Number.isInteger(value) || value === undefined || value < 0) {
    throw new Error(field + ' must be a non-negative integer.');
  }
  return value;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return '[' + value.map((item) => stableStringify(item)).join(',') + ']';
  }
  if (value && typeof value === 'object') {
    return '{' + Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => JSON.stringify(key) + ':' + stableStringify(nested))
      .join(',') + '}';
  }
  return JSON.stringify(value);
}

function digest(value: unknown): string {
  return createHash('sha256').update(stableStringify(value)).digest('hex');
}

function decide(failureClass: CalendarSyncFailureClass, attemptCount: number, maxRetryAttempts: number): Pick<SyncFailureDegradationReceipt, 'decision' | 'next_retry_after_seconds' | 'manual_review_reason' | 'operator_message'> {
  if (failureClass === 'NETWORK_TIMEOUT' || failureClass === 'RATE_LIMIT' || failureClass === 'PROVIDER_5XX') {
    if (attemptCount < maxRetryAttempts) {
      return {
        decision: 'RETRY_WITH_BACKOFF',
        next_retry_after_seconds: Math.min(3600, 60 * Math.max(1, 2 ** attemptCount)),
        manual_review_reason: null,
        operator_message: 'Provider sync is degraded; keep local calendar state available and retry with bounded backoff.',
      };
    }
    return {
      decision: 'DEGRADED_LOCAL_ONLY',
      next_retry_after_seconds: null,
      manual_review_reason: 'retry_budget_exhausted',
      operator_message: 'Retry budget exhausted; continue with local calendar state and surface degraded sync evidence.',
    };
  }

  if (failureClass === 'AUTH_EXPIRED') {
    return {
      decision: 'DEGRADED_LOCAL_ONLY',
      next_retry_after_seconds: null,
      manual_review_reason: 'provider_authentication_refresh_required',
      operator_message: 'Provider authentication is unavailable; continue local-only until credentials are refreshed outside this FFET.',
    };
  }

  if (failureClass === 'CONFLICT_DETECTED' || failureClass === 'UNKNOWN') {
    return {
      decision: 'MANUAL_REVIEW_REQUIRED',
      next_retry_after_seconds: null,
      manual_review_reason: failureClass === 'CONFLICT_DETECTED' ? 'calendar_conflict_requires_review' : 'unknown_sync_failure_requires_review',
      operator_message: 'Sync failure requires human review before another provider operation is attempted.',
    };
  }

  return {
    decision: 'BLOCK_UNSAFE_SYNC',
    next_retry_after_seconds: null,
    manual_review_reason: 'provider_payload_validation_rejected',
    operator_message: 'Provider payload validation failed; block unsafe sync and preserve local state.',
  };
}

export function evaluateSyncFailureDegradation(input: SyncFailureDegradationInput): SyncFailureDegradationReceipt {
  if (input.provider_retry_execution_requested === true) {
    throw new Error('sync_failure_degradation must not execute provider retries inside this FFET.');
  }
  if (input.provider_mutation_requested === true) {
    throw new Error('sync_failure_degradation must not mutate provider state inside this FFET.');
  }
  if (input.credential_access_requested === true) {
    throw new Error('sync_failure_degradation must not access provider credentials inside this FFET.');
  }
  if (input.persistence_requested === true) {
    throw new Error('sync_failure_degradation must not persist sync degradation state inside this FFET.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('sync_failure_degradation must not execute runtime adapters inside this FFET.');
  }

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const syncJobRef = requireNonEmpty(input.sync_job_ref, 'sync_job_ref');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const requestedByUserId = requireNonEmpty(input.requested_by_user_id, 'requested_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const failureMessageRef = requireNonEmpty(input.failure_message_ref, 'failure_message_ref');
  const providerCorrelationId = requireNonEmpty(input.provider_correlation_id, 'provider_correlation_id');
  if (!SURFACES.has(input.sync_surface)) {
    throw new Error('sync_surface contains unsupported value ' + String(input.sync_surface) + '.');
  }
  if (!FAILURE_CLASSES.has(input.failure_class)) {
    throw new Error('failure_class contains unsupported value ' + String(input.failure_class) + '.');
  }
  const attemptCount = requireNonNegativeInteger(input.attempt_count, 'attempt_count');
  const maxRetryAttempts = requireNonNegativeInteger(input.max_retry_attempts, 'max_retry_attempts');
  if (maxRetryAttempts === 0 && attemptCount > 0) {
    throw new Error('attempt_count must be 0 when max_retry_attempts is 0.');
  }
  if (input.last_successful_sync_at !== undefined) {
    requireTimestamp(input.last_successful_sync_at, 'last_successful_sync_at');
  }

  const degradationDecision = decide(input.failure_class, attemptCount, maxRetryAttempts);
  const receiptWithoutDigest: Omit<SyncFailureDegradationReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_SYNC_FAILURE_DEGRADATION_SEED_ID,
    component_id: PHASE_6C_SYNC_FAILURE_DEGRADATION_COMPONENT_ID,
    component_slug: 'workspace_calendar_meetings_rooms_announcements',
    model_name: 'Phase6CSyncFailureDegradation',
    event_name: SYNC_FAILURE_DEGRADATION_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    sync_job_ref: syncJobRef,
    source_record_ref: sourceRecordRef,
    sync_surface: input.sync_surface,
    failure_class: input.failure_class,
    fallback_surface: 'LOCAL_CALENDAR_READMODEL',
    provider_retry_executed: false,
    provider_mutation_executed: false,
    credential_access_executed: false,
    runtime_adapter_executed: false,
    persistence_executed: false,
    required_evidence_artifacts: [
      'sync_failure_degradation_runtime_receipt',
      'local_calendar_readmodel_fallback_evidence',
      'provider_operation_not_executed',
    ],
    decision_refs: SYNC_FAILURE_DEGRADATION_DECISION_REFS,
    provider_correlation_id: providerCorrelationId,
    requested_by_user_id: requestedByUserId,
    evaluated_at: evaluatedAt,
    ...degradationDecision,
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digest({ ...receiptWithoutDigest, failure_message_ref: failureMessageRef }),
  };
}
