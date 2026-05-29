import { randomUUID } from 'node:crypto';

import { ForbiddenException, Injectable, Optional, ServiceUnavailableException } from '@nestjs/common';
import type {
  GatekeeperCheckResult,
  GatekeeperDecisionResult,
  GatekeeperReason,
  GatekeeperRequest,
  GatekeeperReauthStatus,
} from '@akti/contracts/gatekeeper-contract';

import { AuditLogService } from '../platform-observability/audit-log.service';
import { EventOutboxService } from '../platform-observability/event-outbox.service';
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
      return this.deny(
        request,
        'gatekeeper.capability.unsupported',
        'Gatekeeper denied unsupported capability.',
        'gatekeeper.capability.supported',
      );
    }

    if (request.module_key !== policy.module_key) {
      return this.deny(
        request,
        'gatekeeper.module.unsupported',
        'Gatekeeper denied unsupported module.',
        'gatekeeper.capability.module-boundary',
      );
    }

    if (request.organization_id !== request.context.current_organization_id) {
      return this.deny(
        request,
        'gatekeeper.organization.mismatch',
        'Gatekeeper context organization mismatch.',
        'gatekeeper.tenant.organization-match',
      );
    }

    if (request.actor_user_id !== request.context.current_user_id) {
      return this.deny(
        request,
        'gatekeeper.actor.mismatch',
        'Gatekeeper context actor mismatch.',
        'gatekeeper.tenant.actor-match',
      );
    }

    if (!request.context.capabilities.includes(request.capability_key)) {
      return this.deny(
        request,
        'gatekeeper.capability.missing',
        'Gatekeeper context is missing requested capability.',
        'gatekeeper.capability.present',
      );
    }

    if (request.context.active_group_ids.length === 0) {
      return this.deny(
        request,
        'gatekeeper.active-groups.missing',
        'Gatekeeper context is missing active actor groups.',
        'gatekeeper.tenant.active-groups-present',
      );
    }

    const migrationRollbackRiskDecision = this.evaluateMigrationRollbackRisk(request);
    if (migrationRollbackRiskDecision) {
      return migrationRollbackRiskDecision;
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

  private deny(
    request: GatekeeperRequest,
    code: string,
    message: string,
    checkKey = 'gatekeeper.phase1.preflight',
  ): GatekeeperDecisionResult {
    const reason = this.reason(code, message, 'error');

    return {
      decision: 'deny',
      request_id: request.request_id,
      capability_key: request.capability_key,
      actor_user_id: request.actor_user_id,
      organization_id: request.organization_id,
      reasons: [reason],
      checks: [this.check(checkKey, 'failed', reason)],
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

  private approvalRequired(
    request: GatekeeperRequest,
    code: string,
    message: string,
    evidenceKey: string,
    evidenceLabel: string,
    approvalChainKey: string,
  ): GatekeeperDecisionResult {
    const reason = this.reason(code, message, 'warning');
    const evidenceRequirement = {
      evidence_key: evidenceKey,
      label: evidenceLabel,
      required: true,
    };

    return {
      decision: 'APPROVAL_REQUIRED',
      request_id: request.request_id,
      capability_key: request.capability_key,
      actor_user_id: request.actor_user_id,
      organization_id: request.organization_id,
      reasons: [reason],
      checks: [
        {
          check_key: code,
          status: 'warning',
          reason,
          evidence_required: [evidenceRequirement],
          evidence_present: [],
        },
      ],
      required_evidence: [evidenceRequirement],
      missing_evidence: [evidenceKey],
      approval_chain_key: approvalChainKey,
      approval_request_id: `approval_${request.request_id}`,
      reauth_required: false,
      expires_at: null,
    };
  }

  private stopForReview(request: GatekeeperRequest, code: string, message: string): GatekeeperDecisionResult {
    const reason = this.reason(code, message, 'error');
    const evidenceRequirement = {
      evidence_key: 'gatekeeper.platform-architect.review',
      label: 'Platform architect review',
      required: true,
    };

    return {
      decision: 'STOP_FOR_REVIEW',
      request_id: request.request_id,
      capability_key: request.capability_key,
      actor_user_id: request.actor_user_id,
      organization_id: request.organization_id,
      reasons: [reason],
      checks: [
        {
          check_key: code,
          status: 'failed',
          reason,
          evidence_required: [evidenceRequirement],
          evidence_present: [],
        },
      ],
      required_evidence: [evidenceRequirement],
      missing_evidence: ['gatekeeper.platform-architect.review'],
      reauth_required: false,
      expires_at: null,
    };
  }

  private evaluateMigrationRollbackRisk(request: GatekeeperRequest): GatekeeperDecisionResult | null {
    const riskSurface = this.payloadString(request.payload, 'risk_surface');
    const migrationRisk = this.payloadString(request.payload, 'migration_risk');
    const rollbackRisk = this.payloadString(request.payload, 'rollback_risk');
    const actionKey = this.payloadString(request.payload, 'action_key');
    const isMigrationRisk =
      riskSurface === 'migration' ||
      migrationRisk !== null ||
      actionKey?.includes('migration') === true;
    const isRollbackRisk =
      riskSurface === 'rollback' ||
      rollbackRisk !== null ||
      actionKey?.includes('rollback') === true;

    if (!isMigrationRisk && !isRollbackRisk) {
      return null;
    }

    if (
      this.payloadBoolean(request.payload, 'module_override_requested') === true ||
      this.payloadBoolean(request.payload, 'tenant_admin_override_requested') === true ||
      this.payloadBoolean(request.payload, 'automation_override_requested') === true ||
      this.payloadBoolean(request.payload, 'non_architect_override_requested') === true
    ) {
      return this.stopForReview(
        request,
        'gatekeeper.migration.override-stop-for-review',
        'Gatekeeper requires platform architect review for migration or rollback bypass attempts.',
      );
    }

    if (
      this.payloadBoolean(request.payload, 'policy_violation') === true ||
      migrationRisk === 'policy_violation' ||
      rollbackRisk === 'policy_violation'
    ) {
      return this.deny(
        request,
        'gatekeeper.risk.policy-violation',
        'Gatekeeper denied migration or rollback risk input that violates platform policy.',
      );
    }

    if (
      migrationRisk === 'destructive' ||
      migrationRisk === 'unsafe' ||
      migrationRisk === 'critical' ||
      this.payloadBoolean(request.payload, 'destructive_migration') === true ||
      this.payloadBoolean(request.payload, 'tenant_isolation_risk') === true ||
      this.payloadBoolean(request.payload, 'secret_risk') === true ||
      this.payloadBoolean(request.payload, 'boundary_unclear') === true
    ) {
      return this.stopForReview(
        request,
        'gatekeeper.migration.stop-for-review',
        'Gatekeeper requires platform architect review for destructive, unsafe, or unclear migration risk.',
      );
    }

    if (
      rollbackRisk === 'unsafe' ||
      rollbackRisk === 'critical' ||
      this.payloadBoolean(request.payload, 'rollback_integrity_risk') === true ||
      this.payloadBoolean(request.payload, 'rollback_boundary_unclear') === true
    ) {
      return this.stopForReview(
        request,
        'gatekeeper.rollback.stop-for-review',
        'Gatekeeper requires platform architect review for unsafe or unclear rollback risk.',
      );
    }

    if (
      migrationRisk === 'invalid' ||
      migrationRisk === 'validation_failed' ||
      this.payloadBoolean(request.payload, 'migration_validation_passed') === false
    ) {
      return this.deny(
        request,
        'gatekeeper.migration.validation-failed',
        'Gatekeeper denied migration input that failed safety validation.',
        'gatekeeper.migration.validation',
      );
    }

    if (
      migrationRisk === 'approval_required' ||
      this.payloadBoolean(request.payload, 'migration_approval_required') === true
    ) {
      return this.approvalRequired(
        request,
        'gatekeeper.migration.approval-required',
        'Gatekeeper requires approved migration evidence before this change can continue.',
        'gatekeeper.migration.evidence',
        'Migration safety evidence',
        'gatekeeper.migration.approval',
      );
    }

    if (
      rollbackRisk === 'invalid_evidence' ||
      this.payloadBoolean(request.payload, 'rollback_validation_passed') === false
    ) {
      return this.deny(
        request,
        'gatekeeper.rollback.evidence-invalid',
        'Gatekeeper denied rollback input with invalid rollback evidence.',
        'gatekeeper.rollback.evidence-valid',
      );
    }

    if (
      rollbackRisk === 'missing_evidence' ||
      this.payloadBoolean(request.payload, 'rollback_evidence_present') === false
    ) {
      return this.approvalRequired(
        request,
        'gatekeeper.rollback.approval-required',
        'Gatekeeper requires rollback evidence approval before this change can continue.',
        'gatekeeper.rollback.evidence',
        'Rollback evidence',
        'gatekeeper.rollback.approval',
      );
    }

    return null;
  }

  private payloadString(payload: Record<string, unknown>, key: string): string | null {
    const value = payload[key];
    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private payloadBoolean(payload: Record<string, unknown>, key: string): boolean | null {
    const value = payload[key];
    return typeof value === 'boolean' ? value : null;
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

  constructor(
    @Optional() private readonly prisma?: PrismaService,
    @Optional() private readonly auditLogService?: AuditLogService,
    @Optional() private readonly eventOutboxService?: EventOutboxService,
  ) {}

  async requireAllow(input: GatekeeperPreflightInput): Promise<GatekeeperDecisionResult> {
    let contracts: GatekeeperContractsModule;
    try {
      contracts = await loadGatekeeperContracts();
    } catch {
      throw new ForbiddenException('Gatekeeper contract helpers are unavailable');
    }

    this.assertTenantPayloadBoundary(input.organization_id, input.payload ?? {});

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
    const normalizedDecision = this.normalizeDecisionResult(decision, normalizedOutcome);
    const enforcedDecision = this.enforceStopForReviewImmutability(normalizedDecision, normalizedOutcome);
    await this.recordDecisionIfConfigured(request, enforcedDecision, normalizedOutcome);
    await this.recordAuditIfConfigured(request, enforcedDecision, normalizedOutcome);
    await this.recordEventEnvelopeIfConfigured(request, enforcedDecision, normalizedOutcome);

    if (normalizedOutcome === 'STOP_FOR_REVIEW') {
      throw new ServiceUnavailableException('Gatekeeper stopped the mutation for platform review');
    }

    if (normalizedOutcome !== 'ALLOW') {
      throw new ForbiddenException('Gatekeeper did not allow the mutation');
    }

    return enforcedDecision;
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

  private async recordAuditIfConfigured(
    request: GatekeeperRequest,
    decision: GatekeeperDecisionResult,
    outcome: GatekeeperCanonicalOutcome,
  ) {
    if (!this.prisma || !this.auditLogService) {
      return;
    }

    await this.auditLogService.writeAuditLog(this.prisma, {
      organization_id: request.organization_id,
      actor_user_id: request.actor_user_id,
      action_key: 'gatekeeper.preflight.decision.recorded',
      entity_type: 'gatekeeper.decision',
      entity_id: request.request_id,
      metadata: {
        request_id: request.request_id,
        capability_key: request.capability_key,
        module_key: request.module_key,
        entity_type: request.entity_type,
        entity_id: request.entity_id,
        scope_unit_id: request.scope_unit_id,
        action_key: this.requiredPayloadString(request.payload, 'action_key'),
        outcome,
        reason_codes: decision.reasons.map((reason) => reason.code),
        check_keys: decision.checks.map((check) => check.check_key),
        required_evidence: decision.required_evidence,
        missing_evidence: decision.missing_evidence,
        evidence_record: this.buildEvidenceAuditRecord(decision),
        approval_chain_key: decision.approval_chain_key ?? null,
        approval_request_id: decision.approval_request_id ?? null,
        correlation_id: this.optionalPayloadString(request.payload, 'correlation_id'),
        evidence_intent: this.buildPreEnvelopeEvidenceIntent(request, decision, outcome),
        audit_completeness: this.buildAuditCompletenessRecord(request, decision, outcome),
      },
    });
  }

  private async recordEventEnvelopeIfConfigured(
    request: GatekeeperRequest,
    decision: GatekeeperDecisionResult,
    outcome: GatekeeperCanonicalOutcome,
  ) {
    if (!this.prisma || !this.eventOutboxService) {
      return;
    }

    const correlationId = this.optionalPayloadString(request.payload, 'correlation_id') ?? request.request_id;

    await this.eventOutboxService.recordEvent(this.prisma, {
      organization_id: request.organization_id,
      event_type: 'gatekeeper.preflight.decided',
      version: '0.1.0',
      idempotency_key: `gatekeeper.preflight.decided.${request.organization_id}.${request.request_id}`,
      source_module: 'gatekeeper',
      subject: {
        entity_type: 'gatekeeper.decision',
        entity_id: request.request_id,
      },
      occurred_at: new Date(request.requested_at),
      payload: {
        request_id: request.request_id,
        capability_key: request.capability_key,
        module_key: request.module_key,
        entity_type: request.entity_type,
        entity_id: request.entity_id,
        scope_unit_id: request.scope_unit_id,
        action_key: this.requiredPayloadString(request.payload, 'action_key'),
        outcome,
        reason_codes: decision.reasons.map((reason) => reason.code),
        check_keys: decision.checks.map((check) => check.check_key),
        required_evidence: decision.required_evidence,
        missing_evidence: decision.missing_evidence,
        correlation_id: correlationId,
      },
      compliance: {
        privacy_class: 'restricted',
        retention_class: 'audit',
        redaction_policy: 'strict',
        audit_required: true,
        replay_allowed: false,
      },
      context: {
        actor_user_id: request.actor_user_id,
        correlation_id: correlationId,
        request_id: request.request_id,
      },
      requires_compliance_context: true,
    });
  }

  private buildEvidenceAuditRecord(decision: GatekeeperDecisionResult) {
    return {
      record_key: 'gatekeeper.evidence.audit-record',
      required_evidence_keys: decision.required_evidence.map((evidence) => evidence.evidence_key),
      missing_evidence_keys: decision.missing_evidence,
      evidence_present_keys: decision.checks.flatMap((check) => check.evidence_present),
      check_keys: decision.checks.map((check) => check.check_key),
      approval_chain_key: decision.approval_chain_key ?? null,
      approval_request_id: decision.approval_request_id ?? null,
    };
  }

  private buildAuditCompletenessRecord(
    request: GatekeeperRequest,
    decision: GatekeeperDecisionResult,
    outcome: GatekeeperCanonicalOutcome,
  ) {
    const correlationId = this.optionalPayloadString(request.payload, 'correlation_id');

    return {
      record_key: 'gatekeeper.audit-completeness',
      decision_recorded: true,
      audit_recorded: true,
      event_envelope_configured: this.eventOutboxService !== undefined,
      organization_id_present: request.organization_id.trim().length > 0,
      actor_user_id_present: request.actor_user_id.trim().length > 0,
      request_id_present: request.request_id.trim().length > 0,
      correlation_id_present: correlationId !== null,
      action_key_present: this.optionalPayloadString(request.payload, 'action_key') !== null,
      outcome_present: outcome.trim().length > 0,
      reasons_recorded: decision.reasons.length,
      checks_recorded: decision.checks.length,
      required_evidence_recorded: decision.required_evidence.length,
      missing_evidence_recorded: decision.missing_evidence.length,
    };
  }

  private buildPreEnvelopeEvidenceIntent(
    request: GatekeeperRequest,
    decision: GatekeeperDecisionResult,
    outcome: GatekeeperCanonicalOutcome,
  ) {
    return {
      intent_key: 'gatekeeper.pre-envelope.evidence-intent',
      event_envelope_status: 'pre-envelope-intent-only',
      producer: 'gatekeeper.preflight',
      request_id: request.request_id,
      organization_id: request.organization_id,
      actor_user_id: request.actor_user_id,
      outcome,
      required_evidence_keys: decision.required_evidence.map((evidence) => evidence.evidence_key),
      missing_evidence_keys: decision.missing_evidence,
      check_keys: decision.checks.map((check) => check.check_key),
      evidence_present_keys: decision.checks.flatMap((check) => check.evidence_present),
      correlation_id: this.optionalPayloadString(request.payload, 'correlation_id'),
    };
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

  private normalizeDecisionResult(
    decision: GatekeeperDecisionResult,
    outcome: GatekeeperCanonicalOutcome,
  ): GatekeeperDecisionResult {
    if (decision.decision === outcome) {
      return decision;
    }

    return {
      ...decision,
      decision: outcome,
    };
  }

  private enforceStopForReviewImmutability(
    decision: GatekeeperDecisionResult,
    outcome: GatekeeperCanonicalOutcome,
  ): GatekeeperDecisionResult {
    if (outcome !== 'STOP_FOR_REVIEW') {
      return decision;
    }

    const platformArchitectEvidence = {
      evidence_key: 'gatekeeper.platform-architect.review',
      label: 'Platform architect review',
      required: true,
    };
    const requiredEvidence = decision.required_evidence.some(
      (evidence) => evidence.evidence_key === platformArchitectEvidence.evidence_key,
    )
      ? decision.required_evidence
      : [...decision.required_evidence, platformArchitectEvidence];
    const missingEvidence = decision.missing_evidence.includes(platformArchitectEvidence.evidence_key)
      ? decision.missing_evidence
      : [...decision.missing_evidence, platformArchitectEvidence.evidence_key];
    const {
      approval_chain_key: _approvalChainKey,
      approval_request_id: _approvalRequestId,
      decision_token: _decisionToken,
      ...immutableDecision
    } = decision;

    return {
      ...immutableDecision,
      decision: 'STOP_FOR_REVIEW',
      required_evidence: requiredEvidence,
      missing_evidence: missingEvidence,
      reauth_required: false,
      expires_at: null,
    };
  }

  private buildRequest(input: GatekeeperPreflightInput): unknown {
    const capabilityKey = input.capability_key ?? ACCESS_POLICY_MANAGE_CAPABILITY_KEY;
    const capabilityPolicy = CAPABILITY_POLICIES[capabilityKey];
    const moduleKey = input.module_key ?? capabilityPolicy?.module_key ?? ACCESS_MODULE_KEY;
    const payload = {
      action_key: input.action_key,
      ...(input.payload ?? {}),
    };
    this.assertTenantPayloadBoundary(input.organization_id, payload);

    return {
      request_id: `gk_req_${randomUUID()}`,
      organization_id: input.organization_id,
      actor_user_id: input.actor_user_id,
      capability_key: capabilityKey,
      module_key: moduleKey,
      entity_type: input.entity_type,
      entity_id: input.entity_id,
      scope_unit_id: input.scope_unit_id ?? null,
      payload,
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

  private assertTenantPayloadBoundary(organizationId: string, payload: Record<string, unknown>): void {
    for (const key of ['organization_id', 'target_organization_id', 'tenant_organization_id']) {
      const value = payload[key];
      if (value === undefined || value === null) {
        continue;
      }

      if (typeof value !== 'string' || value.trim() !== organizationId) {
        throw new ForbiddenException('Gatekeeper payload tenant boundary mismatch');
      }
    }
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
    return this.payloadString(payload, key);
  }

  private payloadString(payload: Record<string, unknown>, key: string): string | null {
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
