import assert from "node:assert/strict";
import { evaluatePrivateChannelApproval } from "./private_channel_approval.service";

function baseInput() {
  return {
    organization_id: "org_1",
    service_manifest_contract_id: "seed_6a_service_manifest_contract",
    source_record_ref: "private_channel_approval:evidence:1",
    workspace_ref: "workspace_1",
    requested_channel_ref: "private_channel_request_1",
    requested_channel_name: "Payroll escalations",
    business_justification: "Sensitive payroll discussion",
    initial_member_refs: ["user_1", "user_2"],
    requested_at: "2026-06-11T09:00:00.000Z",
    evaluated_by_user_id: "policy_evaluator",
    evaluated_at: "2026-06-11T10:00:00.000Z",
    policy: {
      policy_ref: "policy_1",
      mode: "AUTO_APPROVE_WHEN_POLICY_MATCHES" as const,
      allowed_requester_role_refs: ["role_workspace_admin"],
      allowed_requester_team_refs: ["team_people_ops"],
      required_approver_role_refs: ["role_workspace_admin"],
      require_business_justification: true,
      max_initial_member_count: 5,
    },
    requester_context: {
      requester_user_ref: "user_1",
      requester_person_ref: "person_1",
      requester_employee_ref: "employee_1",
      access_core_role_refs: ["role_workspace_admin"],
      employee_team_refs: [],
      evidence_refs: ["access:evidence:1", "employee_team:evidence:1"],
    },
  };
}

const approved = evaluatePrivateChannelApproval(baseInput());
assert.equal(approved.decision, "PRIVATE_CHANNEL_APPROVED");
assert.equal(approved.requester_policy_matched, true);
assert.equal(approved.approver_policy_matched, true);
assert.deepEqual(approved.matched_requester_role_refs, ["role_workspace_admin"]);
assert.equal(approved.channel_creation_performed, false);
assert.equal(approved.membership_mutation_performed, false);
assert.equal(approved.notification_send_performed, false);
assert.deepEqual(approved.decision_refs, ["6C-WORK-MSG-011", "6C-GLOBAL-018"]);
assert.match(approved.deterministic_digest, /^[a-f0-9]{64}$/);

const repeat = evaluatePrivateChannelApproval(baseInput());
assert.equal(repeat.deterministic_digest, approved.deterministic_digest);

const pending = evaluatePrivateChannelApproval({
  ...baseInput(),
  policy: {
    ...baseInput().policy,
    mode: "REQUIRE_APPROVAL",
  },
});
assert.equal(pending.decision, "PRIVATE_CHANNEL_PENDING_APPROVAL");
assert.deepEqual(pending.review_reasons, ["approval_action_required"]);

const approvedByApprover = evaluatePrivateChannelApproval({
  ...baseInput(),
  policy: {
    ...baseInput().policy,
    mode: "REQUIRE_APPROVAL",
  },
  approval_action: {
    approver_user_ref: "approver_1",
    approver_role_refs: ["role_workspace_admin"],
    decision: "APPROVED" as const,
    reason: "Scoped to payroll operators",
    evidence_ref: "approval:evidence:1",
  },
});
assert.equal(approvedByApprover.decision, "PRIVATE_CHANNEL_APPROVED");
assert.deepEqual(approvedByApprover.matched_approver_role_refs, ["role_workspace_admin"]);

const denied = evaluatePrivateChannelApproval({
  ...baseInput(),
  policy: {
    ...baseInput().policy,
    mode: "DISABLED",
  },
});
assert.equal(denied.decision, "PRIVATE_CHANNEL_DENIED");
assert.deepEqual(denied.deny_reasons, ["private_channel_requests_disabled_by_policy"]);

const review = evaluatePrivateChannelApproval({
  ...baseInput(),
  business_justification: " ",
  initial_member_refs: ["user_1", "user_2", "user_3", "user_4", "user_5", "user_6"],
  requester_context: {
    ...baseInput().requester_context,
    access_core_role_refs: [],
    employee_team_refs: [],
  },
});
assert.equal(review.decision, "PRIVATE_CHANNEL_REVIEW_REQUIRED");
assert.deepEqual(review.review_reasons, [
  "business_justification_required",
  "initial_member_count_exceeds_policy",
  "requester_role_or_team_not_policy_matched",
]);

assert.throws(
  () => evaluatePrivateChannelApproval({ ...baseInput(), channel_creation_requested: true }),
  /private channel creation is outside this FFET/,
);
assert.throws(
  () => evaluatePrivateChannelApproval({ ...baseInput(), gatekeeper_bypass_requested: true }),
  /Gatekeeper bypass is forbidden/,
);
assert.throws(
  () =>
    evaluatePrivateChannelApproval({
      ...baseInput(),
      policy: { ...baseInput().policy, mode: "OPEN" as never },
    }),
  /policy.mode is not supported/,
);
assert.throws(
  () =>
    evaluatePrivateChannelApproval({
      ...baseInput(),
      approval_action: {
        approver_user_ref: "approver_1",
        approver_role_refs: [],
        decision: "APPROVED",
        reason: " ",
        evidence_ref: "approval:evidence:1",
      },
    }),
  /approval_action.reason must be a non-empty string/,
);

console.log("private_channel_approval.service.test passed");
