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
    health_checks: [
      {
        key: 'platform.fixture.health',
        description: 'Fixture contract health boundary.',
        endpoint: '/platform/fixture/health',
        critical: false,
        timeout_ms: 1000,
      },
    ],
    degraded_mode_behavior: {
      mode: 'limited',
      description: 'Management is disabled while read access remains available.',
      disabled_capabilities: ['platform.fixture.manage'],
    },
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

function testRegistersHealthAndDegradedState() {
  const service = new ModuleRegistryService({} as never);

  const result = service.registerHealthDegradedStateContributions(manifest());

  assert.equal(result.module_key, 'platform.fixture');
  assert.deepEqual(result.health_checks, [
    {
      key: 'platform.fixture.health',
      description: 'Fixture contract health boundary.',
      endpoint: '/platform/fixture/health',
      critical: false,
      timeout_ms: 1000,
    },
  ]);
  assert.deepEqual(result.degraded_mode_behavior, {
    mode: 'limited',
    description: 'Management is disabled while read access remains available.',
    disabled_capabilities: ['platform.fixture.manage'],
  });
}

function testRejectsMissingOrInvalidDegradedMode() {
  const service = new ModuleRegistryService({} as never);

  assert.throws(
    () =>
      service.registerHealthDegradedStateContributions(
        manifest({
          degraded_mode_behavior: undefined,
        }),
      ),
    ConflictException,
  );

  assert.throws(
    () =>
      service.registerHealthDegradedStateContributions(
        manifest({
          degraded_mode_behavior: {
            mode: 'limited',
            description: 'Bad disabled capability.',
            disabled_capabilities: ['platform.fixture.unknown'],
          },
        }),
      ),
    ConflictException,
  );
}

function testRejectsMalformedHealthChecks() {
  const service = new ModuleRegistryService({} as never);

  assert.throws(
    () =>
      service.registerHealthDegradedStateContributions(
        manifest({
          health_checks: [
            {
              key: 'platform.fixture.health',
              description: 'Duplicate health check.',
              endpoint: '/platform/fixture/health',
              critical: false,
              timeout_ms: 1000,
            },
            {
              key: 'platform.fixture.health',
              description: 'Duplicate health check.',
              endpoint: '/platform/fixture/health-2',
              critical: false,
              timeout_ms: 1000,
            },
          ],
        }),
      ),
    ConflictException,
  );

  assert.throws(
    () =>
      service.registerHealthDegradedStateContributions(
        manifest({
          health_checks: [
            {
              key: 'platform.fixture.bad-health',
              description: 'Bad health check.',
              endpoint: 'relative/path',
              critical: false,
              timeout_ms: 1000,
            },
          ],
        }),
      ),
    ConflictException,
  );

  assert.throws(
    () =>
      service.registerHealthDegradedStateContributions(
        manifest({
          health_checks: [
            {
              key: 'platform.fixture.bad-timeout',
              description: 'Bad timeout.',
              endpoint: '/platform/fixture/health',
              critical: false,
              timeout_ms: 0,
            },
          ],
        }),
      ),
    ConflictException,
  );
}

function run() {
  testRegistersHealthAndDegradedState();
  testRejectsMissingOrInvalidDegradedMode();
  testRejectsMalformedHealthChecks();

  console.log('P5B-015f health/degraded state registration tests passed.');
}

run();
