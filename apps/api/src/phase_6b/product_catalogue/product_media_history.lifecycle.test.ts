import assert from 'node:assert/strict';

import { Phase6BProductMediaHistoryLifecycle } from './product_media_history.lifecycle';

function validMediaHistoryInput() {
  return {
    organization_id: 'org_akti_demo',
    product_id: 'prod_admission_package',
    media_id: 'media_cover_2026',
    history_id: 'hist_media_cover_2026',
    storage_object_id: 'svfs_product_cover_2026',
    actor_user_id: 'user_catalogue_manager',
    action: 'media_attached' as const,
    requested_event: 'product.updated' as const,
    sequence_number: 1,
  };
}

function testAcceptsProductMediaHistoryEvidence() {
  const lifecycle = new Phase6BProductMediaHistoryLifecycle();
  const result = lifecycle.evaluateProductMediaHistory(validMediaHistoryInput());

  assert.equal(result.accepted, true);
  assert.deepEqual(result.violations, []);
  assert.equal(result.emitted_event, 'product.updated');
  assert.equal(result.evidence.organization_id, 'org_akti_demo');
  assert.equal(result.evidence.product_id, 'prod_admission_package');
  assert.equal(result.evidence.storage_object_id, 'svfs_product_cover_2026');
  assert.deepEqual(result.evidence.schema_models, ['Phase6BProductMedia', 'Phase6BProductHistory']);
  assert.equal(result.evidence.svfs_object_store_required, true);
  assert.equal(result.evidence.internal_lifecycle_primitive, true);
  assert.equal(result.evidence.foundry_activation_required, false);
}

function testRejectsMissingSvfsObjectReference() {
  const lifecycle = new Phase6BProductMediaHistoryLifecycle();
  const result = lifecycle.evaluateProductMediaHistory({
    ...validMediaHistoryInput(),
    storage_object_id: '',
  });

  assert.equal(result.accepted, false);
  assert.ok(result.violations.includes('storage_object_id is required from SVFS object store'));
}

function testReplacementRequiresPreviousAndReplacementIds() {
  const lifecycle = new Phase6BProductMediaHistoryLifecycle();
  const result = lifecycle.evaluateProductMediaHistory({
    ...validMediaHistoryInput(),
    action: 'media_replaced',
    previous_media_id: 'media_cover_2025',
    replacement_media_id: 'media_cover_2026',
  });

  assert.equal(result.accepted, true);
  assert.equal(result.emitted_event, 'product.updated');
}

function testRejectsInvalidReplacementPair() {
  const lifecycle = new Phase6BProductMediaHistoryLifecycle();
  const result = lifecycle.evaluateProductMediaHistory({
    ...validMediaHistoryInput(),
    action: 'media_replaced',
    previous_media_id: 'media_cover_2026',
    replacement_media_id: 'media_cover_2026',
  });

  assert.equal(result.accepted, false);
  assert.ok(result.violations.includes('replacement_media_id must differ from previous_media_id'));
}

function testArchiveOverDeleteIsEnforcedForMediaHistory() {
  const lifecycle = new Phase6BProductMediaHistoryLifecycle();
  const result = lifecycle.evaluateProductMediaHistory({
    ...validMediaHistoryInput(),
    action: 'media_archived',
    requested_event: 'product.archived',
    archive_reason: 'outdated catalogue image',
  });

  assert.equal(result.accepted, true);
  assert.equal(result.emitted_event, 'product.archived');
  assert.equal(result.evidence.archive_over_delete_enforced, true);
}

function testRejectsArchiveWithoutReason() {
  const lifecycle = new Phase6BProductMediaHistoryLifecycle();
  const result = lifecycle.evaluateProductMediaHistory({
    ...validMediaHistoryInput(),
    action: 'media_archived',
    requested_event: 'product.archived',
  });

  assert.equal(result.accepted, false);
  assert.ok(result.violations.includes('media_archived requires archive_reason to enforce archive over delete'));
}

function run() {
  testAcceptsProductMediaHistoryEvidence();
  testRejectsMissingSvfsObjectReference();
  testReplacementRequiresPreviousAndReplacementIds();
  testRejectsInvalidReplacementPair();
  testArchiveOverDeleteIsEnforcedForMediaHistory();
  testRejectsArchiveWithoutReason();
  console.log('P6B-FFET-003 product media history lifecycle test passed.');
}

run();
