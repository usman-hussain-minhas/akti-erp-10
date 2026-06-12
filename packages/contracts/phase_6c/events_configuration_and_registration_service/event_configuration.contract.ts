export const PHASE_6C_EVENT_CONFIGURATION_SEED_ID = 'seed_6c_096_event_configuration' as const;
export const PHASE_6C_EVENT_CONFIGURATION_COMPONENT_ID = '6C.08' as const;
export const EVENT_CONFIGURATION_RUNTIME_EVENT = 'phase_6c.events_configuration_and_registration_service.event_configuration.runtime_evaluated' as const;

export type EventConfigurationLifecycleStatus = 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'ARCHIVED';
export type EventConfigurationRegistrationMode = 'INFORMATION_ONLY' | 'FREE_REGISTRATION' | 'PAID_REGISTRATION' | 'APPROVAL_REQUIRED' | 'INVITE_ONLY';
export type EventConfigurationTicketingMode = 'NONE' | 'PRODUCT_CATALOGUE_TICKET_TYPES';
export type EventConfigurationCapacityMode = 'UNLIMITED' | 'FIXED_CAPACITY' | 'PER_TICKET_TYPE';
export type EventConfigurationAudienceVisibility = 'PRIVATE' | 'PUBLIC' | 'LINK_ONLY';
export type EventConfigurationDecision = 'CONFIGURATION_READY' | 'DRAFT_CONFIGURATION_READY' | 'CONFIGURATION_REQUIRES_REVIEW';

export type EventConfigurationTicketTypeRef = {
  ticket_type_ref: string;
  product_catalogue_item_ref: string;
  capacity?: number;
  active: boolean;
};

export type EventConfigurationPaidRegistrationPolicy = {
  invoice_required: boolean;
  payment_required: boolean;
  registration_invoice_saga_ref?: string;
  finance_invoice_ref?: string;
  payment_collection_ref?: string;
};

export type EventConfigurationConditionalRef = {
  enabled: boolean;
  condition: 'event_crm_handoff_active' | 'workspace_calendar_active';
  target_ref?: string;
};

export type EventConfigurationInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  source_record_ref: string;
  configured_by_user_id: string;
  evaluated_at: string;
  event_name: string;
  event_code: string;
  lifecycle_status: EventConfigurationLifecycleStatus;
  registration_mode: EventConfigurationRegistrationMode;
  ticketing_mode: EventConfigurationTicketingMode;
  capacity_mode: EventConfigurationCapacityMode;
  audience_visibility: EventConfigurationAudienceVisibility;
  timezone: string;
  starts_at?: string;
  ends_at?: string;
  max_capacity?: number;
  product_catalogue_ref?: string;
  ticket_type_refs?: readonly EventConfigurationTicketTypeRef[];
  paid_registration_policy?: EventConfigurationPaidRegistrationPolicy;
  crm_handoff?: EventConfigurationConditionalRef;
  calendar_schedule?: EventConfigurationConditionalRef;
  employee_owner_ref?: string;
  control_metadata?: Record<string, unknown>;
  product_catalogue_write_requested?: boolean;
  finance_invoice_write_requested?: boolean;
  payment_capture_requested?: boolean;
  crm_direct_write_requested?: boolean;
  calendar_direct_write_requested?: boolean;
  provider_adapter_requested?: boolean;
  persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type EventConfigurationRuntimeReceipt = {
  seed_id: typeof PHASE_6C_EVENT_CONFIGURATION_SEED_ID;
  component_id: typeof PHASE_6C_EVENT_CONFIGURATION_COMPONENT_ID;
  component_slug: 'events_configuration_and_registration_service';
  model_name: 'Phase6CEventConfiguration';
  event_name: typeof EVENT_CONFIGURATION_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  source_record_ref: string;
  configured_by_user_id: string;
  evaluated_at: string;
  normalized_event_code: string;
  lifecycle_status: EventConfigurationLifecycleStatus;
  registration_mode: EventConfigurationRegistrationMode;
  ticketing_mode: EventConfigurationTicketingMode;
  capacity_mode: EventConfigurationCapacityMode;
  audience_visibility: EventConfigurationAudienceVisibility;
  timezone: string;
  decision: EventConfigurationDecision;
  product_catalogue_anchor_required: boolean;
  product_catalogue_ref?: string;
  active_ticket_type_count: number;
  fixed_capacity?: number;
  registration_invoice_saga_required: boolean;
  registration_invoice_saga_ref?: string;
  crm_handoff_condition?: 'event_crm_handoff_active';
  crm_handoff_target_ref?: string;
  calendar_schedule_condition?: 'workspace_calendar_active';
  calendar_target_ref?: string;
  employee_owner_ref?: string;
  refs_events_only: true;
  direct_cross_module_write_allowed: false;
  provider_adapter_allowed: false;
  persistence_performed: false;
  schema_mutation_performed: false;
  frontend_surface_created: false;
  decision_refs: readonly string[];
  adl_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  event_configuration_runtime_digest: string;
};
