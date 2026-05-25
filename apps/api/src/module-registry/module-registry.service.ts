import { createHash } from 'node:crypto';

import { ConflictException, Injectable } from '@nestjs/common';
import { type Capability, type ModuleRegistryEntry, type Prisma } from '../prisma/prisma-client';

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

type RuntimeModuleManifest = {
  module_key: string;
  display_name: string;
  version: string;
  capabilities: CapabilityManifestEntry[];
  permissions: PermissionManifestEntry[];
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

type ModuleListResponse = {
  items: Array<Pick<ModuleRegistryEntry, 'module_key' | 'display_name' | 'version' | 'status' | 'manifest_hash'>>;
};

const ACCESS_CORE_MODULE_KEY = 'core.access';
const ACCESS_POLICY_MANAGE_CAPABILITY_KEY = 'access.policy.manage';
const ACCESS_CORE_MODULE_STATUS = 'available';
const PHASE_2_MODULE_REGISTRY_ALLOWLIST = [
  ACCESS_CORE_MODULE_KEY,
  'engagement.gateway',
  'lead.desk',
] as const;

const nativeImport = new Function('specifier', 'return import(specifier)') as (
  specifier: string,
) => Promise<unknown>;

let accessCoreManifestPromise: Promise<AccessCoreModuleManifest> | null = null;
let accessCoreCapabilitySeedsPromise: Promise<AccessCoreCapabilitySeed[]> | null = null;
let phase2ManifestScopeMapPromise: Promise<Map<string, ReadonlyArray<CapabilitySeedScopeType>>> | null = null;
let phase2RuntimeManifestsPromise: Promise<RuntimeModuleManifest[]> | null = null;

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
    Array.isArray(maybe.permissions)
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

async function loadPhase2RuntimeManifests(): Promise<RuntimeModuleManifest[]> {
  phase2RuntimeManifestsPromise ??= Promise.all([
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

  return phase2RuntimeManifestsPromise;
}

export async function loadPhase2CapabilityScopeMap(): Promise<Map<string, ReadonlyArray<CapabilitySeedScopeType>>> {
  phase2ManifestScopeMapPromise ??= loadPhase2RuntimeManifests().then((manifests) => {
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

function assertSeedBoundary(manifest: AccessCoreModuleManifest, seeds: AccessCoreCapabilitySeed[]) {
  if (manifest.module_key !== ACCESS_CORE_MODULE_KEY) {
    throw new ConflictException('Access Core module manifest boundary mismatch');
  }

  if (seeds.length !== 1 || seeds[0]?.capability_key !== ACCESS_POLICY_MANAGE_CAPABILITY_KEY) {
    throw new ConflictException('Access Core capability seed boundary mismatch');
  }

  if (seeds[0].module_key !== ACCESS_CORE_MODULE_KEY) {
    throw new ConflictException('Access Core capability seed module mismatch');
  }
}

function toCapabilitySeedFromManifest(capability: CapabilityManifestEntry): AccessCoreCapabilitySeed {
  return {
    capability_key: capability.key,
    module_key: capability.module_key,
    description: capability.description,
    risk_level: capability.risk_level,
    gatekeeper_required: capability.gatekeeper_required,
    approval_chain_required: capability.approval_chain_required,
    allowed_scope_types: ['organization'],
  };
}

@Injectable()
export class ModuleRegistryService {
  constructor(private readonly prisma: PrismaService) {}

  async seedCoreFoundation(db: DbClient = this.prisma): Promise<SeedCoreFoundationResult> {
    const [manifest, seeds, manifests] = await Promise.all([
      loadAccessCoreModuleManifest(),
      loadAccessCoreCapabilitySeedDefinitions(),
      loadPhase2RuntimeManifests(),
    ]);
    assertSeedBoundary(manifest, seeds);

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

    const capabilitySeeds = manifests.flatMap((item) => item.capabilities.map(toCapabilitySeedFromManifest));
    const capabilities: SeedCoreFoundationResult['capabilities'] = [];
    for (const capabilitySeed of capabilitySeeds) {
      const capability = await db.capability.upsert({
        where: {
          key: capabilitySeed.capability_key,
        },
        create: {
          key: capabilitySeed.capability_key,
          module_key: capabilitySeed.module_key,
          description: capabilitySeed.description,
          risk_level: capabilitySeed.risk_level,
          gatekeeper_required: capabilitySeed.gatekeeper_required,
          approval_chain_required: capabilitySeed.approval_chain_required,
        },
        update: {
          module_key: capabilitySeed.module_key,
          description: capabilitySeed.description,
          risk_level: capabilitySeed.risk_level,
          gatekeeper_required: capabilitySeed.gatekeeper_required,
          approval_chain_required: capabilitySeed.approval_chain_required,
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
      capabilities.push(capability);
    }

    return {
      modules,
      capabilities,
    };
  }

  async listModules(): Promise<ModuleListResponse> {
    const items = await this.prisma.moduleRegistryEntry.findMany({
      where: {
        module_key: {
          in: [...PHASE_2_MODULE_REGISTRY_ALLOWLIST],
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
}
