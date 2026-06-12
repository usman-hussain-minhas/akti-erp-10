export const PHASE_6C_CALENDAR_PROVIDER_SYNC_BOUNDARY_SEED_ID = 'seed_6c_084_calendar_provider_sync_boundary' as const;
export const PHASE_6C_CALENDAR_PROVIDER_SYNC_BOUNDARY_COMPONENT_ID = '6C.07' as const;
export const CALENDAR_PROVIDER_SYNC_BOUNDARY_RUNTIME_EVENT = 'phase_6c.workspace_calendar_meetings_rooms_announcements.calendar_provider_sync_boundary.runtime_evaluated' as const;

export type CalendarProviderSyncBoundaryProvider = 'GOOGLE_CALENDAR' | 'OUTLOOK_CALENDAR';
export type CalendarProviderSyncBoundaryDirection = 'EXPORT_TO_PROVIDER' | 'IMPORT_FROM_PROVIDER' | 'BIDIRECTIONAL_PROPOSED';
export type CalendarProviderSyncBoundaryScope = 'READ_CALENDAR_METADATA' | 'WRITE_CALENDAR_EVENTS' | 'READ_WRITE_CALENDAR_EVENTS';
export type CalendarProviderSyncBoundaryStatus = 'BOUNDARY_VALIDATED' | 'BLOCKED_REQUIRES_ADAPTER_IMPLEMENTATION';

export type CalendarProviderSyncBoundaryInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  boundary_ref: string;
  provider: CalendarProviderSyncBoundaryProvider;
  direction: CalendarProviderSyncBoundaryDirection;
  requested_scopes: readonly CalendarProviderSyncBoundaryScope[];
  provider_neutral_calendar_entry_ref: string;
  credential_reference?: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  metadata?: Record<string, unknown>;
  raw_credential_supplied?: boolean;
  provider_sdk_call_requested?: boolean;
  sync_execution_requested?: boolean;
  webhook_registration_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
  cross_phase_write_requested?: boolean;
  frontend_route_requested?: boolean;
  authorization_flag_change_requested?: boolean;
};

export type CalendarProviderSyncBoundaryEnvelope = {
  boundary_uid: string;
  provider: CalendarProviderSyncBoundaryProvider;
  direction: CalendarProviderSyncBoundaryDirection;
  requested_scopes: readonly CalendarProviderSyncBoundaryScope[];
  provider_neutral_calendar_entry_ref: string;
  credential_reference?: string;
  adapter_boundary_only: true;
};

export type CalendarProviderSyncBoundaryReceipt = {
  seed_id: typeof PHASE_6C_CALENDAR_PROVIDER_SYNC_BOUNDARY_SEED_ID;
  component_id: typeof PHASE_6C_CALENDAR_PROVIDER_SYNC_BOUNDARY_COMPONENT_ID;
  component_slug: 'workspace_calendar_meetings_rooms_announcements';
  model_name: 'Phase6CCalendarProviderSyncBoundary';
  event_name: typeof CALENDAR_PROVIDER_SYNC_BOUNDARY_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  boundary_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  status: CalendarProviderSyncBoundaryStatus;
  provider_neutral_only: true;
  adapter_boundary_only: true;
  boundary_envelope: CalendarProviderSyncBoundaryEnvelope;
  validation_warnings: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};
