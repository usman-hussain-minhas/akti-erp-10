import assert from "node:assert/strict";
import { evaluateOutboundNotificationGateway } from "./outbound_notification_gateway.service";

function baseInput() {
  return {
    organization_id: "org_1",
    service_manifest_contract_id: "seed_6a_service_manifest_contract",
    source_record_ref: "workspace_notification:evidence:1",
    workspace_ref: "workspace_1",
    notification_ref: "notification_1",
    actor_user_ref: "user_sender",
    evaluated_by_user_id: "user_reviewer",
    evaluated_at: "2026-06-11T10:00:00.000Z",
    notification_type: "THREAD_MENTION" as const,
    urgency: "NORMAL" as const,
    message: {
      subject: "Mention in workspace",
      body_preview: "You were mentioned in a workspace thread.",
      deep_link_ref: "workspace://conversation_1/message_1",
    },
    recipients: [
      {
        recipient_ref: "recipient_1",
        person_ref: "person_1",
        user_ref: "user_1",
        channels: ["EMAIL", "PUSH", "EMAIL"] as const,
        opt_out_status: "ALLOWED" as const,
        gateway_policy_evidence_ref: "gateway_policy_evidence_1",
      },
    ],
  };
}

const ready = evaluateOutboundNotificationGateway(baseInput());
assert.equal(ready.decision, "READY_FOR_GATEWAY");
assert.equal(ready.recipient_count, 1);
assert.equal(ready.envelope_count, 2);
assert.equal(ready.suppressed_count, 0);
assert.equal(ready.gateway_envelopes.every((envelope) => envelope.send_performed === false), true);
assert.deepEqual(ready.gateway_envelopes[0]?.required_gateway_controls, [
  "global_opt_out_registry",
  "outbound_gateway_enforcement",
]);
assert.deepEqual(ready.gateway_envelopes[0]?.adl_refs, ["ADL-004"]);
assert.equal(ready.send_performed, false);
assert.equal(ready.provider_adapter_performed, false);
assert.equal(ready.gateway_bypass_performed, false);
assert.deepEqual(ready.decision_refs, ["6C-WORK-MSG-007", "6C-GLOBAL-013", "6C-ADL-008"]);
assert.deepEqual(ready.adl_refs, ["ADL-004"]);
assert.match(ready.deterministic_digest, /^[a-f0-9]{64}$/);

const repeat = evaluateOutboundNotificationGateway(baseInput());
assert.equal(repeat.deterministic_digest, ready.deterministic_digest);

const partiallyReady = evaluateOutboundNotificationGateway({
  ...baseInput(),
  recipients: [
    baseInput().recipients[0],
    {
      recipient_ref: "recipient_2",
      channels: ["SMS"] as const,
      opt_out_status: "OPTED_OUT" as const,
      gateway_policy_evidence_ref: "gateway_policy_evidence_2",
    },
  ],
});
assert.equal(partiallyReady.decision, "PARTIALLY_READY_FOR_GATEWAY");
assert.equal(partiallyReady.envelope_count, 2);
assert.equal(partiallyReady.suppressed_recipients[0]?.reason, "GLOBAL_OPT_OUT");

const missingEvidence = evaluateOutboundNotificationGateway({
  ...baseInput(),
  recipients: [
    {
      recipient_ref: "recipient_3",
      channels: ["EMAIL"] as const,
      opt_out_status: "UNKNOWN" as const,
    },
  ],
});
assert.equal(missingEvidence.decision, "REQUIRES_GATEWAY_REVIEW");
assert.deepEqual(missingEvidence.review_reasons, ["recipient_3:missing_gateway_policy_evidence"]);
assert.equal(missingEvidence.suppressed_recipients[0]?.reason, "MISSING_GATEWAY_POLICY_EVIDENCE");

const allOptedOut = evaluateOutboundNotificationGateway({
  ...baseInput(),
  recipients: [
    {
      recipient_ref: "recipient_4",
      channels: ["EMAIL"] as const,
      opt_out_status: "OPTED_OUT" as const,
      gateway_policy_evidence_ref: "gateway_policy_evidence_4",
    },
  ],
});
assert.equal(allOptedOut.decision, "SUPPRESSED_BY_OPT_OUT");
assert.equal(allOptedOut.envelope_count, 0);

assert.throws(
  () => evaluateOutboundNotificationGateway({ ...baseInput(), gateway_bypass_requested: true }),
  /gateway bypass is forbidden by ADL-004/,
);
assert.throws(
  () => evaluateOutboundNotificationGateway({ ...baseInput(), opt_out_override_requested: true }),
  /global opt-out override is forbidden by ADL-004/,
);
assert.throws(
  () =>
    evaluateOutboundNotificationGateway({
      ...baseInput(),
      recipients: [{ ...baseInput().recipients[0], channels: ["FAX" as never] }],
    }),
  /unsupported channel/,
);
assert.throws(
  () => evaluateOutboundNotificationGateway({ ...baseInput(), recipients: [] }),
  /recipients must contain at least one recipient/,
);

console.log("outbound_notification_gateway.service.test passed");
