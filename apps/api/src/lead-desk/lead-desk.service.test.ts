import assert from 'node:assert/strict';

import { BadRequestException, ForbiddenException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import {
  LeadDeskLeadAssignedEventSchema,
  LeadDeskLeadCreatedEventSchema,
  LeadDeskLeadStatusUpdatedEventSchema,
} from '@akti/contracts/lead-desk-core';

import { GatekeeperPreflightService } from '../gatekeeper/gatekeeper-preflight.service';
import { LeadDeskService } from './lead-desk.service';

function createMocks() {
  const state = {
    gatekeeperCalls: [] as unknown[],
    auditCalls: [] as unknown[],
    outboxCalls: [] as unknown[],
    created: [] as Record<string, unknown>[],
    statusHistory: [] as Record<string, unknown>[],
    assignmentHistory: [] as Record<string, unknown>[],
    moduleStatuses: new Map<string, string>([
      ['core.access', 'available'],
      ['engagement.gateway', 'available'],
      ['lead.desk', 'available'],
    ]),
  };

  const now = new Date('2026-05-24T10:00:00.000Z');
  const capabilityScopes = new Map<string, string[]>([
    ['lead.intake.create', ['organization', 'own_unit']],
    ['lead.inbox.view', ['organization', 'own_unit', 'assigned_records']],
    ['lead.detail.view', ['organization', 'own_unit', 'assigned_records']],
    ['lead.status.update', ['organization', 'own_unit', 'assigned_records']],
    ['lead.inbox.assign', ['organization', 'own_unit']],
  ]);

  const db = {
    moduleRegistryEntry: {
      findMany: async ({ where }: { where: { module_key: { in: string[] } } }) =>
        where.module_key.in.flatMap((moduleKey) => {
          const status = state.moduleStatuses.get(moduleKey);
          return status ? [{ module_key: moduleKey, status }] : [];
        }),
    },
    user: {
      findFirst: async ({ where }: { where: { organization_id: string; id: string } }) => {
        if (where.organization_id === 'org-1' && where.id === 'actor-1') {
          return { id: 'actor-1', primary_unit_id: 'unit-1' };
        }
        if (where.organization_id === 'org-1' && where.id === 'actor-3') {
          return { id: 'actor-3', primary_unit_id: 'unit-2' };
        }
        if (where.organization_id === 'org-1' && where.id === 'assignee-1') {
          return { id: 'assignee-1', primary_unit_id: 'unit-2' };
        }
        return null;
      },
    },
    userGroup: {
      findMany: async ({ where }: { where: { organization_id: string; user_id: string } }) => {
        if (where.organization_id === 'org-1' && where.user_id === 'actor-1') {
          return [{ group_id: 'group-1' }];
        }
        if (where.organization_id === 'org-1' && where.user_id === 'actor-3') {
          return [{ group_id: 'group-3' }];
        }
        return [];
      },
    },
    groupCapability: {
      findMany: async ({
        where,
      }: {
        where: { capability_key: string; organization_id: string; group_id: { in: string[] }; scope_type: { in: string[] } };
      }) => {
        if (where.organization_id !== 'org-1') {
          return [];
        }
        const allowed = capabilityScopes.get(where.capability_key) ?? [];
        const scopeUnitIdForOwnUnit = where.group_id.in.includes('group-3') ? 'unit-2' : 'unit-1';
        return allowed
          .filter((scopeType) => where.scope_type.in.includes(scopeType))
          .map((scopeType) => ({
            scope_type: scopeType,
            scope_unit_id: scopeType === 'own_unit' ? scopeUnitIdForOwnUnit : null,
          }));
      },
    },
    organizationUnitClosure: {
      findMany: async ({ where }: { where: { organization_id: string; ancestor_unit_id: { in: string[] } } }) => {
        if (where.organization_id !== 'org-1') {
          return [];
        }
        if (where.ancestor_unit_id.in.includes('unit-1')) {
          return [{ descendant_unit_id: 'unit-1' }, { descendant_unit_id: 'unit-1-1' }];
        }
        return [];
      },
    },
    leadRecord: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const created = {
          id: 'lead-1',
          ...data,
          created_at: now,
          updated_at: now,
        };
        state.created.push(created);
        return created;
      },
      findMany: async ({ where }: { where: { organization_id: string; status?: string; assigned_user_id?: string } }) => {
        if (where.organization_id !== 'org-1') {
          return [];
        }
        if (
          typeof where === 'object' &&
          where !== null &&
          'AND' in where &&
          Array.isArray((where as { AND?: unknown[] }).AND) &&
          ((where as { AND: unknown[] }).AND[0] as { OR?: Array<{ assigned_user_id?: string; organization_unit_id?: { in: string[] } }> })
            ?.OR
        ) {
          const scopeOr = ((where as { AND: Array<{ OR?: Array<{ assigned_user_id?: string; organization_unit_id?: { in: string[] } }> }> }).AND[0].OR) ?? [];
          const allowAssigned = scopeOr.some((item) => item.assigned_user_id === 'actor-1');
          const allowUnit = scopeOr.some((item) => item.organization_unit_id?.in.includes('unit-1'));
          if (!allowAssigned && !allowUnit) {
            return [];
          }
        }
        return [
          {
            id: 'lead-1',
            organization_id: 'org-1',
            organization_unit_id: 'unit-1',
            full_name: 'Lead One',
            phone_e164: '+923001234567',
            source_ref: 'web-form',
            status: 'new',
            assigned_user_id: null,
            created_at: now,
            updated_at: now,
          },
        ];
      },
      findFirst: async ({ where }: { where: { organization_id: string; id: string } }) => {
        const hasScopeOr =
          typeof where === 'object' &&
          where !== null &&
          'AND' in where &&
          Array.isArray((where as { AND?: unknown[] }).AND) &&
          ((where as { AND: unknown[] }).AND[0] as { OR?: Array<{ assigned_user_id?: string; organization_unit_id?: { in: string[] } }> })
            ?.OR;
        const scopeOr = hasScopeOr
          ? (((where as { AND: Array<{ OR?: Array<{ assigned_user_id?: string; organization_unit_id?: { in: string[] } }> }> }).AND[0].OR) ?? [])
          : null;
        const scopeAllowed =
          scopeOr === null ||
          scopeOr.some((item) => item.assigned_user_id === 'actor-1') ||
          scopeOr.some((item) => item.organization_unit_id?.in.includes('unit-1'));

        if (where.organization_id === 'org-1' && where.id === 'lead-1' && scopeAllowed) {
          return {
            id: 'lead-1',
            organization_id: 'org-1',
            organization_unit_id: 'unit-1',
            full_name: 'Lead One',
            phone_e164: '+923001234567',
            source_ref: 'web-form',
            status: 'new',
            assigned_user_id: null,
            created_at: now,
            updated_at: now,
          };
        }
        return null;
      },
      update: async ({
        where,
        data,
      }: {
        where: { organization_id_id: { organization_id: string; id: string } };
        data: { status?: string; assigned_user_id?: string };
      }) => {
        return {
          id: where.organization_id_id.id,
          organization_id: where.organization_id_id.organization_id,
          full_name: 'Lead One',
          phone_e164: '+923001234567',
          source_ref: 'web-form',
          organization_unit_id: 'unit-1',
          status: data.status ?? 'new',
          assigned_user_id: data.assigned_user_id ?? null,
          created_at: now,
          updated_at: now,
        };
      },
    },
    leadStatusHistory: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        state.statusHistory.push(data);
        return { id: 'history-1', ...data };
      },
    },
    leadAssignmentHistory: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        state.assignmentHistory.push(data);
        return { id: 'assign-history-1', ...data };
      },
    },
    $transaction: async <T>(fn: (tx: unknown) => Promise<T>) => fn(db),
  };

  const gatekeeperPreflightService = {
    requireAllow: async (input: unknown) => {
      state.gatekeeperCalls.push(input);
      return { decision: 'allow' };
    },
  };

  const auditLogService = {
    writeAuditLog: async (_tx: unknown, input: unknown) => {
      state.auditCalls.push(input);
      return { written: true };
    },
  };

  const eventOutboxService = {
    recordEvent: async (_tx: unknown, input: unknown) => {
      state.outboxCalls.push(input);
      return { written: true };
    },
  };

  const service = new LeadDeskService(
    db as never,
    auditLogService as never,
    eventOutboxService as never,
    gatekeeperPreflightService as never,
  );

  return { service, state, gatekeeperPreflightService, db, auditLogService, eventOutboxService, capabilityScopes };
}

function createMocksWithRealGatekeeper() {
  const { state, db, auditLogService, eventOutboxService } = createMocks();
  const service = new LeadDeskService(
    db as never,
    auditLogService as never,
    eventOutboxService as never,
    new GatekeeperPreflightService() as never,
  );
  return { service, state };
}

function createMocksWithHistoryFailure(kind: 'status' | 'assignment') {
  const base = createMocks();
  if (kind === 'status') {
    (base.db.leadStatusHistory.create as unknown as (args: unknown) => Promise<unknown>) = async () => {
      throw new Error('status history write failed');
    };
  }

  if (kind === 'assignment') {
    (base.db.leadAssignmentHistory.create as unknown as (args: unknown) => Promise<unknown>) = async () => {
      throw new Error('assignment history write failed');
    };
  }

  const service = new LeadDeskService(
    base.db as never,
    base.auditLogService as never,
    base.eventOutboxService as never,
    base.gatekeeperPreflightService as never,
  );

  return { service, state: base.state };
}

function createInput(overrides?: Partial<Record<string, unknown>>) {
  return {
    organization_id: 'org-1',
    actor_user_id: 'actor-1',
    source_ref: 'web-form',
    full_name: 'Lead One',
    phone_e164: '+923001234567',
    notes: 'Requested callback',
    requested_at: '2026-05-24T10:00:00.000Z',
    ...(overrides ?? {}),
  };
}

async function testCreateLeadHappyPath() {
  const { service, state } = createMocks();
  const result = await service.createLead('org-1', createInput(), 'actor-1');
  assert.equal(result.organization_id, 'org-1');
  assert.equal(result.status, 'new');
  assert.equal(state.gatekeeperCalls.length, 1);
  assert.deepEqual((state.gatekeeperCalls[0] as { module_health: unknown }).module_health, {
    'lead.desk': 'healthy',
  });
  assert.deepEqual((state.gatekeeperCalls[0] as { dependency_health: unknown }).dependency_health, {
    'core.access': 'healthy',
    'engagement.gateway': 'healthy',
  });
  assert.equal(state.auditCalls.length, 1);
  assert.equal(state.outboxCalls.length, 1);
  assert.equal((state.outboxCalls[0] as { event_type: string }).event_type, 'lead.desk.lead.created');
  assert.equal(LeadDeskLeadCreatedEventSchema.safeParse((state.outboxCalls[0] as { payload: unknown }).payload).success, true);
}

async function testCreateLeadHappyPathUsesRealGatekeeper() {
  const { service, state } = createMocksWithRealGatekeeper();
  const result = await service.createLead('org-1', createInput(), 'actor-1');
  assert.equal(result.organization_id, 'org-1');
  assert.equal(result.status, 'new');
  assert.equal(state.auditCalls.length, 1);
  assert.equal(state.outboxCalls.length, 1);
}

async function testCreateLeadMissingActorFails() {
  const { service } = createMocks();
  await assert.rejects(service.createLead('org-1', createInput(), ''), BadRequestException);
}

async function testCreateLeadUnauthorizedActorFails() {
  const { service } = createMocks();
  await assert.rejects(service.createLead('org-1', createInput({ actor_user_id: 'actor-2' }), 'actor-2'), ForbiddenException);
}

async function testCreateLeadCrossOrgDenied() {
  const { service } = createMocks();
  await assert.rejects(service.createLead('org-2', createInput({ organization_id: 'org-2' }), 'actor-1'), ForbiddenException);
}

async function testCreateLeadInvalidPayloadFails() {
  const { service } = createMocks();
  await assert.rejects(service.createLead('org-1', { invalid: true }, 'actor-1'), BadRequestException);
}

async function testCreateLeadGatekeeperDenied() {
  const { service, gatekeeperPreflightService } = createMocks();
  gatekeeperPreflightService.requireAllow = async () => {
    throw new ServiceUnavailableException('degraded');
  };
  await assert.rejects(service.createLead('org-1', createInput(), 'actor-1'), ServiceUnavailableException);
}

async function testCreateLeadRealGatekeeperUsesRegistryHealthContext() {
  const { service, state } = createMocksWithRealGatekeeper();
  state.moduleStatuses.set('engagement.gateway', 'degraded');

  await assert.rejects(service.createLead('org-1', createInput(), 'actor-1'), ServiceUnavailableException);
  assert.equal(state.created.length, 0);
  assert.equal(state.auditCalls.length, 0);
  assert.equal(state.outboxCalls.length, 0);
}

async function testListLeadsHappyPath() {
  const { service } = createMocks();
  const result = await service.listLeads('org-1', { limit: '10' }, 'actor-1');
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].organization_id, 'org-1');
}

async function testListLeadsAssignedRecordsScopeOnly() {
  const { service, capabilityScopes } = createMocks();
  capabilityScopes.set('lead.inbox.view', ['assigned_records']);
  const result = await service.listLeads('org-1', { limit: '10' }, 'actor-1');
  assert.equal(result.items.length, 1);
}

async function testListLeadsOwnUnitScopeOnly() {
  const { service, capabilityScopes } = createMocks();
  capabilityScopes.set('lead.inbox.view', ['own_unit']);
  const result = await service.listLeads('org-1', { limit: '10' }, 'actor-1');
  assert.equal(result.items.length, 1);
}

async function testGetLeadDetailHappyPath() {
  const { service } = createMocks();
  const result = await service.getLeadDetail('org-1', 'lead-1', 'actor-1');
  assert.equal(result.lead_id, 'lead-1');
}

async function testGetLeadDetailCrossOrgNotFound() {
  const { service } = createMocks();
  await assert.rejects(service.getLeadDetail('org-1', 'lead-2', 'actor-1'), NotFoundException);
}

async function testGetLeadDetailUnauthorizedDoesNotRevealExistence() {
  const { service, capabilityScopes } = createMocks();
  capabilityScopes.set('lead.detail.view', ['assigned_records']);
  await assert.rejects(service.getLeadDetail('org-1', 'lead-1', 'actor-3'), NotFoundException);
}

async function testUpdateLeadStatusHappyPath() {
  const { service, state } = createMocks();
  const result = await service.updateLeadStatus(
    'org-1',
    'lead-1',
    {
      status: 'contacted',
      reason: 'Reached by phone',
      requested_at: '2026-05-24T10:10:00.000Z',
    },
    'actor-1',
  );
  assert.equal(result.status, 'contacted');
  assert.deepEqual((state.gatekeeperCalls[state.gatekeeperCalls.length - 1] as { module_health: unknown }).module_health, {
    'lead.desk': 'healthy',
  });
  assert.deepEqual(
    (state.gatekeeperCalls[state.gatekeeperCalls.length - 1] as { dependency_health: unknown }).dependency_health,
    {
      'core.access': 'healthy',
      'engagement.gateway': 'healthy',
    },
  );
  assert.equal(state.statusHistory.length, 1);
  assert.equal(state.auditCalls.length >= 1, true);
  assert.equal(state.outboxCalls.length >= 1, true);
  assert.equal((state.outboxCalls[state.outboxCalls.length - 1] as { event_type: string }).event_type, 'lead.desk.lead.status.updated');
  assert.equal(
    LeadDeskLeadStatusUpdatedEventSchema.safeParse(
      (state.outboxCalls[state.outboxCalls.length - 1] as { payload: unknown }).payload,
    ).success,
    true,
  );
}

async function testUpdateLeadStatusHappyPathUsesRealGatekeeper() {
  const { service, state } = createMocksWithRealGatekeeper();
  const result = await service.updateLeadStatus(
    'org-1',
    'lead-1',
    {
      status: 'contacted',
      reason: 'Reached by phone',
      requested_at: '2026-05-24T10:10:00.000Z',
    },
    'actor-1',
  );
  assert.equal(result.status, 'contacted');
  assert.equal(state.statusHistory.length, 1);
}

async function testUpdateLeadStatusMissingActorFails() {
  const { service } = createMocks();
  await assert.rejects(
    service.updateLeadStatus(
      'org-1',
      'lead-1',
      {
        status: 'contacted',
        requested_at: '2026-05-24T10:10:00.000Z',
      },
      '',
    ),
    BadRequestException,
  );
}

async function testUpdateLeadStatusUnauthorizedActorFails() {
  const { service } = createMocks();
  await assert.rejects(
    service.updateLeadStatus(
      'org-1',
      'lead-1',
      {
        status: 'qualified',
        requested_at: '2026-05-24T10:10:00.000Z',
      },
      'actor-2',
    ),
    ForbiddenException,
  );
}

async function testUpdateLeadStatusCrossOrgDenied() {
  const { service } = createMocks();
  await assert.rejects(
    service.updateLeadStatus(
      'org-2',
      'lead-1',
      {
        status: 'qualified',
        requested_at: '2026-05-24T10:10:00.000Z',
      },
      'actor-1',
    ),
    ForbiddenException,
  );
}

async function testUpdateLeadStatusDeniedOutsideScope() {
  const { service, capabilityScopes } = createMocks();
  capabilityScopes.set('lead.status.update', ['assigned_records']);
  await assert.rejects(
    service.updateLeadStatus(
      'org-1',
      'lead-1',
      {
        status: 'qualified',
        requested_at: '2026-05-24T10:10:00.000Z',
      },
      'actor-3',
    ),
    NotFoundException,
  );
}

async function testUpdateLeadStatusInvalidPayloadFails() {
  const { service } = createMocks();
  await assert.rejects(
    service.updateLeadStatus(
      'org-1',
      'lead-1',
      {
        status: 'invalid-status',
        requested_at: 'not-a-date',
      },
      'actor-1',
    ),
    BadRequestException,
  );
}

async function testUpdateLeadStatusGatekeeperDenied() {
  const { service, gatekeeperPreflightService } = createMocks();
  gatekeeperPreflightService.requireAllow = async () => {
    throw new ServiceUnavailableException('degraded');
  };
  await assert.rejects(
    service.updateLeadStatus(
      'org-1',
      'lead-1',
      {
        status: 'contacted',
        requested_at: '2026-05-24T10:10:00.000Z',
      },
      'actor-1',
    ),
    ServiceUnavailableException,
  );
}

async function testUpdateLeadStatusHistoryFailureDoesNotWriteAuditOrOutbox() {
  const { service, state } = createMocksWithHistoryFailure('status');
  await assert.rejects(
    service.updateLeadStatus(
      'org-1',
      'lead-1',
      {
        status: 'contacted',
        requested_at: '2026-05-24T10:10:00.000Z',
      },
      'actor-1',
    ),
  );
  assert.equal(state.auditCalls.length, 0);
  assert.equal(state.outboxCalls.length, 0);
}

async function testUpdateLeadAssignmentHappyPath() {
  const { service, state } = createMocks();
  const result = await service.updateLeadAssignment(
    'org-1',
    'lead-1',
    {
      assigned_user_id: 'assignee-1',
      requested_at: '2026-05-24T10:20:00.000Z',
    },
    'actor-1',
  );
  assert.equal(result.assigned_user_id, 'assignee-1');
  assert.deepEqual((state.gatekeeperCalls[state.gatekeeperCalls.length - 1] as { module_health: unknown }).module_health, {
    'lead.desk': 'healthy',
  });
  assert.deepEqual(
    (state.gatekeeperCalls[state.gatekeeperCalls.length - 1] as { dependency_health: unknown }).dependency_health,
    {
      'core.access': 'healthy',
      'engagement.gateway': 'healthy',
    },
  );
  assert.equal(state.assignmentHistory.length, 1);
  assert.equal((state.outboxCalls[state.outboxCalls.length - 1] as { event_type: string }).event_type, 'lead.desk.lead.assigned');
  assert.equal(
    LeadDeskLeadAssignedEventSchema.safeParse(
      (state.outboxCalls[state.outboxCalls.length - 1] as { payload: unknown }).payload,
    ).success,
    true,
  );
}

async function testUpdateLeadAssignmentHappyPathUsesRealGatekeeper() {
  const { service, state } = createMocksWithRealGatekeeper();
  const result = await service.updateLeadAssignment(
    'org-1',
    'lead-1',
    {
      assigned_user_id: 'assignee-1',
      requested_at: '2026-05-24T10:20:00.000Z',
    },
    'actor-1',
  );
  assert.equal(result.assigned_user_id, 'assignee-1');
  assert.equal(state.assignmentHistory.length, 1);
}

async function testUpdateLeadAssignmentMissingActorFails() {
  const { service } = createMocks();
  await assert.rejects(
    service.updateLeadAssignment(
      'org-1',
      'lead-1',
      {
        assigned_user_id: 'assignee-1',
        requested_at: '2026-05-24T10:20:00.000Z',
      },
      '',
    ),
    BadRequestException,
  );
}

async function testUpdateLeadAssignmentUnauthorizedActorFails() {
  const { service } = createMocks();
  await assert.rejects(
    service.updateLeadAssignment(
      'org-1',
      'lead-1',
      {
        assigned_user_id: 'assignee-1',
        requested_at: '2026-05-24T10:20:00.000Z',
      },
      'actor-2',
    ),
    ForbiddenException,
  );
}

async function testUpdateLeadAssignmentCrossOrgDenied() {
  const { service } = createMocks();
  await assert.rejects(
    service.updateLeadAssignment(
      'org-2',
      'lead-1',
      {
        assigned_user_id: 'assignee-1',
        requested_at: '2026-05-24T10:20:00.000Z',
      },
      'actor-1',
    ),
    ForbiddenException,
  );
}

async function testUpdateLeadAssignmentDeniedOutsideScope() {
  const { service, capabilityScopes } = createMocks();
  capabilityScopes.set('lead.inbox.assign', ['own_unit']);
  await assert.rejects(
    service.updateLeadAssignment(
      'org-1',
      'lead-1',
      {
        assigned_user_id: 'assignee-1',
        requested_at: '2026-05-24T10:20:00.000Z',
      },
      'actor-3',
    ),
    NotFoundException,
  );
}

async function testUpdateLeadAssignmentInvalidPayloadFails() {
  const { service } = createMocks();
  await assert.rejects(
    service.updateLeadAssignment(
      'org-1',
      'lead-1',
      {
        assigned_user_id: '',
        requested_at: 'not-a-date',
      },
      'actor-1',
    ),
    BadRequestException,
  );
}

async function testUpdateLeadAssignmentGatekeeperDenied() {
  const { service, gatekeeperPreflightService } = createMocks();
  gatekeeperPreflightService.requireAllow = async () => {
    throw new ServiceUnavailableException('degraded');
  };
  await assert.rejects(
    service.updateLeadAssignment(
      'org-1',
      'lead-1',
      {
        assigned_user_id: 'assignee-1',
        requested_at: '2026-05-24T10:20:00.000Z',
      },
      'actor-1',
    ),
    ServiceUnavailableException,
  );
}

async function testUpdateLeadAssignmentHistoryFailureDoesNotWriteAuditOrOutbox() {
  const { service, state } = createMocksWithHistoryFailure('assignment');
  await assert.rejects(
    service.updateLeadAssignment(
      'org-1',
      'lead-1',
      {
        assigned_user_id: 'assignee-1',
        requested_at: '2026-05-24T10:20:00.000Z',
      },
      'actor-1',
    ),
  );
  assert.equal(state.auditCalls.length, 0);
  assert.equal(state.outboxCalls.length, 0);
}

async function run() {
  await testCreateLeadHappyPath();
  await testCreateLeadHappyPathUsesRealGatekeeper();
  await testCreateLeadMissingActorFails();
  await testCreateLeadUnauthorizedActorFails();
  await testCreateLeadCrossOrgDenied();
  await testCreateLeadInvalidPayloadFails();
  await testCreateLeadGatekeeperDenied();
  await testCreateLeadRealGatekeeperUsesRegistryHealthContext();
  await testListLeadsHappyPath();
  await testListLeadsAssignedRecordsScopeOnly();
  await testListLeadsOwnUnitScopeOnly();
  await testGetLeadDetailHappyPath();
  await testGetLeadDetailCrossOrgNotFound();
  await testGetLeadDetailUnauthorizedDoesNotRevealExistence();
  await testUpdateLeadStatusHappyPath();
  await testUpdateLeadStatusHappyPathUsesRealGatekeeper();
  await testUpdateLeadStatusMissingActorFails();
  await testUpdateLeadStatusUnauthorizedActorFails();
  await testUpdateLeadStatusCrossOrgDenied();
  await testUpdateLeadStatusDeniedOutsideScope();
  await testUpdateLeadStatusInvalidPayloadFails();
  await testUpdateLeadStatusGatekeeperDenied();
  await testUpdateLeadStatusHistoryFailureDoesNotWriteAuditOrOutbox();
  await testUpdateLeadAssignmentHappyPath();
  await testUpdateLeadAssignmentHappyPathUsesRealGatekeeper();
  await testUpdateLeadAssignmentMissingActorFails();
  await testUpdateLeadAssignmentUnauthorizedActorFails();
  await testUpdateLeadAssignmentCrossOrgDenied();
  await testUpdateLeadAssignmentDeniedOutsideScope();
  await testUpdateLeadAssignmentInvalidPayloadFails();
  await testUpdateLeadAssignmentGatekeeperDenied();
  await testUpdateLeadAssignmentHistoryFailureDoesNotWriteAuditOrOutbox();
  console.log('lead-desk.service tests passed');
}

void run();
