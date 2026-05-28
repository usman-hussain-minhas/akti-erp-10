import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { FoundryService, type FoundryDisableExecutionInput } from './foundry.service';

function validDisableInput(overrides?: Partial<FoundryDisableExecutionInput>): FoundryDisableExecutionInput {
  return {
    module_key: 'platform.fixture',
    module_version: '0.1.0',
    manifest_hash: 'd'.repeat(64),
    gatekeeper_outcome: 'ALLOW',
    gatekeeper_decision_token: 'gk_decision_p5b_013b',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-013b/evidence.md',
    retention_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-013b/retention-plan.md',
    organization_id: 'org-013b',
    actor_user_id: 'actor-013b',
    correlation_id: 'corr-p5b-013b',
    ...overrides,
  };
}

function testDisableProducesDeterministicReceiptAndRetainsTenantData() {
  const service = new FoundryService();
  const input = validDisableInput();

  const receipt = service.executeDisable(input);
  const repeated = service.executeDisable(input);

  assert.equal(receipt.action_key, 'module.disable');
  assert.equal(receipt.status_from, 'enabled');
  assert.equal(receipt.status_to, 'disabled');
  assert.equal(receipt.foundry_execution_completed, true);
  assert.equal(receipt.lifecycle_transition.allowed, true);
  assert.equal(receipt.registry.next_status, 'disabled');
  assert.equal(receipt.registry.persistence_required, true);
  assert.equal(receipt.data_retention.tenant_data_retained, true);
  assert.equal(receipt.runtime_surface.module_runtime_enabled, false);
  assert.equal(receipt.runtime_surface.data_deleted, false);
  assert.equal(receipt.evidence.evidence_required_before_execution, true);
  assert.equal(receipt.audit.event_type, 'foundry.module.disabled');
  assert.match(receipt.execution_id, /^foundry-disable-[a-f0-9]{16}$/);
  assert.match(receipt.receipt_hash, /^[a-f0-9]{64}$/);
  assert.equal(receipt.receipt_hash, repeated.receipt_hash);
}

function testDisableRequiresGatekeeperAllowAndEvidence() {
  const service = new FoundryService();

  assert.throws(
    () => service.executeDisable(validDisableInput({ gatekeeper_outcome: 'DENY' })),
    BadRequestException,
  );
  assert.throws(() => service.executeDisable(validDisableInput({ evidence_ref: '' })), BadRequestException);
  assert.throws(() => service.executeDisable(validDisableInput({ gatekeeper_decision_token: '' })), BadRequestException);
  assert.throws(() => service.executeDisable(validDisableInput({ retention_plan_ref: '' })), BadRequestException);
}

function testDisableRejectsMalformedInput() {
  const service = new FoundryService();

  assert.throws(() => service.executeDisable(validDisableInput({ module_key: 'invalid' })), BadRequestException);
  assert.throws(() => service.executeDisable(validDisableInput({ module_version: 'latest' })), BadRequestException);
  assert.throws(() => service.executeDisable(validDisableInput({ manifest_hash: 'not-a-sha' })), BadRequestException);
}

function run() {
  testDisableProducesDeterministicReceiptAndRetainsTenantData();
  testDisableRequiresGatekeeperAllowAndEvidence();
  testDisableRejectsMalformedInput();

  console.log('P5B-013b Foundry disable flow tests passed.');
}

run();
