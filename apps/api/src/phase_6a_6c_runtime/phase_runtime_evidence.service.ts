import { createHash } from 'node:crypto';

import { BadRequestException, Injectable } from '@nestjs/common';

import { type Prisma } from '../prisma/prisma-client';
import { AuditLogService } from '../platform-observability/audit-log.service';

type PhaseRuntimeAuditDbClient = Parameters<AuditLogService['writeAuditLog']>[0];

export type PhaseRuntimeGatekeeperDecision = 'ALLOW' | 'DENY' | 'APPROVAL_REQUIRED' | 'STOP_FOR_REVIEW';

export type PhaseRuntimeEvidenceInput = {
  organization_id: string;
  actor_user_id: string;
  capability_key: string;
  module_key: string;
  action_key: string;
  entity_type: string;
  entity_id: string;
  gatekeeper_decision: PhaseRuntimeGatekeeperDecision;
  correlation_id: string;
  foundry_activation_state: 'active' | 'inactive';
  runtime_outcome: 'allowed' | 'denied' | 'approval_required' | 'stopped_for_review';
  reason_codes: readonly string[];
  check_keys: readonly string[];
  required_evidence: readonly string[];
  missing_evidence: readonly string[];
};

export type PhaseRuntimeEvidenceRecord = {
  evidence_id: string;
  evidence_hash: string;
  organization_id: string;
  actor_user_id: string;
  capability_key: string;
  module_key: string;
  action_key: string;
  entity_type: string;
  entity_id: string;
  gatekeeper_decision: PhaseRuntimeGatekeeperDecision;
  foundry_activation_state: 'active' | 'inactive';
  runtime_outcome: 'allowed' | 'denied' | 'approval_required' | 'stopped_for_review';
  correlation_id: string;
  audit_action_key: 'phase6.runtime.operation.evidence-recorded';
  audit_metadata: Prisma.InputJsonValue;
  evidence_completeness: {
    tenant_present: true;
    actor_present: true;
    capability_present: true;
    decision_present: true;
    correlation_present: true;
    reason_count: number;
    check_count: number;
    missing_evidence_count: number;
  };
};

export type PhaseRuntimeAuditWriteReceipt = PhaseRuntimeEvidenceRecord & {
  audit_written: true;
};

@Injectable()
export class PhaseRuntimeEvidenceService {
  constructor(private readonly auditLogService = new AuditLogService()) {}

  buildEvidenceRecord(input: PhaseRuntimeEvidenceInput): PhaseRuntimeEvidenceRecord {
    const normalized = this.normalizeInput(input);
    const evidenceHash = createHash('sha256')
      .update(stableJsonStringify(normalized))
      .digest('hex');
    const auditMetadata = {
      organization_id: normalized.organization_id,
      actor_user_id: normalized.actor_user_id,
      capability_key: normalized.capability_key,
      module_key: normalized.module_key,
      action_key: normalized.action_key,
      entity_type: normalized.entity_type,
      entity_id: normalized.entity_id,
      gatekeeper_decision: normalized.gatekeeper_decision,
      foundry_activation_state: normalized.foundry_activation_state,
      runtime_outcome: normalized.runtime_outcome,
      correlation_id: normalized.correlation_id,
      reason_codes: normalized.reason_codes,
      check_keys: normalized.check_keys,
      required_evidence: normalized.required_evidence,
      missing_evidence: normalized.missing_evidence,
      evidence_hash: evidenceHash,
      evidence_source: 'phase_6a_6c_runtime_evidence_service',
    } satisfies Prisma.InputJsonObject;

    return {
      evidence_id: `phase6_runtime_evidence_${evidenceHash.slice(0, 16)}`,
      evidence_hash: evidenceHash,
      organization_id: normalized.organization_id,
      actor_user_id: normalized.actor_user_id,
      capability_key: normalized.capability_key,
      module_key: normalized.module_key,
      action_key: normalized.action_key,
      entity_type: normalized.entity_type,
      entity_id: normalized.entity_id,
      gatekeeper_decision: normalized.gatekeeper_decision,
      foundry_activation_state: normalized.foundry_activation_state,
      runtime_outcome: normalized.runtime_outcome,
      correlation_id: normalized.correlation_id,
      audit_action_key: 'phase6.runtime.operation.evidence-recorded',
      audit_metadata: auditMetadata,
      evidence_completeness: {
        tenant_present: true,
        actor_present: true,
        capability_present: true,
        decision_present: true,
        correlation_present: true,
        reason_count: normalized.reason_codes.length,
        check_count: normalized.check_keys.length,
        missing_evidence_count: normalized.missing_evidence.length,
      },
    };
  }

  async writeRuntimeEvidenceAudit(
    db: PhaseRuntimeAuditDbClient,
    input: PhaseRuntimeEvidenceInput,
  ): Promise<PhaseRuntimeAuditWriteReceipt> {
    const evidenceRecord = this.buildEvidenceRecord(input);

    await this.auditLogService.writeAuditLog(db, {
      organization_id: evidenceRecord.organization_id,
      actor_user_id: evidenceRecord.actor_user_id,
      action_key: evidenceRecord.audit_action_key,
      entity_type: evidenceRecord.entity_type,
      entity_id: evidenceRecord.entity_id,
      metadata: evidenceRecord.audit_metadata,
    });

    return {
      ...evidenceRecord,
      audit_written: true,
    };
  }

  private normalizeInput(input: PhaseRuntimeEvidenceInput): PhaseRuntimeEvidenceInput {
    const normalized: PhaseRuntimeEvidenceInput = {
      organization_id: requireNonEmptyString(input.organization_id, 'organization_id'),
      actor_user_id: requireNonEmptyString(input.actor_user_id, 'actor_user_id'),
      capability_key: requireNonEmptyString(input.capability_key, 'capability_key'),
      module_key: requireNonEmptyString(input.module_key, 'module_key'),
      action_key: requireNonEmptyString(input.action_key, 'action_key'),
      entity_type: requireNonEmptyString(input.entity_type, 'entity_type'),
      entity_id: requireNonEmptyString(input.entity_id, 'entity_id'),
      gatekeeper_decision: requireGatekeeperDecision(input.gatekeeper_decision),
      correlation_id: requireNonEmptyString(input.correlation_id, 'correlation_id'),
      foundry_activation_state: requireFoundryActivationState(input.foundry_activation_state),
      runtime_outcome: requireRuntimeOutcome(input.runtime_outcome),
      reason_codes: normalizeStringList(input.reason_codes, 'reason_codes'),
      check_keys: normalizeStringList(input.check_keys, 'check_keys'),
      required_evidence: normalizeStringList(input.required_evidence, 'required_evidence'),
      missing_evidence: normalizeStringList(input.missing_evidence, 'missing_evidence'),
    };

    assertDecisionOutcomeAlignment(normalized.gatekeeper_decision, normalized.runtime_outcome);

    return normalized;
  }
}

function requireNonEmptyString(input: unknown, field: string): string {
  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new BadRequestException(`Phase runtime evidence ${field} must be a non-empty string`);
  }

  return input.trim();
}

function normalizeStringList(input: readonly string[], field: string): string[] {
  if (!Array.isArray(input)) {
    throw new BadRequestException(`Phase runtime evidence ${field} must be an array`);
  }

  return [...new Set(input.map((item) => requireNonEmptyString(item, field)))];
}

function requireGatekeeperDecision(input: unknown): PhaseRuntimeGatekeeperDecision {
  if (input === 'ALLOW' || input === 'DENY' || input === 'APPROVAL_REQUIRED' || input === 'STOP_FOR_REVIEW') {
    return input;
  }

  throw new BadRequestException('Phase runtime evidence gatekeeper_decision is invalid');
}

function requireFoundryActivationState(input: unknown): PhaseRuntimeEvidenceInput['foundry_activation_state'] {
  if (input === 'active' || input === 'inactive') {
    return input;
  }

  throw new BadRequestException('Phase runtime evidence foundry_activation_state is invalid');
}

function requireRuntimeOutcome(input: unknown): PhaseRuntimeEvidenceInput['runtime_outcome'] {
  if (input === 'allowed' || input === 'denied' || input === 'approval_required' || input === 'stopped_for_review') {
    return input;
  }

  throw new BadRequestException('Phase runtime evidence runtime_outcome is invalid');
}

function assertDecisionOutcomeAlignment(
  decision: PhaseRuntimeGatekeeperDecision,
  outcome: PhaseRuntimeEvidenceInput['runtime_outcome'],
): void {
  const expectedOutcomeByDecision = {
    ALLOW: 'allowed',
    DENY: 'denied',
    APPROVAL_REQUIRED: 'approval_required',
    STOP_FOR_REVIEW: 'stopped_for_review',
  } satisfies Record<PhaseRuntimeGatekeeperDecision, PhaseRuntimeEvidenceInput['runtime_outcome']>;

  if (expectedOutcomeByDecision[decision] !== outcome) {
    throw new BadRequestException('Phase runtime evidence gatekeeper_decision and runtime_outcome are inconsistent');
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
