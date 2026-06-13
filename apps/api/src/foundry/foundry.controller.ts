import { BadRequestException, Body, Controller, Headers, Post, Inject } from '@nestjs/common';

import {
  FoundryService,
  type FoundryInstallPreflightInput,
  type FoundryPhase6A6CRuntimeActivationInput,
} from './foundry.service';
import {
  type HeaderRecord,
  requireContextBodyMatch,
  resolveTrustedRequestContext,
} from '../security/request-context';

type HealthStatus = 'healthy' | 'degraded' | 'disabled' | 'unknown';

type InstallPreflightBody = {
  organization_id?: unknown;
  actor_user_id?: unknown;
  active_group_ids?: unknown;
  target_module_key?: unknown;
  target_module_version?: unknown;
  manifest_hash?: unknown;
  migration_plan_ref?: unknown;
  rollback_plan_ref?: unknown;
  evidence_package_ref?: unknown;
  correlation_id?: unknown;
  module_health?: unknown;
  dependency_health?: unknown;
  reauth_status?: unknown;
};

type ParsedInstallPreflightBody = Omit<FoundryInstallPreflightInput, 'actor_user_id'> & {
  actor_user_id?: string;
};

type Phase6A6CRuntimeActivationPreflightBody = {
  organization_id?: unknown;
  actor_user_id?: unknown;
  requested_capability_surface?: unknown;
  active_capability_surfaces?: unknown;
};

type ParsedPhase6A6CRuntimeActivationPreflightBody = FoundryPhase6A6CRuntimeActivationInput & {
  actor_user_id?: string;
};

const HEALTH_STATUSES = new Set<HealthStatus>(['healthy', 'degraded', 'disabled', 'unknown']);
const REAUTH_STATUSES = new Set(['not_required', 'required', 'satisfied', 'expired']);

@Controller('platform/foundry')
export class FoundryController {
  constructor(@Inject(FoundryService) private readonly foundryService: FoundryService) {}

  @Post('install-preflight')
  installPreflight(@Body() body: unknown, @Headers() headers: HeaderRecord) {
    const parsedBody = this.parseInstallPreflightBody(body);
    const context = resolveTrustedRequestContext(headers, {
      routeOrganizationId: parsedBody.organization_id,
    });
    requireContextBodyMatch(context, {
      organization_id: parsedBody.organization_id,
      actor_user_id: parsedBody.actor_user_id,
    });

    return this.foundryService.runInstallPreflight({
      organization_id: context.organization_id,
      actor_user_id: context.actor_user_id,
      active_group_ids: parsedBody.active_group_ids,
      target_module_key: parsedBody.target_module_key,
      target_module_version: parsedBody.target_module_version,
      manifest_hash: parsedBody.manifest_hash,
      migration_plan_ref: parsedBody.migration_plan_ref,
      rollback_plan_ref: parsedBody.rollback_plan_ref,
      evidence_package_ref: parsedBody.evidence_package_ref,
      correlation_id: parsedBody.correlation_id,
      module_health: parsedBody.module_health,
      dependency_health: parsedBody.dependency_health,
      reauth_status: parsedBody.reauth_status,
    });
  }

  @Post('phase-6a-6c/runtime-activation/preflight')
  phase6A6CRuntimeActivationPreflight(@Body() body: unknown, @Headers() headers: HeaderRecord) {
    const parsedBody = this.parsePhase6A6CRuntimeActivationPreflightBody(body);
    const context = resolveTrustedRequestContext(headers, {
      routeOrganizationId: parsedBody.organization_id,
    });
    requireContextBodyMatch(context, {
      organization_id: parsedBody.organization_id,
      actor_user_id: parsedBody.actor_user_id,
    });

    return {
      ...this.foundryService.evaluatePhase6A6CRuntimeActivation({
        organization_id: context.organization_id,
        requested_capability_surface: parsedBody.requested_capability_surface,
        active_capability_surfaces: parsedBody.active_capability_surfaces,
      }),
      route_publication_scope: 'stage_2_foundry_activation_preflight',
    };
  }

  private parseInstallPreflightBody(body: unknown): ParsedInstallPreflightBody {
    if (!isRecord(body)) {
      throw new BadRequestException('Foundry install preflight body must be an object');
    }

    const input = body as InstallPreflightBody;

    return {
      organization_id: requireNonEmptyString(input.organization_id, 'organization_id'),
      actor_user_id: optionalNonEmptyString(input.actor_user_id, 'actor_user_id'),
      active_group_ids: requireNonEmptyStringArray(input.active_group_ids, 'active_group_ids'),
      target_module_key: requireNonEmptyString(input.target_module_key, 'target_module_key'),
      target_module_version: requireNonEmptyString(input.target_module_version, 'target_module_version'),
      manifest_hash: requireNonEmptyString(input.manifest_hash, 'manifest_hash'),
      migration_plan_ref: requireNonEmptyString(input.migration_plan_ref, 'migration_plan_ref'),
      rollback_plan_ref: requireNonEmptyString(input.rollback_plan_ref, 'rollback_plan_ref'),
      evidence_package_ref: requireNonEmptyString(input.evidence_package_ref, 'evidence_package_ref'),
      correlation_id: requireNonEmptyString(input.correlation_id, 'correlation_id'),
      module_health: optionalHealthRecord(input.module_health, 'module_health') ?? {},
      dependency_health: optionalHealthRecord(input.dependency_health, 'dependency_health') ?? {},
      reauth_status: optionalReauthStatus(input.reauth_status),
    };
  }

  private parsePhase6A6CRuntimeActivationPreflightBody(
    body: unknown,
  ): ParsedPhase6A6CRuntimeActivationPreflightBody {
    if (!isRecord(body)) {
      throw new BadRequestException('Foundry runtime activation preflight body must be an object');
    }

    const input = body as Phase6A6CRuntimeActivationPreflightBody;

    return {
      organization_id: requireNonEmptyString(input.organization_id, 'organization_id'),
      actor_user_id: optionalNonEmptyString(input.actor_user_id, 'actor_user_id'),
      requested_capability_surface: requireNonEmptyString(
        input.requested_capability_surface,
        'requested_capability_surface',
      ),
      active_capability_surfaces: requireStringArray(input.active_capability_surfaces, 'active_capability_surfaces'),
    };
  }
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}

function requireNonEmptyString(input: unknown, field: string): string {
  const value = optionalNonEmptyString(input, field);
  if (!value) {
    throw new BadRequestException(`Foundry install preflight ${field} is required`);
  }

  return value;
}

function optionalNonEmptyString(input: unknown, field: string): string | undefined {
  if (input === undefined) {
    return undefined;
  }

  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new BadRequestException(`Foundry install preflight ${field} must be a non-empty string`);
  }

  return input.trim();
}

function requireNonEmptyStringArray(input: unknown, field: string): string[] {
  if (!Array.isArray(input)) {
    throw new BadRequestException(`Foundry install preflight ${field} must be an array`);
  }

  const values = input.map((item) => requireNonEmptyString(item, field));
  if (values.length === 0) {
    throw new BadRequestException(`Foundry install preflight ${field} must not be empty`);
  }

  return values;
}

function requireStringArray(input: unknown, field: string): string[] {
  if (!Array.isArray(input)) {
    throw new BadRequestException(`Foundry runtime activation preflight ${field} must be an array`);
  }

  return input.map((item) => requireNonEmptyString(item, field));
}

function optionalRecord(input: unknown, field: string): Record<string, unknown> | undefined {
  if (input === undefined) {
    return undefined;
  }

  if (!isRecord(input)) {
    throw new BadRequestException(`Foundry install preflight ${field} must be an object`);
  }

  return input;
}

function optionalHealthRecord(input: unknown, field: string): Record<string, HealthStatus> | undefined {
  const record = optionalRecord(input, field);
  if (!record) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => {
      if (typeof value !== 'string' || !HEALTH_STATUSES.has(value as HealthStatus)) {
        throw new BadRequestException(`Foundry install preflight ${field} has invalid health status`);
      }

      return [key, value as HealthStatus];
    }),
  );
}

function optionalReauthStatus(input: unknown): FoundryInstallPreflightInput['reauth_status'] {
  if (input === undefined) {
    return undefined;
  }

  if (typeof input !== 'string' || !REAUTH_STATUSES.has(input)) {
    throw new BadRequestException('Foundry install preflight reauth_status is invalid');
  }

  return input as FoundryInstallPreflightInput['reauth_status'];
}
