import assert from 'node:assert/strict';

import { RequestMethod, UnauthorizedException } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';

import { ModuleRegistryController } from './module-registry.controller';
import { ModuleRegistryService } from './module-registry.service';
import { type HeaderRecord, createPhase3SessionToken } from '../security/request-context';

const AUTH_SECRET = 'phase5b-module-registry-frontend-api-secret';
process.env.AKTI_AUTH_SESSION_SECRET = AUTH_SECRET;

type ModuleRow = {
  module_key: string;
  display_name: string;
  version: string;
  status: string;
  manifest_hash: string;
};

type ModuleFindManyArgs = {
  where?: {
    module_key?: {
      in?: string[];
    };
  };
  orderBy?: unknown;
  select?: unknown;
};

function trustedHeaders(organizationId = 'org-016a', actorUserId = 'actor-016a'): HeaderRecord {
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
    getFrontendRegistry: async (input: unknown) => {
      calls.push({ input });
      return {
        items: [
          {
            module_key: 'core.access',
            display_name: 'Access Core',
            version: '0.1.0',
            status: 'available',
          },
        ],
        tenant_context: {
          organization_id: 'org-016a',
          actor_user_id: 'actor-016a',
        },
        capability: {
          required: 'platform.shell.access',
        },
        gatekeeper: {
          read_requires_preflight: false,
          lifecycle_mutation_requires_preflight: true,
        },
        audit: {
          event_type: 'module.registry.frontend.read',
          outbox_event_required: false,
        },
      };
    },
  };

  return {
    calls,
    controller: new ModuleRegistryController(service as never),
  };
}

function createService(moduleRows: ModuleRow[]) {
  const calls: Array<{ fn: string; args: unknown }> = [];
  const prisma = {
    moduleRegistryEntry: {
      findMany: async (args: ModuleFindManyArgs = {}) => {
        calls.push({ fn: 'moduleRegistryEntry.findMany', args });
        const allowedModuleKeys = args.where?.module_key?.in;
        const rows = allowedModuleKeys
          ? moduleRows.filter((row) => allowedModuleKeys.includes(row.module_key))
          : moduleRows;

        return rows
          .map(({ module_key, display_name, version, status, manifest_hash }) => ({
            module_key,
            display_name,
            version,
            status,
            manifest_hash,
          }))
          .sort((left, right) => left.module_key.localeCompare(right.module_key));
      },
    },
  };

  return {
    calls,
    service: new ModuleRegistryService(prisma as never),
  };
}

function testFrontendRouteMetadataIsExplicit() {
  const descriptor = Object.getOwnPropertyDescriptor(ModuleRegistryController.prototype, 'getFrontendRegistry');

  assert.ok(descriptor?.value);
  assert.equal(Reflect.getMetadata(PATH_METADATA, ModuleRegistryController), 'platform/modules');
  assert.equal(Reflect.getMetadata(PATH_METADATA, descriptor.value), 'frontend');
  assert.equal(Reflect.getMetadata(METHOD_METADATA, descriptor.value), RequestMethod.GET);
}

async function testFrontendApiUsesTrustedTenantAndActorContext() {
  const { controller, calls } = createController();

  const result = await controller.getFrontendRegistry(trustedHeaders());

  assert.equal(result.capability.required, 'platform.shell.access');
  assert.equal(result.gatekeeper.read_requires_preflight, false);
  assert.equal(result.audit.event_type, 'module.registry.frontend.read');
  assert.deepEqual(calls[0].input, {
    organization_id: 'org-016a',
    actor_user_id: 'actor-016a',
  });
}

function testFrontendApiRejectsMissingSession() {
  const { controller } = createController();

  assert.throws(() => controller.getFrontendRegistry({}), UnauthorizedException);
}

async function testFrontendServiceReturnsSafeModuleList() {
  const { service, calls } = createService([
    {
      module_key: 'core.access',
      display_name: 'Access Core',
      version: '0.1.0',
      status: 'available',
      manifest_hash: 'a'.repeat(64),
    },
    {
      module_key: 'engagement.gateway',
      display_name: 'Engagement Gateway Lite',
      version: '0.1.0',
      status: 'available',
      manifest_hash: 'b'.repeat(64),
    },
    {
      module_key: 'unregistered.experimental',
      display_name: 'Experimental',
      version: '0.1.0',
      status: 'enabled',
      manifest_hash: 'c'.repeat(64),
    },
  ]);

  const response = await service.getFrontendRegistry({
    organization_id: 'org-016a',
    actor_user_id: 'actor-016a',
  });

  assert.deepEqual(
    response.items.map((item) => item.module_key),
    ['core.access', 'engagement.gateway'],
  );
  assert.equal(response.tenant_context.organization_id, 'org-016a');
  assert.equal(response.capability.required, 'platform.shell.access');
  assert.equal(response.gatekeeper.lifecycle_mutation_requires_preflight, true);
  assert.equal(response.audit.outbox_event_required, false);
  assert.equal(JSON.stringify(response).includes('manifest_hash'), false);
  assert.equal(JSON.stringify(response).includes('evidence_ref'), false);
  assert.deepEqual(calls.map((call) => call.fn), ['moduleRegistryEntry.findMany']);
}

async function run() {
  testFrontendRouteMetadataIsExplicit();
  await testFrontendApiUsesTrustedTenantAndActorContext();
  testFrontendApiRejectsMissingSession();
  await testFrontendServiceReturnsSafeModuleList();

  console.log('P5B-016a module registry frontend API tests passed.');
}

void run();
