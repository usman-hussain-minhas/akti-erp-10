import { createHash } from 'node:crypto';

import { BadRequestException, Injectable } from '@nestjs/common';

export type FoundryModuleType = 'core' | 'standard' | 'optional' | 'dedicated';

export type FoundryModuleScaffoldInput = {
  module_key: string;
  display_name: string;
  module_type: FoundryModuleType;
  version: string;
  owner: string;
  min_platform_version: string;
  capabilities?: string[];
  dependencies?: string[];
  business_module?: boolean;
  golden_module?: boolean;
  marketplace_public?: boolean;
  production_adapter_enabled?: boolean;
};

export type FoundryModuleScaffold = {
  module_key: string;
  display_name: string;
  module_type: FoundryModuleType;
  version: string;
  owner: string;
  min_platform_version: string;
  lifecycle_status: 'scaffolded';
  manifest_hash: string;
  gatekeeper_preflight_required: true;
  foundry_execution_allowed: false;
  capabilities: string[];
  dependencies: string[];
  non_scope_guards: {
    business_module: false;
    golden_module: false;
    marketplace_public: false;
    production_adapter_enabled: false;
  };
};

type FoundryCapabilitySpec = {
  key: string;
  module_key: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  requires_reauth: boolean;
  requires_audit: boolean;
  gatekeeper_required: boolean;
};

type FoundryPermissionSpec = {
  key: string;
  module_key: string;
  allowed_scope_types: string[];
};

type FoundryApiRouteSpec = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  capability_key: string;
};

type FoundryGatekeeperHookSpec = {
  key: string;
  capability_key: string;
  required: boolean;
};

type FoundryDependencySpec = {
  module_key: string;
  min_version?: string;
};

export type FoundryModuleManifestCandidate = {
  module_key: string;
  display_name: string;
  module_type: FoundryModuleType;
  version: string;
  owner: string;
  min_platform_version: string;
  dependencies: FoundryDependencySpec[];
  optional_dependencies: FoundryDependencySpec[];
  capabilities: FoundryCapabilitySpec[];
  permissions: FoundryPermissionSpec[];
  api_routes: FoundryApiRouteSpec[];
  gatekeeper_hooks: FoundryGatekeeperHookSpec[];
  schemas: Array<{ key: string }>;
  migrations: Array<{ key: string }>;
  data_ownership: {
    owner_module_key: string;
    tenant_scoped: boolean;
    entity_refs: string[];
  };
};

export type FoundryManifestValidationResult = {
  valid: boolean;
  module_key: string | null;
  version: string | null;
  manifest_hash: string | null;
  errors: string[];
};

const MODULE_KEY_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\.[a-z][a-z0-9]*(?:-[a-z0-9]+)*)+$/;
const MANIFEST_KEY_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\.[a-z][a-z0-9]*(?:-[a-z0-9]+)*)*$/;
const SEMVER_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const API_PATH_PATTERN = /^\/[A-Za-z0-9/_:.-]*$/;
const PERMISSION_SCOPE_TYPES = new Set([
  'global',
  'organization',
  'own_unit',
  'child_units',
  'own_record',
  'assigned_records',
]);

@Injectable()
export class FoundryService {
  scaffoldModule(input: FoundryModuleScaffoldInput): FoundryModuleScaffold {
    this.assertScaffoldInput(input);

    const capabilities = [...new Set(input.capabilities ?? [])].sort();
    const dependencies = [...new Set(input.dependencies ?? [])].sort();
    const hashBasis = {
      module_key: input.module_key,
      display_name: input.display_name,
      module_type: input.module_type,
      version: input.version,
      owner: input.owner,
      min_platform_version: input.min_platform_version,
      capabilities,
      dependencies,
    };

    return {
      module_key: input.module_key,
      display_name: input.display_name,
      module_type: input.module_type,
      version: input.version,
      owner: input.owner,
      min_platform_version: input.min_platform_version,
      lifecycle_status: 'scaffolded',
      manifest_hash: sha256Hex(stableJsonStringify(hashBasis)),
      gatekeeper_preflight_required: true,
      foundry_execution_allowed: false,
      capabilities,
      dependencies,
      non_scope_guards: {
        business_module: false,
        golden_module: false,
        marketplace_public: false,
        production_adapter_enabled: false,
      },
    };
  }

  validateManifest(input: FoundryModuleManifestCandidate): FoundryManifestValidationResult {
    const errors: string[] = [];

    this.validateManifestIdentity(input, errors);
    this.validateManifestCollections(input, errors);
    this.validateManifestReferences(input, errors);

    return {
      valid: errors.length === 0,
      module_key: typeof input.module_key === 'string' ? input.module_key : null,
      version: typeof input.version === 'string' ? input.version : null,
      manifest_hash: errors.length === 0 ? sha256Hex(stableJsonStringify(input)) : null,
      errors,
    };
  }

  assertManifestValid(input: FoundryModuleManifestCandidate): FoundryManifestValidationResult {
    const result = this.validateManifest(input);
    if (!result.valid) {
      throw new BadRequestException({
        message: 'Foundry module manifest validation failed',
        errors: result.errors,
      });
    }

    return result;
  }

  private assertScaffoldInput(input: FoundryModuleScaffoldInput) {
    if (!MODULE_KEY_PATTERN.test(input.module_key)) {
      throw new BadRequestException('Foundry module scaffold requires a valid module_key');
    }

    if (input.display_name.trim().length === 0) {
      throw new BadRequestException('Foundry module scaffold requires a display_name');
    }

    if (!SEMVER_PATTERN.test(input.version) || !SEMVER_PATTERN.test(input.min_platform_version)) {
      throw new BadRequestException('Foundry module scaffold requires semver versions');
    }

    if (input.owner.trim().length === 0) {
      throw new BadRequestException('Foundry module scaffold requires an owner');
    }

    for (const capability of input.capabilities ?? []) {
      if (!MANIFEST_KEY_PATTERN.test(capability)) {
        throw new BadRequestException('Foundry module scaffold capabilities must use manifest keys');
      }
    }

    for (const dependency of input.dependencies ?? []) {
      if (!MODULE_KEY_PATTERN.test(dependency)) {
        throw new BadRequestException('Foundry module scaffold dependencies must use module keys');
      }
    }

    if (
      input.business_module === true ||
      input.golden_module === true ||
      input.marketplace_public === true ||
      input.production_adapter_enabled === true
    ) {
      throw new BadRequestException('Foundry module scaffold cannot authorize out-of-phase module scope');
    }
  }

  private validateManifestIdentity(input: FoundryModuleManifestCandidate, errors: string[]) {
    if (!MODULE_KEY_PATTERN.test(input.module_key)) {
      errors.push('module_key must use module key syntax');
    }
    if (input.display_name.trim().length === 0) {
      errors.push('display_name is required');
    }
    if (!['core', 'standard', 'optional', 'dedicated'].includes(input.module_type)) {
      errors.push('module_type is invalid');
    }
    if (!SEMVER_PATTERN.test(input.version)) {
      errors.push('version must be semver');
    }
    if (input.owner.trim().length === 0) {
      errors.push('owner is required');
    }
    if (!SEMVER_PATTERN.test(input.min_platform_version)) {
      errors.push('min_platform_version must be semver');
    }
    if (input.data_ownership.owner_module_key !== input.module_key) {
      errors.push('data_ownership.owner_module_key must match module_key');
    }
  }

  private validateManifestCollections(input: FoundryModuleManifestCandidate, errors: string[]) {
    this.requireUnique(input.capabilities, (item) => item.key, 'capability key', errors);
    this.requireUnique(input.permissions, (item) => item.key, 'permission key', errors);
    this.requireUnique(input.api_routes, (item) => `${item.method} ${item.path}`, 'API route method + path', errors);
    this.requireUnique(input.gatekeeper_hooks, (item) => item.key, 'Gatekeeper hook key', errors);
    this.requireUnique(input.schemas, (item) => item.key, 'schema key', errors);
    this.requireUnique(input.migrations, (item) => item.key, 'migration key', errors);
  }

  private validateManifestReferences(input: FoundryModuleManifestCandidate, errors: string[]) {
    const capabilityKeys = new Set(input.capabilities.map((capability) => capability.key));
    const gatekeeperCapabilityKeys = new Set(input.gatekeeper_hooks.map((hook) => hook.capability_key));

    for (const capability of input.capabilities) {
      if (!MANIFEST_KEY_PATTERN.test(capability.key)) {
        errors.push(`capability ${capability.key} must use manifest key syntax`);
      }
      if (capability.module_key !== input.module_key) {
        errors.push(`capability ${capability.key} module_key must match manifest module_key`);
      }
      if (['high', 'critical'].includes(capability.risk_level)) {
        if (!capability.requires_audit) {
          errors.push(`high and critical capability ${capability.key} requires audit`);
        }
        if (!capability.gatekeeper_required) {
          errors.push(`high and critical capability ${capability.key} requires Gatekeeper`);
        }
      }
      if (capability.risk_level === 'critical' && !capability.requires_reauth) {
        errors.push(`critical capability ${capability.key} requires reauth`);
      }
      if (capability.gatekeeper_required && !gatekeeperCapabilityKeys.has(capability.key)) {
        errors.push(`gatekeeper_required capability ${capability.key} must have a Gatekeeper hook`);
      }
    }

    for (const permission of input.permissions) {
      if (!MANIFEST_KEY_PATTERN.test(permission.key)) {
        errors.push(`permission ${permission.key} must use manifest key syntax`);
      }
      if (permission.module_key !== input.module_key) {
        errors.push(`permission ${permission.key} module_key must match manifest module_key`);
      }
      if (permission.allowed_scope_types.length === 0) {
        errors.push(`permission ${permission.key} must declare allowed scope types`);
      }
      for (const scopeType of permission.allowed_scope_types) {
        if (!PERMISSION_SCOPE_TYPES.has(scopeType)) {
          errors.push(`permission ${permission.key} has invalid scope type ${scopeType}`);
        }
      }
    }

    for (const route of input.api_routes) {
      if (!API_PATH_PATTERN.test(route.path)) {
        errors.push(`API route ${route.method} ${route.path} must use an absolute path`);
      }
      if (!capabilityKeys.has(route.capability_key)) {
        errors.push(`API route ${route.method} ${route.path} capability_key must reference local capability`);
      }
    }

    for (const hook of input.gatekeeper_hooks) {
      if (!capabilityKeys.has(hook.capability_key)) {
        errors.push(`Gatekeeper hook ${hook.key} capability_key must reference local capability`);
      }
    }

    for (const dependency of [...input.dependencies, ...input.optional_dependencies]) {
      if (!MODULE_KEY_PATTERN.test(dependency.module_key)) {
        errors.push(`dependency ${dependency.module_key} must use module key syntax`);
      }
      if (dependency.module_key === input.module_key) {
        errors.push('dependencies must not include manifest module_key');
      }
      if (dependency.min_version !== undefined && !SEMVER_PATTERN.test(dependency.min_version)) {
        errors.push(`dependency ${dependency.module_key} min_version must be semver`);
      }
    }
  }

  private requireUnique<T>(
    items: T[],
    getKey: (item: T) => string,
    label: string,
    errors: string[],
  ) {
    const seen = new Set<string>();

    for (const item of items) {
      const key = getKey(item);
      if (seen.has(key)) {
        errors.push(`${label} must be unique: ${key}`);
      }
      seen.add(key);
    }
  }
}

function stableJsonStringify(input: unknown): string {
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
