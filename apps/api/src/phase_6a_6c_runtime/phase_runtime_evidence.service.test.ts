import { strict as assert } from 'node:assert';

import { BadRequestException } from '@nestjs/common';

import { PhaseRuntimeEvidenceService, type PhaseRuntimeEvidenceInput } from './phase_runtime_evidence.service';

function makeInput(overrides: Partial<PhaseRuntimeEvidenceInput> = {}): PhaseRuntimeEvidenceInput {
  return {
    organization_id: 'org-stage2-evidence',
    actor_user_id: 'user-stage2-evidence',
    capability_key: 'phase6a.tiered-verification',
    module_key: 'phase6a.runtime',
    action_key: 'phase6a.tiered-verification.preflight',
    entity_type: 'phase6a.runtime-operation',
    entity_id: 'operation-stage2-evidence',
    gatekeeper_decision: 'ALLOW',
    correlation_id: 'corr-stage2-evidence',
    foundry_activation_state: 'active',
    runtime_outcome: 'allowed',
    reason_codes: [],
    check_keys: ['gatekeeper.phase1.preflight'],
    required_evidence: [],
    missing_evidence: [],
    ...overrides,
  };
}

const auditWrites: unknown[] = [];
const fakeDb = {
  user: {
    findFirst: async ({ where }: { where: { organization_id: string; id: string } }) =>
      where.organization_id === 'org-stage2-evidence' && where.id === 'user-stage2-evidence'
        ? { id: where.id }
        : null,
  },
  auditLog: {
    create: async ({ data }: { data: unknown }) => {
      auditWrites.push(data);
      return data;
    },
  },
};

const service = new PhaseRuntimeEvidenceService();

const allowedEvidence = service.buildEvidenceRecord(makeInput());
assert.equal(allowedEvidence.organization_id, 'org-stage2-evidence');
assert.equal(allowedEvidence.actor_user_id, 'user-stage2-evidence');
assert.equal(allowedEvidence.gatekeeper_decision, 'ALLOW');
assert.equal(allowedEvidence.runtime_outcome, 'allowed');
assert.equal(allowedEvidence.foundry_activation_state, 'active');
assert.equal(allowedEvidence.audit_action_key, 'phase6.runtime.operation.evidence-recorded');
assert.equal(allowedEvidence.evidence_completeness.tenant_present, true);
assert.equal(allowedEvidence.evidence_completeness.actor_present, true);
assert.equal(allowedEvidence.evidence_completeness.capability_present, true);
assert.equal(allowedEvidence.evidence_completeness.decision_present, true);
assert.equal(allowedEvidence.evidence_completeness.correlation_present, true);
assert.match(allowedEvidence.evidence_hash, /^[a-f0-9]{64}$/);
assert.match(allowedEvidence.evidence_id, /^phase6_runtime_evidence_[a-f0-9]{16}$/);

const deniedEvidence = service.buildEvidenceRecord(
  makeInput({
    gatekeeper_decision: 'DENY',
    foundry_activation_state: 'inactive',
    runtime_outcome: 'denied',
    reason_codes: ['gatekeeper.reauth.unsatisfied'],
    check_keys: ['gatekeeper.phase1.preflight'],
    missing_evidence: ['gatekeeper.runtime-denial.reason'],
  }),
);
assert.equal(deniedEvidence.gatekeeper_decision, 'DENY');
assert.equal(deniedEvidence.runtime_outcome, 'denied');
assert.equal(deniedEvidence.evidence_completeness.reason_count, 1);
assert.equal(deniedEvidence.evidence_completeness.missing_evidence_count, 1);

assert.throws(
  () =>
    service.buildEvidenceRecord(
      makeInput({
        gatekeeper_decision: 'DENY',
        runtime_outcome: 'allowed',
      }),
    ),
  BadRequestException,
);

assert.throws(
  () =>
    service.buildEvidenceRecord(
      makeInput({
        correlation_id: '',
      }),
    ),
  BadRequestException,
);

async function main() {
  const writtenEvidence = await service.writeRuntimeEvidenceAudit(
    fakeDb as unknown as Parameters<PhaseRuntimeEvidenceService['writeRuntimeEvidenceAudit']>[0],
    makeInput(),
  );
  assert.equal(writtenEvidence.audit_written, true);
  assert.equal(auditWrites.length, 1);
  assert.deepEqual(auditWrites[0], {
    organization_id: 'org-stage2-evidence',
    actor_user_id: 'user-stage2-evidence',
    action_key: 'phase6.runtime.operation.evidence-recorded',
    entity_type: 'phase6a.runtime-operation',
    entity_id: 'operation-stage2-evidence',
    metadata: writtenEvidence.audit_metadata,
  });

  console.log('Phase 6A-6C runtime evidence spine checks passed');
}

void main();
