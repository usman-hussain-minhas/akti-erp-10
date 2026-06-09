import assert from 'node:assert/strict';

import { evaluateOfferApprovalWorkflowRuntime, type OfferApprovalWorkflowInput } from './offer_approval_workflow.service';

const baseInput: OfferApprovalWorkflowInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_offer_approval_workflow',
  source_record_ref: 'offer_approval_001',
  applicant_ref: 'applicant_123',
  offer_ref: 'offer_123',
  department_ref: 'department_engineering',
  employment_type: 'full_time',
  compensation_amount_minor: 6500000,
  compensation_currency: 'PKR',
  configured_policy_ref: 'offer_policy:engineering:v1',
  evaluated_by_user_id: 'user_phase_6c_recruiter',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  access_provisioning_requested: true,
  approval_rules: [
    {
      rule_code: 'engineering_department_approval',
      label: 'Engineering department approval',
      order: 1,
      condition_type: 'DEPARTMENT_MATCH',
      approval_action: 'REQUIRE_HUMAN_APPROVAL',
      approver_role_ref: 'role:engineering_hiring_manager',
      department_ref: 'department_engineering',
      active: true,
    },
    {
      rule_code: 'compensation_gatekeeper_review',
      label: 'Compensation Gatekeeper review',
      order: 2,
      condition_type: 'COMPENSATION_AT_OR_ABOVE',
      approval_action: 'REQUIRE_GATEKEEPER_REVIEW',
      gatekeeper_policy_ref: 'gatekeeper_policy:offer_compensation_review',
      compensation_threshold_minor: 5000000,
      active: true,
    },
    {
      rule_code: 'notify_recruiting_ops',
      label: 'Notify recruiting operations',
      order: 3,
      condition_type: 'ALL_OFFERS',
      approval_action: 'NOTIFY_ONLY',
      approver_role_ref: 'role:recruiting_ops',
      active: true,
    },
  ],
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateOfferApprovalWorkflowRuntime(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_015_offer_approval_workflow');
assert.equal(receipt.component_id, '6C.02');
assert.equal(receipt.component_slug, 'hr_recruitment_and_onboarding_pipeline');
assert.equal(receipt.model_name, 'Phase6COfferApprovalWorkflow');
assert.equal(receipt.event_name, 'phase_6c.hr_recruitment_and_onboarding_pipeline.offer_approval_workflow.evaluated');
assert.equal(receipt.runtime_status, 'OFFER_APPROVAL_WORKFLOW_EVALUATED');
assert.equal(receipt.route_status, 'APPROVAL_REQUIRED');
assert.equal(receipt.hardcoded_rules_allowed, false);
assert.equal(receipt.access_provisioning_gatekeeper_required, true);
assert.equal(receipt.access_provisioning_executed, false);
assert.equal(receipt.schema_mutation_allowed, false);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.equal(receipt.active_rule_count, 3);
assert.equal(receipt.matched_rules.length, 3);
assert.equal(receipt.approval_required_count, 2);
assert.equal(receipt.notification_only_count, 1);
assert.deepEqual(receipt.decision_refs, ['6C-RECRUIT-006']);
assert.match(receipt.offer_approval_workflow_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateOfferApprovalWorkflowRuntime(baseInput);
assert.equal(repeatedReceipt.offer_approval_workflow_evidence_digest, receipt.offer_approval_workflow_evidence_digest);

const noApprovalMatch = evaluateOfferApprovalWorkflowRuntime({
  ...baseInput,
  department_ref: 'department_support',
  compensation_amount_minor: 4000000,
  access_provisioning_requested: false,
  approval_rules: [
    { ...baseInput.approval_rules[0]!, department_ref: 'department_engineering' },
    { ...baseInput.approval_rules[1]!, compensation_threshold_minor: 5000000 },
  ],
});
assert.equal(noApprovalMatch.route_status, 'READY_WITH_CONFIGURED_NO_APPROVAL_MATCH');
assert.equal(noApprovalMatch.matched_rules.length, 0);
assert.equal(noApprovalMatch.access_provisioning_gatekeeper_required, false);

assert.throws(() => evaluateOfferApprovalWorkflowRuntime({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateOfferApprovalWorkflowRuntime({ ...baseInput, compensation_amount_minor: -1 }), /compensation_amount_minor must be a non-negative integer/);
assert.throws(() => evaluateOfferApprovalWorkflowRuntime({ ...baseInput, configured_policy_ref: 'policy:wrong' }), /must identify a configurable offer policy/);
assert.throws(() => evaluateOfferApprovalWorkflowRuntime({ ...baseInput, evaluated_at: 'not-a-date' }), /valid ISO-compatible timestamp/);
assert.throws(() => evaluateOfferApprovalWorkflowRuntime({ ...baseInput, approval_rules: [] }), /at least one configurable approval rule/);
assert.throws(() => evaluateOfferApprovalWorkflowRuntime({
  ...baseInput,
  approval_rules: [
    baseInput.approval_rules[0]!,
    { ...baseInput.approval_rules[1]!, rule_code: baseInput.approval_rules[0]!.rule_code },
  ],
}), /rule_code must be unique/);
assert.throws(() => evaluateOfferApprovalWorkflowRuntime({
  ...baseInput,
  approval_rules: [{ ...baseInput.approval_rules[0]!, order: 0 }],
}), /rule order must be a positive integer/);
assert.throws(() => evaluateOfferApprovalWorkflowRuntime({
  ...baseInput,
  approval_rules: [{ ...baseInput.approval_rules[0]!, condition_type: 'TENURE_MATCH' as never }],
}), /condition_type is not supported/);
assert.throws(() => evaluateOfferApprovalWorkflowRuntime({
  ...baseInput,
  approval_rules: [{ ...baseInput.approval_rules[0]!, approval_action: 'AUTO_APPROVE' as never }],
}), /approval_action is not supported/);
assert.throws(() => evaluateOfferApprovalWorkflowRuntime({
  ...baseInput,
  approval_rules: [{ ...baseInput.approval_rules[0]!, approver_role_ref: undefined }],
}), /REQUIRE_HUMAN_APPROVAL rule requires approver_role_ref/);
assert.throws(() => evaluateOfferApprovalWorkflowRuntime({
  ...baseInput,
  approval_rules: [{ ...baseInput.approval_rules[1]!, gatekeeper_policy_ref: 'policy:wrong' }],
}), /gatekeeper_policy_ref must identify a Gatekeeper policy/);
assert.throws(() => evaluateOfferApprovalWorkflowRuntime({
  ...baseInput,
  approval_rules: [{ ...baseInput.approval_rules[1]!, compensation_threshold_minor: undefined }],
}), /compensation_threshold_minor must be a non-negative integer/);
assert.throws(() => evaluateOfferApprovalWorkflowRuntime({ ...baseInput, hardcoded_rule_requested: true }), /not hardcoded approval thresholds/);
assert.throws(() => evaluateOfferApprovalWorkflowRuntime({ ...baseInput, access_provisioning_without_gatekeeper_requested: true }), /route access provisioning through Gatekeeper/);
assert.throws(() => evaluateOfferApprovalWorkflowRuntime({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateOfferApprovalWorkflowRuntime({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateOfferApprovalWorkflowRuntime({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateOfferApprovalWorkflowRuntime({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateOfferApprovalWorkflowRuntime({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket or execution authorization flags/);

console.log('P6C runtime offer_approval_workflow test passed.');
