import { BadRequestException, Body, Controller, Headers, Post } from '@nestjs/common';

import { type GatekeeperPreflightInput, GatekeeperPreflightService } from './gatekeeper-preflight.service';
import {
  type HeaderRecord,
  requireContextBodyMatch,
  resolveTrustedRequestContext,
} from '../security/request-context';

type HealthStatus = 'healthy' | 'degraded' | 'disabled' | 'unknown';

type GatekeeperPreflightBody = {
  organization_id?: unknown;
  actor_user_id?: unknown;
  active_group_ids?: unknown;
  entity_type?: unknown;
  entity_id?: unknown;
  action_key?: unknown;
  capability_key?: unknown;
  module_key?: unknown;
  scope_unit_id?: unknown;
  payload?: unknown;
  module_health?: unknown;
  dependency_health?: unknown;
  reauth_status?: unknown;
};

const HEALTH_STATUSES = new Set<HealthStatus>(['healthy', 'degraded', 'disabled', 'unknown']);
const REAUTH_STATUSES = new Set(['not_required', 'required', 'satisfied', 'expired']);

@Controller('platform/gatekeeper')
export class GatekeeperController {
  constructor(private readonly gatekeeperPreflightService: GatekeeperPreflightService) {}

  @Post('preflight')
  preflight(@Body() body: unknown, @Headers() headers: HeaderRecord) {
    const parsedBody = this.parseBody(body);
    const context = resolveTrustedRequestContext(headers, {
      routeOrganizationId: parsedBody.organization_id,
    });
    requireContextBodyMatch(context, {
      organization_id: parsedBody.organization_id,
      actor_user_id: parsedBody.actor_user_id,
    });

    const input: GatekeeperPreflightInput = {
      organization_id: context.organization_id,
      actor_user_id: context.actor_user_id,
      active_group_ids: parsedBody.active_group_ids,
      entity_type: parsedBody.entity_type,
      entity_id: parsedBody.entity_id,
      action_key: parsedBody.action_key,
      capability_key: parsedBody.capability_key,
      module_key: parsedBody.module_key,
      scope_unit_id: parsedBody.scope_unit_id,
      payload: parsedBody.payload,
      module_health: parsedBody.module_health,
      dependency_health: parsedBody.dependency_health,
      reauth_status: parsedBody.reauth_status,
    };

    return this.gatekeeperPreflightService.requireAllow(input);
  }

  @Post('phase-6a-6c/runtime-preflight')
  phase6A6CRuntimePreflight(@Body() body: unknown, @Headers() headers: HeaderRecord) {
    const parsedBody = this.parseBody(body);
    const context = resolveTrustedRequestContext(headers, {
      routeOrganizationId: parsedBody.organization_id,
    });
    requireContextBodyMatch(context, {
      organization_id: parsedBody.organization_id,
      actor_user_id: parsedBody.actor_user_id,
    });

    const input: GatekeeperPreflightInput = {
      organization_id: context.organization_id,
      actor_user_id: context.actor_user_id,
      active_group_ids: parsedBody.active_group_ids,
      entity_type: parsedBody.entity_type,
      entity_id: parsedBody.entity_id,
      action_key: parsedBody.action_key,
      capability_key: parsedBody.capability_key,
      module_key: parsedBody.module_key,
      scope_unit_id: parsedBody.scope_unit_id,
      payload: parsedBody.payload,
      module_health: parsedBody.module_health,
      dependency_health: parsedBody.dependency_health,
      reauth_status: parsedBody.reauth_status,
    };

    return this.gatekeeperPreflightService.evaluatePreflight(input);
  }

  private parseBody(body: unknown): Required<
    Pick<
      GatekeeperPreflightInput,
      'organization_id' | 'active_group_ids' | 'entity_type' | 'entity_id' | 'action_key'
    >
  > &
    Pick<
      GatekeeperPreflightInput,
      | 'capability_key'
      | 'module_key'
      | 'scope_unit_id'
      | 'payload'
      | 'module_health'
      | 'dependency_health'
      | 'reauth_status'
    > & { actor_user_id?: string } {
    if (!isRecord(body)) {
      throw new BadRequestException('Gatekeeper preflight body must be an object');
    }

    const input = body as GatekeeperPreflightBody;
    const organizationId = requireNonEmptyString(input.organization_id, 'organization_id');
    const activeGroupIds = requireNonEmptyStringArray(input.active_group_ids, 'active_group_ids');
    const entityType = requireNonEmptyString(input.entity_type, 'entity_type');
    const actionKey = requireNonEmptyString(input.action_key, 'action_key');

    return {
      organization_id: organizationId,
      actor_user_id: optionalNonEmptyString(input.actor_user_id, 'actor_user_id'),
      active_group_ids: activeGroupIds,
      entity_type: entityType,
      entity_id: nullableNonEmptyString(input.entity_id, 'entity_id'),
      action_key: actionKey,
      capability_key: optionalNonEmptyString(input.capability_key, 'capability_key'),
      module_key: optionalNonEmptyString(input.module_key, 'module_key'),
      scope_unit_id: nullableNonEmptyString(input.scope_unit_id, 'scope_unit_id'),
      payload: optionalRecord(input.payload, 'payload') ?? {},
      module_health: optionalHealthRecord(input.module_health, 'module_health') ?? {},
      dependency_health: optionalHealthRecord(input.dependency_health, 'dependency_health') ?? {},
      reauth_status: optionalReauthStatus(input.reauth_status),
    };
  }
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}

function requireNonEmptyString(input: unknown, field: string): string {
  const value = optionalNonEmptyString(input, field);
  if (!value) {
    throw new BadRequestException(`Gatekeeper preflight ${field} is required`);
  }

  return value;
}

function optionalNonEmptyString(input: unknown, field: string): string | undefined {
  if (input === undefined) {
    return undefined;
  }

  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new BadRequestException(`Gatekeeper preflight ${field} must be a non-empty string`);
  }

  return input.trim();
}

function nullableNonEmptyString(input: unknown, field: string): string | null {
  if (input === undefined || input === null) {
    return null;
  }

  return requireNonEmptyString(input, field);
}

function requireNonEmptyStringArray(input: unknown, field: string): string[] {
  if (!Array.isArray(input)) {
    throw new BadRequestException(`Gatekeeper preflight ${field} must be an array`);
  }

  const values = input.map((item) => requireNonEmptyString(item, field));
  if (values.length === 0) {
    throw new BadRequestException(`Gatekeeper preflight ${field} must not be empty`);
  }

  return values;
}

function optionalRecord(input: unknown, field: string): Record<string, unknown> | undefined {
  if (input === undefined) {
    return undefined;
  }

  if (!isRecord(input)) {
    throw new BadRequestException(`Gatekeeper preflight ${field} must be an object`);
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
        throw new BadRequestException(`Gatekeeper preflight ${field} has invalid health status`);
      }

      return [key, value as HealthStatus];
    }),
  );
}

function optionalReauthStatus(input: unknown): GatekeeperPreflightInput['reauth_status'] {
  if (input === undefined) {
    return undefined;
  }

  if (typeof input !== 'string' || !REAUTH_STATUSES.has(input)) {
    throw new BadRequestException('Gatekeeper preflight reauth_status is invalid');
  }

  return input as GatekeeperPreflightInput['reauth_status'];
}
