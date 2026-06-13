import { createHash } from 'node:crypto';

import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';

import { type PhaseRuntimeEvidenceInput } from './phase_runtime_evidence.service';

export type TenantIsolationRuntimeAccessKind = 'read' | 'write';
export type TenantIsolationRuntimeDecision = 'ALLOW' | 'DENY';

export type TenantIsolationRuntimeInput = {
  request_organization_id: string;
  resource_organization_id: string;
  actor_user_id: string;
  capability_key: string;
  module_key: string;
  action_key: string;
  entity_type: string;
  entity_id: string;
  access_kind: TenantIsolationRuntimeAccessKind;
  correlation_id: string;
};

export type TenantIsolationRuntimeResult = {
  decision_id: string;
  decision_hash: string;
  decision: TenantIsolationRuntimeDecision;
  request_organization_id: string;
  resource_organization_id: string;
  actor_user_id: string;
  capability_key: string;
  module_key: string;
  action_key: string;
  entity_type: string;
  entity_id: string;
  access_kind: TenantIsolationRuntimeAccessKind;
  correlation_id: string;
  cross_tenant: boolean;
  runtime_access_allowed: boolean;
  http_status: 200 | 403;
  gatekeeper_required: true;
  audit_evidence_required: true;
  reason: 'same_tenant_runtime_access_allowed' | 'cross_tenant_runtime_access_denied';
};

@Injectable()
export class TenantIsolationRuntimeService {
  evaluateAccess(input: TenantIsolationRuntimeInput): TenantIsolationRuntimeResult {
    const normalized = normalizeInput(input);
    const crossTenant = normalized.request_organization_id !== normalized.resource_organization_id;
    const decisionHash = createHash('sha256')
      .update(stableJsonStringify(normalized))
      .digest('hex');

    return {
      decision_id: `phase6_tenant_isolation_${decisionHash.slice(0, 16)}`,
      decision_hash: decisionHash,
      decision: crossTenant ? 'DENY' : 'ALLOW',
      request_organization_id: normalized.request_organization_id,
      resource_organization_id: normalized.resource_organization_id,
      actor_user_id: normalized.actor_user_id,
      capability_key: normalized.capability_key,
      module_key: normalized.module_key,
      action_key: normalized.action_key,
      entity_type: normalized.entity_type,
      entity_id: normalized.entity_id,
      access_kind: normalized.access_kind,
      correlation_id: normalized.correlation_id,
      cross_tenant: crossTenant,
      runtime_access_allowed: !crossTenant,
      http_status: crossTenant ? 403 : 200,
      gatekeeper_required: true,
      audit_evidence_required: true,
      reason: crossTenant ? 'cross_tenant_runtime_access_denied' : 'same_tenant_runtime_access_allowed',
    };
  }

  assertAccessAllowed(input: TenantIsolationRuntimeInput): TenantIsolationRuntimeResult {
    const result = this.evaluateAccess(input);
    if (!result.runtime_access_allowed) {
      throw new ForbiddenException('Phase 6A-6C runtime access denied by tenant isolation');
    }

    return result;
  }

  buildEvidenceInput(result: TenantIsolationRuntimeResult): PhaseRuntimeEvidenceInput {
    return {
      organization_id: result.request_organization_id,
      actor_user_id: result.actor_user_id,
      capability_key: result.capability_key,
      module_key: result.module_key,
      action_key: result.action_key,
      entity_type: result.entity_type,
      entity_id: result.entity_id,
      gatekeeper_decision: result.decision,
      correlation_id: result.correlation_id,
      foundry_activation_state: 'active',
      runtime_outcome: result.runtime_access_allowed ? 'allowed' : 'denied',
      reason_codes: [result.reason],
      check_keys: ['phase6.runtime.tenant-isolation'],
      required_evidence: ['phase6.runtime.tenant-isolation.proof'],
      missing_evidence: result.runtime_access_allowed ? [] : ['phase6.runtime.cross-tenant-denial.proof'],
    };
  }
}

function normalizeInput(input: TenantIsolationRuntimeInput): TenantIsolationRuntimeInput {
  return {
    request_organization_id: requireNonEmptyString(input.request_organization_id, 'request_organization_id'),
    resource_organization_id: requireNonEmptyString(input.resource_organization_id, 'resource_organization_id'),
    actor_user_id: requireNonEmptyString(input.actor_user_id, 'actor_user_id'),
    capability_key: requireNonEmptyString(input.capability_key, 'capability_key'),
    module_key: requireNonEmptyString(input.module_key, 'module_key'),
    action_key: requireNonEmptyString(input.action_key, 'action_key'),
    entity_type: requireNonEmptyString(input.entity_type, 'entity_type'),
    entity_id: requireNonEmptyString(input.entity_id, 'entity_id'),
    access_kind: requireAccessKind(input.access_kind),
    correlation_id: requireNonEmptyString(input.correlation_id, 'correlation_id'),
  };
}

function requireNonEmptyString(input: unknown, field: string): string {
  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new BadRequestException(`Phase runtime tenant isolation ${field} must be a non-empty string`);
  }

  return input.trim();
}

function requireAccessKind(input: unknown): TenantIsolationRuntimeAccessKind {
  if (input === 'read' || input === 'write') {
    return input;
  }

  throw new BadRequestException('Phase runtime tenant isolation access_kind is invalid');
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
