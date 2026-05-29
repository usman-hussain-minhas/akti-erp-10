import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { ModuleRegistryService } from './module-registry.service';

type ModuleRow = {
  module_key: string;
  display_name: string;
  version: string;
  status: string;
  manifest_hash: string;
  evidence_ref?: string | null;
  lifecycle_events?: Array<{
    action_key: string;
    evidence_ref: string;
  }>;
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

function createService(moduleRows: ModuleRow[]) {
  const calls: Array<{ fn: string; args: ModuleFindManyArgs }> = [];
  const prisma = {
    moduleRegistryEntry: {
      findMany: async (args: ModuleFindManyArgs = {}) => {
        calls.push({ fn: 'moduleRegistryEntry.findMany', args });
        const allowedModuleKeys = args.where?.module_key?.in;
        const rows = allowedModuleKeys
          ? moduleRows.filter((row) => allowedModuleKeys.includes(row.module_key))
          : moduleRows;

        return rows
          .map((row) => ({
            module_key: row.module_key,
            display_name: row.display_name,
            version: row.version,
            status: row.status,
            manifest_hash: row.manifest_hash,
            evidence_ref: row.evidence_ref ?? null,
            lifecycle_events: row.lifecycle_events ?? [],
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

async function testFrontendResponseExcludesInternalRegistryFields() {
  const { service } = createService([
    {
      module_key: 'core.access',
      display_name: 'Access Core',
      version: '0.1.0',
      status: 'available',
      manifest_hash: 'a'.repeat(64),
      evidence_ref: 'codex-review/internal/access-core-evidence.md',
      lifecycle_events: [
        {
          action_key: 'internal.install',
          evidence_ref: 'codex-review/internal/lifecycle-evidence.md',
        },
      ],
    },
  ]);

  const response = await service.getFrontendRegistry({
    organization_id: 'org-016b',
    actor_user_id: 'actor-016b',
  });
  const serialized = JSON.stringify(response);

  assert.equal(response.items.length, 1);
  assert.deepEqual(Object.keys(response.items[0]).sort(), ['display_name', 'module_key', 'status', 'version']);
  assert.equal(serialized.includes('manifest_hash'), false);
  assert.equal(serialized.includes('evidence_ref'), false);
  assert.equal(serialized.includes('lifecycle_events'), false);
  assert.equal(serialized.includes('internal.install'), false);
}

async function testFrontendResponseIncludesOnlyRegisteredRuntimeModuleKeys() {
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
      module_key: 'lead.desk',
      display_name: 'Lead Desk Core',
      version: '0.1.0',
      status: 'available',
      manifest_hash: 'c'.repeat(64),
    },
    {
      module_key: 'unregistered.experimental',
      display_name: 'Experimental',
      version: '0.1.0',
      status: 'enabled',
      manifest_hash: 'd'.repeat(64),
      evidence_ref: 'codex-review/internal/experimental.md',
    },
  ]);

  const response = await service.getFrontendRegistry({
    organization_id: 'org-016b',
    actor_user_id: 'actor-016b',
  });

  assert.deepEqual(
    response.items.map((item) => item.module_key),
    ['core.access', 'engagement.gateway', 'lead.desk'],
  );
  assert.deepEqual(calls[0].args.where?.module_key?.in?.sort(), [
    'core.access',
    'engagement.gateway',
    'lead.desk',
  ]);
}

async function testFrontendResponsePreservesShellBoundaryAndTenantContext() {
  const { service } = createService([
    {
      module_key: 'core.access',
      display_name: 'Access Core',
      version: '0.1.0',
      status: 'available',
      manifest_hash: 'a'.repeat(64),
    },
  ]);

  const response = await service.getFrontendRegistry({
    organization_id: 'org-016b',
    actor_user_id: 'actor-016b',
  });

  assert.deepEqual(response.tenant_context, {
    organization_id: 'org-016b',
    actor_user_id: 'actor-016b',
  });
  assert.equal(response.capability.required, 'platform.shell.access');
  assert.equal(response.gatekeeper.read_requires_preflight, false);
  assert.equal(response.gatekeeper.lifecycle_mutation_requires_preflight, true);
  assert.equal(response.audit.event_type, 'module.registry.frontend.read');
  assert.equal(response.audit.outbox_event_required, false);
}

async function testFrontendResponseRejectsMissingTrustedContext() {
  const { service } = createService([]);

  await assert.rejects(
    () =>
      service.getFrontendRegistry({
        organization_id: '',
        actor_user_id: 'actor-016b',
      }),
    BadRequestException,
  );
  await assert.rejects(
    () =>
      service.getFrontendRegistry({
        organization_id: 'org-016b',
        actor_user_id: '',
      }),
    BadRequestException,
  );
}

async function run() {
  await testFrontendResponseExcludesInternalRegistryFields();
  await testFrontendResponseIncludesOnlyRegisteredRuntimeModuleKeys();
  await testFrontendResponsePreservesShellBoundaryAndTenantContext();
  await testFrontendResponseRejectsMissingTrustedContext();

  console.log('P5B-016b module registry frontend-safe response tests passed.');
}

void run();
