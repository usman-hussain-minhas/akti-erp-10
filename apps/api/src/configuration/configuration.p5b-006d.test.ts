import assert from 'node:assert/strict';

import { BadRequestException, ConflictException } from '@nestjs/common';

import { AuditLogService } from '../platform-observability/audit-log.service';
import { EventOutboxService } from '../platform-observability/event-outbox.service';
import { ConfigurationService } from './configuration.service';

const MODULE_DEFAULT_LABELS = {
  module_title: 'Access',
  policy_label: 'Policy',
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

function createService() {
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
    settings: [
      {
        id: 'branding-assets-alpha',
        organization_id: 'org-alpha',
        key: 'white_label.branding_assets',
        value_json: {
          logo_url: 'https://assets.example.test/logo.svg',
          icon_url: '/tenant-assets/icon.svg',
        },
        updated_at: new Date('2026-01-12T00:00:00.000Z'),
      },
      {
        id: 'labels-alpha',
        organization_id: 'org-alpha',
        key: 'display.labels.core.access',
        value_json: {
          module_title: 'Access Center',
          invented_business_key: 'Admissions',
        },
        updated_at: new Date('2026-01-13T00:00:00.000Z'),
      },
    ] as Array<Record<string, unknown>>,
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

async function testBrandingAndLabelResolversPreserveCanonicalIdentity() {
  const { service } = createService();

  const assets = await service.resolveBrandingAssets('org-alpha', 'actor-alpha');
  const labels = await service.resolveConfigurableLabels(
    'org-alpha',
    'core.access',
    MODULE_DEFAULT_LABELS,
    'actor-alpha',
  );

  assert.equal(assets.canonical_identity_preserved, true);
  assert.equal(labels.canonical_keys_preserved, true);
  assert.equal(labels.display_only, true);
  assert.deepEqual(Object.keys(labels.labels).sort(), ['module_title', 'policy_label']);
  assert.equal(labels.labels.module_title.canonical_key, 'module_title');
  assert.equal(labels.labels.module_title.label, 'Access Center');
  assert.equal(labels.labels.policy_label.label, 'Policy');
  assert.deepEqual(labels.ignored_override_keys, ['invented_business_key']);
}

async function testDefaultBrandingDoesNotHardcodeTenantFacingIdentity() {
  const { service, state } = createService();
  state.settings = state.settings.filter((item) => item.key !== 'white_label.branding_assets');

  const assets = await service.resolveBrandingAssets('org-alpha', 'actor-alpha');

  assert.deepEqual(assets.assets, {
    logo_url: null,
    icon_url: null,
    favicon_url: null,
    email_logo_url: null,
  });
  assert.equal(JSON.stringify(assets).includes(['A', 'K', 'T', 'I'].join('')), false);
  assert.equal(assets.canonical_identity_preserved, true);
}

async function testUnsafeBrandingAndLabelValuesFailClosed() {
  const unsafeBranding = createService();
  unsafeBranding.state.settings = [
    {
      id: 'branding-assets-alpha',
      organization_id: 'org-alpha',
      key: 'white_label.branding_assets',
      value_json: {
        logo_url: 'javascript:alert(1)',
      },
      updated_at: new Date('2026-01-12T00:00:00.000Z'),
    },
  ];
  await assert.rejects(
    unsafeBranding.service.resolveBrandingAssets('org-alpha', 'actor-alpha'),
    (error: unknown) => error instanceof ConflictException,
  );

  const unsafeLabels = createService();
  unsafeLabels.state.settings = [
    {
      id: 'labels-alpha',
      organization_id: 'org-alpha',
      key: 'display.labels.core.access',
      value_json: {
        module_title: '',
      },
      updated_at: new Date('2026-01-13T00:00:00.000Z'),
    },
  ];
  await assert.rejects(
    unsafeLabels.service.resolveConfigurableLabels(
      'org-alpha',
      'core.access',
      MODULE_DEFAULT_LABELS,
      'actor-alpha',
    ),
    (error: unknown) => error instanceof ConflictException,
  );
}

async function testCrossTenantActorsCannotResolveBrandingOrLabels() {
  const { service, state } = createService();

  await assert.rejects(
    service.resolveBrandingAssets('org-alpha', 'actor-beta'),
    (error: unknown) => error instanceof BadRequestException,
  );
  await assert.rejects(
    service.resolveConfigurableLabels('org-alpha', 'core.access', MODULE_DEFAULT_LABELS, 'actor-beta'),
    (error: unknown) => error instanceof BadRequestException,
  );

  assert.equal(state.calls.some((call) => call.fn === 'organizationSetting.findUnique'), false);
}

async function run() {
  await testBrandingAndLabelResolversPreserveCanonicalIdentity();
  await testDefaultBrandingDoesNotHardcodeTenantFacingIdentity();
  await testUnsafeBrandingAndLabelValuesFailClosed();
  await testCrossTenantActorsCannotResolveBrandingOrLabels();

  console.log('P5B-006d branding/label invariant tests passed.');
}

void run();
