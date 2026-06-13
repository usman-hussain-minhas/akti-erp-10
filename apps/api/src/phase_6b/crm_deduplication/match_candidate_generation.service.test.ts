import assert from 'node:assert/strict';
import { generateMatchCandidates, type MatchCandidateGenerationInput } from './match_candidate_generation.service';

const baseInput: MatchCandidateGenerationInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_deduplication',
  source_lead_record_id: 'lead_source_001',
  source_lead_record_authority_id: 'lead_authority_source_001',
  source_person_identity_graph_id: 'person_graph_source_001',
  dedup_run_id: 'dedup_run_001',
  generated_at: '2026-06-08T15:10:00.000Z',
  source_signals: {
    email_ref: 'student@example.test',
    phone_ref: '+923331111111',
    normalized_name_key: 'student six',
    external_source_ref: 'portal_ref_001',
    product_interest_ref: 'admissions_program',
  },
  minimum_score: 40,
  candidates: [
    {
      lead_record_id: 'lead_candidate_001',
      lead_record_authority_id: 'lead_authority_candidate_001',
      person_identity_graph_id: 'person_graph_candidate_001',
      source_system: 'API_LEAD_INTAKE',
      signals: {
        email_ref: 'student@example.test',
        phone_ref: '+923331111111',
        normalized_name_key: 'student six',
        product_interest_ref: 'admissions_program',
      },
    },
    {
      lead_record_id: 'lead_candidate_002',
      lead_record_authority_id: 'lead_authority_candidate_002',
      person_identity_graph_id: 'person_graph_candidate_002',
      source_system: 'WALK_IN_INTAKE',
      signals: {
        phone_ref: '+923331111111',
      },
    },
    {
      lead_record_id: 'lead_candidate_low_score',
      lead_record_authority_id: 'lead_authority_candidate_low_score',
      person_identity_graph_id: 'person_graph_candidate_low_score',
      source_system: 'EMAIL_INTAKE',
      signals: {
        normalized_name_key: 'student six',
      },
    },
    {
      lead_record_id: 'lead_source_001',
      lead_record_authority_id: 'lead_authority_source_001',
      person_identity_graph_id: 'person_graph_source_001',
      source_system: 'SELF_REFERENCE',
      signals: {
        email_ref: 'student@example.test',
      },
    },
  ],
};

const receipt = generateMatchCandidates(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_05_match_candidate_generation');
assert.equal(receipt.component_id, '6B.05');
assert.equal(receipt.event_name, 'phase_6b.crm_deduplication.match_candidate_generation.generated');
assert.equal(receipt.source_lead_record_id, 'lead_source_001');
assert.equal(receipt.source_lead_record_authority_id, 'lead_authority_source_001');
assert.equal(receipt.source_person_identity_graph_id, 'person_graph_source_001');
assert.equal(receipt.minimum_score, 40);
assert.equal(receipt.evaluated_candidate_count, 3);
assert.equal(receipt.generated_candidate_count, 2);
assert.equal(receipt.merge_decision_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);
assert.deepEqual(receipt.candidates.map((candidate) => candidate.candidate_lead_record_id), [
  'lead_candidate_001',
  'lead_candidate_002',
]);
assert.equal(receipt.candidates[0]?.score, 100);
assert.deepEqual(receipt.candidates[0]?.evidence.map((item) => item.field), [
  'EMAIL_REF',
  'PHONE_REF',
  'NAME_KEY',
  'PRODUCT_INTEREST',
]);
assert.equal(receipt.candidates[1]?.score, 40);
assert.deepEqual(receipt.candidates[1]?.evidence.map((item) => item.field), ['PHONE_REF']);

const identityGraphMatch = generateMatchCandidates({
  ...baseInput,
  minimum_score: 25,
  candidates: [
    {
      lead_record_id: 'lead_candidate_identity_001',
      lead_record_authority_id: 'lead_authority_candidate_identity_001',
      person_identity_graph_id: 'person_graph_source_001',
      source_system: 'MANUAL_LEAD_ENTRY',
      signals: {
        person_identity_graph_id: 'person_graph_source_001',
      },
    },
  ],
});
assert.equal(identityGraphMatch.generated_candidate_count, 1);
assert.deepEqual(identityGraphMatch.candidates[0]?.evidence.map((item) => item.field), ['PERSON_IDENTITY_GRAPH']);

assert.throws(() => generateMatchCandidates({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => generateMatchCandidates({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => generateMatchCandidates({ ...baseInput, source_lead_record_id: '' }), /source_lead_record_id is required/);
assert.throws(() => generateMatchCandidates({ ...baseInput, source_lead_record_authority_id: '' }), /source_lead_record_authority_id is required/);
assert.throws(() => generateMatchCandidates({ ...baseInput, source_person_identity_graph_id: '' }), /source_person_identity_graph_id is required/);
assert.throws(() => generateMatchCandidates({ ...baseInput, dedup_run_id: '' }), /dedup_run_id is required/);
assert.throws(() => generateMatchCandidates({ ...baseInput, generated_at: 'not-a-date' }), /generated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => generateMatchCandidates({ ...baseInput, minimum_score: 0 }), /minimum_score must be between 1 and 100/);
assert.throws(() => generateMatchCandidates({ ...baseInput, minimum_score: 101 }), /minimum_score must be between 1 and 100/);
assert.throws(() => generateMatchCandidates({ ...baseInput, candidates: undefined as never }), /candidates must be an array/);
assert.throws(
  () => generateMatchCandidates({
    ...baseInput,
    candidates: [{ ...baseInput.candidates[0]!, lead_record_id: '' }],
  }),
  /candidate.lead_record_id is required/,
);
assert.throws(() => generateMatchCandidates({ ...baseInput, merge_decision_requested: true }), /must not make merge decisions/);
assert.throws(() => generateMatchCandidates({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-041 match candidate generation service test passed.');
