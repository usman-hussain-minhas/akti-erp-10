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

type CapabilityConsumptionManifestEntry = {
  capability_key: string;
  provider_module_key: string;
  required: boolean;
  min_version?: string;
};

type MenuManifestEntry = {
  key: string;
  label: string;
  path: string;
  capability_key?: string;
  order: number;
};

type SettingManifestEntry = {
  key: string;
  label: string;
  description: string;
  value_type: 'string' | 'number' | 'boolean' | 'json';
  required: boolean;
  default_value?: unknown;
};

type HealthCheckManifestEntry = {
  key: string;
  description: string;
  endpoint?: string;
  critical: boolean;
  timeout_ms: number;
};

type DegradedModeManifestEntry = {
  mode: 'readonly' | 'limited' | 'disabled';
  description: string;
  disabled_capabilities: string[];
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
  capabilities_consumed?: CapabilityConsumptionManifestEntry[];
  permissions: PermissionManifestEntry[];
  menu_entries?: MenuManifestEntry[];
  settings?: SettingManifestEntry[];
  health_checks?: HealthCheckManifestEntry[];
  degraded_mode_behavior?: DegradedModeManifestEntry;
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

export type RegisteredMenuContribution = {
  key: string;
  label: string;
  path: string;
  module_key: string;
  capability_key: string | null;
  order: number;
};

export type MenuContributionRegistrationResult = {
  module_key: string;
  registered_count: number;
  menu_entries: RegisteredMenuContribution[];
};

export type ScreenContributionContract = {
  screen_key: string;
  module_key: string;
  title: string;
  route: string;
  screen_type: 'private_portal' | 'public_site' | 'admin_console' | 'embedded_widget';
  status: 'planned' | 'active' | 'deprecated' | 'disabled';
  required_capabilities: string[];
  optional_capabilities: string[];
  api_routes: Array<{
    key: string;
    path: string;
    capability_key: string | null;
  }>;
};

export type ScreenContributionRegistrationInput = {
  manifest: RuntimeModuleManifest;
  screens: ScreenContributionContract[];
};

export type RegisteredScreenContribution = {
  screen_key: string;
  module_key: string;
  title: string;
  route: string;
  status: ScreenContributionContract['status'];
  screen_type: ScreenContributionContract['screen_type'];
  required_capabilities: string[];
  optional_capabilities: string[];
  api_route_keys: string[];
};

export type ScreenContributionRegistrationResult = {
  module_key: string;
  registered_count: number;
  screens: RegisteredScreenContribution[];
};

export type CommandContributionContract = {
  id: string;
  label: string;
  description?: string;
  route?: string;
  action?: string;
  group: string;
  required_capability?: string;
  module_id?: string;
  keywords?: string[];
  visibility_condition?: 'hidden' | 'visible' | 'admin-only' | 'context-specific';
  disabled_reason?: string;
};

export type CommandContributionRegistrationInput = {
  manifest: RuntimeModuleManifest;
  commands: CommandContributionContract[];
};

export type RegisteredCommandContribution = {
  id: string;
  label: string;
  module_key: string;
  group: string;
  route: string | null;
  action: string | null;
  required_capability: string | null;
  keywords: string[];
  visibility_condition: CommandContributionContract['visibility_condition'] | null;
  disabled_reason: string | null;
};

export type CommandContributionRegistrationResult = {
  module_key: string;
  registered_count: number;
  commands: RegisteredCommandContribution[];
};

export type RegisteredSettingContribution = {
  key: string;
  label: string;
  module_key: string;
  description: string;
  value_type: SettingManifestEntry['value_type'];
  required: boolean;
  has_default_value: boolean;
};

export type SettingContributionRegistrationResult = {
  module_key: string;
  registered_count: number;
  settings: RegisteredSettingContribution[];
};

export type HealthDegradedStateRegistrationResult = {
  module_key: string;
  health_checks: Array<{
    key: string;
    description: string;
    endpoint: string | null;
    critical: boolean;
    timeout_ms: number;
  }>;
  degraded_mode_behavior: {
    mode: DegradedModeManifestEntry['mode'];
    description: string;
    disabled_capabilities: string[];
  };
};

type ModuleListResponse = {
  items: Array<Pick<ModuleRegistryEntry, 'module_key' | 'display_name' | 'version' | 'status' | 'manifest_hash'>>;
};

type ModuleRegistryFrontendRequest = {
  organization_id: string;
  actor_user_id: string;
};

export type ModuleRegistryFrontendResponse = {
  items: Array<Pick<ModuleRegistryEntry, 'module_key' | 'display_name' | 'version' | 'status'>>;
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
    event_type: 'module.registry.frontend.read';
    outbox_event_required: false;
  };
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
const PLATFORM_CRM_ACCESS_CAPABILITY_KEY = 'platform.crm.access';
const PLATFORM_MODULES_VIEW_CAPABILITY_KEY = 'platform.modules.view';
const ACCESS_CORE_MODULE_STATUS = 'available';
const ACCESS_CORE_APPROVED_SEED_CAPABILITY_KEYS = new Set([
  ACCESS_POLICY_MANAGE_CAPABILITY_KEY,
  PLATFORM_CRM_ACCESS_CAPABILITY_KEY,
  PLATFORM_MODULES_VIEW_CAPABILITY_KEY,
  PLATFORM_SHELL_ACCESS_CAPABILITY_KEY,
]);
const MODULE_LIFECYCLE_STATUS_SET = new Set<string>(MODULE_LIFECYCLE_STATUSES);
const MANIFEST_KEY_PATTERN = /^[a-z][a-z0-9]*(?:[_.-][a-z0-9]+)*$/;
const SCREEN_KEY_PATTERN = /^[a-z][a-z0-9_-]*(?:\.[a-z][a-z0-9_-]*)+$/;
const MODULE_KEY_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\.[a-z][a-z0-9]*(?:-[a-z0-9]+)*)+$/;
const MODULE_ACTION_KEY_PATTERN = /^[a-z][a-z0-9]*(?:[_.-][a-z0-9]+)*$/;
const SEMVER_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const SECRET_SETTING_PATTERN = /(secret|password|credential|token|api[_-]?key)/i;

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
    (maybe.capabilities_consumed === undefined || Array.isArray(maybe.capabilities_consumed)) &&
    Array.isArray(maybe.permissions) &&
    (maybe.menu_entries === undefined || Array.isArray(maybe.menu_entries)) &&
    (maybe.settings === undefined || Array.isArray(maybe.settings)) &&
    (maybe.health_checks === undefined || Array.isArray(maybe.health_checks)) &&
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

function assertMenuContribution(
  manifest: RuntimeModuleManifest,
  entry: MenuManifestEntry,
  localCapabilityKeys: Set<string>,
  consumedCapabilityKeys: Set<string>,
) {
  if (!MANIFEST_KEY_PATTERN.test(entry.key)) {
    throw new ConflictException(`Menu entry ${entry.key} must use manifest key syntax`);
  }

  if (entry.label.trim().length === 0) {
    throw new ConflictException(`Menu entry ${entry.key} requires a label`);
  }

  if (!/^\/[A-Za-z0-9/_:.-]*$/.test(entry.path)) {
    throw new ConflictException(`Menu entry ${entry.key} requires an absolute safe path`);
  }

  if (!Number.isInteger(entry.order) || entry.order < 0) {
    throw new ConflictException(`Menu entry ${entry.key} requires a non-negative integer order`);
  }

  if (
    entry.capability_key !== undefined &&
    !localCapabilityKeys.has(entry.capability_key) &&
    !consumedCapabilityKeys.has(entry.capability_key)
  ) {
    throw new ConflictException(`Menu entry ${entry.key} capability_key must reference local or consumed capability`);
  }

  if (entry.path.startsWith('/lead-desk') && manifest.module_key !== 'lead.desk') {
    throw new ConflictException(`Menu entry ${entry.key} cannot register business-module navigation outside its owner`);
  }
}

function assertScreenContribution(
  manifest: RuntimeModuleManifest,
  screen: ScreenContributionContract,
  localCapabilityKeys: Set<string>,
  consumedCapabilityKeys: Set<string>,
) {
  if (!SCREEN_KEY_PATTERN.test(screen.screen_key)) {
    throw new ConflictException(`Screen ${screen.screen_key} must use screen key syntax`);
  }

  if (screen.module_key !== manifest.module_key) {
    throw new ConflictException(`Screen ${screen.screen_key} module_key must match manifest module_key`);
  }

  if (screen.title.trim().length === 0) {
    throw new ConflictException(`Screen ${screen.screen_key} requires a title`);
  }

  if (!/^\/[A-Za-z0-9/_:.-]*$/.test(screen.route)) {
    throw new ConflictException(`Screen ${screen.screen_key} requires an absolute safe route`);
  }

  if (screen.screen_type === 'private_portal' && screen.required_capabilities.length === 0) {
    throw new ConflictException(`Private portal screen ${screen.screen_key} requires a required capability`);
  }

  for (const capabilityKey of [...screen.required_capabilities, ...screen.optional_capabilities]) {
    if (!localCapabilityKeys.has(capabilityKey) && !consumedCapabilityKeys.has(capabilityKey)) {
      throw new ConflictException(`Screen ${screen.screen_key} capability ${capabilityKey} is not declared`);
    }
  }

  const apiRouteKeys = new Set<string>();
  for (const route of screen.api_routes) {
    if (!MANIFEST_KEY_PATTERN.test(route.key)) {
      throw new ConflictException(`Screen ${screen.screen_key} API route key ${route.key} is invalid`);
    }
    if (apiRouteKeys.has(route.key)) {
      throw new ConflictException(`Screen ${screen.screen_key} API route key ${route.key} must be unique`);
    }
    apiRouteKeys.add(route.key);
    if (!/^\/[A-Za-z0-9/_:.-]*$/.test(route.path)) {
      throw new ConflictException(`Screen ${screen.screen_key} API route ${route.key} requires an absolute safe path`);
    }
    if (
      route.capability_key !== null &&
      !localCapabilityKeys.has(route.capability_key) &&
      !consumedCapabilityKeys.has(route.capability_key)
    ) {
      throw new ConflictException(`Screen ${screen.screen_key} API route ${route.key} capability is not declared`);
    }
  }

  if (screen.route.startsWith('/lead-desk') && manifest.module_key !== 'lead.desk') {
    throw new ConflictException(`Screen ${screen.screen_key} cannot register business-module routes outside its owner`);
  }
}

function assertCommandContribution(
  manifest: RuntimeModuleManifest,
  command: CommandContributionContract,
  localCapabilityKeys: Set<string>,
  consumedCapabilityKeys: Set<string>,
) {
  if (!MANIFEST_KEY_PATTERN.test(command.id)) {
    throw new ConflictException(`Command ${command.id} must use manifest key syntax`);
  }

  if (command.label.trim().length === 0) {
    throw new ConflictException(`Command ${command.id} requires a label`);
  }

  if (command.group.trim().length === 0) {
    throw new ConflictException(`Command ${command.id} requires a group`);
  }

  if (!command.route && !command.action) {
    throw new ConflictException(`Command ${command.id} requires a route or action`);
  }

  if (command.route !== undefined && !/^\/[A-Za-z0-9/_:.-]*$/.test(command.route)) {
    throw new ConflictException(`Command ${command.id} requires an absolute safe route`);
  }

  if (command.action !== undefined && !MANIFEST_KEY_PATTERN.test(command.action)) {
    throw new ConflictException(`Command ${command.id} action must use manifest key syntax`);
  }

  if (command.module_id !== undefined && command.module_id !== manifest.module_key) {
    throw new ConflictException(`Command ${command.id} module_id must match manifest module_key`);
  }

  if (
    command.required_capability !== undefined &&
    !localCapabilityKeys.has(command.required_capability) &&
    !consumedCapabilityKeys.has(command.required_capability)
  ) {
    throw new ConflictException(`Command ${command.id} required_capability is not declared`);
  }

  if (command.route?.startsWith('/lead-desk') && manifest.module_key !== 'lead.desk') {
    throw new ConflictException(`Command ${command.id} cannot register business-module routes outside its owner`);
  }

  for (const keyword of command.keywords ?? []) {
    if (keyword.trim().length === 0) {
      throw new ConflictException(`Command ${command.id} keywords must be non-empty`);
    }
  }
}

function assertSettingContribution(setting: SettingManifestEntry) {
  if (!MANIFEST_KEY_PATTERN.test(setting.key)) {
    throw new ConflictException(`Setting ${setting.key} must use manifest key syntax`);
  }

  if (setting.label.trim().length === 0) {
    throw new ConflictException(`Setting ${setting.key} requires a label`);
  }

  if (setting.description.trim().length === 0) {
    throw new ConflictException(`Setting ${setting.key} requires a description`);
  }

  if (!['string', 'number', 'boolean', 'json'].includes(setting.value_type)) {
    throw new ConflictException(`Setting ${setting.key} value_type is invalid`);
  }

  if (SECRET_SETTING_PATTERN.test(`${setting.key} ${setting.label} ${setting.description}`)) {
    throw new ConflictException(`Setting ${setting.key} cannot expose secrets as normal settings`);
  }

  if (!('default_value' in setting)) {
    return;
  }

  const defaultValue = setting.default_value;
  if (setting.value_type === 'string' && typeof defaultValue !== 'string') {
    throw new ConflictException(`Setting ${setting.key} default_value must be a string`);
  }
  if (setting.value_type === 'number' && typeof defaultValue !== 'number') {
    throw new ConflictException(`Setting ${setting.key} default_value must be a number`);
  }
  if (setting.value_type === 'boolean' && typeof defaultValue !== 'boolean') {
    throw new ConflictException(`Setting ${setting.key} default_value must be a boolean`);
  }
}

function assertHealthCheckContribution(healthCheck: HealthCheckManifestEntry) {
  if (!MANIFEST_KEY_PATTERN.test(healthCheck.key)) {
    throw new ConflictException(`Health check ${healthCheck.key} must use manifest key syntax`);
  }

  if (healthCheck.description.trim().length === 0) {
    throw new ConflictException(`Health check ${healthCheck.key} requires a description`);
  }

  if (healthCheck.endpoint !== undefined && !/^\/[A-Za-z0-9/_:.-]*$/.test(healthCheck.endpoint)) {
    throw new ConflictException(`Health check ${healthCheck.key} endpoint must be an absolute safe path`);
  }

  if (!Number.isInteger(healthCheck.timeout_ms) || healthCheck.timeout_ms <= 0) {
    throw new ConflictException(`Health check ${healthCheck.key} requires a positive timeout_ms`);
  }
}

function assertDegradedModeContribution(
  degradedMode: DegradedModeManifestEntry | undefined,
  localCapabilityKeys: Set<string>,
): asserts degradedMode is DegradedModeManifestEntry {
  if (!degradedMode) {
    throw new ConflictException('Health/degraded registration requires degraded_mode_behavior');
  }

  if (!['readonly', 'limited', 'disabled'].includes(degradedMode.mode)) {
    throw new ConflictException('degraded_mode_behavior.mode is invalid');
  }

  if (degradedMode.description.trim().length === 0) {
    throw new ConflictException('degraded_mode_behavior requires a description');
  }

  for (const capabilityKey of degradedMode.disabled_capabilities) {
    if (!localCapabilityKeys.has(capabilityKey)) {
      throw new ConflictException(`degraded disabled capability ${capabilityKey} must reference local capability`);
    }
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

  registerMenuContributions(manifest: RuntimeModuleManifest): MenuContributionRegistrationResult {
    assertPhase2ManifestShape(manifest);
    const localCapabilityKeys = new Set(manifest.capabilities.map((capability) => capability.key));
    const consumedCapabilityKeys = new Set(
      (manifest.capabilities_consumed ?? []).map((capability) => capability.capability_key),
    );
    const seenMenuKeys = new Set<string>();

    const menuEntries = (manifest.menu_entries ?? [])
      .map((entry) => {
        if (seenMenuKeys.has(entry.key)) {
          throw new ConflictException(`Menu entry ${entry.key} must be unique`);
        }
        seenMenuKeys.add(entry.key);
        assertMenuContribution(manifest, entry, localCapabilityKeys, consumedCapabilityKeys);

        return {
          key: entry.key,
          label: entry.label,
          path: entry.path,
          module_key: manifest.module_key,
          capability_key: entry.capability_key ?? null,
          order: entry.order,
        };
      })
      .sort((left, right) => left.order - right.order || left.key.localeCompare(right.key));

    return {
      module_key: manifest.module_key,
      registered_count: menuEntries.length,
      menu_entries: menuEntries,
    };
  }

  registerScreenContributions(
    input: ScreenContributionRegistrationInput,
  ): ScreenContributionRegistrationResult {
    assertPhase2ManifestShape(input.manifest);
    const localCapabilityKeys = new Set(input.manifest.capabilities.map((capability) => capability.key));
    const consumedCapabilityKeys = new Set(
      (input.manifest.capabilities_consumed ?? []).map((capability) => capability.capability_key),
    );
    const seenScreenKeys = new Set<string>();
    const seenRoutes = new Set<string>();

    const screens = input.screens
      .map((screen) => {
        if (seenScreenKeys.has(screen.screen_key)) {
          throw new ConflictException(`Screen ${screen.screen_key} must be unique`);
        }
        if (seenRoutes.has(screen.route)) {
          throw new ConflictException(`Screen route ${screen.route} must be unique`);
        }
        seenScreenKeys.add(screen.screen_key);
        seenRoutes.add(screen.route);
        assertScreenContribution(input.manifest, screen, localCapabilityKeys, consumedCapabilityKeys);

        return {
          screen_key: screen.screen_key,
          module_key: screen.module_key,
          title: screen.title,
          route: screen.route,
          status: screen.status,
          screen_type: screen.screen_type,
          required_capabilities: [...screen.required_capabilities].sort(),
          optional_capabilities: [...screen.optional_capabilities].sort(),
          api_route_keys: screen.api_routes.map((route) => route.key).sort(),
        };
      })
      .sort((left, right) => left.screen_key.localeCompare(right.screen_key));

    return {
      module_key: input.manifest.module_key,
      registered_count: screens.length,
      screens,
    };
  }

  registerCommandContributions(
    input: CommandContributionRegistrationInput,
  ): CommandContributionRegistrationResult {
    assertPhase2ManifestShape(input.manifest);
    const localCapabilityKeys = new Set(input.manifest.capabilities.map((capability) => capability.key));
    const consumedCapabilityKeys = new Set(
      (input.manifest.capabilities_consumed ?? []).map((capability) => capability.capability_key),
    );
    const seenCommandIds = new Set<string>();

    const commands = input.commands
      .map((command) => {
        if (seenCommandIds.has(command.id)) {
          throw new ConflictException(`Command ${command.id} must be unique`);
        }
        seenCommandIds.add(command.id);
        assertCommandContribution(input.manifest, command, localCapabilityKeys, consumedCapabilityKeys);

        return {
          id: command.id,
          label: command.label,
          module_key: input.manifest.module_key,
          group: command.group,
          route: command.route ?? null,
          action: command.action ?? null,
          required_capability: command.required_capability ?? null,
          keywords: [...(command.keywords ?? [])].sort(),
          visibility_condition: command.visibility_condition ?? null,
          disabled_reason: command.disabled_reason ?? null,
        };
      })
      .sort((left, right) => left.group.localeCompare(right.group) || left.label.localeCompare(right.label));

    return {
      module_key: input.manifest.module_key,
      registered_count: commands.length,
      commands,
    };
  }

  registerSettingContributions(manifest: RuntimeModuleManifest): SettingContributionRegistrationResult {
    assertPhase2ManifestShape(manifest);
    const seenSettingKeys = new Set<string>();

    const settings = (manifest.settings ?? [])
      .map((setting) => {
        if (seenSettingKeys.has(setting.key)) {
          throw new ConflictException(`Setting ${setting.key} must be unique`);
        }
        seenSettingKeys.add(setting.key);
        assertSettingContribution(setting);

        return {
          key: setting.key,
          label: setting.label,
          module_key: manifest.module_key,
          description: setting.description,
          value_type: setting.value_type,
          required: setting.required,
          has_default_value: 'default_value' in setting,
        };
      })
      .sort((left, right) => left.key.localeCompare(right.key));

    return {
      module_key: manifest.module_key,
      registered_count: settings.length,
      settings,
    };
  }

  registerHealthDegradedStateContributions(
    manifest: RuntimeModuleManifest,
  ): HealthDegradedStateRegistrationResult {
    assertPhase2ManifestShape(manifest);
    const localCapabilityKeys = new Set(manifest.capabilities.map((capability) => capability.key));
    const seenHealthCheckKeys = new Set<string>();

    const healthChecks = (manifest.health_checks ?? [])
      .map((healthCheck) => {
        if (seenHealthCheckKeys.has(healthCheck.key)) {
          throw new ConflictException(`Health check ${healthCheck.key} must be unique`);
        }
        seenHealthCheckKeys.add(healthCheck.key);
        assertHealthCheckContribution(healthCheck);

        return {
          key: healthCheck.key,
          description: healthCheck.description,
          endpoint: healthCheck.endpoint ?? null,
          critical: healthCheck.critical,
          timeout_ms: healthCheck.timeout_ms,
        };
      })
      .sort((left, right) => left.key.localeCompare(right.key));

    assertDegradedModeContribution(manifest.degraded_mode_behavior, localCapabilityKeys);

    return {
      module_key: manifest.module_key,
      health_checks: healthChecks,
      degraded_mode_behavior: {
        mode: manifest.degraded_mode_behavior.mode,
        description: manifest.degraded_mode_behavior.description,
        disabled_capabilities: [...manifest.degraded_mode_behavior.disabled_capabilities].sort(),
      },
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

  async getFrontendRegistry(input: ModuleRegistryFrontendRequest): Promise<ModuleRegistryFrontendResponse> {
    assertNonEmpty(input.organization_id, 'Module registry frontend response requires organization_id');
    assertNonEmpty(input.actor_user_id, 'Module registry frontend response requires actor_user_id');

    const modules = await this.listModules();

    return {
      items: modules.items.map(({ module_key, display_name, version, status }) => ({
        module_key,
        display_name,
        version,
        status,
      })),
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
        event_type: 'module.registry.frontend.read',
        outbox_event_required: false,
      },
    };
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
