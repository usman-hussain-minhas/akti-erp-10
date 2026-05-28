import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import type { CapabilityRiskLevel, PermissionScopeType } from '../prisma/prisma-client';
import { PrismaService } from '../prisma/prisma.service';
import type { TrustedActorContext } from './request-context';

export type CurrentUserProfile = {
  organization_id: string;
  user: {
    id: string;
    email: string;
    display_name: string;
    status: string;
    primary_unit_id: string | null;
    primary_unit: {
      id: string;
      key: string;
      name: string;
      status: string;
    } | null;
  };
  active_group_ids: string[];
  groups: Array<{
    id: string;
    key: string;
    label: string;
    status: string;
  }>;
  capabilities: Array<{
    capability_key: string;
    module_key: string;
    scope_type: PermissionScopeType;
    scope_unit_id: string | null;
    risk_level: CapabilityRiskLevel;
    gatekeeper_required: boolean;
    approval_chain_required: boolean;
    source_group_ids: string[];
  }>;
};

@Injectable()
export class CurrentUserService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentUserProfile(context: TrustedActorContext): Promise<CurrentUserProfile> {
    const organizationId = this.normalizeTrustedValue(context.organization_id, 'organization_id');
    const actorUserId = this.normalizeTrustedValue(context.actor_user_id, 'actor_user_id');

    const user = await this.prisma.user.findFirst({
      where: {
        organization_id: organizationId,
        id: actorUserId,
      },
      select: {
        id: true,
        email: true,
        display_name: true,
        status: true,
        primary_unit_id: true,
        primary_unit: {
          select: {
            id: true,
            key: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('current user not found in organization');
    }

    const memberships = await this.prisma.userGroup.findMany({
      where: {
        organization_id: organizationId,
        user_id: actorUserId,
      },
      select: {
        group: {
          select: {
            id: true,
            key: true,
            label: true,
            status: true,
            group_capabilities: {
              select: {
                capability_key: true,
                scope_type: true,
                scope_unit_id: true,
                capability: {
                  select: {
                    module_key: true,
                    risk_level: true,
                    gatekeeper_required: true,
                    approval_chain_required: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ group_id: 'asc' }],
    });

    const activeGroups = memberships.map((membership) => membership.group).filter((group) => group.status === 'active');

    return {
      organization_id: organizationId,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        status: user.status,
        primary_unit_id: user.primary_unit_id,
        primary_unit: user.primary_unit
          ? {
              id: user.primary_unit.id,
              key: user.primary_unit.key,
              name: user.primary_unit.name,
              status: user.primary_unit.status,
            }
          : null,
      },
      active_group_ids: activeGroups.map((group) => group.id),
      groups: activeGroups.map((group) => ({
        id: group.id,
        key: group.key,
        label: group.label,
        status: group.status,
      })),
      capabilities: this.collectCapabilities(activeGroups),
    };
  }

  private collectCapabilities(
    groups: Array<{
      id: string;
      group_capabilities: Array<{
        capability_key: string;
        scope_type: PermissionScopeType;
        scope_unit_id: string | null;
        capability: {
          module_key: string;
          risk_level: CapabilityRiskLevel;
          gatekeeper_required: boolean;
          approval_chain_required: boolean;
        };
      }>;
    }>,
  ): CurrentUserProfile['capabilities'] {
    const capabilityMap = new Map<string, CurrentUserProfile['capabilities'][number]>();

    for (const group of groups) {
      for (const assignment of group.group_capabilities) {
        const mapKey = [assignment.capability_key, assignment.scope_type, assignment.scope_unit_id ?? ''].join('|');
        const existing = capabilityMap.get(mapKey);

        if (existing) {
          existing.source_group_ids.push(group.id);
          existing.source_group_ids.sort();
          continue;
        }

        capabilityMap.set(mapKey, {
          capability_key: assignment.capability_key,
          module_key: assignment.capability.module_key,
          scope_type: assignment.scope_type,
          scope_unit_id: assignment.scope_unit_id,
          risk_level: assignment.capability.risk_level,
          gatekeeper_required: assignment.capability.gatekeeper_required,
          approval_chain_required: assignment.capability.approval_chain_required,
          source_group_ids: [group.id],
        });
      }
    }

    return [...capabilityMap.values()].sort((left, right) => {
      const capabilityComparison = left.capability_key.localeCompare(right.capability_key);
      if (capabilityComparison !== 0) {
        return capabilityComparison;
      }

      const scopeComparison = left.scope_type.localeCompare(right.scope_type);
      if (scopeComparison !== 0) {
        return scopeComparison;
      }

      return (left.scope_unit_id ?? '').localeCompare(right.scope_unit_id ?? '');
    });
  }

  private normalizeTrustedValue(value: string, field: 'organization_id' | 'actor_user_id') {
    const normalized = value.trim();
    if (normalized.length === 0) {
      throw new BadRequestException(`${field} is required in trusted context`);
    }

    return normalized;
  }
}
