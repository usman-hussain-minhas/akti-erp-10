import assert from 'node:assert/strict';

import { Phase6BProductStatusArchivePolicyService } from './product_status_archive_policy.service';

function validStatusInput() {
  return {
    organization_id: 'org_demo',
    product_id: 'prod_admission_package',
    current_status: 'draft' as const,
    requested_status: 'active' as const,
    requested_action: 'update_status' as const,
    requested_event: 'product.updated' as const,
    actor_user_id: 'user_catalogue_manager',
    status_change_reason: 'catalogue approval',
  };
}

function testAcceptsSourceGroundedStatusUpdate() {
  const service = new Phase6BProductStatusArchivePolicyService();
  const result = service.evaluateProductStatusArchivePolicy(validStatusInput());

  assert.equal(result.accepted, true);
  assert.deepEqual(result.violations, []);
  assert.equal(result.normalized_status, 'active');
  assert.equal(result.emitted_event, 'product.updated');
  assert.deepEqual(result.evidence.schema_models, ['Phase6BProduct', 'Phase6BProductHistory']);
  assert.equal(result.evidence.archive_over_delete_enforced, true);
  assert.equal(result.evidence.foundry_activation_required, true);
  assert.equal(result.evidence.access_gatekeeper_required, true);
}

function testRejectsDeleteAction() {
  const service = new Phase6BProductStatusArchivePolicyService();
  const result = service.evaluateProductStatusArchivePolicy({
    ...validStatusInput(),
    requested_action: 'delete',
  });

  assert.equal(result.accepted, false);
  assert.equal(result.evidence.delete_action_blocked, true);
  assert.ok(result.violations.includes('delete action is forbidden; archive over delete is required'));
}

function testArchiveRequiresArchivedStatusAndReason() {
  const service = new Phase6BProductStatusArchivePolicyService();
  const result = service.evaluateProductStatusArchivePolicy({
    ...validStatusInput(),
    current_status: 'active',
    requested_status: 'archived',
    requested_action: 'archive',
    requested_event: 'product.archived',
    archive_reason: 'product retired',
  });

  assert.equal(result.accepted, true);
  assert.equal(result.normalized_status, 'archived');
  assert.equal(result.emitted_event, 'product.archived');
}

function testRejectsArchiveWithoutReason() {
  const service = new Phase6BProductStatusArchivePolicyService();
  const result = service.evaluateProductStatusArchivePolicy({
    ...validStatusInput(),
    current_status: 'active',
    requested_status: 'archived',
    requested_action: 'archive',
    requested_event: 'product.archived',
  });

  assert.equal(result.accepted, false);
  assert.ok(result.violations.includes('archived status requires archive_reason to enforce archive over delete'));
}

function testRejectsInconsistentArchivedEvent() {
  const service = new Phase6BProductStatusArchivePolicyService();
  const result = service.evaluateProductStatusArchivePolicy({
    ...validStatusInput(),
    requested_status: 'active',
    requested_event: 'product.archived',
  });

  assert.equal(result.accepted, false);
  assert.ok(result.violations.includes('product.archived event requires archived status'));
}

function testRejectsMissingStatusChangeReason() {
  const service = new Phase6BProductStatusArchivePolicyService();
  const result = service.evaluateProductStatusArchivePolicy({
    ...validStatusInput(),
    status_change_reason: '',
  });

  assert.equal(result.accepted, false);
  assert.ok(result.violations.includes('status changes require status_change_reason'));
}

function run() {
  testAcceptsSourceGroundedStatusUpdate();
  testRejectsDeleteAction();
  testArchiveRequiresArchivedStatusAndReason();
  testRejectsArchiveWithoutReason();
  testRejectsInconsistentArchivedEvent();
  testRejectsMissingStatusChangeReason();
  console.log('P6B-FFET-004 product status archive policy service test passed.');
}

run();
