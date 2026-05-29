import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

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

function createService() {
  const state = {
    calls: [] as Array<{ fn: string; args: unknown }>,
    organizations: [
      {
        id: 'org-alpha',
        display_name: 'Rising Stars Academy',
        short_name: 'RS',
      },
      {
        id: 'org-beta',
        display_name: 'Other School',
        short_name: 'OS',
      },
    ],
    users: [
      { id: 'actor-alpha', organization_id: 'org-alpha' },
      { id: 'actor-beta', organization_id: 'org-beta' },
    ],
    groups: [
      { id: 'group-alpha', organization_id: 'org-alpha', key: 'manager', label: 'Manager' },
      { id: 'group-beta', organization_id: 'org-beta', key: 'director', label: 'Director' },
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
        organization_id: 'org-alpha',
        group_id: 'group-alpha',
        capability_key: 'workflow.definition.read',
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
        },
        updated_at: new Date('2026-01-08T00:00:00.000Z'),
      },
      {
        id: 'branding-assets-beta',
        organization_id: 'org-beta',
        key: 'white_label.branding_assets',
        value_json: {
          logo_url: 'https://assets.example.test/beta-logo.svg',
        },
        updated_at: new Date('2026-01-09T00:00:00.000Z'),
      },
    ],
    modules: [
      { module_key: 'core.access' },
      { module_key: 'engagement.gateway' },
      { module_key: 'lead.desk' },
    ],
  };

  const prisma = {
    organization: {
      findUnique: async ({ where }: { where: { id: string } }) => {
        state.calls.push({ fn: 'organization.findUnique', args: where });
        return state.organizations.find((item) => item.id === where.id) ?? null;
      },
    },
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
      findMany: async ({
        where,
      }: {
        where: {
          organization_id: string;
          group_id?: string | { in: string[] };
        };
      }) => {
        state.calls.push({ fn: 'groupCapability.findMany', args: where });
        return state.assignments.filter(
          (item) =>
            item.organization_id === where.organization_id &&
            matchesOptionalFilter(item.group_id, where.group_id),
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
    moduleRegistryEntry: {
      findMany: async ({
        where,
      }: {
        where: {
          module_key?: { in: string[] };
        };
      }) => {
        state.calls.push({ fn: 'moduleRegistryEntry.findMany', args: where });
        return state.modules.filter((item) => matchesOptionalFilter(item.module_key, where.module_key));
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

async function testOrganizationProfileComposesTenantScopedFacts() {
  const { service, state } = createService();

  const result = await service.getOrganizationProfile('org-alpha', 'actor-alpha');

  assert.deepEqual(result, {
    organization_id: 'org-alpha',
    display_name: 'Rising Stars Academy',
    short_name: 'RS',
    logo_url: 'https://assets.example.test/logo.svg',
    branding_config: {
      logo_url: 'https://assets.example.test/logo.svg',
      primary_color: null,
      accent_color: null,
      product_name_override: null,
      theme_mode: null,
    },
    my_modules: ['core.access', 'engagement.gateway', 'lead.desk'],
    my_role: 'manager',
    my_capabilities: ['access.policy.manage', 'workflow.definition.read'],
  });
  assert.equal('my_capability_count' in result, false);
  assert.equal(
    JSON.stringify(state.calls.find((call) => call.fn === 'organizationSetting.findUnique')?.args).includes('org-beta'),
    false,
  );
}

async function testOrganizationProfileDoesNotRequireFuturePlatformCapabilities() {
  const { service } = createService();

  const result = await service.getOrganizationProfile('org-alpha', 'actor-alpha');

  assert.equal(result.my_capabilities.includes('platform.crm.access'), false);
  assert.equal(result.my_capabilities.includes('platform.modules.view'), false);
  assert.equal(result.my_capabilities.includes('access.policy.manage'), true);
}

async function testOrganizationProfileBlocksCrossTenantActorBeforeReads() {
  const { service, state } = createService();

  await assert.rejects(
    service.getOrganizationProfile('org-alpha', 'actor-beta'),
    (error: unknown) => error instanceof BadRequestException,
  );
  assert.equal(state.calls.some((call) => call.fn === 'organization.findUnique'), false);
  assert.equal(state.calls.some((call) => call.fn === 'organizationSetting.findUnique'), false);
  assert.equal(state.calls.some((call) => call.fn === 'moduleRegistryEntry.findMany'), false);
}

async function run() {
  await testOrganizationProfileComposesTenantScopedFacts();
  await testOrganizationProfileDoesNotRequireFuturePlatformCapabilities();
  await testOrganizationProfileBlocksCrossTenantActorBeforeReads();

  console.log('P5B1-009 organization profile service tests passed.');
}

void run();
