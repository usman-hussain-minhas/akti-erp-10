import assert from 'node:assert/strict';

import { Phase6BProductRecordAuthorityService } from './product_record_authority.service';

function validProductRecordInput() {
  return {
    organization_id: 'org_akti_demo',
    product_id: 'prod_admission_package',
    status: 'active' as const,
    name: 'Admission Package',
    sku: 'ADM-001',
    category_ids: ['cat_services'],
    media_ids: ['media_cover'],
    price_history_ids: ['price_2026'],
    actor_user_id: 'user_catalogue_manager',
    requested_event: 'product.created' as const,
  };
}

function testAcceptsTenantScopedProductRecordAuthority() {
  const service = new Phase6BProductRecordAuthorityService();
  const result = service.evaluateProductRecordAuthority(validProductRecordInput());

  assert.equal(result.accepted, true);
  assert.deepEqual(result.violations, []);
  assert.equal(result.schema_model, 'Phase6BProduct');
  assert.deepEqual(result.owned_related_models, [
    'Phase6BProductMedia',
    'Phase6BProductHistory',
    'Phase6BProductPriceHistory',
  ]);
  assert.equal(result.evidence.organization_id, 'org_akti_demo');
  assert.equal(result.evidence.product_id, 'prod_admission_package');
  assert.equal(result.evidence.event_type, 'product.created');
  assert.equal(result.evidence.archive_over_delete_enforced, true);
  assert.equal(result.evidence.foundry_activation_required, true);
  assert.equal(result.evidence.access_gatekeeper_required, true);
  assert.equal(result.manifest_verified, true);
}

function testRejectsMissingTenantIsolation() {
  const service = new Phase6BProductRecordAuthorityService();
  const result = service.evaluateProductRecordAuthority({
    ...validProductRecordInput(),
    organization_id: '',
  });

  assert.equal(result.accepted, false);
  assert.ok(result.violations.includes('organization_id is required for tenant isolation'));
}

function testArchiveOverDeleteIsEnforced() {
  const service = new Phase6BProductRecordAuthorityService();
  const result = service.evaluateProductRecordAuthority({
    ...validProductRecordInput(),
    status: 'archived',
    requested_event: 'product.archived',
    archived_reason: 'catalogue replacement',
  });

  assert.equal(result.accepted, true);
  assert.equal(result.emitted_event, 'product.archived');
  assert.equal(result.evidence.archive_over_delete_enforced, true);
}

function testRejectsArchiveWithoutReason() {
  const service = new Phase6BProductRecordAuthorityService();
  const result = service.evaluateProductRecordAuthority({
    ...validProductRecordInput(),
    status: 'archived',
    requested_event: 'product.archived',
  });

  assert.equal(result.accepted, false);
  assert.ok(result.violations.includes('archived products require archived_reason to enforce archive over delete'));
}

function testRejectsDuplicateRelatedRecords() {
  const service = new Phase6BProductRecordAuthorityService();
  const result = service.evaluateProductRecordAuthority({
    ...validProductRecordInput(),
    media_ids: ['media_cover', 'media_cover'],
  });

  assert.equal(result.accepted, false);
  assert.ok(result.violations.includes('media_ids must be unique'));
}

function run() {
  testAcceptsTenantScopedProductRecordAuthority();
  testRejectsMissingTenantIsolation();
  testArchiveOverDeleteIsEnforced();
  testRejectsArchiveWithoutReason();
  testRejectsDuplicateRelatedRecords();
  console.log('P6B-FFET-001 product record authority service test passed.');
}

run();
