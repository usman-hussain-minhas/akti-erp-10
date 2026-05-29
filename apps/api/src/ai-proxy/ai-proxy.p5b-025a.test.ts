import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { AiProxyService, type AiProxyDeclarationInput } from './ai-proxy.service';

function validDeclaration(overrides?: Partial<AiProxyDeclarationInput>): AiProxyDeclarationInput {
  return {
    organization_id: 'org-025a',
    actor_user_id: 'actor-025a',
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
    idempotency_key: 'ai-proxy-025a',
    ...overrides,
  };
}

function testAiProxyDeclarationCapturesGovernedBoundaryWithoutRuntimeExecution() {
  const declaration = new AiProxyService().declareRequest(validDeclaration());

  assert.equal(declaration.organization_id, 'org-025a');
  assert.equal(declaration.actor_user_id, 'actor-025a');
  assert.equal(declaration.source_module, 'core.workflow');
  assert.equal(declaration.request_key, 'workflow.summary.assist');
  assert.deepEqual(declaration.data_sources, ['read_model.workflow.instance.summary']);
  assert.deepEqual(declaration.capability_keys, ['platform.ai_proxy.request', 'platform.reporting.read']);
  assert.equal(declaration.model_policy_key, 'platform.ai_proxy.stub_only.v1');
  assert.equal(declaration.max_cost_cents, 250);
  assert.equal(declaration.status, 'declared');
  assert.equal(declaration.provider_configured, false);
  assert.equal(declaration.provider_request_started, false);
  assert.equal(declaration.runtime_ai_executed, false);
  assert.equal(declaration.production_credentials_required, false);
  assert.equal(declaration.tenant_boundary_required, true);
  assert.equal(declaration.gatekeeper.preflight_required, true);
  assert.equal(declaration.gatekeeper.capability_key, 'platform.ai_proxy.request');
  assert.equal(declaration.audit.event_type, 'ai_proxy.request.declared');
  assert.equal(declaration.audit.audit_required, true);
}

function testAiProxyDeclarationRequiresHumanReviewForRestrictedOrHighRiskData() {
  const service = new AiProxyService();

  assert.equal(
    service.declareRequest(validDeclaration({ risk_classification: 'high' })).gatekeeper.high_risk_review_required,
    true,
  );
  assert.throws(
    () =>
      service.declareRequest(
        validDeclaration({
          data_classes: ['restricted'],
          human_review_required: false,
        }),
      ),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.declareRequest(
        validDeclaration({
          risk_classification: 'high',
          human_review_required: false,
        }),
      ),
    BadRequestException,
  );
}

function testAiProxyDeclarationRejectsMissingCapabilityAndProviderRuntimeMarkers() {
  const service = new AiProxyService();

  assert.throws(
    () => service.declareRequest(validDeclaration({ capability_keys: ['platform.reporting.read'] })),
    BadRequestException,
  );
  assert.throws(() => service.declareRequest(validDeclaration({ model_policy_key: 'openai-gpt-live' })), BadRequestException);
  assert.throws(() => service.declareRequest(validDeclaration({ data_sources: ['provider.api.secret.dataset'] })), BadRequestException);
  assert.throws(() => service.declareRequest(validDeclaration({ purpose: 'Call live Anthropic provider' })), BadRequestException);
}

function testAiProxyDeclarationRejectsMalformedGovernanceInputs() {
  const service = new AiProxyService();

  assert.throws(() => service.declareRequest(validDeclaration({ organization_id: '' })), BadRequestException);
  assert.throws(() => service.declareRequest(validDeclaration({ data_classes: ['public' as AiProxyDeclarationInput['data_classes'][number]] })), BadRequestException);
  assert.throws(() => service.declareRequest(validDeclaration({ max_cost_cents: -1 })), BadRequestException);
  assert.throws(() => service.declareRequest(validDeclaration({ max_cost_cents: 100_001 })), BadRequestException);
  assert.throws(
    () => service.declareRequest(validDeclaration({ risk_classification: 'critical' as AiProxyDeclarationInput['risk_classification'] })),
    BadRequestException,
  );
}

function run() {
  testAiProxyDeclarationCapturesGovernedBoundaryWithoutRuntimeExecution();
  testAiProxyDeclarationRequiresHumanReviewForRestrictedOrHighRiskData();
  testAiProxyDeclarationRejectsMissingCapabilityAndProviderRuntimeMarkers();
  testAiProxyDeclarationRejectsMalformedGovernanceInputs();

  console.log('P5B-025a AI proxy declaration boundary tests passed.');
}

run();
