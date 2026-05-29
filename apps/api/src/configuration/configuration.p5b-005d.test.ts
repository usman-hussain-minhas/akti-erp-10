import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import {
  GatekeeperPreflightService,
  type GatekeeperPreflightInput,
} from '../gatekeeper/gatekeeper-preflight.service';
import { AuditLogService } from '../platform-observability/audit-log.service';
import { EventOutboxService } from '../platform-observability/event-outbox.service';
import { ConfigurationService } from './configuration.service';

type Call = { fn: string; args: unknown };

type MockState = {
  calls: Call[];
  organizations: Array<Record<string, unknown>>;
  users: Array<Record<string, unknown>>;
  groups: Array<Record<string, unknown>>;
  memberships: Array<Record<string, unknown>>;
  assignments: Array<Record<string, unknown>>;
  capabilities: Array<Record<string, unknown>>;
  settings: Array<Record<string, unknown>>;
  auditLogs: Array<Record<string, unknown>>;
  outboxEntries: Array<Record<string, unknown>>;
};

type MockGatekeeperPreflight = GatekeeperPreflightService & {
  calls: GatekeeperPreflightInput[];
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

function cloneRows(rows: Array<Record<string, unknown>>) {
  return rows.map((row) => ({ ...row }));
}

function createMockPrisma() {
  const state: MockState = {
    calls: [],
    organizations: [{ id: 'org-alpha' }, { id: 'org-beta' }],
    users: [
      { id: 'actor-alpha', organization_id: 'org-alpha' },
      { id: 'actor-beta', organization_id: 'org-beta' },
      { id: 'actor-rogue', organization_id: 'org-alpha' },
    ],
    groups: [
      { id: 'group-alpha', organization_id: 'org-alpha' },
      { id: 'group-beta', organization_id: 'org-beta' },
      { id: 'group-rogue-beta', organization_id: 'org-beta' },
    ],
    memberships: [
      { id: 'membership-alpha', organization_id: 'org-alpha', user_id: 'actor-alpha', group_id: 'group-alpha' },
      { id: 'membership-beta', organization_id: 'org-beta', user_id: 'actor-beta', group_id: 'group-beta' },
      {
        id: 'membership-rogue-beta',
        organization_id: 'org-beta',
        user_id: 'actor-rogue',
        group_id: 'group-rogue-beta',
      },
    ],
    assignments: [
      {
        id: 'assignment-alpha',
        organization_id: 'org-alpha',
        group_id: 'group-alpha',
        capability_key: 'access.policy.manage',
        scope_type: 'organization',
        scope_unit_id: null,
      },
      {
        id: 'assignment-beta',
        organization_id: 'org-beta',
        group_id: 'group-beta',
        capability_key: 'access.policy.manage',
        scope_type: 'organization',
        scope_unit_id: null,
      },
      {
        id: 'assignment-rogue-beta',
        organization_id: 'org-beta',
        group_id: 'group-rogue-beta',
        capability_key: 'access.policy.manage',
        scope_type: 'organization',
        scope_unit_id: null,
      },
    ],
    capabilities: [{ key: 'access.policy.manage' }],
    settings: [
      {
        id: 'setting-alpha',
        organization_id: 'org-alpha',
        key: 'portal.mode',
        value_json: { mode: 'builder' },
        updated_at: new Date('2026-01-04T00:00:00.000Z'),
      },
      {
        id: 'setting-beta',
        organization_id: 'org-beta',
        key: 'portal.mode',
        value_json: { mode: 'simple' },
        updated_at: new Date('2026-01-05T00:00:00.000Z'),
      },
    ],
    auditLogs: [],
    outboxEntries: [],
  };

  const prisma = {
    $transaction: async <T>(fn: (tx: unknown) => Promise<T>) => {
      state.calls.push({ fn: '$transaction', args: {} });
      const snapshot = {
        settings: cloneRows(state.settings),
        auditLogs: cloneRows(state.auditLogs),
        outboxEntries: cloneRows(state.outboxEntries),
      };

      try {
        return await fn(prisma);
      } catch (error) {
        state.settings = snapshot.settings;
        state.auditLogs = snapshot.auditLogs;
        state.outboxEntries = snapshot.outboxEntries;
        throw error;
      }
    },
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
          (item) =>
            item.organization_id === where.organization_id &&
            matchesOptionalFilter(item.user_id, where.user_id),
        );
      },
    },
    group: {
      findMany: async ({
        where,
      }: {
        where: { organization_id: string; id?: string | { in: string[] } };
      }) => {
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
      findUnique: async ({
        where,
      }: {
        where: { organization_id_key: { organization_id: string; key: string } };
      }) => {
        state.calls.push({ fn: 'organizationSetting.findUnique', args: where });
        return (
          state.settings.find(
            (item) =>
              item.organization_id === where.organization_id_key.organization_id &&
              item.key === where.organization_id_key.key,
          ) ?? null
        );
      },
      upsert: async ({
        where,
        create,
        update,
      }: {
        where: { organization_id_key: { organization_id: string; key: string } };
        create: Record<string, unknown>;
        update: Record<string, unknown>;
      }) => {
        state.calls.push({ fn: 'organizationSetting.upsert', args: { where, create, update } });
        const index = state.settings.findIndex(
          (item) =>
            item.organization_id === where.organization_id_key.organization_id &&
            item.key === where.organization_id_key.key,
        );

        if (index === -1) {
          const created = {
            id: `setting-${state.settings.length + 1}`,
            updated_at: new Date('2026-01-06T00:00:00.000Z'),
            ...create,
          };
          state.settings.push(created);
          return { ...created };
        }

        state.settings[index] = {
          ...state.settings[index],
          ...update,
          updated_at: new Date('2026-01-07T00:00:00.000Z'),
        };
        return { ...state.settings[index] };
      },
    },
    auditLog: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        state.calls.push({ fn: 'auditLog.create', args: data });
        state.auditLogs.push(data);
        return { id: `audit-${state.auditLogs.length}`, ...data };
      },
    },
    eventOutbox: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        state.calls.push({ fn: 'eventOutbox.create', args: data });
        state.outboxEntries.push(data);
        return { id: `outbox-${state.outboxEntries.length}`, ...data };
      },
    },
  };

  return { prisma, state };
}

function createGatekeeper(calls: Call[]): MockGatekeeperPreflight {
  const gatekeeperCalls: GatekeeperPreflightInput[] = [];

  return {
    calls: gatekeeperCalls,
    requireAllow: async (input: GatekeeperPreflightInput) => {
      calls.push({ fn: 'gatekeeper.requireAllow', args: input });
      gatekeeperCalls.push(input);
      return {} as never;
    },
  } as unknown as MockGatekeeperPreflight;
}

function createService() {
  const { prisma, state } = createMockPrisma();
  const gatekeeper = createGatekeeper(state.calls);
  const service = new ConfigurationService(
    prisma as never,
    new AuditLogService(),
    new EventOutboxService(),
    gatekeeper,
  );

  return { service, state, gatekeeper };
}

function settingFor(state: MockState, organizationId: string) {
  return state.settings.find((item) => item.organization_id === organizationId && item.key === 'portal.mode');
}

async function testTenantConfigReadUsesOnlyRequestedOrganizationSetting() {
  const { service, state } = createService();

  const alphaConfig = await service.getTenantConfiguration('org-alpha', 'actor-alpha');
  const betaConfig = await service.getTenantConfiguration('org-beta', 'actor-beta');

  assert.equal(alphaConfig.organization_id, 'org-alpha');
  assert.equal(alphaConfig.portal_mode.mode, 'builder');
  assert.equal(alphaConfig.portal_mode.updated_at, '2026-01-04T00:00:00.000Z');
  assert.equal(betaConfig.organization_id, 'org-beta');
  assert.equal(betaConfig.portal_mode.mode, 'simple');
  assert.equal(betaConfig.portal_mode.updated_at, '2026-01-05T00:00:00.000Z');

  const settingReads = state.calls.filter((call) => call.fn === 'organizationSetting.findUnique');
  assert.deepEqual(
    settingReads.map((call) => call.args),
    [
      { organization_id_key: { organization_id: 'org-alpha', key: 'portal.mode' } },
      { organization_id_key: { organization_id: 'org-beta', key: 'portal.mode' } },
    ],
  );
}

async function testCrossTenantActorCannotReadTargetTenantConfig() {
  const { service, state } = createService();

  await assert.rejects(
    service.getTenantConfiguration('org-alpha', 'actor-beta'),
    (error: unknown) => error instanceof BadRequestException,
  );

  assert.equal(state.calls.some((call) => call.fn === 'organizationSetting.findUnique'), false);
}

async function testCrossTenantMembershipCannotGrantTenantConfigAccess() {
  const { service, state } = createService();

  await assert.rejects(
    service.getTenantConfiguration('org-alpha', 'actor-rogue'),
    (error: unknown) => error instanceof BadRequestException,
  );

  assert.equal(state.calls.some((call) => call.fn === 'organizationSetting.findUnique'), false);
  assert.equal(state.calls.some((call) => call.fn === 'groupCapability.findFirst'), false);
}

async function testCrossTenantActorCannotUpdateOrEmitObservabilityForTargetTenant() {
  const { service, state, gatekeeper } = createService();

  await assert.rejects(
    service.updatePortalMode('org-alpha', { mode: 'simple' }, 'actor-beta'),
    (error: unknown) => error instanceof BadRequestException,
  );

  assert.equal(state.calls.some((call) => call.fn === 'organizationSetting.upsert'), false);
  assert.equal(gatekeeper.calls.length, 0);
  assert.equal(state.auditLogs.length, 0);
  assert.equal(state.outboxEntries.length, 0);
  assert.deepEqual(settingFor(state, 'org-alpha')?.value_json, { mode: 'builder' });
  assert.deepEqual(settingFor(state, 'org-beta')?.value_json, { mode: 'simple' });
}

async function testTenantConfigUpdateWritesOnlyRequestedOrganization() {
  const { service, state, gatekeeper } = createService();

  const updated = await service.updatePortalMode('org-alpha', { mode: 'simple' }, 'actor-alpha');

  assert.equal(updated.organization_id, 'org-alpha');
  assert.equal(updated.mode, 'simple');
  assert.deepEqual(settingFor(state, 'org-alpha')?.value_json, { mode: 'simple' });
  assert.deepEqual(settingFor(state, 'org-beta')?.value_json, { mode: 'simple' });
  assert.equal(gatekeeper.calls.length, 1);
  assert.equal(gatekeeper.calls[0].organization_id, 'org-alpha');
  assert.equal(state.auditLogs.length, 1);
  assert.equal(state.auditLogs[0].organization_id, 'org-alpha');
  assert.equal(state.outboxEntries.length, 1);
  assert.equal(state.outboxEntries[0].organization_id, 'org-alpha');
}

async function run() {
  await testTenantConfigReadUsesOnlyRequestedOrganizationSetting();
  await testCrossTenantActorCannotReadTargetTenantConfig();
  await testCrossTenantMembershipCannotGrantTenantConfigAccess();
  await testCrossTenantActorCannotUpdateOrEmitObservabilityForTargetTenant();
  await testTenantConfigUpdateWritesOnlyRequestedOrganization();

  console.log('P5B-005d tenant config tenant-isolation tests passed.');
}

void run();
