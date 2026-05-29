import assert from 'node:assert/strict';

import type { CapabilityRiskLevel, PermissionScopeType } from '../prisma/prisma-client';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserService } from './current-user.service';

type FakeUser = {
  id: string;
  organization_id: string;
  email: string;
  display_name: string;
  status: string;
  primary_unit_id: string | null;
  primary_unit: null;
};

type FakeGroup = {
  id: string;
  organization_id: string;
  key: string;
  label: string;
  status: string;
  group_capabilities: Array<{
    capability_key: string;
    scope_type: PermissionScopeType;
    scope_unit_id: string | null;
    capability: {
      module_key: string;
      risk_level: CapabilityRiskLevel;
      gatekeeper_required: boolean;
      approval_chain_required: boolean;
    };
  }>;
};

type FakeMembership = {
  organization_id: string;
  user_id: string;
  group_id: string;
};

function createService(input?: {
  groups?: FakeGroup[];
  memberships?: FakeMembership[];
}) {
  const users: FakeUser[] = [
    {
      id: 'operator-1',
      organization_id: 'org-1',
      email: 'operator@example.org',
      display_name: 'Operator One',
      status: 'active',
      primary_unit_id: null,
      primary_unit: null,
    },
  ];
  const groups: FakeGroup[] =
    input?.groups ?? [
      {
        id: 'group-shell',
        organization_id: 'org-1',
        key: 'shell.operators',
        label: 'Shell Operators',
        status: 'active',
        group_capabilities: [
          {
            capability_key: 'platform.shell.access',
            scope_type: 'organization',
            scope_unit_id: null,
            capability: {
              module_key: 'core.access',
              risk_level: 'low',
              gatekeeper_required: false,
              approval_chain_required: false,
            },
          },
        ],
      },
      {
        id: 'group-policy-admin',
        organization_id: 'org-1',
        key: 'policy.admin',
        label: 'Policy Admin',
        status: 'active',
        group_capabilities: [
          {
            capability_key: 'access.policy.manage',
            scope_type: 'organization',
            scope_unit_id: null,
            capability: {
              module_key: 'core.access',
              risk_level: 'high',
              gatekeeper_required: true,
              approval_chain_required: false,
            },
          },
        ],
      },
    ];
  const memberships: FakeMembership[] =
    input?.memberships ?? [{ organization_id: 'org-1', user_id: 'operator-1', group_id: 'group-shell' }];

  const prisma = {
    user: {
      findFirst: async ({ where }: { where: { organization_id: string; id: string } }) =>
        users.find((user) => user.organization_id === where.organization_id && user.id === where.id) ?? null,
    },
    userGroup: {
      findMany: async ({ where }: { where: { organization_id: string; user_id: string } }) =>
        memberships
          .filter((membership) => membership.organization_id === where.organization_id && membership.user_id === where.user_id)
          .map((membership) => {
            const group = groups.find(
              (item) => item.organization_id === membership.organization_id && item.id === membership.group_id,
            );
            if (!group) {
              throw new Error(`missing fake group ${membership.group_id}`);
            }
            return { group };
          }),
    },
  } as unknown as PrismaService;

  return new CurrentUserService(prisma);
}

async function testShellGrantIsVisibleWithoutPolicyManageGrant() {
  const service = createService();

  const profile = await service.getCurrentUserProfile({
    organization_id: 'org-1',
    actor_user_id: 'operator-1',
  });

  const shellCapability = profile.capabilities.find((capability) => capability.capability_key === 'platform.shell.access');
  assert.ok(shellCapability);
  assert.equal(shellCapability.module_key, 'core.access');
  assert.equal(shellCapability.scope_type, 'organization');
  assert.equal(shellCapability.scope_unit_id, null);
  assert.equal(shellCapability.risk_level, 'low');
  assert.equal(shellCapability.gatekeeper_required, false);
  assert.equal(shellCapability.approval_chain_required, false);
  assert.deepEqual(shellCapability.source_group_ids, ['group-shell']);
  assert.equal(
    profile.capabilities.some((capability) => capability.capability_key === 'access.policy.manage'),
    false,
    'shell access must not imply access.policy.manage',
  );
}

async function testShellGrantMustBeExplicitAndActiveInTenant() {
  const service = createService({
    groups: [
      {
        id: 'group-shell-inactive',
        organization_id: 'org-1',
        key: 'shell.inactive',
        label: 'Inactive Shell',
        status: 'disabled',
        group_capabilities: [
          {
            capability_key: 'platform.shell.access',
            scope_type: 'organization',
            scope_unit_id: null,
            capability: {
              module_key: 'core.access',
              risk_level: 'low',
              gatekeeper_required: false,
              approval_chain_required: false,
            },
          },
        ],
      },
      {
        id: 'group-shell-foreign',
        organization_id: 'org-2',
        key: 'shell.foreign',
        label: 'Foreign Shell',
        status: 'active',
        group_capabilities: [
          {
            capability_key: 'platform.shell.access',
            scope_type: 'organization',
            scope_unit_id: null,
            capability: {
              module_key: 'core.access',
              risk_level: 'low',
              gatekeeper_required: false,
              approval_chain_required: false,
            },
          },
        ],
      },
    ],
    memberships: [
      { organization_id: 'org-1', user_id: 'operator-1', group_id: 'group-shell-inactive' },
      { organization_id: 'org-2', user_id: 'operator-1', group_id: 'group-shell-foreign' },
    ],
  });

  const profile = await service.getCurrentUserProfile({
    organization_id: 'org-1',
    actor_user_id: 'operator-1',
  });

  assert.equal(profile.active_group_ids.includes('group-shell-inactive'), false);
  assert.equal(
    profile.capabilities.some((capability) => capability.capability_key === 'platform.shell.access'),
    false,
  );
}

async function run() {
  await testShellGrantIsVisibleWithoutPolicyManageGrant();
  await testShellGrantMustBeExplicitAndActiveInTenant();

  console.log('P5B-004c shell capability grant/visibility tests passed.');
}

void run();
