import assert from 'node:assert/strict';

import { BadRequestException, ForbiddenException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';

import { LeadDeskService } from './lead-desk.service';

function createMocks() {
  const state = {
    gatekeeperCalls: [] as unknown[],
    auditCalls: [] as unknown[],
    outboxCalls: [] as unknown[],
    created: [] as Record<string, unknown>[],
    statusHistory: [] as Record<string, unknown>[],
    assignmentHistory: [] as Record<string, unknown>[],
  };

  const now = new Date('2026-05-24T10:00:00.000Z');

  const db = {
    user: {
      findFirst: async ({ where }: { where: { organization_id: string; id: string } }) => {
        if (where.organization_id === 'org-1' && (where.id === 'actor-1' || where.id === 'assignee-1')) {
          return { id: where.id };
        }
        return null;
      },
    },
    userGroup: {
      findMany: async ({ where }: { where: { organization_id: string; user_id: string } }) => {
        if (where.organization_id === 'org-1' && where.user_id === 'actor-1') {
          return [{ group_id: 'group-1' }];
        }
        return [];
      },
    },
    groupCapability: {
      findFirst: async ({ where }: { where: { capability_key: string } }) => {
        if (
          where.capability_key === 'lead.intake.create' ||
          where.capability_key === 'lead.inbox.view' ||
          where.capability_key === 'lead.detail.view' ||
          where.capability_key === 'lead.status.update' ||
          where.capability_key === 'lead.inbox.assign'
        ) {
          return { id: 'cap-1' };
        }
        return null;
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
        return [
          {
            id: 'lead-1',
            organization_id: 'org-1',
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
        if (where.organization_id === 'org-1' && where.id === 'lead-1') {
          return {
            id: 'lead-1',
            organization_id: 'org-1',
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
    recordMutation: async (_tx: unknown, input: unknown) => {
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

  return { service, state, gatekeeperPreflightService };
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

async function testListLeadsHappyPath() {
  const { service } = createMocks();
  const result = await service.listLeads('org-1', { limit: '10' }, 'actor-1');
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].organization_id, 'org-1');
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
  assert.equal(state.statusHistory.length, 1);
  assert.equal(state.auditCalls.length >= 1, true);
  assert.equal(state.outboxCalls.length >= 1, true);
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

async function run() {
  await testCreateLeadHappyPath();
  await testCreateLeadMissingActorFails();
  await testCreateLeadUnauthorizedActorFails();
  await testCreateLeadCrossOrgDenied();
  await testCreateLeadInvalidPayloadFails();
  await testCreateLeadGatekeeperDenied();
  await testListLeadsHappyPath();
  await testGetLeadDetailHappyPath();
  await testGetLeadDetailCrossOrgNotFound();
  await testUpdateLeadStatusHappyPath();
  await testUpdateLeadStatusMissingActorFails();
  await testUpdateLeadStatusUnauthorizedActorFails();
  await testUpdateLeadStatusCrossOrgDenied();
  await testUpdateLeadStatusInvalidPayloadFails();
  await testUpdateLeadStatusGatekeeperDenied();
  await testUpdateLeadAssignmentHappyPath();
  await testUpdateLeadAssignmentMissingActorFails();
  await testUpdateLeadAssignmentUnauthorizedActorFails();
  await testUpdateLeadAssignmentCrossOrgDenied();
  await testUpdateLeadAssignmentInvalidPayloadFails();
  await testUpdateLeadAssignmentGatekeeperDenied();
  console.log('lead-desk.service tests passed');
}

void run();
