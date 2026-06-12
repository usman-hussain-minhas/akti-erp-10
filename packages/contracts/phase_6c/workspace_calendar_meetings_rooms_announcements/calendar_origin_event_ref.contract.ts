export const PHASE_6C_CALENDAR_ORIGIN_EVENT_REF_SEED_ID = 'seed_6c_092_calendar_origin_event_ref' as const;
export const PHASE_6C_CALENDAR_ORIGIN_EVENT_REF_COMPONENT_ID = '6C.07' as const;
export const CALENDAR_ORIGIN_EVENT_REF_RUNTIME_EVENT = 'phase_6c.workspace_calendar_meetings_rooms_announcements.calendar_origin_event_ref.runtime_evaluated' as const;

export const CALENDAR_ORIGIN_EVENT_REF_DECISION_REFS = ['6C-CAL-010', '6C-GLOBAL-018'] as const;

export type CalendarOriginSystem = 'HR' | 'TASKS' | 'EVENTS' | 'LMS';
export type CalendarOriginReferenceMode = 'EVENT_REFERENCE_ONLY';
export type CalendarOriginReferenceDecision = 'ACCEPTED_EVENT_REFERENCE';

export type CalendarOriginEventRefInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  calendar_event_ref: string;
  source_record_ref: string;
  requested_by_user_id: string;
  evaluated_at: string;
  origin_system: CalendarOriginSystem;
  origin_component_ref: string;
  origin_event_id: string;
  origin_event_type: string;
  origin_entity_ref: string;
  origin_occurred_at: string;
  correlation_id: string;
  source_event_payload_hash: string;
  calendar_write_requested?: boolean;
  origin_mutation_requested?: boolean;
  direct_cross_module_query_requested?: boolean;
  provider_sync_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type NormalizedCalendarOriginEventRef = {
  origin_ref_id: string;
  reference_mode: CalendarOriginReferenceMode;
  origin_system: CalendarOriginSystem;
  origin_component_ref: string;
  origin_event_id: string;
  origin_event_type: string;
  origin_entity_ref: string;
  origin_occurred_at: string;
  correlation_id: string;
  source_event_payload_hash: string;
};

export type CalendarOriginEventRefReceipt = {
  seed_id: typeof PHASE_6C_CALENDAR_ORIGIN_EVENT_REF_SEED_ID;
  component_id: typeof PHASE_6C_CALENDAR_ORIGIN_EVENT_REF_COMPONENT_ID;
  component_slug: 'workspace_calendar_meetings_rooms_announcements';
  model_name: 'Phase6CCalendarOriginEventRef';
  event_name: typeof CALENDAR_ORIGIN_EVENT_REF_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  calendar_event_ref: string;
  source_record_ref: string;
  decision: CalendarOriginReferenceDecision;
  normalized_origin_ref: NormalizedCalendarOriginEventRef;
  refs_events_only: true;
  calendar_write_executed: false;
  origin_mutation_executed: false;
  direct_cross_module_query_executed: false;
  provider_sync_executed: false;
  runtime_adapter_executed: false;
  persistence_executed: false;
  required_evidence_artifacts: readonly string[];
  decision_refs: typeof CALENDAR_ORIGIN_EVENT_REF_DECISION_REFS;
  requested_by_user_id: string;
  evaluated_at: string;
  runtime_evidence_digest: string;
};
