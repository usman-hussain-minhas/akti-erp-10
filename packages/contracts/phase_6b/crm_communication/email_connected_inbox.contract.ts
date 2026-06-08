export const PHASE_6B_EMAIL_CONNECTED_INBOX_SEED_ID = 'seed_6b_07_email_connected_inbox' as const;
export const PHASE_6B_EMAIL_CONNECTED_INBOX_COMPONENT_ID = '6B.07' as const;

export const EMAIL_CONNECTED_INBOX_EVENT = 'phase_6b.crm_communication.email_connected_inbox.configured' as const;

export type EmailConnectedInboxLifecycleStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'RETIRED';
export type EmailConnectedInboxHealthStatus = 'NOT_CHECKED' | 'HEALTHY' | 'DEGRADED' | 'ACTION_REQUIRED';

export type EmailConnectedInboxInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  connected_inbox_id: string;
  inbox_address: string;
  display_name: string;
  pipeline_stage_model_ref: string;
  inbound_route_ref: string;
  lifecycle_status: EmailConnectedInboxLifecycleStatus;
  health_status: EmailConnectedInboxHealthStatus;
  allowed_sender_domain: string;
  global_opt_out_registry_ref?: string;
  configured_by_user_id: string;
  configured_at: string;
  outbound_send_requested?: boolean;
  mailbox_sync_requested?: boolean;
  credential_material_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type EmailConnectedInboxReceipt = {
  seed_id: typeof PHASE_6B_EMAIL_CONNECTED_INBOX_SEED_ID;
  component_id: typeof PHASE_6B_EMAIL_CONNECTED_INBOX_COMPONENT_ID;
  event_name: typeof EMAIL_CONNECTED_INBOX_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  connected_inbox_id: string;
  inbox_address: string;
  inbox_domain: string;
  display_name: string;
  pipeline_stage_model_ref: string;
  inbound_route_ref: string;
  lifecycle_status: EmailConnectedInboxLifecycleStatus;
  health_status: EmailConnectedInboxHealthStatus;
  allowed_sender_domain: string;
  global_opt_out_registry_ref?: string;
  opt_out_dependency_tier: 'CONDITIONAL_SETUP_REFERENCE';
  configured_by_user_id: string;
  configured_at: string;
  outbound_send_allowed: false;
  mailbox_sync_allowed: false;
  credential_material_allowed: false;
  irreversible_action_allowed: false;
};
