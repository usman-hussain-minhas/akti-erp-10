import assert from 'node:assert/strict';

import { ConflictException } from '@nestjs/common';

import { ModuleRegistryService, type RuntimeModuleManifest } from './module-registry.service';

function manifest(overrides?: Partial<RuntimeModuleManifest>): RuntimeModuleManifest {
  return {
    module_key: 'platform.fixture',
    display_name: 'Platform Fixture',
    version: '0.1.0',
    capabilities: [
      {
        key: 'platform.fixture.manage',
        module_key: 'platform.fixture',
        description: 'Manage the platform fixture lifecycle boundary.',
        risk_level: 'high',
        gatekeeper_required: true,
        approval_chain_required: false,
      },
    ],
    capabilities_consumed: [
      {
        capability_key: 'platform.shell.access',
        provider_module_key: 'core.access',
        required: true,
        min_version: '0.1.0',
      },
    ],
    permissions: [
      {
        key: 'platform.fixture.manage',
        allowed_scope_types: ['organization'],
      },
    ],
    menu_entries: [
      {
        key: 'platform.fixture.settings',
        label: 'Fixture settings',
        path: '/platform/fixture/settings',
        capability_key: 'platform.fixture.manage',
        order: 20,
      },
      {
        key: 'platform.fixture.shell',
        label: 'Fixture shell',
        path: '/platform/fixture',
        capability_key: 'platform.shell.access',
        order: 10,
      },
    ],
    gatekeeper_hooks: [
      {
        key: 'platform.fixture.manage.preflight',
        capability_key: 'platform.fixture.manage',
        required: true,
      },
    ],
    ...overrides,
  };
}

function testRegistersCapabilityAwareMenuEntries() {
  const service = new ModuleRegistryService({} as never);

  const result = service.registerMenuContributions(manifest());

  assert.equal(result.module_key, 'platform.fixture');
  assert.equal(result.registered_count, 2);
  assert.deepEqual(
    result.menu_entries.map((entry) => entry.key),
    ['platform.fixture.shell', 'platform.fixture.settings'],
  );
  assert.deepEqual(result.menu_entries[0], {
    key: 'platform.fixture.shell',
    label: 'Fixture shell',
    path: '/platform/fixture',
    module_key: 'platform.fixture',
    capability_key: 'platform.shell.access',
    order: 10,
  });
  assert.deepEqual(result.menu_entries[1], {
    key: 'platform.fixture.settings',
    label: 'Fixture settings',
    path: '/platform/fixture/settings',
    module_key: 'platform.fixture',
    capability_key: 'platform.fixture.manage',
    order: 20,
  });
}

function testMenuRegistrationRejectsUnknownDuplicateAndUnsafeEntries() {
  const service = new ModuleRegistryService({} as never);

  assert.throws(
    () =>
      service.registerMenuContributions(
        manifest({
          menu_entries: [
            {
              key: 'platform.fixture.unknown',
              label: 'Unknown',
              path: '/platform/fixture/unknown',
              capability_key: 'platform.fixture.unknown',
              order: 1,
            },
          ],
        }),
      ),
    ConflictException,
  );

  assert.throws(
    () =>
      service.registerMenuContributions(
        manifest({
          menu_entries: [
            {
              key: 'platform.fixture.duplicate',
              label: 'Duplicate A',
              path: '/platform/fixture/a',
              capability_key: 'platform.fixture.manage',
              order: 1,
            },
            {
              key: 'platform.fixture.duplicate',
              label: 'Duplicate B',
              path: '/platform/fixture/b',
              capability_key: 'platform.fixture.manage',
              order: 2,
            },
          ],
        }),
      ),
    ConflictException,
  );

  assert.throws(
    () =>
      service.registerMenuContributions(
        manifest({
          menu_entries: [
            {
              key: 'platform.fixture.business',
              label: 'Business navigation',
              path: '/lead-desk',
              capability_key: 'platform.fixture.manage',
              order: 1,
            },
          ],
        }),
      ),
    ConflictException,
  );
}

function testMenuRegistrationRejectsMalformedPathsAndOrders() {
  const service = new ModuleRegistryService({} as never);

  assert.throws(
    () =>
      service.registerMenuContributions(
        manifest({
          menu_entries: [
            {
              key: 'platform.fixture.bad-path',
              label: 'Bad path',
              path: 'relative/path',
              capability_key: 'platform.fixture.manage',
              order: 1,
            },
          ],
        }),
      ),
    ConflictException,
  );

  assert.throws(
    () =>
      service.registerMenuContributions(
        manifest({
          menu_entries: [
            {
              key: 'platform.fixture.bad-order',
              label: 'Bad order',
              path: '/platform/fixture/bad-order',
              capability_key: 'platform.fixture.manage',
              order: -1,
            },
          ],
        }),
      ),
    ConflictException,
  );
}

function run() {
  testRegistersCapabilityAwareMenuEntries();
  testMenuRegistrationRejectsUnknownDuplicateAndUnsafeEntries();
  testMenuRegistrationRejectsMalformedPathsAndOrders();

  console.log('P5B-015b menu registration tests passed.');
}

run();
