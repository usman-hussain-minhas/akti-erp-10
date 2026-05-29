import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { FoundryService, type FoundryEnableExecutionInput } from './foundry.service';

function validEnableInput(overrides?: Partial<FoundryEnableExecutionInput>): FoundryEnableExecutionInput {
  return {
    module_key: 'platform.fixture',
    module_version: '0.1.0',
    current_status: 'installed',
    manifest_hash: 'c'.repeat(64),
    gatekeeper_outcome: 'ALLOW',
    gatekeeper_decision_token: 'gk_decision_p5b_013a',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-013a/evidence.md',
    organization_id: 'org-013a',
    actor_user_id: 'actor-013a',
    correlation_id: 'corr-p5b-013a',
    ...overrides,
  };
}

function testEnableFromInstalledProducesDeterministicReceipt() {
  const service = new FoundryService();
  const input = validEnableInput();

  const receipt = service.executeEnable(input);
  const repeated = service.executeEnable(input);

  assert.equal(receipt.action_key, 'module.enable');
  assert.equal(receipt.status_from, 'installed');
  assert.equal(receipt.status_to, 'enabled');
  assert.equal(receipt.foundry_execution_completed, true);
  assert.equal(receipt.lifecycle_transition.allowed, true);
  assert.equal(receipt.registry.next_status, 'enabled');
  assert.equal(receipt.registry.persistence_required, true);
  assert.equal(receipt.evidence.evidence_required_before_execution, true);
  assert.equal(receipt.runtime_surface.module_runtime_enabled, true);
  assert.equal(receipt.runtime_surface.phase5c_frontend_polish_allowed, false);
  assert.equal(receipt.audit.event_type, 'foundry.module.enabled');
  assert.match(receipt.execution_id, /^foundry-enable-[a-f0-9]{16}$/);
  assert.match(receipt.receipt_hash, /^[a-f0-9]{64}$/);
  assert.equal(receipt.receipt_hash, repeated.receipt_hash);
}

function testEnableFromDisabledUsesApprovedLifecycleTransition() {
  const service = new FoundryService();

  const receipt = service.executeEnable(validEnableInput({ current_status: 'disabled' }));

  assert.equal(receipt.status_from, 'disabled');
  assert.equal(receipt.status_to, 'enabled');
  assert.equal(receipt.lifecycle_transition.action_key, 'module.enable');
}

function testEnableRequiresGatekeeperAllowAndEvidence() {
  const service = new FoundryService();

  assert.throws(
    () => service.executeEnable(validEnableInput({ gatekeeper_outcome: 'APPROVAL_REQUIRED' })),
    BadRequestException,
  );
  assert.throws(
    () => service.executeEnable(validEnableInput({ evidence_ref: '' })),
    BadRequestException,
  );
  assert.throws(
    () => service.executeEnable(validEnableInput({ gatekeeper_decision_token: '' })),
    BadRequestException,
  );
}

function testEnableRejectsInvalidStateAndMalformedInput() {
  const service = new FoundryService();

  assert.throws(
    () => service.executeEnable(validEnableInput({ current_status: 'proposed' as never })),
    BadRequestException,
  );
  assert.throws(() => service.executeEnable(validEnableInput({ module_key: 'invalid' })), BadRequestException);
  assert.throws(() => service.executeEnable(validEnableInput({ module_version: 'latest' })), BadRequestException);
  assert.throws(() => service.executeEnable(validEnableInput({ manifest_hash: 'not-a-sha' })), BadRequestException);
}

function run() {
  testEnableFromInstalledProducesDeterministicReceipt();
  testEnableFromDisabledUsesApprovedLifecycleTransition();
  testEnableRequiresGatekeeperAllowAndEvidence();
  testEnableRejectsInvalidStateAndMalformedInput();

  console.log('P5B-013a Foundry enable flow tests passed.');
}

run();
