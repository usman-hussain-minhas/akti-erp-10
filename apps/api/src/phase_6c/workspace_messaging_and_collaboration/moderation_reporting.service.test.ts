import assert from "node:assert/strict";
import { evaluateModerationReporting } from "./moderation_reporting.service";

function baseInput() {
  return {
    organization_id: "org_1",
    service_manifest_contract_id: "seed_6a_service_manifest_contract",
    source_record_ref: "moderation_reporting:evidence:1",
    workspace_ref: "workspace_1",
    report_ref: "report_1",
    reported_message_ref: "message_1",
    reporter_user_ref: "reporter_1",
    reported_actor_user_ref: "actor_1",
    category: "POLICY_VIOLATION" as const,
    severity: "MEDIUM" as const,
    reason: "Message contains policy-sensitive information.",
    evidence_refs: ["message:evidence:1", "message:evidence:1"],
    reported_at: "2026-06-12T08:00:00.000Z",
    evaluated_by_user_id: "moderator_1",
    evaluated_at: "2026-06-12T08:05:00.000Z",
    policy: {
      policy_ref: "moderation_policy_1",
      auto_escalate_severities: ["HIGH", "CRITICAL"] as const,
      require_reporter_evidence: true,
      allow_self_report: false,
      duplicate_window_minutes: 60,
    },
  };
}

const accepted = evaluateModerationReporting(baseInput());
assert.equal(accepted.decision, "MODERATION_REPORT_ACCEPTED");
assert.equal(accepted.escalation_required, false);
assert.equal(accepted.duplicate_risk, false);
assert.deepEqual(accepted.normalized_evidence_refs, ["message:evidence:1"]);
assert.equal(accepted.content_removal_performed, false);
assert.equal(accepted.account_action_performed, false);
assert.equal(accepted.notification_send_performed, false);
assert.deepEqual(accepted.decision_refs, ["6C-WORK-MSG-014", "6C-GLOBAL-018"]);
assert.match(accepted.deterministic_digest, /^[a-f0-9]{64}$/);

const repeat = evaluateModerationReporting(baseInput());
assert.equal(repeat.deterministic_digest, accepted.deterministic_digest);

const escalated = evaluateModerationReporting({
  ...baseInput(),
  severity: "CRITICAL",
});
assert.equal(escalated.decision, "MODERATION_REPORT_ESCALATED");
assert.equal(escalated.escalation_required, true);

const review = evaluateModerationReporting({
  ...baseInput(),
  reason: "too short",
  evidence_refs: [],
  prior_report_refs: ["report_prior_1"],
});
assert.equal(review.decision, "MODERATION_REPORT_REQUIRES_REVIEW");
assert.equal(review.duplicate_risk, true);
assert.deepEqual(review.review_reasons, [
  "moderation_reason_too_short",
  "possible_duplicate_report_in_policy_window",
  "reporter_evidence_required",
]);

const rejected = evaluateModerationReporting({
  ...baseInput(),
  reporter_user_ref: "actor_1",
});
assert.equal(rejected.decision, "MODERATION_REPORT_REJECTED");
assert.deepEqual(rejected.rejection_reasons, ["self_report_not_allowed_by_policy"]);

assert.throws(
  () => evaluateModerationReporting({ ...baseInput(), content_removal_requested: true }),
  /content removal is outside this FFET/,
);
assert.throws(
  () => evaluateModerationReporting({ ...baseInput(), gatekeeper_bypass_requested: true }),
  /Gatekeeper bypass is forbidden/,
);
assert.throws(
  () => evaluateModerationReporting({ ...baseInput(), category: "ABUSE" as never }),
  /category is not supported/,
);
assert.throws(
  () =>
    evaluateModerationReporting({
      ...baseInput(),
      policy: { ...baseInput().policy, duplicate_window_minutes: -1 },
    }),
  /duplicate_window_minutes must be a non-negative integer/,
);

console.log("moderation_reporting.service.test passed");
