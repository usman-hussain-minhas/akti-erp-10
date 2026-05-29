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

function testNonCoreCapabilityMustUseManifestNamespace() {
  const result = new FoundryService().validateManifest(
    validManifest({
      capabilities: [
        {
          key: 'platform.other.manage',
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
          capability_key: 'platform.other.manage',
        },
      ],
      gatekeeper_hooks: [
        {
          key: 'platform.fixture.manage.preflight',
          capability_key: 'platform.other.manage',
          required: true,
        },
      ],
    }),
  );

  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /platform\.other\.manage must be namespaced by manifest module_key platform\.fixture/);
}

function testNonCoreModuleCannotClaimReservedPlatformShellCapability() {
  const result = new FoundryService().validateManifest(
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
          path: '/platform/fixture/shell',
          capability_key: 'platform.shell.access',
        },
      ],
      gatekeeper_hooks: [],
    }),
  );

  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /platform\.shell\.access must be namespaced by manifest module_key platform\.fixture/);
}

function testModuleNamespacedCapabilitiesRemainValid() {
  const result = new FoundryService().validateManifest(validManifest());

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
}

function testCoreManifestCanKeepCommittedCoreCapabilityExceptions() {
  const result = new FoundryService().validateManifest(
    validManifest({
      module_key: 'core.access',
      display_name: 'Access Core',
      module_type: 'core',
      dependencies: [],
      optional_dependencies: [],
      capabilities: [
        {
          key: 'platform.shell.access',
          module_key: 'core.access',
          risk_level: 'low',
          requires_reauth: false,
          requires_audit: false,
          gatekeeper_required: false,
        },
        {
          key: 'access.policy.manage',
          module_key: 'core.access',
          risk_level: 'high',
          requires_reauth: false,
          requires_audit: true,
          gatekeeper_required: true,
        },
      ],
      permissions: [
        {
          key: 'access.policy.manage',
          module_key: 'core.access',
          allowed_scope_types: ['organization'],
        },
      ],
      api_routes: [
        {
          method: 'GET',
          path: '/platform/access/me',
          capability_key: 'platform.shell.access',
        },
      ],
      gatekeeper_hooks: [
        {
          key: 'access.policy.manage.preflight',
          capability_key: 'access.policy.manage',
          required: true,
        },
      ],
      data_ownership: {
        owner_module_key: 'core.access',
        tenant_scoped: true,
        entity_refs: ['access.user'],
      },
    }),
  );

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
}

function run() {
  testNonCoreCapabilityMustUseManifestNamespace();
  testNonCoreModuleCannotClaimReservedPlatformShellCapability();
  testModuleNamespacedCapabilitiesRemainValid();
  testCoreManifestCanKeepCommittedCoreCapabilityExceptions();

  console.log('P5B-028a capability namespace enforcement tests passed.');
}

run();
