import assert from 'node:assert/strict';
import { recordIdentityResolutionLink, type IdentityResolutionLinkingInput } from './identity_resolution_linking.service';

const baseInput: IdentityResolutionLinkingInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_crm_deduplication',
  identity_resolution_link_id: 'identity_link_001',
  source_lead_record_id: 'lead_source_001',
  source_lead_record_authority_id: 'lead_authority_source_001',
  target_lead_record_id: 'lead_target_001',
  target_lead_record_authority_id: 'lead_authority_target_001',
  person_identity_graph_id: 'person_graph_shared_001',
  link_type: 'SAME_PERSON',
  link_basis: 'MATCH_CANDIDATE_EVIDENCE',
  linked_by_user_id: 'user_dedup_reviewer_001',
  linked_at: '2026-06-08T16:30:00.000Z',
  evidence: [
    {
      evidence_ref: 'match_candidate_001',
      evidence_type: 'MATCH_CANDIDATE_EVIDENCE',
      confidence_score: 92,
    },
    {
      evidence_ref: 'identity_graph_observation_001',
      evidence_type: 'PERSON_IDENTITY_GRAPH',
      confidence_score: 88,
    },
  ],
};

const receipt = recordIdentityResolutionLink(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_05_identity_resolution_linking');
assert.equal(receipt.component_id, '6B.05');
assert.equal(receipt.event_name, 'phase_6b.crm_deduplication.identity_resolution_linking.recorded');
assert.equal(receipt.identity_resolution_link_id, 'identity_link_001');
assert.equal(receipt.source_lead_record_authority_id, 'lead_authority_source_001');
assert.equal(receipt.target_lead_record_authority_id, 'lead_authority_target_001');
assert.equal(receipt.person_identity_graph_id, 'person_graph_shared_001');
assert.equal(receipt.link_type, 'SAME_PERSON');
assert.equal(receipt.link_basis, 'MATCH_CANDIDATE_EVIDENCE');
assert.equal(receipt.evidence_count, 2);
assert.equal(receipt.strongest_confidence_score, 92);
assert.equal(receipt.merge_execution_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);
assert.deepEqual(receipt.evidence.map((item) => item.evidence_ref), [
  'match_candidate_001',
  'identity_graph_observation_001',
]);

const possibleReceipt = recordIdentityResolutionLink({
  ...baseInput,
  identity_resolution_link_id: 'identity_link_002',
  link_type: 'POSSIBLE_SAME_PERSON',
  link_basis: 'OPERATOR_REVIEW',
});
assert.equal(possibleReceipt.link_type, 'POSSIBLE_SAME_PERSON');
assert.equal(possibleReceipt.link_basis, 'OPERATOR_REVIEW');

assert.throws(() => recordIdentityResolutionLink({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => recordIdentityResolutionLink({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => recordIdentityResolutionLink({ ...baseInput, identity_resolution_link_id: '' }), /identity_resolution_link_id is required/);
assert.throws(() => recordIdentityResolutionLink({ ...baseInput, source_lead_record_id: '' }), /source_lead_record_id is required/);
assert.throws(() => recordIdentityResolutionLink({ ...baseInput, source_lead_record_authority_id: '' }), /source_lead_record_authority_id is required/);
assert.throws(() => recordIdentityResolutionLink({ ...baseInput, target_lead_record_id: '' }), /target_lead_record_id is required/);
assert.throws(() => recordIdentityResolutionLink({ ...baseInput, target_lead_record_authority_id: '' }), /target_lead_record_authority_id is required/);
assert.throws(() => recordIdentityResolutionLink({ ...baseInput, person_identity_graph_id: '' }), /person_identity_graph_id is required/);
assert.throws(() => recordIdentityResolutionLink({ ...baseInput, linked_by_user_id: '' }), /linked_by_user_id is required/);
assert.throws(() => recordIdentityResolutionLink({ ...baseInput, linked_at: 'not-a-date' }), /linked_at must be a valid ISO-compatible timestamp/);
assert.throws(() => recordIdentityResolutionLink({ ...baseInput, link_type: 'AUTO_MERGED' as never }), /link_type is not supported/);
assert.throws(() => recordIdentityResolutionLink({ ...baseInput, link_basis: 'UNDECLARED_POLICY' as never }), /link_basis is not supported/);
assert.throws(() => recordIdentityResolutionLink({ ...baseInput, target_lead_record_id: 'lead_source_001' }), /source and target lead records must be distinct/);
assert.throws(() => recordIdentityResolutionLink({ ...baseInput, evidence: [] }), /evidence must contain at least one item/);
assert.throws(
  () => recordIdentityResolutionLink({
    ...baseInput,
    evidence: [{ ...baseInput.evidence[0]!, evidence_ref: '' }],
  }),
  /evidence.evidence_ref is required/,
);
assert.throws(
  () => recordIdentityResolutionLink({
    ...baseInput,
    evidence: [{ ...baseInput.evidence[0]!, evidence_type: 'UNKNOWN' as never }],
  }),
  /link_basis is not supported/,
);
assert.throws(
  () => recordIdentityResolutionLink({
    ...baseInput,
    evidence: [{ ...baseInput.evidence[0]!, confidence_score: 101 }],
  }),
  /confidence_score must be between 0 and 100/,
);
assert.throws(() => recordIdentityResolutionLink({ ...baseInput, merge_execution_requested: true }), /must not execute a merge/);
assert.throws(() => recordIdentityResolutionLink({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-043 identity resolution linking service test passed.');
