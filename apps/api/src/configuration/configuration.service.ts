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
const BRANDING_ASSETS_SETTING_KEY = 'white_label.branding_assets';
const DEFAULT_PORTAL_MODE: PortalMode = 'simple';
const DEFAULT_WHITE_LABEL_MODE = 'none';
const ORGANIZATION_CONFIGURATION_SCOPE_TYPES = new Set<PermissionScopeType>(['global', 'organization']);
const BRANDING_ASSET_URL_MAX_LENGTH = 2048;
const DOMAIN_IDENTITY_MAX_LENGTH = 253;
const HOSTNAME_DOMAIN_PATTERN =
  /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
const BRANDING_ASSET_KEYS = [
  'logo_url',
  'icon_url',
  'favicon_url',
  'email_logo_url',
] as const;

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

type BrandingAssetKey = (typeof BRANDING_ASSET_KEYS)[number];

type BrandingAssetMap = Record<BrandingAssetKey, string | null>;

export type BrandingAssetsResponse = {
  organization_id: string;
  key: typeof BRANDING_ASSETS_SETTING_KEY;
  source: 'default' | 'stored';
  assets: BrandingAssetMap;
  canonical_identity_preserved: true;
  updated_at: string | null;
};

export type DomainSenderIdentityStatus = 'verified' | 'unverified' | 'not_registered';

export type DomainSenderIdentityBoundaryResponse = {
  organization_id: string;
  input: string;
  normalized_domain: string;
  status: DomainSenderIdentityStatus;
  allowed_for_sender: boolean;
  registered: boolean;
  verified_at: string | null;
  is_primary: boolean;
  branding_domain_changes_require_gatekeeper: true;
  canonical_identity_preserved: true;
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

type BrandingAssetsSettingRow = {
  id: string;
  organization_id: string;
  key: string;
  value_json: unknown;
  updated_at: Date;
};

type OrganizationDomainIdentityRow = {
  organization_id: string;
  domain: string;
  is_primary: boolean;
  verified_at: Date | null;
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

  async resolveBrandingAssets(
    organizationId: string,
    actorUserIdRaw?: string,
  ): Promise<BrandingAssetsResponse> {
    await this.requireAccessPolicyManageActor(this.prisma, organizationId, actorUserIdRaw);

    const setting = await this.prisma.organizationSetting.findUnique({
      where: {
        organization_id_key: {
          organization_id: organizationId,
          key: BRANDING_ASSETS_SETTING_KEY,
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
      return this.defaultBrandingAssetsResponse(organizationId);
    }

    return this.toBrandingAssetsResponse(setting);
  }

  async resolveDomainSenderIdentityBoundary(
    organizationId: string,
    senderIdentityRaw: string,
    actorUserIdRaw?: string,
  ): Promise<DomainSenderIdentityBoundaryResponse> {
    const normalizedDomain = this.normalizeSenderIdentityDomain(senderIdentityRaw);
    await this.requireAccessPolicyManageActor(this.prisma, organizationId, actorUserIdRaw);

    const domain = await this.prisma.organizationDomain.findFirst({
      where: {
        organization_id: organizationId,
        domain: normalizedDomain,
      },
      select: {
        organization_id: true,
        domain: true,
        is_primary: true,
        verified_at: true,
      },
    });

    if (!domain) {
      return this.toDomainSenderIdentityBoundaryResponse(organizationId, senderIdentityRaw, normalizedDomain, null);
    }

    return this.toDomainSenderIdentityBoundaryResponse(organizationId, senderIdentityRaw, normalizedDomain, domain);
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

  private defaultBrandingAssetsResponse(organizationId: string): BrandingAssetsResponse {
    return {
      organization_id: organizationId,
      key: BRANDING_ASSETS_SETTING_KEY,
      source: 'default',
      assets: this.defaultBrandingAssetMap(),
      canonical_identity_preserved: true,
      updated_at: null,
    };
  }

  private toBrandingAssetsResponse(setting: BrandingAssetsSettingRow): BrandingAssetsResponse {
    return {
      organization_id: setting.organization_id,
      key: BRANDING_ASSETS_SETTING_KEY,
      source: 'stored',
      assets: this.parseStoredBrandingAssets(setting.value_json),
      canonical_identity_preserved: true,
      updated_at: setting.updated_at.toISOString(),
    };
  }

  private defaultBrandingAssetMap(): BrandingAssetMap {
    return {
      logo_url: null,
      icon_url: null,
      favicon_url: null,
      email_logo_url: null,
    };
  }

  private parseStoredBrandingAssets(value: unknown): BrandingAssetMap {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new ConflictException('white_label.branding_assets setting is invalid');
    }

    const body = value as Record<string, unknown>;
    const assets = this.defaultBrandingAssetMap();

    for (const key of BRANDING_ASSET_KEYS) {
      assets[key] = this.parseBrandingAssetUrl(body[key], key);
    }

    return assets;
  }

  private parseBrandingAssetUrl(value: unknown, key: BrandingAssetKey): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    if (typeof value !== 'string') {
      throw new ConflictException(`${key} branding asset must be a path or HTTPS URL`);
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }

    if (trimmed.length > BRANDING_ASSET_URL_MAX_LENGTH) {
      throw new ConflictException(`${key} branding asset URL is too long`);
    }

    if (trimmed.startsWith('/') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    throw new ConflictException(`${key} branding asset must be a path or HTTPS URL`);
  }

  private toDomainSenderIdentityBoundaryResponse(
    organizationId: string,
    senderIdentityRaw: string,
    normalizedDomain: string,
    domain: OrganizationDomainIdentityRow | null,
  ): DomainSenderIdentityBoundaryResponse {
    const verifiedAt = domain?.verified_at ?? null;
    const status: DomainSenderIdentityStatus = !domain
      ? 'not_registered'
      : verifiedAt
        ? 'verified'
        : 'unverified';

    return {
      organization_id: organizationId,
      input: senderIdentityRaw.trim(),
      normalized_domain: normalizedDomain,
      status,
      allowed_for_sender: status === 'verified',
      registered: domain !== null,
      verified_at: verifiedAt ? verifiedAt.toISOString() : null,
      is_primary: domain?.is_primary ?? false,
      branding_domain_changes_require_gatekeeper: true,
      canonical_identity_preserved: true,
    };
  }

  private normalizeSenderIdentityDomain(value: unknown): string {
    if (typeof value !== 'string') {
      throw new BadRequestException('sender identity must be a domain or email address');
    }

    const trimmed = value.trim().toLowerCase();
    if (trimmed.length === 0 || trimmed.length > DOMAIN_IDENTITY_MAX_LENGTH) {
      throw new BadRequestException('sender identity must be a valid domain or email address');
    }

    const atIndex = trimmed.lastIndexOf('@');
    const domain = atIndex >= 0 ? trimmed.slice(atIndex + 1) : trimmed;
    if (domain.length === 0 || !HOSTNAME_DOMAIN_PATTERN.test(domain)) {
      throw new BadRequestException('sender identity must be a valid domain or email address');
    }

    return domain;
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
