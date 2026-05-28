import assert from 'node:assert/strict';

import { BadRequestException, ConflictException } from '@nestjs/common';

import { AuditLogService } from '../platform-observability/audit-log.service';
import { EventOutboxService } from '../platform-observability/event-outbox.service';
import { ConfigurationService } from './configuration.service';

const MODULE_DEFAULT_LABELS = {
  lead: 'Lead',
  lead_plural: 'Leads',
  owner_label: 'Owner',
};

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

function createService(options?: { labelOverrides?: unknown }) {
  const state = {
    calls: [] as Array<{ fn: string; args: unknown }>,
    users: [
      { id: 'actor-alpha', organization_id: 'org-alpha' },
      { id: 'actor-beta', organization_id: 'org-beta' },
    ],
    groups: [
      { id: 'group-alpha', organization_id: 'org-alpha' },
      { id: 'group-beta', organization_id: 'org-beta' },
    ],
    memberships: [
      { organization_id: 'org-alpha', user_id: 'actor-alpha', group_id: 'group-alpha' },
      { organization_id: 'org-beta', user_id: 'actor-beta', group_id: 'group-beta' },
    ],
    assignments: [
      {
        organization_id: 'org-alpha',
        group_id: 'group-alpha',
        capability_key: 'access.policy.manage',
        scope_type: 'organization',
      },
      {
        organization_id: 'org-beta',
        group_id: 'group-beta',
        capability_key: 'access.policy.manage',
        scope_type: 'organization',
      },
    ],
    capabilities: [{ key: 'access.policy.manage' }],
    settings:
      options && 'labelOverrides' in options
        ? [
            {
              id: 'labels-alpha',
              organization_id: 'org-alpha',
              key: 'display.labels.core.access',
              value_json: options.labelOverrides,
              updated_at: new Date('2026-01-11T00:00:00.000Z'),
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

async function testConfigurableLabelsResolveModuleDefaults() {
  const { service } = createService();

  const result = await service.resolveConfigurableLabels(
    'org-alpha',
    'core.access',
    MODULE_DEFAULT_LABELS,
    'actor-alpha',
  );

  assert.equal(result.organization_id, 'org-alpha');
  assert.equal(result.module_key, 'core.access');
  assert.equal(result.setting_key, 'display.labels.core.access');
  assert.equal(result.source, 'default');
  assert.equal(result.display_only, true);
  assert.equal(result.canonical_keys_preserved, true);
  assert.deepEqual(result.ignored_override_keys, []);
  assert.deepEqual(result.labels, {
    lead: { canonical_key: 'lead', label: 'Lead', source: 'module_default' },
    lead_plural: { canonical_key: 'lead_plural', label: 'Leads', source: 'module_default' },
    owner_label: { canonical_key: 'owner_label', label: 'Owner', source: 'module_default' },
  });
}

async function testConfigurableLabelsApplyOnlyKnownTenantOverrides() {
  const { service, state } = createService({
    labelOverrides: {
      lead: ' Applicant ',
      owner_label: 'Advisor',
      invented_business_key: 'Pipeline',
    },
  });

  const result = await service.resolveConfigurableLabels(
    'org-alpha',
    'CORE.ACCESS',
    MODULE_DEFAULT_LABELS,
    'actor-alpha',
  );

  assert.equal(result.source, 'stored');
  assert.equal(result.updated_at, '2026-01-11T00:00:00.000Z');
  assert.deepEqual(result.ignored_override_keys, ['invented_business_key']);
  assert.deepEqual(result.labels.lead, {
    canonical_key: 'lead',
    label: 'Applicant',
    source: 'tenant_override',
  });
  assert.deepEqual(result.labels.owner_label, {
    canonical_key: 'owner_label',
    label: 'Advisor',
    source: 'tenant_override',
  });
  assert.deepEqual(result.labels.lead_plural, {
    canonical_key: 'lead_plural',
    label: 'Leads',
    source: 'module_default',
  });
  assert.deepEqual(
    state.calls.find((call) => call.fn === 'organizationSetting.findUnique')?.args,
    {
      organization_id_key: {
        organization_id: 'org-alpha',
        key: 'display.labels.core.access',
      },
    },
  );
}

async function testConfigurableLabelsFailClosedForInvalidStoredOverrides() {
  const { service } = createService({
    labelOverrides: {
      lead: 12,
    },
  });

  await assert.rejects(
    service.resolveConfigurableLabels('org-alpha', 'core.access', MODULE_DEFAULT_LABELS, 'actor-alpha'),
    (error: unknown) => error instanceof ConflictException,
  );
}

async function testCrossTenantActorCannotResolveConfigurableLabels() {
  const { service, state } = createService({
    labelOverrides: {
      lead: 'Applicant',
    },
  });

  await assert.rejects(
    service.resolveConfigurableLabels('org-alpha', 'core.access', MODULE_DEFAULT_LABELS, 'actor-beta'),
    (error: unknown) => error instanceof BadRequestException,
  );

  assert.equal(state.calls.some((call) => call.fn === 'organizationSetting.findUnique'), false);
}

async function testModuleDefaultsMustBeExplicitAndCanonical() {
  const { service } = createService();

  await assert.rejects(
    service.resolveConfigurableLabels('org-alpha', 'core.access', {}, 'actor-alpha'),
    BadRequestException,
  );
  await assert.rejects(
    service.resolveConfigurableLabels('org-alpha', 'core.access', { 'bad key': 'Bad' }, 'actor-alpha'),
    BadRequestException,
  );
}

async function run() {
  await testConfigurableLabelsResolveModuleDefaults();
  await testConfigurableLabelsApplyOnlyKnownTenantOverrides();
  await testConfigurableLabelsFailClosedForInvalidStoredOverrides();
  await testCrossTenantActorCannotResolveConfigurableLabels();
  await testModuleDefaultsMustBeExplicitAndCanonical();

  console.log('P5B-006c configurable label resolver tests passed.');
}

void run();
