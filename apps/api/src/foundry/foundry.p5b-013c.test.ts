import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { FoundryService, type FoundryUninstallExecutionInput } from './foundry.service';

function validUninstallInput(overrides?: Partial<FoundryUninstallExecutionInput>): FoundryUninstallExecutionInput {
  return {
    module_key: 'platform.fixture',
    module_version: '0.1.0',
    current_status: 'disabled',
    manifest_hash: 'e'.repeat(64),
    gatekeeper_outcome: 'ALLOW',
    gatekeeper_decision_token: 'gk_decision_p5b_013c',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-013c/evidence.md',
    retention_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-013c/retention-plan.md',
    rollback_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-013c/rollback-plan.md',
    organization_id: 'org-013c',
    actor_user_id: 'actor-013c',
    correlation_id: 'corr-p5b-013c',
    ...overrides,
  };
}

function testUninstallProducesDeterministicReceiptAndRetainsTenantData() {
  const service = new FoundryService();
  const input = validUninstallInput();

  const receipt = service.executeUninstall(input);
  const repeated = service.executeUninstall(input);

  assert.equal(receipt.action_key, 'module.uninstall');
  assert.equal(receipt.status_from, 'disabled');
  assert.equal(receipt.status_to, 'uninstalled');
  assert.equal(receipt.foundry_execution_completed, true);
  assert.equal(receipt.lifecycle_transition.allowed, true);
  assert.equal(receipt.registry.next_status, 'uninstalled');
  assert.equal(receipt.registry.persistence_required, true);
  assert.equal(receipt.data_retention.tenant_data_retained, true);
  assert.equal(receipt.data_retention.hard_delete_allowed, false);
  assert.equal(receipt.rollback.required_before_execution, true);
  assert.equal(receipt.runtime_surface.module_runtime_enabled, false);
  assert.equal(receipt.runtime_surface.routes_unpublished_required, true);
  assert.equal(receipt.evidence.evidence_required_before_execution, true);
  assert.equal(receipt.audit.event_type, 'foundry.module.uninstalled');
  assert.match(receipt.execution_id, /^foundry-uninstall-[a-f0-9]{16}$/);
  assert.match(receipt.receipt_hash, /^[a-f0-9]{64}$/);
  assert.equal(receipt.receipt_hash, repeated.receipt_hash);
}

function testUninstallSupportsApprovedSourceStates() {
  const service = new FoundryService();

  for (const currentStatus of ['installed', 'disabled', 'retiring'] as const) {
    const receipt = service.executeUninstall(validUninstallInput({ current_status: currentStatus }));
    assert.equal(receipt.status_from, currentStatus);
    assert.equal(receipt.status_to, 'uninstalled');
  }
}

function testUninstallRequiresGatekeeperAllowEvidenceRetentionAndRollback() {
  const service = new FoundryService();

  assert.throws(
    () => service.executeUninstall(validUninstallInput({ gatekeeper_outcome: 'STOP_FOR_REVIEW' })),
    BadRequestException,
  );
  assert.throws(() => service.executeUninstall(validUninstallInput({ evidence_ref: '' })), BadRequestException);
  assert.throws(() => service.executeUninstall(validUninstallInput({ retention_plan_ref: '' })), BadRequestException);
  assert.throws(() => service.executeUninstall(validUninstallInput({ rollback_plan_ref: '' })), BadRequestException);
}

function testUninstallRejectsMalformedInputAndUnsupportedState() {
  const service = new FoundryService();

  assert.throws(
    () => service.executeUninstall(validUninstallInput({ current_status: 'enabled' as never })),
    BadRequestException,
  );
  assert.throws(() => service.executeUninstall(validUninstallInput({ module_key: 'invalid' })), BadRequestException);
  assert.throws(() => service.executeUninstall(validUninstallInput({ module_version: 'latest' })), BadRequestException);
  assert.throws(() => service.executeUninstall(validUninstallInput({ manifest_hash: 'not-a-sha' })), BadRequestException);
}

function run() {
  testUninstallProducesDeterministicReceiptAndRetainsTenantData();
  testUninstallSupportsApprovedSourceStates();
  testUninstallRequiresGatekeeperAllowEvidenceRetentionAndRollback();
  testUninstallRejectsMalformedInputAndUnsupportedState();

  console.log('P5B-013c Foundry uninstall flow tests passed.');
}

run();
