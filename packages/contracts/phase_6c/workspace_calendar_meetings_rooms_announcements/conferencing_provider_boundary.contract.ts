export const PHASE_6C_CONFERENCING_PROVIDER_BOUNDARY_SEED_ID = 'seed_6c_085_conferencing_provider_boundary' as const;
export const PHASE_6C_CONFERENCING_PROVIDER_BOUNDARY_COMPONENT_ID = '6C.07' as const;
export const CONFERENCING_PROVIDER_BOUNDARY_RUNTIME_EVENT = 'phase_6c.workspace_calendar_meetings_rooms_announcements.conferencing_provider_boundary.runtime_evaluated' as const;

export type ConferencingProviderBoundaryProvider = 'GOOGLE_MEET' | 'ZOOM';
export type ConferencingProviderBoundaryCapability = 'VIDEO_MEETING_LINK' | 'DIAL_IN' | 'WAITING_ROOM' | 'RECORDING_POLICY';
export type ConferencingProviderBoundaryStatus = 'BOUNDARY_VALIDATED' | 'BLOCKED_REQUIRES_ADAPTER_IMPLEMENTATION';

export type ConferencingProviderBoundaryInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  boundary_ref: string;
  provider: ConferencingProviderBoundaryProvider;
  calendar_entry_ref: string;
  meeting_title: string;
  starts_at: string;
  ends_at?: string;
  timezone: string;
  requested_capabilities: readonly ConferencingProviderBoundaryCapability[];
  credential_reference?: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  metadata?: Record<string, unknown>;
  raw_credential_supplied?: boolean;
  provider_sdk_call_requested?: boolean;
  meeting_link_generation_requested?: boolean;
  dial_in_number_requested?: boolean;
  webhook_registration_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
  cross_phase_write_requested?: boolean;
  frontend_route_requested?: boolean;
  authorization_flag_change_requested?: boolean;
};

export type ConferencingProviderBoundaryEnvelope = {
  boundary_uid: string;
  provider: ConferencingProviderBoundaryProvider;
  calendar_entry_ref: string;
  meeting_title: string;
  starts_at: string;
  ends_at?: string;
  timezone: string;
  requested_capabilities: readonly ConferencingProviderBoundaryCapability[];
  credential_reference?: string;
  adapter_boundary_only: true;
};

export type ConferencingProviderBoundaryReceipt = {
  seed_id: typeof PHASE_6C_CONFERENCING_PROVIDER_BOUNDARY_SEED_ID;
  component_id: typeof PHASE_6C_CONFERENCING_PROVIDER_BOUNDARY_COMPONENT_ID;
  component_slug: 'workspace_calendar_meetings_rooms_announcements';
  model_name: 'Phase6CConferencingProviderBoundary';
  event_name: typeof CONFERENCING_PROVIDER_BOUNDARY_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  boundary_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  status: ConferencingProviderBoundaryStatus;
  provider_neutral_only: true;
  adapter_boundary_only: true;
  boundary_envelope: ConferencingProviderBoundaryEnvelope;
  validation_warnings: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};
