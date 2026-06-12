export const PHASE_6C_EVENT_CALENDAR_SCHEDULE_REF_SEED_ID = "seed_6c_105_event_calendar_schedule_ref" as const;
export const PHASE_6C_EVENT_CALENDAR_SCHEDULE_REF_COMPONENT_ID = "6C.08" as const;
export const EVENT_CALENDAR_SCHEDULE_REF_RUNTIME_EVENT = "phase_6c.events_configuration_and_registration_service.event_calendar_schedule_ref.runtime_evaluated" as const;

export type EventCalendarScheduleRefDecision =
  | 'CALENDAR_NOT_REQUESTED'
  | 'CALENDAR_REF_PENDING'
  | 'CALENDAR_REF_READY'
  | 'CALENDAR_REF_CONFLICT'
  | 'CALENDAR_REF_REQUIRES_REVIEW';

export type EventCalendarScheduleSyncStatus = 'not_requested' | 'pending' | 'synced' | 'failed' | 'conflict';

export type EventCalendarScheduleRefInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  event_start_at: string;
  event_end_at: string;
  timezone: string;
  workspace_calendar_active: boolean;
  calendar_schedule_ref?: string;
  calendar_owner_ref?: string;
  calendar_id_ref?: string;
  calendar_event_ref?: string;
  sync_status?: EventCalendarScheduleSyncStatus;
  conflict_refs?: readonly string[];
  product_catalogue_anchor_ref?: string;
  invoice_saga_ref?: string;
  payment_saga_ref?: string;
  crm_handoff_ref?: string;
  control_metadata?: Record<string, unknown>;
  create_calendar_event_requested?: boolean;
  update_calendar_event_requested?: boolean;
  provider_sync_requested?: boolean;
  calendar_api_publication_requested?: boolean;
  persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type EventCalendarScheduleRefRuntimeReceipt = {
  seed_id: typeof PHASE_6C_EVENT_CALENDAR_SCHEDULE_REF_SEED_ID;
  component_id: typeof PHASE_6C_EVENT_CALENDAR_SCHEDULE_REF_COMPONENT_ID;
  component_slug: "events_configuration_and_registration_service";
  model_name: "Phase6CEventCalendarScheduleRef";
  event_name: typeof EVENT_CALENDAR_SCHEDULE_REF_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  source_record_ref: string;
  decision: EventCalendarScheduleRefDecision;
  workspace_calendar_active: boolean;
  event_start_at: string;
  event_end_at: string;
  duration_minutes: number;
  timezone: string;
  calendar_schedule_ref: string | null;
  calendar_owner_ref: string | null;
  calendar_id_ref: string | null;
  calendar_event_ref: string | null;
  sync_status: EventCalendarScheduleSyncStatus;
  conflict_refs: readonly string[];
  dependency_trace: {
    service_manifest_contract: string;
    product_catalogue_anchor_ref: string | null;
    invoice_saga_ref: string | null;
    payment_saga_ref: string | null;
    crm_handoff_ref: string | null;
    workspace_calendar_condition: 'workspace_calendar_active' | 'workspace_calendar_inactive';
  };
  decision_refs: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  runtime_evidence_digest: string;
};
