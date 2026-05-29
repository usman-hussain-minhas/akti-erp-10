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
    permissions: [
      {
        key: 'platform.fixture.manage',
        allowed_scope_types: ['organization'],
      },
    ],
    settings: [
      {
        key: 'platform.fixture.mode',
        label: 'Fixture mode',
        description: 'Controls the fixture runtime mode.',
        value_type: 'string',
        required: true,
        default_value: 'standard',
      },
      {
        key: 'platform.fixture.enabled',
        label: 'Fixture enabled',
        description: 'Controls whether the fixture is enabled.',
        value_type: 'boolean',
        required: false,
        default_value: false,
      },
      {
        key: 'platform.fixture.limits',
        label: 'Fixture limits',
        description: 'Stores fixture limit configuration.',
        value_type: 'json',
        required: false,
        default_value: { max_items: 10 },
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

function testRegistersTypedSettings() {
  const service = new ModuleRegistryService({} as never);

  const result = service.registerSettingContributions(manifest());

  assert.equal(result.module_key, 'platform.fixture');
  assert.equal(result.registered_count, 3);
  assert.deepEqual(
    result.settings.map((setting) => setting.key),
    ['platform.fixture.enabled', 'platform.fixture.limits', 'platform.fixture.mode'],
  );
  assert.deepEqual(result.settings[2], {
    key: 'platform.fixture.mode',
    label: 'Fixture mode',
    module_key: 'platform.fixture',
    description: 'Controls the fixture runtime mode.',
    value_type: 'string',
    required: true,
    has_default_value: true,
  });
}

function testRejectsSecretLikeSettings() {
  const service = new ModuleRegistryService({} as never);

  assert.throws(
    () =>
      service.registerSettingContributions(
        manifest({
          settings: [
            {
              key: 'platform.fixture.api_key',
              label: 'Fixture API key',
              description: 'Stores a provider API key.',
              value_type: 'string',
              required: true,
            },
          ],
        }),
      ),
    ConflictException,
  );
}

function testRejectsDuplicateAndMalformedSettings() {
  const service = new ModuleRegistryService({} as never);

  assert.throws(
    () =>
      service.registerSettingContributions(
        manifest({
          settings: [
            {
              key: 'platform.fixture.mode',
              label: 'Fixture mode',
              description: 'Controls the fixture runtime mode.',
              value_type: 'string',
              required: true,
            },
            {
              key: 'platform.fixture.mode',
              label: 'Fixture mode duplicate',
              description: 'Duplicate setting.',
              value_type: 'string',
              required: false,
            },
          ],
        }),
      ),
    ConflictException,
  );

  assert.throws(
    () =>
      service.registerSettingContributions(
        manifest({
          settings: [
            {
              key: 'platform.fixture.bad default',
              label: 'Bad setting',
              description: 'Bad key.',
              value_type: 'string',
              required: false,
            },
          ],
        }),
      ),
    ConflictException,
  );
}

function testRejectsDefaultTypeMismatch() {
  const service = new ModuleRegistryService({} as never);

  assert.throws(
    () =>
      service.registerSettingContributions(
        manifest({
          settings: [
            {
              key: 'platform.fixture.number',
              label: 'Fixture number',
              description: 'Numeric fixture configuration.',
              value_type: 'number',
              required: false,
              default_value: '10',
            },
          ],
        }),
      ),
    ConflictException,
  );
}

function run() {
  testRegistersTypedSettings();
  testRejectsSecretLikeSettings();
  testRejectsDuplicateAndMalformedSettings();
  testRejectsDefaultTypeMismatch();

  console.log('P5B-015e settings registration tests passed.');
}

run();
