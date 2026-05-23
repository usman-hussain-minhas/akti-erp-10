import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  TransactionIsolationLevel,
  type OrganizationUnit,
  type PermissionScopeType,
  type Prisma,
  type UnitType,
} from '../prisma/prisma-client';

import { GatekeeperPreflightService } from '../gatekeeper/gatekeeper-preflight.service';
import { loadAccessCoreCapabilitySeedDefinitions } from '../module-registry/module-registry.service';
import { AuditLogService } from '../platform-observability/audit-log.service';
import { EventOutboxService } from '../platform-observability/event-outbox.service';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateOrganizationUnitInput, CreateUnitTypeInput } from './dto/hierarchy.dto';
import { HierarchyClosureService } from './hierarchy-closure.service';

const ACCESS_POLICY_MANAGE_CAPABILITY_KEY = 'access.policy.manage';
const ACCESS_MODULE_KEY = 'core.access';
const PHASE_1_HIERARCHY_SCOPE_TYPES = new Set<PermissionScopeType>(['global', 'organization']);

type DbClient = PrismaService | Prisma.TransactionClient;

type ListResponse<T> = {
  items: T[];
};

type AuthorizedHierarchyActor = {
  actor_user_id: string;
  active_group_ids: string[];
};

type HierarchyGatekeeperInput = {
  organization_id: string;
  actor: AuthorizedHierarchyActor;
  entity_type: 'organization.unit-type' | 'organization.unit';
  entity_id: string | null;
  action_key: string;
  payload?: Record<string, unknown>;
};

type MutationObservabilityInput = {
  organization_id: string;
  action_key: string;
  entity_type: string;
  entity_id: string;
  actor_user_id: string;
  metadata: Prisma.InputJsonValue;
};

function isPrismaKnownRequestError(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
  );
}

@Injectable()
export class HierarchyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hierarchyClosureService: HierarchyClosureService,
    private readonly auditLogService: AuditLogService,
    private readonly eventOutboxService: EventOutboxService,
    private readonly gatekeeperPreflightService: GatekeeperPreflightService,
  ) {}

  async createUnitType(
    organizationId: string,
    input: CreateUnitTypeInput,
    actorUserIdRaw?: string,
  ): Promise<UnitType> {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const actor = await this.requireAccessPolicyManageActor(tx, organizationId, actorUserIdRaw);
          await this.requireGatekeeperPreflight({
            organization_id: organizationId,
            actor,
            entity_type: 'organization.unit-type',
            entity_id: null,
            action_key: 'hierarchy.unit-type.created',
            payload: {
              operation: 'create',
            },
          });

          await this.assertOrganizationExistsInDb(tx, organizationId);

          const created = await tx.unitType.create({
            data: {
              organization_id: organizationId,
              key: input.key,
              label: input.label,
              sort_order: input.sort_order,
            },
          });

          await this.recordMutationObservability(tx, {
            organization_id: organizationId,
            action_key: 'hierarchy.unit-type.created',
            entity_type: 'organization.unit-type',
            entity_id: created.id,
            actor_user_id: actor.actor_user_id,
            metadata: {
              key: created.key,
            },
          });

          return created;
        },
        {
          isolationLevel: TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error: unknown) {
      this.rethrowKnownConflicts(error, 'unit type already exists in organization');
      throw error;
    }
  }

  async listUnitTypes(organizationId: string, actorUserIdRaw?: string): Promise<ListResponse<UnitType>> {
    await this.requireAccessPolicyManageActor(this.prisma, organizationId, actorUserIdRaw);

    const items = await this.prisma.unitType.findMany({
      where: {
        organization_id: organizationId,
      },
      orderBy: [{ sort_order: 'asc' }, { key: 'asc' }],
    });

    return { items };
  }

  async createUnit(
    organizationId: string,
    input: CreateOrganizationUnitInput,
    actorUserIdRaw?: string,
  ): Promise<OrganizationUnit> {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const actor = await this.requireAccessPolicyManageActor(tx, organizationId, actorUserIdRaw);
          await this.requireGatekeeperPreflight({
            organization_id: organizationId,
            actor,
            entity_type: 'organization.unit',
            entity_id: null,
            action_key: 'hierarchy.unit.created',
            payload: {
              operation: 'create',
            },
          });

          await this.assertUnitTypeExistsInOrganizationInDb(tx, organizationId, input.unit_type_id);

          const result = await this.hierarchyClosureService.createUnitWithClosureInTransaction(tx, {
            organization_id: organizationId,
            unit_type_id: input.unit_type_id,
            parent_unit_id: input.parent_unit_id,
            key: input.key,
            name: input.name,
            status: input.status,
          });

          await this.recordMutationObservability(tx, {
            organization_id: organizationId,
            action_key: 'hierarchy.unit.created',
            entity_type: 'organization.unit',
            entity_id: result.unit.id,
            actor_user_id: actor.actor_user_id,
            metadata: {
              key: result.unit.key,
              unit_type_id: result.unit.unit_type_id,
              parent_unit_id: result.unit.parent_unit_id,
              closure_row_count: result.closure_rows.length,
            },
          });

          return result.unit as OrganizationUnit;
        },
        {
          isolationLevel: TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error: unknown) {
      this.rethrowKnownConflicts(error, 'organization unit already exists in organization');
      throw error;
    }
  }

  async listUnits(organizationId: string, actorUserIdRaw?: string): Promise<ListResponse<OrganizationUnit>> {
    await this.requireAccessPolicyManageActor(this.prisma, organizationId, actorUserIdRaw);

    const items = await this.prisma.organizationUnit.findMany({
      where: {
        organization_id: organizationId,
      },
      orderBy: [{ key: 'asc' }],
    });

    return { items };
  }

  private async requireAccessPolicyManageActor(
    db: DbClient,
    organizationId: string,
    actorUserIdRaw?: string,
  ): Promise<AuthorizedHierarchyActor> {
    const actorUserId = this.normalizeActorUserId(actorUserIdRaw);
    if (!actorUserId) {
      throw new BadRequestException('x-actor-user-id is required for protected hierarchy operations');
    }

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
      throw new BadRequestException('x-actor-user-id must reference a user in the same organization');
    }

    const capability = await db.capability.findUnique({
      where: {
        key: ACCESS_POLICY_MANAGE_CAPABILITY_KEY,
      },
      select: {
        key: true,
      },
    });

    if (!capability) {
      throw new ConflictException('access.policy.manage capability is missing from database catalog');
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

    const membershipGroupIds = memberships.map((membership) => membership.group_id);
    if (membershipGroupIds.length === 0) {
      throw new BadRequestException('actor lacks access.policy.manage for this organization');
    }

    const groups = await db.group.findMany({
      where: {
        organization_id: organizationId,
        id: {
          in: membershipGroupIds,
        },
      },
      select: {
        id: true,
      },
    });

    const sameOrganizationGroupIds = groups.map((group) => group.id);
    if (sameOrganizationGroupIds.length === 0) {
      throw new BadRequestException('actor lacks access.policy.manage for this organization');
    }

    const allowedScopeTypes = await this.getPhase1HierarchyScopeTypes();
    const assignment = await db.groupCapability.findFirst({
      where: {
        organization_id: organizationId,
        group_id: {
          in: sameOrganizationGroupIds,
        },
        capability_key: ACCESS_POLICY_MANAGE_CAPABILITY_KEY,
        scope_type: {
          in: [...allowedScopeTypes],
        },
      },
      select: {
        id: true,
      },
    });

    if (!assignment) {
      throw new BadRequestException('actor lacks access.policy.manage for this organization');
    }

    return {
      actor_user_id: actorUserId,
      active_group_ids: sameOrganizationGroupIds,
    };
  }

  private async getPhase1HierarchyScopeTypes(): Promise<ReadonlyArray<PermissionScopeType>> {
    const seeds = await loadAccessCoreCapabilitySeedDefinitions();
    const seed = seeds.find((item) => item.capability_key === ACCESS_POLICY_MANAGE_CAPABILITY_KEY);
    if (!seed) {
      throw new ConflictException('access.policy.manage capability is missing from contract seed');
    }

    const scopeTypes = (seed.allowed_scope_types as PermissionScopeType[]).filter((scopeType) =>
      PHASE_1_HIERARCHY_SCOPE_TYPES.has(scopeType),
    );

    if (scopeTypes.length === 0) {
      throw new ConflictException('access.policy.manage has no Phase 1 hierarchy-compatible scopes');
    }

    return scopeTypes;
  }

  private async requireGatekeeperPreflight(input: HierarchyGatekeeperInput): Promise<void> {
    await this.gatekeeperPreflightService.requireAllow({
      organization_id: input.organization_id,
      actor_user_id: input.actor.actor_user_id,
      active_group_ids: input.actor.active_group_ids,
      capability_key: ACCESS_POLICY_MANAGE_CAPABILITY_KEY,
      module_key: ACCESS_MODULE_KEY,
      entity_type: input.entity_type,
      entity_id: input.entity_id,
      scope_unit_id: null,
      action_key: input.action_key,
      payload: input.payload,
      module_health: {
        [ACCESS_MODULE_KEY]: 'healthy',
      },
      dependency_health: {},
      reauth_status: 'not_required',
    });
  }

  private async recordMutationObservability(db: DbClient, input: MutationObservabilityInput) {
    await this.eventOutboxService.recordMutation(db, {
      organization_id: input.organization_id,
      action_key: input.action_key,
      entity_type: input.entity_type,
      entity_id: input.entity_id,
      actor_user_id: input.actor_user_id,
      occurred_at: new Date(),
    });

    await this.auditLogService.writeAuditLog(db, {
      organization_id: input.organization_id,
      action_key: input.action_key,
      entity_type: input.entity_type,
      entity_id: input.entity_id,
      actor_user_id: input.actor_user_id,
      metadata: input.metadata,
    });
  }

  private async assertOrganizationExistsInDb(db: DbClient, organizationId: string) {
    const item = await db.organization.findUnique({
      where: { id: organizationId },
      select: { id: true },
    });

    if (!item) {
      throw new NotFoundException('organization not found');
    }
  }

  private async assertUnitTypeExistsInOrganizationInDb(db: DbClient, organizationId: string, unitTypeId: string) {
    const unitType = await db.unitType.findFirst({
      where: {
        organization_id: organizationId,
        id: unitTypeId,
      },
      select: {
        id: true,
      },
    });

    if (!unitType) {
      throw new BadRequestException('unit_type_id must reference a unit type in the same organization');
    }
  }

  private normalizeActorUserId(actorUserIdRaw?: string | null): string | null {
    if (typeof actorUserIdRaw !== 'string') {
      return null;
    }

    const trimmed = actorUserIdRaw.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private rethrowKnownConflicts(error: unknown, fallbackMessage: string): never {
    if (isPrismaKnownRequestError(error)) {
      if (error.code === 'P2002') {
        throw new ConflictException(fallbackMessage);
      }

      if (error.code === 'P2003') {
        throw new ConflictException('cross-organization or invalid relation reference is not allowed');
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('resource not found in organization');
      }
    }

    throw error;
  }
}
