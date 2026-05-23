import assert from 'node:assert/strict';

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { AuditLogService } from '../platform-observability/audit-log.service';
import { EventOutboxService } from '../platform-observability/event-outbox.service';
import { AccessCoreService } from './access-core.service';

function prismaError(code: string) {
  return { code };
}

type MockState = {
  calls: Array<{ fn: string; args: unknown }>;
  users: Array<Record<string, unknown>>;
  groups: Array<Record<string, unknown>>;
  memberships: Array<Record<string, unknown>>;
  assignments: Array<Record<string, unknown>>;
  capabilities: Array<Record<string, unknown>>;
  auditLogs: Array<Record<string, unknown>>;
  outboxEntries: Array<Record<string, unknown>>;
};

function cloneRows(rows: Array<Record<string, unknown>>) {
  return rows.map((row) => ({ ...row }));
}

function createMockPrisma(overrides?: {
  userCreateError?: unknown;
  groupCreateError?: unknown;
  membershipCreateError?: unknown;
  assignmentCreateError?: unknown;
}) {
  const state: MockState = {
    calls: [],
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
      findMany: async ({ where }: { where: { organization_id: string } }) => {
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
      findMany: async ({ where }: { where: { organization_id: string } }) => {
        state.calls.push({ fn: 'group.findMany', args: where });
        return state.groups.filter((item) => item.organization_id === where.organization_id);
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
      findMany: async ({ where }: { where: { organization_id: string } }) => {
        state.calls.push({ fn: 'userGroup.findMany', args: where });
        return state.memberships.filter((item) => item.organization_id === where.organization_id);
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
      findMany: async ({ where }: { where: { organization_id: string } }) => {
        state.calls.push({ fn: 'groupCapability.findMany', args: where });
        return state.assignments.filter((item) => item.organization_id === where.organization_id);
      },
      findFirst: async ({ where }: { where: { organization_id: string; id: string } }) => {
        state.calls.push({ fn: 'groupCapability.findFirst', args: where });
        return (
          state.assignments.find(
            (item) => item.organization_id === where.organization_id && item.id === where.id,
          ) ?? null
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
    },
    auditLog: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        state.calls.push({ fn: 'auditLog.create', args: data });
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

function createService(prisma: unknown) {
  const auditLogService = new AuditLogService();
  const eventOutboxService = new EventOutboxService();
  return new AccessCoreService(prisma as never, auditLogService, eventOutboxService);
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
    undefined,
  );
  assert.equal(created.organization_id, 'org-1');

  const listed = await service.listUsers('org-1');
  assert.equal(Array.isArray(listed.items), true);

  const got = await service.getUser('org-1', 'user-1');
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
    service.getUser('org-1', 'missing'),
    (error: unknown) => {
      assert.ok(error instanceof NotFoundException);
      return true;
    },
  );

  const userFindFirstCall = state.calls.find((call) => call.fn === 'user.findFirst');
  assert.ok(userFindFirstCall);
  assert.deepEqual(userFindFirstCall?.args, { organization_id: 'org-1', id: 'user-1' });
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

  const listed = await service.listGroups('org-1');
  assert.equal(Array.isArray(listed.items), true);

  const got = await service.getGroup('org-1', 'group-1');
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

  const listed = await service.listMemberships('org-1');
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
  assert.equal(fallbackCaps.items.length > 0, true);
  assert.equal(fallbackCaps.items[0].source, 'contract_seed');

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

  const created = await service.createGroupCapabilityAssignment(
    'org-1',
    {
      group_id: 'group-1',
      capability_key: 'access.policy.manage',
      scope_type: 'organization',
      scope_unit_id: null,
    },
    'actor-1',
  );
  assert.equal(created.organization_id, 'org-1');

  const listed = await service.listGroupCapabilityAssignments('org-1');
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

async function testObservabilityForMissingAndValidActor() {
  const missingActorContext = createMockPrisma();
  const missingActorService = createService(missingActorContext.prisma);

  await missingActorService.createGroup(
    'org-1',
    {
      key: 'qa',
      label: 'QA',
      status: 'active',
    },
    undefined,
  );

  assert.equal(missingActorContext.state.outboxEntries.length, 1);
  assert.equal(missingActorContext.state.auditLogs.length, 1);

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
    'actor-1',
  );

  assert.equal(validActorContext.state.outboxEntries.length, 1);
  assert.equal(validActorContext.state.auditLogs.length, 2);
  const latestOutbox = validActorContext.state.outboxEntries[0];
  assert.equal(latestOutbox.event_type, 'platform.mutation.recorded');
}

async function testInvalidActorFailsSafelyAndRollsBack() {
  const context = createMockPrisma();
  const service = createService(context.prisma);

  const initialGroupCount = context.state.groups.length;

  await assert.rejects(
    service.createGroup(
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

  assert.equal(context.state.groups.length, initialGroupCount);
  assert.equal(context.state.outboxEntries.length, 0);
}

async function run() {
  await testUsersCrudAndOrgIsolation();
  await testDependencySafeDeleteConflicts();
  await testGroupsCrudAndOrgIsolation();
  await testMembershipOrgScopeAndDuplicateConflict();
  await testCapabilitySurfaceAndAssignmentValidation();
  await testObservabilityForMissingAndValidActor();
  await testInvalidActorFailsSafelyAndRollsBack();

  console.log('access-core.service tests passed');
}

void run();
