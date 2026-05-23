import assert from 'node:assert/strict';

import {
  loadAccessCoreCapabilitySeedDefinitions,
  loadAccessCoreModuleManifest,
  ModuleRegistryService,
} from './module-registry.service';
import { ModuleRegistryController } from './module-registry.controller';

type MockState = {
  moduleRows: Array<Record<string, unknown>>;
  capabilityRows: Array<Record<string, unknown>>;
  calls: Array<{ fn: string; args: unknown }>;
};

type ModuleFindManyArgs = {
  where?: {
    module_key?: {
      in?: string[];
    };
  };
};

function createMockPrisma() {
  const state: MockState = {
    moduleRows: [],
    capabilityRows: [],
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
        create: Record<string, unknown>;
        update: Record<string, unknown>;
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
      findMany: async (args: ModuleFindManyArgs = {}) => {
        state.calls.push({ fn: 'moduleRegistryEntry.findMany', args });
        const allowedModuleKeys = args.where?.module_key?.in;
        const rows = allowedModuleKeys
          ? state.moduleRows.filter((row) => allowedModuleKeys.includes(String(row.module_key)))
          : state.moduleRows;

        return [...rows].sort((left, right) =>
          String(left.module_key).localeCompare(String(right.module_key)),
        );
      },
    },
    capability: {
      upsert: async ({
        where,
        create,
        update,
      }: {
        where: { key: string };
        create: Record<string, unknown>;
        update: Record<string, unknown>;
      }) => {
        state.calls.push({ fn: 'capability.upsert', args: { where, create, update } });
        const index = state.capabilityRows.findIndex((row) => row.key === where.key);
        if (index === -1) {
          state.capabilityRows.push({ ...create });
          return { ...create };
        }

        state.capabilityRows[index] = {
          ...state.capabilityRows[index],
          ...update,
        };
        return { ...state.capabilityRows[index] };
      },
    },
  };

  return { prisma, state };
}

async function testSeedCreatesCoreAccessModuleAndCapability() {
  const { prisma, state } = createMockPrisma();
  const service = new ModuleRegistryService(prisma as never);

  const result = await service.seedCoreFoundation(prisma as never);
  const manifest = await loadAccessCoreModuleManifest();
  const [capabilitySeed] = await loadAccessCoreCapabilitySeedDefinitions();

  assert.equal(result.module.module_key, 'core.access');
  assert.equal(result.module.display_name, manifest.display_name);
  assert.equal(result.module.version, manifest.version);
  assert.equal(result.module.status, 'available');
  assert.match(result.module.manifest_hash, /^[a-f0-9]{64}$/);
  assert.equal(state.moduleRows.length, 1);

  assert.equal(result.capability.key, 'access.policy.manage');
  assert.equal(result.capability.module_key, capabilitySeed.module_key);
  assert.equal(result.capability.description, capabilitySeed.description);
  assert.equal(result.capability.risk_level, capabilitySeed.risk_level);
  assert.equal(result.capability.gatekeeper_required, capabilitySeed.gatekeeper_required);
  assert.equal(result.capability.approval_chain_required, capabilitySeed.approval_chain_required);
  assert.equal(state.capabilityRows.length, 1);
}

async function testSeedIsIdempotentAndHashIsStable() {
  const { prisma, state } = createMockPrisma();
  const service = new ModuleRegistryService(prisma as never);

  const first = await service.seedCoreFoundation(prisma as never);
  const second = await service.seedCoreFoundation(prisma as never);

  assert.equal(state.moduleRows.length, 1);
  assert.equal(state.capabilityRows.length, 1);
  assert.equal(second.module.manifest_hash, first.module.manifest_hash);
  assert.equal(
    state.calls.filter((call) => call.fn === 'moduleRegistryEntry.upsert').length,
    2,
  );
  assert.equal(
    state.calls.filter((call) => call.fn === 'capability.upsert').length,
    2,
  );
}

async function testSeedUpdatesOnlyDeterministicFields() {
  const { prisma, state } = createMockPrisma();
  state.moduleRows.push({
    module_key: 'core.access',
    display_name: 'Old Name',
    version: '0.0.0',
    status: 'disabled',
    manifest_hash: 'old',
  });
  state.capabilityRows.push({
    key: 'access.policy.manage',
    module_key: 'old.module',
    description: 'Old description',
    risk_level: 'low',
    gatekeeper_required: false,
    approval_chain_required: true,
  });
  const service = new ModuleRegistryService(prisma as never);

  const result = await service.seedCoreFoundation(prisma as never);

  assert.equal(state.moduleRows.length, 1);
  assert.equal(state.capabilityRows.length, 1);
  assert.equal(result.module.display_name, 'Access Core');
  assert.equal(result.module.version, '0.1.0');
  assert.equal(result.module.status, 'available');
  assert.equal(result.capability.module_key, 'core.access');
  assert.equal(result.capability.risk_level, 'high');
}

async function testListModulesReturnsSeededCoreModuleOnly() {
  const { prisma, state } = createMockPrisma();
  const service = new ModuleRegistryService(prisma as never);
  const controller = new ModuleRegistryController(service);

  await service.seedCoreFoundation(prisma as never);
  state.moduleRows.push({
    module_key: 'lead.desk',
    display_name: 'Lead Desk',
    version: '0.0.0',
    status: 'available',
    manifest_hash: 'future-module-hash',
  });
  const listed = await controller.listModules();

  assert.deepEqual(
    listed.items.map((item) => item.module_key),
    ['core.access'],
  );
  assert.equal(
    listed.items.some((item) => String(item.module_key).startsWith('lead.') || String(item.module_key).startsWith('whatsapp.')),
    false,
  );
  const findManyCall = state.calls.find((call) => call.fn === 'moduleRegistryEntry.findMany');
  assert.deepEqual((findManyCall?.args as ModuleFindManyArgs | undefined)?.where?.module_key?.in, ['core.access']);
}

async function run() {
  await testSeedCreatesCoreAccessModuleAndCapability();
  await testSeedIsIdempotentAndHashIsStable();
  await testSeedUpdatesOnlyDeterministicFields();
  await testListModulesReturnsSeededCoreModuleOnly();

  console.log('module-registry.service tests passed');
}

void run();
