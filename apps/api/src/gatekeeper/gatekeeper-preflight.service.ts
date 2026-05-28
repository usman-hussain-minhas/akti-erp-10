import { randomUUID } from 'node:crypto';

import { ForbiddenException, Injectable, Optional, ServiceUnavailableException } from '@nestjs/common';
import type {
  GatekeeperCheckResult,
  GatekeeperDecisionResult,
  GatekeeperReason,
  GatekeeperRequest,
  GatekeeperReauthStatus,
} from '@akti/contracts/gatekeeper-contract';

import { type Prisma } from '../prisma/prisma-client';
import { PrismaService } from '../prisma/prisma.service';

const ACCESS_POLICY_MANAGE_CAPABILITY_KEY = 'access.policy.manage';
const ACCESS_MODULE_KEY = 'core.access';
const ENGAGEMENT_REQUEST_CREATE_CAPABILITY_KEY = 'engagement.gateway.request.create';
const ENGAGEMENT_MODULE_KEY = 'engagement.gateway';
const LEAD_CREATE_CAPABILITY_KEY = 'lead.intake.create';
const LEAD_STATUS_UPDATE_CAPABILITY_KEY = 'lead.status.update';
const LEAD_ASSIGN_CAPABILITY_KEY = 'lead.inbox.assign';
const LEAD_MODULE_KEY = 'lead.desk';

type CapabilityPolicy = {
  module_key: string;
  required_dependency_modules: string[];
};

const CAPABILITY_POLICIES: Record<string, CapabilityPolicy> = {
  [ACCESS_POLICY_MANAGE_CAPABILITY_KEY]: {
    module_key: ACCESS_MODULE_KEY,
    required_dependency_modules: [],
  },
  [ENGAGEMENT_REQUEST_CREATE_CAPABILITY_KEY]: {
    module_key: ENGAGEMENT_MODULE_KEY,
    required_dependency_modules: [ACCESS_MODULE_KEY],
  },
  [LEAD_CREATE_CAPABILITY_KEY]: {
    module_key: LEAD_MODULE_KEY,
    required_dependency_modules: [ACCESS_MODULE_KEY, ENGAGEMENT_MODULE_KEY],
  },
  [LEAD_STATUS_UPDATE_CAPABILITY_KEY]: {
    module_key: LEAD_MODULE_KEY,
    required_dependency_modules: [ACCESS_MODULE_KEY, ENGAGEMENT_MODULE_KEY],
  },
  [LEAD_ASSIGN_CAPABILITY_KEY]: {
    module_key: LEAD_MODULE_KEY,
    required_dependency_modules: [ACCESS_MODULE_KEY, ENGAGEMENT_MODULE_KEY],
  },
};

type HealthStatus = GatekeeperRequest['context']['module_health'][string];
type GatekeeperCanonicalOutcome = 'ALLOW' | 'DENY' | 'APPROVAL_REQUIRED' | 'STOP_FOR_REVIEW';
type GatekeeperDecisionPersistenceClient = Pick<PrismaService, 'gatekeeperDecisionRecord'>;

type GatekeeperContractsModule = {
  parseGatekeeperRequest(input: unknown): GatekeeperRequest;
  parseGatekeeperDecisionResult(input: unknown): GatekeeperDecisionResult;
};

const nativeImport = new Function('specifier', 'return import(specifier)') as (
  specifier: string,
) => Promise<unknown>;

let gatekeeperContractsPromise: Promise<GatekeeperContractsModule> | null = null;

function isGatekeeperContractsModule(input: unknown): input is GatekeeperContractsModule {
  if (typeof input !== 'object' || input === null) {
    return false;
  }

  const maybeModule = input as {
    parseGatekeeperRequest?: unknown;
    parseGatekeeperDecisionResult?: unknown;
  };

  return (
    typeof maybeModule.parseGatekeeperRequest === 'function' &&
    typeof maybeModule.parseGatekeeperDecisionResult === 'function'
  );
}

async function loadGatekeeperContracts(): Promise<GatekeeperContractsModule> {
  gatekeeperContractsPromise ??= nativeImport('@akti/contracts/gatekeeper-contract').then((module) => {
    if (!isGatekeeperContractsModule(module)) {
      throw new Error('Gatekeeper contract helpers are unavailable');
    }

    return module;
  });

  return gatekeeperContractsPromise;
}

export type GatekeeperPreflightInput = {
  organization_id: string;
  actor_user_id: string;
  active_group_ids: string[];
  entity_type: string;
  entity_id: string | null;
  action_key: string;
  capability_key?: string;
  module_key?: string;
  scope_unit_id?: string | null;
  payload?: Record<string, unknown>;
  module_health?: Record<string, HealthStatus>;
  dependency_health?: Record<string, HealthStatus>;
  reauth_status?: GatekeeperReauthStatus;
};

export type GatekeeperDecisionProvider = {
  decide(request: GatekeeperRequest): Promise<unknown> | unknown;
};

class Phase1GatekeeperDecisionProvider implements GatekeeperDecisionProvider {
  decide(request: GatekeeperRequest): GatekeeperDecisionResult {
    const policy = CAPABILITY_POLICIES[request.capability_key];
    if (!policy) {
      return this.deny(request, 'gatekeeper.capability.unsupported', 'Gatekeeper denied unsupported capability.');
    }

    if (request.module_key !== policy.module_key) {
      return this.deny(request, 'gatekeeper.module.unsupported', 'Gatekeeper denied unsupported module.');
    }

    if (request.organization_id !== request.context.current_organization_id) {
      return this.deny(request, 'gatekeeper.organization.mismatch', 'Gatekeeper context organization mismatch.');
    }

    if (request.actor_user_id !== request.context.current_user_id) {
      return this.deny(request, 'gatekeeper.actor.mismatch', 'Gatekeeper context actor mismatch.');
    }

    if (!request.context.capabilities.includes(request.capability_key)) {
      return this.deny(request, 'gatekeeper.capability.missing', 'Gatekeeper context is missing requested capability.');
    }

    if (request.context.active_group_ids.length === 0) {
      return this.deny(request, 'gatekeeper.active-groups.missing', 'Gatekeeper context is missing active actor groups.');
    }

    const moduleHealth = request.context.module_health[policy.module_key];
    if (moduleHealth === undefined) {
      return this.degradedBlock(
        request,
        'gatekeeper.module.health.missing',
        'Gatekeeper requires module health for the target module.',
      );
    }

    if (moduleHealth !== 'healthy') {
      return this.degradedBlock(request, 'gatekeeper.module.unhealthy', 'Target module is not healthy for mutation preflight.');
    }

    for (const dependencyModuleKey of policy.required_dependency_modules) {
      const dependencyHealth = request.context.dependency_health[dependencyModuleKey];

      if (dependencyHealth === undefined) {
        return this.degradedBlock(
          request,
          'gatekeeper.dependency.health.missing',
          'Gatekeeper requires dependency health for the target capability.',
        );
      }

      if (dependencyHealth !== 'healthy') {
        return this.degradedBlock(
          request,
          'gatekeeper.dependency.unhealthy',
          'Gatekeeper blocked the mutation because a dependency is not healthy.',
        );
      }
    }

    if (request.context.reauth_status !== 'not_required') {
      return this.deny(request, 'gatekeeper.reauth.unsatisfied', 'Gatekeeper reauthentication status is not acceptable.');
    }

    return {
      decision: 'allow',
      request_id: request.request_id,
      capability_key: request.capability_key,
      actor_user_id: request.actor_user_id,
      organization_id: request.organization_id,
      reasons: [],
      checks: [
        {
          check_key: 'gatekeeper.phase1.preflight',
          status: 'passed',
          reason: null,
          evidence_required: [],
          evidence_present: [],
        },
      ],
      required_evidence: [],
      missing_evidence: [],
      reauth_required: false,
      decision_token: `gk_${request.request_id}`,
      expires_at: new Date(Date.now() + 60_000).toISOString(),
    };
  }

  private deny(request: GatekeeperRequest, code: string, message: string): GatekeeperDecisionResult {
    const reason = this.reason(code, message, 'error');

    return {
      decision: 'deny',
      request_id: request.request_id,
      capability_key: request.capability_key,
      actor_user_id: request.actor_user_id,
      organization_id: request.organization_id,
      reasons: [reason],
      checks: [this.check('gatekeeper.phase1.preflight', 'failed', reason)],
      required_evidence: [],
      missing_evidence: [],
      reauth_required: false,
      expires_at: null,
    };
  }

  private degradedBlock(request: GatekeeperRequest, code: string, message: string): GatekeeperDecisionResult {
    const reason = this.reason(code, message, 'error');

    return {
      decision: 'degraded_block',
      request_id: request.request_id,
      capability_key: request.capability_key,
      actor_user_id: request.actor_user_id,
      organization_id: request.organization_id,
      reasons: [reason],
      checks: [this.check('gatekeeper.phase1.health', 'failed', reason)],
      required_evidence: [],
      missing_evidence: [],
      reauth_required: false,
      expires_at: null,
    };
  }

  private check(
    checkKey: string,
    status: GatekeeperCheckResult['status'],
    reason: GatekeeperReason,
  ): GatekeeperCheckResult {
    return {
      check_key: checkKey,
      status,
      reason,
      evidence_required: [],
      evidence_present: [],
    };
  }

  private reason(code: string, message: string, severity: GatekeeperReason['severity']): GatekeeperReason {
    return {
      code,
      message,
      severity,
    };
  }
}

function normalizeGatekeeperDecisionOutcome(
  decision: GatekeeperDecisionResult['decision'],
): GatekeeperCanonicalOutcome {
  switch (decision) {
    case 'ALLOW':
    case 'DENY':
    case 'APPROVAL_REQUIRED':
    case 'STOP_FOR_REVIEW':
      return decision;
    case 'allow':
      return 'ALLOW';
    case 'deny':
      return 'DENY';
    case 'approval_required':
      return 'APPROVAL_REQUIRED';
    case 'degraded_block':
      return 'STOP_FOR_REVIEW';
  }
}

@Injectable()
export class GatekeeperPreflightService {
  private readonly phase1DecisionProvider = new Phase1GatekeeperDecisionProvider();

  constructor(@Optional() private readonly prisma?: PrismaService) {}

  async requireAllow(input: GatekeeperPreflightInput): Promise<GatekeeperDecisionResult> {
    let contracts: GatekeeperContractsModule;
    try {
      contracts = await loadGatekeeperContracts();
    } catch {
      throw new ForbiddenException('Gatekeeper contract helpers are unavailable');
    }

    let request: GatekeeperRequest;
    try {
      request = contracts.parseGatekeeperRequest(this.buildRequest(input));
    } catch {
      throw new ForbiddenException('Gatekeeper preflight request is invalid');
    }

    let rawDecision: unknown;

    try {
      rawDecision = await this.provideDecision(request);
    } catch {
      throw new ForbiddenException('Gatekeeper preflight failed closed');
    }

    let decision: GatekeeperDecisionResult;
    try {
      decision = contracts.parseGatekeeperDecisionResult(rawDecision);
    } catch {
      throw new ForbiddenException('Gatekeeper preflight returned an invalid decision');
    }

    this.assertDecisionMatchesRequest(request, decision);
    const normalizedOutcome = normalizeGatekeeperDecisionOutcome(decision.decision);
    await this.recordDecisionIfConfigured(request, decision, normalizedOutcome);

    if (normalizedOutcome === 'STOP_FOR_REVIEW') {
      throw new ServiceUnavailableException('Gatekeeper stopped the mutation for platform review');
    }

    if (normalizedOutcome !== 'ALLOW') {
      throw new ForbiddenException('Gatekeeper did not allow the mutation');
    }

    return decision;
  }

  protected async provideDecision(request: GatekeeperRequest): Promise<unknown> {
    return this.phase1DecisionProvider.decide(request);
  }

  private async recordDecisionIfConfigured(
    request: GatekeeperRequest,
    decision: GatekeeperDecisionResult,
    outcome: GatekeeperCanonicalOutcome,
  ) {
    if (!this.prisma) {
      return;
    }

    await this.recordDecision(this.prisma, request, decision, outcome);
  }

  private async recordDecision(
    db: GatekeeperDecisionPersistenceClient,
    request: GatekeeperRequest,
    decision: GatekeeperDecisionResult,
    outcome: GatekeeperCanonicalOutcome,
  ) {
    await db.gatekeeperDecisionRecord.create({
      data: {
        organization_id: request.organization_id,
        actor_user_id: request.actor_user_id,
        request_id: request.request_id,
        capability_key: request.capability_key,
        module_key: request.module_key,
        entity_type: request.entity_type,
        entity_id: request.entity_id,
        scope_unit_id: request.scope_unit_id,
        action_key: this.requiredPayloadString(request.payload, 'action_key'),
        outcome,
        reason_summary: decision.reasons as unknown as Prisma.InputJsonValue,
        check_results: decision.checks as unknown as Prisma.InputJsonValue,
        required_evidence: decision.required_evidence as unknown as Prisma.InputJsonValue,
        missing_evidence: decision.missing_evidence as unknown as Prisma.InputJsonValue,
        approval_chain_key: decision.approval_chain_key ?? null,
        approval_request_id: decision.approval_request_id ?? null,
        decision_token: decision.decision_token ?? null,
        correlation_id: this.optionalPayloadString(request.payload, 'correlation_id'),
        requested_at: new Date(request.requested_at),
        expires_at: decision.expires_at ? new Date(decision.expires_at) : null,
        payload: request.payload as Prisma.InputJsonValue,
      },
    });
  }

  private buildRequest(input: GatekeeperPreflightInput): unknown {
    const capabilityKey = input.capability_key ?? ACCESS_POLICY_MANAGE_CAPABILITY_KEY;
    const capabilityPolicy = CAPABILITY_POLICIES[capabilityKey];
    const moduleKey = input.module_key ?? capabilityPolicy?.module_key ?? ACCESS_MODULE_KEY;

    return {
      request_id: `gk_req_${randomUUID()}`,
      organization_id: input.organization_id,
      actor_user_id: input.actor_user_id,
      capability_key: capabilityKey,
      module_key: moduleKey,
      entity_type: input.entity_type,
      entity_id: input.entity_id,
      scope_unit_id: input.scope_unit_id ?? null,
      payload: {
        action_key: input.action_key,
        ...(input.payload ?? {}),
      },
      requested_at: new Date().toISOString(),
      context: {
        current_organization_id: input.organization_id,
        current_user_id: input.actor_user_id,
        active_scope_unit_id: null,
        active_group_ids: input.active_group_ids,
        capabilities: [capabilityKey],
        module_health: input.module_health ?? {},
        dependency_health: input.dependency_health ?? {},
        reauth_status: input.reauth_status ?? 'not_required',
      },
    };
  }

  private assertDecisionMatchesRequest(request: GatekeeperRequest, decision: GatekeeperDecisionResult) {
    if (
      decision.request_id !== request.request_id ||
      decision.actor_user_id !== request.actor_user_id ||
      decision.organization_id !== request.organization_id ||
      decision.capability_key !== request.capability_key
    ) {
      throw new ForbiddenException('Gatekeeper decision does not match the preflight request');
    }
  }

  private optionalPayloadString(payload: Record<string, unknown>, key: string): string | null {
    const value = payload[key];
    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private requiredPayloadString(payload: Record<string, unknown>, key: string): string {
    const value = this.optionalPayloadString(payload, key);
    if (!value) {
      throw new ForbiddenException(`Gatekeeper request payload is missing ${key}`);
    }

    return value;
  }
}
