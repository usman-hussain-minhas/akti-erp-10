import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  loadRegisteredRuntimeModuleKeys,
  ModuleRegistryService,
} from './module-registry.service';
import type { PrismaService } from '../prisma/prisma.service';

type FindManyInput = {
  where: {
    module_key: {
      in: string[];
    };
  };
};

type MockPrisma = PrismaService & {
  findManyInputs: FindManyInput[];
};

function createMockPrisma(): MockPrisma {
  const findManyInputs: FindManyInput[] = [];

  return {
    findManyInputs,
    moduleRegistryEntry: {
      findMany: async (input: FindManyInput) => {
        findManyInputs.push(input);
        return input.where.module_key.in.map((moduleKey) => ({
          module_key: moduleKey,
          display_name: moduleKey,
          version: '0.1.0',
          status: 'available',
          manifest_hash: `hash-${moduleKey}`,
        }));
      },
    },
  } as unknown as MockPrisma;
}

async function testRegisteredModuleKeysAreDerivedFromRuntimeManifests() {
  const keys = await loadRegisteredRuntimeModuleKeys();

  assert.deepEqual(keys, ['core.access', 'engagement.gateway', 'lead.desk']);
}

async function testListModulesUsesManifestDerivedKeys() {
  const prisma = createMockPrisma();
  const service = new ModuleRegistryService(prisma);

  const response = await service.listModules();

  assert.deepEqual(
    prisma.findManyInputs[0].where.module_key.in,
    ['core.access', 'engagement.gateway', 'lead.desk'],
  );
  assert.deepEqual(
    response.items.map((item) => item.module_key),
    ['core.access', 'engagement.gateway', 'lead.desk'],
  );
}

function testPhase2AllowlistConstantWasRemoved() {
  const source = readFileSync('src/module-registry/module-registry.service.ts', 'utf8');

  assert.equal(source.includes('PHASE_2_MODULE_REGISTRY_ALLOWLIST'), false);
}

async function run() {
  await testRegisteredModuleKeysAreDerivedFromRuntimeManifests();
  await testListModulesUsesManifestDerivedKeys();
  testPhase2AllowlistConstantWasRemoved();

  console.log('P5B-010b module registry allowlist replacement tests passed.');
}

void run();
