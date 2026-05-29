import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { FoundryService, type FoundryRollbackRecoveryInput } from './foundry.service';

function validRollbackInput(overrides?: Partial<FoundryRollbackRecoveryInput>): FoundryRollbackRecoveryInput {
  return {
    module_key: 'platform.fixture',
    module_version: '0.1.0',
    current_status: 'rollback_required',
    manifest_hash: '1'.repeat(64),
    gatekeeper_outcome: 'ALLOW',
    gatekeeper_decision_token: 'gk_decision_p5b_014b',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-014b/recovery-evidence.md',
    rollback_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-014b/rollback-plan.md',
    failure_evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-014b/failure-evidence.md',
    organization_id: 'org-014b',
    actor_user_id: 'actor-014b',
    correlation_id: 'corr-p5b-014b',
    ...overrides,
  };
}

function testRollbackRecoveryFromRollbackRequiredProducesReceipt() {
  const service = new FoundryService();
  const input = validRollbackInput();

  const receipt = service.executeRollbackRecovery(input);
  const repeated = service.executeRollbackRecovery(input);

  assert.equal(receipt.action_key, 'module.rollback_recovery');
  assert.equal(receipt.status_from, 'rollback_required');
  assert.equal(receipt.status_to, 'installed');
  assert.equal(receipt.lifecycle_transitions.length, 1);
  assert.equal(receipt.lifecycle_transitions[0].action_key, 'module.resolve_rollback');
  assert.equal(receipt.rollback.recovery_completed, true);
  assert.equal(receipt.registry.next_status, 'installed');
  assert.equal(receipt.registry.rollback_required_cleared, true);
  assert.equal(receipt.evidence.evidence_required_before_execution, true);
  assert.equal(receipt.audit.event_type, 'foundry.module.rollback_recovered');
  assert.match(receipt.execution_id, /^foundry-rollback-[a-f0-9]{16}$/);
  assert.match(receipt.receipt_hash, /^[a-f0-9]{64}$/);
  assert.equal(receipt.receipt_hash, repeated.receipt_hash);
}

function testRollbackRecoveryCanRecordFailureThenRecoverFromUpdating() {
  const service = new FoundryService();

  const receipt = service.executeRollbackRecovery(validRollbackInput({ current_status: 'updating' }));

  assert.equal(receipt.lifecycle_transitions.length, 2);
  assert.deepEqual(
    receipt.lifecycle_transitions.map((transition) => transition.action_key),
    ['module.require_rollback', 'module.resolve_rollback'],
  );
}

function testRollbackRecoveryRequiresGatekeeperAllowAndEvidence() {
  const service = new FoundryService();

  assert.throws(
    () => service.executeRollbackRecovery(validRollbackInput({ gatekeeper_outcome: 'DENY' })),
    BadRequestException,
  );
  assert.throws(() => service.executeRollbackRecovery(validRollbackInput({ evidence_ref: '' })), BadRequestException);
  assert.throws(
    () => service.executeRollbackRecovery(validRollbackInput({ rollback_plan_ref: '' })),
    BadRequestException,
  );
  assert.throws(
    () => service.executeRollbackRecovery(validRollbackInput({ failure_evidence_ref: '' })),
    BadRequestException,
  );
}

function testRollbackRecoveryRejectsMalformedInputAndUnsupportedState() {
  const service = new FoundryService();

  assert.throws(
    () => service.executeRollbackRecovery(validRollbackInput({ current_status: 'enabled' as never })),
    BadRequestException,
  );
  assert.throws(() => service.executeRollbackRecovery(validRollbackInput({ module_key: 'invalid' })), BadRequestException);
  assert.throws(
    () => service.executeRollbackRecovery(validRollbackInput({ module_version: 'latest' })),
    BadRequestException,
  );
  assert.throws(
    () => service.executeRollbackRecovery(validRollbackInput({ manifest_hash: 'not-a-sha' })),
    BadRequestException,
  );
}

function run() {
  testRollbackRecoveryFromRollbackRequiredProducesReceipt();
  testRollbackRecoveryCanRecordFailureThenRecoverFromUpdating();
  testRollbackRecoveryRequiresGatekeeperAllowAndEvidence();
  testRollbackRecoveryRejectsMalformedInputAndUnsupportedState();

  console.log('P5B-014b Foundry rollback/recovery flow tests passed.');
}

run();
