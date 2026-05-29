import { createHash } from 'node:crypto';

import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { type Capability, type ModuleLifecycleEvent, type ModuleRegistryEntry, type Prisma } from '../prisma/prisma-client';

import { PrismaService } from '../prisma/prisma.service';

type DbClient = PrismaService | Prisma.TransactionClient;

type AccessCoreModuleManifest = {
  module_key: string;
  display_name: string;
  version: string;
};

type AccessCoreCapabilitySeed = {
  capability_key: string;
  module_key: string;
  description: string;
  risk_level: Capability['risk_level'];
  gatekeeper_required: boolean;
  approval_chain_required: boolean;
  allowed_scope_types: Array<CapabilitySeedScopeType>;
};

type CapabilityManifestEntry = {
  key: string;
  module_key: string;
  description: string;
  risk_level: Capability['risk_level'];
  gatekeeper_required: boolean;
  approval_chain_required: boolean;
};

type PermissionManifestEntry = {
  key: string;
  allowed_scope_types: Array<CapabilitySeedScopeType>;
};

type GatekeeperHookManifestEntry = {
  key: string;
  capability_key: string;
  required: boolean;
};

export type RuntimeModuleManifest = {
  module_key: string;
  display_name: string;
  version: string;
  capabilities: CapabilityManifestEntry[];
  permissions: PermissionManifestEntry[];
  gatekeeper_hooks: GatekeeperHookManifestEntry[];
};

export type CapabilitySeedScopeType =
  | 'global'
  | 'organization'
  | 'own_unit'
  | 'child_units'
  | 'own_record'
  | 'assigned_records';

type AccessCoreModuleManifestContract = {
  accessCoreModuleManifest: AccessCoreModuleManifest;
};

type AccessCoreCapabilitySeedContract = {
  accessCoreCapabilitySeedDefinitions: AccessCoreCapabilitySeed[];
};

type AccessCoreManifestContract = {
  accessCoreModuleManifest: RuntimeModuleManifest;
};

type EngagementGatewayManifestContract = {
  engagementGatewayLiteModuleManifest: RuntimeModuleManifest;
};

type LeadDeskManifestContract = {
  leadDeskCoreModuleManifest: RuntimeModuleManifest;
};

type SeedCoreFoundationResult = {
  modules: Array<Pick<ModuleRegistryEntry, 'module_key' | 'display_name' | 'version' | 'status' | 'manifest_hash'>>;
  capabilities: Array<Pick<
    Capability,
    'key' | 'module_key' | 'description' | 'risk_level' | 'gatekeeper_required' | 'approval_chain_required'
  >>;
};

type RegisteredCapabilityContribution = Pick<
  Capability,
  'key' | 'module_key' | 'description' | 'risk_level' | 'gatekeeper_required' | 'approval_chain_required'
> & {
  allowed_scope_types: CapabilitySeedScopeType[];
};

export type CapabilityContributionRegistrationResult = {
  module_key: string;
  manifest_hash: string;
  registered_count: number;
  capabilities: RegisteredCapabilityContribution[];
};

type ModuleListResponse = {
  items: Array<Pick<ModuleRegistryEntry, 'module_key' | 'display_name' | 'version' | 'status' | 'manifest_hash'>>;
};

type ModuleLifecycleStatusRequest = {
  module_key: string;
  organization_id: string;
  actor_user_id: string;
};

type ModuleRegistryEntrySnapshot = Pick<
  ModuleRegistryEntry,
  'module_key' | 'display_name' | 'version' | 'status' | 'manifest_hash'
>;

type ModuleLifecycleEventSnapshot = Pick<
  ModuleLifecycleEvent,
  | 'id'
  | 'organization_id'
  | 'module_key'
  | 'from_status'
  | 'to_status'
  | 'action_key'
  | 'actor_user_id'
  | 'evidence_ref'
  | 'reason'
  | 'metadata'
  | 'created_at'
>;

export type ModuleRegistrySchemaBaseline = {
  registry_model: 'ModuleRegistryEntry';
  lifecycle_event_model: 'ModuleLifecycleEvent';
  registry_scope: 'global';
  lifecycle_event_scope: 'global_or_tenant_scoped';
  lifecycle_event_organization_id_required_when_tenant_scoped: true;
  registry_indexes: string[];
  lifecycle_event_indexes: string[];
};

export type ModuleLifecycleStatusResponse = {
  module_key: string;
  display_name: string;
  version: string;
  status: string;
  manifest_hash: string;
  tenant_context: {
    organization_id: string;
    actor_user_id: string;
  };
  capability: {
    required: 'platform.shell.access';
  };
  gatekeeper: {
    read_requires_preflight: false;
    lifecycle_mutation_requires_preflight: true;
  };
  audit: {
    event_type: 'module.registry.lifecycle_status.read';
    evidence_required_for_mutation: true;
  };
  latest_lifecycle_event: null | Pick<
    ModuleLifecycleEventSnapshot,
    'id' | 'organization_id' | 'from_status' | 'to_status' | 'action_key' | 'evidence_ref' | 'reason' | 'created_at'
  >;
};

export type ModuleLifecycleStatus = (typeof MODULE_LIFECYCLE_STATUSES)[number];

export type PersistModuleRegistryEntryInput = {
  module_key: string;
  display_name: string;
  version: string;
  status: ModuleLifecycleStatus;
  manifest_hash: string;
};

export type PersistModuleLifecycleTransitionInput = {
  module_key: string;
  to_status: ModuleLifecycleStatus;
  action_key: string;
  organization_id?: string | null;
  actor_user_id?: string | null;
  evidence_ref?: string | null;
  reason?: string | null;
  metadata?: Record<string, unknown>;
};

export type PersistModuleLifecycleTransitionResult = {
  module: ModuleRegistryEntrySnapshot;
  lifecycle_event: ModuleLifecycleEventSnapshot;
};

export const MODULE_LIFECYCLE_STATUSES = [
  'proposed',
  'certified',
  'installable',
  'installed',
  'enabled',
  'disabled',
  'update_available',
  'updating',
  'rollback_required',
  'retiring',
  'uninstalled',
  'blocked',
] as const;

const ACCESS_CORE_MODULE_KEY = 'core.access';
const ACCESS_POLICY_MANAGE_CAPABILITY_KEY = 'access.policy.manage';
const PLATFORM_SHELL_ACCESS_CAPABILITY_KEY = 'platform.shell.access';
const ACCESS_CORE_MODULE_STATUS = 'available';
const ACCESS_CORE_APPROVED_SEED_CAPABILITY_KEYS = new Set([
  ACCESS_POLICY_MANAGE_CAPABILITY_KEY,
  PLATFORM_SHELL_ACCESS_CAPABILITY_KEY,
]);
const MODULE_LIFECYCLE_STATUS_SET = new Set<string>(MODULE_LIFECYCLE_STATUSES);
const MODULE_KEY_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\.[a-z][a-z0-9]*(?:-[a-z0-9]+)*)+$/;
const MODULE_ACTION_KEY_PATTERN = /^[a-z][a-z0-9]*(?:[_.-][a-z0-9]+)*$/;
const SEMVER_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

const nativeImport = new Function('specifier', 'return import(specifier)') as (
  specifier: string,
) => Promise<unknown>;

let accessCoreManifestPromise: Promise<AccessCoreModuleManifest> | null = null;
let accessCoreCapabilitySeedsPromise: Promise<AccessCoreCapabilitySeed[]> | null = null;
let phase2ManifestScopeMapPromise: Promise<Map<string, ReadonlyArray<CapabilitySeedScopeType>>> | null = null;
let runtimeModuleManifestsPromise: Promise<RuntimeModuleManifest[]> | null = null;
let registeredRuntimeModuleKeysPromise: Promise<ReadonlyArray<string>> | null = null;

function isAccessCoreModuleManifestContract(input: unknown): input is AccessCoreModuleManifestContract {
  if (typeof input !== 'object' || input === null) {
    return false;
  }

  const manifest = (input as { accessCoreModuleManifest?: unknown }).accessCoreModuleManifest;
  if (typeof manifest !== 'object' || manifest === null) {
    return false;
  }

  const maybeManifest = manifest as Partial<AccessCoreModuleManifest>;
  return (
    typeof maybeManifest.module_key === 'string' &&
    typeof maybeManifest.display_name === 'string' &&
    typeof maybeManifest.version === 'string'
  );
}

function isAccessCoreCapabilitySeedContract(input: unknown): input is AccessCoreCapabilitySeedContract {
  if (typeof input !== 'object' || input === null) {
    return false;
  }

  const seeds = (input as { accessCoreCapabilitySeedDefinitions?: unknown }).accessCoreCapabilitySeedDefinitions;
  return Array.isArray(seeds);
}

function isRuntimeModuleManifest(input: unknown): input is RuntimeModuleManifest {
  if (typeof input !== 'object' || input === null) {
    return false;
  }

  const maybe = input as Partial<RuntimeModuleManifest>;
  return (
    typeof maybe.module_key === 'string' &&
    typeof maybe.display_name === 'string' &&
    typeof maybe.version === 'string' &&
    Array.isArray(maybe.capabilities) &&
    Array.isArray(maybe.permissions) &&
    Array.isArray(maybe.gatekeeper_hooks)
  );
}

function assertPhase2ManifestShape(manifest: RuntimeModuleManifest) {
  if (manifest.capabilities.length === 0) {
    throw new ConflictException(`manifest ${manifest.module_key} must declare capabilities`);
  }
}

export async function loadAccessCoreModuleManifest(): Promise<AccessCoreModuleManifest> {
  accessCoreManifestPromise ??= nativeImport('@akti/contracts/access-core-module-manifest').then((module) => {
    if (!isAccessCoreModuleManifestContract(module)) {
      throw new Error('Access Core module manifest contract is unavailable');
    }

    return module.accessCoreModuleManifest;
  });

  return accessCoreManifestPromise;
}

export async function loadAccessCoreCapabilitySeedDefinitions(): Promise<AccessCoreCapabilitySeed[]> {
  accessCoreCapabilitySeedsPromise ??= nativeImport('@akti/contracts/access-core-capability-seed').then((module) => {
    if (!isAccessCoreCapabilitySeedContract(module)) {
      throw new Error('Access Core capability seed contract is unavailable');
    }

    return module.accessCoreCapabilitySeedDefinitions;
  });

  return accessCoreCapabilitySeedsPromise;
}

async function loadRuntimeModuleManifests(): Promise<RuntimeModuleManifest[]> {
  runtimeModuleManifestsPromise ??= Promise.all([
    nativeImport('@akti/contracts/access-core-module-manifest'),
    nativeImport('@akti/contracts/engagement-gateway-lite-module-manifest'),
    nativeImport('@akti/contracts/lead-desk-core-module-manifest'),
  ]).then(([accessCoreModule, gatewayModule, leadDeskModule]) => {
    const accessManifest = (accessCoreModule as AccessCoreManifestContract).accessCoreModuleManifest;
    const gatewayManifest = (gatewayModule as EngagementGatewayManifestContract).engagementGatewayLiteModuleManifest;
    const leadDeskManifest = (leadDeskModule as LeadDeskManifestContract).leadDeskCoreModuleManifest;

    if (!isRuntimeModuleManifest(accessManifest)) {
      throw new Error('Access Core runtime manifest contract is unavailable');
    }
    if (!isRuntimeModuleManifest(gatewayManifest)) {
      throw new Error('Engagement Gateway runtime manifest contract is unavailable');
    }
    if (!isRuntimeModuleManifest(leadDeskManifest)) {
      throw new Error('Lead Desk runtime manifest contract is unavailable');
    }

    const manifests = [accessManifest, gatewayManifest, leadDeskManifest];
    for (const manifest of manifests) {
      assertPhase2ManifestShape(manifest);
    }

    return manifests;
  });

  return runtimeModuleManifestsPromise;
}

export async function loadRegisteredRuntimeModuleKeys(): Promise<ReadonlyArray<string>> {
  registeredRuntimeModuleKeysPromise ??= loadRuntimeModuleManifests().then((manifests) =>
    manifests.map((manifest) => manifest.module_key).sort(),
  );

  return registeredRuntimeModuleKeysPromise;
}

export async function loadPhase2CapabilityScopeMap(): Promise<Map<string, ReadonlyArray<CapabilitySeedScopeType>>> {
  phase2ManifestScopeMapPromise ??= loadRuntimeModuleManifests().then((manifests) => {
    const scopeMap = new Map<string, ReadonlyArray<CapabilitySeedScopeType>>();

    for (const manifest of manifests) {
      const permissionMap = new Map(
        manifest.permissions.map((permission) => [permission.key, permission.allowed_scope_types]),
      );

      for (const capability of manifest.capabilities) {
        const allowedScopes = permissionMap.get(capability.key);
        if (!allowedScopes || allowedScopes.length === 0) {
          throw new ConflictException(`Capability ${capability.key} is missing permission scope mapping`);
        }
        scopeMap.set(capability.key, [...allowedScopes]);
      }
    }

    return scopeMap;
  });

  return phase2ManifestScopeMapPromise;
}

export function stableJsonStringify(input: unknown): string {
  return JSON.stringify(canonicalize(input));
}

function canonicalize(input: unknown): unknown {
  if (Array.isArray(input)) {
    return input.map((item) => canonicalize(item));
  }

  if (typeof input === 'object' && input !== null) {
    return Object.fromEntries(
      Object.keys(input as Record<string, unknown>)
        .sort()
        .map((key) => [key, canonicalize((input as Record<string, unknown>)[key])]),
    );
  }

  return input;
}

function sha256Hex(input: string) {
  return createHash('sha256').update(input).digest('hex');
}

export function assertAccessCoreSeedBoundary(
  manifest: AccessCoreModuleManifest,
  seeds: AccessCoreCapabilitySeed[],
) {
  if (manifest.module_key !== ACCESS_CORE_MODULE_KEY) {
    throw new ConflictException('Access Core module manifest boundary mismatch');
  }

  if (seeds.length !== ACCESS_CORE_APPROVED_SEED_CAPABILITY_KEYS.size) {
    throw new ConflictException('Access Core capability seed boundary mismatch');
  }

  const seenSeedKeys = new Set<string>();
  for (const seed of seeds) {
    if (
      typeof seed.capability_key !== 'string' ||
      typeof seed.module_key !== 'string' ||
      seed.capability_key.length === 0 ||
      seed.module_key.length === 0
    ) {
      throw new ConflictException('Access Core capability seed boundary mismatch');
    }

    if (seenSeedKeys.has(seed.capability_key)) {
      throw new ConflictException('Access Core capability seed boundary mismatch');
    }

    if (!ACCESS_CORE_APPROVED_SEED_CAPABILITY_KEYS.has(seed.capability_key)) {
      throw new ConflictException('Access Core capability seed boundary mismatch');
    }

    if (seed.module_key !== ACCESS_CORE_MODULE_KEY) {
      throw new ConflictException('Access Core capability seed module mismatch');
    }

    seenSeedKeys.add(seed.capability_key);
  }

  for (const capabilityKey of ACCESS_CORE_APPROVED_SEED_CAPABILITY_KEYS) {
    if (!seenSeedKeys.has(capabilityKey)) {
      throw new ConflictException('Access Core capability seed boundary mismatch');
    }
  }
}

function assertCapabilityContribution(
  manifest: RuntimeModuleManifest,
  capability: CapabilityManifestEntry,
  permissionScopeMap: Map<string, ReadonlyArray<CapabilitySeedScopeType>>,
  gatekeeperHookCapabilityKeys: Set<string>,
) {
  if (capability.module_key !== manifest.module_key) {
    throw new ConflictException(`Capability ${capability.key} module_key must match manifest module_key`);
  }

  const allowedScopeTypes = permissionScopeMap.get(capability.key);
  if (!allowedScopeTypes || allowedScopeTypes.length === 0) {
    throw new ConflictException(`Capability ${capability.key} requires a permission scope mapping`);
  }

  if (['high', 'critical'].includes(capability.risk_level) && !capability.gatekeeper_required) {
    throw new ConflictException(`High-risk capability ${capability.key} requires Gatekeeper`);
  }

  if (capability.gatekeeper_required && !gatekeeperHookCapabilityKeys.has(capability.key)) {
    throw new ConflictException(`Gatekeeper capability ${capability.key} requires a Gatekeeper hook`);
  }
}

@Injectable()
export class ModuleRegistryService {
  constructor(private readonly prisma: PrismaService) {}

  getSchemaBaseline(): ModuleRegistrySchemaBaseline {
    return {
      registry_model: 'ModuleRegistryEntry',
      lifecycle_event_model: 'ModuleLifecycleEvent',
      registry_scope: 'global',
      lifecycle_event_scope: 'global_or_tenant_scoped',
      lifecycle_event_organization_id_required_when_tenant_scoped: true,
      registry_indexes: ['module_key', 'status', 'version', 'status+version'],
      lifecycle_event_indexes: [
        'module_key+to_status+created_at',
        'organization_id+module_key+created_at',
        'organization_id+actor_user_id+created_at',
        'action_key+created_at',
      ],
    };
  }

  async seedCoreFoundation(db: DbClient = this.prisma): Promise<SeedCoreFoundationResult> {
    const [manifest, seeds, manifests] = await Promise.all([
      loadAccessCoreModuleManifest(),
      loadAccessCoreCapabilitySeedDefinitions(),
      loadRuntimeModuleManifests(),
    ]);
    assertAccessCoreSeedBoundary(manifest, seeds);

    const modules: SeedCoreFoundationResult['modules'] = [];
    for (const runtimeManifest of manifests) {
      const module = await db.moduleRegistryEntry.upsert({
        where: {
          module_key: runtimeManifest.module_key,
        },
        create: {
          module_key: runtimeManifest.module_key,
          display_name: runtimeManifest.display_name,
          version: runtimeManifest.version,
          status: ACCESS_CORE_MODULE_STATUS,
          manifest_hash: sha256Hex(stableJsonStringify(runtimeManifest)),
        },
        update: {
          display_name: runtimeManifest.display_name,
          version: runtimeManifest.version,
          status: ACCESS_CORE_MODULE_STATUS,
          manifest_hash: sha256Hex(stableJsonStringify(runtimeManifest)),
        },
        select: {
          module_key: true,
          display_name: true,
          version: true,
          status: true,
          manifest_hash: true,
        },
      });
      modules.push(module);
    }

    const capabilityRegistrations = [];
    for (const runtimeManifest of manifests) {
      capabilityRegistrations.push(await this.registerCapabilityContributions(runtimeManifest, db));
    }

    const capabilities: SeedCoreFoundationResult['capabilities'] = [];
    for (const capabilityRegistration of capabilityRegistrations) {
      capabilities.push(
        ...capabilityRegistration.capabilities.map(
          ({
            key,
            module_key,
            description,
            risk_level,
            gatekeeper_required,
            approval_chain_required,
          }) => ({
            key,
            module_key,
            description,
            risk_level,
            gatekeeper_required,
            approval_chain_required,
          }),
        ),
      );
    }

    return {
      modules,
      capabilities,
    };
  }

  async registerCapabilityContributions(
    manifest: RuntimeModuleManifest,
    db: DbClient = this.prisma,
  ): Promise<CapabilityContributionRegistrationResult> {
    assertPhase2ManifestShape(manifest);
    const permissionScopeMap = new Map(
      manifest.permissions.map((permission) => [permission.key, [...permission.allowed_scope_types]]),
    );
    const gatekeeperHookCapabilityKeys = new Set(
      manifest.gatekeeper_hooks.map((hook) => hook.capability_key),
    );

    const capabilities: RegisteredCapabilityContribution[] = [];
    for (const capability of manifest.capabilities) {
      assertCapabilityContribution(manifest, capability, permissionScopeMap, gatekeeperHookCapabilityKeys);
      const allowedScopeTypes = permissionScopeMap.get(capability.key) ?? [];
      const persistedCapability = await db.capability.upsert({
        where: {
          key: capability.key,
        },
        create: {
          key: capability.key,
          module_key: capability.module_key,
          description: capability.description,
          risk_level: capability.risk_level,
          gatekeeper_required: capability.gatekeeper_required,
          approval_chain_required: capability.approval_chain_required,
        },
        update: {
          module_key: capability.module_key,
          description: capability.description,
          risk_level: capability.risk_level,
          gatekeeper_required: capability.gatekeeper_required,
          approval_chain_required: capability.approval_chain_required,
        },
        select: {
          key: true,
          module_key: true,
          description: true,
          risk_level: true,
          gatekeeper_required: true,
          approval_chain_required: true,
        },
      });
      capabilities.push({
        ...persistedCapability,
        allowed_scope_types: allowedScopeTypes,
      });
    }

    return {
      module_key: manifest.module_key,
      manifest_hash: sha256Hex(stableJsonStringify(manifest)),
      registered_count: capabilities.length,
      capabilities,
    };
  }

  async listModules(): Promise<ModuleListResponse> {
    const registeredModuleKeys = await loadRegisteredRuntimeModuleKeys();
    const items = await this.prisma.moduleRegistryEntry.findMany({
      where: {
        module_key: {
          in: [...registeredModuleKeys],
        },
      },
      orderBy: [{ module_key: 'asc' }],
      select: {
        module_key: true,
        display_name: true,
        version: true,
        status: true,
        manifest_hash: true,
      },
    });

    return { items };
  }

  async getModuleLifecycleStatus(
    input: ModuleLifecycleStatusRequest,
  ): Promise<ModuleLifecycleStatusResponse> {
    assertModuleKey(input.module_key);
    assertNonEmpty(input.organization_id, 'Module lifecycle status requires organization_id');
    assertNonEmpty(input.actor_user_id, 'Module lifecycle status requires actor_user_id');

    const module = await this.prisma.moduleRegistryEntry.findUnique({
      where: {
        module_key: input.module_key,
      },
      select: moduleRegistryEntrySnapshotSelect,
    });
    if (!module) {
      throw new NotFoundException('Module lifecycle status requires a registered module');
    }

    const [latestLifecycleEvent] = await this.prisma.moduleLifecycleEvent.findMany({
      where: {
        module_key: input.module_key,
        OR: [
          {
            organization_id: input.organization_id,
          },
          {
            organization_id: null,
          },
        ],
      },
      orderBy: [{ created_at: 'desc' }],
      take: 1,
      select: moduleLifecycleEventStatusSelect,
    });

    return {
      ...module,
      tenant_context: {
        organization_id: input.organization_id,
        actor_user_id: input.actor_user_id,
      },
      capability: {
        required: PLATFORM_SHELL_ACCESS_CAPABILITY_KEY,
      },
      gatekeeper: {
        read_requires_preflight: false,
        lifecycle_mutation_requires_preflight: true,
      },
      audit: {
        event_type: 'module.registry.lifecycle_status.read',
        evidence_required_for_mutation: true,
      },
      latest_lifecycle_event: latestLifecycleEvent ?? null,
    };
  }

  async persistModuleRegistryEntry(
    input: PersistModuleRegistryEntryInput,
    db: DbClient = this.prisma,
  ): Promise<ModuleRegistryEntrySnapshot> {
    assertModuleRegistryEntryInput(input);

    return db.moduleRegistryEntry.upsert({
      where: {
        module_key: input.module_key,
      },
      create: {
        module_key: input.module_key,
        display_name: input.display_name,
        version: input.version,
        status: input.status,
        manifest_hash: input.manifest_hash,
      },
      update: {
        display_name: input.display_name,
        version: input.version,
        status: input.status,
        manifest_hash: input.manifest_hash,
      },
      select: moduleRegistryEntrySnapshotSelect,
    });
  }

  async persistModuleLifecycleTransition(
    input: PersistModuleLifecycleTransitionInput,
    db: DbClient = this.prisma,
  ): Promise<PersistModuleLifecycleTransitionResult> {
    assertModuleLifecycleTransitionInput(input);

    const existingModule = await db.moduleRegistryEntry.findUnique({
      where: {
        module_key: input.module_key,
      },
      select: moduleRegistryEntrySnapshotSelect,
    });
    if (!existingModule) {
      throw new ConflictException('Module lifecycle transition requires an existing registry entry');
    }

    const module = await db.moduleRegistryEntry.update({
      where: {
        module_key: input.module_key,
      },
      data: {
        status: input.to_status,
      },
      select: moduleRegistryEntrySnapshotSelect,
    });

    const lifecycleEvent = await db.moduleLifecycleEvent.create({
      data: {
        organization_id: input.organization_id ?? null,
        module_key: input.module_key,
        from_status: existingModule.status,
        to_status: input.to_status,
        action_key: input.action_key,
        actor_user_id: input.actor_user_id ?? null,
        evidence_ref: input.evidence_ref ?? null,
        reason: input.reason ?? null,
        metadata: normalizeLifecycleMetadata(input.metadata),
      },
      select: moduleLifecycleEventSnapshotSelect,
    });

    return {
      module,
      lifecycle_event: lifecycleEvent,
    };
  }
}

const moduleRegistryEntrySnapshotSelect = {
  module_key: true,
  display_name: true,
  version: true,
  status: true,
  manifest_hash: true,
} satisfies Prisma.ModuleRegistryEntrySelect;

const moduleLifecycleEventSnapshotSelect = {
  id: true,
  organization_id: true,
  module_key: true,
  from_status: true,
  to_status: true,
  action_key: true,
  actor_user_id: true,
  evidence_ref: true,
  reason: true,
  metadata: true,
  created_at: true,
} satisfies Prisma.ModuleLifecycleEventSelect;

const moduleLifecycleEventStatusSelect = {
  id: true,
  organization_id: true,
  from_status: true,
  to_status: true,
  action_key: true,
  evidence_ref: true,
  reason: true,
  created_at: true,
} satisfies Prisma.ModuleLifecycleEventSelect;

function assertModuleRegistryEntryInput(input: PersistModuleRegistryEntryInput) {
  assertModuleKey(input.module_key);
  assertNonEmpty(input.display_name, 'Module registry entry requires display_name');
  if (!SEMVER_PATTERN.test(input.version)) {
    throw new BadRequestException('Module registry entry requires a semver version');
  }
  assertLifecycleStatus(input.status);
  if (!/^[a-f0-9]{64}$/.test(input.manifest_hash)) {
    throw new BadRequestException('Module registry entry requires a sha256 manifest_hash');
  }
}

function assertModuleLifecycleTransitionInput(input: PersistModuleLifecycleTransitionInput) {
  assertModuleKey(input.module_key);
  assertLifecycleStatus(input.to_status);
  if (!MODULE_ACTION_KEY_PATTERN.test(input.action_key)) {
    throw new BadRequestException('Module lifecycle transition requires an action_key');
  }
}

function assertModuleKey(moduleKey: string) {
  if (!MODULE_KEY_PATTERN.test(moduleKey)) {
    throw new BadRequestException('Module registry persistence requires a valid module_key');
  }
}

function assertLifecycleStatus(status: string) {
  if (!MODULE_LIFECYCLE_STATUS_SET.has(status)) {
    throw new BadRequestException('Module registry persistence requires an approved lifecycle status');
  }
}

function assertNonEmpty(value: string, message: string) {
  if (value.trim().length === 0) {
    throw new BadRequestException(message);
  }
}

function normalizeLifecycleMetadata(input: Record<string, unknown> | undefined): Prisma.InputJsonValue {
  return (input ?? {}) as Prisma.InputJsonValue;
}
