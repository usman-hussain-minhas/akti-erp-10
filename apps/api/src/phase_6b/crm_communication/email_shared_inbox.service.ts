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

const LIFECYCLE_STATUSES: readonly EmailSharedInboxLifecycleStatus[] = ['DRAFT', 'ACTIVE', 'PAUSED', 'RETIRED'] as const;
const THREAD_POLICIES: readonly EmailSharedInboxThreadPolicy[] = ['ASSIGN_TO_QUEUE', 'ROUND_ROBIN', 'MANUAL_TRIAGE'] as const;
const VISIBILITIES: readonly EmailSharedInboxVisibility[] = ['TEAM_SHARED', 'OWNER_GROUP_SHARED'] as const;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for email shared inbox.`);
  }
  return value.trim();
}

function requireConfiguredAt(value: string): string {
  const normalized = requireNonEmpty(value, 'configured_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('configured_at must be a valid ISO-compatible timestamp for email shared inbox.');
  }
  return normalized;
}

function normalizeEmail(value: string): { inboxAddress: string; inboxDomain: string } {
  const inboxAddress = requireNonEmpty(value, 'inbox_address').toLowerCase();
  if (!EMAIL_PATTERN.test(inboxAddress)) {
    throw new Error('inbox_address must be a valid email address for email shared inbox.');
  }
  return { inboxAddress, inboxDomain: inboxAddress.split('@')[1]! };
}

function normalizeLifecycleStatus(value: EmailSharedInboxLifecycleStatus): EmailSharedInboxLifecycleStatus {
  if (!LIFECYCLE_STATUSES.includes(value)) {
    throw new Error('lifecycle_status is not supported for email shared inbox.');
  }
  return value;
}

function normalizeThreadPolicy(value: EmailSharedInboxThreadPolicy): EmailSharedInboxThreadPolicy {
  if (!THREAD_POLICIES.includes(value)) {
    throw new Error('thread_policy is not supported for email shared inbox.');
  }
  return value;
}

function normalizeVisibility(value: EmailSharedInboxVisibility): EmailSharedInboxVisibility {
  if (!VISIBILITIES.includes(value)) {
    throw new Error('visibility is not supported for email shared inbox.');
  }
  return value;
}

function normalizeOwnerGroups(ownerGroupRefs: string[]): string[] {
  if (!Array.isArray(ownerGroupRefs) || ownerGroupRefs.length === 0) {
    throw new Error('owner_group_refs must include at least one owner group for email shared inbox.');
  }
  const normalized = ownerGroupRefs.map((ref) => requireNonEmpty(ref, 'owner_group_refs'));
  if (new Set(normalized).size !== normalized.length) {
    throw new Error('owner_group_refs must not contain duplicates for email shared inbox.');
  }
  return normalized;
}

export function configureEmailSharedInbox(input: EmailSharedInboxInput): EmailSharedInboxReceipt {
  if (input.outbound_send_requested === true) {
    throw new Error('email shared inbox must not send outbound email.');
  }
  if (input.mailbox_sync_requested === true) {
    throw new Error('email shared inbox must not execute mailbox sync.');
  }
  if (input.credential_material_requested === true) {
    throw new Error('email shared inbox must not handle credential material.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('email shared inbox must not perform irreversible actions.');
  }

  const { inboxAddress, inboxDomain } = normalizeEmail(input.inbox_address);
  const ownerGroupRefs = normalizeOwnerGroups(input.owner_group_refs);

  return {
    seed_id: PHASE_6B_EMAIL_SHARED_INBOX_SEED_ID,
    component_id: PHASE_6B_EMAIL_SHARED_INBOX_COMPONENT_ID,
    event_name: EMAIL_SHARED_INBOX_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    shared_inbox_id: requireNonEmpty(input.shared_inbox_id, 'shared_inbox_id'),
    inbox_address: inboxAddress,
    inbox_domain: inboxDomain,
    display_name: requireNonEmpty(input.display_name, 'display_name'),
    pipeline_stage_model_ref: requireNonEmpty(input.pipeline_stage_model_ref, 'pipeline_stage_model_ref'),
    global_opt_out_registry_ref: requireNonEmpty(input.global_opt_out_registry_ref, 'global_opt_out_registry_ref'),
    outbound_gateway_enforcement_ref: requireNonEmpty(input.outbound_gateway_enforcement_ref, 'outbound_gateway_enforcement_ref'),
    thread_policy: normalizeThreadPolicy(input.thread_policy),
    visibility: normalizeVisibility(input.visibility),
    owner_group_refs: ownerGroupRefs,
    owner_group_count: ownerGroupRefs.length,
    routing_queue_ref: requireNonEmpty(input.routing_queue_ref, 'routing_queue_ref'),
    lifecycle_status: normalizeLifecycleStatus(input.lifecycle_status),
    opt_out_adl_ref: 'ADL-004',
    outbound_gateway_adl_ref: 'ADL-004',
    outbound_send_allowed: false,
    mailbox_sync_allowed: false,
    credential_material_allowed: false,
    irreversible_action_allowed: false,
    configured_by_user_id: requireNonEmpty(input.configured_by_user_id, 'configured_by_user_id'),
    configured_at: requireConfiguredAt(input.configured_at),
  };
}
