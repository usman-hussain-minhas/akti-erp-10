import assert from 'node:assert/strict';

import { BadRequestException, NotFoundException } from '@nestjs/common';

import type { CapabilityRiskLevel, PermissionScopeType } from '../prisma/prisma-client';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserService } from './current-user.service';
import type { TrustedActorContext } from './request-context';

type FakeUser = {
  id: string;
  organization_id: string;
  email: string;
  display_name: string;
  status: string;
  primary_unit_id: string | null;
  primary_unit: {
    id: string;
    key: string;
    name: string;
    status: string;
  } | null;
};

type FakeGroupCapability = {
  capability_key: string;
  scope_type: PermissionScopeType;
  scope_unit_id: string | null;
  capability: {
    module_key: string;
    risk_level: CapabilityRiskLevel;
    gatekeeper_required: boolean;
    approval_chain_required: boolean;
  };
};

type FakeGroup = {
  id: string;
  organization_id: string;
  key: string;
  label: string;
  status: string;
  group_capabilities: FakeGroupCapability[];
};

type FakeMembership = {
  organization_id: string;
  user_id: string;
  group_id: string;
};

type FixtureState = {
  users: FakeUser[];
  groups: FakeGroup[];
  memberships: FakeMembership[];
};

function trustedContext(overrides?: Partial<TrustedActorContext>): TrustedActorContext {
  return {
    organization_id: 'org-1',
    actor_user_id: 'user-1',
    ...(overrides ?? {}),
  };
}

function createFixture(overrides?: Partial<FixtureState>) {
  const state: FixtureState = {
    users: [
      {
        id: 'user-1',
        organization_id: 'org-1',
        email: 'user@example.org',
        display_name: 'User One',
        status: 'active',
        primary_unit_id: 'unit-1',
        primary_unit: {
          id: 'unit-1',
          key: 'main-campus',
          name: 'Main Campus',
          status: 'active',
        },
      },
      {
        id: 'user-1',
        organization_id: 'org-2',
        email: 'foreign@example.org',
        display_name: 'Foreign User',
        status: 'active',
        primary_unit_id: null,
        primary_unit: null,
      },
    ],
    groups: [
      {
        id: 'group-admin',
        organization_id: 'org-1',
        key: 'platform.admin',
        label: 'Platform Admin',
        status: 'active',
        group_capabilities: [
          {
            capability_key: 'platform.shell.access',
            scope_type: 'organization',
            scope_unit_id: null,
            capability: {
              module_key: 'core.platform',
              risk_level: 'low',
              gatekeeper_required: false,
              approval_chain_required: false,
            },
          },
          {
            capability_key: 'access.policy.manage',
            scope_type: 'organization',
            scope_unit_id: null,
            capability: {
              module_key: 'core.access',
              risk_level: 'high',
              gatekeeper_required: true,
              approval_chain_required: true,
            },
          },
        ],
      },
      {
        id: 'group-duplicate',
        organization_id: 'org-1',
        key: 'platform.duplicate',
        label: 'Platform Duplicate',
        status: 'active',
        group_capabilities: [
          {
            capability_key: 'platform.shell.access',
            scope_type: 'organization',
            scope_unit_id: null,
            capability: {
              module_key: 'core.platform',
              risk_level: 'low',
              gatekeeper_required: false,
              approval_chain_required: false,
            },
          },
        ],
      },
      {
        id: 'group-inactive',
        organization_id: 'org-1',
        key: 'inactive',
        label: 'Inactive',
        status: 'disabled',
        group_capabilities: [
          {
            capability_key: 'disabled.capability',
            scope_type: 'organization',
            scope_unit_id: null,
            capability: {
              module_key: 'core.platform',
              risk_level: 'medium',
              gatekeeper_required: false,
              approval_chain_required: false,
            },
          },
        ],
      },
      {
        id: 'group-foreign',
        organization_id: 'org-2',
        key: 'foreign',
        label: 'Foreign',
        status: 'active',
        group_capabilities: [
          {
            capability_key: 'foreign.capability',
            scope_type: 'organization',
            scope_unit_id: null,
            capability: {
              module_key: 'foreign',
              risk_level: 'low',
              gatekeeper_required: false,
              approval_chain_required: false,
            },
          },
        ],
      },
    ],
    memberships: [
      { organization_id: 'org-1', user_id: 'user-1', group_id: 'group-admin' },
      { organization_id: 'org-1', user_id: 'user-1', group_id: 'group-duplicate' },
      { organization_id: 'org-1', user_id: 'user-1', group_id: 'group-inactive' },
      { organization_id: 'org-2', user_id: 'user-1', group_id: 'group-foreign' },
    ],
    ...(overrides ?? {}),
  };

  const prisma = {
    user: {
      findFirst: async ({ where }: { where: { organization_id: string; id: string } }) =>
        state.users.find((user) => user.organization_id === where.organization_id && user.id === where.id) ?? null,
    },
    userGroup: {
      findMany: async ({ where }: { where: { organization_id: string; user_id: string } }) =>
        state.memberships
          .filter((membership) => membership.organization_id === where.organization_id && membership.user_id === where.user_id)
          .sort((left, right) => left.group_id.localeCompare(right.group_id))
          .map((membership) => {
            const group = state.groups.find(
              (item) => item.organization_id === membership.organization_id && item.id === membership.group_id,
            );
            if (!group) {
              throw new Error(`missing fake group ${membership.group_id}`);
            }
            return { group };
          }),
    },
  } as unknown as PrismaService;

  return {
    state,
    service: new CurrentUserService(prisma),
  };
}

async function testReturnsCurrentUserProfileWithTenantScopedGroupsAndCapabilities() {
  const { service } = createFixture();

  const profile = await service.getCurrentUserProfile(trustedContext());

  assert.equal(profile.organization_id, 'org-1');
  assert.equal(profile.user.id, 'user-1');
  assert.equal(profile.user.email, 'user@example.org');
  assert.equal(profile.user.primary_unit?.id, 'unit-1');
  assert.deepEqual(profile.active_group_ids, ['group-admin', 'group-duplicate']);
  assert.deepEqual(
    profile.groups.map((group) => group.id),
    ['group-admin', 'group-duplicate'],
  );
  assert.deepEqual(
    profile.capabilities.map((capability) => ({
      capability_key: capability.capability_key,
      source_group_ids: capability.source_group_ids,
    })),
    [
      {
        capability_key: 'access.policy.manage',
        source_group_ids: ['group-admin'],
      },
      {
        capability_key: 'platform.shell.access',
        source_group_ids: ['group-admin', 'group-duplicate'],
      },
    ],
  );
  assert.equal(profile.capabilities.some((capability) => capability.capability_key === 'disabled.capability'), false);
  assert.equal(profile.capabilities.some((capability) => capability.capability_key === 'foreign.capability'), false);
}

async function testMissingCurrentUserFailsWithoutCrossTenantFallback() {
  const { service } = createFixture({
    users: [
      {
        id: 'user-1',
        organization_id: 'org-2',
        email: 'foreign@example.org',
        display_name: 'Foreign User',
        status: 'active',
        primary_unit_id: null,
        primary_unit: null,
      },
    ],
  });

  await assert.rejects(service.getCurrentUserProfile(trustedContext()), NotFoundException);
}

async function testContextMustContainTrustedOrganizationAndActor() {
  const { service } = createFixture();

  await assert.rejects(service.getCurrentUserProfile(trustedContext({ organization_id: '   ' })), BadRequestException);
  await assert.rejects(service.getCurrentUserProfile(trustedContext({ actor_user_id: '   ' })), BadRequestException);
}

async function run() {
  await testReturnsCurrentUserProfileWithTenantScopedGroupsAndCapabilities();
  await testMissingCurrentUserFailsWithoutCrossTenantFallback();
  await testContextMustContainTrustedOrganizationAndActor();

  console.log('current-user service tests passed');
}

void run();
