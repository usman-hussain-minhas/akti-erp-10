import assert from "node:assert/strict";
import { evaluateCrossModuleChannelRef } from "./cross_module_channel_ref.service";

function baseInput() {
  return {
    organization_id: "org_1",
    service_manifest_contract_id: "seed_6a_service_manifest_contract",
    source_record_ref: "cross_module_channel_ref:evidence:1",
    workspace_ref: "workspace_1",
    channel_ref: "channel_1",
    channel_name: "Event coordination",
    evaluated_by_user_id: "ref_evaluator",
    evaluated_at: "2026-06-11T10:00:00.000Z",
    registered_refs: [
      {
        registered_ref: "registered_event_module",
        module_key: "phase-6c.event-registrations",
        capability_surface: "phase_6c.event_registrations.event_workspace_context",
        evidence_ref: "registered:evidence:1",
      },
    ],
    requested_refs: [
      {
        link_ref: "link_1",
        registered_ref: "registered_event_module",
        module_key: "phase-6c.event-registrations",
        module_record_ref: "event_1",
        relation: "CONTEXT_CHANNEL" as const,
        evidence_ref: "link:evidence:1",
      },
    ],
  };
}

const ready = evaluateCrossModuleChannelRef(baseInput());
assert.equal(ready.decision, "CHANNEL_REFS_READY");
assert.equal(ready.requested_ref_count, 1);
assert.equal(ready.accepted_ref_count, 1);
assert.equal(ready.rejected_ref_count, 0);
assert.equal(ready.normalized_refs[0]?.capability_surface, "phase_6c.event_registrations.event_workspace_context");
assert.equal(ready.module_mutation_performed, false);
assert.equal(ready.direct_cross_module_query_performed, false);
assert.equal(ready.runtime_adapter_performed, false);
assert.deepEqual(ready.decision_refs, ["6C-WORK-MSG-012", "6C-GLOBAL-018"]);
assert.match(ready.deterministic_digest, /^[a-f0-9]{64}$/);

const repeat = evaluateCrossModuleChannelRef(baseInput());
assert.equal(repeat.deterministic_digest, ready.deterministic_digest);

const review = evaluateCrossModuleChannelRef({
  ...baseInput(),
  requested_refs: [
    {
      ...baseInput().requested_refs[0],
      registered_ref: "missing_registration",
    },
  ],
});
assert.equal(review.decision, "CHANNEL_REFS_REQUIRE_REVIEW");
assert.equal(review.accepted_ref_count, 0);
assert.deepEqual(review.review_reasons, ["unregistered_ref:missing_registration"]);

const blocked = evaluateCrossModuleChannelRef({
  ...baseInput(),
  requested_refs: [baseInput().requested_refs[0], { ...baseInput().requested_refs[0] }],
});
assert.equal(blocked.decision, "CHANNEL_REFS_BLOCKED");
assert.deepEqual(blocked.blockers, ["duplicate_link_ref:link_1"]);

const mismatch = evaluateCrossModuleChannelRef({
  ...baseInput(),
  requested_refs: [
    {
      ...baseInput().requested_refs[0],
      module_key: "phase-6b.crm",
    },
  ],
});
assert.equal(mismatch.decision, "CHANNEL_REFS_REQUIRE_REVIEW");
assert.deepEqual(mismatch.review_reasons, ["module_key_mismatch:link_1"]);

assert.throws(
  () => evaluateCrossModuleChannelRef({ ...baseInput(), module_mutation_requested: true }),
  /module mutation is outside this FFET/,
);
assert.throws(
  () => evaluateCrossModuleChannelRef({ ...baseInput(), direct_cross_module_query_requested: true }),
  /direct cross-module query is outside this FFET/,
);
assert.throws(
  () =>
    evaluateCrossModuleChannelRef({
      ...baseInput(),
      requested_refs: [{ ...baseInput().requested_refs[0], relation: "OWNER" as never }],
    }),
  /relation is not supported/,
);
assert.throws(
  () => evaluateCrossModuleChannelRef({ ...baseInput(), registered_refs: [] }),
  /registered_refs must contain at least one registered module reference/,
);

console.log("cross_module_channel_ref.service.test passed");
