import assert from 'node:assert/strict';

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';

import {
  GatekeeperPreflightService,
  type GatekeeperPreflightInput,
} from '../gatekeeper/gatekeeper-preflight.service';
import { AuditLogService } from '../platform-observability/audit-log.service';
import { EventOutboxService } from '../platform-observability/event-outbox.service';
import { ConfigurationService } from './configuration.service';

function prismaError(code: string) {
  return { code };
}

type MockState = {
  calls: Array<{ fn: string; args: unknown }>;
  organizations: Array<Record<string, unknown>>;
  users: Array<Record<string, unknown>>;
  groups: Array<Record<string, unknown>>;
  memberships: Array<Record<string, unknown>>;
  assignments: Array<Record<string, unknown>>;
  capabilities: Array<Record<string, unknown>>;
  settings: Array<Record<string, unknown>>;
  auditLogs: Array<Record<string, unknown>>;
  outboxEntries: Array<Record<string, unknown>>;
  transactionOptions: unknown[];
};

type MockGatekeeperPreflight = GatekeeperPreflightService & {
  calls: GatekeeperPreflightInput[];
};

function cloneRows(rows: Array<Record<string, unknown>>) {
  return rows.map((row) => ({ ...row }));
}

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

function createMockPrisma(options?: { omitAccessAssignment?: boolean; auditCreateError?: unknown }) {
  const state: MockState = {
    calls: [],
    organizations: [
      { id: 'org-1' },
      { id: 'org-2' },
    ],
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
      { id: 'membership-actor-1', organization_id: 'org-1', user_id: 'actor-1', group_id: 'group-1' },
      {
        id: 'membership-no-access',
        organization_id: 'org-1',
        user_id: 'actor-no-access',
        group_id: 'group-no-access',
      },
      {
        id: 'membership-foreign',
        organization_id: 'org-2',
        user_id: 'actor-foreign',
        group_id: 'group-foreign',
      },
    ],
    assignments: options?.omitAccessAssignment
      ? []
      : [
          {
            id: 'assignment-1',
            organization_id: 'org-1',
            group_id: 'group-1',
            capability_key: 'access.policy.manage',
            scope_type: 'organization',
            scope_unit_id: null,
          },
          {
            id: 'assignment-foreign',
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
        module_key: 'core.access',
        description: 'Manage access policy definitions.',
        risk_level: 'high',
        gatekeeper_required: true,
        approval_chain_required: false,
      },
    ],
    settings: [],
    auditLogs: [],
    outboxEntries: [],
    transactionOptions: [],
  };

  const prisma = {
    $transaction: async <T>(fn: (tx: unknown) => Promise<T>, transactionOptions: unknown) => {
      state.calls.push({ fn: '$transaction', args: transactionOptions });
      state.transactionOptions.push(transactionOptions);

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
        const organizationExists = state.organizations.some((item) => item.id === create.organization_id);
        if (!organizationExists) {
          throw prismaError('P2003');
        }

        const index = state.settings.findIndex(
          (item) =>
            item.organization_id === where.organization_id_key.organization_id &&
            item.key === where.organization_id_key.key,
        );
        if (index === -1) {
          const created = {
            id: `setting-${state.settings.length + 1}`,
            updated_at: new Date('2026-01-01T00:00:00.000Z'),
            ...create,
          };
          state.settings.push(created);
          return { ...created };
        }

        state.settings[index] = {
          ...state.settings[index],
          ...update,
          updated_at: new Date('2026-01-02T00:00:00.000Z'),
        };
        return { ...state.settings[index] };
      },
    },
    auditLog: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        state.calls.push({ fn: 'auditLog.create', args: data });
        if (options?.auditCreateError) {
          throw options.auditCreateError;
        }
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

function createGatekeeper(
  calls: MockState['calls'],
  handler?: (input: GatekeeperPreflightInput) => Promise<void> | void,
): MockGatekeeperPreflight {
  const gatekeeperCalls: GatekeeperPreflightInput[] = [];

  return {
    calls: gatekeeperCalls,
    requireAllow: async (input: GatekeeperPreflightInput) => {
      calls.push({ fn: 'gatekeeper.requireAllow', args: input });
      gatekeeperCalls.push(input);
      await handler?.(input);
      return {} as never;
    },
  } as unknown as MockGatekeeperPreflight;
}

function createService(options?: {
  omitAccessAssignment?: boolean;
  gatekeeperHandler?: (input: GatekeeperPreflightInput) => Promise<void> | void;
  auditCreateError?: unknown;
}) {
  const { prisma, state } = createMockPrisma({
    omitAccessAssignment: options?.omitAccessAssignment,
    auditCreateError: options?.auditCreateError,
  });
  const gatekeeper = createGatekeeper(state.calls, options?.gatekeeperHandler);
  const service = new ConfigurationService(
    prisma as never,
    new AuditLogService(),
    new EventOutboxService(),
    gatekeeper,
  );

  return { service, state, gatekeeper };
}

function callIndex(state: MockState, fn: string) {
  return state.calls.findIndex((call) => call.fn === fn);
}

async function testGetRequiresActorBeforeSettingRead() {
  const { service, state } = createService();

  await assert.rejects(
    service.getPortalMode('org-1', undefined),
    (error: unknown) => error instanceof BadRequestException,
  );

  assert.equal(state.calls.some((call) => call.fn === 'organizationSetting.findUnique'), false);
}

async function testGetRejectsCrossOrgAndUnauthorizedActorBeforeSettingRead() {
  const crossOrg = createService();
  await assert.rejects(
    crossOrg.service.getPortalMode('org-1', 'actor-foreign'),
    (error: unknown) => error instanceof BadRequestException,
  );
  assert.equal(crossOrg.state.calls.some((call) => call.fn === 'organizationSetting.findUnique'), false);

  const unauthorized = createService({ omitAccessAssignment: true });
  await assert.rejects(
    unauthorized.service.getPortalMode('org-1', 'actor-no-access'),
    (error: unknown) => error instanceof BadRequestException,
  );
  assert.equal(unauthorized.state.calls.some((call) => call.fn === 'organizationSetting.findUnique'), false);
}

async function testGetReturnsDefaultStoredAndFailsClosedForInvalidStoredValue() {
  const { service, state } = createService();

  const defaultMode = await service.getPortalMode('org-1', 'actor-1');
  assert.deepEqual(defaultMode, {
    organization_id: 'org-1',
    key: 'portal.mode',
    mode: 'simple',
    source: 'default',
    updated_at: null,
  });

  state.settings.push({
    id: 'setting-1',
    organization_id: 'org-1',
    key: 'portal.mode',
    value_json: { mode: 'builder' },
    updated_at: new Date('2026-01-03T00:00:00.000Z'),
  });

  const storedMode = await service.getPortalMode('org-1', 'actor-1');
  assert.equal(storedMode.mode, 'builder');
  assert.equal(storedMode.source, 'stored');
  assert.equal(storedMode.updated_at, '2026-01-03T00:00:00.000Z');

  state.settings[0].value_json = { mode: 'advanced' };
  await assert.rejects(
    service.getPortalMode('org-1', 'actor-1'),
    (error: unknown) => error instanceof ConflictException,
  );
}

async function testPutRequiresActorBeforeSettingReadsOrWrites() {
  const { service, state, gatekeeper } = createService();

  await assert.rejects(
    service.updatePortalMode('org-1', { mode: 'builder' }, undefined),
    (error: unknown) => error instanceof BadRequestException,
  );

  assert.equal(gatekeeper.calls.length, 0);
  assert.equal(state.calls.some((call) => call.fn === 'organization.findUnique'), false);
  assert.equal(state.calls.some((call) => call.fn === 'organizationSetting.upsert'), false);
}

async function testPutRunsGatekeeperAfterActorAndBeforeSettingWrite() {
  const { service, state, gatekeeper } = createService();

  const updated = await service.updatePortalMode('org-1', { mode: 'builder' }, 'actor-1');

  assert.equal(updated.mode, 'builder');
  assert.equal(updated.source, 'stored');
  assert.equal(gatekeeper.calls.length, 1);
  assert.equal(gatekeeper.calls[0].entity_type, 'organization.setting');
  assert.equal(gatekeeper.calls[0].action_key, 'configuration.portal-mode.updated');
  assert.equal(gatekeeper.calls[0].capability_key, 'access.policy.manage');
  assert.equal(gatekeeper.calls[0].module_key, 'core.access');

  assert.ok(callIndex(state, 'groupCapability.findFirst') < callIndex(state, 'gatekeeper.requireAllow'));
  assert.ok(callIndex(state, 'gatekeeper.requireAllow') < callIndex(state, 'organization.findUnique'));
  assert.ok(callIndex(state, 'organization.findUnique') < callIndex(state, 'organizationSetting.upsert'));
}

async function testGatekeeperBlocksBeforeSettingWrite() {
  const denied = createService({
    gatekeeperHandler: () => {
      throw new ForbiddenException('Gatekeeper did not allow the mutation');
    },
  });
  await assert.rejects(
    denied.service.updatePortalMode('org-1', { mode: 'builder' }, 'actor-1'),
    (error: unknown) => error instanceof ForbiddenException,
  );
  assert.equal(denied.state.calls.some((call) => call.fn === 'organizationSetting.upsert'), false);

  const approvalRequired = createService({
    gatekeeperHandler: () => {
      throw new ForbiddenException('Gatekeeper approval is required');
    },
  });
  await assert.rejects(
    approvalRequired.service.updatePortalMode('org-1', { mode: 'builder' }, 'actor-1'),
    (error: unknown) => error instanceof ForbiddenException,
  );
  assert.equal(approvalRequired.state.calls.some((call) => call.fn === 'organization.findUnique'), false);
  assert.equal(approvalRequired.state.calls.some((call) => call.fn === 'organizationSetting.upsert'), false);

  const degraded = createService({
    gatekeeperHandler: () => {
      throw new ServiceUnavailableException('Gatekeeper degraded block');
    },
  });
  await assert.rejects(
    degraded.service.updatePortalMode('org-1', { mode: 'builder' }, 'actor-1'),
    (error: unknown) => error instanceof ServiceUnavailableException,
  );
  assert.equal(degraded.state.calls.some((call) => call.fn === 'organizationSetting.upsert'), false);

  const providerFailure = createService({
    gatekeeperHandler: () => {
      throw new Error('provider failed');
    },
  });
  await assert.rejects(providerFailure.service.updatePortalMode('org-1', { mode: 'builder' }, 'actor-1'));
  assert.equal(providerFailure.state.calls.some((call) => call.fn === 'organizationSetting.upsert'), false);
}

async function testPutUpsertsIdempotentlyAndWritesAuditOutbox() {
  const { service, state } = createService();

  const first = await service.updatePortalMode('org-1', { mode: 'builder' }, 'actor-1');
  const second = await service.updatePortalMode('org-1', { mode: 'simple' }, 'actor-1');

  assert.equal(first.mode, 'builder');
  assert.equal(second.mode, 'simple');
  assert.equal(state.settings.length, 1);
  assert.deepEqual(state.settings[0].value_json, { mode: 'simple' });
  assert.equal(state.outboxEntries.length, 2);
  assert.equal(state.outboxEntries[0].event_type, 'platform.mutation.recorded');
  assert.equal(state.auditLogs.length, 2);
  assert.equal(state.auditLogs[0].actor_user_id, 'actor-1');
  assert.equal((state.auditLogs[0].metadata as { key?: unknown }).key, 'portal.mode');
}

async function testAuditFailureRollsBackSettingUpdate() {
  const { service, state } = createService({ auditCreateError: new Error('audit failed') });

  await assert.rejects(service.updatePortalMode('org-1', { mode: 'builder' }, 'actor-1'));

  assert.equal(state.settings.length, 0);
  assert.equal(state.outboxEntries.length, 0);
  assert.equal(state.auditLogs.length, 0);
}

async function run() {
  await testGetRequiresActorBeforeSettingRead();
  await testGetRejectsCrossOrgAndUnauthorizedActorBeforeSettingRead();
  await testGetReturnsDefaultStoredAndFailsClosedForInvalidStoredValue();
  await testPutRequiresActorBeforeSettingReadsOrWrites();
  await testPutRunsGatekeeperAfterActorAndBeforeSettingWrite();
  await testGatekeeperBlocksBeforeSettingWrite();
  await testPutUpsertsIdempotentlyAndWritesAuditOutbox();
  await testAuditFailureRollsBackSettingUpdate();

  console.log('configuration.service tests passed');
}

void run();
