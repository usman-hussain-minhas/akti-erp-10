import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { AiProxyService, type AiProxyDeclarationInput } from './ai-proxy.service';

function validDeclaration(overrides?: Partial<AiProxyDeclarationInput>): AiProxyDeclarationInput {
  return {
    organization_id: 'org-026i',
    actor_user_id: 'actor-026i',
    source_module: 'core.workflow',
    request_key: 'workflow.summary.assist',
    purpose: 'Summarize workflow state for platform operator review',
    data_sources: ['read_model.workflow.instance.summary'],
    capability_keys: ['platform.ai_proxy.request', 'platform.reporting.read'],
    model_policy_key: 'platform.ai_proxy.stub_only.v1',
    data_classes: ['internal'],
    max_cost_cents: 250,
    human_review_required: true,
    retention_policy: 'per_ai_proxy_policy',
    redaction_policy: 'standard',
    evaluation_policy: 'platform.ai_proxy.evaluation.stub.v1',
    risk_classification: 'medium',
    idempotency_key: 'ai-proxy-026i',
    ...overrides,
  };
}

function testAiProxyTenantIsolationFixtureAcceptsSameTenantStubOnlyFlow() {
  const service = new AiProxyService();
  const declaration = service.declareRequest(validDeclaration());
  const stubProof = service.recordStubProof({
    declaration,
    prompt_token_estimate: 100,
    completion_token_cap: 50,
    requested_at: '2026-05-29T08:00:00.000Z',
  });

  const result = service.runTenantIsolationFixture({
    organization_id: 'org-026i',
    actor_user_id: 'actor-026i',
    declaration,
    stub_proof: stubProof,
  });

  assert.equal(result.ai_proxy_tenant_isolation_enforced, true);
  assert.equal(result.gatekeeper_governance_preserved, true);
  assert.equal(result.provider_configured, false);
  assert.equal(result.provider_request_started, false);
  assert.equal(result.runtime_ai_executed, false);
  assert.equal(result.production_credentials_required, false);
}

function testAiProxyTenantIsolationFixtureRejectsCrossTenantDeclarationOrProof() {
  const service = new AiProxyService();
  const declaration = service.declareRequest(validDeclaration());
  const stubProof = service.recordStubProof({
    declaration,
    prompt_token_estimate: 100,
    completion_token_cap: 50,
    requested_at: '2026-05-29T08:00:00.000Z',
  });

  assert.throws(
    () =>
      service.runTenantIsolationFixture({
        organization_id: 'org-026i',
        actor_user_id: 'actor-026i',
        declaration: {
          ...declaration,
          organization_id: 'org-foreign',
        },
        stub_proof: stubProof,
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.runTenantIsolationFixture({
        organization_id: 'org-026i',
        actor_user_id: 'actor-026i',
        declaration,
        stub_proof: {
          ...stubProof,
          organization_id: 'org-foreign',
        },
      }),
    BadRequestException,
  );
}

function testAiProxyTenantIsolationFixtureRejectsRuntimeAiOrProviderMutation() {
  const service = new AiProxyService();
  const declaration = service.declareRequest(validDeclaration());
  const stubProof = service.recordStubProof({
    declaration,
    prompt_token_estimate: 100,
    completion_token_cap: 50,
    requested_at: '2026-05-29T08:00:00.000Z',
  });

  assert.throws(
    () =>
      service.runTenantIsolationFixture({
        organization_id: 'org-026i',
        actor_user_id: 'actor-026i',
        declaration: {
          ...declaration,
          runtime_ai_executed: true as false,
        },
        stub_proof: stubProof,
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.runTenantIsolationFixture({
        organization_id: 'org-026i',
        actor_user_id: 'actor-026i',
        declaration,
        stub_proof: {
          ...stubProof,
          provider_request_started: true as false,
        },
      }),
    BadRequestException,
  );
}

function testAiProxyTenantIsolationFixtureRejectsRequestIdentityMismatch() {
  const service = new AiProxyService();
  const declaration = service.declareRequest(validDeclaration());
  const stubProof = service.recordStubProof({
    declaration,
    prompt_token_estimate: 100,
    completion_token_cap: 50,
    requested_at: '2026-05-29T08:00:00.000Z',
  });

  assert.throws(
    () =>
      service.runTenantIsolationFixture({
        organization_id: 'org-026i',
        actor_user_id: 'actor-026i',
        declaration,
        stub_proof: {
          ...stubProof,
          idempotency_key: 'other-idempotency-key',
        },
      }),
    BadRequestException,
  );
}

function run() {
  testAiProxyTenantIsolationFixtureAcceptsSameTenantStubOnlyFlow();
  testAiProxyTenantIsolationFixtureRejectsCrossTenantDeclarationOrProof();
  testAiProxyTenantIsolationFixtureRejectsRuntimeAiOrProviderMutation();
  testAiProxyTenantIsolationFixtureRejectsRequestIdentityMismatch();

  console.log('P5B-026i AI proxy cross-tenant negative tests passed.');
}

run();
