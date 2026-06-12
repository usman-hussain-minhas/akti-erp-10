export const PHASE_6C_EVENT_LEAD_HANDOFF_SEED_ID = "seed_6c_107_event_lead_handoff" as const;
export const PHASE_6C_EVENT_LEAD_HANDOFF_COMPONENT_ID = "6C.08" as const;
export const EVENT_LEAD_HANDOFF_RUNTIME_EVENT = "phase_6c.events_configuration_and_registration_service.event_lead_handoff.runtime_evaluated" as const;
export const EVENT_LEAD_HANDOFF_READY_EVENT = "phase_6c.events_configuration_and_registration_service.event_lead_handoff.ready" as const;

export type EventLeadHandoffDecision =
  | 'CRM_HANDOFF_INACTIVE'
  | 'HANDOFF_EVENT_PENDING'
  | 'HANDOFF_EVENT_READY'
  | 'HANDOFF_EVENT_CONFLICT'
  | 'HANDOFF_EVENT_REQUIRES_REVIEW';

export type EventLeadHandoffStatus = 'not_applicable' | 'pending' | 'ready' | 'failed' | 'conflict';

export type EventLeadHandoffInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  registration_ref: string;
  attendee_ref: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  crm_handoff_active: boolean;
  handoff_status?: EventLeadHandoffStatus;
  attendee_crm_lead_link_ref?: string;
  event_lead_ref?: string;
  crm_lead_ref?: string;
  crm_contact_ref?: string;
  crm_campaign_ref?: string;
  lead_source_ref?: string;
  attendee_identity_ref?: string;
  conflict_refs?: readonly string[];
  product_catalogue_anchor_ref?: string;
  invoice_saga_ref?: string;
  payment_saga_ref?: string;
  workspace_calendar_ref?: string;
  control_metadata?: Record<string, unknown>;
  crm_direct_write_requested?: boolean;
  crm_provider_sync_requested?: boolean;
  event_bus_publish_requested?: boolean;
  registration_mutation_requested?: boolean;
  payment_mutation_requested?: boolean;
  persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type EventLeadHandoffEnvelope = {
  event_name: typeof EVENT_LEAD_HANDOFF_READY_EVENT;
  idempotency_key: string;
  organization_id: string;
  event_config_ref: string;
  registration_ref: string;
  attendee_ref: string;
  attendee_crm_lead_link_ref: string | null;
  event_lead_ref: string | null;
  crm_lead_ref: string | null;
  crm_contact_ref: string | null;
  crm_campaign_ref: string | null;
  lead_source_ref: string | null;
  attendee_identity_ref: string | null;
};

export type EventLeadHandoffRuntimeReceipt = {
  seed_id: typeof PHASE_6C_EVENT_LEAD_HANDOFF_SEED_ID;
  component_id: typeof PHASE_6C_EVENT_LEAD_HANDOFF_COMPONENT_ID;
  component_slug: "events_configuration_and_registration_service";
  model_name: "Phase6CEventLeadHandoff";
  event_name: typeof EVENT_LEAD_HANDOFF_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  registration_ref: string;
  attendee_ref: string;
  source_record_ref: string;
  decision: EventLeadHandoffDecision;
  crm_handoff_active: boolean;
  handoff_status: EventLeadHandoffStatus;
  handoff_envelope: EventLeadHandoffEnvelope | null;
  conflict_refs: readonly string[];
  dependency_trace: {
    service_manifest_contract: string;
    product_catalogue_anchor_ref: string | null;
    invoice_saga_ref: string | null;
    payment_saga_ref: string | null;
    workspace_calendar_ref: string | null;
    crm_handoff_condition: 'event_crm_handoff_active' | 'event_crm_handoff_inactive';
  };
  decision_refs: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  runtime_evidence_digest: string;
};
