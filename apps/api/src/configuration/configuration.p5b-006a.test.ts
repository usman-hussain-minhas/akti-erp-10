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

async function testBrandingAssetResolverDefaultsToNoTenantOverride() {
  const { service } = createService();

  const resolved = await service.resolveBrandingAssets('org-alpha', 'actor-alpha');

  assert.deepEqual(resolved, {
    organization_id: 'org-alpha',
    key: 'white_label.branding_assets',
    source: 'default',
    assets: {
      logo_url: null,
      icon_url: null,
      favicon_url: null,
      email_logo_url: null,
    },
    canonical_identity_preserved: true,
    updated_at: null,
  });
  assert.equal(JSON.stringify(resolved).includes('AKTI'), false);
}

async function testBrandingAssetResolverReturnsSafeStoredAssetReferences() {
  const { service, state } = createService({
    brandingAssets: {
      logo_url: ' https://assets.example.test/logo.svg ',
      icon_url: '/tenant-assets/icon.svg',
      favicon_url: null,
      email_logo_url: 'https://assets.example.test/email-logo.png',
      ignored_extra_key: 'https://assets.example.test/not-returned.png',
    },
  });

  const resolved = await service.resolveBrandingAssets('org-alpha', 'actor-alpha');

  assert.deepEqual(resolved.assets, {
    logo_url: 'https://assets.example.test/logo.svg',
    icon_url: '/tenant-assets/icon.svg',
    favicon_url: null,
    email_logo_url: 'https://assets.example.test/email-logo.png',
  });
  assert.equal(resolved.source, 'stored');
  assert.equal(resolved.updated_at, '2026-01-08T00:00:00.000Z');
  assert.equal(resolved.canonical_identity_preserved, true);
  assert.deepEqual(
    state.calls.find((call) => call.fn === 'organizationSetting.findUnique')?.args,
    {
      organization_id_key: {
        organization_id: 'org-alpha',
        key: 'white_label.branding_assets',
      },
    },
  );
}

async function testBrandingAssetResolverFailsClosedForUnsafeAssetReferences() {
  const javascriptScheme = createService({
    brandingAssets: {
      logo_url: 'javascript:alert(1)',
    },
  });

  await assert.rejects(
    javascriptScheme.service.resolveBrandingAssets('org-alpha', 'actor-alpha'),
    (error: unknown) => error instanceof ConflictException,
  );

  const wrongShape = createService({
    brandingAssets: {
      logo_url: 42,
    },
  });

  await assert.rejects(
    wrongShape.service.resolveBrandingAssets('org-alpha', 'actor-alpha'),
    (error: unknown) => error instanceof ConflictException,
  );
}

async function testCrossTenantActorCannotResolveBrandingAssets() {
  const { service, state } = createService({
    brandingAssets: {
      logo_url: 'https://assets.example.test/logo.svg',
    },
  });

  await assert.rejects(
    service.resolveBrandingAssets('org-alpha', 'actor-beta'),
    (error: unknown) => error instanceof BadRequestException,
  );

  assert.equal(state.calls.some((call) => call.fn === 'organizationSetting.findUnique'), false);
}

async function run() {
  await testBrandingAssetResolverDefaultsToNoTenantOverride();
  await testBrandingAssetResolverReturnsSafeStoredAssetReferences();
  await testBrandingAssetResolverFailsClosedForUnsafeAssetReferences();
  await testCrossTenantActorCannotResolveBrandingAssets();

  console.log('P5B-006a branding asset resolver tests passed.');
}

void run();
