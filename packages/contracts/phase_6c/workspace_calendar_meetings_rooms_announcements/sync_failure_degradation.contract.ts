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
