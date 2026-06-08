export const PHASE_6B_EMAIL_TRANSACTIONAL_DOMAIN_SEED_ID = 'seed_6b_07_email_transactional_domain' as const;
export const PHASE_6B_EMAIL_TRANSACTIONAL_DOMAIN_COMPONENT_ID = '6B.07' as const;

export const EMAIL_TRANSACTIONAL_DOMAIN_EVENT = 'phase_6b.crm_communication.email_transactional_domain.configured' as const;

export type EmailTransactionalDomainLifecycleStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'RETIRED';
export type EmailTransactionalDomainVerificationStatus = 'PENDING' | 'VERIFIED' | 'FAILED' | 'REVOKED';
export type EmailTransactionalDomainDnsRecordType = 'SPF' | 'DKIM' | 'DMARC' | 'BOUNCE_DOMAIN';

export type EmailTransactionalDomainDnsEvidence = {
  record_type: EmailTransactionalDomainDnsRecordType;
  host: string;
  expected_value: string;
  observed_value?: string;
  verified: boolean;
  verified_at?: string;
};

export type EmailTransactionalDomainInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  transactional_domain_id: string;
  domain_name: string;
  default_from_address: string;
  display_name: string;
  pipeline_stage_model_ref: string;
  global_opt_out_registry_ref: string;
  outbound_gateway_enforcement_ref: string;
  lifecycle_status: EmailTransactionalDomainLifecycleStatus;
  verification_status: EmailTransactionalDomainVerificationStatus;
  dns_evidence: EmailTransactionalDomainDnsEvidence[];
  configured_by_user_id: string;
  configured_at: string;
  outbound_send_requested?: boolean;
  provider_credential_requested?: boolean;
  dns_mutation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type EmailTransactionalDomainReceipt = {
  seed_id: typeof PHASE_6B_EMAIL_TRANSACTIONAL_DOMAIN_SEED_ID;
  component_id: typeof PHASE_6B_EMAIL_TRANSACTIONAL_DOMAIN_COMPONENT_ID;
  event_name: typeof EMAIL_TRANSACTIONAL_DOMAIN_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  transactional_domain_id: string;
  domain_name: string;
  default_from_address: string;
  default_from_domain: string;
  display_name: string;
  pipeline_stage_model_ref: string;
  global_opt_out_registry_ref: string;
  outbound_gateway_enforcement_ref: string;
  lifecycle_status: EmailTransactionalDomainLifecycleStatus;
  verification_status: EmailTransactionalDomainVerificationStatus;
  dns_evidence: EmailTransactionalDomainDnsEvidence[];
  required_dns_record_types: readonly EmailTransactionalDomainDnsRecordType[];
  opt_out_adl_ref: 'ADL-004';
  outbound_gateway_adl_ref: 'ADL-004';
  outbound_send_allowed: false;
  provider_credential_allowed: false;
  dns_mutation_allowed: false;
  irreversible_action_allowed: false;
  configured_by_user_id: string;
  configured_at: string;
};

const LIFECYCLE_STATUSES: readonly EmailTransactionalDomainLifecycleStatus[] = ['DRAFT', 'ACTIVE', 'PAUSED', 'RETIRED'] as const;
const VERIFICATION_STATUSES: readonly EmailTransactionalDomainVerificationStatus[] = ['PENDING', 'VERIFIED', 'FAILED', 'REVOKED'] as const;
const DNS_RECORD_TYPES: readonly EmailTransactionalDomainDnsRecordType[] = ['SPF', 'DKIM', 'DMARC', 'BOUNCE_DOMAIN'] as const;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const DOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for email transactional domain.`);
  }
  return value.trim();
}

function requireConfiguredAt(value: string): string {
  const normalized = requireNonEmpty(value, 'configured_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('configured_at must be a valid ISO-compatible timestamp for email transactional domain.');
  }
  return normalized;
}

function requireVerifiedAt(value: string | undefined, field: string): string | undefined {
  if (value === undefined) return undefined;
  const normalized = requireNonEmpty(value, field);
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for email transactional domain.`);
  }
  return normalized;
}

function normalizeDomain(value: string, field: string): string {
  const domain = requireNonEmpty(value, field).toLowerCase();
  if (!DOMAIN_PATTERN.test(domain)) {
    throw new Error(`${field} must be a valid domain for email transactional domain.`);
  }
  return domain;
}

function normalizeEmail(value: string): { address: string; domain: string } {
  const address = requireNonEmpty(value, 'default_from_address').toLowerCase();
  if (!EMAIL_PATTERN.test(address)) {
    throw new Error('default_from_address must be a valid email address for email transactional domain.');
  }
  return { address, domain: address.split('@')[1]! };
}

function normalizeLifecycleStatus(value: EmailTransactionalDomainLifecycleStatus): EmailTransactionalDomainLifecycleStatus {
  if (!LIFECYCLE_STATUSES.includes(value)) {
    throw new Error('lifecycle_status is not supported for email transactional domain.');
  }
  return value;
}

function normalizeVerificationStatus(value: EmailTransactionalDomainVerificationStatus): EmailTransactionalDomainVerificationStatus {
  if (!VERIFICATION_STATUSES.includes(value)) {
    throw new Error('verification_status is not supported for email transactional domain.');
  }
  return value;
}

function normalizeRecordType(value: EmailTransactionalDomainDnsRecordType): EmailTransactionalDomainDnsRecordType {
  if (!DNS_RECORD_TYPES.includes(value)) {
    throw new Error('dns_evidence record_type is not supported for email transactional domain.');
  }
  return value;
}

function normalizeDnsEvidence(records: EmailTransactionalDomainDnsEvidence[]): EmailTransactionalDomainDnsEvidence[] {
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error('dns_evidence must include DNS proof records for email transactional domain.');
  }

  const seenTypes = new Set<EmailTransactionalDomainDnsRecordType>();
  const normalized = records.map((record) => {
    const recordType = normalizeRecordType(record.record_type);
    seenTypes.add(recordType);
    return {
      record_type: recordType,
      host: requireNonEmpty(record.host, 'dns_evidence.host').toLowerCase(),
      expected_value: requireNonEmpty(record.expected_value, 'dns_evidence.expected_value'),
      observed_value: record.observed_value === undefined ? undefined : requireNonEmpty(record.observed_value, 'dns_evidence.observed_value'),
      verified: record.verified === true,
      verified_at: requireVerifiedAt(record.verified_at, 'dns_evidence.verified_at'),
    };
  });

  for (const requiredType of DNS_RECORD_TYPES) {
    if (!seenTypes.has(requiredType)) {
      throw new Error(`dns_evidence must include ${requiredType} for email transactional domain.`);
    }
  }

  return normalized;
}

export function configureEmailTransactionalDomain(input: EmailTransactionalDomainInput): EmailTransactionalDomainReceipt {
  if (input.outbound_send_requested === true) {
    throw new Error('email transactional domain must not send outbound email.');
  }
  if (input.provider_credential_requested === true) {
    throw new Error('email transactional domain must not handle provider credentials.');
  }
  if (input.dns_mutation_requested === true) {
    throw new Error('email transactional domain must not mutate DNS records.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('email transactional domain must not perform irreversible actions.');
  }

  const domainName = normalizeDomain(input.domain_name, 'domain_name');
  const { address: defaultFromAddress, domain: defaultFromDomain } = normalizeEmail(input.default_from_address);
  if (defaultFromDomain !== domainName) {
    throw new Error('default_from_address domain must match domain_name for email transactional domain.');
  }

  return {
    seed_id: PHASE_6B_EMAIL_TRANSACTIONAL_DOMAIN_SEED_ID,
    component_id: PHASE_6B_EMAIL_TRANSACTIONAL_DOMAIN_COMPONENT_ID,
    event_name: EMAIL_TRANSACTIONAL_DOMAIN_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    transactional_domain_id: requireNonEmpty(input.transactional_domain_id, 'transactional_domain_id'),
    domain_name: domainName,
    default_from_address: defaultFromAddress,
    default_from_domain: defaultFromDomain,
    display_name: requireNonEmpty(input.display_name, 'display_name'),
    pipeline_stage_model_ref: requireNonEmpty(input.pipeline_stage_model_ref, 'pipeline_stage_model_ref'),
    global_opt_out_registry_ref: requireNonEmpty(input.global_opt_out_registry_ref, 'global_opt_out_registry_ref'),
    outbound_gateway_enforcement_ref: requireNonEmpty(input.outbound_gateway_enforcement_ref, 'outbound_gateway_enforcement_ref'),
    lifecycle_status: normalizeLifecycleStatus(input.lifecycle_status),
    verification_status: normalizeVerificationStatus(input.verification_status),
    dns_evidence: normalizeDnsEvidence(input.dns_evidence),
    required_dns_record_types: DNS_RECORD_TYPES,
    opt_out_adl_ref: 'ADL-004',
    outbound_gateway_adl_ref: 'ADL-004',
    outbound_send_allowed: false,
    provider_credential_allowed: false,
    dns_mutation_allowed: false,
    irreversible_action_allowed: false,
    configured_by_user_id: requireNonEmpty(input.configured_by_user_id, 'configured_by_user_id'),
    configured_at: requireConfiguredAt(input.configured_at),
  };
}
