import assert from "node:assert/strict";
import { evaluateMembershipPolicy } from "./membership_policy.service";

function baseInput() {
  return {
    organization_id: "org_1",
    service_manifest_contract_id: "seed_6a_service_manifest_contract",
    source_record_ref: "membership_policy:evidence:1",
    workspace_ref: "workspace_1",
    resource_ref: "channel_1",
    evaluated_by_user_id: "policy_evaluator",
    evaluated_at: "2026-06-11T10:00:00.000Z",
    policy: {
      policy_ref: "policy_1",
      mode: "ANY_ROLE_OR_TEAM" as const,
      allowed_role_refs: ["role_workspace_admin", "role_workspace_member"],
      denied_role_refs: ["role_suspended_workspace"],
      allowed_team_refs: ["team_ops"],
      required_team_refs: [],
      require_active_employee: true,
    },
    candidates: [
      {
        principal_ref: "principal_1",
        person_ref: "person_1",
        employee_ref: "employee_1",
        access_core_role_refs: ["role_workspace_member"],
        employee_team_refs: [],
        employee_status: "ACTIVE" as const,
        evidence_refs: ["access:evidence:1", "team:evidence:1"],
      },
    ],
  };
}

const granted = evaluateMembershipPolicy(baseInput());
assert.equal(granted.grant_count, 1);
assert.equal(granted.deny_count, 0);
assert.equal(granted.review_count, 0);
assert.equal(granted.evaluations[0]?.decision, "MEMBERSHIP_GRANTED");
assert.deepEqual(granted.evaluations[0]?.matched_role_refs, ["role_workspace_member"]);
assert.equal(granted.access_core_mutation_performed, false);
assert.equal(granted.employee_team_mutation_performed, false);
assert.equal(granted.workspace_membership_mutation_performed, false);
assert.deepEqual(granted.decision_refs, ["6C-WORK-MSG-010", "6C-GLOBAL-018"]);
assert.match(granted.deterministic_digest, /^[a-f0-9]{64}$/);

const repeat = evaluateMembershipPolicy(baseInput());
assert.equal(repeat.deterministic_digest, granted.deterministic_digest);

const denied = evaluateMembershipPolicy({
  ...baseInput(),
  candidates: [
    {
      ...baseInput().candidates[0],
      principal_ref: "principal_2",
      access_core_role_refs: ["role_suspended_workspace"],
      employee_status: "SUSPENDED",
    },
  ],
});
assert.equal(denied.deny_count, 1);
assert.equal(denied.evaluations[0]?.decision, "MEMBERSHIP_DENIED");
assert.deepEqual(denied.evaluations[0]?.deny_reasons, [
  "denied_role:role_suspended_workspace",
  "employee_status:SUSPENDED",
]);

const review = evaluateMembershipPolicy({
  ...baseInput(),
  policy: {
    ...baseInput().policy,
    mode: "ROLE_AND_TEAM",
    required_team_refs: ["team_ops"],
  },
  candidates: [
    {
      ...baseInput().candidates[0],
      access_core_role_refs: ["role_workspace_member"],
      employee_team_refs: [],
    },
  ],
});
assert.equal(review.review_count, 1);
assert.equal(review.evaluations[0]?.decision, "MEMBERSHIP_REVIEW_REQUIRED");
assert.deepEqual(review.evaluations[0]?.missing_required_team_refs, ["team_ops"]);
assert.deepEqual(review.evaluations[0]?.review_reasons, ["missing_required_team:team_ops", "no_access_role_or_employee_team_match"]);

const teamGrant = evaluateMembershipPolicy({
  ...baseInput(),
  policy: {
    ...baseInput().policy,
    mode: "REQUIRED_TEAMS_ONLY",
    allowed_role_refs: [],
    allowed_team_refs: [],
    required_team_refs: ["team_ops"],
  },
  candidates: [
    {
      ...baseInput().candidates[0],
      access_core_role_refs: [],
      employee_team_refs: ["team_ops"],
    },
  ],
});
assert.equal(teamGrant.evaluations[0]?.decision, "MEMBERSHIP_GRANTED");
assert.deepEqual(teamGrant.evaluations[0]?.matched_team_refs, ["team_ops"]);

assert.throws(
  () => evaluateMembershipPolicy({ ...baseInput(), gatekeeper_bypass_requested: true }),
  /Gatekeeper bypass is forbidden/,
);
assert.throws(
  () => evaluateMembershipPolicy({ ...baseInput(), workspace_membership_mutation_requested: true }),
  /workspace membership mutation is outside this FFET/,
);
assert.throws(
  () =>
    evaluateMembershipPolicy({
      ...baseInput(),
      policy: { ...baseInput().policy, mode: "EVERYONE" as never },
    }),
  /policy.mode is not supported/,
);
assert.throws(
  () => evaluateMembershipPolicy({ ...baseInput(), candidates: [] }),
  /candidates must contain at least one membership candidate/,
);

console.log("membership_policy.service.test passed");
