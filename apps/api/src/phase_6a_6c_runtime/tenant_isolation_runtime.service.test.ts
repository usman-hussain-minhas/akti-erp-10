import { strict as assert } from 'node:assert';

import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { PhaseRuntimeEvidenceService } from './phase_runtime_evidence.service';
import { TenantIsolationRuntimeService, type TenantIsolationRuntimeInput } from './tenant_isolation_runtime.service';

const service = new TenantIsolationRuntimeService();
const evidenceService = new PhaseRuntimeEvidenceService();

function makeInput(overrides: Partial<TenantIsolationRuntimeInput> = {}): TenantIsolationRuntimeInput {
  return {
    request_organization_id: 'org-stage2-tenant-a',
    resource_organization_id: 'org-stage2-tenant-a',
    actor_user_id: 'user-stage2-tenant-a',
    capability_key: 'phase6c.structured-agreements',
    module_key: 'phase6c.runtime',
    action_key: 'phase6c.structured-agreement.read',
    entity_type: 'phase6c.structured-agreement',
    entity_id: 'agreement-stage2-tenant-a',
    access_kind: 'read',
    correlation_id: 'corr-stage2-tenant-isolation',
    ...overrides,
  };
}

const sameTenantResult = service.evaluateAccess(makeInput());
assert.equal(sameTenantResult.decision, 'ALLOW');
assert.equal(sameTenantResult.runtime_access_allowed, true);
assert.equal(sameTenantResult.cross_tenant, false);
assert.equal(sameTenantResult.http_status, 200);
assert.equal(sameTenantResult.reason, 'same_tenant_runtime_access_allowed');
assert.equal(sameTenantResult.gatekeeper_required, true);
assert.equal(sameTenantResult.audit_evidence_required, true);
assert.match(sameTenantResult.decision_hash, /^[a-f0-9]{64}$/);
assert.match(sameTenantResult.decision_id, /^phase6_tenant_isolation_[a-f0-9]{16}$/);

const sameTenantAssertion = service.assertAccessAllowed(makeInput({ access_kind: 'write' }));
assert.equal(sameTenantAssertion.decision, 'ALLOW');
assert.equal(sameTenantAssertion.access_kind, 'write');

const crossTenantResult = service.evaluateAccess(
  makeInput({
    resource_organization_id: 'org-stage2-tenant-b',
    action_key: 'phase6c.structured-agreement.write',
    access_kind: 'write',
  }),
);
assert.equal(crossTenantResult.decision, 'DENY');
assert.equal(crossTenantResult.runtime_access_allowed, false);
assert.equal(crossTenantResult.cross_tenant, true);
assert.equal(crossTenantResult.http_status, 403);
assert.equal(crossTenantResult.reason, 'cross_tenant_runtime_access_denied');

assert.throws(
  () =>
    service.assertAccessAllowed(
      makeInput({
        resource_organization_id: 'org-stage2-tenant-b',
      }),
    ),
  ForbiddenException,
);

const crossTenantEvidenceInput = service.buildEvidenceInput(crossTenantResult);
assert.equal(crossTenantEvidenceInput.organization_id, 'org-stage2-tenant-a');
assert.equal(crossTenantEvidenceInput.gatekeeper_decision, 'DENY');
assert.equal(crossTenantEvidenceInput.runtime_outcome, 'denied');
assert.equal(crossTenantEvidenceInput.missing_evidence.includes('phase6.runtime.cross-tenant-denial.proof'), true);

const evidenceRecord = evidenceService.buildEvidenceRecord(crossTenantEvidenceInput);
assert.equal(evidenceRecord.gatekeeper_decision, 'DENY');
assert.equal(evidenceRecord.runtime_outcome, 'denied');
assert.equal(evidenceRecord.evidence_completeness.tenant_present, true);
assert.equal(evidenceRecord.evidence_completeness.missing_evidence_count, 1);

assert.throws(
  () =>
    service.evaluateAccess(
      makeInput({
        request_organization_id: '',
      }),
    ),
  BadRequestException,
);

assert.throws(
  () =>
    service.evaluateAccess(
      makeInput({
        access_kind: 'delete' as TenantIsolationRuntimeInput['access_kind'],
      }),
    ),
  BadRequestException,
);

console.log('Phase 6A-6C tenant isolation runtime proof checks passed');
