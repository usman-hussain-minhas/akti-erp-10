export const PHASE_6C_PROVIDER_NEUTRAL_CALENDAR_ENTRY_SEED_ID = 'seed_6c_083_provider_neutral_calendar_entry' as const;
export const PHASE_6C_PROVIDER_NEUTRAL_CALENDAR_ENTRY_COMPONENT_ID = '6C.07' as const;
export const PROVIDER_NEUTRAL_CALENDAR_ENTRY_RUNTIME_EVENT = 'phase_6c.workspace_calendar_meetings_rooms_announcements.provider_neutral_calendar_entry.runtime_evaluated' as const;

export type ProviderNeutralCalendarEntryStatus = 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED';
export type ProviderNeutralCalendarEntryVisibility = 'PRIVATE' | 'TEAM' | 'ORGANIZATION';
export type ProviderNeutralCalendarEntryParticipantRole = 'OWNER' | 'ATTENDEE' | 'OPTIONAL' | 'RESOURCE';
export type ProviderNeutralCalendarEntrySourceType = 'MANUAL' | 'TASK' | 'PROJECT' | 'ROOM' | 'ANNOUNCEMENT';

export type ProviderNeutralCalendarEntryParticipant = {
  participant_ref: string;
  role: ProviderNeutralCalendarEntryParticipantRole;
  response_status?: 'NEEDS_ACTION' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE';
};

export type ProviderNeutralCalendarEntryInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  calendar_entry_ref: string;
  source_type: ProviderNeutralCalendarEntrySourceType;
  source_ref?: string;
  title: string;
  description?: string;
  status: ProviderNeutralCalendarEntryStatus;
  visibility: ProviderNeutralCalendarEntryVisibility;
  start_at: string;
  end_at?: string;
  timezone: string;
  all_day?: boolean;
  created_by_user_id: string;
  created_at: string;
  participants?: readonly ProviderNeutralCalendarEntryParticipant[];
  evidence_refs?: readonly string[];
  metadata?: Record<string, unknown>;
  provider_sync_requested?: boolean;
  provider_credential_requested?: boolean;
  direct_provider_mutation_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
  cross_phase_write_requested?: boolean;
  frontend_route_requested?: boolean;
  authorization_flag_change_requested?: boolean;
};

export type ProviderNeutralCalendarEntryPayload = {
  entry_uid: string;
  source_type: ProviderNeutralCalendarEntrySourceType;
  source_ref?: string;
  title: string;
  description?: string;
  status: ProviderNeutralCalendarEntryStatus;
  visibility: ProviderNeutralCalendarEntryVisibility;
  start_at: string;
  end_at?: string;
  timezone: string;
  all_day: boolean;
  participants: readonly ProviderNeutralCalendarEntryParticipant[];
  evidence_refs: readonly string[];
};

export type ProviderNeutralCalendarEntryReceipt = {
  seed_id: typeof PHASE_6C_PROVIDER_NEUTRAL_CALENDAR_ENTRY_SEED_ID;
  component_id: typeof PHASE_6C_PROVIDER_NEUTRAL_CALENDAR_ENTRY_COMPONENT_ID;
  component_slug: 'workspace_calendar_meetings_rooms_announcements';
  model_name: 'Phase6CProviderNeutralCalendarEntry';
  event_name: typeof PROVIDER_NEUTRAL_CALENDAR_ENTRY_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  calendar_entry_ref: string;
  created_by_user_id: string;
  created_at: string;
  provider_neutral_payload: ProviderNeutralCalendarEntryPayload;
  provider_adapter_boundary_only: true;
  participant_count: number;
  validation_warnings: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};
