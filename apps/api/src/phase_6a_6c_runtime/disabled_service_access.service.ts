import { createHash } from 'node:crypto';

import { BadRequestException, Injectable } from '@nestjs/common';

export const DISABLED_SERVICE_NEGATIVE_PROOF_SERVICE_KEYS = [
  'core',
  'crm',
  'lms',
  'e-commerce',
  'events',
  'campaigns',
  'website-builder',
] as const;

export type DisabledServiceNegativeProofServiceKey =
  (typeof DISABLED_SERVICE_NEGATIVE_PROOF_SERVICE_KEYS)[number];

export type DisabledServiceAccessInput = {
  organization_id: string;
  actor_user_id: string;
  requested_service: string;
  active_services: readonly string[];
  route_path: string;
  correlation_id: string;
};

export type DisabledServiceAccessDecision = {
  decision_id: string;
  decision_hash: string;
  organization_id: string;
  actor_user_id: string;
  requested_service: DisabledServiceNegativeProofServiceKey;
  active_services: DisabledServiceNegativeProofServiceKey[];
  route_path: string;
  correlation_id: string;
  route_accessible: boolean;
  navigation_visible: boolean;
  server_side_inaccessible: boolean;
  http_status: 200 | 404;
  foundry_activation_authority_required: true;
  gatekeeper_bypass_allowed: false;
  reason: 'tenant_service_active' | 'tenant_service_inactive';
};

const SERVICE_KEY_SET = new Set<string>(DISABLED_SERVICE_NEGATIVE_PROOF_SERVICE_KEYS);

@Injectable()
export class DisabledServiceAccessService {
  evaluateTenantServiceAccess(input: DisabledServiceAccessInput): DisabledServiceAccessDecision {
    const organizationId = requireNonEmptyString(input.organization_id, 'organization_id');
    const actorUserId = requireNonEmptyString(input.actor_user_id, 'actor_user_id');
    const requestedService = requireKnownServiceKey(input.requested_service, 'requested_service');
    const activeServices = normalizeServiceList(input.active_services);
    const routePath = requireRoutePath(input.route_path);
    const correlationId = requireNonEmptyString(input.correlation_id, 'correlation_id');
    const activeServiceSet = new Set(activeServices);
    const active = activeServiceSet.has(requestedService);
    const decisionHash = createHash('sha256')
      .update(
        stableJsonStringify({
          active_services: [...activeServices].sort(),
          actor_user_id: actorUserId,
          correlation_id: correlationId,
          organization_id: organizationId,
          requested_service: requestedService,
          route_path: routePath,
        }),
      )
      .digest('hex');

    return {
      decision_id: `phase6_disabled_service_${decisionHash.slice(0, 16)}`,
      decision_hash: decisionHash,
      organization_id: organizationId,
      actor_user_id: actorUserId,
      requested_service: requestedService,
      active_services: activeServices,
      route_path: routePath,
      correlation_id: correlationId,
      route_accessible: active,
      navigation_visible: active,
      server_side_inaccessible: !active,
      http_status: active ? 200 : 404,
      foundry_activation_authority_required: true,
      gatekeeper_bypass_allowed: false,
      reason: active ? 'tenant_service_active' : 'tenant_service_inactive',
    };
  }

  proveCoreCrmOnlyTenantCannotAccessInactiveServices(input: {
    organization_id: string;
    actor_user_id: string;
    correlation_id: string;
  }): DisabledServiceAccessDecision[] {
    const baseInput = {
      organization_id: input.organization_id,
      actor_user_id: input.actor_user_id,
      active_services: ['core', 'crm'] as const,
      correlation_id: input.correlation_id,
    };

    return (['lms', 'e-commerce', 'events', 'campaigns', 'website-builder'] as const).map((requestedService) =>
      this.evaluateTenantServiceAccess({
        ...baseInput,
        requested_service: requestedService,
        route_path: `/platform/services/${requestedService}`,
      }),
    );
  }
}

function requireNonEmptyString(input: unknown, field: string): string {
  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new BadRequestException(`Disabled service access ${field} must be a non-empty string`);
  }

  return input.trim();
}

function requireRoutePath(input: unknown): string {
  const value = requireNonEmptyString(input, 'route_path');
  if (!value.startsWith('/')) {
    throw new BadRequestException('Disabled service access route_path must be an absolute application path');
  }

  return value;
}

function requireKnownServiceKey(input: unknown, field: string): DisabledServiceNegativeProofServiceKey {
  const value = requireNonEmptyString(input, field);
  if (!SERVICE_KEY_SET.has(value)) {
    throw new BadRequestException(`Disabled service access ${field} is not a known tenant service key`);
  }

  return value as DisabledServiceNegativeProofServiceKey;
}

function normalizeServiceList(input: readonly string[]): DisabledServiceNegativeProofServiceKey[] {
  if (!Array.isArray(input)) {
    throw new BadRequestException('Disabled service access active_services must be an array');
  }

  return [...new Set(input.map((item) => requireKnownServiceKey(item, 'active_services')))];
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
