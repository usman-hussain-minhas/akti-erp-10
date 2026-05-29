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
  const result = new FoundryService().validateManifest(manifest);
  const errors = result.errors.join('\n');

  assert.equal(result.valid, false);
  assert.equal(result.manifest_hash, null);
  for (const pattern of expected) {
    assert.match(errors, pattern);
  }
}

function testDuplicateCapabilityKeyCollisionsFail() {
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
          risk_level: 'medium',
          requires_reauth: false,
          requires_audit: false,
          gatekeeper_required: false,
        },
      ],
    }),
    [/capability key must be unique: platform\.fixture\.manage/],
  );
}

function testForeignCapabilityNamespaceCollisionFails() {
  expectInvalid(
    validManifest({
      capabilities: [
        {
          key: 'core.access.manage',
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
          capability_key: 'core.access.manage',
        },
      ],
      gatekeeper_hooks: [
        {
          key: 'platform.fixture.manage.preflight',
          capability_key: 'core.access.manage',
          required: true,
        },
      ],
    }),
    [/core\.access\.manage must be namespaced by manifest module_key platform\.fixture/],
  );
}

function testReservedShellCapabilityCollisionFailsForNonCoreModule() {
  expectInvalid(
    validManifest({
      capabilities: [
        {
          key: 'platform.shell.access',
          module_key: 'platform.fixture',
          risk_level: 'low',
          requires_reauth: false,
          requires_audit: false,
          gatekeeper_required: false,
        },
      ],
      api_routes: [
        {
          method: 'GET',
          path: '/platform/fixture/access',
          capability_key: 'platform.shell.access',
        },
      ],
      gatekeeper_hooks: [],
    }),
    [/platform\.shell\.access must be namespaced by manifest module_key platform\.fixture/],
  );
}

function testDistinctModuleNamespacedCapabilitiesRemainValid() {
  const result = new FoundryService().validateManifest(
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
          key: 'platform.fixture.read',
          module_key: 'platform.fixture',
          risk_level: 'low',
          requires_reauth: false,
          requires_audit: false,
          gatekeeper_required: false,
        },
      ],
    }),
  );

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
}

function run() {
  testDuplicateCapabilityKeyCollisionsFail();
  testForeignCapabilityNamespaceCollisionFails();
  testReservedShellCapabilityCollisionFailsForNonCoreModule();
  testDistinctModuleNamespacedCapabilitiesRemainValid();

  console.log('P5B-028b capability collision tests passed.');
}

run();
