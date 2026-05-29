import assert from 'node:assert/strict';

import { ConflictException } from '@nestjs/common';

import { ModuleRegistryService, type RuntimeModuleManifest } from './module-registry.service';

type MockState = {
  capabilityRows: Array<Record<string, unknown>>;
  calls: Array<{ fn: string; args: unknown }>;
};

function createMockPrisma(seedCapabilities: Array<Record<string, unknown>> = []) {
  const state: MockState = {
    capabilityRows: [...seedCapabilities],
    calls: [],
  };

  const prisma = {
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

function manifest(overrides?: Partial<RuntimeModuleManifest>): RuntimeModuleManifest {
  return {
    module_key: 'platform.fixture',
    display_name: 'Platform Fixture',
    version: '0.1.0',
    capabilities: [
      {
        key: 'platform.fixture.manage',
        module_key: 'platform.fixture',
        description: 'Manage the platform fixture lifecycle boundary.',
        risk_level: 'high',
        gatekeeper_required: true,
        approval_chain_required: false,
      },
      {
        key: 'platform.fixture.read',
        module_key: 'platform.fixture',
        description: 'Read the platform fixture state.',
        risk_level: 'low',
        gatekeeper_required: false,
        approval_chain_required: false,
      },
    ],
    permissions: [
      {
        key: 'platform.fixture.manage',
        allowed_scope_types: ['organization'],
      },
      {
        key: 'platform.fixture.read',
        allowed_scope_types: ['organization', 'own_record'],
      },
    ],
    gatekeeper_hooks: [
      {
        key: 'platform.fixture.manage.preflight',
        capability_key: 'platform.fixture.manage',
        required: true,
      },
    ],
    ...overrides,
  };
}

async function testRegistersCapabilityContributionsFromManifest() {
  const { prisma, state } = createMockPrisma();
  const service = new ModuleRegistryService(prisma as never);

  const result = await service.registerCapabilityContributions(manifest(), prisma as never);

  assert.equal(result.module_key, 'platform.fixture');
  assert.equal(result.registered_count, 2);
  assert.match(result.manifest_hash, /^[a-f0-9]{64}$/);
  assert.deepEqual(
    result.capabilities.map((capability) => capability.key),
    ['platform.fixture.manage', 'platform.fixture.read'],
  );
  assert.deepEqual(
    result.capabilities.find((capability) => capability.key === 'platform.fixture.read')?.allowed_scope_types,
    ['organization', 'own_record'],
  );
  assert.equal(state.capabilityRows.length, 2);
  assert.equal(
    state.capabilityRows.some(
      (row) =>
        row.key === 'platform.fixture.manage' &&
        row.module_key === 'platform.fixture' &&
        row.risk_level === 'high' &&
        row.gatekeeper_required === true,
    ),
    true,
  );
  assert.equal(state.calls.filter((call) => call.fn === 'capability.upsert').length, 2);
}

async function testRegistrationUpdatesOnlyCapabilityFields() {
  const { prisma, state } = createMockPrisma([
    {
      key: 'platform.fixture.read',
      module_key: 'old.module',
      description: 'Old description',
      risk_level: 'medium',
      gatekeeper_required: true,
      approval_chain_required: true,
    },
  ]);
  const service = new ModuleRegistryService(prisma as never);

  await service.registerCapabilityContributions(manifest(), prisma as never);

  const readCapability = state.capabilityRows.find((row) => row.key === 'platform.fixture.read');
  assert.equal(readCapability?.module_key, 'platform.fixture');
  assert.equal(readCapability?.description, 'Read the platform fixture state.');
  assert.equal(readCapability?.risk_level, 'low');
  assert.equal(readCapability?.gatekeeper_required, false);
  assert.equal(readCapability?.approval_chain_required, false);
}

async function testRegistrationRejectsUnsafeOrIncompleteContributions() {
  const { prisma } = createMockPrisma();
  const service = new ModuleRegistryService(prisma as never);

  await assert.rejects(
    () =>
      service.registerCapabilityContributions(
        manifest({
          permissions: [
            {
              key: 'platform.fixture.read',
              allowed_scope_types: ['organization'],
            },
          ],
        }),
        prisma as never,
      ),
    ConflictException,
  );

  await assert.rejects(
    () =>
      service.registerCapabilityContributions(
        manifest({
          gatekeeper_hooks: [],
        }),
        prisma as never,
      ),
    ConflictException,
  );

  await assert.rejects(
    () =>
      service.registerCapabilityContributions(
        manifest({
          capabilities: [
            {
              key: 'platform.fixture.manage',
              module_key: 'other.module',
              description: 'Wrong module boundary.',
              risk_level: 'high',
              gatekeeper_required: true,
              approval_chain_required: false,
            },
          ],
        }),
        prisma as never,
      ),
    ConflictException,
  );
}

async function run() {
  await testRegistersCapabilityContributionsFromManifest();
  await testRegistrationUpdatesOnlyCapabilityFields();
  await testRegistrationRejectsUnsafeOrIncompleteContributions();

  console.log('P5B-015a capability contribution registration tests passed.');
}

void run();
