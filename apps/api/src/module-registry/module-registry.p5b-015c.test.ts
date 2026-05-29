import assert from 'node:assert/strict';

import { ConflictException } from '@nestjs/common';

import {
  ModuleRegistryService,
  type RuntimeModuleManifest,
  type ScreenContributionContract,
} from './module-registry.service';

function manifest(overrides?: Partial<RuntimeModuleManifest>): RuntimeModuleManifest {
  return {
    module_key: 'platform.fixture',
    display_name: 'Platform Fixture',
    display_metadata: {
      display_name: 'Platform Fixture',
      display_description: 'Internal platform fixture for registry contract tests.',
      icon_key: 'test-tube',
      category: 'internal',
      visibility_state: 'hidden',
      route: null,
    },
    ai_data_classification: 'readable',
    version: '0.1.0',
    capabilities: [
      {
        key: 'platform.fixture.read',
        module_key: 'platform.fixture',
        description: 'Read the platform fixture state.',
        risk_level: 'low',
        gatekeeper_required: false,
        approval_chain_required: false,
      },
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
    required_capabilities: [],
    permissions: [
      {
        key: 'platform.fixture.read',
        allowed_scope_types: ['organization'],
      },
      {
        key: 'platform.fixture.manage',
        allowed_scope_types: ['organization'],
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
  } as RuntimeModuleManifest;
}

function screen(overrides?: Partial<ScreenContributionContract>): ScreenContributionContract {
  return {
    screen_key: 'platform.fixture.overview',
    module_key: 'platform.fixture',
    title: 'Fixture overview',
    route: '/platform/fixture',
    screen_type: 'private_portal',
    status: 'active',
    required_capabilities: ['platform.fixture.read'],
    optional_capabilities: ['platform.shell.access'],
    api_routes: [
      {
        key: 'platform.fixture.read.api',
        path: '/platform/fixture',
        capability_key: 'platform.fixture.read',
      },
    ],
    ...overrides,
  };
}

function testRegistersCapabilityAwareScreenContracts() {
  const service = new ModuleRegistryService({} as never);

  const result = service.registerScreenContributions({
    manifest: manifest(),
    screens: [
      screen({
        screen_key: 'platform.fixture.settings',
        title: 'Fixture settings',
        route: '/platform/fixture/settings',
        required_capabilities: ['platform.fixture.manage'],
        optional_capabilities: [],
        api_routes: [
          {
            key: 'platform.fixture.settings.api',
            path: '/platform/fixture/settings',
            capability_key: 'platform.fixture.manage',
          },
        ],
      }),
      screen(),
    ],
  });

  assert.equal(result.module_key, 'platform.fixture');
  assert.equal(result.registered_count, 2);
  assert.deepEqual(
    result.screens.map((item) => item.screen_key),
    ['platform.fixture.overview', 'platform.fixture.settings'],
  );
  assert.deepEqual(result.screens[0], {
    screen_key: 'platform.fixture.overview',
    module_key: 'platform.fixture',
    title: 'Fixture overview',
    route: '/platform/fixture',
    status: 'active',
    screen_type: 'private_portal',
    required_capabilities: ['platform.fixture.read'],
    optional_capabilities: ['platform.shell.access'],
    api_route_keys: ['platform.fixture.read.api'],
  });
}

function testScreenRegistrationRejectsMissingCapabilitiesAndOwnershipDrift() {
  const service = new ModuleRegistryService({} as never);

  assert.throws(
    () =>
      service.registerScreenContributions({
        manifest: manifest(),
        screens: [
          screen({
            required_capabilities: [],
          }),
        ],
      }),
    ConflictException,
  );

  assert.throws(
    () =>
      service.registerScreenContributions({
        manifest: manifest(),
        screens: [
          screen({
            module_key: 'other.module',
          }),
        ],
      }),
    ConflictException,
  );

  assert.throws(
    () =>
      service.registerScreenContributions({
        manifest: manifest(),
        screens: [
          screen({
            required_capabilities: ['platform.fixture.unknown'],
          }),
        ],
      }),
    ConflictException,
  );
}

function testScreenRegistrationRejectsDuplicateRoutesAndBusinessRouteLeakage() {
  const service = new ModuleRegistryService({} as never);

  assert.throws(
    () =>
      service.registerScreenContributions({
        manifest: manifest(),
        screens: [
          screen(),
          screen({
            screen_key: 'platform.fixture.other',
          }),
        ],
      }),
    ConflictException,
  );

  assert.throws(
    () =>
      service.registerScreenContributions({
        manifest: manifest(),
        screens: [
          screen({
            screen_key: 'platform.fixture.business',
            route: '/lead-desk',
          }),
        ],
      }),
    ConflictException,
  );
}

function testScreenRegistrationRejectsUnsafeApiRouteReferences() {
  const service = new ModuleRegistryService({} as never);

  assert.throws(
    () =>
      service.registerScreenContributions({
        manifest: manifest(),
        screens: [
          screen({
            api_routes: [
              {
                key: 'platform.fixture.bad.api',
                path: 'relative/path',
                capability_key: 'platform.fixture.read',
              },
            ],
          }),
        ],
      }),
    ConflictException,
  );

  assert.throws(
    () =>
      service.registerScreenContributions({
        manifest: manifest(),
        screens: [
          screen({
            api_routes: [
              {
                key: 'platform.fixture.bad.api',
                path: '/platform/fixture/bad',
                capability_key: 'platform.fixture.unknown',
              },
            ],
          }),
        ],
      }),
    ConflictException,
  );
}

function run() {
  testRegistersCapabilityAwareScreenContracts();
  testScreenRegistrationRejectsMissingCapabilitiesAndOwnershipDrift();
  testScreenRegistrationRejectsDuplicateRoutesAndBusinessRouteLeakage();
  testScreenRegistrationRejectsUnsafeApiRouteReferences();

  console.log('P5B-015c screen registration tests passed.');
}

run();
