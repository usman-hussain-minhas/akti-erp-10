import assert from 'node:assert/strict';

import { evaluateAccessProvisioningGatekeeperEventRuntime, type AccessProvisioningGatekeeperEventInput } from './access_provisioning_gatekeeper_event.service';

const baseInput: AccessProvisioningGatekeeperEventInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_access_provisioning_gatekeeper_event',
  source_record_ref: 'access_provisioning_001',
  employee_ref: 'employee_123',
  applicant_ref: 'applicant_123',
  offer_ref: 'offer_123',
  requested_by_user_id: 'user_phase_6c_recruiter',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  gatekeeper_policy_ref: 'gatekeeper_policy:onboarding_access_provisioning',
  event_bus_topic: 'phase_6c.access_provisioning.requested',
  grants: [
    { grant_ref: 'grant_role_employee', grant_kind: 'ROLE', target_ref: 'role:employee', reason: 'accepted offer onboarding' },
    { grant_ref: 'grant_module_workspace', grant_kind: 'MODULE_MEMBERSHIP', target_ref: 'module:workspace', reason: 'workspace onboarding' },
  ],
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateAccessProvisioningGatekeeperEventRuntime(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_018_access_provisioning_gatekeeper_event');
assert.equal(receipt.component_id, '6C.02');
assert.equal(receipt.component_slug, 'hr_recruitment_and_onboarding_pipeline');
assert.equal(receipt.model_name, 'Phase6CAccessProvisioningGatekeeperEvent');
assert.equal(receipt.event_name, 'phase_6c.hr_recruitment_and_onboarding_pipeline.access_provisioning_gatekeeper_event.requested');
assert.equal(receipt.runtime_status, 'ACCESS_PROVISIONING_GATEKEEPER_EVENT_READY');
assert.equal(receipt.gatekeeper_required, true);
assert.equal(receipt.gatekeeper_bypass_allowed, false);
assert.equal(receipt.direct_access_grant_allowed, false);
assert.equal(receipt.access_core_mutation_executed, false);
assert.equal(receipt.grant_count, 2);
assert.equal(receipt.gatekeeper_payload.required_outcome, 'ALLOW_OR_APPROVAL_REQUIRED');
assert.equal(receipt.gatekeeper_payload.grants[1]?.target_ref, 'module:workspace');
assert.deepEqual(receipt.decision_refs, ['6C-RECRUIT-010']);
assert.match(receipt.access_provisioning_gatekeeper_event_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateAccessProvisioningGatekeeperEventRuntime(baseInput);
assert.equal(repeatedReceipt.access_provisioning_gatekeeper_event_evidence_digest, receipt.access_provisioning_gatekeeper_event_evidence_digest);

assert.throws(() => evaluateAccessProvisioningGatekeeperEventRuntime({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateAccessProvisioningGatekeeperEventRuntime({ ...baseInput, evaluated_at: 'not-a-date' }), /valid ISO-compatible timestamp/);
assert.throws(() => evaluateAccessProvisioningGatekeeperEventRuntime({ ...baseInput, gatekeeper_policy_ref: 'policy:wrong' }), /must identify a Gatekeeper policy/);
assert.throws(() => evaluateAccessProvisioningGatekeeperEventRuntime({ ...baseInput, event_bus_topic: 'access.requested' }), /Phase 6C access provisioning namespace/);
assert.throws(() => evaluateAccessProvisioningGatekeeperEventRuntime({ ...baseInput, grants: [] }), /at least one access provisioning grant request/);
assert.throws(() => evaluateAccessProvisioningGatekeeperEventRuntime({
  ...baseInput,
  grants: [baseInput.grants[0]!, { ...baseInput.grants[1]!, grant_ref: baseInput.grants[0]!.grant_ref }],
}), /grant_ref must be unique/);
assert.throws(() => evaluateAccessProvisioningGatekeeperEventRuntime({
  ...baseInput,
  grants: [{ ...baseInput.grants[0]!, grant_kind: 'SUPERPOWER' as never }],
}), /grant_kind is not supported/);
assert.throws(() => evaluateAccessProvisioningGatekeeperEventRuntime({
  ...baseInput,
  grants: [{ ...baseInput.grants[0]!, target_ref: '' }],
}), /target_ref is required/);
assert.throws(() => evaluateAccessProvisioningGatekeeperEventRuntime({ ...baseInput, gatekeeper_bypass_requested: true }), /must not bypass Gatekeeper/);
assert.throws(() => evaluateAccessProvisioningGatekeeperEventRuntime({ ...baseInput, direct_access_grant_requested: true }), /must not grant access directly/);
assert.throws(() => evaluateAccessProvisioningGatekeeperEventRuntime({ ...baseInput, access_core_mutation_requested: true }), /must not mutate Access Core/);
assert.throws(() => evaluateAccessProvisioningGatekeeperEventRuntime({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateAccessProvisioningGatekeeperEventRuntime({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateAccessProvisioningGatekeeperEventRuntime({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateAccessProvisioningGatekeeperEventRuntime({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateAccessProvisioningGatekeeperEventRuntime({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket or execution authorization flags/);

console.log('P6C runtime access_provisioning_gatekeeper_event test passed.');
