import assert from "node:assert/strict";
import { evaluateWorkspaceMessageSearch } from "./workspace_message_search.service";

function baseInput() {
  return {
    organization_id: "org_1",
    service_manifest_contract_id: "seed_6a_service_manifest_contract",
    source_record_ref: "workspace_message_search:evidence:1",
    workspace_ref: "workspace_1",
    query_ref: "query_1",
    query_text: "payroll escalation",
    evaluated_by_user_id: "search_user",
    evaluated_at: "2026-06-11T10:00:00.000Z",
    access_filter_ref: "access_filter_1",
    allowed_channel_refs: ["channel_1"],
    filters: {
      include_file_refs: true,
    },
    records: [
      {
        message_ref: "message_1",
        conversation_ref: "conversation_1",
        channel_ref: "channel_1",
        author_user_ref: "user_1",
        body_text: "Payroll escalation packet is attached for review.",
        created_at: "2026-06-11T09:00:00.000Z",
        file_refs: ["file_ref_1", "file_ref_1"],
        search_layer_evidence_ref: "search:evidence:1",
      },
      {
        message_ref: "message_2",
        conversation_ref: "conversation_2",
        channel_ref: "channel_private",
        author_user_ref: "user_2",
        body_text: "Payroll escalation in a private channel.",
        created_at: "2026-06-11T09:05:00.000Z",
        file_refs: [],
        search_layer_evidence_ref: "search:evidence:2",
      },
    ],
  };
}

const ready = evaluateWorkspaceMessageSearch(baseInput());
assert.equal(ready.decision, "SEARCH_REQUIRES_REVIEW");
assert.equal(ready.scanned_record_count, 2);
assert.equal(ready.accessible_record_count, 1);
assert.equal(ready.result_count, 1);
assert.deepEqual(ready.normalized_terms, ["escalation", "payroll"]);
assert.equal(ready.results[0]?.message_ref, "message_1");
assert.deepEqual(ready.results[0]?.file_refs, ["file_ref_1"]);
assert.deepEqual(ready.review_reasons, ["records_excluded_by_access_filter"]);
assert.equal(ready.external_search_runtime_performed, false);
assert.equal(ready.search_index_mutation_performed, false);
assert.equal(ready.file_layer_mutation_performed, false);
assert.deepEqual(ready.decision_refs, ["6C-WORK-MSG-013", "6C-GLOBAL-018"]);
assert.match(ready.deterministic_digest, /^[a-f0-9]{64}$/);

const repeat = evaluateWorkspaceMessageSearch(baseInput());
assert.equal(repeat.deterministic_digest, ready.deterministic_digest);

const allAccessible = evaluateWorkspaceMessageSearch({
  ...baseInput(),
  allowed_channel_refs: ["channel_1", "channel_private"],
});
assert.equal(allAccessible.decision, "SEARCH_READY");
assert.equal(allAccessible.result_count, 2);
assert.equal(allAccessible.results[0]?.score, allAccessible.results[1]?.score);

const noMatches = evaluateWorkspaceMessageSearch({
  ...baseInput(),
  allowed_channel_refs: ["channel_1", "channel_private"],
  query_text: "benefits",
});
assert.equal(noMatches.decision, "SEARCH_NO_MATCHES");
assert.equal(noMatches.result_count, 0);

const filtered = evaluateWorkspaceMessageSearch({
  ...baseInput(),
  allowed_channel_refs: ["channel_1", "channel_private"],
  filters: {
    include_file_refs: false,
    author_user_refs: ["user_1"],
    created_from: "2026-06-11T08:00:00.000Z",
    created_to: "2026-06-11T09:01:00.000Z",
  },
});
assert.equal(filtered.decision, "SEARCH_READY");
assert.deepEqual(filtered.results[0]?.file_refs, []);

assert.throws(
  () => evaluateWorkspaceMessageSearch({ ...baseInput(), external_search_runtime_requested: true }),
  /external search runtime execution is outside this FFET/,
);
assert.throws(
  () => evaluateWorkspaceMessageSearch({ ...baseInput(), search_index_mutation_requested: true }),
  /search index mutation is outside this FFET/,
);
assert.throws(
  () => evaluateWorkspaceMessageSearch({ ...baseInput(), allowed_channel_refs: [] }),
  /allowed_channel_refs\[\] must be a non-empty string/,
);
assert.throws(
  () =>
    evaluateWorkspaceMessageSearch({
      ...baseInput(),
      records: [{ ...baseInput().records[0], created_at: "not-a-date" }],
    }),
  /created_at must be an ISO-compatible timestamp/,
);

console.log("workspace_message_search.service.test passed");
