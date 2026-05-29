import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { BadRequestException } from '@nestjs/common';

import { AiProxyService, type AiProxyDeclarationInput } from './ai-proxy.service';

const serviceSource = readFileSync('src/ai-proxy/ai-proxy.service.ts', 'utf8');
const rootPackage = readFileSync('../../package.json', 'utf8');
const apiPackage = readFileSync('package.json', 'utf8');

function validDeclaration(overrides?: Partial<AiProxyDeclarationInput>): AiProxyDeclarationInput {
  return {
    organization_id: 'org-025c',
    actor_user_id: 'actor-025c',
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
    idempotency_key: 'ai-proxy-025c',
    ...overrides,
  };
}

function testAiProxyRejectsRealProviderMarkersAtDeclarationBoundary() {
  const service = new AiProxyService();

  for (const providerMarker of ['openai', 'anthropic', 'azure', 'gemini', 'api_key', 'secret', 'token', 'production', 'live']) {
    assert.throws(
      () => service.declareRequest(validDeclaration({ model_policy_key: `platform.${providerMarker}.runtime` })),
      BadRequestException,
    );
    assert.throws(
      () => service.declareRequest(validDeclaration({ data_sources: [`${providerMarker}.dataset`] })),
      BadRequestException,
    );
  }
}

function testAiProxyRejectsRealProviderMutationBeforeStubProof() {
  const service = new AiProxyService();
  const declaration = service.declareRequest(validDeclaration());

  assert.throws(
    () =>
      service.recordStubProof({
        declaration: {
          ...declaration,
          provider_configured: true as false,
        },
        prompt_token_estimate: 1,
        completion_token_cap: 1,
        requested_at: '2026-05-29T07:00:00.000Z',
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.recordStubProof({
        declaration: {
          ...declaration,
          production_credentials_required: true as false,
        },
        prompt_token_estimate: 1,
        completion_token_cap: 1,
        requested_at: '2026-05-29T07:00:00.000Z',
      }),
    BadRequestException,
  );
}

function testAiProxyServiceDoesNotContainNetworkOrProviderClientCalls() {
  for (const forbidden of [
    'fetch(',
    'axios',
    'https.request',
    'http.request',
    'new OpenAI',
    'OpenAI(',
    'Anthropic(',
    'GoogleGenerativeAI',
    'process.env.OPENAI',
    'process.env.ANTHROPIC',
    'process.env.GEMINI',
  ]) {
    assert.equal(serviceSource.includes(forbidden), false, `ai proxy service must not contain ${forbidden}`);
  }
}

function testAiProxyPackagesDoNotDeclareRealProviderDependencies() {
  for (const forbidden of ['openai', '@anthropic-ai/sdk', '@google/generative-ai']) {
    assert.equal(rootPackage.includes(forbidden), false, `root package must not depend on ${forbidden}`);
    assert.equal(apiPackage.includes(forbidden), false, `api package must not depend on ${forbidden}`);
  }
}

function run() {
  testAiProxyRejectsRealProviderMarkersAtDeclarationBoundary();
  testAiProxyRejectsRealProviderMutationBeforeStubProof();
  testAiProxyServiceDoesNotContainNetworkOrProviderClientCalls();
  testAiProxyPackagesDoNotDeclareRealProviderDependencies();

  console.log('P5B-025c AI proxy no-real-provider negative tests passed.');
}

run();
