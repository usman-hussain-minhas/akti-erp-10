import assert from 'node:assert/strict';

import { BadRequestException, ForbiddenException, RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';

import { HeaderRecord, createPhase3SessionToken } from '../security/request-context';
import { ConfigurationController } from './configuration.controller';

const AUTH_SECRET = 'phase5b-tenant-config-api-secret';
process.env.AKTI_AUTH_SESSION_SECRET = AUTH_SECRET;

function trustedHeaders(organizationId = 'org-1', actorUserId = 'actor-1'): HeaderRecord {
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

function createController() {
  const calls: Array<{ method: string; args: unknown[] }> = [];
  const service = {
    getTenantConfiguration: async (...args: unknown[]) => {
      calls.push({ method: 'getTenantConfiguration', args });
      return {
        organization_id: args[0],
        portal_mode: {
          mode: 'simple',
        },
        mutation_policy: {
          capability_key: 'access.policy.manage',
          module_key: 'core.access',
          gatekeeper_required: true,
          audit_required: true,
        },
      };
    },
  };

  return {
    calls,
    controller: new ConfigurationController(service as never),
  };
}

function testTenantConfigRouteMetadataIsExplicit() {
  const descriptor = Object.getOwnPropertyDescriptor(
    ConfigurationController.prototype,
    'getTenantConfiguration',
  );

  assert.ok(descriptor?.value);
  assert.equal(Reflect.getMetadata(PATH_METADATA, ConfigurationController), 'platform/configuration');
  assert.equal(
    Reflect.getMetadata(PATH_METADATA, descriptor.value),
    'organizations/:organization_id/tenant-config',
  );
  assert.equal(Reflect.getMetadata(METHOD_METADATA, descriptor.value), RequestMethod.GET);
}

async function testTenantConfigApiUsesTrustedTenantContext() {
  const { controller, calls } = createController();

  const result = await controller.getTenantConfiguration(' org-1 ', trustedHeaders());

  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], {
    method: 'getTenantConfiguration',
    args: ['org-1', 'actor-1'],
  });
  assert.equal(result.organization_id, 'org-1');
  assert.equal(result.mutation_policy.capability_key, 'access.policy.manage');
  assert.equal(result.mutation_policy.module_key, 'core.access');
}

function testTenantConfigApiRejectsInvalidTenantAndMismatchedToken() {
  const { controller } = createController();

  assert.throws(() => controller.getTenantConfiguration(' ', trustedHeaders()), BadRequestException);
  assert.throws(
    () => controller.getTenantConfiguration('org-1', trustedHeaders('org-2')),
    ForbiddenException,
  );
}

async function run() {
  testTenantConfigRouteMetadataIsExplicit();
  await testTenantConfigApiUsesTrustedTenantContext();
  testTenantConfigApiRejectsInvalidTenantAndMismatchedToken();

  console.log('P5B-005c tenant config API tests passed.');
}

void run();
