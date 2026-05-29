import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { AiProxyService, type AiProxyDeclaration, type AiProxyDeclarationInput } from './ai-proxy.service';

function validDeclaration(overrides?: Partial<AiProxyDeclarationInput>): AiProxyDeclarationInput {
  return {
    organization_id: 'org-025b',
    actor_user_id: 'actor-025b',
    source_module: 'core.workflow',
    request_key: 'workflow.summary.assist',
    purpose: 'Summarize workflow state for platform operator review',
    data_sources: ['read_model.workflow.instance.summary'],
    capability_keys: ['platform.ai_proxy.request', 'platform.reporting.read'],
    model_policy_key: 'platform.ai_proxy.stub_only.v1',
    data_classes: ['confidential'],
    max_cost_cents: 50,
    human_review_required: true,
    retention_policy: 'per_ai_proxy_policy',
    redaction_policy: 'standard',
    evaluation_policy: 'platform.ai_proxy.evaluation.stub.v1',
    risk_classification: 'medium',
    idempotency_key: 'ai-proxy-025b',
    ...overrides,
  };
}

function declaredRequest(overrides?: Partial<AiProxyDeclarationInput>): AiProxyDeclaration {
  return new AiProxyService().declareRequest(validDeclaration(overrides));
}

function testAiProxyStubProofRecordsCostAuditAndNoProviderExecution() {
  const service = new AiProxyService();
  const proof = service.recordStubProof({
    declaration: declaredRequest(),
    prompt_token_estimate: 1200,
    completion_token_cap: 300,
    requested_at: '2026-05-29T06:00:00.000Z',
  });

  assert.equal(proof.mode, 'stub_only');
  assert.equal(proof.status, 'stub_recorded');
  assert.equal(proof.organization_id, 'org-025b');
  assert.equal(proof.actor_user_id, 'actor-025b');
  assert.equal(proof.request_key, 'workflow.summary.assist');
  assert.equal(proof.idempotency_key, 'ai-proxy-025b');
  assert.equal(proof.cost.currency, 'USD');
  assert.equal(proof.cost.estimated_cents, 15);
  assert.equal(proof.cost.hard_cap_cents, 50);
  assert.equal(proof.cost.within_budget, true);
  assert.equal(proof.output.kind, 'stub');
  assert.equal(proof.output.content, 'AI_PROXY_STUB_NO_MODEL_OUTPUT');
  assert.equal(proof.audit.event_type, 'ai_proxy.stub.recorded');
  assert.equal(proof.audit.audit_required, true);
  assert.equal(proof.provider_configured, false);
  assert.equal(proof.provider_request_started, false);
  assert.equal(proof.runtime_ai_executed, false);
  assert.equal(proof.production_credentials_required, false);
}

function testAiProxyStubProofRejectsBudgetOverflowAndMalformedCostInputs() {
  const service = new AiProxyService();
  const declaration = declaredRequest({ max_cost_cents: 5 });

  assert.throws(
    () =>
      service.recordStubProof({
        declaration,
        prompt_token_estimate: 1000,
        completion_token_cap: 1,
        requested_at: '2026-05-29T06:00:00.000Z',
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.recordStubProof({
        declaration,
        prompt_token_estimate: -1,
        completion_token_cap: 1,
        requested_at: '2026-05-29T06:00:00.000Z',
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.recordStubProof({
        declaration,
        prompt_token_estimate: 1,
        completion_token_cap: -1,
        requested_at: '2026-05-29T06:00:00.000Z',
      }),
    BadRequestException,
  );
}

function testAiProxyStubProofRejectsProviderOrRuntimeMutatedDeclarations() {
  const service = new AiProxyService();
  const declaration = declaredRequest();

  assert.throws(
    () =>
      service.recordStubProof({
        declaration: {
          ...declaration,
          provider_request_started: true as false,
        },
        prompt_token_estimate: 1,
        completion_token_cap: 1,
        requested_at: '2026-05-29T06:00:00.000Z',
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.recordStubProof({
        declaration: {
          ...declaration,
          runtime_ai_executed: true as false,
        },
        prompt_token_estimate: 1,
        completion_token_cap: 1,
        requested_at: '2026-05-29T06:00:00.000Z',
      }),
    BadRequestException,
  );
}

function testAiProxyStubProofRejectsInvalidRequestTimestamp() {
  assert.throws(
    () =>
      new AiProxyService().recordStubProof({
        declaration: declaredRequest(),
        prompt_token_estimate: 1,
        completion_token_cap: 1,
        requested_at: 'not-a-date',
      }),
    BadRequestException,
  );
}

function run() {
  testAiProxyStubProofRecordsCostAuditAndNoProviderExecution();
  testAiProxyStubProofRejectsBudgetOverflowAndMalformedCostInputs();
  testAiProxyStubProofRejectsProviderOrRuntimeMutatedDeclarations();
  testAiProxyStubProofRejectsInvalidRequestTimestamp();

  console.log('P5B-025b AI proxy stub/cost/audit proof tests passed.');
}

run();
