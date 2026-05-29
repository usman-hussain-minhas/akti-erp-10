import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { FileService, type FileStorageIntentInput } from './file-service.service';

function validIntentInput(overrides?: Partial<FileStorageIntentInput>): FileStorageIntentInput {
  return {
    organization_id: 'org-020b',
    actor_user_id: 'actor-020b',
    file_key: 'file-020b-proof.pdf',
    owner_module: 'core.workflow',
    display_name: 'Workflow proof document',
    mime_type: 'application/pdf',
    byte_size: 1024,
    classification: 'restricted',
    retention_policy: 'per_file_document_policy',
    capability_key: 'platform.file.write',
    storage_provider: 's3-compatible',
    checksum_sha256: 'b'.repeat(64),
    ...overrides,
  };
}

function testStorageAdapterBoundaryIsMetadataIntentOnly() {
  const boundary = new FileService().fileStorageAdapterBoundary();

  assert.equal(boundary.boundary, 'metadata_intent_only');
  assert.equal(boundary.default_storage_provider, 's3-compatible');
  assert.equal(boundary.credentials_exposed, false);
  assert.equal(boundary.real_provider_calls, false);
  assert.equal(boundary.signed_urls_created, false);
  assert.deepEqual(boundary.operations, ['upload_intent', 'download_intent']);
}

function testUploadIntentBuildsTenantScopedStorageKeyWithoutCredentials() {
  const service = new FileService();
  const intent = service.createUploadIntent(validIntentInput());

  assert.equal(intent.operation, 'upload_intent');
  assert.equal(intent.organization_id, 'org-020b');
  assert.equal(intent.actor_user_id, 'actor-020b');
  assert.equal(intent.file_key, 'file-020b-proof.pdf');
  assert.equal(intent.storage_key, 'org-020b/core-workflow/file-020b-proof.pdf');
  assert.equal(intent.storage_provider, 's3-compatible');
  assert.equal(intent.capability_key, 'platform.file.write');
  assert.equal(intent.gatekeeper.risk_check_required, true);
  assert.equal(intent.gatekeeper.capability_key, 'platform.file.write');
  assert.equal(intent.gatekeeper.exposure_surface, 'file_document_storage');
  assert.equal(intent.audit.event_type, 'file.document.intent.recorded');
  assert.equal(intent.audit.audit_required, true);
  assert.equal(intent.credentials_exposed, false);
  assert.equal(intent.signed_url_created, false);
}

function testDownloadIntentPreservesBoundaryAndDoesNotCreateSignedUrl() {
  const service = new FileService();
  const intent = service.createDownloadIntent({
    organization_id: 'org-020b',
    actor_user_id: 'actor-020b',
    file_key: 'file-020b-proof.pdf',
    owner_module: 'core.workflow',
    capability_key: 'platform.file.read',
  });

  assert.equal(intent.operation, 'download_intent');
  assert.equal(intent.storage_key, 'org-020b/core-workflow/file-020b-proof.pdf');
  assert.equal(intent.storage_provider, 's3-compatible');
  assert.equal(intent.capability_key, 'platform.file.read');
  assert.equal(intent.credentials_exposed, false);
  assert.equal(intent.signed_url_created, false);
}

function testStorageBoundaryRejectsUnsafeProviderOrKeyInputs() {
  const service = new FileService();

  assert.throws(() => service.createUploadIntent(validIntentInput({ storage_provider: 's3-secret-provider' })), BadRequestException);
  assert.throws(() => service.createUploadIntent(validIntentInput({ organization_id: '../org' })), BadRequestException);
  assert.throws(() => service.createUploadIntent(validIntentInput({ owner_module: 'core.workflow/unsafe' })), BadRequestException);
  assert.throws(() => service.createUploadIntent(validIntentInput({ file_key: 'file/unsafe.pdf' })), BadRequestException);
  assert.throws(() => service.createUploadIntent(validIntentInput({ capability_key: '' })), BadRequestException);
  assert.throws(() => service.createUploadIntent(validIntentInput({ byte_size: -1 })), BadRequestException);
}

function run() {
  testStorageAdapterBoundaryIsMetadataIntentOnly();
  testUploadIntentBuildsTenantScopedStorageKeyWithoutCredentials();
  testDownloadIntentPreservesBoundaryAndDoesNotCreateSignedUrl();
  testStorageBoundaryRejectsUnsafeProviderOrKeyInputs();

  console.log('P5B-020b File/document storage adapter boundary tests passed.');
}

run();
