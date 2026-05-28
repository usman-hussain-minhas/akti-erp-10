import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { ModuleRegistryService } from './module-registry.service';

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
  actor_user_id: string | null;
  evidence_ref: string | null;
  reason: string | null;
  metadata: unknown;
  created_at: Date;
};

type MockState = {
  moduleRows: ModuleRow[];
  lifecycleEvents: LifecycleEventRow[];
  calls: Array<{ fn: string; args: unknown }>;
};

function createMockPrisma(seedModules: ModuleRow[] = []) {
  const state: MockState = {
    moduleRows: [...seedModules],
    lifecycleEvents: [],
    calls: [],
  };

  const prisma = {
    moduleRegistryEntry: {
      upsert: async ({
        where,
        create,
        update,
      }: {
        where: { module_key: string };
        create: ModuleRow;
        update: Omit<ModuleRow, 'module_key'>;
      }) => {
        state.calls.push({ fn: 'moduleRegistryEntry.upsert', args: { where, create, update } });
        const index = state.moduleRows.findIndex((row) => row.module_key === where.module_key);
        if (index === -1) {
          state.moduleRows.push({ ...create });
          return { ...create };
        }

        state.moduleRows[index] = {
          ...state.moduleRows[index],
          ...update,
        };
        return { ...state.moduleRows[index] };
      },
      findUnique: async ({ where }: { where: { module_key: string } }) => {
        state.calls.push({ fn: 'moduleRegistryEntry.findUnique', args: { where } });
        const row = state.moduleRows.find((item) => item.module_key === where.module_key);
        return row ? { ...row } : null;
      },
      update: async ({ where, data }: { where: { module_key: string }; data: { status: string } }) => {
        state.calls.push({ fn: 'moduleRegistryEntry.update', args: { where, data } });
        const index = state.moduleRows.findIndex((row) => row.module_key === where.module_key);
        assert.notEqual(index, -1);
        state.moduleRows[index] = {
          ...state.moduleRows[index],
          status: data.status,
        };
        return { ...state.moduleRows[index] };
      },
    },
    moduleLifecycleEvent: {
      create: async ({ data }: { data: Omit<LifecycleEventRow, 'id' | 'created_at'> }) => {
        state.calls.push({ fn: 'moduleLifecycleEvent.create', args: { data } });
        const row = {
          id: `mle_${state.lifecycleEvents.length + 1}`,
          ...data,
          created_at: new Date('2026-05-29T00:00:00.000Z'),
        };
        state.lifecycleEvents.push(row);
        return { ...row };
      },
    },
  };

  return { prisma, state };
}

async function testRegistryEntryPersistenceUpsertsExactFields() {
  const { prisma, state } = createMockPrisma();
  const service = new ModuleRegistryService(prisma as never);

  const first = await service.persistModuleRegistryEntry(
    {
      module_key: 'sample.platform',
      display_name: 'Sample Platform',
      version: '0.1.0',
      status: 'installable',
      manifest_hash: 'a'.repeat(64),
    },
    prisma as never,
  );
  const second = await service.persistModuleRegistryEntry(
    {
      module_key: 'sample.platform',
      display_name: 'Sample Platform',
      version: '0.1.1',
      status: 'installed',
      manifest_hash: 'b'.repeat(64),
    },
    prisma as never,
  );

  assert.equal(first.status, 'installable');
  assert.equal(second.version, '0.1.1');
  assert.equal(second.status, 'installed');
  assert.equal(state.moduleRows.length, 1);
  assert.equal(state.moduleRows[0].manifest_hash, 'b'.repeat(64));
  assert.deepEqual(
    state.calls.filter((call) => call.fn === 'moduleRegistryEntry.upsert').length,
    2,
  );
}

async function testLifecycleTransitionUpdatesStatusAndRecordsEvidence() {
  const { prisma, state } = createMockPrisma([
    {
      module_key: 'sample.platform',
      display_name: 'Sample Platform',
      version: '0.1.0',
      status: 'installed',
      manifest_hash: 'a'.repeat(64),
    },
  ]);
  const service = new ModuleRegistryService(prisma as never);

  const result = await service.persistModuleLifecycleTransition(
    {
      module_key: 'sample.platform',
      to_status: 'enabled',
      action_key: 'module.enable',
      organization_id: 'org_010c',
      actor_user_id: 'user_010c',
      evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-010c/evidence.md',
      reason: 'validated transition',
      metadata: {
        source_ticket: 'P5B-010c',
        gatekeeper_preflight: 'required_before_foundry_execution',
      },
    },
    prisma as never,
  );

  assert.equal(result.module.status, 'enabled');
  assert.equal(result.lifecycle_event.module_key, 'sample.platform');
  assert.equal(result.lifecycle_event.from_status, 'installed');
  assert.equal(result.lifecycle_event.to_status, 'enabled');
  assert.equal(result.lifecycle_event.organization_id, 'org_010c');
  assert.equal(result.lifecycle_event.actor_user_id, 'user_010c');
  assert.equal(result.lifecycle_event.evidence_ref?.includes('P5B-010c'), true);
  assert.deepEqual(state.moduleRows.map((row) => row.status), ['enabled']);
  assert.equal(state.lifecycleEvents.length, 1);
  assert.deepEqual(
    state.calls.map((call) => call.fn),
    ['moduleRegistryEntry.findUnique', 'moduleRegistryEntry.update', 'moduleLifecycleEvent.create'],
  );
}

async function testPersistenceRejectsInvalidStatusAndMissingModule() {
  const { prisma } = createMockPrisma();
  const service = new ModuleRegistryService(prisma as never);

  await assert.rejects(
    () =>
      service.persistModuleRegistryEntry(
        {
          module_key: 'sample.platform',
          display_name: 'Sample Platform',
          version: '0.1.0',
          status: 'available' as never,
          manifest_hash: 'a'.repeat(64),
        },
        prisma as never,
      ),
    /approved lifecycle status/,
  );

  await assert.rejects(
    () =>
      service.persistModuleLifecycleTransition(
        {
          module_key: 'missing.platform',
          to_status: 'enabled',
          action_key: 'module.enable',
        },
        prisma as never,
      ),
    /existing registry entry/,
  );
}

function testPersistenceServiceDoesNotImplementFoundryLifecycleExecution() {
  const source = readFileSync('src/module-registry/module-registry.service.ts', 'utf8');

  assert.equal(source.includes('FoundryService'), false);
  assert.equal(source.includes('persistModuleRegistryEntry'), true);
  assert.equal(source.includes('persistModuleLifecycleTransition'), true);
}

async function run() {
  await testRegistryEntryPersistenceUpsertsExactFields();
  await testLifecycleTransitionUpdatesStatusAndRecordsEvidence();
  await testPersistenceRejectsInvalidStatusAndMissingModule();
  testPersistenceServiceDoesNotImplementFoundryLifecycleExecution();

  console.log('P5B-010c module registry persistence service tests passed.');
}

void run();
