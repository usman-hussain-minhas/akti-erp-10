import { randomUUID } from 'node:crypto';

import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  LeadDeskCreateLeadInputSchema,
  LeadDeskCreateLeadOutputSchema,
  LeadDeskGetLeadDetailInputSchema,
  LeadDeskGetLeadDetailOutputSchema,
  LeadDeskListLeadsInputSchema,
  LeadDeskListLeadsOutputSchema,
  LeadDeskAssignLeadInputSchema,
  LeadDeskAssignLeadOutputSchema,
  LeadDeskUpdateLeadStatusInputSchema,
  LeadDeskUpdateLeadStatusOutputSchema,
} from '@akti/contracts/lead-desk-core';

import { GatekeeperPreflightService } from '../gatekeeper/gatekeeper-preflight.service';
import { loadPhase2CapabilityScopeMap } from '../module-registry/module-registry.service';
import { AuditLogService } from '../platform-observability/audit-log.service';
import { EventOutboxService } from '../platform-observability/event-outbox.service';
import { PrismaService } from '../prisma/prisma.service';
import type { PermissionScopeType, Prisma } from '../prisma/prisma-client';

const CAP_CREATE = 'lead.intake.create';
const CAP_LIST = 'lead.inbox.view';
const CAP_DETAIL = 'lead.detail.view';
const CAP_STATUS_UPDATE = 'lead.status.update';
const CAP_ASSIGN = 'lead.inbox.assign';
const MODULE_KEY = 'lead.desk';
const LEAD_CREATED_EVENT = 'lead.desk.lead.created';
const LEAD_STATUS_UPDATED_EVENT = 'lead.desk.lead.status.updated';
const LEAD_ASSIGNED_EVENT = 'lead.desk.lead.assigned';

type ActiveActor = {
  actor_user_id: string;
  primary_unit_id: string | null;
  active_group_ids: string[];
  scope_types: Set<PermissionScopeType>;
  own_unit_ids: string[];
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
          organization_unit_id: actor.primary_unit_id,
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

      await this.eventOutboxService.recordEvent(tx as never, {
        organization_id: organizationId,
        event_type: LEAD_CREATED_EVENT,
        version: '0.1.0',
        idempotency_key: `lead.created.${organizationId}.${lead.id}`,
        payload: {
          event_type: LEAD_CREATED_EVENT,
          version: '0.1.0',
          organization_id: organizationId,
          lead_id: lead.id,
          actor_user_id: actor.actor_user_id,
          created_at: lead.created_at.toISOString(),
        },
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

    const actor = await this.requireCapability(this.prisma, organizationId, actorUserId, CAP_LIST);
    const scopeWhere = this.buildLeadScopeWhere(actor);

    const rows = await this.prisma.leadRecord.findMany({
      where: {
        organization_id: organizationId,
        ...(scopeWhere ? { AND: [scopeWhere] } : {}),
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

    const actor = await this.requireCapability(this.prisma, organizationId, actorUserId, CAP_DETAIL);
    const lead = await this.requireLeadInScope(this.prisma, organizationId, leadId, actor);

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

  async updateLeadStatus(organizationId: string, leadId: string, body: unknown, actorUserIdRaw?: string) {
    const actorUserId = this.requireActorUserId(actorUserIdRaw);
    const input = this.parseOrBadRequest(
      () =>
        LeadDeskUpdateLeadStatusInputSchema.parse({
          ...(typeof body === 'object' && body !== null ? body : {}),
          organization_id: organizationId,
          actor_user_id: actorUserId,
          lead_id: leadId,
        }),
      'invalid status update payload',
    );

    return this.prisma.$transaction(async (tx) => {
      const actor = await this.requireCapability(tx as never, organizationId, actorUserId, CAP_STATUS_UPDATE);
      const lead = await this.requireLeadInScope(tx as never, organizationId, leadId, actor);

      await this.gatekeeperPreflightService.requireAllow({
        organization_id: organizationId,
        actor_user_id: actor.actor_user_id,
        active_group_ids: actor.active_group_ids,
        capability_key: CAP_STATUS_UPDATE,
        module_key: MODULE_KEY,
        entity_type: 'lead.record',
        entity_id: leadId,
        action_key: 'lead.desk.lead.status.updated',
        payload: {
          status: input.status,
          reason: input.reason ?? null,
        },
      });

      const updated = await tx.leadRecord.update({
        where: {
          organization_id_id: {
            organization_id: organizationId,
            id: leadId,
          },
        },
        data: {
          status: input.status,
        },
      });

      await tx.leadStatusHistory.create({
        data: {
          organization_id: organizationId,
          lead_id: leadId,
          actor_user_id: actor.actor_user_id,
          status: input.status,
          reason: input.reason ?? null,
          requested_at: new Date(input.requested_at),
        },
      });

      await this.auditLogService.writeAuditLog(tx as never, {
        organization_id: organizationId,
        actor_user_id: actor.actor_user_id,
        action_key: 'lead.desk.lead.status.updated',
        entity_type: 'lead.record',
        entity_id: leadId,
        metadata: {
          previous_status: lead.status,
          next_status: updated.status,
          reason: input.reason ?? null,
        },
      });

      await this.eventOutboxService.recordEvent(tx as never, {
        organization_id: organizationId,
        event_type: LEAD_STATUS_UPDATED_EVENT,
        version: '0.1.0',
        idempotency_key: `lead.status.updated.${organizationId}.${leadId}.${input.status}.${input.requested_at}`,
        payload: {
          event_type: LEAD_STATUS_UPDATED_EVENT,
          version: '0.1.0',
          organization_id: organizationId,
          lead_id: leadId,
          actor_user_id: actor.actor_user_id,
          status: updated.status,
          updated_at: updated.updated_at.toISOString(),
        },
      });

      return LeadDeskUpdateLeadStatusOutputSchema.parse({
        lead_id: updated.id,
        organization_id: updated.organization_id,
        status: updated.status,
        updated_at: updated.updated_at.toISOString(),
      });
    });
  }

  async updateLeadAssignment(organizationId: string, leadId: string, body: unknown, actorUserIdRaw?: string) {
    const actorUserId = this.requireActorUserId(actorUserIdRaw);
    const input = this.parseOrBadRequest(
      () =>
        LeadDeskAssignLeadInputSchema.parse({
          ...(typeof body === 'object' && body !== null ? body : {}),
          organization_id: organizationId,
          actor_user_id: actorUserId,
          lead_id: leadId,
        }),
      'invalid assignment payload',
    );

    return this.prisma.$transaction(async (tx) => {
      const actor = await this.requireCapability(tx as never, organizationId, actorUserId, CAP_ASSIGN);
      const lead = await this.requireLeadInScope(tx as never, organizationId, leadId, actor);

      await this.gatekeeperPreflightService.requireAllow({
        organization_id: organizationId,
        actor_user_id: actor.actor_user_id,
        active_group_ids: actor.active_group_ids,
        capability_key: CAP_ASSIGN,
        module_key: MODULE_KEY,
        entity_type: 'lead.record',
        entity_id: leadId,
        action_key: 'lead.desk.lead.assigned',
        payload: {
          assigned_user_id: input.assigned_user_id,
        },
      });

      const [assignedUser] = await Promise.all([
        tx.user.findFirst({
          where: {
            organization_id: organizationId,
            id: input.assigned_user_id,
          },
          select: {
            id: true,
          },
        }),
      ]);

      if (!assignedUser) {
        throw new BadRequestException('assigned_user_id must reference a user in the same organization');
      }

      const updated = await tx.leadRecord.update({
        where: {
          organization_id_id: {
            organization_id: organizationId,
            id: leadId,
          },
        },
        data: {
          assigned_user_id: input.assigned_user_id,
        },
      });

      await tx.leadAssignmentHistory.create({
        data: {
          organization_id: organizationId,
          lead_id: leadId,
          actor_user_id: actor.actor_user_id,
          assigned_user_id: input.assigned_user_id,
          requested_at: new Date(input.requested_at),
        },
      });

      await this.auditLogService.writeAuditLog(tx as never, {
        organization_id: organizationId,
        actor_user_id: actor.actor_user_id,
        action_key: 'lead.desk.lead.assigned',
        entity_type: 'lead.record',
        entity_id: leadId,
        metadata: {
          previous_assigned_user_id: lead.assigned_user_id,
          next_assigned_user_id: updated.assigned_user_id,
        },
      });

      await this.eventOutboxService.recordEvent(tx as never, {
        organization_id: organizationId,
        event_type: LEAD_ASSIGNED_EVENT,
        version: '0.1.0',
        idempotency_key: `lead.assigned.${organizationId}.${leadId}.${input.assigned_user_id}.${input.requested_at}`,
        payload: {
          event_type: LEAD_ASSIGNED_EVENT,
          version: '0.1.0',
          organization_id: organizationId,
          lead_id: leadId,
          actor_user_id: actor.actor_user_id,
          assigned_user_id: input.assigned_user_id,
          updated_at: updated.updated_at.toISOString(),
        },
      });

      return LeadDeskAssignLeadOutputSchema.parse({
        lead_id: updated.id,
        organization_id: updated.organization_id,
        assigned_user_id: updated.assigned_user_id,
        updated_at: updated.updated_at.toISOString(),
      });
    });
  }

  private requireActorUserId(actorUserIdRaw?: string) {
    const actorUserId = actorUserIdRaw?.trim();
    if (!actorUserId) {
      throw new BadRequestException('x-actor-user-id is required');
    }
    return actorUserId;
  }

  private async requireCapability(
    db: Pick<PrismaService, 'user' | 'userGroup' | 'groupCapability' | 'organizationUnitClosure'>,
    organizationId: string,
    actorUserId: string,
    capabilityKey: string,
  ): Promise<ActiveActor> {
    const scopeMap = await loadPhase2CapabilityScopeMap();
    const allowedScopeTypes = scopeMap.get(capabilityKey);
    if (!allowedScopeTypes || allowedScopeTypes.length === 0) {
      throw new ForbiddenException(`capability scope definition missing for ${capabilityKey}`);
    }

    const actor = await db.user.findFirst({
      where: {
        organization_id: organizationId,
        id: actorUserId,
      },
      select: {
        id: true,
        primary_unit_id: true,
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

    const assignments = await db.groupCapability.findMany({
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
        scope_type: true,
        scope_unit_id: true,
      },
    });

    if (assignments.length === 0) {
      throw new ForbiddenException(`actor lacks ${capabilityKey}`);
    }

    const scopeTypes = new Set<PermissionScopeType>(assignments.map((item) => item.scope_type));
    const ownUnitAncestorIds = Array.from(
      new Set(
        assignments
          .filter((item) => item.scope_type === 'own_unit')
          .map((item) => item.scope_unit_id)
          .filter((scopeUnitId): scopeUnitId is string => typeof scopeUnitId === 'string' && scopeUnitId.length > 0),
      ),
    );

    if (scopeTypes.has('own_unit') && ownUnitAncestorIds.length === 0 && actor.primary_unit_id) {
      ownUnitAncestorIds.push(actor.primary_unit_id);
    }

    let ownUnitIds: string[] = [];
    if (ownUnitAncestorIds.length > 0) {
      const closureRows = await db.organizationUnitClosure.findMany({
        where: {
          organization_id: organizationId,
          ancestor_unit_id: {
            in: ownUnitAncestorIds,
          },
        },
        select: {
          descendant_unit_id: true,
        },
      });

      ownUnitIds = Array.from(
        new Set([
          ...ownUnitAncestorIds,
          ...closureRows.map((row) => row.descendant_unit_id),
        ]),
      );
    }

    if (scopeTypes.size === 0 || (scopeTypes.has('own_unit') && !scopeTypes.has('organization') && ownUnitIds.length === 0)) {
      throw new ForbiddenException(`actor lacks ${capabilityKey}`);
    }

    return {
      actor_user_id: actor.id,
      primary_unit_id: actor.primary_unit_id ?? null,
      active_group_ids: activeGroupIds,
      scope_types: scopeTypes,
      own_unit_ids: ownUnitIds,
    };
  }

  private buildLeadScopeWhere(actor: ActiveActor): Prisma.LeadRecordWhereInput | null {
    if (actor.scope_types.has('organization')) {
      return null;
    }

    const orFilters: Prisma.LeadRecordWhereInput[] = [];
    if (actor.scope_types.has('assigned_records')) {
      orFilters.push({
        assigned_user_id: actor.actor_user_id,
      });
    }

    if (actor.scope_types.has('own_unit') && actor.own_unit_ids.length > 0) {
      orFilters.push({
        organization_unit_id: {
          in: actor.own_unit_ids,
        },
      });
    }

    if (orFilters.length === 0) {
      throw new ForbiddenException('actor lacks lead scope access');
    }

    return {
      OR: orFilters,
    };
  }

  private async requireLeadInScope(
    db: Pick<PrismaService, 'leadRecord'>,
    organizationId: string,
    leadId: string,
    actor: ActiveActor,
  ) {
    const scopeWhere = this.buildLeadScopeWhere(actor);
    const lead = await db.leadRecord.findFirst({
      where: {
        organization_id: organizationId,
        id: leadId,
        ...(scopeWhere ? { AND: [scopeWhere] } : {}),
      },
    });

    if (!lead) {
      throw new NotFoundException('lead not found in organization');
    }

    return lead;
  }

  private parseOrBadRequest<T>(fn: () => T, message: string): T {
    try {
      return fn();
    } catch {
      throw new BadRequestException(message);
    }
  }
}
