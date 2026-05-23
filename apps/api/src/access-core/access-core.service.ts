import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  type Capability,
  type Group,
  type GroupCapability,
  type PermissionScopeType,
  type User,
  type UserGroup,
} from '../../node_modules/.prisma/client';

import { GatekeeperPreflightService } from '../gatekeeper/gatekeeper-preflight.service';
import { loadAccessCoreCapabilitySeedDefinitions } from '../module-registry/module-registry.service';
import { AuditLogService } from '../platform-observability/audit-log.service';
import { EventOutboxService } from '../platform-observability/event-outbox.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  AccessCoreValidationError,
  type CreateGroupCapabilityInput,
  type CreateGroupInput,
  type CreateMembershipInput,
  type CreateUserInput,
  type UpdateGroupInput,
  type UpdateUserInput,
} from './dto/access-core.dto';

const ACCESS_POLICY_MANAGE_CAPABILITY_KEY = 'access.policy.manage';

const SCOPE_TYPES_REQUIRING_UNIT = new Set<PermissionScopeType>(['own_unit', 'child_units']);
const SCOPE_TYPES_FORBIDDING_UNIT = new Set<PermissionScopeType>([
  'global',
  'organization',
  'own_record',
  'assigned_records',
]);

type DbClient = PrismaService | Prisma.TransactionClient;

type CapabilityResponseItem = Pick<
  Capability,
  'key' | 'module_key' | 'description' | 'risk_level' | 'gatekeeper_required' | 'approval_chain_required'
> & {
  source: 'database' | 'contract_seed';
};

type CapabilityListResponse = {
  items: CapabilityResponseItem[];
};

type ListResponse<T> = {
  items: T[];
};

type MutationObservabilityInput = {
  organization_id: string;
  action_key: string;
  entity_type: string;
  entity_id: string;
  actor_user_id?: string;
  metadata: Prisma.InputJsonValue;
};

type AuthorizedAccessActor = {
  actor_user_id: string;
  active_group_ids: string[];
};

type AccessCoreGatekeeperPreflightInput = {
  organization_id: string;
  actor: AuthorizedAccessActor;
  entity_type: 'access.user' | 'access.group' | 'access.membership' | 'access.group-capability';
  entity_id: string | null;
  action_key: string;
  payload?: Record<string, unknown>;
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
export class AccessCoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly eventOutboxService: EventOutboxService,
    private readonly gatekeeperPreflightService: GatekeeperPreflightService,
  ) {}

  async listCapabilities(): Promise<CapabilityListResponse> {
    const rows = await this.prisma.capability.findMany({
      orderBy: [{ module_key: 'asc' }, { key: 'asc' }],
    });

    if (rows.length > 0) {
      return {
        items: rows.map((item) => ({
          key: item.key,
          module_key: item.module_key,
          description: item.description,
          risk_level: item.risk_level,
          gatekeeper_required: item.gatekeeper_required,
          approval_chain_required: item.approval_chain_required,
          source: 'database' as const,
        })),
      };
    }

    const seeds = await loadAccessCoreCapabilitySeedDefinitions();

    return {
      items: seeds.map((seed) => ({
        key: seed.capability_key,
        module_key: seed.module_key,
        description: seed.description,
        risk_level: seed.risk_level,
        gatekeeper_required: seed.gatekeeper_required,
        approval_chain_required: seed.approval_chain_required,
        source: 'contract_seed' as const,
      })),
    };
  }

  async createUser(organizationId: string, input: CreateUserInput, actorUserIdRaw?: string): Promise<User> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const actor = await this.requireAccessPolicyManageActor(tx, organizationId, actorUserIdRaw);
        await this.requireGatekeeperPreflight({
          organization_id: organizationId,
          actor,
          entity_type: 'access.user',
          entity_id: null,
          action_key: 'access.user.created',
          payload: {
            operation: 'create',
          },
        });

        await this.assertOrganizationExistsInDb(tx, organizationId);
        await this.assertEmailDomainBelongsToOrganizationInDb(tx, organizationId, input.email);

        if (input.primary_unit_id) {
          await this.assertUnitExistsInOrganizationInDb(tx, organizationId, input.primary_unit_id, 'primary_unit_id');
        }

        const created = await tx.user.create({
          data: {
            organization_id: organizationId,
            email: input.email,
            display_name: input.display_name,
            status: input.status,
            primary_unit_id: input.primary_unit_id ?? null,
          },
        });

        await this.recordMutationObservability(tx, {
          organization_id: organizationId,
          action_key: 'access.user.created',
          entity_type: 'access.user',
          entity_id: created.id,
          actor_user_id: actor.actor_user_id,
          metadata: {
            email: created.email,
          },
        });

        return created;
      });
    } catch (error: unknown) {
      this.rethrowKnownConflicts(error, 'user already exists in organization');
      throw error;
    }
  }

  async listUsers(organizationId: string): Promise<ListResponse<User>> {
    await this.assertOrganizationExistsInDb(this.prisma, organizationId);

    const items = await this.prisma.user.findMany({
      where: { organization_id: organizationId },
      orderBy: [{ email: 'asc' }],
    });

    return { items };
  }

  async getUser(organizationId: string, userId: string): Promise<User> {
    return this.getUserInDb(this.prisma, organizationId, userId);
  }

  async updateUser(
    organizationId: string,
    userId: string,
    input: UpdateUserInput,
    actorUserIdRaw?: string,
  ): Promise<User> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const actor = await this.requireAccessPolicyManageActor(tx, organizationId, actorUserIdRaw);
        await this.requireGatekeeperPreflight({
          organization_id: organizationId,
          actor,
          entity_type: 'access.user',
          entity_id: userId,
          action_key: 'access.user.updated',
          payload: {
            operation: 'update',
          },
        });

        const existingUser = await this.getUserInDb(tx, organizationId, userId);
        if (input.email !== undefined && input.email !== existingUser.email) {
          await this.assertEmailDomainBelongsToOrganizationInDb(tx, organizationId, input.email);
        }

        if (input.primary_unit_id) {
          await this.assertUnitExistsInOrganizationInDb(tx, organizationId, input.primary_unit_id, 'primary_unit_id');
        }

        const updateResult = await tx.user.updateMany({
          where: {
            organization_id: organizationId,
            id: userId,
          },
          data: {
            email: input.email,
            display_name: input.display_name,
            status: input.status,
            primary_unit_id: input.primary_unit_id,
          },
        });

        if (updateResult.count !== 1) {
          throw new NotFoundException('user not found in organization');
        }

        const updated = await tx.user.findFirst({
          where: {
            organization_id: organizationId,
            id: userId,
          },
        });

        if (!updated) {
          throw new NotFoundException('user not found in organization');
        }

        await this.recordMutationObservability(tx, {
          organization_id: organizationId,
          action_key: 'access.user.updated',
          entity_type: 'access.user',
          entity_id: updated.id,
          actor_user_id: actor.actor_user_id,
          metadata: {
            updated_fields: Object.keys(input),
          },
        });

        return updated;
      });
    } catch (error: unknown) {
      this.rethrowKnownConflicts(error, 'user update violates organization constraints');
      throw error;
    }
  }

  async deleteUser(organizationId: string, userId: string, actorUserIdRaw?: string): Promise<{ deleted: true }> {
    return this.prisma.$transaction(async (tx) => {
      const actor = await this.requireAccessPolicyManageActor(tx, organizationId, actorUserIdRaw);
      await this.requireGatekeeperPreflight({
        organization_id: organizationId,
        actor,
        entity_type: 'access.user',
        entity_id: userId,
        action_key: 'access.user.deleted',
        payload: {
          operation: 'delete',
        },
      });

      const user = await tx.user.findFirst({
        where: {
          organization_id: organizationId,
          id: userId,
        },
      });

      if (!user) {
        throw new NotFoundException('user not found in organization');
      }

      const [membershipCount, auditCount] = await Promise.all([
        tx.userGroup.count({
          where: {
            organization_id: organizationId,
            user_id: userId,
          },
        }),
        tx.auditLog.count({
          where: {
            organization_id: organizationId,
            actor_user_id: userId,
          },
        }),
      ]);

      if (membershipCount > 0 || auditCount > 0) {
        throw new ConflictException('cannot delete user with dependent memberships or protected references');
      }

      const deleteResult = await tx.user.deleteMany({
        where: {
          organization_id: organizationId,
          id: userId,
        },
      });

      if (deleteResult.count !== 1) {
        throw new NotFoundException('user not found in organization');
      }

      await this.recordMutationObservability(tx, {
        organization_id: organizationId,
        action_key: 'access.user.deleted',
        entity_type: 'access.user',
        entity_id: userId,
        actor_user_id: actor.actor_user_id,
        metadata: {
          deleted: true,
        },
      });

      return { deleted: true as const };
    });
  }

  async createGroup(organizationId: string, input: CreateGroupInput, actorUserIdRaw?: string): Promise<Group> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const actor = await this.requireAccessPolicyManageActor(tx, organizationId, actorUserIdRaw);
        await this.requireGatekeeperPreflight({
          organization_id: organizationId,
          actor,
          entity_type: 'access.group',
          entity_id: null,
          action_key: 'access.group.created',
          payload: {
            operation: 'create',
          },
        });

        await this.assertOrganizationExistsInDb(tx, organizationId);

        const created = await tx.group.create({
          data: {
            organization_id: organizationId,
            key: input.key,
            label: input.label,
            status: input.status,
          },
        });

        await this.recordMutationObservability(tx, {
          organization_id: organizationId,
          action_key: 'access.group.created',
          entity_type: 'access.group',
          entity_id: created.id,
          actor_user_id: actor.actor_user_id,
          metadata: {
            key: created.key,
          },
        });

        return created;
      });
    } catch (error: unknown) {
      this.rethrowKnownConflicts(error, 'group already exists in organization');
      throw error;
    }
  }

  async listGroups(organizationId: string): Promise<ListResponse<Group>> {
    await this.assertOrganizationExistsInDb(this.prisma, organizationId);

    const items = await this.prisma.group.findMany({
      where: { organization_id: organizationId },
      orderBy: [{ key: 'asc' }],
    });

    return { items };
  }

  async getGroup(organizationId: string, groupId: string): Promise<Group> {
    return this.getGroupInDb(this.prisma, organizationId, groupId);
  }

  async updateGroup(
    organizationId: string,
    groupId: string,
    input: UpdateGroupInput,
    actorUserIdRaw?: string,
  ): Promise<Group> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const actor = await this.requireAccessPolicyManageActor(tx, organizationId, actorUserIdRaw);
        await this.requireGatekeeperPreflight({
          organization_id: organizationId,
          actor,
          entity_type: 'access.group',
          entity_id: groupId,
          action_key: 'access.group.updated',
          payload: {
            operation: 'update',
          },
        });

        await this.getGroupInDb(tx, organizationId, groupId);

        const updateResult = await tx.group.updateMany({
          where: {
            organization_id: organizationId,
            id: groupId,
          },
          data: {
            key: input.key,
            label: input.label,
            status: input.status,
          },
        });

        if (updateResult.count !== 1) {
          throw new NotFoundException('group not found in organization');
        }

        const updated = await tx.group.findFirst({
          where: {
            organization_id: organizationId,
            id: groupId,
          },
        });

        if (!updated) {
          throw new NotFoundException('group not found in organization');
        }

        await this.recordMutationObservability(tx, {
          organization_id: organizationId,
          action_key: 'access.group.updated',
          entity_type: 'access.group',
          entity_id: updated.id,
          actor_user_id: actor.actor_user_id,
          metadata: {
            updated_fields: Object.keys(input),
          },
        });

        return updated;
      });
    } catch (error: unknown) {
      this.rethrowKnownConflicts(error, 'group update violates organization constraints');
      throw error;
    }
  }

  async deleteGroup(organizationId: string, groupId: string, actorUserIdRaw?: string): Promise<{ deleted: true }> {
    return this.prisma.$transaction(async (tx) => {
      const actor = await this.requireAccessPolicyManageActor(tx, organizationId, actorUserIdRaw);
      await this.requireGatekeeperPreflight({
        organization_id: organizationId,
        actor,
        entity_type: 'access.group',
        entity_id: groupId,
        action_key: 'access.group.deleted',
        payload: {
          operation: 'delete',
        },
      });

      const group = await tx.group.findFirst({
        where: {
          organization_id: organizationId,
          id: groupId,
        },
      });

      if (!group) {
        throw new NotFoundException('group not found in organization');
      }

      const [membershipCount, assignmentCount] = await Promise.all([
        tx.userGroup.count({
          where: {
            organization_id: organizationId,
            group_id: groupId,
          },
        }),
        tx.groupCapability.count({
          where: {
            organization_id: organizationId,
            group_id: groupId,
          },
        }),
      ]);

      if (membershipCount > 0 || assignmentCount > 0) {
        throw new ConflictException('cannot delete group with dependent memberships or capability assignments');
      }

      const deleteResult = await tx.group.deleteMany({
        where: {
          organization_id: organizationId,
          id: groupId,
        },
      });

      if (deleteResult.count !== 1) {
        throw new NotFoundException('group not found in organization');
      }

      await this.recordMutationObservability(tx, {
        organization_id: organizationId,
        action_key: 'access.group.deleted',
        entity_type: 'access.group',
        entity_id: groupId,
        actor_user_id: actor.actor_user_id,
        metadata: {
          deleted: true,
        },
      });

      return { deleted: true as const };
    });
  }

  async createMembership(
    organizationId: string,
    input: CreateMembershipInput,
    actorUserIdRaw?: string,
  ): Promise<UserGroup> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const actor = await this.requireAccessPolicyManageActor(tx, organizationId, actorUserIdRaw);
        await this.requireGatekeeperPreflight({
          organization_id: organizationId,
          actor,
          entity_type: 'access.membership',
          entity_id: null,
          action_key: 'access.membership.created',
          payload: {
            operation: 'create',
          },
        });

        await this.getUserInDb(tx, organizationId, input.user_id);
        await this.getGroupInDb(tx, organizationId, input.group_id);

        const created = await tx.userGroup.create({
          data: {
            organization_id: organizationId,
            user_id: input.user_id,
            group_id: input.group_id,
          },
        });

        await this.recordMutationObservability(tx, {
          organization_id: organizationId,
          action_key: 'access.membership.created',
          entity_type: 'access.membership',
          entity_id: created.id,
          actor_user_id: actor.actor_user_id,
          metadata: {
            user_id: created.user_id,
            group_id: created.group_id,
          },
        });

        return created;
      });
    } catch (error: unknown) {
      this.rethrowKnownConflicts(error, 'membership already exists in organization');
      throw error;
    }
  }

  async listMemberships(organizationId: string): Promise<ListResponse<UserGroup>> {
    await this.assertOrganizationExistsInDb(this.prisma, organizationId);

    const items = await this.prisma.userGroup.findMany({
      where: { organization_id: organizationId },
      orderBy: [{ assigned_at: 'desc' }],
    });

    return { items };
  }

  async deleteMembership(
    organizationId: string,
    membershipId: string,
    actorUserIdRaw?: string,
  ): Promise<{ deleted: true }> {
    return this.prisma.$transaction(async (tx) => {
      const actor = await this.requireAccessPolicyManageActor(tx, organizationId, actorUserIdRaw);
      await this.requireGatekeeperPreflight({
        organization_id: organizationId,
        actor,
        entity_type: 'access.membership',
        entity_id: membershipId,
        action_key: 'access.membership.deleted',
        payload: {
          operation: 'delete',
        },
      });

      const membership = await tx.userGroup.findFirst({
        where: {
          organization_id: organizationId,
          id: membershipId,
        },
      });

      if (!membership) {
        throw new NotFoundException('membership not found in organization');
      }

      const deleteResult = await tx.userGroup.deleteMany({
        where: {
          organization_id: organizationId,
          id: membershipId,
        },
      });

      if (deleteResult.count !== 1) {
        throw new NotFoundException('membership not found in organization');
      }

      await this.recordMutationObservability(tx, {
        organization_id: organizationId,
        action_key: 'access.membership.deleted',
        entity_type: 'access.membership',
        entity_id: membershipId,
        actor_user_id: actor.actor_user_id,
        metadata: {
          deleted: true,
        },
      });

      return { deleted: true as const };
    });
  }

  async createGroupCapabilityAssignment(
    organizationId: string,
    input: CreateGroupCapabilityInput,
    actorUserIdRaw?: string,
  ): Promise<GroupCapability> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const actor = await this.requireAccessPolicyManageActor(tx, organizationId, actorUserIdRaw);
        await this.requireGatekeeperPreflight({
          organization_id: organizationId,
          actor,
          entity_type: 'access.group-capability',
          entity_id: null,
          action_key: 'access.group-capability.created',
          payload: {
            operation: 'create',
          },
        });
        const scopeType = this.validatePermissionScopeType(input.scope_type);

        await this.getGroupInDb(tx, organizationId, input.group_id);

        if (SCOPE_TYPES_FORBIDDING_UNIT.has(scopeType) && input.scope_unit_id) {
          throw new BadRequestException('scope_unit_id is not allowed for this scope_type');
        }

        if (SCOPE_TYPES_REQUIRING_UNIT.has(scopeType)) {
          if (!input.scope_unit_id) {
            throw new BadRequestException('scope_unit_id is required for this scope_type');
          }

          await this.assertUnitExistsInOrganizationInDb(tx, organizationId, input.scope_unit_id, 'scope_unit_id');
        }

        const allowedScopes = await this.getAllowedScopeTypesForCapability(input.capability_key);
        if (!allowedScopes) {
          throw new BadRequestException('capability_key is not approved by Access Core contract boundary');
        }

        if (!allowedScopes.includes(scopeType)) {
          throw new BadRequestException('scope_type is not allowed for this capability');
        }

        const capabilityInDb = await tx.capability.findUnique({
          where: {
            key: input.capability_key,
          },
        });

        if (!capabilityInDb) {
          throw new ConflictException('capability exists in contract but is missing from database catalog');
        }

        const created = await tx.groupCapability.create({
          data: {
            organization_id: organizationId,
            group_id: input.group_id,
            capability_key: input.capability_key,
            scope_type: scopeType,
            scope_unit_id: input.scope_unit_id ?? null,
          },
        });

        await this.recordMutationObservability(tx, {
          organization_id: organizationId,
          action_key: 'access.group-capability.created',
          entity_type: 'access.group-capability',
          entity_id: created.id,
          actor_user_id: actor.actor_user_id,
          metadata: {
            group_id: created.group_id,
            capability_key: created.capability_key,
            scope_type: created.scope_type,
            scope_unit_id: created.scope_unit_id,
          },
        });

        return created;
      });
    } catch (error: unknown) {
      this.rethrowKnownConflicts(error, 'group-capability assignment already exists in organization');
      throw error;
    }
  }

  async listGroupCapabilityAssignments(organizationId: string): Promise<ListResponse<GroupCapability>> {
    await this.assertOrganizationExistsInDb(this.prisma, organizationId);

    const items = await this.prisma.groupCapability.findMany({
      where: { organization_id: organizationId },
      orderBy: [{ group_id: 'asc' }, { capability_key: 'asc' }],
    });

    return { items };
  }

  async deleteGroupCapabilityAssignment(
    organizationId: string,
    assignmentId: string,
    actorUserIdRaw?: string,
  ): Promise<{ deleted: true }> {
    return this.prisma.$transaction(async (tx) => {
      const actor = await this.requireAccessPolicyManageActor(tx, organizationId, actorUserIdRaw);
      await this.requireGatekeeperPreflight({
        organization_id: organizationId,
        actor,
        entity_type: 'access.group-capability',
        entity_id: assignmentId,
        action_key: 'access.group-capability.deleted',
        payload: {
          operation: 'delete',
        },
      });

      const assignment = await tx.groupCapability.findFirst({
        where: {
          organization_id: organizationId,
          id: assignmentId,
        },
      });

      if (!assignment) {
        throw new NotFoundException('group-capability assignment not found in organization');
      }

      const deleteResult = await tx.groupCapability.deleteMany({
        where: {
          organization_id: organizationId,
          id: assignmentId,
        },
      });

      if (deleteResult.count !== 1) {
        throw new NotFoundException('group-capability assignment not found in organization');
      }

      await this.recordMutationObservability(tx, {
        organization_id: organizationId,
        action_key: 'access.group-capability.deleted',
        entity_type: 'access.group-capability',
        entity_id: assignmentId,
        actor_user_id: actor.actor_user_id,
        metadata: {
          deleted: true,
        },
      });

      return { deleted: true as const };
    });
  }

  private validatePermissionScopeType(rawScopeType: string): PermissionScopeType {
    const allowed = new Set<PermissionScopeType>([
      'global',
      'organization',
      'own_unit',
      'child_units',
      'own_record',
      'assigned_records',
    ]);

    if (!allowed.has(rawScopeType as PermissionScopeType)) {
      throw new BadRequestException('scope_type must be a valid PermissionScopeType');
    }

    return rawScopeType as PermissionScopeType;
  }

  private async requireAccessPolicyManageActor(
    db: DbClient,
    organizationId: string,
    actorUserIdRaw?: string,
  ): Promise<AuthorizedAccessActor> {
    const actorUserId = this.normalizeActorUserId(actorUserIdRaw);
    if (!actorUserId) {
      throw new BadRequestException('x-actor-user-id is required for protected Access Core mutations');
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

    const allowedScopeTypes = await this.getAllowedScopeTypesForCapability(ACCESS_POLICY_MANAGE_CAPABILITY_KEY);
    if (!allowedScopeTypes) {
      throw new ConflictException('access.policy.manage capability is missing from contract seed');
    }

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

  private async getAllowedScopeTypesForCapability(capabilityKey: string): Promise<ReadonlyArray<PermissionScopeType> | null> {
    const seeds = await loadAccessCoreCapabilitySeedDefinitions();
    const seed = seeds.find((item) => item.capability_key === capabilityKey);
    if (!seed) {
      return null;
    }

    return seed.allowed_scope_types as ReadonlyArray<PermissionScopeType>;
  }

  private async requireGatekeeperPreflight(input: AccessCoreGatekeeperPreflightInput): Promise<void> {
    await this.gatekeeperPreflightService.requireAllow({
      organization_id: input.organization_id,
      actor_user_id: input.actor.actor_user_id,
      active_group_ids: input.actor.active_group_ids,
      capability_key: ACCESS_POLICY_MANAGE_CAPABILITY_KEY,
      module_key: 'core.access',
      entity_type: input.entity_type,
      entity_id: input.entity_id,
      scope_unit_id: null,
      action_key: input.action_key,
      payload: input.payload,
      module_health: {
        'core.access': 'healthy',
      },
      dependency_health: {},
      reauth_status: 'not_required',
    });
  }

  private normalizeActorUserId(actorUserIdRaw?: string | null): string | null {
    if (typeof actorUserIdRaw !== 'string') {
      return null;
    }

    const trimmed = actorUserIdRaw.trim();
    return trimmed.length > 0 ? trimmed : null;
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

  private async assertEmailDomainBelongsToOrganizationInDb(db: DbClient, organizationId: string, email: string) {
    const domain = this.extractNormalizedEmailDomain(email);
    const item = await db.organizationDomain.findFirst({
      where: {
        organization_id: organizationId,
        domain,
      },
      select: {
        id: true,
      },
    });

    if (!item) {
      throw new BadRequestException('email domain must be registered to the organization');
    }
  }

  private extractNormalizedEmailDomain(email: string) {
    const atIndex = email.lastIndexOf('@');
    const domain = atIndex >= 0 ? email.slice(atIndex + 1).trim().toLowerCase() : '';
    if (atIndex <= 0 || domain.length === 0) {
      throw new BadRequestException('email must be in a valid format');
    }

    return domain;
  }

  private async getUserInDb(db: DbClient, organizationId: string, userId: string): Promise<User> {
    const item = await db.user.findFirst({
      where: {
        organization_id: organizationId,
        id: userId,
      },
    });

    if (!item) {
      throw new NotFoundException('user not found in organization');
    }

    return item;
  }

  private async getGroupInDb(db: DbClient, organizationId: string, groupId: string): Promise<Group> {
    const item = await db.group.findFirst({
      where: {
        organization_id: organizationId,
        id: groupId,
      },
    });

    if (!item) {
      throw new NotFoundException('group not found in organization');
    }

    return item;
  }

  private async assertUnitExistsInOrganizationInDb(
    db: DbClient,
    organizationId: string,
    unitId: string,
    fieldName: string,
  ) {
    const unit = await db.organizationUnit.findFirst({
      where: {
        organization_id: organizationId,
        id: unitId,
      },
      select: { id: true },
    });

    if (!unit) {
      throw new BadRequestException(`${fieldName} must reference an organization unit in the same organization`);
    }
  }

  private rethrowKnownConflicts(error: unknown, fallbackMessage: string): never {
    if (error instanceof AccessCoreValidationError) {
      throw new BadRequestException(error.message);
    }

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
