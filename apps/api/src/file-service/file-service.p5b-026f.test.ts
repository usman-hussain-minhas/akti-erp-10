import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { FileService, type FileDocumentAccessRecord } from './file-service.service';

function record(overrides?: Partial<FileDocumentAccessRecord>): FileDocumentAccessRecord {
  return {
    organization_id: 'org-026f',
    file_key: 'file-026f-visible.pdf',
    owner_module: 'core.workflow',
    storage_key: 'org-026f/core-workflow/file-026f-visible.pdf',
    classification: 'restricted',
    access_policy: {
      capability_key: 'platform.file.read',
      tenant_scoped: true,
    },
    ...overrides,
  };
}

function testFileFixtureExcludesCrossTenantAndUnauthorizedDocuments() {
  const service = new FileService();
  const result = service.runTenantIsolationFixture({
    context: {
      organization_id: 'org-026f',
      actor_user_id: 'actor-026f',
      capability_key: 'platform.file.read',
    },
    records: [
      record(),
      record({
        organization_id: 'org-foreign',
        file_key: 'file-026f-cross-tenant.pdf',
        storage_key: 'org-foreign/core-workflow/file-026f-cross-tenant.pdf',
      }),
      record({
        file_key: 'file-026f-unauthorized.pdf',
        storage_key: 'org-026f/core-workflow/file-026f-unauthorized.pdf',
        access_policy: {
          capability_key: 'platform.file.write',
          tenant_scoped: true,
        },
      }),
    ],
  });

  assert.deepEqual(result.visible_file_keys, ['file-026f-visible.pdf']);
  assert.deepEqual(result.excluded_cross_tenant_file_keys, ['file-026f-cross-tenant.pdf']);
  assert.deepEqual(result.excluded_unauthorized_file_keys, ['file-026f-unauthorized.pdf']);
  assert.equal(result.tenant_isolation_enforced, true);
  assert.equal(result.capability_filter_enforced, true);
  assert.equal(result.records_examined, 3);
}

function testFileFixtureRejectsUnsafeProofInputs() {
  const service = new FileService();

  assert.throws(
    () =>
      service.runTenantIsolationFixture({
        context: {
          organization_id: '',
          actor_user_id: 'actor-026f',
          capability_key: 'platform.file.read',
        },
        records: [record()],
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.runTenantIsolationFixture({
        context: {
          organization_id: 'org-026f',
          actor_user_id: 'actor-026f',
          capability_key: 'platform.file.read',
        },
        records: [],
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.runTenantIsolationFixture({
        context: {
          organization_id: 'org-026f',
          actor_user_id: 'actor-026f',
          capability_key: 'platform.file.read',
        },
        records: [record({ file_key: ' ' })],
      }),
    BadRequestException,
  );
}

function run() {
  testFileFixtureExcludesCrossTenantAndUnauthorizedDocuments();
  testFileFixtureRejectsUnsafeProofInputs();

  console.log('P5B-026f file/document cross-tenant negative tests passed.');
}

run();
