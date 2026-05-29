import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { FileService, type FileDocumentAccessContext, type FileDocumentAccessRecord } from './file-service.service';

function context(overrides?: Partial<FileDocumentAccessContext>): FileDocumentAccessContext {
  return {
    organization_id: 'org-020d',
    actor_user_id: 'actor-020d',
    capability_key: 'platform.file.read',
    ...overrides,
  };
}

function record(overrides?: Partial<FileDocumentAccessRecord>): FileDocumentAccessRecord {
  return {
    organization_id: 'org-020d',
    file_key: 'file-020d-proof.pdf',
    owner_module: 'core.workflow',
    storage_key: 'org-020d/core-workflow/file-020d-proof.pdf',
    classification: 'restricted',
    access_policy: {
      capability_key: 'platform.file.read',
      tenant_scoped: true,
    },
    ...overrides,
  };
}

function testSameTenantAuthorizedCapabilityAllowsMetadataAccess() {
  const decision = new FileService().authorizeMetadataAccess(context(), record());

  assert.equal(decision.allowed, true);
  assert.equal(decision.organization_id, 'org-020d');
  assert.equal(decision.actor_user_id, 'actor-020d');
  assert.equal(decision.file_key, 'file-020d-proof.pdf');
  assert.equal(decision.capability_key, 'platform.file.read');
  assert.equal(decision.tenant_isolation_enforced, true);
  assert.equal(decision.capability_filter_enforced, true);
}

function testCrossTenantFileMetadataAccessFailsClosed() {
  const service = new FileService();

  assert.throws(
    () => service.authorizeMetadataAccess(context(), record({ organization_id: 'org-other' })),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.authorizeMetadataAccess(
        context({ organization_id: 'org-other' }),
        record({ organization_id: 'org-020d' }),
      ),
    BadRequestException,
  );
}

function testCapabilityMismatchAndUnsafePolicyFailClosed() {
  const service = new FileService();

  assert.throws(
    () => service.authorizeMetadataAccess(context({ capability_key: 'platform.file.write' }), record()),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.authorizeMetadataAccess(
        context(),
        record({
          access_policy: {
            capability_key: 'platform.file.read',
            tenant_scoped: false as true,
          },
        }),
      ),
    BadRequestException,
  );
  assert.throws(() => service.authorizeMetadataAccess(context({ actor_user_id: ' ' }), record()), BadRequestException);
  assert.throws(() => service.authorizeMetadataAccess(context(), record({ storage_key: ' ' })), BadRequestException);
}

function run() {
  testSameTenantAuthorizedCapabilityAllowsMetadataAccess();
  testCrossTenantFileMetadataAccessFailsClosed();
  testCapabilityMismatchAndUnsafePolicyFailClosed();

  console.log('P5B-020d File/document tenant negative tests passed.');
}

run();
