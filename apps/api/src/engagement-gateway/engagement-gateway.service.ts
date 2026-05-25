import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import {
  parseEngagementGatewayCreateRequestInput,
  parseEngagementGatewayCreateRequestOutput,
  parseEngagementGatewayHealthOutput,
} from '@akti/contracts/engagement-gateway-lite';
import type { GatekeeperRequest } from '@akti/contracts/gatekeeper-contract';

import { GatekeeperPreflightService } from '../gatekeeper/gatekeeper-preflight.service';
import { loadPhase2CapabilityScopeMap } from '../module-registry/module-registry.service';
import { AuditLogService } from '../platform-observability/audit-log.service';
import { EventOutboxService } from '../platform-observability/event-outbox.service';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappStubProvider } from './whatsapp-stub.provider';

const REQUEST_CREATE_CAPABILITY = 'engagement.gateway.request.create';
const HEALTH_READ_CAPABILITY = 'engagement.gateway.health.read';
const ACCESS_MODULE_KEY = 'core.access';
const GATEWAY_MODULE_KEY = 'engagement.gateway';
const GATEWAY_REQUEST_RECORDED_EVENT = 'engagement.gateway.request.recorded';

type GatekeeperHealthStatus = GatekeeperRequest['context']['module_health'][string];

type GatewayRequestRepo = {
  findFirst(args: unknown): Promise<
    | {
        id: string;
        organization_id: string;
        status: string;
        idempotency_key: string;
        recorded_at: Date;
      }
    | null
  >;
  create(args: unknown): Promise<{
    id: string;
    status: string;
  }>;
};

function gatewayRequestRepo(prismaLike: unknown): GatewayRequestRepo {
  return (prismaLike as { engagementGatewayRequest: GatewayRequestRepo }).engagementGatewayRequest;
}

@Injectable()
export class EngagementGatewayService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly eventOutboxService: EventOutboxService,
    private readonly gatekeeperPreflightService: GatekeeperPreflightService,
    private readonly whatsappStubProvider: WhatsappStubProvider,
  ) {}

  async createRequest(organizationId: string, body: unknown, actorUserIdRaw?: string) {
    const actorUserId = this.requireActorUserId(actorUserIdRaw);
    const input = this.parseCreateRequestInput(body);

    if (input.organization_id !== organizationId) {
      throw new BadRequestException('organization_id must match route organization');
    }

    if (input.actor_user_id !== actorUserId) {
      throw new BadRequestException('actor_user_id must match x-actor-user-id');
    }

    const actor = await this.requireActorInOrganization(organizationId, actorUserId);
    const activeGroupIds = await this.requireCapability(organizationId, actorUserId, REQUEST_CREATE_CAPABILITY);
    const healthContext = await this.resolveGatekeeperHealthContext([GATEWAY_MODULE_KEY, ACCESS_MODULE_KEY]);
    await this.gatekeeperPreflightService.requireAllow({
      organization_id: organizationId,
      actor_user_id: actorUserId,
      active_group_ids: activeGroupIds,
      capability_key: REQUEST_CREATE_CAPABILITY,
      module_key: GATEWAY_MODULE_KEY,
      entity_type: 'engagement.gateway.request',
      entity_id: null,
      action_key: 'engagement.gateway.request.recorded',
      module_health: {
        [GATEWAY_MODULE_KEY]: healthContext[GATEWAY_MODULE_KEY],
      },
      dependency_health: {
        [ACCESS_MODULE_KEY]: healthContext[ACCESS_MODULE_KEY],
      },
      payload: {
        request_kind: input.request_kind,
        idempotency_key: input.idempotency_key,
      },
    });

    const existingRequest = await gatewayRequestRepo(this.prisma).findFirst({
      where: {
        organization_id: organizationId,
        idempotency_key: input.idempotency_key,
      },
      select: {
        id: true,
        organization_id: true,
        status: true,
        idempotency_key: true,
        recorded_at: true,
      },
    });
    if (existingRequest) {
      return parseEngagementGatewayCreateRequestOutput({
        gateway_request_id: existingRequest.id,
        organization_id: existingRequest.organization_id,
        status: existingRequest.status,
        idempotency_key: existingRequest.idempotency_key,
        recorded_at: existingRequest.recorded_at.toISOString(),
      });
    }

    const recordedAtIso = new Date().toISOString();
    const persistedRequest = await this.prisma.$transaction(async (tx) => {
      const created = await gatewayRequestRepo(tx).create({
        data: {
          organization_id: organizationId,
          actor_user_id: actor.id,
          source_module: input.source_module,
          capability_key: input.capability_key,
          request_kind: input.request_kind,
          recipient_ref: input.recipient_ref,
          payload_json: input.payload,
          idempotency_key: input.idempotency_key,
          priority: input.priority,
          transport_channel: input.transport_channel,
          status: 'recorded',
          requested_at: new Date(input.requested_at),
        },
      });

      const gatewayRequestId = created.id;
      const stubDispatchResult =
        input.transport_channel === 'whatsapp_stub'
          ? this.whatsappStubProvider.dispatchOutbound({
              organization_id: organizationId,
              gateway_request_id: gatewayRequestId,
              recipient_ref: input.recipient_ref,
              idempotency_key: input.idempotency_key,
            })
          : null;
      const stubInboundReceipt =
        input.transport_channel === 'whatsapp_stub'
          ? this.whatsappStubProvider.simulateInboundReceipt({
              organization_id: organizationId,
              gateway_request_id: gatewayRequestId,
              idempotency_key: input.idempotency_key,
            })
          : null;

      await this.auditLogService.writeAuditLog(tx, {
        organization_id: organizationId,
        actor_user_id: actor.id,
        action_key: 'engagement.gateway.request.recorded',
        entity_type: 'engagement.gateway.request',
        entity_id: created.id,
        metadata: {
          gateway_request_id: created.id,
          source_module: input.source_module,
          capability_key: input.capability_key,
          request_kind: input.request_kind,
          recipient_ref: input.recipient_ref,
          idempotency_key: input.idempotency_key,
          priority: input.priority,
          transport_channel: input.transport_channel,
          requested_at: input.requested_at,
          stub_dispatch: stubDispatchResult,
          stub_inbound_receipt: stubInboundReceipt,
        },
      });

      await this.eventOutboxService.recordEvent(tx, {
        organization_id: organizationId,
        event_type: GATEWAY_REQUEST_RECORDED_EVENT,
        version: '0.1.0',
        idempotency_key: `engagement.gateway.request.recorded.${organizationId}.${input.idempotency_key}`,
        payload: {
          gateway_request_id: created.id,
          organization_id: organizationId,
          actor_user_id: actor.id,
          source_module: input.source_module,
          capability_key: input.capability_key,
          request_kind: input.request_kind,
          idempotency_key: input.idempotency_key,
          recorded_at: recordedAtIso,
        },
      });
      return created;
    });

    return parseEngagementGatewayCreateRequestOutput({
      gateway_request_id: persistedRequest.id,
      organization_id: organizationId,
      status: persistedRequest.status,
      idempotency_key: input.idempotency_key,
      recorded_at: recordedAtIso,
    });
  }

  async readHealth(organizationId: string, actorUserIdRaw?: string) {
    const actorUserId = this.requireActorUserId(actorUserIdRaw);
    await this.requireActorInOrganization(organizationId, actorUserId);
    await this.requireCapability(organizationId, actorUserId, HEALTH_READ_CAPABILITY);

    return parseEngagementGatewayHealthOutput({
      module_key: GATEWAY_MODULE_KEY,
      status: 'healthy',
      checked_at: new Date().toISOString(),
      degraded_reason: null,
    });
  }

  private parseCreateRequestInput(body: unknown) {
    try {
      return parseEngagementGatewayCreateRequestInput(body);
    } catch {
      throw new BadRequestException('invalid request payload');
    }
  }

  private requireActorUserId(actorUserIdRaw?: string) {
    const actorUserId = actorUserIdRaw?.trim();
    if (!actorUserId) {
      throw new BadRequestException('x-actor-user-id is required');
    }
    return actorUserId;
  }

  private async requireActorInOrganization(organizationId: string, actorUserId: string) {
    const actor = await this.prisma.user.findFirst({
      where: {
        organization_id: organizationId,
        id: actorUserId,
      },
      select: {
        id: true,
      },
    });

    if (!actor) {
      throw new ForbiddenException('actor user must belong to organization');
    }
    return actor;
  }

  private async requireCapability(organizationId: string, actorUserId: string, capabilityKey: string) {
    const scopeMap = await loadPhase2CapabilityScopeMap();
    const allowedScopeTypes = scopeMap.get(capabilityKey);
    if (!allowedScopeTypes || allowedScopeTypes.length === 0) {
      throw new ForbiddenException(`capability scope definition missing for ${capabilityKey}`);
    }

    const memberships = await this.prisma.userGroup.findMany({
      where: {
        organization_id: organizationId,
        user_id: actorUserId,
      },
      select: {
        group_id: true,
      },
    });

    const activeGroupIds = memberships.map((item) => item.group_id);
    if (activeGroupIds.length === 0) {
      throw new ForbiddenException(`actor lacks ${capabilityKey}`);
    }

    const assignment = await this.prisma.groupCapability.findFirst({
      where: {
        organization_id: organizationId,
        group_id: {
          in: activeGroupIds,
        },
        capability_key: capabilityKey,
        scope_type: {
          in: [...allowedScopeTypes],
        },
      },
      select: {
        id: true,
      },
    });

    if (!assignment) {
      throw new ForbiddenException(`actor lacks ${capabilityKey}`);
    }

    return activeGroupIds;
  }

  private async resolveGatekeeperHealthContext(moduleKeys: string[]): Promise<Record<string, GatekeeperHealthStatus>> {
    const rows = await this.prisma.moduleRegistryEntry.findMany({
      where: {
        module_key: {
          in: moduleKeys,
        },
      },
      select: {
        module_key: true,
        status: true,
      },
    });

    const statusByModule = new Map(rows.map((row) => [row.module_key, row.status]));
    return Object.fromEntries(
      moduleKeys.map((moduleKey) => [moduleKey, mapModuleStatusToGatekeeperHealth(statusByModule.get(moduleKey))]),
    );
  }
}

function mapModuleStatusToGatekeeperHealth(status?: string): GatekeeperHealthStatus {
  if (status === 'available' || status === 'healthy') {
    return 'healthy';
  }

  if (status === 'degraded') {
    return 'degraded';
  }

  if (status === 'disabled' || status === 'unavailable') {
    return 'disabled';
  }

  return 'unknown';
}
