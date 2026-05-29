import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { RequestMethod, UnauthorizedException } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';

import { PlatformHealthController } from './platform-health.controller';
import { type HeaderRecord, createPhase3SessionToken } from '../security/request-context';

const AUTH_SECRET = 'phase5b-platform-health-secret';
process.env.AKTI_AUTH_SESSION_SECRET = AUTH_SECRET;

function trustedHeaders(organizationId = 'org-031a', actorUserId = 'actor-031a'): HeaderRecord {
  return {
    authorization: `Bearer ${createPhase3SessionToken(
      {
        organization_id: organizationId,
        actor_user_id: actorUserId,
        issued_at: new Date(Date.now() - 60_000).toISOString(),
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
      AUTH_SECRET,
    )}`,
  };
}

function createController(moduleRows: Array<{ module_key: string; display_name: string; version: string; status: string }>) {
  const calls: string[] = [];
  const service = {
    listModules: async () => {
      calls.push('listModules');
      return {
        items: moduleRows.map((row) => ({
          ...row,
          manifest_hash: 'a'.repeat(64),
        })),
      };
    },
  };

  return {
    calls,
    controller: new PlatformHealthController(service as never),
  };
}

function testRouteMetadataIsExplicit() {
  const descriptor = Object.getOwnPropertyDescriptor(PlatformHealthController.prototype, 'getPlatformHealth');

  assert.ok(descriptor?.value);
  assert.equal(Reflect.getMetadata(PATH_METADATA, PlatformHealthController), 'platform');
  assert.equal(Reflect.getMetadata(PATH_METADATA, descriptor.value), 'health');
  assert.equal(Reflect.getMetadata(METHOD_METADATA, descriptor.value), RequestMethod.GET);
}

async function testAggregatesHealthyRegisteredModules() {
  const { controller, calls } = createController([
    {
      module_key: 'core.access',
      display_name: 'Access Core',
      version: '0.1.0',
      status: 'enabled',
    },
    {
      module_key: 'engagement.gateway',
      display_name: 'Engagement Gateway Lite',
      version: '0.1.0',
      status: 'available',
    },
  ]);

  const response = await controller.getPlatformHealth(trustedHeaders());

  assert.equal(response.route, '/platform/health');
  assert.equal(response.status, 'healthy');
  assert.equal(response.tenant_context.organization_id, 'org-031a');
  assert.equal(response.tenant_context.actor_user_id, 'actor-031a');
  assert.equal(response.capability.required, 'platform.shell.access');
  assert.equal(response.gatekeeper.read_requires_preflight, false);
  assert.equal(response.gatekeeper.lifecycle_mutation_requires_preflight, true);
  assert.equal(response.modules.total, 2);
  assert.equal(response.modules.healthy, 2);
  assert.equal(response.modules.degraded, 0);
  assert.equal(response.degraded_modules.length, 0);
  assert.equal(response.audit.event_type, 'platform.health.read');
  assert.equal(response.audit.outbox_event_required, false);
  assert.equal(JSON.stringify(response).includes('manifest_hash'), false);
  assert.deepEqual(calls, ['listModules']);
}

async function testReportsDegradedAndBlockedModuleStatus() {
  const { controller } = createController([
    {
      module_key: 'core.access',
      display_name: 'Access Core',
      version: '0.1.0',
      status: 'enabled',
    },
    {
      module_key: 'platform.fixture',
      display_name: 'Platform Fixture',
      version: '0.1.0',
      status: 'rollback_required',
    },
    {
      module_key: 'platform.blocked',
      display_name: 'Blocked Platform Module',
      version: '0.1.0',
      status: 'blocked',
    },
  ]);

  const response = await controller.getPlatformHealth(trustedHeaders());

  assert.equal(response.status, 'degraded');
  assert.equal(response.modules.healthy, 1);
  assert.equal(response.modules.degraded, 1);
  assert.equal(response.modules.blocked, 1);
  assert.deepEqual(
    response.degraded_modules.map((item) => [item.module_key, item.health_status]),
    [
      ['platform.fixture', 'degraded'],
      ['platform.blocked', 'blocked'],
    ],
  );
}

async function testRejectsMissingSession() {
  const { controller } = createController([]);

  await assert.rejects(() => controller.getPlatformHealth({}), UnauthorizedException);
}

function testAppModuleRegistersPlatformHealthController() {
  const source = readFileSync('src/app.module.ts', 'utf8');

  assert.match(source, /import \{ PlatformHealthController \} from '\.\/platform-health\/platform-health\.controller';/);
  assert.match(source, /PlatformHealthController/);
}

async function run() {
  testRouteMetadataIsExplicit();
  await testAggregatesHealthyRegisteredModules();
  await testReportsDegradedAndBlockedModuleStatus();
  await testRejectsMissingSession();
  testAppModuleRegistersPlatformHealthController();

  console.log('P5B-031a platform health aggregation endpoint tests passed.');
}

void run();
