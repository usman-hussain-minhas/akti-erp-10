import { randomUUID } from 'node:crypto';

import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  LeadDeskCreateLeadInputSchema,
  LeadDeskCreateLeadOutputSchema,
  LeadDeskGetLeadDetailInputSchema,
  LeadDeskGetLeadDetailOutputSchema,
  LeadDeskListLeadsInputSchema,
  LeadDeskListLeadsOutputSchema,
} from '@akti/contracts/lead-desk-core';

import { GatekeeperPreflightService } from '../gatekeeper/gatekeeper-preflight.service';
import { AuditLogService } from '../platform-observability/audit-log.service';
import { EventOutboxService } from '../platform-observability/event-outbox.service';
import { PrismaService } from '../prisma/prisma.service';

const CAP_CREATE = 'lead.intake.create';
const CAP_LIST = 'lead.inbox.view';
const CAP_DETAIL = 'lead.detail.view';
const MODULE_KEY = 'lead.desk';

type ActiveActor = {
  actor_user_id: string;
  active_group_ids: string[];
};

@Injectable()
export class LeadDeskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly eventOutboxService: EventOutboxService,
    private readonly gatekeeperPreflightService: GatekeeperPreflightService,
  ) {}

  async createLead(organizationId: string, body: unknown, actorUserIdRaw?: string) {
    const actorUserId = this.requireActorUserId(actorUserIdRaw);

    const parsed = this.parseOrBadRequest(() => LeadDeskCreateLeadInputSchema.parse(body), 'invalid request payload');
    if (parsed.organization_id !== organizationId) {
      throw new BadRequestException('organization_id must match route organization');
    }

    if (parsed.actor_user_id !== actorUserId) {
      throw new BadRequestException('actor_user_id must match x-actor-user-id');
    }

    return this.prisma.$transaction(async (tx) => {
      const actor = await this.requireCapability(tx as never, organizationId, actorUserId, CAP_CREATE);

      await this.gatekeeperPreflightService.requireAllow({
        organization_id: organizationId,
        actor_user_id: actor.actor_user_id,
        active_group_ids: actor.active_group_ids,
        capability_key: CAP_CREATE,
        module_key: MODULE_KEY,
        entity_type: 'lead.record',
        entity_id: null,
        action_key: 'lead.desk.lead.created',
        payload: {
          source_ref: parsed.source_ref,
        },
      });

      const lead = await tx.leadRecord.create({
        data: {
          organization_id: organizationId,
          source_ref: parsed.source_ref,
          full_name: parsed.full_name,
          phone_e164: parsed.phone_e164,
          notes: parsed.notes ?? null,
          status: 'new',
          assigned_user_id: null,
        },
      });

      await this.auditLogService.writeAuditLog(tx as never, {
        organization_id: organizationId,
        actor_user_id: actor.actor_user_id,
        action_key: 'lead.desk.lead.created',
        entity_type: 'lead.record',
        entity_id: lead.id,
        metadata: {
          source_ref: lead.source_ref,
          status: lead.status,
        },
      });

      await this.eventOutboxService.recordMutation(tx as never, {
        organization_id: organizationId,
        action_key: 'lead.desk.lead.created',
        entity_type: 'lead.record',
        entity_id: lead.id,
        actor_user_id: actor.actor_user_id,
      });

      return LeadDeskCreateLeadOutputSchema.parse({
        lead_id: lead.id,
        organization_id: lead.organization_id,
        status: lead.status,
        created_at: lead.created_at.toISOString(),
      });
    });
  }

  async listLeads(organizationId: string, query: Record<string, unknown>, actorUserIdRaw?: string) {
    const actorUserId = this.requireActorUserId(actorUserIdRaw);

    const input = this.parseOrBadRequest(
      () =>
        LeadDeskListLeadsInputSchema.parse({
          organization_id: organizationId,
          actor_user_id: actorUserId,
          status: typeof query.status === 'string' && query.status.length > 0 ? query.status : undefined,
          assigned_user_id:
            typeof query.assigned_user_id === 'string' && query.assigned_user_id.length > 0
              ? query.assigned_user_id
              : undefined,
          cursor: typeof query.cursor === 'string' && query.cursor.length > 0 ? query.cursor : undefined,
          limit:
            typeof query.limit === 'string' && query.limit.length > 0
              ? Number.parseInt(query.limit, 10)
              : undefined,
        }),
      'invalid list query payload',
    );

    await this.requireCapability(this.prisma, organizationId, actorUserId, CAP_LIST);

    const rows = await this.prisma.leadRecord.findMany({
      where: {
        organization_id: organizationId,
        status: input.status,
        assigned_user_id: input.assigned_user_id,
      },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      take: input.limit,
      skip: input.cursor ? 1 : 0,
      ...(input.cursor
        ? {
            cursor: {
              organization_id_id: {
                organization_id: organizationId,
                id: input.cursor,
              },
            },
          }
        : {}),
    });

    const items = rows.map((row) => ({
      lead_id: row.id,
      organization_id: row.organization_id,
      full_name: row.full_name,
      phone_e164: row.phone_e164,
      source_ref: row.source_ref,
      status: row.status,
      assigned_user_id: row.assigned_user_id,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
    }));

    const nextCursor = rows.length === input.limit && rows.length > 0 ? rows[rows.length - 1].id : null;

    return this.parseOrBadRequest(
      () =>
        LeadDeskListLeadsOutputSchema.parse({
          items,
          next_cursor: nextCursor,
        }),
      'failed to shape list response',
    );
  }

  async getLeadDetail(organizationId: string, leadId: string, actorUserIdRaw?: string) {
    const actorUserId = this.requireActorUserId(actorUserIdRaw);

    this.parseOrBadRequest(
      () =>
        LeadDeskGetLeadDetailInputSchema.parse({
          organization_id: organizationId,
          actor_user_id: actorUserId,
          lead_id: leadId,
        }),
      'invalid detail request payload',
    );

    await this.requireCapability(this.prisma, organizationId, actorUserId, CAP_DETAIL);

    const lead = await this.prisma.leadRecord.findFirst({
      where: {
        organization_id: organizationId,
        id: leadId,
      },
    });

    if (!lead) {
      throw new NotFoundException('lead not found in organization');
    }

    return this.parseOrBadRequest(
      () =>
        LeadDeskGetLeadDetailOutputSchema.parse({
          lead_id: lead.id,
          organization_id: lead.organization_id,
          full_name: lead.full_name,
          phone_e164: lead.phone_e164,
          source_ref: lead.source_ref,
          status: lead.status,
          assigned_user_id: lead.assigned_user_id,
          created_at: lead.created_at.toISOString(),
          updated_at: lead.updated_at.toISOString(),
        }),
      'failed to shape detail response',
    );
  }

  private requireActorUserId(actorUserIdRaw?: string) {
    const actorUserId = actorUserIdRaw?.trim();
    if (!actorUserId) {
      throw new BadRequestException('x-actor-user-id is required');
    }
    return actorUserId;
  }

  private async requireCapability(
    db: Pick<PrismaService, 'user' | 'userGroup' | 'groupCapability'>,
    organizationId: string,
    actorUserId: string,
    capabilityKey: string,
  ): Promise<ActiveActor> {
    const actor = await db.user.findFirst({
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

    const memberships = await db.userGroup.findMany({
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

    const assignment = await db.groupCapability.findFirst({
      where: {
        organization_id: organizationId,
        group_id: {
          in: activeGroupIds,
        },
        capability_key: capabilityKey,
      },
      select: {
        id: true,
      },
    });

    if (!assignment) {
      throw new ForbiddenException(`actor lacks ${capabilityKey}`);
    }

    return {
      actor_user_id: actor.id,
      active_group_ids: activeGroupIds,
    };
  }

  private parseOrBadRequest<T>(fn: () => T, message: string): T {
    try {
      return fn();
    } catch {
      throw new BadRequestException(message);
    }
  }
}
