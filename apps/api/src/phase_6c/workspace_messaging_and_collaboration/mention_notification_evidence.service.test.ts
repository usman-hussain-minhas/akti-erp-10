import assert from "node:assert/strict";
import { recordMentionNotificationEvidence } from "./mention_notification_evidence.service";

function baseInput() {
  return {
    organization_id: "org_1",
    service_manifest_contract_id: "seed_6a_service_manifest_contract",
    source_record_ref: "mention_notification:evidence:1",
    workspace_ref: "workspace_1",
    conversation_ref: "conversation_1",
    message_ref: "message_1",
    notification_ref: "notification_1",
    actor_user_ref: "user_sender",
    evaluated_by_user_id: "user_reviewer",
    evaluated_at: "2026-06-11T10:00:00.000Z",
    mentions: [
      {
        mention_ref: "mention_1",
        mention_type: "USER_MENTION" as const,
        token: "@Amna",
        target_ref: "person_1",
        recipient_ref: "recipient_1",
        evidence_status: "GATEWAY_ENVELOPE_PREPARED" as const,
        gateway_envelope_ref: "gateway_envelope_1",
        gateway_policy_evidence_ref: "gateway_policy_evidence_1",
      },
    ],
  };
}

const complete = recordMentionNotificationEvidence(baseInput());
assert.equal(complete.decision, "MENTION_EVIDENCE_COMPLETE");
assert.equal(complete.mention_count, 1);
assert.equal(complete.gateway_prepared_count, 1);
assert.equal(complete.suppressed_count, 0);
assert.equal(complete.review_count, 0);
assert.equal(complete.records[0]?.evidence_status, "GATEWAY_ENVELOPE_PREPARED");
assert.match(complete.records[0]?.evidence_ref ?? "", /^mention_evidence_[a-f0-9]{24}$/);
assert.equal(complete.send_performed, false);
assert.equal(complete.provider_adapter_performed, false);
assert.equal(complete.gateway_bypass_performed, false);
assert.deepEqual(complete.decision_refs, ["6C-WORK-MSG-008", "6C-GLOBAL-013", "6C-ADL-008"]);
assert.deepEqual(complete.adl_refs, ["ADL-004"]);
assert.match(complete.deterministic_digest, /^[a-f0-9]{64}$/);

const repeat = recordMentionNotificationEvidence(baseInput());
assert.equal(repeat.deterministic_digest, complete.deterministic_digest);

const partial = recordMentionNotificationEvidence({
  ...baseInput(),
  mentions: [
    baseInput().mentions[0],
    {
      mention_ref: "mention_2",
      mention_type: "TEAM_MENTION" as const,
      token: "@PayrollTeam",
      target_ref: "team_payroll",
      recipient_ref: "recipient_2",
      evidence_status: "SUPPRESSED_BY_OPT_OUT" as const,
      suppression_reason: "GLOBAL_OPT_OUT" as const,
    },
  ],
});
assert.equal(partial.decision, "MENTION_EVIDENCE_PARTIAL");
assert.equal(partial.suppressed_count, 1);

const review = recordMentionNotificationEvidence({
  ...baseInput(),
  mentions: [
    {
      mention_ref: "mention_3",
      mention_type: "ROLE_MENTION" as const,
      token: "@Managers",
      target_ref: "role_managers",
      recipient_ref: "recipient_3",
      evidence_status: "REQUIRES_REVIEW" as const,
      review_reason: "recipient_resolution_incomplete",
    },
  ],
});
assert.equal(review.decision, "MENTION_EVIDENCE_REQUIRES_REVIEW");
assert.deepEqual(review.review_reasons, ["mention_3:recipient_resolution_incomplete"]);

assert.throws(
  () =>
    recordMentionNotificationEvidence({
      ...baseInput(),
      mentions: [
        {
          ...baseInput().mentions[0],
          gateway_envelope_ref: "",
        },
      ],
    }),
  /gateway_envelope_ref must be a non-empty string/,
);
assert.throws(
  () =>
    recordMentionNotificationEvidence({
      ...baseInput(),
      mentions: [
        {
          ...baseInput().mentions[0],
          evidence_status: "SUPPRESSED_BY_OPT_OUT",
          gateway_envelope_ref: undefined,
          gateway_policy_evidence_ref: undefined,
        },
      ],
    }),
  /suppression_reason must be a non-empty string/,
);
assert.throws(
  () => recordMentionNotificationEvidence({ ...baseInput(), gateway_bypass_requested: true }),
  /gateway bypass is forbidden by ADL-004/,
);
assert.throws(
  () => recordMentionNotificationEvidence({ ...baseInput(), send_requested: true }),
  /sending is outside this FFET/,
);
assert.throws(
  () => recordMentionNotificationEvidence({ ...baseInput(), mentions: [] }),
  /mentions must contain at least one mention evidence item/,
);

console.log("mention_notification_evidence.service.test passed");
