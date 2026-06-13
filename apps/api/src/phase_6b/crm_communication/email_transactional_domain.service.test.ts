import assert from 'node:assert/strict';
import { configureEmailTransactionalDomain, type EmailTransactionalDomainInput } from './email_transactional_domain.service';

const baseInput: EmailTransactionalDomainInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_communication',
  transactional_domain_id: 'email_domain_001',
  domain_name: 'Example.com',
  default_from_address: 'NoReply@Example.com',
  display_name: 'Example transactional domain',
  pipeline_stage_model_ref: 'pipeline_stage_model_001',
  global_opt_out_registry_ref: 'global_opt_out_registry_001',
  outbound_gateway_enforcement_ref: 'outbound_gateway_enforcement_001',
  lifecycle_status: 'ACTIVE',
  verification_status: 'VERIFIED',
  dns_evidence: [
    {
      record_type: 'SPF',
      host: 'Example.com',
      expected_value: 'v=spf1 include:mail.example.com -all',
      observed_value: 'v=spf1 include:mail.example.com -all',
      verified: true,
      verified_at: '2026-06-08T20:00:00.000Z',
    },
    {
      record_type: 'DKIM',
      host: 'selector._domainkey.Example.com',
      expected_value: 'v=DKIM1; k=rsa; p=public-key',
      observed_value: 'v=DKIM1; k=rsa; p=public-key',
      verified: true,
      verified_at: '2026-06-08T20:00:00.000Z',
    },
    {
      record_type: 'DMARC',
      host: '_dmarc.Example.com',
      expected_value: 'v=DMARC1; p=quarantine',
      observed_value: 'v=DMARC1; p=quarantine',
      verified: true,
      verified_at: '2026-06-08T20:00:00.000Z',
    },
    {
      record_type: 'BOUNCE_DOMAIN',
      host: 'bounce.Example.com',
      expected_value: 'bounce-target.example.com',
      observed_value: 'bounce-target.example.com',
      verified: true,
      verified_at: '2026-06-08T20:00:00.000Z',
    },
  ],
  configured_by_user_id: 'user_comms_owner_001',
  configured_at: '2026-06-08T20:05:00.000Z',
};

const receipt = configureEmailTransactionalDomain(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_07_email_transactional_domain');
assert.equal(receipt.component_id, '6B.07');
assert.equal(receipt.event_name, 'phase_6b.crm_communication.email_transactional_domain.configured');
assert.equal(receipt.domain_name, 'example.com');
assert.equal(receipt.default_from_address, 'noreply@example.com');
assert.equal(receipt.default_from_domain, 'example.com');
assert.equal(receipt.lifecycle_status, 'ACTIVE');
assert.equal(receipt.verification_status, 'VERIFIED');
assert.equal(receipt.dns_evidence.length, 4);
assert.deepEqual([...receipt.required_dns_record_types], ['SPF', 'DKIM', 'DMARC', 'BOUNCE_DOMAIN']);
assert.equal(receipt.opt_out_adl_ref, 'ADL-004');
assert.equal(receipt.outbound_gateway_adl_ref, 'ADL-004');
assert.equal(receipt.outbound_send_allowed, false);
assert.equal(receipt.provider_credential_allowed, false);
assert.equal(receipt.dns_mutation_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const draftReceipt = configureEmailTransactionalDomain({
  ...baseInput,
  transactional_domain_id: 'email_domain_002',
  lifecycle_status: 'DRAFT',
  verification_status: 'PENDING',
  dns_evidence: baseInput.dns_evidence.map((record) => ({ ...record, verified: false, observed_value: undefined, verified_at: undefined })),
});
assert.equal(draftReceipt.lifecycle_status, 'DRAFT');
assert.equal(draftReceipt.verification_status, 'PENDING');
assert.equal(draftReceipt.dns_evidence.every((record) => record.verified === false), true);

assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, transactional_domain_id: '' }), /transactional_domain_id is required/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, domain_name: 'bad_domain' }), /domain_name must be a valid domain/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, default_from_address: 'not-an-email' }), /default_from_address must be a valid email address/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, default_from_address: 'sender@other.example' }), /default_from_address domain must match domain_name/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, display_name: '' }), /display_name is required/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, pipeline_stage_model_ref: '' }), /pipeline_stage_model_ref is required/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, global_opt_out_registry_ref: '' }), /global_opt_out_registry_ref is required/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, outbound_gateway_enforcement_ref: '' }), /outbound_gateway_enforcement_ref is required/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, lifecycle_status: 'DELETED' as never }), /lifecycle_status is not supported/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, verification_status: 'UNKNOWN' as never }), /verification_status is not supported/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, dns_evidence: [] }), /dns_evidence must include DNS proof records/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, dns_evidence: baseInput.dns_evidence.filter((record) => record.record_type !== 'DMARC') }), /dns_evidence must include DMARC/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, dns_evidence: [{ ...baseInput.dns_evidence[0]!, record_type: 'MX' as never }] }), /dns_evidence record_type is not supported/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, dns_evidence: [{ ...baseInput.dns_evidence[0]!, host: '' }, ...baseInput.dns_evidence.slice(1)] }), /dns_evidence.host is required/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, dns_evidence: [{ ...baseInput.dns_evidence[0]!, expected_value: '' }, ...baseInput.dns_evidence.slice(1)] }), /dns_evidence.expected_value is required/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, dns_evidence: [{ ...baseInput.dns_evidence[0]!, observed_value: '' }, ...baseInput.dns_evidence.slice(1)] }), /dns_evidence.observed_value is required/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, dns_evidence: [{ ...baseInput.dns_evidence[0]!, verified_at: 'bad-date' }, ...baseInput.dns_evidence.slice(1)] }), /dns_evidence.verified_at must be a valid ISO-compatible timestamp/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, configured_by_user_id: '' }), /configured_by_user_id is required/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, configured_at: 'not-a-date' }), /configured_at must be a valid ISO-compatible timestamp/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, outbound_send_requested: true }), /must not send outbound email/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, provider_credential_requested: true }), /must not handle provider credentials/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, dns_mutation_requested: true }), /must not mutate DNS records/);
assert.throws(() => configureEmailTransactionalDomain({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-056 email transactional domain service test passed.');
