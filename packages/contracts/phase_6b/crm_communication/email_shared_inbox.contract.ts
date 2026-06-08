export const PHASE_6B_EMAIL_SHARED_INBOX_SEED_ID = 'seed_6b_07_email_shared_inbox' as const;
export const PHASE_6B_EMAIL_SHARED_INBOX_COMPONENT_ID = '6B.07' as const;

export const EMAIL_SHARED_INBOX_EVENT = 'phase_6b.crm_communication.email_shared_inbox.configured' as const;

export type EmailSharedInboxLifecycleStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'RETIRED';
export type EmailSharedInboxThreadPolicy = 'ASSIGN_TO_QUEUE' | 'ROUND_ROBIN' | 'MANUAL_TRIAGE';
export type EmailSharedInboxVisibility = 'TEAM_SHARED' | 'OWNER_GROUP_SHARED';

export type EmailSharedInboxInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  shared_inbox_id: string;
  inbox_address: string;
  display_name: string;
  pipeline_stage_model_ref: string;
  global_opt_out_registry_ref: string;
  outbound_gateway_enforcement_ref: string;
  thread_policy: EmailSharedInboxThreadPolicy;
  visibility: EmailSharedInboxVisibility;
  owner_group_refs: string[];
  routing_queue_ref: string;
  lifecycle_status: EmailSharedInboxLifecycleStatus;
  configured_by_user_id: string;
  configured_at: string;
  outbound_send_requested?: boolean;
  mailbox_sync_requested?: boolean;
  credential_material_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type EmailSharedInboxReceipt = {
  seed_id: typeof PHASE_6B_EMAIL_SHARED_INBOX_SEED_ID;
  component_id: typeof PHASE_6B_EMAIL_SHARED_INBOX_COMPONENT_ID;
  event_name: typeof EMAIL_SHARED_INBOX_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  shared_inbox_id: string;
  inbox_address: string;
  inbox_domain: string;
  display_name: string;
  pipeline_stage_model_ref: string;
  global_opt_out_registry_ref: string;
  outbound_gateway_enforcement_ref: string;
  thread_policy: EmailSharedInboxThreadPolicy;
  visibility: EmailSharedInboxVisibility;
  owner_group_refs: string[];
  owner_group_count: number;
  routing_queue_ref: string;
  lifecycle_status: EmailSharedInboxLifecycleStatus;
  opt_out_adl_ref: 'ADL-004';
  outbound_gateway_adl_ref: 'ADL-004';
  outbound_send_allowed: false;
  mailbox_sync_allowed: false;
  credential_material_allowed: false;
  irreversible_action_allowed: false;
  configured_by_user_id: string;
  configured_at: string;
};
