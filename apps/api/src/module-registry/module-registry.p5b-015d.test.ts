import assert from 'node:assert/strict';

import { ConflictException } from '@nestjs/common';

import {
  ModuleRegistryService,
  type CommandContributionContract,
  type RuntimeModuleManifest,
} from './module-registry.service';

function manifest(overrides?: Partial<RuntimeModuleManifest>): RuntimeModuleManifest {
  return {
    module_key: 'platform.fixture',
    display_name: 'Platform Fixture',
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
  };
}

function command(overrides?: Partial<CommandContributionContract>): CommandContributionContract {
  return {
    id: 'platform.fixture.open',
    label: 'Open fixture',
    description: 'Open the platform fixture surface.',
    route: '/platform/fixture',
    group: 'Fixture',
    required_capability: 'platform.fixture.read',
    module_id: 'platform.fixture',
    keywords: ['fixture', 'open'],
    visibility_condition: 'visible',
    ...overrides,
  };
}

function testRegistersCapabilityAwareCommands() {
  const service = new ModuleRegistryService({} as never);

  const result = service.registerCommandContributions({
    manifest: manifest(),
    commands: [
      command({
        id: 'platform.fixture.manage',
        label: 'Manage fixture',
        route: undefined,
        action: 'platform.fixture.manage',
        required_capability: 'platform.fixture.manage',
        keywords: ['manage', 'fixture'],
      }),
      command(),
    ],
  });

  assert.equal(result.module_key, 'platform.fixture');
  assert.equal(result.registered_count, 2);
  assert.deepEqual(
    result.commands.map((item) => item.id),
    ['platform.fixture.manage', 'platform.fixture.open'],
  );
  assert.deepEqual(result.commands[1], {
    id: 'platform.fixture.open',
    label: 'Open fixture',
    module_key: 'platform.fixture',
    group: 'Fixture',
    route: '/platform/fixture',
    action: null,
    required_capability: 'platform.fixture.read',
    keywords: ['fixture', 'open'],
    visibility_condition: 'visible',
    disabled_reason: null,
  });
}

function testCommandRegistrationRejectsUnknownCapabilityAndOwnerDrift() {
  const service = new ModuleRegistryService({} as never);

  assert.throws(
    () =>
      service.registerCommandContributions({
        manifest: manifest(),
        commands: [
          command({
            required_capability: 'platform.fixture.unknown',
          }),
        ],
      }),
    ConflictException,
  );

  assert.throws(
    () =>
      service.registerCommandContributions({
        manifest: manifest(),
        commands: [
          command({
            module_id: 'other.module',
          }),
        ],
      }),
    ConflictException,
  );
}

function testCommandRegistrationRejectsUnsafeOrAmbiguousCommands() {
  const service = new ModuleRegistryService({} as never);

  assert.throws(
    () =>
      service.registerCommandContributions({
        manifest: manifest(),
        commands: [
          command({
            route: undefined,
            action: undefined,
          }),
        ],
      }),
    ConflictException,
  );

  assert.throws(
    () =>
      service.registerCommandContributions({
        manifest: manifest(),
        commands: [
          command({
            route: 'relative/path',
          }),
        ],
      }),
    ConflictException,
  );

  assert.throws(
    () =>
      service.registerCommandContributions({
        manifest: manifest(),
        commands: [
          command(),
          command({
            label: 'Duplicate command',
          }),
        ],
      }),
    ConflictException,
  );
}

function testCommandRegistrationRejectsBusinessRouteLeakage() {
  const service = new ModuleRegistryService({} as never);

  assert.throws(
    () =>
      service.registerCommandContributions({
        manifest: manifest(),
        commands: [
          command({
            id: 'platform.fixture.business',
            label: 'Open business route',
            route: '/lead-desk/inbox',
          }),
        ],
      }),
    ConflictException,
  );
}

function run() {
  testRegistersCapabilityAwareCommands();
  testCommandRegistrationRejectsUnknownCapabilityAndOwnerDrift();
  testCommandRegistrationRejectsUnsafeOrAmbiguousCommands();
  testCommandRegistrationRejectsBusinessRouteLeakage();

  console.log('P5B-015d command registration tests passed.');
}

run();
