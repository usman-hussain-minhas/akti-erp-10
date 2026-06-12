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
