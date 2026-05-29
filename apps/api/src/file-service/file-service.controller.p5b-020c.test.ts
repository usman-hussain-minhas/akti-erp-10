import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { BadRequestException, ForbiddenException, RequestMethod, UnauthorizedException } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';

import { FileServiceController } from './file-service.controller';
import { FileService } from './file-service.service';
import { type HeaderRecord, createPhase3SessionToken } from '../security/request-context';

const AUTH_SECRET = 'phase5b-file-service-api-secret';
process.env.AKTI_AUTH_SESSION_SECRET = AUTH_SECRET;

function trustedHeaders(organizationId = 'org-020c', actorUserId = 'actor-020c'): HeaderRecord {
  return {
    authorization: `Bearer ${createPhase3SessionToken(
      {
        organization_id: organizationId,
        actor_user_id: actorUserId,
        issued_at: new Date(Date.now() - 60_000).toISOString(),
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
      AUTH_SECRET,
    )}`,
  };
}

function uploadBody(overrides?: Record<string, unknown>) {
  return {
    organization_id: 'org-020c',
    actor_user_id: 'actor-020c',
    file_key: 'file-020c-proof.pdf',
    owner_module: 'core.workflow',
    display_name: 'Workflow proof document',
    mime_type: 'application/pdf',
    byte_size: 2048,
    classification: 'restricted',
    retention_policy: 'per_file_document_policy',
    capability_key: 'platform.file.write',
    storage_provider: 's3-compatible',
    checksum_sha256: 'c'.repeat(64),
    ...overrides,
  };
}

function downloadBody(overrides?: Record<string, unknown>) {
  return {
    organization_id: 'org-020c',
    actor_user_id: 'actor-020c',
    owner_module: 'core.workflow',
    capability_key: 'platform.file.read',
    storage_provider: 's3-compatible',
    ...overrides,
  };
}

function testFileServiceRouteMetadataIsExplicit() {
  const uploadDescriptor = Object.getOwnPropertyDescriptor(FileServiceController.prototype, 'createUploadIntent');
  const downloadDescriptor = Object.getOwnPropertyDescriptor(FileServiceController.prototype, 'createDownloadIntent');

  assert.ok(uploadDescriptor?.value);
  assert.ok(downloadDescriptor?.value);
  assert.equal(Reflect.getMetadata(PATH_METADATA, FileServiceController), 'platform/files');
  assert.equal(Reflect.getMetadata(PATH_METADATA, uploadDescriptor.value), 'upload-intent');
  assert.equal(Reflect.getMetadata(METHOD_METADATA, uploadDescriptor.value), RequestMethod.POST);
  assert.equal(Reflect.getMetadata(PATH_METADATA, downloadDescriptor.value), ':fileKey/download-intent');
  assert.equal(Reflect.getMetadata(METHOD_METADATA, downloadDescriptor.value), RequestMethod.POST);
}

function testUploadIntentApiUsesTrustedContextCapabilityGatekeeperAndAuditShape() {
  const controller = new FileServiceController(new FileService());

  const response = controller.createUploadIntent(uploadBody(), trustedHeaders());

  assert.equal(response.method, 'POST');
  assert.equal(response.route, '/platform/files/upload-intent');
  assert.equal(response.request_shape, 'FileUploadIntentRequest');
  assert.equal(response.response_shape, 'FileStorageIntentResponse');
  assert.equal(response.capability.required, 'platform.file.write');
  assert.deepEqual(response.tenant_context, {
    organization_id: 'org-020c',
    actor_user_id: 'actor-020c',
  });
  assert.equal(response.gatekeeper.risk_check_required, true);
  assert.equal(response.gatekeeper.capability_key, 'platform.file.write');
  assert.equal(response.audit.event_type, 'file.document.intent.recorded');
  assert.equal(response.storage_intent.operation, 'upload_intent');
  assert.equal(response.storage_intent.storage_key, 'org-020c/core-workflow/file-020c-proof.pdf');
  assert.equal(response.storage_intent.credentials_exposed, false);
  assert.equal(response.storage_intent.signed_url_created, false);
}

function testDownloadIntentApiUsesTrustedContextAndReadCapability() {
  const controller = new FileServiceController(new FileService());

  const response = controller.createDownloadIntent('file-020c-proof.pdf', downloadBody(), trustedHeaders());

  assert.equal(response.method, 'POST');
  assert.equal(response.route, '/platform/files/:fileKey/download-intent');
  assert.equal(response.request_shape, 'FileDownloadIntentRequest');
  assert.equal(response.response_shape, 'FileStorageIntentResponse');
  assert.equal(response.capability.required, 'platform.file.read');
  assert.equal(response.gatekeeper.capability_key, 'platform.file.read');
  assert.equal(response.storage_intent.operation, 'download_intent');
  assert.equal(response.storage_intent.storage_key, 'org-020c/core-workflow/file-020c-proof.pdf');
  assert.equal(response.storage_intent.credentials_exposed, false);
  assert.equal(response.storage_intent.signed_url_created, false);
}

function testFileServiceApiRejectsInvalidAndMismatchedContext() {
  const controller = new FileServiceController(new FileService());

  assert.throws(() => controller.createUploadIntent(uploadBody({ organization_id: ' ' }), trustedHeaders()), BadRequestException);
  assert.throws(() => controller.createUploadIntent(uploadBody({ byte_size: '2048' }), trustedHeaders()), BadRequestException);
  assert.throws(
    () => controller.createUploadIntent(uploadBody({ storage_provider: 's3-secret-provider' }), trustedHeaders()),
    BadRequestException,
  );
  assert.throws(() => controller.createUploadIntent(uploadBody(), trustedHeaders('org-other')), ForbiddenException);
  assert.throws(
    () => controller.createUploadIntent(uploadBody({ actor_user_id: 'actor-other' }), trustedHeaders()),
    ForbiddenException,
  );
  assert.throws(() => controller.createUploadIntent(uploadBody(), {}), UnauthorizedException);
  assert.throws(() => controller.createDownloadIntent('', downloadBody(), trustedHeaders()), BadRequestException);
  assert.throws(() => controller.createDownloadIntent('file-020c-proof.pdf', downloadBody(), {}), UnauthorizedException);
}

function testAppModuleRegistersFileServiceApiSurface() {
  const appModuleSource = readFileSync('src/app.module.ts', 'utf8');

  assert.equal(appModuleSource.includes('FileServiceController'), true);
  assert.equal(appModuleSource.includes('FileService'), true);
}

function run() {
  testFileServiceRouteMetadataIsExplicit();
  testUploadIntentApiUsesTrustedContextCapabilityGatekeeperAndAuditShape();
  testDownloadIntentApiUsesTrustedContextAndReadCapability();
  testFileServiceApiRejectsInvalidAndMismatchedContext();
  testAppModuleRegistersFileServiceApiSurface();

  console.log('P5B-020c File/document access service/API tests passed.');
}

run();
