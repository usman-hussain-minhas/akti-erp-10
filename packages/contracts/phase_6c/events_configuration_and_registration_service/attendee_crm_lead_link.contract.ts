export const PHASE_6C_ATTENDEE_CRM_LEAD_LINK_SEED_ID = "seed_6c_106_attendee_crm_lead_link" as const;
export const PHASE_6C_ATTENDEE_CRM_LEAD_LINK_COMPONENT_ID = "6C.08" as const;
export const ATTENDEE_CRM_LEAD_LINK_RUNTIME_EVENT = "phase_6c.events_configuration_and_registration_service.attendee_crm_lead_link.runtime_evaluated" as const;

export type AttendeeCrmLeadLinkDecision =
  | 'CRM_LINK_NOT_APPLICABLE'
  | 'CRM_LINK_PENDING'
  | 'CRM_LEAD_LINKED'
  | 'CRM_LINK_CONFLICT'
  | 'CRM_LINK_REQUIRES_REVIEW';

export type AttendeeCrmLeadLinkStatus = 'not_applicable' | 'pending' | 'linked' | 'failed' | 'conflict';

export type AttendeeCrmLeadLinkInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  registration_ref: string;
  attendee_ref: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  crm_handoff_active: boolean;
  crm_lead_ref?: string;
  crm_contact_ref?: string;
  crm_campaign_ref?: string;
  lead_source_ref?: string;
  attendee_identity_ref?: string;
  link_status?: AttendeeCrmLeadLinkStatus;
  conflict_refs?: readonly string[];
  product_catalogue_anchor_ref?: string;
  invoice_saga_ref?: string;
  payment_saga_ref?: string;
  workspace_calendar_ref?: string;
  control_metadata?: Record<string, unknown>;
  create_crm_lead_requested?: boolean;
  update_crm_lead_requested?: boolean;
  crm_provider_sync_requested?: boolean;
  registration_mutation_requested?: boolean;
  payment_mutation_requested?: boolean;
  persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type AttendeeCrmLeadLinkRuntimeReceipt = {
  seed_id: typeof PHASE_6C_ATTENDEE_CRM_LEAD_LINK_SEED_ID;
  component_id: typeof PHASE_6C_ATTENDEE_CRM_LEAD_LINK_COMPONENT_ID;
  component_slug: "events_configuration_and_registration_service";
  model_name: "Phase6CAttendeeCrmLeadLink";
  event_name: typeof ATTENDEE_CRM_LEAD_LINK_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  registration_ref: string;
  attendee_ref: string;
  source_record_ref: string;
  decision: AttendeeCrmLeadLinkDecision;
  crm_handoff_active: boolean;
  link_status: AttendeeCrmLeadLinkStatus;
  crm_lead_ref: string | null;
  crm_contact_ref: string | null;
  crm_campaign_ref: string | null;
  lead_source_ref: string | null;
  attendee_identity_ref: string | null;
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
