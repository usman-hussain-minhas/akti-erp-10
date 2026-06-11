import assert from "node:assert/strict";
import { evaluateMessageAttachmentFileRef } from "./message_attachment_file_ref.service";

const SHA = "a".repeat(64);

function baseInput() {
  return {
    organization_id: "org_1",
    service_manifest_contract_id: "seed_6a_service_manifest_contract",
    source_record_ref: "workspace_message_attachment:evidence:1",
    conversation_ref: "conversation_1",
    message_ref: "message_1",
    actor_user_ref: "user_sender",
    evaluated_by_user_id: "user_reviewer",
    evaluated_at: "2026-06-11T10:00:00.000Z",
    attachments: [
      {
        attachment_ref: "attachment_1",
        file_ref: "file_ref_1",
        file_name: "brief.pdf",
        mime_type: "APPLICATION/PDF",
        byte_size: 2048,
        sha256: SHA,
        kind: "PDF" as const,
        classification: "NORMAL" as const,
        scan_status: "CLEAN" as const,
        uploaded_by_user_ref: "user_sender",
        evidence_refs: ["evidence:file:1", "evidence:file:1"],
      },
    ],
  };
}

const ready = evaluateMessageAttachmentFileRef(baseInput());
assert.equal(ready.decision, "ATTACHMENTS_READY");
assert.equal(ready.attachment_count, 1);
assert.equal(ready.total_byte_size, 2048);
assert.equal(ready.prepared_attachments[0]?.mime_type, "application/pdf");
assert.deepEqual(ready.prepared_attachments[0]?.evidence_refs, ["evidence:file:1"]);
assert.equal(ready.file_upload_performed, false);
assert.equal(ready.download_proxy_performed, false);
assert.equal(ready.event_dispatch_performed, false);
assert.deepEqual(ready.decision_refs, ["6C-WORK-MSG-006", "6C-GLOBAL-018"]);
assert.match(ready.deterministic_digest, /^[a-f0-9]{64}$/);

const repeat = evaluateMessageAttachmentFileRef(baseInput());
assert.equal(repeat.deterministic_digest, ready.deterministic_digest);

const review = evaluateMessageAttachmentFileRef({
  ...baseInput(),
  attachments: [
    {
      ...baseInput().attachments[0],
      scan_status: "PENDING",
      classification: "SENSITIVE",
    },
  ],
});
assert.equal(review.decision, "ATTACHMENTS_REQUIRES_REVIEW");
assert.deepEqual(review.review_reasons, [
  "attachment_1_scan_pending",
  "attachment_1_classification_requires_approval",
]);

const approvedSensitive = evaluateMessageAttachmentFileRef({
  ...baseInput(),
  approval_ref: "approval_1",
  attachments: [
    {
      ...baseInput().attachments[0],
      classification: "RESTRICTED",
    },
  ],
});
assert.equal(approvedSensitive.decision, "ATTACHMENTS_READY");
assert.equal(approvedSensitive.prepared_attachments[0]?.approved, true);

const blocked = evaluateMessageAttachmentFileRef({
  ...baseInput(),
  attachments: [
    {
      ...baseInput().attachments[0],
      scan_status: "FAILED",
    },
  ],
});
assert.equal(blocked.decision, "ATTACHMENTS_BLOCKED");
assert.deepEqual(blocked.blockers, ["attachment_1_scan_failed"]);

assert.throws(
  () => evaluateMessageAttachmentFileRef({ ...baseInput(), file_mutation_requested: true }),
  /file mutation is outside this FFET/,
);
assert.throws(
  () =>
    evaluateMessageAttachmentFileRef({
      ...baseInput(),
      attachments: [{ ...baseInput().attachments[0], sha256: "not-a-sha" }],
    }),
  /sha256 must be a 64-character hex digest/,
);
assert.throws(
  () =>
    evaluateMessageAttachmentFileRef({
      ...baseInput(),
      attachments: [{ ...baseInput().attachments[0], evidence_refs: [] }],
    }),
  /evidence_refs must contain at least one evidence reference/,
);

console.log("message_attachment_file_ref.service.test passed");
