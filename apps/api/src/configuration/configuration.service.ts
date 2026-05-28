import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TransactionIsolationLevel, type PermissionScopeType, type Prisma } from '../prisma/prisma-client';

import { GatekeeperPreflightService } from '../gatekeeper/gatekeeper-preflight.service';
import { loadAccessCoreCapabilitySeedDefinitions } from '../module-registry/module-registry.service';
import { AuditLogService } from '../platform-observability/audit-log.service';
import { EventOutboxService } from '../platform-observability/event-outbox.service';
import { PrismaService } from '../prisma/prisma.service';
import type { PortalMode, UpdatePortalModeInput } from './dto/configuration.dto';

const ACCESS_POLICY_MANAGE_CAPABILITY_KEY = 'access.policy.manage';
const ACCESS_MODULE_KEY = 'core.access';
const PORTAL_MODE_SETTING_KEY = 'portal.mode';
const DEFAULT_PORTAL_MODE: PortalMode = 'simple';
const DEFAULT_WHITE_LABEL_MODE = 'none';
const ORGANIZATION_CONFIGURATION_SCOPE_TYPES = new Set<PermissionScopeType>(['global', 'organization']);

export const TENANT_CONFIG_SCHEMA_MODEL_BASELINE = {
  decision: 'reuse_existing_models',
  setting_model: 'OrganizationSetting',
  domain_model: 'OrganizationDomain',
  rejected_new_model: 'PlatformTenantConfig',
  setting_key_examples: [PORTAL_MODE_SETTING_KEY],
  required_setting_fields: ['organization_id', 'key', 'value_json', 'updated_at'],
  required_domain_fields: ['organization_id', 'domain', 'is_primary', 'verified_at'],
  required_setting_uniques: ['@@unique([organization_id, key])'],
  required_domain_uniques: ['domain @unique', '@@unique([organization_id, domain])'],
  tenant_isolation_field: 'organization_id',
  decision_reason:
    'OrganizationSetting already provides tenant-scoped typed JSON configuration values, while OrganizationDomain already provides tenant-scoped domain identity. A new PlatformTenantConfig model is not required for the Phase 5B baseline.',
} as const;

export type TenantConfigSchemaModelBaseline = typeof TENANT_CONFIG_SCHEMA_MODEL_BASELINE;

type DbClient = PrismaService | Prisma.TransactionClient;

type AuthorizedConfigurationActor = {
  actor_user_id: string;
  active_group_ids: string[];
};

type PortalModeResponse = {
  organization_id: string;
  key: typeof PORTAL_MODE_SETTING_KEY;
  mode: PortalMode;
  source: 'default' | 'stored';
  updated_at: string | null;
};

export type TenantConfigurationResponse = {
  organization_id: string;
  storage_model: TenantConfigSchemaModelBaseline;
  portal_mode: PortalModeResponse;
  white_label: {
    mode: typeof DEFAULT_WHITE_LABEL_MODE;
    source: 'default';
    updated_at: null;
  };
  mutation_policy: {
    capability_key: typeof ACCESS_POLICY_MANAGE_CAPABILITY_KEY;
    module_key: typeof ACCESS_MODULE_KEY;
    gatekeeper_required: true;
    audit_required: true;
  };
};

type PortalModeSettingRow = {
  id: string;
  organization_id: string;
  key: string;
  value_json: unknown;
  updated_at: Date;
};

type ConfigurationGatekeeperInput = {
  organization_id: string;
  actor: AuthorizedConfigurationActor;
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

function isPortalMode(value: unknown): value is PortalMode {
  return value === 'simple' || value === 'builder';
}

function isPrismaKnownRequestError(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
  );
}

@Injectable()
export class ConfigurationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly eventOutboxService: EventOutboxService,
    private readonly gatekeeperPreflightService: GatekeeperPreflightService,
  ) {}

  async getPortalMode(organizationId: string, actorUserIdRaw?: string): Promise<PortalModeResponse> {
    await this.requireAccessPolicyManageActor(this.prisma, organizationId, actorUserIdRaw);

    const setting = await this.prisma.organizationSetting.findUnique({
      where: {
        organization_id_key: {
          organization_id: organizationId,
          key: PORTAL_MODE_SETTING_KEY,
        },
      },
      select: {
        id: true,
        organization_id: true,
        key: true,
        value_json: true,
        updated_at: true,
      },
    });

    if (!setting) {
      return {
        organization_id: organizationId,
        key: PORTAL_MODE_SETTING_KEY,
        mode: DEFAULT_PORTAL_MODE,
        source: 'default',
        updated_at: null,
      };
    }

    return this.toPortalModeResponse(setting, 'stored');
  }

  async getTenantConfiguration(
    organizationId: string,
    actorUserIdRaw?: string,
  ): Promise<TenantConfigurationResponse> {
    const portalMode = await this.getPortalMode(organizationId, actorUserIdRaw);

    return {
      organization_id: portalMode.organization_id,
      storage_model: this.getTenantConfigSchemaModelBaseline(),
      portal_mode: portalMode,
      white_label: {
        mode: DEFAULT_WHITE_LABEL_MODE,
        source: 'default',
        updated_at: null,
      },
      mutation_policy: {
        capability_key: ACCESS_POLICY_MANAGE_CAPABILITY_KEY,
        module_key: ACCESS_MODULE_KEY,
        gatekeeper_required: true,
        audit_required: true,
      },
    };
  }

  async updatePortalMode(
    organizationId: string,
    input: UpdatePortalModeInput,
    actorUserIdRaw?: string,
  ): Promise<PortalModeResponse> {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const actor = await this.requireAccessPolicyManageActor(tx, organizationId, actorUserIdRaw);
          await this.requireGatekeeperPreflight({
            organization_id: organizationId,
            actor,
            entity_id: null,
            action_key: 'configuration.portal-mode.updated',
            payload: {
              operation: 'update',
              key: PORTAL_MODE_SETTING_KEY,
            },
          });

          await this.assertOrganizationExistsInDb(tx, organizationId);

          const setting = await tx.organizationSetting.upsert({
            where: {
              organization_id_key: {
                organization_id: organizationId,
                key: PORTAL_MODE_SETTING_KEY,
              },
            },
            create: {
              organization_id: organizationId,
              key: PORTAL_MODE_SETTING_KEY,
              value_json: {
                mode: input.mode,
              },
            },
            update: {
              value_json: {
                mode: input.mode,
              },
            },
            select: {
              id: true,
              organization_id: true,
              key: true,
              value_json: true,
              updated_at: true,
            },
          });

          await this.recordMutationObservability(tx, {
            organization_id: organizationId,
            action_key: 'configuration.portal-mode.updated',
            entity_type: 'organization.setting',
            entity_id: setting.id,
            actor_user_id: actor.actor_user_id,
            metadata: {
              key: PORTAL_MODE_SETTING_KEY,
              mode: input.mode,
            },
          });

          return this.toPortalModeResponse(setting, 'stored');
        },
        {
          isolationLevel: TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error: unknown) {
      this.rethrowKnownConflicts(error);
      throw error;
    }
  }

  getTenantConfigSchemaModelBaseline(): TenantConfigSchemaModelBaseline {
    return TENANT_CONFIG_SCHEMA_MODEL_BASELINE;
  }

  private async requireAccessPolicyManageActor(
    db: DbClient,
    organizationId: string,
    actorUserIdRaw?: string,
  ): Promise<AuthorizedConfigurationActor> {
    const actorUserId = this.normalizeActorUserId(actorUserIdRaw);
    if (!actorUserId) {
      throw new BadRequestException('x-actor-user-id is required for protected configuration operations');
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

    const allowedScopeTypes = await this.getOrganizationConfigurationScopeTypes();
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

  private async getOrganizationConfigurationScopeTypes(): Promise<ReadonlyArray<PermissionScopeType>> {
    const seeds = await loadAccessCoreCapabilitySeedDefinitions();
    const seed = seeds.find((item) => item.capability_key === ACCESS_POLICY_MANAGE_CAPABILITY_KEY);
    if (!seed) {
      throw new ConflictException('access.policy.manage capability is missing from contract seed');
    }

    const scopeTypes = (seed.allowed_scope_types as PermissionScopeType[]).filter((scopeType) =>
      ORGANIZATION_CONFIGURATION_SCOPE_TYPES.has(scopeType),
    );

    if (scopeTypes.length === 0) {
      throw new ConflictException('access.policy.manage has no organization configuration-compatible scopes');
    }

    return scopeTypes;
  }

  private async requireGatekeeperPreflight(input: ConfigurationGatekeeperInput): Promise<void> {
    await this.gatekeeperPreflightService.requireAllow({
      organization_id: input.organization_id,
      actor_user_id: input.actor.actor_user_id,
      active_group_ids: input.actor.active_group_ids,
      capability_key: ACCESS_POLICY_MANAGE_CAPABILITY_KEY,
      module_key: ACCESS_MODULE_KEY,
      entity_type: 'organization.setting',
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

  private toPortalModeResponse(setting: PortalModeSettingRow, source: 'stored'): PortalModeResponse {
    return {
      organization_id: setting.organization_id,
      key: PORTAL_MODE_SETTING_KEY,
      mode: this.parseStoredPortalMode(setting.value_json),
      source,
      updated_at: setting.updated_at.toISOString(),
    };
  }

  private parseStoredPortalMode(value: unknown): PortalMode {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new ConflictException('portal.mode setting is invalid');
    }

    const mode = (value as { mode?: unknown }).mode;
    if (!isPortalMode(mode)) {
      throw new ConflictException('portal.mode setting is invalid');
    }

    return mode;
  }

  private normalizeActorUserId(actorUserIdRaw?: string | null): string | null {
    if (typeof actorUserIdRaw !== 'string') {
      return null;
    }

    const trimmed = actorUserIdRaw.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private rethrowKnownConflicts(error: unknown): never {
    if (isPrismaKnownRequestError(error)) {
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
