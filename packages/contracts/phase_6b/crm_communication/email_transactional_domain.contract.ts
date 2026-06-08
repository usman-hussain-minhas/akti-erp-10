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
