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

function createService(options?: { brandingAssets?: unknown }) {
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
      options && 'brandingAssets' in options
        ? [
            {
              id: 'branding-assets-alpha',
              organization_id: 'org-alpha',
              key: 'white_label.branding_assets',
              value_json: options.brandingAssets,
              updated_at: new Date('2026-01-08T00:00:00.000Z'),
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

async function testEffectiveBrandingReturnsFactOnlyDefaultShape() {
  const { service } = createService();

  const result = await service.getEffectiveBranding('org-alpha', 'actor-alpha');

  assert.deepEqual(result, {
    product_name: 'Esbla Spark',
    logo_url: null,
    theme_mode: 'system',
    primary_color: null,
    accent_color: null,
  });
  assert.equal('css_tokens' in result, false);
  assert.equal('tokens' in result, false);
}

async function testEffectiveBrandingUsesLogoUrlFromBrandingAssets() {
  const { service, state } = createService({
    brandingAssets: {
      logo_url: ' https://assets.example.test/logo.svg ',
    },
  });

  const result = await service.getEffectiveBranding('org-alpha', 'actor-alpha');

  assert.equal(result.logo_url, 'https://assets.example.test/logo.svg');
  assert.deepEqual(
    state.calls.find((call) => call.fn === 'organizationSetting.findUnique')?.args,
    {
      organization_id_key: {
        organization_id: 'org-alpha',
        key: 'white_label.branding_assets',
      },
    },
  );
  assert.equal(state.calls.some((call) => call.fn === 'organizationSetting.upsert'), false);
}

async function testEffectiveBrandingBlocksCrossTenantActorBeforeSettingRead() {
  const { service, state } = createService({
    brandingAssets: {
      logo_url: 'https://assets.example.test/logo.svg',
    },
  });

  await assert.rejects(
    service.getEffectiveBranding('org-alpha', 'actor-beta'),
    (error: unknown) => error instanceof BadRequestException,
  );
  assert.equal(state.calls.some((call) => call.fn === 'organizationSetting.findUnique'), false);
}

async function testEffectiveBrandingFailsClosedForUnsafeStoredAssets() {
  const { service } = createService({
    brandingAssets: {
      logo_url: 'javascript:alert(1)',
    },
  });

  await assert.rejects(
    service.getEffectiveBranding('org-alpha', 'actor-alpha'),
    (error: unknown) => error instanceof ConflictException,
  );
}

async function run() {
  await testEffectiveBrandingReturnsFactOnlyDefaultShape();
  await testEffectiveBrandingUsesLogoUrlFromBrandingAssets();
  await testEffectiveBrandingBlocksCrossTenantActorBeforeSettingRead();
  await testEffectiveBrandingFailsClosedForUnsafeStoredAssets();

  console.log('P5B1-008 effective branding service tests passed.');
}

void run();
