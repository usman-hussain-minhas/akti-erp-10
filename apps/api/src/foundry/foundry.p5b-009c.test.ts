import assert from 'node:assert/strict';

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

function expectInvalid(manifest: FoundryModuleManifestCandidate, expected: RegExp[]) {
  const service = new FoundryService();
  const result = service.validateManifest(manifest);
  const text = result.errors.join('\n');

  assert.equal(result.valid, false);
  assert.equal(result.manifest_hash, null);

  for (const pattern of expected) {
    assert.match(text, pattern);
  }
}

function testDuplicateManifestCollectionsFail() {
  expectInvalid(
    validManifest({
      capabilities: [
        {
          key: 'platform.fixture.manage',
          module_key: 'platform.fixture',
          risk_level: 'high',
          requires_reauth: false,
          requires_audit: true,
          gatekeeper_required: true,
        },
        {
          key: 'platform.fixture.manage',
          module_key: 'platform.fixture',
          risk_level: 'high',
          requires_reauth: false,
          requires_audit: true,
          gatekeeper_required: true,
        },
      ],
      api_routes: [
        {
          method: 'POST',
          path: '/platform/fixture/actions',
          capability_key: 'platform.fixture.manage',
        },
        {
          method: 'POST',
          path: '/platform/fixture/actions',
          capability_key: 'platform.fixture.manage',
        },
      ],
      schemas: [{ key: 'platform.fixture.schema' }, { key: 'platform.fixture.schema' }],
      migrations: [{ key: 'platform.fixture.migration' }, { key: 'platform.fixture.migration' }],
    }),
    [/capability key must be unique/, /API route method \+ path must be unique/, /schema key must be unique/, /migration key must be unique/],
  );
}

function testCriticalCapabilityMustRemainGatekeeperAuditedAndReauthProtected() {
  expectInvalid(
    validManifest({
      capabilities: [
        {
          key: 'platform.fixture.critical',
          module_key: 'platform.fixture',
          risk_level: 'critical',
          requires_reauth: false,
          requires_audit: false,
          gatekeeper_required: false,
        },
      ],
      api_routes: [
        {
          method: 'POST',
          path: '/platform/fixture/critical',
          capability_key: 'platform.fixture.critical',
        },
      ],
      gatekeeper_hooks: [],
    }),
    [/requires audit/, /requires Gatekeeper/, /requires reauth/],
  );
}

function testInvalidPermissionsAndRoutesFail() {
  expectInvalid(
    validManifest({
      permissions: [
        {
          key: 'platform.fixture.manage',
          module_key: 'platform.other',
          allowed_scope_types: ['unsupported_scope'],
        },
      ],
      api_routes: [
        {
          method: 'POST',
          path: 'platform/fixture/actions',
          capability_key: 'platform.fixture.manage',
        },
      ],
    }),
    [
      /permission platform\.fixture\.manage module_key must match/,
      /invalid scope type unsupported_scope/,
      /must use an absolute path/,
    ],
  );
}

function testInvalidDependenciesFail() {
  expectInvalid(
    validManifest({
      dependencies: [{ module_key: 'platform.fixture', min_version: 'latest' }],
      optional_dependencies: [{ module_key: 'invalid' }],
    }),
    [/dependencies must not include manifest module_key/, /min_version must be semver/, /dependency invalid must use module key syntax/],
  );
}

function run() {
  testDuplicateManifestCollectionsFail();
  testCriticalCapabilityMustRemainGatekeeperAuditedAndReauthProtected();
  testInvalidPermissionsAndRoutesFail();
  testInvalidDependenciesFail();

  console.log('P5B-009c Foundry manifest negative tests passed.');
}

run();
