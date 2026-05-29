import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import {
  FoundryService,
  type FoundryModuleManifestCandidate,
} from './foundry.service';

function validManifest(overrides?: Partial<FoundryModuleManifestCandidate>): FoundryModuleManifestCandidate {
  return {
    module_key: 'platform.fixture',
    display_name: 'Platform Fixture',
    module_type: 'standard',
    version: '0.1.0',
    owner: 'platform',
    min_platform_version: '0.1.0',
    dependencies: [{ module_key: 'core.access', min_version: '0.1.0' }],
    optional_dependencies: [],
    capabilities: [
      {
        key: 'platform.fixture.manage',
        module_key: 'platform.fixture',
        risk_level: 'high',
        requires_reauth: false,
        requires_audit: true,
        gatekeeper_required: true,
      },
    ],
    permissions: [
      {
        key: 'platform.fixture.manage',
        module_key: 'platform.fixture',
        allowed_scope_types: ['organization'],
      },
    ],
    api_routes: [
      {
        method: 'POST',
        path: '/platform/fixture/actions',
        capability_key: 'platform.fixture.manage',
      },
    ],
    gatekeeper_hooks: [
      {
        key: 'platform.fixture.manage.preflight',
        capability_key: 'platform.fixture.manage',
        required: true,
      },
    ],
    schemas: [{ key: 'platform.fixture.schema' }],
    migrations: [{ key: 'platform.fixture.migration' }],
    data_ownership: {
      owner_module_key: 'platform.fixture',
      tenant_scoped: true,
      entity_refs: ['platform.fixture.record'],
    },
    ...overrides,
  };
}

function testValidManifestPassesWithDeterministicHash() {
  const service = new FoundryService();

  const result = service.validateManifest(validManifest());
  const repeated = service.validateManifest(validManifest());

  assert.equal(result.valid, true);
  assert.equal(result.module_key, 'platform.fixture');
  assert.equal(result.version, '0.1.0');
  assert.deepEqual(result.errors, []);
  assert.equal(result.manifest_hash, repeated.manifest_hash);
  assert.match(result.manifest_hash ?? '', /^[a-f0-9]{64}$/);
}

function testHighRiskCapabilityRequiresAuditGatekeeperAndHook() {
  const service = new FoundryService();

  const result = service.validateManifest(
    validManifest({
      capabilities: [
        {
          key: 'platform.fixture.manage',
          module_key: 'platform.fixture',
          risk_level: 'high',
          requires_reauth: false,
          requires_audit: false,
          gatekeeper_required: false,
        },
      ],
      gatekeeper_hooks: [],
    }),
  );

  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /requires audit/);
  assert.match(result.errors.join('\n'), /requires Gatekeeper/);
}

function testApiRoutesAndHooksMustReferenceLocalCapabilities() {
  const service = new FoundryService();

  const result = service.validateManifest(
    validManifest({
      api_routes: [
        {
          method: 'POST',
          path: '/platform/fixture/actions',
          capability_key: 'platform.other.manage',
        },
      ],
      gatekeeper_hooks: [
        {
          key: 'platform.fixture.other.preflight',
          capability_key: 'platform.other.manage',
          required: true,
        },
      ],
    }),
  );

  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /API route POST \/platform\/fixture\/actions capability_key/);
  assert.match(result.errors.join('\n'), /Gatekeeper hook platform\.fixture\.other\.preflight capability_key/);
}

function testSelfDependencyAndDataOwnershipMismatchFail() {
  const service = new FoundryService();

  const result = service.validateManifest(
    validManifest({
      dependencies: [{ module_key: 'platform.fixture' }],
      data_ownership: {
        owner_module_key: 'platform.other',
        tenant_scoped: true,
        entity_refs: ['platform.fixture.record'],
      },
    }),
  );

  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /owner_module_key must match/);
  assert.match(result.errors.join('\n'), /dependencies must not include manifest module_key/);
}

function testAssertManifestValidThrowsWithStructuredErrors() {
  const service = new FoundryService();

  assert.throws(
    () => service.assertManifestValid(validManifest({ version: 'latest' })),
    BadRequestException,
  );
}

function run() {
  testValidManifestPassesWithDeterministicHash();
  testHighRiskCapabilityRequiresAuditGatekeeperAndHook();
  testApiRoutesAndHooksMustReferenceLocalCapabilities();
  testSelfDependencyAndDataOwnershipMismatchFail();
  testAssertManifestValidThrowsWithStructuredErrors();

  console.log('P5B-009b Foundry manifest validation service tests passed.');
}

run();
