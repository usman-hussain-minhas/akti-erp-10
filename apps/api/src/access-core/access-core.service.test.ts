import assert from 'node:assert/strict';

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

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
};

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
  };

  const prisma = {
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
        return {
          id: 'user-new',
          ...data,
        };
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
        return {
          id: 'group-new',
          ...data,
        };
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
        return { id: 'membership-new', assigned_at: new Date('2026-01-02T00:00:00.000Z'), ...data };
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
        if (where.user_id === 'user-1' || where.group_id === 'group-1') {
          return 1;
        }
        return 0;
      },
    },
    groupCapability: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        state.calls.push({ fn: 'groupCapability.create', args: data });
        if (overrides?.assignmentCreateError) {
          throw overrides.assignmentCreateError;
        }
        return { id: 'assignment-new', ...data };
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
        if (where.group_id === 'group-1') {
          return 1;
        }
        return 0;
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
      count: async ({ where }: { where: Record<string, unknown> }) => {
        state.calls.push({ fn: 'auditLog.count', args: where });
        if (where.actor_user_id === 'user-1') {
          return 1;
        }
        return 0;
      },
    },
  };

  return { prisma, state };
}

async function testUsersCrudAndOrgIsolation() {
  const { prisma, state } = createMockPrisma();
  const service = new AccessCoreService(prisma as never);

  const created = await service.createUser('org-1', {
    email: 'new@example.org',
    display_name: 'New User',
    status: 'active',
    primary_unit_id: 'unit-1',
  });
  assert.equal(created.organization_id, 'org-1');

  const listed = await service.listUsers('org-1');
  assert.equal(Array.isArray(listed.items), true);

  const got = await service.getUser('org-1', 'user-1');
  assert.equal(got.id, 'user-1');

  const updated = await service.updateUser('org-1', 'user-1', {
    display_name: 'Updated',
  });
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
  const service = new AccessCoreService(prisma as never);

  await assert.rejects(
    service.deleteUser('org-1', 'user-1'),
    (error: unknown) => {
      assert.ok(error instanceof ConflictException);
      return true;
    },
  );

  await assert.rejects(
    service.deleteGroup('org-1', 'group-1'),
    (error: unknown) => {
      assert.ok(error instanceof ConflictException);
      return true;
    },
  );

  const deletedUser = await service.deleteUser('org-1', 'user-2');
  assert.equal(deletedUser.deleted, true);
  const userDeleteManyCall = state.calls.find((call) => call.fn === 'user.deleteMany');
  assert.ok(userDeleteManyCall);
  assert.deepEqual(userDeleteManyCall?.args, {
    organization_id: 'org-1',
    id: 'user-2',
  });

  const deletedGroup = await service.deleteGroup('org-1', 'group-2');
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
  const service = new AccessCoreService(prisma as never);

  const created = await service.createGroup('org-1', {
    key: 'ops',
    label: 'Ops',
    status: 'active',
  });
  assert.equal(created.organization_id, 'org-1');

  const listed = await service.listGroups('org-1');
  assert.equal(Array.isArray(listed.items), true);

  const got = await service.getGroup('org-1', 'group-1');
  assert.equal(got.id, 'group-1');

  const updated = await service.updateGroup('org-1', 'group-1', {
    label: 'Updated Group',
  });
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
  const duplicateMembershipService = new AccessCoreService(duplicateMembershipPrisma.prisma as never);

  await assert.rejects(
    duplicateMembershipService.createMembership('org-1', {
      user_id: 'user-1',
      group_id: 'group-1',
    }),
    (error: unknown) => {
      assert.ok(error instanceof ConflictException);
      return true;
    },
  );

  const { prisma, state } = createMockPrisma();
  const service = new AccessCoreService(prisma as never);

  const created = await service.createMembership('org-1', {
    user_id: 'user-1',
    group_id: 'group-1',
  });
  assert.equal(created.organization_id, 'org-1');

  const listed = await service.listMemberships('org-1');
  assert.equal(Array.isArray(listed.items), true);

  const deleted = await service.deleteMembership('org-1', 'membership-1');
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
  const noCatalogService = new AccessCoreService(noCatalog.prisma as never);
  const fallbackCaps = await noCatalogService.listCapabilities();
  assert.equal(fallbackCaps.items.length > 0, true);
  assert.equal(fallbackCaps.items[0].source, 'contract_seed');

  const { prisma, state } = createMockPrisma();
  const service = new AccessCoreService(prisma as never);

  await assert.rejects(
    service.createGroupCapabilityAssignment('org-1', {
      group_id: 'group-1',
      capability_key: 'access.policy.manage',
      scope_type: 'organization',
      scope_unit_id: 'unit-1',
    }),
    (error: unknown) => {
      assert.ok(error instanceof BadRequestException);
      return true;
    },
  );

  await assert.rejects(
    service.createGroupCapabilityAssignment('org-1', {
      group_id: 'group-1',
      capability_key: 'access.policy.manage',
      scope_type: 'own_unit',
      scope_unit_id: 'unit-foreign',
    }),
    (error: unknown) => {
      assert.ok(error instanceof BadRequestException);
      return true;
    },
  );

  await assert.rejects(
    service.createGroupCapabilityAssignment('org-1', {
      group_id: 'group-1',
      capability_key: 'access.unknown',
      scope_type: 'organization',
      scope_unit_id: null,
    }),
    (error: unknown) => {
      assert.ok(error instanceof BadRequestException);
      return true;
    },
  );

  const missingDbCapability = createMockPrisma();
  missingDbCapability.state.capabilities = [];
  const missingDbCapabilityService = new AccessCoreService(missingDbCapability.prisma as never);

  await assert.rejects(
    missingDbCapabilityService.createGroupCapabilityAssignment('org-1', {
      group_id: 'group-1',
      capability_key: 'access.policy.manage',
      scope_type: 'organization',
      scope_unit_id: null,
    }),
    (error: unknown) => {
      assert.ok(error instanceof ConflictException);
      return true;
    },
  );

  const created = await service.createGroupCapabilityAssignment('org-1', {
    group_id: 'group-1',
    capability_key: 'access.policy.manage',
    scope_type: 'organization',
    scope_unit_id: null,
  });
  assert.equal(created.organization_id, 'org-1');

  const listed = await service.listGroupCapabilityAssignments('org-1');
  assert.equal(Array.isArray(listed.items), true);

  const deleted = await service.deleteGroupCapabilityAssignment('org-1', 'assignment-1');
  assert.equal(deleted.deleted, true);
  const assignmentDeleteManyCall = state.calls.find((call) => call.fn === 'groupCapability.deleteMany');
  assert.ok(assignmentDeleteManyCall);
  assert.deepEqual(assignmentDeleteManyCall?.args, {
    organization_id: 'org-1',
    id: 'assignment-1',
  });
}

async function run() {
  await testUsersCrudAndOrgIsolation();
  await testDependencySafeDeleteConflicts();
  await testGroupsCrudAndOrgIsolation();
  await testMembershipOrgScopeAndDuplicateConflict();
  await testCapabilitySurfaceAndAssignmentValidation();

  console.log('access-core.service tests passed');
}

void run();
