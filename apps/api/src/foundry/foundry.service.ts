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

const MODULE_KEY_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\.[a-z][a-z0-9]*(?:-[a-z0-9]+)*)+$/;
const MANIFEST_KEY_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\.[a-z][a-z0-9]*(?:-[a-z0-9]+)*)*$/;
const SEMVER_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

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
