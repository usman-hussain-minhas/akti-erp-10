import assert from "node:assert/strict";
import { evaluateE2eEncryptionBoundary } from "./e2e_encryption_boundary.service";

const DIGEST = "b".repeat(64);

function baseInput() {
  return {
    organization_id: "org_1",
    service_manifest_contract_id: "seed_6a_service_manifest_contract",
    source_record_ref: "e2e_boundary:evidence:1",
    workspace_ref: "workspace_1",
    evaluated_by_user_id: "boundary_evaluator",
    evaluated_at: "2026-06-12T08:05:00.000Z",
    policy: {
      policy_ref: "e2e_policy_1",
      mode: "REQUIRED" as const,
      accepted_algorithms: ["xchacha20-poly1305", "aes-256-gcm"],
      require_device_key_ref: true,
    },
    envelopes: [
      {
        message_ref: "message_1",
        conversation_ref: "conversation_1",
        envelope_state: "ENCRYPTED" as const,
        algorithm: "xchacha20-poly1305",
        sender_device_key_ref: "sender_key_1",
        recipient_device_key_refs: ["recipient_key_1", "recipient_key_1"],
        ciphertext_digest: DIGEST,
        boundary_evidence_ref: "boundary:evidence:1",
      },
    ],
  };
}

const accepted = evaluateE2eEncryptionBoundary(baseInput());
assert.equal(accepted.decision, "E2E_BOUNDARY_ACCEPTED");
assert.equal(accepted.evaluated_envelope_count, 1);
assert.equal(accepted.accepted_envelope_count, 1);
assert.equal(accepted.review_envelope_count, 0);
assert.equal(accepted.rejected_envelope_count, 0);
assert.equal(accepted.envelope_evaluations[0]?.recipient_device_key_count, 1);
assert.equal(accepted.key_generation_performed, false);
assert.equal(accepted.decryption_performed, false);
assert.equal(accepted.encryption_performed, false);
assert.deepEqual(accepted.decision_refs, ["6C-WORK-MSG-003", "6C-GLOBAL-018"]);
assert.match(accepted.deterministic_digest, /^[a-f0-9]{64}$/);

const repeat = evaluateE2eEncryptionBoundary(baseInput());
assert.equal(repeat.deterministic_digest, accepted.deterministic_digest);

const review = evaluateE2eEncryptionBoundary({
  ...baseInput(),
  policy: { ...baseInput().policy, mode: "DISABLED" },
});
assert.equal(review.decision, "E2E_BOUNDARY_REQUIRES_REVIEW");
assert.deepEqual(review.envelope_evaluations[0]?.review_reasons, [
  "encrypted_envelope_present_while_boundary_disabled",
]);

const rejectedPlaintext = evaluateE2eEncryptionBoundary({
  ...baseInput(),
  envelopes: [
    {
      message_ref: "message_2",
      conversation_ref: "conversation_1",
      envelope_state: "PLAINTEXT" as const,
      recipient_device_key_refs: [],
      plaintext_body: "do not persist this at the boundary",
      boundary_evidence_ref: "boundary:evidence:2",
    },
  ],
});
assert.equal(rejectedPlaintext.decision, "E2E_BOUNDARY_REJECTED");
assert.deepEqual(rejectedPlaintext.envelope_evaluations[0]?.rejection_reasons, [
  "encrypted_envelope_required_by_policy",
  "plaintext_body_present_at_e2e_boundary",
]);

const rejectedMissingKey = evaluateE2eEncryptionBoundary({
  ...baseInput(),
  envelopes: [
    {
      ...baseInput().envelopes[0],
      sender_device_key_ref: undefined,
      recipient_device_key_refs: [],
    },
  ],
});
assert.equal(rejectedMissingKey.decision, "E2E_BOUNDARY_REJECTED");
assert.deepEqual(rejectedMissingKey.envelope_evaluations[0]?.rejection_reasons, [
  "recipient_device_key_refs_required_by_policy",
  "sender_device_key_ref_required_by_policy",
]);

const unsupportedAlgorithm = evaluateE2eEncryptionBoundary({
  ...baseInput(),
  envelopes: [{ ...baseInput().envelopes[0], algorithm: "unknown-algorithm" }],
});
assert.equal(unsupportedAlgorithm.decision, "E2E_BOUNDARY_REQUIRES_REVIEW");
assert.deepEqual(unsupportedAlgorithm.envelope_evaluations[0]?.review_reasons, ["algorithm_not_in_policy_allowlist"]);

assert.throws(
  () => evaluateE2eEncryptionBoundary({ ...baseInput(), decryption_requested: true }),
  /decryption is outside this FFET/,
);
assert.throws(
  () => evaluateE2eEncryptionBoundary({ ...baseInput(), key_generation_requested: true }),
  /key generation is outside this FFET/,
);
const badDigest = evaluateE2eEncryptionBoundary({
  ...baseInput(),
  envelopes: [{ ...baseInput().envelopes[0], ciphertext_digest: "bad" }],
});
assert.equal(badDigest.decision, "E2E_BOUNDARY_REJECTED");
assert.deepEqual(badDigest.envelope_evaluations[0]?.rejection_reasons, [
  "encrypted_envelope_missing_ciphertext_digest",
]);
assert.throws(
  () =>
    evaluateE2eEncryptionBoundary({
      ...baseInput(),
      policy: { ...baseInput().policy, mode: "MANDATORY" as never },
    }),
  /policy.mode is not supported/,
);

console.log("e2e_encryption_boundary.service.test passed");
