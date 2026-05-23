import assert from 'node:assert/strict';

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

import {
  GatekeeperPreflightService,
  type GatekeeperPreflightInput,
} from '../gatekeeper/gatekeeper-preflight.service';
import {
  loadAccessCoreCapabilitySeedDefinitions,
  ModuleRegistryService,
} from '../module-registry/module-registry.service';
import { AuditLogService } from '../platform-observability/audit-log.service';
import { EventOutboxService } from '../platform-observability/event-outbox.service';
import { AccessCoreService } from './access-core.service';

function prismaError(code: string) {
  return { code };
}

type MockState = {
  calls: Array<{ fn: string; args: unknown }>;
  organizationDomains: Array<Record<string, unknown>>;
  moduleRows: Array<Record<string, unknown>>;
  users: Array<Record<string, unknown>>;
  groups: Array<Record<string, unknown>>;
  memberships: Array<Record<string, unknown>>;
  assignments: Array<Record<string, unknown>>;
  capabilities: Array<Record<string, unknown>>;
  auditLogs: Array<Record<string, unknown>>;
  outboxEntries: Array<Record<string, unknown>>;
};

type MockGatekeeperPreflight = GatekeeperPreflightService & {
  calls: GatekeeperPreflightInput[];
};

function cloneRows(rows: Array<Record<string, unknown>>) {
  return rows.map((row) => ({ ...row }));
}

function matchesOptionalFilter(value: unknown, filter: unknown) {
  if (filter === undefined) {
    return true;
  }

  if (
    typeof filter === 'object' &&
    filter !== null &&
    'in' in filter &&
    Array.isArray((filter as { in?: unknown }).in)
  ) {
    return (filter as { in: Array<unknown> }).in.includes(value);
  }

  return value === filter;
}

function createMockPrisma(overrides?: {
  userCreateError?: unknown;
  groupCreateError?: unknown;
  membershipCreateError?: unknown;
  assignmentCreateError?: unknown;
  auditCreateError?: unknown;
}) {
  const state: MockState = {
    calls: [],
    organizationDomains: [
      {
        id: 'domain-1',
        organization_id: 'org-1',
        domain: 'example.org',
        is_primary: true,
        verified_at: null,
      },
      {
        id: 'domain-2',
        organization_id: 'org-2',
        domain: 'foreign.example.org',
        is_primary: true,
        verified_at: null,
      },
    ],
    moduleRows: [],
    users: [
      {
        id: 'user-1',
        organization_id: 'org-1',
        email: 'user@example.org',
        display_name: 'User One',
        status: 'active',
        primary_unit_id: null,
      },
      {
        id: 'user-2',
        organization_id: 'org-1',
        email: 'user2@example.org',
        display_name: 'User Two',
        status: 'active',
        primary_unit_id: null,
      },
      {
        id: 'actor-1',
        organization_id: 'org-1',
        email: 'actor@example.org',
        display_name: 'Actor One',
        status: 'active',
        primary_unit_id: null,
      },
      {
        id: 'actor-foreign',
        organization_id: 'org-2',
        email: 'actor.foreign@example.org',
        display_name: 'Actor Foreign',
        status: 'active',
        primary_unit_id: null,
      },
    ],
    groups: [
      {
        id: 'group-1',
        organization_id: 'org-1',
        key: 'ops',
        label: 'Ops',
        status: 'active',
      },
      {
        id: 'group-2',
        organization_id: 'org-1',
        key: 'support',
        label: 'Support',
        status: 'active',
      },
    ],
    memberships: [
      {
        id: 'membership-1',
        organization_id: 'org-1',
        user_id: 'user-1',
        group_id: 'group-1',
        assigned_at: new Date('2026-01-01T00:00:00.000Z'),
      },
      {
        id: 'membership-actor-1',
        organization_id: 'org-1',
        user_id: 'actor-1',
        group_id: 'group-1',
        assigned_at: new Date('2026-01-01T00:00:00.000Z'),
      },
    ],
    assignments: [
      {
        id: 'assignment-1',
        organization_id: 'org-1',
        group_id: 'group-1',
        capability_key: 'access.policy.manage',
        scope_type: 'organization',
        scope_unit_id: null,
      },
    ],
    capabilities: [
      {
        key: 'access.policy.manage',
        module_key: 'core.access',
        description: 'Manage access policy definitions.',
        risk_level: 'high',
        gatekeeper_required: true,
        approval_chain_required: false,
      },
    ],
    auditLogs: [
      {
        id: 'audit-1',
        organization_id: 'org-1',
        actor_user_id: 'user-1',
        action_key: 'seed.action',
        entity_type: 'seed.entity',
        entity_id: 'seed-1',
        metadata: {},
      },
    ],
    outboxEntries: [],
  };

  const prisma = {
    $transaction: async <T>(fn: (tx: unknown) => Promise<T>) => {
      state.calls.push({ fn: '$transaction', args: {} });

      const snapshot = {
        organizationDomains: cloneRows(state.organizationDomains),
        users: cloneRows(state.users),
        groups: cloneRows(state.groups),
        memberships: cloneRows(state.memberships),
        assignments: cloneRows(state.assignments),
        auditLogs: cloneRows(state.auditLogs),
        outboxEntries: cloneRows(state.outboxEntries),
      };

      try {
        return await fn(prisma);
      } catch (error) {
        state.organizationDomains = snapshot.organizationDomains;
        state.users = snapshot.users;
        state.groups = snapshot.groups;
        state.memberships = snapshot.memberships;
        state.assignments = snapshot.assignments;
        state.auditLogs = snapshot.auditLogs;
        state.outboxEntries = snapshot.outboxEntries;
        throw error;
      }
    },
    organization: {
      findUnique: async ({ where }: { where: { id: string } }) => {
        state.calls.push({ fn: 'organization.findUnique', args: where });
        return where.id === 'org-1' ? { id: 'org-1' } : null;
      },
    },
    organizationDomain: {
      findFirst: async ({ where }: { where: { organization_id: string; domain: string } }) => {
        state.calls.push({ fn: 'organizationDomain.findFirst', args: where });
        return (
          state.organizationDomains.find(
            (item) => item.organization_id === where.organization_id && item.domain === where.domain,
          ) ?? null
        );
      },
    },
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
        const index = state.moduleRows.findIndex((item) => item.module_key === where.module_key);
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
    organizationUnit: {
      findFirst: async ({ where }: { where: { organization_id: string; id: string } }) => {
        state.calls.push({ fn: 'organizationUnit.findFirst', args: where });
        if (where.organization_id === 'org-1' && where.id === 'unit-1') {
          return { id: 'unit-1' };
        }
        return null;
      },
    },
    user: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        state.calls.push({ fn: 'user.create', args: data });
        if (overrides?.userCreateError) {
          throw overrides.userCreateError;
        }
        const created = {
          id: 'user-new',
          ...data,
        };
        state.users.push(created);
        return created;
      },
      findMany: async ({ where }: { where: Record<string, unknown> }) => {
        state.calls.push({ fn: 'user.findMany', args: where });
        return state.users.filter((item) => item.organization_id === where.organization_id);
      },
      findFirst: async ({ where }: { where: { organization_id: string; id: string } }) => {
        state.calls.push({ fn: 'user.findFirst', args: where });
        return (
          state.users.find(
            (item) => item.organization_id === where.organization_id && item.id === where.id,
          ) ?? null
        );
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: { organization_id: string; id: string };
        data: Record<string, unknown>;
      }) => {
        state.calls.push({ fn: 'user.updateMany', args: { where, data } });
        const userIndex = state.users.findIndex(
          (item) => item.organization_id === where.organization_id && item.id === where.id,
        );
        if (userIndex === -1) {
          return { count: 0 };
        }
        state.users[userIndex] = {
          ...state.users[userIndex],
          ...data,
        };
        return { count: 1 };
      },
      deleteMany: async ({ where }: { where: { organization_id: string; id: string } }) => {
        state.calls.push({ fn: 'user.deleteMany', args: where });
        const originalCount = state.users.length;
        state.users = state.users.filter(
          (item) => !(item.organization_id === where.organization_id && item.id === where.id),
        );
        return { count: originalCount === state.users.length ? 0 : 1 };
      },
    },
    group: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        state.calls.push({ fn: 'group.create', args: data });
        if (overrides?.groupCreateError) {
          throw overrides.groupCreateError;
        }
        const created = {
          id: 'group-new',
          ...data,
        };
        state.groups.push(created);
        return created;
      },
      findMany: async ({ where }: { where: Record<string, unknown> }) => {
        state.calls.push({ fn: 'group.findMany', args: where });
        return state.groups.filter((item) => {
          if (item.organization_id !== where.organization_id) {
            return false;
          }
          return matchesOptionalFilter(item.id, where.id);
        });
      },
      findFirst: async ({ where }: { where: { organization_id: string; id: string } }) => {
        state.calls.push({ fn: 'group.findFirst', args: where });
        return (
          state.groups.find(
            (item) => item.organization_id === where.organization_id && item.id === where.id,
          ) ?? null
        );
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: { organization_id: string; id: string };
        data: Record<string, unknown>;
      }) => {
        state.calls.push({ fn: 'group.updateMany', args: { where, data } });
        const groupIndex = state.groups.findIndex(
          (item) => item.organization_id === where.organization_id && item.id === where.id,
        );
        if (groupIndex === -1) {
          return { count: 0 };
        }
        state.groups[groupIndex] = {
          ...state.groups[groupIndex],
          ...data,
        };
        return { count: 1 };
      },
      deleteMany: async ({ where }: { where: { organization_id: string; id: string } }) => {
        state.calls.push({ fn: 'group.deleteMany', args: where });
        const originalCount = state.groups.length;
        state.groups = state.groups.filter(
          (item) => !(item.organization_id === where.organization_id && item.id === where.id),
        );
        return { count: originalCount === state.groups.length ? 0 : 1 };
      },
    },
    userGroup: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        state.calls.push({ fn: 'userGroup.create', args: data });
        if (overrides?.membershipCreateError) {
          throw overrides.membershipCreateError;
        }
        const created = { id: 'membership-new', assigned_at: new Date('2026-01-02T00:00:00.000Z'), ...data };
        state.memberships.push(created);
        return created;
      },
      findMany: async ({ where }: { where: Record<string, unknown> }) => {
        state.calls.push({ fn: 'userGroup.findMany', args: where });
        return state.memberships.filter((item) => {
          if (item.organization_id !== where.organization_id) {
            return false;
          }
          if (!matchesOptionalFilter(item.user_id, where.user_id)) {
            return false;
          }
          return matchesOptionalFilter(item.group_id, where.group_id);
        });
      },
      findFirst: async ({ where }: { where: { organization_id: string; id: string } }) => {
        state.calls.push({ fn: 'userGroup.findFirst', args: where });
        return (
          state.memberships.find(
            (item) => item.organization_id === where.organization_id && item.id === where.id,
          ) ?? null
        );
      },
      deleteMany: async ({ where }: { where: { organization_id: string; id: string } }) => {
        state.calls.push({ fn: 'userGroup.deleteMany', args: where });
        const originalCount = state.memberships.length;
        state.memberships = state.memberships.filter(
          (item) => !(item.organization_id === where.organization_id && item.id === where.id),
        );
        return { count: originalCount === state.memberships.length ? 0 : 1 };
      },
      count: async ({ where }: { where: Record<string, unknown> }) => {
        state.calls.push({ fn: 'userGroup.count', args: where });
        return state.memberships.filter((item) => {
          if (where.organization_id !== item.organization_id) {
            return false;
          }
          if (where.user_id && where.user_id !== item.user_id) {
            return false;
          }
          if (where.group_id && where.group_id !== item.group_id) {
            return false;
          }
          return true;
        }).length;
      },
    },
    groupCapability: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        state.calls.push({ fn: 'groupCapability.create', args: data });
        if (overrides?.assignmentCreateError) {
          throw overrides.assignmentCreateError;
        }
        const created = { id: 'assignment-new', ...data };
        state.assignments.push(created);
        return created;
      },
      findMany: async ({ where }: { where: Record<string, unknown> }) => {
        state.calls.push({ fn: 'groupCapability.findMany', args: where });
        return state.assignments.filter((item) => item.organization_id === where.organization_id);
      },
      findFirst: async ({ where }: { where: Record<string, unknown> }) => {
        state.calls.push({ fn: 'groupCapability.findFirst', args: where });
        return (
          state.assignments.find((item) => {
            if (item.organization_id !== where.organization_id) {
              return false;
            }
            if (!matchesOptionalFilter(item.id, where.id)) {
              return false;
            }
            if (!matchesOptionalFilter(item.group_id, where.group_id)) {
              return false;
            }
            if (!matchesOptionalFilter(item.capability_key, where.capability_key)) {
              return false;
            }
            if (!matchesOptionalFilter(item.scope_type, where.scope_type)) {
              return false;
            }
            return matchesOptionalFilter(item.scope_unit_id ?? null, where.scope_unit_id);
          }) ?? null
        );
      },
      deleteMany: async ({ where }: { where: { organization_id: string; id: string } }) => {
        state.calls.push({ fn: 'groupCapability.deleteMany', args: where });
        const originalCount = state.assignments.length;
        state.assignments = state.assignments.filter(
          (item) => !(item.organization_id === where.organization_id && item.id === where.id),
        );
        return { count: originalCount === state.assignments.length ? 0 : 1 };
      },
      count: async ({ where }: { where: Record<string, unknown> }) => {
        state.calls.push({ fn: 'groupCapability.count', args: where });
        return state.assignments.filter((item) => {
          if (where.organization_id !== item.organization_id) {
            return false;
          }
          if (where.group_id && where.group_id !== item.group_id) {
            return false;
          }
          return true;
        }).length;
      },
    },
    capability: {
      findMany: async () => {
        state.calls.push({ fn: 'capability.findMany', args: {} });
        return state.capabilities;
      },
      findUnique: async ({ where }: { where: { key: string } }) => {
        state.calls.push({ fn: 'capability.findUnique', args: where });
        return state.capabilities.find((item) => item.key === where.key) ?? null;
      },
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
        const index = state.capabilities.findIndex((item) => item.key === where.key);
        if (index === -1) {
          state.capabilities.push({ ...create });
          return { ...create };
        }

        state.capabilities[index] = {
          ...state.capabilities[index],
          ...update,
        };
        return { ...state.capabilities[index] };
      },
    },
    auditLog: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        state.calls.push({ fn: 'auditLog.create', args: data });
        if (overrides?.auditCreateError) {
          throw overrides.auditCreateError;
        }
        state.auditLogs.push({ id: `audit-${state.auditLogs.length + 1}`, ...data });
        return data;
      },
      count: async ({ where }: { where: Record<string, unknown> }) => {
        state.calls.push({ fn: 'auditLog.count', args: where });
        return state.auditLogs.filter((item) => {
          if (where.organization_id !== item.organization_id) {
            return false;
          }
          if (where.actor_user_id && where.actor_user_id !== item.actor_user_id) {
            return false;
          }
          return true;
        }).length;
      },
    },
    eventOutbox: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        state.calls.push({ fn: 'eventOutbox.create', args: data });
        state.outboxEntries.push({ id: `outbox-${state.outboxEntries.length + 1}`, ...data });
        return data;
      },
    },
  };

  return { prisma, state };
}

function createMockGatekeeperPreflight(
  handler?: (input: GatekeeperPreflightInput) => Promise<void> | void,
): MockGatekeeperPreflight {
  const gatekeeper = {
    calls: [] as GatekeeperPreflightInput[],
    async requireAllow(input: GatekeeperPreflightInput) {
      gatekeeper.calls.push(input);
      await handler?.(input);
      return {
        decision: 'allow' as const,
      };
    },
  };

  return gatekeeper as MockGatekeeperPreflight;
}

function createServiceWithGatekeeper(
  prisma: unknown,
  handler?: (input: GatekeeperPreflightInput) => Promise<void> | void,
) {
  const auditLogService = new AuditLogService();
  const eventOutboxService = new EventOutboxService();
  const gatekeeper = createMockGatekeeperPreflight(handler);
  const service = new AccessCoreService(
    prisma as never,
    auditLogService,
    eventOutboxService,
    gatekeeper,
  );

  return { service, gatekeeper };
}

function createService(prisma: unknown) {
  return createServiceWithGatekeeper(prisma).service;
}

const WRITE_CALLS = new Set([
  'user.create',
  'user.updateMany',
  'user.deleteMany',
  'group.create',
  'group.updateMany',
  'group.deleteMany',
  'userGroup.create',
  'userGroup.deleteMany',
  'groupCapability.create',
  'groupCapability.deleteMany',
  'auditLog.create',
  'eventOutbox.create',
]);

function writeCalls(state: MockState) {
  return state.calls.filter((call) => WRITE_CALLS.has(call.fn));
}

function hasCall(state: MockState, fn: string) {
  return state.calls.some((call) => call.fn === fn);
}

function hasCallWhere(
  state: MockState,
  fn: string,
  predicate: (args: Record<string, unknown>) => boolean,
) {
  return state.calls.some((call) => {
    if (call.fn !== fn || typeof call.args !== 'object' || call.args === null) {
      return false;
    }

    return predicate(call.args as Record<string, unknown>);
  });
}

function addActorWithoutAccessPolicy(state: MockState) {
  state.users.push({
    id: 'actor-without-policy',
    organization_id: 'org-1',
    email: 'actor.without.policy@example.org',
    display_name: 'Actor Without Policy',
    status: 'active',
    primary_unit_id: null,
  });
  state.memberships.push({
    id: 'membership-actor-without-policy',
    organization_id: 'org-1',
    user_id: 'actor-without-policy',
    group_id: 'group-2',
    assigned_at: new Date('2026-01-01T00:00:00.000Z'),
  });
}

async function testUsersCrudAndOrgIsolation() {
  const { prisma, state } = createMockPrisma();
  const service = createService(prisma);

  const created = await service.createUser(
    'org-1',
    {
      email: 'new@example.org',
      display_name: 'New User',
      status: 'active',
      primary_unit_id: 'unit-1',
    },
    'actor-1',
  );
  assert.equal(created.organization_id, 'org-1');

  const listed = await service.listUsers('org-1', 'actor-1');
  assert.equal(Array.isArray(listed.items), true);

  const got = await service.getUser('org-1', 'user-1', 'actor-1');
  assert.equal(got.id, 'user-1');

  const updated = await service.updateUser(
    'org-1',
    'user-1',
    {
      display_name: 'Updated',
    },
    'actor-1',
  );
  assert.equal(updated.display_name, 'Updated');
  const userUpdateManyCall = state.calls.find((call) => call.fn === 'user.updateMany');
  assert.ok(userUpdateManyCall);
  assert.deepEqual((userUpdateManyCall?.args as { where: unknown }).where, {
    organization_id: 'org-1',
    id: 'user-1',
  });

  await assert.rejects(
    service.getUser('org-1', 'missing', 'actor-1'),
    (error: unknown) => {
      assert.ok(error instanceof NotFoundException);
      return true;
    },
  );

  const userFindFirstCall = state.calls.find(
    (call) =>
      call.fn === 'user.findFirst' &&
      (call.args as { organization_id?: string; id?: string }).organization_id === 'org-1' &&
      (call.args as { organization_id?: string; id?: string }).id === 'user-1',
  );
  assert.ok(userFindFirstCall);
  assert.deepEqual(userFindFirstCall?.args, { organization_id: 'org-1', id: 'user-1' });
}

async function testOfficialEmailDomainValidation() {
  const createContext = createMockPrisma();
  const createService = createServiceWithGatekeeper(createContext.prisma).service;

  const created = await createService.createUser(
    'org-1',
    {
      email: 'case@Example.ORG',
      display_name: 'Case Domain',
      status: 'active',
      primary_unit_id: null,
    },
    'actor-1',
  );

  assert.equal(created.organization_id, 'org-1');
  assert.equal(
    hasCallWhere(
      createContext.state,
      'organizationDomain.findFirst',
      (args) => args.organization_id === 'org-1' && args.domain === 'example.org',
    ),
    true,
  );

  const invalidCreateContext = createMockPrisma();
  const invalidCreateService = createServiceWithGatekeeper(invalidCreateContext.prisma).service;
  const initialInvalidCreateUserCount = invalidCreateContext.state.users.length;
  const initialInvalidCreateAuditCount = invalidCreateContext.state.auditLogs.length;

  await assert.rejects(
    invalidCreateService.createUser(
      'org-1',
      {
        email: 'intruder@unregistered.example',
        display_name: 'Invalid Domain',
        status: 'active',
        primary_unit_id: null,
      },
      'actor-1',
    ),
    (error: unknown) => {
      assert.ok(error instanceof BadRequestException);
      assert.equal((error as Error).message, 'email domain must be registered to the organization');
      return true;
    },
  );

  assert.equal(invalidCreateContext.state.users.length, initialInvalidCreateUserCount);
  assert.equal(invalidCreateContext.state.auditLogs.length, initialInvalidCreateAuditCount);
  assert.equal(invalidCreateContext.state.outboxEntries.length, 0);
  assert.equal(hasCall(invalidCreateContext.state, 'user.create'), false);
  assert.deepEqual(writeCalls(invalidCreateContext.state), []);

  const missingDomainContext = createMockPrisma();
  missingDomainContext.state.organizationDomains = [];
  const missingDomainService = createServiceWithGatekeeper(missingDomainContext.prisma).service;

  await assert.rejects(
    missingDomainService.createUser(
      'org-1',
      {
        email: 'missing@example.org',
        display_name: 'Missing Domain',
        status: 'active',
        primary_unit_id: null,
      },
      'actor-1',
    ),
    BadRequestException,
  );

  assert.equal(hasCall(missingDomainContext.state, 'user.create'), false);
  assert.deepEqual(writeCalls(missingDomainContext.state), []);

  const updateContext = createMockPrisma();
  const updateService = createServiceWithGatekeeper(updateContext.prisma).service;

  const updated = await updateService.updateUser(
    'org-1',
    'user-1',
    {
      email: 'changed@example.org',
    },
    'actor-1',
  );

  assert.equal(updated.email, 'changed@example.org');
  assert.equal(
    hasCallWhere(
      updateContext.state,
      'organizationDomain.findFirst',
      (args) => args.organization_id === 'org-1' && args.domain === 'example.org',
    ),
    true,
  );

  const invalidUpdateContext = createMockPrisma();
  const invalidUpdateService = createServiceWithGatekeeper(invalidUpdateContext.prisma).service;
  const originalUser = invalidUpdateContext.state.users.find((user) => user.id === 'user-1');

  await assert.rejects(
    invalidUpdateService.updateUser(
      'org-1',
      'user-1',
      {
        email: 'changed@unregistered.example',
      },
      'actor-1',
    ),
    BadRequestException,
  );

  assert.deepEqual(
    invalidUpdateContext.state.users.find((user) => user.id === 'user-1'),
    originalUser,
  );
  assert.equal(hasCall(invalidUpdateContext.state, 'user.updateMany'), false);
  assert.deepEqual(writeCalls(invalidUpdateContext.state), []);

  const displayOnlyContext = createMockPrisma();
  const displayOnlyService = createServiceWithGatekeeper(displayOnlyContext.prisma).service;
  await displayOnlyService.updateUser(
    'org-1',
    'user-1',
    {
      display_name: 'Display Only',
    },
    'actor-1',
  );

  assert.equal(hasCall(displayOnlyContext.state, 'organizationDomain.findFirst'), false);

  const sameEmailContext = createMockPrisma();
  const sameEmailService = createServiceWithGatekeeper(sameEmailContext.prisma).service;
  await sameEmailService.updateUser(
    'org-1',
    'user-1',
    {
      email: 'user@example.org',
    },
    'actor-1',
  );

  assert.equal(hasCall(sameEmailContext.state, 'organizationDomain.findFirst'), false);
}

async function testDependencySafeDeleteConflicts() {
  const { prisma, state } = createMockPrisma();
  const service = createService(prisma);

  await assert.rejects(
    service.deleteUser('org-1', 'user-1', 'actor-1'),
    (error: unknown) => {
      assert.ok(error instanceof ConflictException);
      return true;
    },
  );

  await assert.rejects(
    service.deleteGroup('org-1', 'group-1', 'actor-1'),
    (error: unknown) => {
      assert.ok(error instanceof ConflictException);
      return true;
    },
  );

  const deletedUser = await service.deleteUser('org-1', 'user-2', 'actor-1');
  assert.equal(deletedUser.deleted, true);
  const userDeleteManyCall = state.calls.find((call) => call.fn === 'user.deleteMany');
  assert.ok(userDeleteManyCall);
  assert.deepEqual(userDeleteManyCall?.args, {
    organization_id: 'org-1',
    id: 'user-2',
  });

  const deletedGroup = await service.deleteGroup('org-1', 'group-2', 'actor-1');
  assert.equal(deletedGroup.deleted, true);
  const groupDeleteManyCall = state.calls.find((call) => call.fn === 'group.deleteMany');
  assert.ok(groupDeleteManyCall);
  assert.deepEqual(groupDeleteManyCall?.args, {
    organization_id: 'org-1',
    id: 'group-2',
  });
}

async function testGroupsCrudAndOrgIsolation() {
  const { prisma, state } = createMockPrisma();
  const service = createService(prisma);

  const created = await service.createGroup(
    'org-1',
    {
      key: 'ops',
      label: 'Ops',
      status: 'active',
    },
    'actor-1',
  );
  assert.equal(created.organization_id, 'org-1');

  const listed = await service.listGroups('org-1', 'actor-1');
  assert.equal(Array.isArray(listed.items), true);

  const got = await service.getGroup('org-1', 'group-1', 'actor-1');
  assert.equal(got.id, 'group-1');

  const updated = await service.updateGroup(
    'org-1',
    'group-1',
    {
      label: 'Updated Group',
    },
    'actor-1',
  );
  assert.equal(updated.label, 'Updated Group');
  const groupUpdateManyCall = state.calls.find((call) => call.fn === 'group.updateMany');
  assert.ok(groupUpdateManyCall);
  assert.deepEqual((groupUpdateManyCall?.args as { where: unknown }).where, {
    organization_id: 'org-1',
    id: 'group-1',
  });

  const groupFindFirstCall = state.calls.find((call) => call.fn === 'group.findFirst');
  assert.ok(groupFindFirstCall);
  assert.deepEqual(groupFindFirstCall?.args, { organization_id: 'org-1', id: 'group-1' });
}

async function testMembershipOrgScopeAndDuplicateConflict() {
  const duplicateMembershipPrisma = createMockPrisma({
    membershipCreateError: prismaError('P2002'),
  });
  const duplicateMembershipService = createService(duplicateMembershipPrisma.prisma);

  await assert.rejects(
    duplicateMembershipService.createMembership(
      'org-1',
      {
        user_id: 'user-1',
        group_id: 'group-1',
      },
      'actor-1',
    ),
    (error: unknown) => {
      assert.ok(error instanceof ConflictException);
      return true;
    },
  );

  const { prisma, state } = createMockPrisma();
  const service = createService(prisma);

  const created = await service.createMembership(
    'org-1',
    {
      user_id: 'user-1',
      group_id: 'group-1',
    },
    'actor-1',
  );
  assert.equal(created.organization_id, 'org-1');

  const listed = await service.listMemberships('org-1', 'actor-1');
  assert.equal(Array.isArray(listed.items), true);

  const deleted = await service.deleteMembership('org-1', 'membership-1', 'actor-1');
  assert.equal(deleted.deleted, true);
  const membershipDeleteManyCall = state.calls.find((call) => call.fn === 'userGroup.deleteMany');
  assert.ok(membershipDeleteManyCall);
  assert.deepEqual(membershipDeleteManyCall?.args, {
    organization_id: 'org-1',
    id: 'membership-1',
  });

  const membershipFindFirstCall = state.calls.find((call) => call.fn === 'userGroup.findFirst');
  assert.ok(membershipFindFirstCall);
  assert.deepEqual(membershipFindFirstCall?.args, { organization_id: 'org-1', id: 'membership-1' });
}

async function testCapabilitySurfaceAndAssignmentValidation() {
  const noCatalog = createMockPrisma();
  noCatalog.state.capabilities = [];
  const noCatalogService = createService(noCatalog.prisma);
  const fallbackCaps = await noCatalogService.listCapabilities();
  const [contractSeed] = await loadAccessCoreCapabilitySeedDefinitions();
  assert.equal(fallbackCaps.items.length > 0, true);
  assert.equal(fallbackCaps.items[0].source, 'contract_seed');
  assert.equal(fallbackCaps.items[0].key, contractSeed.capability_key);
  assert.equal(fallbackCaps.items[0].description, contractSeed.description);

  const { prisma, state } = createMockPrisma();
  const service = createService(prisma);

  await assert.rejects(
    service.createGroupCapabilityAssignment(
      'org-1',
      {
        group_id: 'group-1',
        capability_key: 'access.policy.manage',
        scope_type: 'organization',
        scope_unit_id: 'unit-1',
      },
      'actor-1',
    ),
    (error: unknown) => {
      assert.ok(error instanceof BadRequestException);
      return true;
    },
  );

  await assert.rejects(
    service.createGroupCapabilityAssignment(
      'org-1',
      {
        group_id: 'group-1',
        capability_key: 'access.policy.manage',
        scope_type: 'own_unit',
        scope_unit_id: 'unit-foreign',
      },
      'actor-1',
    ),
    (error: unknown) => {
      assert.ok(error instanceof BadRequestException);
      return true;
    },
  );

  await assert.rejects(
    service.createGroupCapabilityAssignment(
      'org-1',
      {
        group_id: 'group-1',
        capability_key: 'access.unknown',
        scope_type: 'organization',
        scope_unit_id: null,
      },
      'actor-1',
    ),
    (error: unknown) => {
      assert.ok(error instanceof BadRequestException);
      return true;
    },
  );

  const missingDbCapability = createMockPrisma();
  missingDbCapability.state.capabilities = [];
  const missingDbCapabilityService = createService(missingDbCapability.prisma);

  await assert.rejects(
    missingDbCapabilityService.createGroupCapabilityAssignment(
      'org-1',
      {
        group_id: 'group-1',
        capability_key: 'access.policy.manage',
        scope_type: 'organization',
        scope_unit_id: null,
      },
      'actor-1',
    ),
    (error: unknown) => {
      assert.ok(error instanceof ConflictException);
      return true;
    },
  );

  const seededCapabilityContext = createMockPrisma();
  seededCapabilityContext.state.capabilities = [];
  const moduleRegistryService = new ModuleRegistryService(seededCapabilityContext.prisma as never);
  await moduleRegistryService.seedCoreFoundation(seededCapabilityContext.prisma as never);
  const seededCapabilityService = createService(seededCapabilityContext.prisma);
  const seededAssignment = await seededCapabilityService.createGroupCapabilityAssignment(
    'org-1',
    {
      group_id: 'group-1',
      capability_key: 'access.policy.manage',
      scope_type: 'global',
      scope_unit_id: null,
    },
    'actor-1',
  );
  assert.equal(seededAssignment.capability_key, 'access.policy.manage');
  assert.equal(
    hasCallWhere(
      seededCapabilityContext.state,
      'capability.upsert',
      (args) => (args.where as { key?: string }).key === 'access.policy.manage',
    ),
    true,
  );

  const created = await service.createGroupCapabilityAssignment(
    'org-1',
    {
      group_id: 'group-1',
      capability_key: 'access.policy.manage',
      scope_type: 'global',
      scope_unit_id: null,
    },
    'actor-1',
  );
  assert.equal(created.organization_id, 'org-1');

  const listed = await service.listGroupCapabilityAssignments('org-1', 'actor-1');
  assert.equal(Array.isArray(listed.items), true);

  const deleted = await service.deleteGroupCapabilityAssignment('org-1', 'assignment-1', 'actor-1');
  assert.equal(deleted.deleted, true);
  const assignmentDeleteManyCall = state.calls.find((call) => call.fn === 'groupCapability.deleteMany');
  assert.ok(assignmentDeleteManyCall);
  assert.deepEqual(assignmentDeleteManyCall?.args, {
    organization_id: 'org-1',
    id: 'assignment-1',
  });
}

async function testReadOperationsRequireActorBeforeTenantReads() {
  const missingListUsers = createMockPrisma();
  const missingListUsersService = createService(missingListUsers.prisma);
  await assert.rejects(
    missingListUsersService.listUsers('org-1', undefined),
    (error: unknown) => error instanceof BadRequestException,
  );
  assert.equal(hasCall(missingListUsers.state, 'organization.findUnique'), false);
  assert.equal(hasCall(missingListUsers.state, 'user.findMany'), false);

  const blankGetUser = createMockPrisma();
  const blankGetUserService = createService(blankGetUser.prisma);
  await assert.rejects(
    blankGetUserService.getUser('org-1', 'missing-user', ' '),
    (error: unknown) => error instanceof BadRequestException,
  );
  assert.equal(
    hasCallWhere(blankGetUser.state, 'user.findFirst', (args) => args.id === 'missing-user'),
    false,
  );

  const missingListGroups = createMockPrisma();
  const missingListGroupsService = createService(missingListGroups.prisma);
  await assert.rejects(
    missingListGroupsService.listGroups('org-1', undefined),
    (error: unknown) => error instanceof BadRequestException,
  );
  assert.equal(hasCall(missingListGroups.state, 'organization.findUnique'), false);
  assert.equal(hasCall(missingListGroups.state, 'group.findMany'), false);

  const missingGetGroup = createMockPrisma();
  const missingGetGroupService = createService(missingGetGroup.prisma);
  await assert.rejects(
    missingGetGroupService.getGroup('org-1', 'missing-group', undefined),
    (error: unknown) => error instanceof BadRequestException,
  );
  assert.equal(hasCall(missingGetGroup.state, 'group.findFirst'), false);

  const missingListMemberships = createMockPrisma();
  const missingListMembershipsService = createService(missingListMemberships.prisma);
  await assert.rejects(
    missingListMembershipsService.listMemberships('org-1', undefined),
    (error: unknown) => error instanceof BadRequestException,
  );
  assert.equal(hasCall(missingListMemberships.state, 'userGroup.findMany'), false);

  const missingListAssignments = createMockPrisma();
  const missingListAssignmentsService = createService(missingListAssignments.prisma);
  await assert.rejects(
    missingListAssignmentsService.listGroupCapabilityAssignments('org-1', undefined),
    (error: unknown) => error instanceof BadRequestException,
  );
  assert.equal(hasCall(missingListAssignments.state, 'groupCapability.findMany'), false);
}

async function testCrossOrgAndUnauthorizedActorsFailClosedBeforeTenantReads() {
  const crossOrg = createMockPrisma();
  const crossOrgService = createService(crossOrg.prisma);
  await assert.rejects(
    crossOrgService.listUsers('org-1', 'actor-foreign'),
    (error: unknown) => error instanceof BadRequestException,
  );
  assert.equal(hasCall(crossOrg.state, 'organization.findUnique'), false);
  assert.equal(hasCall(crossOrg.state, 'user.findMany'), false);

  const unauthorized = createMockPrisma();
  addActorWithoutAccessPolicy(unauthorized.state);
  const unauthorizedService = createService(unauthorized.prisma);
  await assert.rejects(
    unauthorizedService.getGroup('org-1', 'group-1', 'actor-without-policy'),
    (error: unknown) => error instanceof BadRequestException,
  );
  assert.equal(hasCall(unauthorized.state, 'group.findFirst'), false);

  const unauthorizedList = createMockPrisma();
  addActorWithoutAccessPolicy(unauthorizedList.state);
  const unauthorizedListService = createService(unauthorizedList.prisma);
  await assert.rejects(
    unauthorizedListService.listGroupCapabilityAssignments('org-1', 'actor-without-policy'),
    (error: unknown) => error instanceof BadRequestException,
  );
  assert.equal(hasCall(unauthorizedList.state, 'groupCapability.findMany'), false);
}

async function testGroupCapabilityDuplicateGuardRejectsNullAndExplicitScopesBeforeCreate() {
  const duplicateNullScope = createMockPrisma();
  const duplicateNullScopeService = createService(duplicateNullScope.prisma);
  await assert.rejects(
    duplicateNullScopeService.createGroupCapabilityAssignment(
      'org-1',
      {
        group_id: 'group-1',
        capability_key: 'access.policy.manage',
        scope_type: 'organization',
        scope_unit_id: null,
      },
      'actor-1',
    ),
    (error: unknown) => error instanceof ConflictException,
  );
  assert.equal(hasCall(duplicateNullScope.state, 'groupCapability.create'), false);
  assert.equal(
    hasCallWhere(
      duplicateNullScope.state,
      'groupCapability.findFirst',
      (args) =>
        args.group_id === 'group-1' &&
        args.capability_key === 'access.policy.manage' &&
        args.scope_type === 'organization' &&
        args.scope_unit_id === null,
    ),
    true,
  );

  const duplicateExplicitScope = createMockPrisma();
  duplicateExplicitScope.state.assignments.push({
    id: 'assignment-explicit-scope',
    organization_id: 'org-1',
    group_id: 'group-1',
    capability_key: 'access.policy.manage',
    scope_type: 'own_unit',
    scope_unit_id: 'unit-1',
  });
  const duplicateExplicitScopeService = createService(duplicateExplicitScope.prisma);
  await assert.rejects(
    duplicateExplicitScopeService.createGroupCapabilityAssignment(
      'org-1',
      {
        group_id: 'group-1',
        capability_key: 'access.policy.manage',
        scope_type: 'own_unit',
        scope_unit_id: 'unit-1',
      },
      'actor-1',
    ),
    (error: unknown) => error instanceof ConflictException,
  );
  assert.equal(hasCall(duplicateExplicitScope.state, 'groupCapability.create'), false);
  assert.equal(
    hasCallWhere(
      duplicateExplicitScope.state,
      'groupCapability.findFirst',
      (args) =>
        args.group_id === 'group-1' &&
        args.capability_key === 'access.policy.manage' &&
        args.scope_type === 'own_unit' &&
        args.scope_unit_id === 'unit-1',
    ),
    true,
  );
}

async function testMissingAndBlankActorFailClosedBeforeWrite() {
  const missingActorContext = createMockPrisma();
  const missingActorService = createService(missingActorContext.prisma);
  const initialGroupCount = missingActorContext.state.groups.length;
  const initialAuditCount = missingActorContext.state.auditLogs.length;

  await assert.rejects(
    missingActorService.createGroup(
      'org-1',
      {
        key: 'qa',
        label: 'QA',
        status: 'active',
      },
      undefined,
    ),
    (error: unknown) => {
      assert.ok(error instanceof BadRequestException);
      return true;
    },
  );

  assert.equal(missingActorContext.state.groups.length, initialGroupCount);
  assert.equal(missingActorContext.state.auditLogs.length, initialAuditCount);
  assert.equal(missingActorContext.state.outboxEntries.length, 0);
  assert.deepEqual(writeCalls(missingActorContext.state), []);

  const blankActorContext = createMockPrisma();
  const blankActorService = createService(blankActorContext.prisma);
  const initialUserCount = blankActorContext.state.users.length;

  await assert.rejects(
    blankActorService.createUser(
      'org-1',
      {
        email: 'blank@example.org',
        display_name: 'Blank Actor Test',
        status: 'active',
        primary_unit_id: null,
      },
      '   ',
    ),
    (error: unknown) => {
      assert.ok(error instanceof BadRequestException);
      return true;
    },
  );

  assert.equal(blankActorContext.state.users.length, initialUserCount);
  assert.equal(blankActorContext.state.outboxEntries.length, 0);
  assert.deepEqual(writeCalls(blankActorContext.state), []);
}

async function testMissingActorPreflightRunsBeforeProtectedResourceReads() {
  const missingUpdateActorContext = createMockPrisma();
  const missingUpdateActorService = createService(missingUpdateActorContext.prisma);

  await assert.rejects(
    missingUpdateActorService.updateUser(
      'org-1',
      'missing-user',
      {
        display_name: 'Should Not Matter',
      },
      undefined,
    ),
    (error: unknown) => {
      assert.ok(error instanceof BadRequestException);
      assert.equal(
        (error as Error).message,
        'x-actor-user-id is required for protected Access Core operations',
      );
      return true;
    },
  );

  assert.equal(hasCall(missingUpdateActorContext.state, 'user.findFirst'), false);
  assert.deepEqual(writeCalls(missingUpdateActorContext.state), []);

  const missingMembershipActorContext = createMockPrisma();
  const missingMembershipActorService = createService(missingMembershipActorContext.prisma);

  await assert.rejects(
    missingMembershipActorService.createMembership(
      'org-1',
      {
        user_id: 'missing-user',
        group_id: 'missing-group',
      },
      undefined,
    ),
    (error: unknown) => {
      assert.ok(error instanceof BadRequestException);
      assert.equal(
        (error as Error).message,
        'x-actor-user-id is required for protected Access Core operations',
      );
      return true;
    },
  );

  assert.equal(hasCall(missingMembershipActorContext.state, 'user.findFirst'), false);
  assert.equal(hasCall(missingMembershipActorContext.state, 'group.findFirst'), false);
  assert.deepEqual(writeCalls(missingMembershipActorContext.state), []);

  const missingAssignmentActorContext = createMockPrisma();
  const missingAssignmentActorService = createService(missingAssignmentActorContext.prisma);

  await assert.rejects(
    missingAssignmentActorService.createGroupCapabilityAssignment(
      'org-1',
      {
        group_id: 'missing-group',
        capability_key: 'access.policy.manage',
        scope_type: 'own_unit',
        scope_unit_id: 'missing-unit',
      },
      undefined,
    ),
    (error: unknown) => {
      assert.ok(error instanceof BadRequestException);
      assert.equal(
        (error as Error).message,
        'x-actor-user-id is required for protected Access Core operations',
      );
      return true;
    },
  );

  assert.equal(hasCall(missingAssignmentActorContext.state, 'group.findFirst'), false);
  assert.equal(hasCall(missingAssignmentActorContext.state, 'organizationUnit.findFirst'), false);
  assert.equal(hasCall(missingAssignmentActorContext.state, 'capability.findUnique'), false);
  assert.deepEqual(writeCalls(missingAssignmentActorContext.state), []);
}

async function testInvalidCrossOrgAndUnauthorizedActorsFailClosedBeforeWrite() {
  const invalidActorContext = createMockPrisma();
  const invalidActorService = createService(invalidActorContext.prisma);
  const invalidActorInitialGroupCount = invalidActorContext.state.groups.length;

  await assert.rejects(
    invalidActorService.createGroup(
      'org-1',
      {
        key: 'new-group',
        label: 'New Group',
        status: 'active',
      },
      'actor-missing',
    ),
    (error: unknown) => {
      assert.ok(error instanceof BadRequestException);
      return true;
    },
  );

  assert.equal(invalidActorContext.state.groups.length, invalidActorInitialGroupCount);
  assert.equal(invalidActorContext.state.outboxEntries.length, 0);
  assert.deepEqual(writeCalls(invalidActorContext.state), []);

  const crossOrgActorContext = createMockPrisma();
  const crossOrgActorService = createService(crossOrgActorContext.prisma);
  const crossOrgInitialGroupCount = crossOrgActorContext.state.groups.length;

  await assert.rejects(
    crossOrgActorService.createGroup(
      'org-1',
      {
        key: 'cross-org-test',
        label: 'Cross Org Test',
        status: 'active',
      },
      'actor-foreign',
    ),
    (error: unknown) => {
      assert.ok(error instanceof BadRequestException);
      return true;
    },
  );

  assert.equal(crossOrgActorContext.state.groups.length, crossOrgInitialGroupCount);
  assert.equal(crossOrgActorContext.state.outboxEntries.length, 0);
  assert.deepEqual(writeCalls(crossOrgActorContext.state), []);

  const unauthorizedActorContext = createMockPrisma();
  unauthorizedActorContext.state.users.push({
    id: 'actor-without-policy',
    organization_id: 'org-1',
    email: 'actor.without.policy@example.org',
    display_name: 'Actor Without Policy',
    status: 'active',
    primary_unit_id: null,
  });
  unauthorizedActorContext.state.memberships.push({
    id: 'membership-actor-without-policy',
    organization_id: 'org-1',
    user_id: 'actor-without-policy',
    group_id: 'group-2',
    assigned_at: new Date('2026-01-01T00:00:00.000Z'),
  });
  const unauthorizedActorService = createService(unauthorizedActorContext.prisma);
  const unauthorizedInitialGroupCount = unauthorizedActorContext.state.groups.length;

  await assert.rejects(
    unauthorizedActorService.createGroup(
      'org-1',
      {
        key: 'unauthorized-test',
        label: 'Unauthorized Test',
        status: 'active',
      },
      'actor-without-policy',
    ),
    (error: unknown) => {
      assert.ok(error instanceof BadRequestException);
      return true;
    },
  );

  assert.equal(unauthorizedActorContext.state.groups.length, unauthorizedInitialGroupCount);
  assert.equal(unauthorizedActorContext.state.outboxEntries.length, 0);
  assert.deepEqual(writeCalls(unauthorizedActorContext.state), []);
}

async function testGatekeeperAllowPermitsProtectedMutation() {
  const context = createMockPrisma();
  const { service, gatekeeper } = createServiceWithGatekeeper(context.prisma);

  const created = await service.createGroup(
    'org-1',
    {
      key: 'gatekeeper-allow',
      label: 'Gatekeeper Allow',
      status: 'active',
    },
    'actor-1',
  );

  assert.equal(created.organization_id, 'org-1');
  assert.equal(gatekeeper.calls.length, 1);
  assert.deepEqual(gatekeeper.calls[0], {
    organization_id: 'org-1',
    actor_user_id: 'actor-1',
    active_group_ids: ['group-1'],
    capability_key: 'access.policy.manage',
    module_key: 'core.access',
    entity_type: 'access.group',
    entity_id: null,
    scope_unit_id: null,
    action_key: 'access.group.created',
    payload: {
      operation: 'create',
    },
    module_health: {
      'core.access': 'healthy',
    },
    dependency_health: {},
    reauth_status: 'not_required',
  });
  assert.equal(hasCall(context.state, 'group.create'), true);
  assert.equal(context.state.auditLogs.length, 2);
  assert.equal(context.state.outboxEntries.length, 1);
}

async function testGatekeeperBlocksBeforeProtectedWrites() {
  const deniedContext = createMockPrisma();
  const { service: deniedService, gatekeeper: deniedGatekeeper } = createServiceWithGatekeeper(
    deniedContext.prisma,
    () => {
      throw new ForbiddenException('Gatekeeper did not allow the mutation');
    },
  );
  const initialDeniedGroupCount = deniedContext.state.groups.length;

  await assert.rejects(
    deniedService.createGroup(
      'org-1',
      {
        key: 'blocked',
        label: 'Blocked',
        status: 'active',
      },
      'actor-1',
    ),
    ForbiddenException,
  );

  assert.equal(deniedGatekeeper.calls.length, 1);
  assert.equal(deniedContext.state.groups.length, initialDeniedGroupCount);
  assert.deepEqual(writeCalls(deniedContext.state), []);

  const degradedContext = createMockPrisma();
  const { service: degradedService } = createServiceWithGatekeeper(degradedContext.prisma, () => {
    throw new ServiceUnavailableException('Gatekeeper degraded block');
  });

  await assert.rejects(
    degradedService.createGroup(
      'org-1',
      {
        key: 'degraded-block',
        label: 'Degraded Block',
        status: 'active',
      },
      'actor-1',
    ),
    ServiceUnavailableException,
  );

  assert.deepEqual(writeCalls(degradedContext.state), []);

  const approvalRequiredContext = createMockPrisma();
  const { service: approvalRequiredService } = createServiceWithGatekeeper(approvalRequiredContext.prisma, () => {
    throw new ForbiddenException('Gatekeeper approval is required');
  });

  await assert.rejects(
    approvalRequiredService.createGroup(
      'org-1',
      {
        key: 'approval-required',
        label: 'Approval Required',
        status: 'active',
      },
      'actor-1',
    ),
    ForbiddenException,
  );

  assert.deepEqual(writeCalls(approvalRequiredContext.state), []);

  const providerErrorContext = createMockPrisma();
  const { service: providerErrorService } = createServiceWithGatekeeper(providerErrorContext.prisma, () => {
    throw new Error('Gatekeeper provider failed');
  });

  await assert.rejects(
    providerErrorService.createGroup(
      'org-1',
      {
        key: 'provider-error',
        label: 'Provider Error',
        status: 'active',
      },
      'actor-1',
    ),
  );

  assert.deepEqual(writeCalls(providerErrorContext.state), []);
}

async function testGatekeeperRunsAfterActorAuthorization() {
  const missingActorContext = createMockPrisma();
  const { service: missingActorService, gatekeeper: missingActorGatekeeper } = createServiceWithGatekeeper(
    missingActorContext.prisma,
  );

  await assert.rejects(
    missingActorService.createGroup(
      'org-1',
      {
        key: 'missing-actor-gatekeeper',
        label: 'Missing Actor Gatekeeper',
        status: 'active',
      },
      undefined,
    ),
    BadRequestException,
  );

  assert.equal(missingActorGatekeeper.calls.length, 0);

  const unauthorizedActorContext = createMockPrisma();
  unauthorizedActorContext.state.users.push({
    id: 'actor-without-policy',
    organization_id: 'org-1',
    email: 'actor.without.policy@example.org',
    display_name: 'Actor Without Policy',
    status: 'active',
    primary_unit_id: null,
  });
  unauthorizedActorContext.state.memberships.push({
    id: 'membership-actor-without-policy',
    organization_id: 'org-1',
    user_id: 'actor-without-policy',
    group_id: 'group-2',
    assigned_at: new Date('2026-01-01T00:00:00.000Z'),
  });
  const {
    service: unauthorizedActorService,
    gatekeeper: unauthorizedActorGatekeeper,
  } = createServiceWithGatekeeper(unauthorizedActorContext.prisma);

  await assert.rejects(
    unauthorizedActorService.createGroup(
      'org-1',
      {
        key: 'unauthorized-gatekeeper',
        label: 'Unauthorized Gatekeeper',
        status: 'active',
      },
      'actor-without-policy',
    ),
    BadRequestException,
  );

  assert.equal(unauthorizedActorGatekeeper.calls.length, 0);
  assert.deepEqual(writeCalls(unauthorizedActorContext.state), []);
}

async function testGatekeeperRunsBeforeProtectedResourceReads() {
  const missingMembershipResourceContext = createMockPrisma();
  const { service: missingMembershipResourceService, gatekeeper } = createServiceWithGatekeeper(
    missingMembershipResourceContext.prisma,
    () => {
      throw new ForbiddenException('Gatekeeper did not allow the mutation');
    },
  );

  await assert.rejects(
    missingMembershipResourceService.createMembership(
      'org-1',
      {
        user_id: 'missing-user',
        group_id: 'missing-group',
      },
      'actor-1',
    ),
    ForbiddenException,
  );

  assert.equal(gatekeeper.calls.length, 1);
  assert.equal(
    hasCallWhere(
      missingMembershipResourceContext.state,
      'user.findFirst',
      (args) => args.id === 'missing-user',
    ),
    false,
  );
  assert.equal(
    hasCallWhere(
      missingMembershipResourceContext.state,
      'group.findFirst',
      (args) => args.id === 'missing-group',
    ),
    false,
  );
  assert.deepEqual(writeCalls(missingMembershipResourceContext.state), []);

  const missingAssignmentResourceContext = createMockPrisma();
  const {
    service: missingAssignmentResourceService,
    gatekeeper: assignmentGatekeeper,
  } = createServiceWithGatekeeper(missingAssignmentResourceContext.prisma, () => {
    throw new ForbiddenException('Gatekeeper did not allow the mutation');
  });

  await assert.rejects(
    missingAssignmentResourceService.createGroupCapabilityAssignment(
      'org-1',
      {
        group_id: 'missing-group',
        capability_key: 'access.policy.manage',
        scope_type: 'own_unit',
        scope_unit_id: 'missing-unit',
      },
      'actor-1',
    ),
    ForbiddenException,
  );

  assert.equal(assignmentGatekeeper.calls.length, 1);
  assert.equal(
    hasCallWhere(
      missingAssignmentResourceContext.state,
      'group.findFirst',
      (args) => args.id === 'missing-group',
    ),
    false,
  );
  assert.equal(hasCall(missingAssignmentResourceContext.state, 'organizationUnit.findFirst'), false);
  assert.equal(
    missingAssignmentResourceContext.state.calls.filter((call) => call.fn === 'capability.findUnique').length,
    1,
  );
  assert.deepEqual(writeCalls(missingAssignmentResourceContext.state), []);
}

async function testObservabilityForValidActor() {
  const validActorContext = createMockPrisma();
  const validActorService = createService(validActorContext.prisma);

  await validActorService.createUser(
    'org-1',
    {
      email: 'third@example.org',
      display_name: 'Third User',
      status: 'active',
      primary_unit_id: null,
    },
    ' actor-1 ',
  );

  assert.equal(validActorContext.state.outboxEntries.length, 1);
  assert.equal(validActorContext.state.auditLogs.length, 2);
  const latestOutbox = validActorContext.state.outboxEntries[0];
  assert.equal(latestOutbox.event_type, 'platform.mutation.recorded');
  assert.deepEqual((latestOutbox.payload as { actor_user_id: string }).actor_user_id, 'actor-1');
  const latestAudit = validActorContext.state.auditLogs[1];
  assert.equal(latestAudit.actor_user_id, 'actor-1');
  assert.equal(latestAudit.action_key, 'access.user.created');
}

async function testAuditFailureRollsBackProtectedMutation() {
  const context = createMockPrisma({
    auditCreateError: new Error('audit write failed'),
  });
  const service = createService(context.prisma);

  const initialGroupCount = context.state.groups.length;
  const initialAuditCount = context.state.auditLogs.length;

  await assert.rejects(
    service.createGroup(
      'org-1',
      {
        key: 'new-group',
        label: 'New Group',
        status: 'active',
      },
      'actor-1',
    ),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.equal(error.message, 'audit write failed');
      return true;
    },
  );

  assert.equal(context.state.groups.length, initialGroupCount);
  assert.equal(context.state.auditLogs.length, initialAuditCount);
  assert.equal(context.state.outboxEntries.length, 0);
  assert.equal(context.state.calls.some((call) => call.fn === 'group.create'), true);
  assert.equal(context.state.calls.some((call) => call.fn === 'eventOutbox.create'), true);
  assert.equal(context.state.calls.some((call) => call.fn === 'auditLog.create'), true);
}

async function run() {
  await testUsersCrudAndOrgIsolation();
  await testOfficialEmailDomainValidation();
  await testDependencySafeDeleteConflicts();
  await testGroupsCrudAndOrgIsolation();
  await testMembershipOrgScopeAndDuplicateConflict();
  await testCapabilitySurfaceAndAssignmentValidation();
  await testReadOperationsRequireActorBeforeTenantReads();
  await testCrossOrgAndUnauthorizedActorsFailClosedBeforeTenantReads();
  await testGroupCapabilityDuplicateGuardRejectsNullAndExplicitScopesBeforeCreate();
  await testMissingAndBlankActorFailClosedBeforeWrite();
  await testMissingActorPreflightRunsBeforeProtectedResourceReads();
  await testInvalidCrossOrgAndUnauthorizedActorsFailClosedBeforeWrite();
  await testGatekeeperAllowPermitsProtectedMutation();
  await testGatekeeperBlocksBeforeProtectedWrites();
  await testGatekeeperRunsAfterActorAuthorization();
  await testGatekeeperRunsBeforeProtectedResourceReads();
  await testObservabilityForValidActor();
  await testAuditFailureRollsBackProtectedMutation();

  console.log('access-core.service tests passed');
}

void run();
