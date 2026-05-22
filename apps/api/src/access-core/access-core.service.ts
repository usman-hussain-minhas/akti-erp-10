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

const APPROVED_CAPABILITY_SCOPE_MAP: Record<string, ReadonlyArray<PermissionScopeType>> = {
  'access.policy.manage': ['global', 'organization'],
};

const SCOPE_TYPES_REQUIRING_UNIT = new Set<PermissionScopeType>(['own_unit', 'child_units']);
const SCOPE_TYPES_FORBIDDING_UNIT = new Set<PermissionScopeType>([
  'global',
  'organization',
  'own_record',
  'assigned_records',
]);

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
  constructor(private readonly prisma: PrismaService) {}

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

    return {
      items: Object.entries(APPROVED_CAPABILITY_SCOPE_MAP).map(([capabilityKey]) => ({
        key: capabilityKey,
        module_key: 'core.access',
        description: 'Contract-approved Access Core capability.',
        risk_level: 'high' as const,
        gatekeeper_required: true,
        approval_chain_required: false,
        source: 'contract_seed' as const,
      })),
    };
  }

  async createUser(organizationId: string, input: CreateUserInput): Promise<User> {
    await this.assertOrganizationExists(organizationId);

    if (input.primary_unit_id) {
      await this.assertUnitExistsInOrganization(organizationId, input.primary_unit_id, 'primary_unit_id');
    }

    try {
      return await this.prisma.user.create({
        data: {
          organization_id: organizationId,
          email: input.email,
          display_name: input.display_name,
          status: input.status,
          primary_unit_id: input.primary_unit_id ?? null,
        },
      });
    } catch (error: unknown) {
      this.rethrowKnownConflicts(error, 'user already exists in organization');
      throw error;
    }
  }

  async listUsers(organizationId: string): Promise<ListResponse<User>> {
    await this.assertOrganizationExists(organizationId);

    const items = await this.prisma.user.findMany({
      where: { organization_id: organizationId },
      orderBy: [{ email: 'asc' }],
    });

    return { items };
  }

  async getUser(organizationId: string, userId: string): Promise<User> {
    const item = await this.prisma.user.findFirst({
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

  async updateUser(organizationId: string, userId: string, input: UpdateUserInput): Promise<User> {
    await this.getUser(organizationId, userId);

    if (input.primary_unit_id) {
      await this.assertUnitExistsInOrganization(organizationId, input.primary_unit_id, 'primary_unit_id');
    }

    try {
      const updateResult = await this.prisma.user.updateMany({
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

      return await this.getUser(organizationId, userId);
    } catch (error: unknown) {
      this.rethrowKnownConflicts(error, 'user update violates organization constraints');
      throw error;
    }
  }

  async deleteUser(organizationId: string, userId: string): Promise<{ deleted: true }> {
    await this.getUser(organizationId, userId);

    const [membershipCount, auditCount] = await Promise.all([
      this.prisma.userGroup.count({
        where: {
          organization_id: organizationId,
          user_id: userId,
        },
      }),
      this.prisma.auditLog.count({
        where: {
          organization_id: organizationId,
          actor_user_id: userId,
        },
      }),
    ]);

    if (membershipCount > 0 || auditCount > 0) {
      throw new ConflictException('cannot delete user with dependent memberships or protected references');
    }

    const deleteResult = await this.prisma.user.deleteMany({
      where: {
        organization_id: organizationId,
        id: userId,
      },
    });

    if (deleteResult.count !== 1) {
      throw new NotFoundException('user not found in organization');
    }

    return { deleted: true as const };
  }

  async createGroup(organizationId: string, input: CreateGroupInput): Promise<Group> {
    await this.assertOrganizationExists(organizationId);

    try {
      return await this.prisma.group.create({
        data: {
          organization_id: organizationId,
          key: input.key,
          label: input.label,
          status: input.status,
        },
      });
    } catch (error: unknown) {
      this.rethrowKnownConflicts(error, 'group already exists in organization');
      throw error;
    }
  }

  async listGroups(organizationId: string): Promise<ListResponse<Group>> {
    await this.assertOrganizationExists(organizationId);

    const items = await this.prisma.group.findMany({
      where: { organization_id: organizationId },
      orderBy: [{ key: 'asc' }],
    });

    return { items };
  }

  async getGroup(organizationId: string, groupId: string): Promise<Group> {
    const item = await this.prisma.group.findFirst({
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

  async updateGroup(organizationId: string, groupId: string, input: UpdateGroupInput): Promise<Group> {
    await this.getGroup(organizationId, groupId);

    try {
      const updateResult = await this.prisma.group.updateMany({
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

      return await this.getGroup(organizationId, groupId);
    } catch (error: unknown) {
      this.rethrowKnownConflicts(error, 'group update violates organization constraints');
      throw error;
    }
  }

  async deleteGroup(organizationId: string, groupId: string): Promise<{ deleted: true }> {
    await this.getGroup(organizationId, groupId);

    const [membershipCount, assignmentCount] = await Promise.all([
      this.prisma.userGroup.count({
        where: {
          organization_id: organizationId,
          group_id: groupId,
        },
      }),
      this.prisma.groupCapability.count({
        where: {
          organization_id: organizationId,
          group_id: groupId,
        },
      }),
    ]);

    if (membershipCount > 0 || assignmentCount > 0) {
      throw new ConflictException('cannot delete group with dependent memberships or capability assignments');
    }

    const deleteResult = await this.prisma.group.deleteMany({
      where: {
        organization_id: organizationId,
        id: groupId,
      },
    });

    if (deleteResult.count !== 1) {
      throw new NotFoundException('group not found in organization');
    }

    return { deleted: true as const };
  }

  async createMembership(organizationId: string, input: CreateMembershipInput): Promise<UserGroup> {
    await this.getUser(organizationId, input.user_id);
    await this.getGroup(organizationId, input.group_id);

    try {
      return await this.prisma.userGroup.create({
        data: {
          organization_id: organizationId,
          user_id: input.user_id,
          group_id: input.group_id,
        },
      });
    } catch (error: unknown) {
      this.rethrowKnownConflicts(error, 'membership already exists in organization');
      throw error;
    }
  }

  async listMemberships(organizationId: string): Promise<ListResponse<UserGroup>> {
    await this.assertOrganizationExists(organizationId);

    const items = await this.prisma.userGroup.findMany({
      where: { organization_id: organizationId },
      orderBy: [{ assigned_at: 'desc' }],
    });

    return { items };
  }

  async deleteMembership(organizationId: string, membershipId: string): Promise<{ deleted: true }> {
    const membership = await this.prisma.userGroup.findFirst({
      where: {
        organization_id: organizationId,
        id: membershipId,
      },
    });

    if (!membership) {
      throw new NotFoundException('membership not found in organization');
    }

    const deleteResult = await this.prisma.userGroup.deleteMany({
      where: {
        organization_id: organizationId,
        id: membershipId,
      },
    });

    if (deleteResult.count !== 1) {
      throw new NotFoundException('membership not found in organization');
    }

    return { deleted: true as const };
  }

  async createGroupCapabilityAssignment(
    organizationId: string,
    input: CreateGroupCapabilityInput,
  ): Promise<GroupCapability> {
    const scopeType = this.validatePermissionScopeType(input.scope_type);

    await this.getGroup(organizationId, input.group_id);

    if (SCOPE_TYPES_FORBIDDING_UNIT.has(scopeType) && input.scope_unit_id) {
      throw new BadRequestException('scope_unit_id is not allowed for this scope_type');
    }

    if (SCOPE_TYPES_REQUIRING_UNIT.has(scopeType)) {
      if (!input.scope_unit_id) {
        throw new BadRequestException('scope_unit_id is required for this scope_type');
      }

      await this.assertUnitExistsInOrganization(organizationId, input.scope_unit_id, 'scope_unit_id');
    }

    const allowedScopes = APPROVED_CAPABILITY_SCOPE_MAP[input.capability_key];
    if (!allowedScopes) {
      throw new BadRequestException('capability_key is not approved by Access Core contract boundary');
    }

    if (!allowedScopes.includes(scopeType)) {
      throw new BadRequestException('scope_type is not allowed for this capability');
    }

    const capabilityInDb = await this.prisma.capability.findUnique({
      where: {
        key: input.capability_key,
      },
    });

    if (!capabilityInDb) {
      throw new ConflictException('capability exists in contract but is missing from database catalog');
    }

    try {
      return await this.prisma.groupCapability.create({
        data: {
          organization_id: organizationId,
          group_id: input.group_id,
          capability_key: input.capability_key,
          scope_type: scopeType,
          scope_unit_id: input.scope_unit_id ?? null,
        },
      });
    } catch (error: unknown) {
      this.rethrowKnownConflicts(error, 'group-capability assignment already exists in organization');
      throw error;
    }
  }

  async listGroupCapabilityAssignments(organizationId: string): Promise<ListResponse<GroupCapability>> {
    await this.assertOrganizationExists(organizationId);

    const items = await this.prisma.groupCapability.findMany({
      where: { organization_id: organizationId },
      orderBy: [{ group_id: 'asc' }, { capability_key: 'asc' }],
    });

    return { items };
  }

  async deleteGroupCapabilityAssignment(
    organizationId: string,
    assignmentId: string,
  ): Promise<{ deleted: true }> {
    const assignment = await this.prisma.groupCapability.findFirst({
      where: {
        organization_id: organizationId,
        id: assignmentId,
      },
    });

    if (!assignment) {
      throw new NotFoundException('group-capability assignment not found in organization');
    }

    const deleteResult = await this.prisma.groupCapability.deleteMany({
      where: {
        organization_id: organizationId,
        id: assignmentId,
      },
    });

    if (deleteResult.count !== 1) {
      throw new NotFoundException('group-capability assignment not found in organization');
    }

    return { deleted: true as const };
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

  private async assertOrganizationExists(organizationId: string) {
    const item = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true },
    });

    if (!item) {
      throw new NotFoundException('organization not found');
    }
  }

  private async assertUnitExistsInOrganization(organizationId: string, unitId: string, fieldName: string) {
    const unit = await this.prisma.organizationUnit.findFirst({
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
