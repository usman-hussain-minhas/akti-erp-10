import { randomUUID } from 'node:crypto';

import { ForbiddenException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type {
  GatekeeperCheckResult,
  GatekeeperDecisionResult,
  GatekeeperReason,
  GatekeeperRequest,
  GatekeeperReauthStatus,
} from '@akti/contracts/gatekeeper-contract';

const ACCESS_POLICY_MANAGE_CAPABILITY_KEY = 'access.policy.manage';
const ACCESS_MODULE_KEY = 'core.access';

type HealthStatus = GatekeeperRequest['context']['module_health'][string];

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
    if (request.capability_key !== ACCESS_POLICY_MANAGE_CAPABILITY_KEY) {
      return this.deny(request, 'gatekeeper.capability.unsupported', 'Gatekeeper denied unsupported capability.');
    }

    if (request.module_key !== ACCESS_MODULE_KEY) {
      return this.deny(request, 'gatekeeper.module.unsupported', 'Gatekeeper denied unsupported module.');
    }

    if (request.organization_id !== request.context.current_organization_id) {
      return this.deny(request, 'gatekeeper.organization.mismatch', 'Gatekeeper context organization mismatch.');
    }

    if (request.actor_user_id !== request.context.current_user_id) {
      return this.deny(request, 'gatekeeper.actor.mismatch', 'Gatekeeper context actor mismatch.');
    }

    if (!request.context.capabilities.includes(ACCESS_POLICY_MANAGE_CAPABILITY_KEY)) {
      return this.deny(request, 'gatekeeper.capability.missing', 'Gatekeeper context is missing access.policy.manage.');
    }

    if (request.context.module_health[ACCESS_MODULE_KEY] !== 'healthy') {
      return this.degradedBlock(request, 'gatekeeper.module.unhealthy', 'Access Core is not healthy for mutation preflight.');
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

@Injectable()
export class GatekeeperPreflightService {
  private readonly phase1DecisionProvider = new Phase1GatekeeperDecisionProvider();

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

    if (decision.decision === 'degraded_block') {
      throw new ServiceUnavailableException('Gatekeeper blocked the mutation because Access Core is degraded');
    }

    if (decision.decision !== 'allow') {
      throw new ForbiddenException('Gatekeeper did not allow the mutation');
    }

    return decision;
  }

  protected async provideDecision(request: GatekeeperRequest): Promise<unknown> {
    return this.phase1DecisionProvider.decide(request);
  }

  private buildRequest(input: GatekeeperPreflightInput): unknown {
    return {
      request_id: `gk_req_${randomUUID()}`,
      organization_id: input.organization_id,
      actor_user_id: input.actor_user_id,
      capability_key: input.capability_key ?? ACCESS_POLICY_MANAGE_CAPABILITY_KEY,
      module_key: input.module_key ?? ACCESS_MODULE_KEY,
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
        capabilities: [input.capability_key ?? ACCESS_POLICY_MANAGE_CAPABILITY_KEY],
        module_health: input.module_health ?? {
          [ACCESS_MODULE_KEY]: 'healthy',
        },
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
}
