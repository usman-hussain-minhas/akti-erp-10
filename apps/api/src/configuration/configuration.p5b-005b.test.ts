import assert from 'node:assert/strict';

import { BadRequestException, ConflictException } from '@nestjs/common';

import { AuditLogService } from '../platform-observability/audit-log.service';
import { EventOutboxService } from '../platform-observability/event-outbox.service';
import { ConfigurationService } from './configuration.service';

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

function createService(options?: {
  omitAccessAssignment?: boolean;
  storedPortalMode?: unknown;
}) {
  const state = {
    calls: [] as Array<{ fn: string; args: unknown }>,
    users: [
      { id: 'actor-1', organization_id: 'org-1' },
      { id: 'actor-no-access', organization_id: 'org-1' },
      { id: 'actor-foreign', organization_id: 'org-2' },
    ],
    groups: [
      { id: 'group-1', organization_id: 'org-1' },
      { id: 'group-no-access', organization_id: 'org-1' },
      { id: 'group-foreign', organization_id: 'org-2' },
    ],
    memberships: [
      { organization_id: 'org-1', user_id: 'actor-1', group_id: 'group-1' },
      { organization_id: 'org-1', user_id: 'actor-no-access', group_id: 'group-no-access' },
      { organization_id: 'org-2', user_id: 'actor-foreign', group_id: 'group-foreign' },
    ],
    assignments: options?.omitAccessAssignment
      ? []
      : [
          {
            organization_id: 'org-1',
            group_id: 'group-1',
            capability_key: 'access.policy.manage',
            scope_type: 'organization',
            scope_unit_id: null,
          },
          {
            organization_id: 'org-2',
            group_id: 'group-foreign',
            capability_key: 'access.policy.manage',
            scope_type: 'organization',
            scope_unit_id: null,
          },
        ],
    capabilities: [
      {
        key: 'access.policy.manage',
      },
    ],
    settings:
      options && 'storedPortalMode' in options
        ? [
            {
              id: 'setting-1',
              organization_id: 'org-1',
              key: 'portal.mode',
              value_json: options.storedPortalMode,
              updated_at: new Date('2026-01-03T00:00:00.000Z'),
            },
          ]
        : [],
  };

  const prisma = {
    user: {
      findFirst: async ({ where }: { where: { organization_id: string; id: string } }) => {
        state.calls.push({ fn: 'user.findFirst', args: where });
        return state.users.find((item) => item.organization_id === where.organization_id && item.id === where.id) ?? null;
      },
    },
    capability: {
      findUnique: async ({ where }: { where: { key: string } }) => {
        state.calls.push({ fn: 'capability.findUnique', args: where });
        return state.capabilities.find((item) => item.key === where.key) ?? null;
      },
    },
    userGroup: {
      findMany: async ({ where }: { where: { organization_id: string; user_id?: string } }) => {
        state.calls.push({ fn: 'userGroup.findMany', args: where });
        return state.memberships.filter(
          (item) => item.organization_id === where.organization_id && matchesOptionalFilter(item.user_id, where.user_id),
        );
      },
    },
    group: {
      findMany: async ({ where }: { where: { organization_id: string; id?: string | { in: string[] } } }) => {
        state.calls.push({ fn: 'group.findMany', args: where });
        return state.groups.filter(
          (item) => item.organization_id === where.organization_id && matchesOptionalFilter(item.id, where.id),
        );
      },
    },
    groupCapability: {
      findFirst: async ({
        where,
      }: {
        where: {
          organization_id: string;
          group_id?: string | { in: string[] };
          capability_key?: string;
          scope_type?: string | { in: string[] };
        };
      }) => {
        state.calls.push({ fn: 'groupCapability.findFirst', args: where });
        return (
          state.assignments.find(
            (item) =>
              item.organization_id === where.organization_id &&
              matchesOptionalFilter(item.group_id, where.group_id) &&
              matchesOptionalFilter(item.capability_key, where.capability_key) &&
              matchesOptionalFilter(item.scope_type, where.scope_type),
          ) ?? null
        );
      },
    },
    organizationSetting: {
      findUnique: async ({ where }: { where: { organization_id_key: { organization_id: string; key: string } } }) => {
        state.calls.push({ fn: 'organizationSetting.findUnique', args: where });
        return (
          state.settings.find(
            (item) =>
              item.organization_id === where.organization_id_key.organization_id &&
              item.key === where.organization_id_key.key,
          ) ?? null
        );
      },
    },
  };

  return {
    service: new ConfigurationService(
      prisma as never,
      new AuditLogService(),
      new EventOutboxService(),
      {} as never,
    ),
    state,
  };
}

async function testTenantConfigurationDefaultsAreSafeAndNonSecret() {
  const { service } = createService();

  const config = await service.getTenantConfiguration('org-1', 'actor-1');

  assert.equal(config.organization_id, 'org-1');
  assert.equal(config.storage_model.decision, 'reuse_existing_models');
  assert.equal(config.storage_model.setting_model, 'OrganizationSetting');
  assert.equal(config.storage_model.domain_model, 'OrganizationDomain');
  assert.deepEqual(config.portal_mode, {
    organization_id: 'org-1',
    key: 'portal.mode',
    mode: 'simple',
    source: 'default',
    updated_at: null,
  });
  assert.deepEqual(config.white_label, {
    mode: 'none',
    source: 'default',
    updated_at: null,
  });
  assert.deepEqual(config.mutation_policy, {
    capability_key: 'access.policy.manage',
    module_key: 'core.access',
    gatekeeper_required: true,
    audit_required: true,
  });
  assert.equal(JSON.stringify(config).toLowerCase().includes('secret'), false);
}

async function testTenantConfigurationReadsStoredPortalMode() {
  const { service } = createService({
    storedPortalMode: { mode: 'builder' },
  });

  const config = await service.getTenantConfiguration('org-1', 'actor-1');

  assert.equal(config.portal_mode.mode, 'builder');
  assert.equal(config.portal_mode.source, 'stored');
  assert.equal(config.portal_mode.updated_at, '2026-01-03T00:00:00.000Z');
}

async function testTenantConfigurationFailsClosedForInvalidStoredConfig() {
  const { service } = createService({
    storedPortalMode: { mode: 'advanced' },
  });

  await assert.rejects(service.getTenantConfiguration('org-1', 'actor-1'), ConflictException);
}

async function testTenantConfigurationRequiresAuthorizedActorBeforeRead() {
  const missingActor = createService();
  await assert.rejects(missingActor.service.getTenantConfiguration('org-1', undefined), BadRequestException);
  assert.equal(missingActor.state.calls.some((call) => call.fn === 'organizationSetting.findUnique'), false);

  const unauthorized = createService({ omitAccessAssignment: true });
  await assert.rejects(unauthorized.service.getTenantConfiguration('org-1', 'actor-no-access'), BadRequestException);
  assert.equal(unauthorized.state.calls.some((call) => call.fn === 'organizationSetting.findUnique'), false);
}

async function run() {
  await testTenantConfigurationDefaultsAreSafeAndNonSecret();
  await testTenantConfigurationReadsStoredPortalMode();
  await testTenantConfigurationFailsClosedForInvalidStoredConfig();
  await testTenantConfigurationRequiresAuthorizedActorBeforeRead();

  console.log('P5B-005b tenant config service tests passed.');
}

void run();
