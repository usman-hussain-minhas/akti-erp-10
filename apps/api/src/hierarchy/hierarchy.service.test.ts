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
import { HierarchyClosureService } from './hierarchy-closure.service';
import { HierarchyService } from './hierarchy.service';

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
  unitTypes: Array<Record<string, unknown>>;
  units: Array<Record<string, unknown>>;
  closureRows: Array<Record<string, unknown>>;
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
    unitTypes: [
      {
        id: 'unit-type-1',
        organization_id: 'org-1',
        key: 'division',
        label: 'Division',
        sort_order: 2,
      },
      {
        id: 'unit-type-branch',
        organization_id: 'org-1',
        key: 'branch',
        label: 'Branch',
        sort_order: 1,
      },
      {
        id: 'unit-type-foreign',
        organization_id: 'org-2',
        key: 'division',
        label: 'Foreign Division',
        sort_order: 1,
      },
    ],
    units: [
      {
        id: 'root-unit',
        organization_id: 'org-1',
        unit_type_id: 'unit-type-1',
        parent_unit_id: null,
        key: 'root',
        name: 'Root',
        status: 'active',
      },
      {
        id: 'foreign-parent',
        organization_id: 'org-2',
        unit_type_id: 'unit-type-foreign',
        parent_unit_id: null,
        key: 'foreign-root',
        name: 'Foreign Root',
        status: 'active',
      },
    ],
    closureRows: [
      {
        organization_id: 'org-1',
        ancestor_unit_id: 'root-unit',
        descendant_unit_id: 'root-unit',
        depth: 0,
      },
      {
        organization_id: 'org-2',
        ancestor_unit_id: 'foreign-parent',
        descendant_unit_id: 'foreign-parent',
        depth: 0,
      },
    ],
    auditLogs: [],
    outboxEntries: [],
    transactionOptions: [],
  };

  const prisma = {
    $transaction: async <T>(fn: (tx: unknown) => Promise<T>, transactionOptions: unknown) => {
      state.calls.push({ fn: '$transaction', args: transactionOptions });
      state.transactionOptions.push(transactionOptions);

      const snapshot = {
        unitTypes: cloneRows(state.unitTypes),
        units: cloneRows(state.units),
        closureRows: cloneRows(state.closureRows),
        auditLogs: cloneRows(state.auditLogs),
        outboxEntries: cloneRows(state.outboxEntries),
      };

      try {
        return await fn(prisma);
      } catch (error) {
        state.unitTypes = snapshot.unitTypes;
        state.units = snapshot.units;
        state.closureRows = snapshot.closureRows;
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
    unitType: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        state.calls.push({ fn: 'unitType.create', args: data });
        if (
          state.unitTypes.some((item) => item.organization_id === data.organization_id && item.key === data.key)
        ) {
          throw prismaError('P2002');
        }

        const created = {
          id: `unit-type-${state.unitTypes.length + 1}`,
          ...data,
        };
        state.unitTypes.push(created);
        return created;
      },
      findMany: async ({ where }: { where: { organization_id: string } }) => {
        state.calls.push({ fn: 'unitType.findMany', args: where });
        return state.unitTypes
          .filter((item) => item.organization_id === where.organization_id)
          .sort((left, right) => {
            const sortDiff = Number(left.sort_order) - Number(right.sort_order);
            return sortDiff !== 0 ? sortDiff : String(left.key).localeCompare(String(right.key));
          });
      },
      findFirst: async ({ where }: { where: { organization_id: string; id: string } }) => {
        state.calls.push({ fn: 'unitType.findFirst', args: where });
        return state.unitTypes.find((item) => item.organization_id === where.organization_id && item.id === where.id) ?? null;
      },
    },
    organizationUnit: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        state.calls.push({ fn: 'organizationUnit.create', args: data });
        if (state.units.some((item) => item.organization_id === data.organization_id && item.key === data.key)) {
          throw prismaError('P2002');
        }

        const created = {
          id: `unit-${state.units.length + 1}`,
          ...data,
        };
        state.units.push(created);
        return created;
      },
      findMany: async ({ where }: { where: { organization_id: string } }) => {
        state.calls.push({ fn: 'organizationUnit.findMany', args: where });
        return state.units
          .filter((item) => item.organization_id === where.organization_id)
          .sort((left, right) => String(left.key).localeCompare(String(right.key)));
      },
    },
    organizationUnitClosure: {
      findMany: async ({
        where,
      }: {
        where: { organization_id: string; descendant_unit_id: string };
      }) => {
        state.calls.push({ fn: 'organizationUnitClosure.findMany', args: where });
        return state.closureRows
          .filter(
            (item) =>
              item.organization_id === where.organization_id &&
              item.descendant_unit_id === where.descendant_unit_id,
          )
          .map((item) => ({
            ancestor_unit_id: item.ancestor_unit_id,
            depth: item.depth,
          }));
      },
      createMany: async ({ data }: { data: Array<Record<string, unknown>> }) => {
        state.calls.push({ fn: 'organizationUnitClosure.createMany', args: data });
        state.closureRows.push(...data);
        return { count: data.length };
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

function createGatekeeper(handler?: (input: GatekeeperPreflightInput) => Promise<void> | void): MockGatekeeperPreflight {
  const calls: GatekeeperPreflightInput[] = [];

  return {
    calls,
    requireAllow: async (input: GatekeeperPreflightInput) => {
      calls.push(input);
      await handler?.(input);
      return {} as never;
    },
  } as unknown as MockGatekeeperPreflight;
}

function createService(options?: {
  omitAccessAssignment?: boolean;
  gatekeeper?: MockGatekeeperPreflight;
  auditCreateError?: unknown;
}) {
  const { prisma, state } = createMockPrisma({
    omitAccessAssignment: options?.omitAccessAssignment,
    auditCreateError: options?.auditCreateError,
  });
  const gatekeeper = options?.gatekeeper ?? createGatekeeper();
  const hierarchyClosureService = new HierarchyClosureService(prisma as never);
  const service = new HierarchyService(
    prisma as never,
    hierarchyClosureService,
    new AuditLogService(),
    new EventOutboxService(),
    gatekeeper,
  );

  return { service, state, gatekeeper };
}

function validUnitTypeInput() {
  return {
    key: 'region',
    label: 'Region',
    sort_order: 3,
  };
}

function validUnitInput() {
  return {
    unit_type_id: 'unit-type-1',
    parent_unit_id: 'root-unit',
    key: 'branch-a',
    name: 'Branch A',
    status: 'active',
  };
}

async function testActorProtectionFailsBeforeHierarchyReadsOrWrites() {
  const { service, state, gatekeeper } = createService();

  await assert.rejects(
    service.createUnit('org-1', validUnitInput(), undefined),
    (error: unknown) => error instanceof BadRequestException,
  );

  await assert.rejects(
    service.createUnitType('org-1', validUnitTypeInput(), ' '),
    (error: unknown) => error instanceof BadRequestException,
  );

  assert.equal(gatekeeper.calls.length, 0);
  assert.equal(state.calls.some((call) => call.fn === 'unitType.findFirst'), false);
  assert.equal(state.calls.some((call) => call.fn === 'organizationUnitClosure.findMany'), false);
  assert.equal(state.calls.some((call) => call.fn === 'organizationUnit.create'), false);
  assert.equal(state.calls.some((call) => call.fn === 'unitType.create'), false);
}

async function testInvalidCrossOrgAndUnauthorizedActorFailBeforeWrites() {
  const crossOrg = createService();

  await assert.rejects(
    crossOrg.service.createUnitType('org-1', validUnitTypeInput(), 'actor-foreign'),
    (error: unknown) => error instanceof BadRequestException,
  );
  assert.equal(crossOrg.state.calls.some((call) => call.fn === 'unitType.create'), false);

  const unauthorized = createService({ omitAccessAssignment: true });
  await assert.rejects(
    unauthorized.service.createUnitType('org-1', validUnitTypeInput(), 'actor-no-access'),
    (error: unknown) => error instanceof BadRequestException,
  );
  assert.equal(unauthorized.state.calls.some((call) => call.fn === 'unitType.create'), false);
}

async function testGatekeeperBlocksBeforeHierarchyResourceReadsOrWrites() {
  const denied = createService({
    gatekeeper: createGatekeeper(() => {
      throw new ForbiddenException('Gatekeeper did not allow the mutation');
    }),
  });

  await assert.rejects(
    denied.service.createUnit('org-1', { ...validUnitInput(), unit_type_id: 'missing-unit-type' }, 'actor-1'),
    (error: unknown) => error instanceof ForbiddenException,
  );

  assert.equal(denied.gatekeeper.calls.length, 1);
  assert.equal(denied.state.calls.some((call) => call.fn === 'unitType.findFirst'), false);
  assert.equal(denied.state.calls.some((call) => call.fn === 'organizationUnit.create'), false);

  const approvalRequired = createService({
    gatekeeper: createGatekeeper(() => {
      throw new ForbiddenException('Gatekeeper approval is required');
    }),
  });
  await assert.rejects(
    approvalRequired.service.createUnitType('org-1', validUnitTypeInput(), 'actor-1'),
    (error: unknown) => error instanceof ForbiddenException,
  );
  assert.equal(approvalRequired.gatekeeper.calls.length, 1);
  assert.equal(approvalRequired.state.calls.some((call) => call.fn === 'organization.findUnique'), false);
  assert.equal(approvalRequired.state.calls.some((call) => call.fn === 'unitType.create'), false);

  const degraded = createService({
    gatekeeper: createGatekeeper(() => {
      throw new ServiceUnavailableException('Gatekeeper degraded block');
    }),
  });
  await assert.rejects(
    degraded.service.createUnitType('org-1', validUnitTypeInput(), 'actor-1'),
    (error: unknown) => error instanceof ServiceUnavailableException,
  );
  assert.equal(degraded.state.calls.some((call) => call.fn === 'organization.findUnique'), false);

  const providerFailure = createService({
    gatekeeper: createGatekeeper(() => {
      throw new Error('provider failed');
    }),
  });
  await assert.rejects(providerFailure.service.createUnitType('org-1', validUnitTypeInput(), 'actor-1'));
  assert.equal(providerFailure.state.calls.some((call) => call.fn === 'unitType.create'), false);
}

async function testUnitTypeCreateWritesAuditOutboxAndMapsDuplicateConflict() {
  const { service, state, gatekeeper } = createService();

  const created = await service.createUnitType('org-1', validUnitTypeInput(), 'actor-1');

  assert.equal(created.key, 'region');
  assert.equal(gatekeeper.calls.length, 1);
  assert.equal(gatekeeper.calls[0].entity_type, 'organization.unit-type');
  assert.equal(gatekeeper.calls[0].action_key, 'hierarchy.unit-type.created');
  assert.equal(state.outboxEntries.length, 1);
  assert.equal(state.outboxEntries[0].event_type, 'platform.mutation.recorded');
  assert.equal(state.auditLogs.length, 1);
  assert.equal(state.auditLogs[0].actor_user_id, 'actor-1');

  await assert.rejects(
    service.createUnitType('org-1', { key: 'division', label: 'Division', sort_order: 1 }, 'actor-1'),
    (error: unknown) => error instanceof ConflictException,
  );
}

async function testUnitTypeListIsActorProtectedAndOrganizationScoped() {
  const { service, state } = createService();

  await assert.rejects(
    service.listUnitTypes('org-1', undefined),
    (error: unknown) => error instanceof BadRequestException,
  );

  const listed = await service.listUnitTypes('org-1', 'actor-1');

  assert.deepEqual(
    listed.items.map((item) => item.key),
    ['branch', 'division'],
  );
  assert.equal(listed.items.every((item) => item.organization_id === 'org-1'), true);
  assert.equal(state.calls.some((call) => call.fn === 'unitType.findMany'), true);
}

async function testUnitCreateValidatesUnitTypeAndParentOrganization() {
  const missingUnitType = createService();

  await assert.rejects(
    missingUnitType.service.createUnit('org-1', { ...validUnitInput(), unit_type_id: 'unit-type-foreign' }, 'actor-1'),
    (error: unknown) => error instanceof BadRequestException,
  );
  assert.equal(missingUnitType.state.calls.some((call) => call.fn === 'organizationUnit.create'), false);

  const crossOrgParent = createService();
  await assert.rejects(
    crossOrgParent.service.createUnit(
      'org-1',
      {
        ...validUnitInput(),
        parent_unit_id: 'foreign-parent',
      },
      'actor-1',
    ),
    (error: unknown) => error instanceof BadRequestException,
  );
  assert.equal(crossOrgParent.state.calls.some((call) => call.fn === 'organizationUnit.create'), false);
}

async function testUnitCreateUsesClosureAndWritesAuditOutbox() {
  const { service, state, gatekeeper } = createService();

  const created = await service.createUnit('org-1', validUnitInput(), 'actor-1');

  assert.equal(created.key, 'branch-a');
  assert.equal(gatekeeper.calls.length, 1);
  assert.equal(gatekeeper.calls[0].entity_type, 'organization.unit');
  assert.equal(gatekeeper.calls[0].action_key, 'hierarchy.unit.created');
  assert.equal(state.calls.some((call) => call.fn === 'organizationUnitClosure.findMany'), true);
  assert.equal(state.calls.some((call) => call.fn === 'organizationUnitClosure.createMany'), true);
  assert.equal(state.outboxEntries.length, 1);
  assert.equal(state.auditLogs.length, 1);

  const closureRowsForCreated = state.closureRows.filter((row) => row.descendant_unit_id === created.id);
  assert.deepEqual(
    closureRowsForCreated.map((row) => row.depth).sort(),
    [0, 1],
  );
}

async function testUnitCreateDuplicateRollsBackAndAuditFailureRollsBack() {
  const duplicate = createService();
  await assert.rejects(
    duplicate.service.createUnit('org-1', { ...validUnitInput(), key: 'root' }, 'actor-1'),
    (error: unknown) => error instanceof ConflictException,
  );

  const auditFailure = createService({ auditCreateError: new Error('audit failed') });
  const initialUnitCount = auditFailure.state.units.length;
  await assert.rejects(auditFailure.service.createUnit('org-1', validUnitInput(), 'actor-1'));
  assert.equal(auditFailure.state.units.length, initialUnitCount);
  assert.equal(auditFailure.state.outboxEntries.length, 0);
  assert.equal(auditFailure.state.auditLogs.length, 0);
}

async function testUnitListIsActorProtectedAndOrganizationScoped() {
  const { service, state } = createService();

  await assert.rejects(
    service.listUnits('org-1', 'actor-foreign'),
    (error: unknown) => error instanceof BadRequestException,
  );

  const listed = await service.listUnits('org-1', 'actor-1');

  assert.deepEqual(
    listed.items.map((item) => item.key),
    ['root'],
  );
  assert.equal(listed.items.every((item) => item.organization_id === 'org-1'), true);
  assert.equal(state.calls.some((call) => call.fn === 'organizationUnit.findMany'), true);
}

async function run() {
  await testActorProtectionFailsBeforeHierarchyReadsOrWrites();
  await testInvalidCrossOrgAndUnauthorizedActorFailBeforeWrites();
  await testGatekeeperBlocksBeforeHierarchyResourceReadsOrWrites();
  await testUnitTypeCreateWritesAuditOutboxAndMapsDuplicateConflict();
  await testUnitTypeListIsActorProtectedAndOrganizationScoped();
  await testUnitCreateValidatesUnitTypeAndParentOrganization();
  await testUnitCreateUsesClosureAndWritesAuditOutbox();
  await testUnitCreateDuplicateRollsBackAndAuditFailureRollsBack();
  await testUnitListIsActorProtectedAndOrganizationScoped();

  console.log('hierarchy.service tests passed');
}

void run();
