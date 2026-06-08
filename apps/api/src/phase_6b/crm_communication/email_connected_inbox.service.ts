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

const LIFECYCLE_STATUSES: readonly EmailConnectedInboxLifecycleStatus[] = ['DRAFT', 'ACTIVE', 'PAUSED', 'RETIRED'] as const;
const HEALTH_STATUSES: readonly EmailConnectedInboxHealthStatus[] = ['NOT_CHECKED', 'HEALTHY', 'DEGRADED', 'ACTION_REQUIRED'] as const;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const DOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for email connected inbox.`);
  }
  return value.trim();
}

function normalizeOptional(value: string | undefined, field: string): string | undefined {
  if (value === undefined) return undefined;
  return requireNonEmpty(value, field);
}

function requireConfiguredAt(value: string): string {
  const normalized = requireNonEmpty(value, 'configured_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('configured_at must be a valid ISO-compatible timestamp for email connected inbox.');
  }
  return normalized;
}

function normalizeInboxAddress(value: string): { inboxAddress: string; inboxDomain: string } {
  const inboxAddress = requireNonEmpty(value, 'inbox_address').toLowerCase();
  if (!EMAIL_PATTERN.test(inboxAddress)) {
    throw new Error('inbox_address must be a valid email address for email connected inbox.');
  }
  return { inboxAddress, inboxDomain: inboxAddress.split('@')[1]! };
}

function normalizeDomain(value: string): string {
  const domain = requireNonEmpty(value, 'allowed_sender_domain').toLowerCase();
  if (!DOMAIN_PATTERN.test(domain)) {
    throw new Error('allowed_sender_domain must be a valid domain for email connected inbox.');
  }
  return domain;
}

function normalizeLifecycleStatus(value: EmailConnectedInboxLifecycleStatus): EmailConnectedInboxLifecycleStatus {
  if (!LIFECYCLE_STATUSES.includes(value)) {
    throw new Error('lifecycle_status is not supported for email connected inbox.');
  }
  return value;
}

function normalizeHealthStatus(value: EmailConnectedInboxHealthStatus): EmailConnectedInboxHealthStatus {
  if (!HEALTH_STATUSES.includes(value)) {
    throw new Error('health_status is not supported for email connected inbox.');
  }
  return value;
}

export function configureEmailConnectedInbox(input: EmailConnectedInboxInput): EmailConnectedInboxReceipt {
  if (input.outbound_send_requested === true) {
    throw new Error('email connected inbox must not send outbound email.');
  }
  if (input.mailbox_sync_requested === true) {
    throw new Error('email connected inbox must not execute mailbox sync.');
  }
  if (input.credential_material_requested === true) {
    throw new Error('email connected inbox must not handle credential material.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('email connected inbox must not perform irreversible actions.');
  }

  const { inboxAddress, inboxDomain } = normalizeInboxAddress(input.inbox_address);
  const allowedSenderDomain = normalizeDomain(input.allowed_sender_domain);

  return {
    seed_id: PHASE_6B_EMAIL_CONNECTED_INBOX_SEED_ID,
    component_id: PHASE_6B_EMAIL_CONNECTED_INBOX_COMPONENT_ID,
    event_name: EMAIL_CONNECTED_INBOX_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    connected_inbox_id: requireNonEmpty(input.connected_inbox_id, 'connected_inbox_id'),
    inbox_address: inboxAddress,
    inbox_domain: inboxDomain,
    display_name: requireNonEmpty(input.display_name, 'display_name'),
    pipeline_stage_model_ref: requireNonEmpty(input.pipeline_stage_model_ref, 'pipeline_stage_model_ref'),
    inbound_route_ref: requireNonEmpty(input.inbound_route_ref, 'inbound_route_ref'),
    lifecycle_status: normalizeLifecycleStatus(input.lifecycle_status),
    health_status: normalizeHealthStatus(input.health_status),
    allowed_sender_domain: allowedSenderDomain,
    global_opt_out_registry_ref: normalizeOptional(input.global_opt_out_registry_ref, 'global_opt_out_registry_ref'),
    opt_out_dependency_tier: 'CONDITIONAL_SETUP_REFERENCE',
    configured_by_user_id: requireNonEmpty(input.configured_by_user_id, 'configured_by_user_id'),
    configured_at: requireConfiguredAt(input.configured_at),
    outbound_send_allowed: false,
    mailbox_sync_allowed: false,
    credential_material_allowed: false,
    irreversible_action_allowed: false,
  };
}
