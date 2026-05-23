import assert from 'node:assert/strict';

import { ConflictException } from '@nestjs/common';

import { OrganizationSetupService } from './organization-setup.service';

type MockState = {
  outboxCalls: Array<Record<string, unknown>>;
  transactionOptions: unknown[];
};

function createMocks(options?: { organizationCount?: number }) {
  const state: MockState = {
    outboxCalls: [],
    transactionOptions: [],
  };

  const tx = {
    organization: {
      count: async () => options?.organizationCount ?? 0,
      create: async ({ data }: { data: Record<string, unknown> }) => ({
        id: 'org-1',
        slug: data.slug,
        display_name: data.display_name,
        status: data.status,
        created_at: new Date('2026-05-23T00:00:00.000Z'),
        updated_at: new Date('2026-05-23T00:00:00.000Z'),
      }),
    },
    organizationDomain: {
      create: async ({ data }: { data: Record<string, unknown> }) => ({
        id: 'domain-1',
        organization_id: data.organization_id,
        domain: data.domain,
        is_primary: data.is_primary,
        verified_at: data.verified_at,
      }),
    },
  };

  const prisma = {
    $transaction: async <T>(fn: (txArg: typeof tx) => Promise<T>, optionsArg: unknown) => {
      state.transactionOptions.push(optionsArg);
      return fn(tx);
    },
  };

  const eventOutboxService = {
    recordMutation: async (_db: unknown, input: Record<string, unknown>) => {
      state.outboxCalls.push(input);
      return { written: true as const };
    },
  };

  return { prisma, eventOutboxService, state };
}

async function testSetupWritesOutbox() {
  const { prisma, eventOutboxService, state } = createMocks();
  const service = new OrganizationSetupService(prisma as never, eventOutboxService as never);

  const result = await service.bootstrapSetup({
    slug: 'org-one',
    display_name: 'Org One',
    status: 'active',
    domain: 'example.org',
    is_primary: true,
  });

  assert.equal(result.setup_state, 'completed');
  assert.equal(state.outboxCalls.length, 1);
  assert.deepEqual(state.outboxCalls[0], {
    organization_id: 'org-1',
    action_key: 'organization.setup.completed',
    entity_type: 'organization',
    entity_id: 'org-1',
    actor_user_id: null,
  });
}

async function testSetupConflictSkipsOutbox() {
  const { prisma, eventOutboxService, state } = createMocks({ organizationCount: 1 });
  const service = new OrganizationSetupService(prisma as never, eventOutboxService as never);

  await assert.rejects(
    service.bootstrapSetup({
      slug: 'org-one',
      display_name: 'Org One',
      status: 'active',
      domain: 'example.org',
      is_primary: true,
    }),
    (error: unknown) => {
      assert.ok(error instanceof ConflictException);
      return true;
    },
  );

  assert.equal(state.outboxCalls.length, 0);
}

async function testSetupKeepsSerializableIsolation() {
  const { prisma, eventOutboxService, state } = createMocks();
  const service = new OrganizationSetupService(prisma as never, eventOutboxService as never);

  await service.bootstrapSetup({
    slug: 'org-one',
    display_name: 'Org One',
    status: 'active',
    domain: 'example.org',
    is_primary: true,
  });

  assert.equal(state.transactionOptions.length, 1);
  assert.deepEqual(state.transactionOptions[0], { isolationLevel: 'Serializable' });
}

async function run() {
  await testSetupWritesOutbox();
  await testSetupConflictSkipsOutbox();
  await testSetupKeepsSerializableIsolation();

  console.log('organization-setup.service tests passed');
}

void run();
