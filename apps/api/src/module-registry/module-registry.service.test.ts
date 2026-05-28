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
  const capabilitySeeds = await loadAccessCoreCapabilitySeedDefinitions();
  const accessPolicySeed = capabilitySeeds.find((seed) => seed.capability_key === 'access.policy.manage');
  const shellSeed = capabilitySeeds.find((seed) => seed.capability_key === 'platform.shell.access');

  assert.equal(result.modules.some((item) => item.module_key === 'core.access'), true);
  const coreModule = result.modules.find((item) => item.module_key === 'core.access');
  assert.equal(coreModule?.display_name, manifest.display_name);
  assert.equal(coreModule?.version, manifest.version);
  assert.equal(coreModule?.status, 'available');
  assert.match(String(coreModule?.manifest_hash), /^[a-f0-9]{64}$/);
  assert.equal(state.moduleRows.length, 3);

  const accessCapability = result.capabilities.find((item) => item.key === 'access.policy.manage');
  assert.equal(accessCapability?.module_key, accessPolicySeed?.module_key);
  assert.equal(accessCapability?.description, 'Manage access policy definitions.');
  assert.equal(accessCapability?.risk_level, accessPolicySeed?.risk_level);
  assert.equal(accessCapability?.gatekeeper_required, accessPolicySeed?.gatekeeper_required);
  assert.equal(accessCapability?.approval_chain_required, accessPolicySeed?.approval_chain_required);
  const shellCapability = result.capabilities.find((item) => item.key === 'platform.shell.access');
  assert.equal(shellCapability?.module_key, shellSeed?.module_key);
  assert.equal(shellCapability?.risk_level, shellSeed?.risk_level);
  assert.equal(shellCapability?.gatekeeper_required, false);
  assert.equal(shellCapability?.approval_chain_required, false);
  assert.equal(state.capabilityRows.length >= 5, true);
}

async function testSeedIsIdempotentAndHashIsStable() {
  const { prisma, state } = createMockPrisma();
  const service = new ModuleRegistryService(prisma as never);

  const first = await service.seedCoreFoundation(prisma as never);
  const second = await service.seedCoreFoundation(prisma as never);

  assert.equal(state.moduleRows.length, 3);
  assert.equal(state.capabilityRows.length >= 5, true);
  const firstCore = first.modules.find((item) => item.module_key === 'core.access');
  const secondCore = second.modules.find((item) => item.module_key === 'core.access');
  assert.equal(secondCore?.manifest_hash, firstCore?.manifest_hash);
  assert.equal(
    state.calls.filter((call) => call.fn === 'moduleRegistryEntry.upsert').length >= 6,
    true,
  );
  assert.equal(
    state.calls.filter((call) => call.fn === 'capability.upsert').length >= 10,
    true,
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

  assert.equal(state.moduleRows.length, 3);
  assert.equal(state.capabilityRows.length >= 5, true);
  const module = result.modules.find((item) => item.module_key === 'core.access');
  assert.equal(module?.display_name, 'Access Core');
  assert.equal(module?.version, '0.1.0');
  assert.equal(module?.status, 'available');
  const capability = result.capabilities.find((item) => item.key === 'access.policy.manage');
  assert.equal(capability?.module_key, 'core.access');
  assert.equal(capability?.risk_level, 'high');
}

async function testListModulesReturnsSeededCoreModuleOnly() {
  const { prisma, state } = createMockPrisma();
  const service = new ModuleRegistryService(prisma as never);
  const controller = new ModuleRegistryController(service);

  await service.seedCoreFoundation(prisma as never);
  state.moduleRows.push({
    module_key: 'whatsapp.stub',
    display_name: 'WhatsApp Stub',
    version: '0.0.0',
    status: 'available',
    manifest_hash: 'future-module-hash',
  });
  const listed = await controller.listModules();

  assert.deepEqual(
    listed.items.map((item) => item.module_key),
    ['core.access', 'engagement.gateway', 'lead.desk'],
  );
  assert.equal(listed.items.some((item) => String(item.module_key).startsWith('whatsapp.')), false);
  const findManyCall = state.calls.find((call) => call.fn === 'moduleRegistryEntry.findMany');
  assert.deepEqual(
    (findManyCall?.args as ModuleFindManyArgs | undefined)?.where?.module_key?.in,
    ['core.access', 'engagement.gateway', 'lead.desk'],
  );
}

async function run() {
  await testSeedCreatesCoreAccessModuleAndCapability();
  await testSeedIsIdempotentAndHashIsStable();
  await testSeedUpdatesOnlyDeterministicFields();
  await testListModulesReturnsSeededCoreModuleOnly();

  console.log('module-registry.service tests passed');
}

void run();
