import assert from 'node:assert/strict';

import { BadRequestException, ForbiddenException, ServiceUnavailableException } from '@nestjs/common';
import { EngagementGatewayRequestRecordedEventSchema } from '@akti/contracts/engagement-gateway-lite';

import { GatekeeperPreflightService } from '../gatekeeper/gatekeeper-preflight.service';
import { EngagementGatewayService } from './engagement-gateway.service';

function createMocks() {
  const state = {
    gatekeeperCalls: [] as unknown[],
    auditCalls: [] as unknown[],
    outboxCalls: [] as unknown[],
    stubDispatchCalls: [] as unknown[],
    stubInboundCalls: [] as unknown[],
    persistedRequests: [] as Array<Record<string, unknown>>,
    capabilityAssignmentScopes: new Map<string, string>([
      ['engagement.gateway.request.create', 'organization'],
      ['engagement.gateway.health.read', 'organization'],
    ]),
    moduleStatuses: new Map<string, string>([
      ['core.access', 'available'],
      ['engagement.gateway', 'available'],
    ]),
  };

  const prisma = {
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
          return { id: 'actor-1' };
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
      findFirst: async ({ where }: { where: { capability_key: string; scope_type: { in: string[] } } }) => {
        const assignmentScope = state.capabilityAssignmentScopes.get(where.capability_key);
        if (
          assignmentScope &&
          where.scope_type.in.includes(assignmentScope)
        ) {
          return { id: 'cap-1' };
        }
        return null;
      },
    },
    engagementGatewayRequest: {
      findFirst: async ({ where }: { where: { organization_id: string; idempotency_key: string } }) => {
        const found = state.persistedRequests.find(
          (item) => item.organization_id === where.organization_id && item.idempotency_key === where.idempotency_key,
        );
        if (!found) {
          return null;
        }
        return {
          id: found.id as string,
          organization_id: found.organization_id as string,
          status: found.status as string,
          idempotency_key: found.idempotency_key as string,
          recorded_at: found.recorded_at as Date,
        };
      },
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const existing = state.persistedRequests.find(
          (item) => item.organization_id === data.organization_id && item.idempotency_key === data.idempotency_key,
        );
        if (existing) {
          throw new Error('duplicate idempotency key');
        }
        const created = {
          id: `gateway_request_${state.persistedRequests.length + 1}`,
          ...data,
          recorded_at: new Date('2026-05-24T10:00:00.000Z'),
        };
        state.persistedRequests.push(created);
        return created;
      },
    },
    $transaction: async <T>(fn: (tx: unknown) => Promise<T>) => fn(prisma),
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

  const whatsappStubProvider = {
    dispatchOutbound: (input: unknown) => {
      state.stubDispatchCalls.push(input);
      return { dispatch_status: 'accepted_stub' };
    },
    simulateInboundReceipt: (input: unknown) => {
      state.stubInboundCalls.push(input);
      return { receipt_status: 'delivered_stub' };
    },
  };

  const service = new EngagementGatewayService(
    prisma as never,
    auditLogService as never,
    eventOutboxService as never,
    gatekeeperPreflightService as never,
    whatsappStubProvider as never,
  );

  return { service, state, gatekeeperPreflightService, prisma, auditLogService, eventOutboxService, whatsappStubProvider };
}

function createMocksWithRealGatekeeper() {
  const { state, prisma, auditLogService, eventOutboxService, whatsappStubProvider } = createMocks();
  const realGatekeeperService = new GatekeeperPreflightService();
  const realService = new EngagementGatewayService(
    prisma as never,
    auditLogService as never,
    eventOutboxService as never,
    realGatekeeperService as never,
    whatsappStubProvider as never,
  );

  return { service: realService, state };
}

function createInput(overrides?: Partial<Record<string, unknown>>) {
  return {
    organization_id: 'org-1',
    actor_user_id: 'actor-1',
    source_module: 'engagement.gateway',
    capability_key: 'engagement.gateway.request.create',
    request_kind: 'outbound_engagement',
    recipient_ref: 'lead-1',
    payload: { message: 'hello' },
    idempotency_key: 'idem-1',
    priority: 'normal',
    requested_at: '2026-05-24T10:00:00.000Z',
    ...(overrides ?? {}),
  };
}

async function testCreateRequestHappyPath() {
  const { service, state } = createMocks();
  const result = await service.createRequest('org-1', createInput(), 'actor-1');
  assert.equal(result.organization_id, 'org-1');
  assert.equal(result.status, 'recorded');
  assert.equal(result.recorded_at, '2026-05-24T10:00:00.000Z');
  assert.equal(state.gatekeeperCalls.length, 1);
  assert.deepEqual((state.gatekeeperCalls[0] as { module_health: unknown }).module_health, {
    'engagement.gateway': 'healthy',
  });
  assert.deepEqual((state.gatekeeperCalls[0] as { dependency_health: unknown }).dependency_health, {
    'core.access': 'healthy',
  });
  assert.equal(state.auditCalls.length, 1);
  assert.equal(state.outboxCalls.length, 1);
  assert.equal(state.persistedRequests.length, 1);
  assert.equal(result.gateway_request_id, 'gateway_request_1');
  assert.equal((state.outboxCalls[0] as { event_type: string }).event_type, 'engagement.gateway.request.recorded');
  assert.equal(
    (state.outboxCalls[0] as { idempotency_key: string }).idempotency_key,
    'engagement.gateway.request.recorded.org-1.idem-1',
  );
  assert.equal(
    EngagementGatewayRequestRecordedEventSchema.safeParse((state.outboxCalls[0] as { payload: unknown }).payload).success,
    true,
  );
  assert.equal(
    ((state.outboxCalls[0] as { payload: { recorded_at: string } }).payload).recorded_at,
    '2026-05-24T10:00:00.000Z',
  );
  assert.equal(state.stubDispatchCalls.length, 0);
  assert.equal(state.stubInboundCalls.length, 0);
}

async function testCreateRequestHappyPathUsesRealGatekeeper() {
  const { service, state } = createMocksWithRealGatekeeper();
  const result = await service.createRequest('org-1', createInput(), 'actor-1');
  assert.equal(result.organization_id, 'org-1');
  assert.equal(result.status, 'recorded');
  assert.equal(state.auditCalls.length, 1);
  assert.equal(state.outboxCalls.length, 1);
}

async function testCreateRequestIdempotencyReturnsExistingRecord() {
  const { service, state } = createMocks();
  const first = await service.createRequest('org-1', createInput(), 'actor-1');
  const second = await service.createRequest('org-1', createInput(), 'actor-1');

  assert.equal(first.gateway_request_id, 'gateway_request_1');
  assert.equal(second.gateway_request_id, 'gateway_request_1');
  assert.equal(state.gatekeeperCalls.length, 2);
  assert.equal(state.persistedRequests.length, 1);
  assert.equal(state.auditCalls.length, 1);
  assert.equal(state.outboxCalls.length, 1);
}

async function testIdempotencyReplayStillRequiresGatekeeperPreflight() {
  const { service, state } = createMocksWithRealGatekeeper();
  const first = await service.createRequest('org-1', createInput(), 'actor-1');
  state.moduleStatuses.set('engagement.gateway', 'degraded');

  await assert.rejects(service.createRequest('org-1', createInput(), 'actor-1'), ServiceUnavailableException);
  assert.equal(first.gateway_request_id, 'gateway_request_1');
  assert.equal(state.persistedRequests.length, 1);
  assert.equal(state.auditCalls.length, 1);
  assert.equal(state.outboxCalls.length, 1);
}

async function testCreateRequestWhatsappStubFlow() {
  const { service, state } = createMocks();
  const result = await service.createRequest(
    'org-1',
    createInput({
      transport_channel: 'whatsapp_stub',
      payload: {
        template_key: 'lead.intake.ack',
        locale: 'en-PK',
        message_variables: { lead_name: 'Lead Alpha' },
        dry_run_only: true,
      },
    }),
    'actor-1',
  );
  assert.equal(result.organization_id, 'org-1');
  assert.equal(result.status, 'recorded');
  assert.equal(state.stubDispatchCalls.length, 1);
  assert.equal(state.stubInboundCalls.length, 1);
}

async function testUnsupportedCapabilityScopeFailsClosedBeforeGatekeeper() {
  const { service, state } = createMocks();
  state.capabilityAssignmentScopes.set('engagement.gateway.request.create', 'own_unit');

  await assert.rejects(service.createRequest('org-1', createInput(), 'actor-1'), ForbiddenException);
  assert.equal(state.gatekeeperCalls.length, 0);
  assert.equal(state.persistedRequests.length, 0);
  assert.equal(state.auditCalls.length, 0);
  assert.equal(state.outboxCalls.length, 0);
}

async function testMissingActorFails() {
  const { service } = createMocks();
  await assert.rejects(service.createRequest('org-1', createInput(), ''), BadRequestException);
}

async function testCrossOrgActorFails() {
  const { service } = createMocks();
  await assert.rejects(service.createRequest('org-2', createInput({ organization_id: 'org-2' }), 'actor-1'), ForbiddenException);
}

async function testInvalidPayloadFails() {
  const { service } = createMocks();
  await assert.rejects(service.createRequest('org-1', { invalid: true }, 'actor-1'), BadRequestException);
}

async function testGatekeeperDegradedFails() {
  const { service, gatekeeperPreflightService } = createMocks();
  gatekeeperPreflightService.requireAllow = async () => {
    throw new ServiceUnavailableException('degraded');
  };
  await assert.rejects(service.createRequest('org-1', createInput(), 'actor-1'), ServiceUnavailableException);
}

async function testRealGatekeeperUsesRegistryHealthContext() {
  const { service, state } = createMocksWithRealGatekeeper();
  state.moduleStatuses.set('engagement.gateway', 'degraded');

  await assert.rejects(service.createRequest('org-1', createInput(), 'actor-1'), ServiceUnavailableException);
  assert.equal(state.persistedRequests.length, 0);
  assert.equal(state.auditCalls.length, 0);
  assert.equal(state.outboxCalls.length, 0);
}

async function testHealthRead() {
  const { service } = createMocks();
  const result = await service.readHealth('org-1', 'actor-1');
  assert.equal(result.module_key, 'engagement.gateway');
  assert.equal(result.status, 'healthy');
  assert.equal(result.degraded_reason, null);
}

async function testHealthReadReflectsHealthyRegistryStatus() {
  const { service, state } = createMocks();
  state.moduleStatuses.set('engagement.gateway', 'healthy');

  const result = await service.readHealth('org-1', 'actor-1');
  assert.equal(result.status, 'healthy');
  assert.equal(result.degraded_reason, null);
}

async function testHealthReadReflectsDegradedRegistryStatus() {
  const { service, state } = createMocks();
  state.moduleStatuses.set('engagement.gateway', 'degraded');

  const result = await service.readHealth('org-1', 'actor-1');
  assert.equal(result.status, 'degraded');
  assert.equal(result.degraded_reason, 'module registry health is degraded');
}

async function testHealthReadReflectsDisabledRegistryStatus() {
  const { service, state } = createMocks();
  state.moduleStatuses.set('engagement.gateway', 'disabled');

  const result = await service.readHealth('org-1', 'actor-1');
  assert.equal(result.status, 'disabled');
  assert.equal(result.degraded_reason, 'module registry health is disabled');
}

async function testHealthReadReflectsMissingRegistryStatus() {
  const { service, state } = createMocks();
  state.moduleStatuses.delete('engagement.gateway');

  const result = await service.readHealth('org-1', 'actor-1');
  assert.equal(result.status, 'unknown');
  assert.equal(result.degraded_reason, 'module registry health is unknown');
}

async function run() {
  await testCreateRequestHappyPath();
  await testCreateRequestHappyPathUsesRealGatekeeper();
  await testCreateRequestIdempotencyReturnsExistingRecord();
  await testIdempotencyReplayStillRequiresGatekeeperPreflight();
  await testCreateRequestWhatsappStubFlow();
  await testUnsupportedCapabilityScopeFailsClosedBeforeGatekeeper();
  await testMissingActorFails();
  await testCrossOrgActorFails();
  await testInvalidPayloadFails();
  await testGatekeeperDegradedFails();
  await testRealGatekeeperUsesRegistryHealthContext();
  await testHealthRead();
  await testHealthReadReflectsHealthyRegistryStatus();
  await testHealthReadReflectsDegradedRegistryStatus();
  await testHealthReadReflectsDisabledRegistryStatus();
  await testHealthReadReflectsMissingRegistryStatus();
  console.log('engagement-gateway.service tests passed');
}

void run();
