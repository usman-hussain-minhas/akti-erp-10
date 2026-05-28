import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { BadRequestException } from '@nestjs/common';

import {
  FoundryService,
  type FoundryModuleManifestCandidate,
} from './foundry.service';

const platformVersion = JSON.parse(readFileSync('../../platform.version.json', 'utf8')) as {
  platform_core_version: string;
};

function validManifest(overrides?: Partial<FoundryModuleManifestCandidate>): FoundryModuleManifestCandidate {
  return {
    module_key: 'platform.fixture',
    display_name: 'Platform Fixture',
    module_type: 'standard',
    version: '0.1.0',
    owner: 'platform',
    min_platform_version: '1.0.0',
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

function testCompatibilityPassesForPlatformVersionAndInstalledDependencies() {
  const service = new FoundryService();

  const result = service.checkCompatibility({
    manifest: validManifest(),
    platform_core_version: platformVersion.platform_core_version,
    installed_modules: [
      {
        module_key: 'core.access',
        version: '0.1.0',
        status: 'enabled',
      },
    ],
  });

  assert.equal(result.compatible, true);
  assert.equal(result.module_key, 'platform.fixture');
  assert.equal(result.platform_core_version, '1.0.0');
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.dependency_results, [
    {
      module_key: 'core.access',
      required_min_version: '0.1.0',
      installed_version: '0.1.0',
      installed_status: 'enabled',
      compatible: true,
      reason: null,
    },
  ]);
}

function testCompatibilityFailsClosedForPlatformVersionGap() {
  const service = new FoundryService();

  const result = service.checkCompatibility({
    manifest: validManifest({ min_platform_version: '9.0.0' }),
    platform_core_version: platformVersion.platform_core_version,
    installed_modules: [
      {
        module_key: 'core.access',
        version: '0.1.0',
        status: 'enabled',
      },
    ],
  });

  assert.equal(result.compatible, false);
  assert.match(result.errors.join('\n'), /requires platform 9\.0\.0/);
}

function testCompatibilityFailsClosedForMissingOrInactiveDependency() {
  const service = new FoundryService();

  const missing = service.checkCompatibility({
    manifest: validManifest(),
    platform_core_version: platformVersion.platform_core_version,
    installed_modules: [],
  });
  const inactive = service.checkCompatibility({
    manifest: validManifest(),
    platform_core_version: platformVersion.platform_core_version,
    installed_modules: [
      {
        module_key: 'core.access',
        version: '0.1.0',
        status: 'disabled',
      },
    ],
  });

  assert.equal(missing.compatible, false);
  assert.match(missing.errors.join('\n'), /required dependency is not installed/);
  assert.equal(inactive.compatible, false);
  assert.match(inactive.errors.join('\n'), /not in an installable runtime state/);
}

function testCompatibilityFailsClosedForDependencyVersionGap() {
  const service = new FoundryService();

  const result = service.checkCompatibility({
    manifest: validManifest({ dependencies: [{ module_key: 'core.access', min_version: '1.1.0' }] }),
    platform_core_version: platformVersion.platform_core_version,
    installed_modules: [
      {
        module_key: 'core.access',
        version: '1.0.0',
        status: 'installed',
      },
    ],
  });

  assert.equal(result.compatible, false);
  assert.match(result.errors.join('\n'), /below required minimum/);
}

function testAssertCompatibilityThrowsStructuredError() {
  const service = new FoundryService();

  assert.throws(
    () =>
      service.assertCompatibility({
        manifest: validManifest({ min_platform_version: '9.0.0' }),
        platform_core_version: platformVersion.platform_core_version,
        installed_modules: [],
      }),
    BadRequestException,
  );
}

function run() {
  testCompatibilityPassesForPlatformVersionAndInstalledDependencies();
  testCompatibilityFailsClosedForPlatformVersionGap();
  testCompatibilityFailsClosedForMissingOrInactiveDependency();
  testCompatibilityFailsClosedForDependencyVersionGap();
  testAssertCompatibilityThrowsStructuredError();

  console.log('P5B-010d Foundry module compatibility checks passed.');
}

run();
