import assert from 'node:assert/strict';

import { ConflictException } from '@nestjs/common';

import {
  assertAccessCoreSeedBoundary,
  loadAccessCoreCapabilitySeedDefinitions,
  loadAccessCoreModuleManifest,
  ModuleRegistryService,
} from './module-registry.service';

type MockState = {
  moduleRows: Array<Record<string, unknown>>;
  capabilityRows: Array<Record<string, unknown>>;
};

type Seed = Awaited<ReturnType<typeof loadAccessCoreCapabilitySeedDefinitions>>[number];

function createMockPrisma() {
  const state: MockState = {
    moduleRows: [],
    capabilityRows: [],
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

function replaceSeed(seeds: Seed[], capabilityKey: string) {
  return seeds.map((seed) =>
    seed.capability_key === 'platform.shell.access'
      ? {
          ...seed,
          capability_key: capabilityKey,
        }
      : seed,
  );
}

async function testBoundaryAcceptsApprovedAccessCoreSeedSet() {
  const manifest = await loadAccessCoreModuleManifest();
  const seeds = await loadAccessCoreCapabilitySeedDefinitions();

  assert.doesNotThrow(() => assertAccessCoreSeedBoundary(manifest, seeds));
  assert.deepEqual(
    seeds.map((seed) => seed.capability_key).sort(),
    ['access.policy.manage', 'platform.shell.access'],
  );
}

async function testBoundaryRejectsUnknownDuplicateAndMalformedSeeds() {
  const manifest = await loadAccessCoreModuleManifest();
  const seeds = await loadAccessCoreCapabilitySeedDefinitions();
  const shellSeed = seeds.find((seed) => seed.capability_key === 'platform.shell.access');
  const policySeed = seeds.find((seed) => seed.capability_key === 'access.policy.manage');

  assert.ok(shellSeed);
  assert.ok(policySeed);

  assert.throws(
    () => assertAccessCoreSeedBoundary(manifest, replaceSeed(seeds, 'ai.provider.execute')),
    ConflictException,
  );
  assert.throws(
    () => assertAccessCoreSeedBoundary(manifest, [{ ...policySeed }, { ...policySeed }]),
    ConflictException,
  );
  assert.throws(
    () =>
      assertAccessCoreSeedBoundary(manifest, [
        policySeed,
        {
          ...shellSeed,
          module_key: '',
        },
      ]),
    ConflictException,
  );
  assert.throws(
    () => assertAccessCoreSeedBoundary(manifest, [policySeed]),
    ConflictException,
  );
}

async function testSeedCoreFoundationPersistsShellAccessWithoutPolicyBypass() {
  const { prisma, state } = createMockPrisma();
  const service = new ModuleRegistryService(prisma as never);

  const result = await service.seedCoreFoundation(prisma as never);
  const shellCapability = result.capabilities.find((item) => item.key === 'platform.shell.access');
  const policyCapability = result.capabilities.find((item) => item.key === 'access.policy.manage');

  assert.ok(shellCapability);
  assert.ok(policyCapability);
  assert.equal(shellCapability.module_key, 'core.access');
  assert.equal(shellCapability.risk_level, 'low');
  assert.equal(shellCapability.gatekeeper_required, false);
  assert.equal(shellCapability.approval_chain_required, false);
  assert.equal(policyCapability.risk_level, 'high');
  assert.equal(policyCapability.gatekeeper_required, true);
  assert.notEqual(shellCapability.key, policyCapability.key);
  assert.equal(
    state.capabilityRows.some((row) => row.key === 'platform.shell.access'),
    true,
  );
}

async function run() {
  await testBoundaryAcceptsApprovedAccessCoreSeedSet();
  await testBoundaryRejectsUnknownDuplicateAndMalformedSeeds();
  await testSeedCoreFoundationPersistsShellAccessWithoutPolicyBypass();

  console.log('P5B-004b Access Core seed-boundary generalization tests passed.');
}

void run();
