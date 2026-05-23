import { createHash } from 'node:crypto';

import { ConflictException, Injectable } from '@nestjs/common';
import { type Capability, type ModuleRegistryEntry, Prisma } from '../../node_modules/.prisma/client';

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

type SeedCoreFoundationResult = {
  module: Pick<ModuleRegistryEntry, 'module_key' | 'display_name' | 'version' | 'status' | 'manifest_hash'>;
  capability: Pick<
    Capability,
    'key' | 'module_key' | 'description' | 'risk_level' | 'gatekeeper_required' | 'approval_chain_required'
  >;
};

type ModuleListResponse = {
  items: Array<Pick<ModuleRegistryEntry, 'module_key' | 'display_name' | 'version' | 'status' | 'manifest_hash'>>;
};

const ACCESS_CORE_MODULE_KEY = 'core.access';
const ACCESS_POLICY_MANAGE_CAPABILITY_KEY = 'access.policy.manage';
const ACCESS_CORE_MODULE_STATUS = 'available';
const PHASE_1_MODULE_REGISTRY_ALLOWLIST = [ACCESS_CORE_MODULE_KEY] as const;

const nativeImport = new Function('specifier', 'return import(specifier)') as (
  specifier: string,
) => Promise<unknown>;

let accessCoreManifestPromise: Promise<AccessCoreModuleManifest> | null = null;
let accessCoreCapabilitySeedsPromise: Promise<AccessCoreCapabilitySeed[]> | null = null;

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

@Injectable()
export class ModuleRegistryService {
  constructor(private readonly prisma: PrismaService) {}

  async seedCoreFoundation(db: DbClient = this.prisma): Promise<SeedCoreFoundationResult> {
    const [manifest, seeds] = await Promise.all([
      loadAccessCoreModuleManifest(),
      loadAccessCoreCapabilitySeedDefinitions(),
    ]);
    assertSeedBoundary(manifest, seeds);

    const capabilitySeed = seeds[0];
    const module = await db.moduleRegistryEntry.upsert({
      where: {
        module_key: manifest.module_key,
      },
      create: {
        module_key: manifest.module_key,
        display_name: manifest.display_name,
        version: manifest.version,
        status: ACCESS_CORE_MODULE_STATUS,
        manifest_hash: sha256Hex(stableJsonStringify(manifest)),
      },
      update: {
        display_name: manifest.display_name,
        version: manifest.version,
        status: ACCESS_CORE_MODULE_STATUS,
        manifest_hash: sha256Hex(stableJsonStringify(manifest)),
      },
      select: {
        module_key: true,
        display_name: true,
        version: true,
        status: true,
        manifest_hash: true,
      },
    });

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

    return {
      module,
      capability,
    };
  }

  async listModules(): Promise<ModuleListResponse> {
    const items = await this.prisma.moduleRegistryEntry.findMany({
      where: {
        module_key: {
          in: [...PHASE_1_MODULE_REGISTRY_ALLOWLIST],
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
