import assert from 'node:assert/strict';

import { BadRequestException, ForbiddenException, ServiceUnavailableException } from '@nestjs/common';

import { GatekeeperPreflightService } from '../gatekeeper/gatekeeper-preflight.service';
import { EngagementGatewayService } from './engagement-gateway.service';

function createMocks() {
  const state = {
    gatekeeperCalls: [] as unknown[],
    auditCalls: [] as unknown[],
    outboxCalls: [] as unknown[],
    stubDispatchCalls: [] as unknown[],
    stubInboundCalls: [] as unknown[],
  };

  const prisma = {
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
      findFirst: async ({ where }: { where: { capability_key: string } }) => {
        if (
          where.capability_key === 'engagement.gateway.request.create' ||
          where.capability_key === 'engagement.gateway.health.read'
        ) {
          return { id: 'cap-1' };
        }
        return null;
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
    recordMutation: async (_tx: unknown, input: unknown) => {
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
  assert.equal(state.gatekeeperCalls.length, 1);
  assert.equal(state.auditCalls.length, 1);
  assert.equal(state.outboxCalls.length, 1);
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

async function testHealthRead() {
  const { service } = createMocks();
  const result = await service.readHealth('org-1', 'actor-1');
  assert.equal(result.module_key, 'engagement.gateway');
  assert.equal(result.status, 'healthy');
}

async function run() {
  await testCreateRequestHappyPath();
  await testCreateRequestHappyPathUsesRealGatekeeper();
  await testCreateRequestWhatsappStubFlow();
  await testMissingActorFails();
  await testCrossOrgActorFails();
  await testInvalidPayloadFails();
  await testGatekeeperDegradedFails();
  await testHealthRead();
  console.log('engagement-gateway.service tests passed');
}

void run();
