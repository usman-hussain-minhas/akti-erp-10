import assert from 'node:assert/strict';

import { RequestMethod, UnauthorizedException } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';

import { ModuleRegistryController } from './module-registry.controller';
import { type HeaderRecord, createPhase3SessionToken } from '../security/request-context';

const AUTH_SECRET = 'phase5b1-module-registry-role-aware-secret';
process.env.AKTI_AUTH_SESSION_SECRET = AUTH_SECRET;

function trustedHeaders(organizationId = 'org-016', actorUserId = 'actor-016'): HeaderRecord {
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
  const calls: Array<{ input: unknown }> = [];
  const service = {
    listModulesForActor: async (input: unknown) => {
      calls.push({ input });
      return {
        items: [
          {
            module_key: 'lead.desk',
            display_name: 'CRM',
            display_description: 'Customer relationship surface.',
            icon_key: 'users',
            category: 'business',
            route: '/lead-desk',
            visibility_state: 'available',
            version: '0.1.0',
            status: 'available',
            required_capabilities: ['platform.crm.access'],
          },
        ],
        tenant_context: {
          organization_id: 'org-016',
          actor_user_id: 'actor-016',
        },
        capability: {
          required: 'platform.modules.view',
        },
        authority: {
          visibility_grants_destructive_actions: false,
        },
      };
    },
    listModules: async () => ({ items: [] }),
  };

  return {
    calls,
    controller: new ModuleRegistryController(service as never),
  };
}

function testPlatformModulesRouteIsRootGet() {
  const descriptor = Object.getOwnPropertyDescriptor(ModuleRegistryController.prototype, 'listModules');

  assert.ok(descriptor?.value);
  assert.equal(Reflect.getMetadata(PATH_METADATA, ModuleRegistryController), 'platform/modules');
  assert.equal(Reflect.getMetadata(METHOD_METADATA, descriptor.value), RequestMethod.GET);
}

async function testPlatformModulesUsesTrustedActorContext() {
  const { controller, calls } = createController();

  const result = await controller.listModules(trustedHeaders()) as {
    capability: { required: string };
    authority: { visibility_grants_destructive_actions: boolean };
  };

  assert.equal(result.capability.required, 'platform.modules.view');
  assert.equal(result.authority.visibility_grants_destructive_actions, false);
  assert.deepEqual(calls[0].input, {
    organization_id: 'org-016',
    actor_user_id: 'actor-016',
  });
}

function testPlatformModulesRejectsMissingSession() {
  const { controller } = createController();

  assert.throws(() => controller.listModules({}), UnauthorizedException);
}

async function run() {
  testPlatformModulesRouteIsRootGet();
  await testPlatformModulesUsesTrustedActorContext();
  testPlatformModulesRejectsMissingSession();

  console.log('P5B1-016 Module Registry role-aware controller tests passed.');
}

void run();
