import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { BadRequestException, NotFoundException, RequestMethod, UnauthorizedException } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';

import { ModuleRegistryController } from './module-registry.controller';
import { ModuleRegistryService } from './module-registry.service';
import { type HeaderRecord, createPhase3SessionToken } from '../security/request-context';

const AUTH_SECRET = 'phase5b-module-registry-status-api-secret';
process.env.AKTI_AUTH_SESSION_SECRET = AUTH_SECRET;

type ModuleRow = {
  module_key: string;
  display_name: string;
  version: string;
  status: string;
  manifest_hash: string;
};

type LifecycleEventRow = {
  id: string;
  organization_id: string | null;
  module_key: string;
  from_status: string | null;
  to_status: string;
  action_key: string;
  evidence_ref: string | null;
  reason: string | null;
  created_at: Date;
};

function trustedHeaders(organizationId = 'org-011c', actorUserId = 'actor-011c'): HeaderRecord {
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
    getModuleLifecycleStatus: async (input: unknown) => {
      calls.push({ input });
      return {
        module_key: 'platform.fixture',
        display_name: 'Platform Fixture',
        version: '0.1.0',
        status: 'enabled',
        manifest_hash: 'a'.repeat(64),
        tenant_context: {
          organization_id: 'org-011c',
          actor_user_id: 'actor-011c',
        },
        capability: {
          required: 'platform.shell.access',
        },
        gatekeeper: {
          read_requires_preflight: false,
          lifecycle_mutation_requires_preflight: true,
        },
        audit: {
          event_type: 'module.registry.lifecycle_status.read',
          evidence_required_for_mutation: true,
        },
        latest_lifecycle_event: null,
      };
    },
  };

  return {
    calls,
    controller: new ModuleRegistryController(service as never),
  };
}

function createService(moduleRows: ModuleRow[], lifecycleEvents: LifecycleEventRow[]) {
  const calls: Array<{ fn: string; args: unknown }> = [];
  const prisma = {
    moduleRegistryEntry: {
      findUnique: async ({ where }: { where: { module_key: string } }) => {
        calls.push({ fn: 'moduleRegistryEntry.findUnique', args: { where } });
        return moduleRows.find((row) => row.module_key === where.module_key) ?? null;
      },
    },
    moduleLifecycleEvent: {
      findMany: async ({
        where,
      }: {
        where: { module_key: string; OR: Array<{ organization_id: string | null }> };
      }) => {
        calls.push({ fn: 'moduleLifecycleEvent.findMany', args: { where } });
        const organizationIds = new Set(where.OR.map((entry) => entry.organization_id));
        return lifecycleEvents
          .filter((event) => event.module_key === where.module_key && organizationIds.has(event.organization_id))
          .sort((left, right) => right.created_at.getTime() - left.created_at.getTime())
          .slice(0, 1);
      },
    },
  };

  return {
    calls,
    service: new ModuleRegistryService(prisma as never),
  };
}

function testLifecycleStatusRouteMetadataIsExplicit() {
  const descriptor = Object.getOwnPropertyDescriptor(ModuleRegistryController.prototype, 'getLifecycleStatus');

  assert.ok(descriptor?.value);
  assert.equal(Reflect.getMetadata(PATH_METADATA, ModuleRegistryController), 'platform/modules');
  assert.equal(Reflect.getMetadata(PATH_METADATA, descriptor.value), ':module_key/lifecycle-status');
  assert.equal(Reflect.getMetadata(METHOD_METADATA, descriptor.value), RequestMethod.GET);
}

async function testLifecycleStatusApiUsesTrustedTenantAndActorContext() {
  const { controller, calls } = createController();

  const result = await controller.getLifecycleStatus(' platform.fixture ', trustedHeaders());

  assert.equal(result.module_key, 'platform.fixture');
  assert.equal(result.capability.required, 'platform.shell.access');
  assert.equal(result.gatekeeper.lifecycle_mutation_requires_preflight, true);
  assert.equal(result.audit.event_type, 'module.registry.lifecycle_status.read');
  assert.deepEqual(calls[0].input, {
    module_key: 'platform.fixture',
    organization_id: 'org-011c',
    actor_user_id: 'actor-011c',
  });
}

function testLifecycleStatusApiRejectsInvalidRouteAndMissingSession() {
  const { controller } = createController();

  assert.throws(
    () => controller.getLifecycleStatus('invalid', trustedHeaders()),
    BadRequestException,
  );
  assert.throws(
    () => controller.getLifecycleStatus('platform.fixture', {}),
    UnauthorizedException,
  );
}

async function testLifecycleStatusServiceReturnsFrontendSafeResponse() {
  const { service, calls } = createService(
    [
      {
        module_key: 'platform.fixture',
        display_name: 'Platform Fixture',
        version: '0.1.0',
        status: 'enabled',
        manifest_hash: 'a'.repeat(64),
      },
    ],
    [
      {
        id: 'mle_1',
        organization_id: null,
        module_key: 'platform.fixture',
        from_status: 'installed',
        to_status: 'enabled',
        action_key: 'module.enable',
        evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-011c/evidence.md',
        reason: 'enabled after validation',
        created_at: new Date('2026-05-29T00:00:00.000Z'),
      },
      {
        id: 'mle_2',
        organization_id: 'org-011c',
        module_key: 'platform.fixture',
        from_status: 'disabled',
        to_status: 'enabled',
        action_key: 'module.enable',
        evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-011c/org-evidence.md',
        reason: 'organization-scoped status read',
        created_at: new Date('2026-05-29T00:01:00.000Z'),
      },
    ],
  );

  const response = await service.getModuleLifecycleStatus({
    module_key: 'platform.fixture',
    organization_id: 'org-011c',
    actor_user_id: 'actor-011c',
  });

  assert.equal(response.status, 'enabled');
  assert.equal(response.tenant_context.organization_id, 'org-011c');
  assert.equal(response.capability.required, 'platform.shell.access');
  assert.equal(response.gatekeeper.read_requires_preflight, false);
  assert.equal(response.gatekeeper.lifecycle_mutation_requires_preflight, true);
  assert.equal(response.audit.evidence_required_for_mutation, true);
  assert.equal(response.latest_lifecycle_event?.id, 'mle_2');
  assert.equal(response.latest_lifecycle_event?.to_status, 'enabled');
  assert.deepEqual(calls.map((call) => call.fn), [
    'moduleRegistryEntry.findUnique',
    'moduleLifecycleEvent.findMany',
  ]);
}

async function testLifecycleStatusServiceRejectsUnknownModule() {
  const { service } = createService([], []);

  await assert.rejects(
    () =>
      service.getModuleLifecycleStatus({
        module_key: 'platform.fixture',
        organization_id: 'org-011c',
        actor_user_id: 'actor-011c',
      }),
    NotFoundException,
  );
}

function testModuleRegistrationIsExplicit() {
  const appModuleSource = readFileSync('src/app.module.ts', 'utf8');
  const moduleSource = readFileSync('src/module-registry/module-registry.module.ts', 'utf8');

  assert.equal(appModuleSource.includes('ModuleRegistryModule'), true);
  assert.equal(moduleSource.includes('controllers: [ModuleRegistryController]'), true);
  assert.equal(moduleSource.includes('exports: [ModuleRegistryService]'), true);
}

async function run() {
  testLifecycleStatusRouteMetadataIsExplicit();
  await testLifecycleStatusApiUsesTrustedTenantAndActorContext();
  testLifecycleStatusApiRejectsInvalidRouteAndMissingSession();
  await testLifecycleStatusServiceReturnsFrontendSafeResponse();
  await testLifecycleStatusServiceRejectsUnknownModule();
  testModuleRegistrationIsExplicit();

  console.log('P5B-011c module lifecycle registry status API tests passed.');
}

void run();
