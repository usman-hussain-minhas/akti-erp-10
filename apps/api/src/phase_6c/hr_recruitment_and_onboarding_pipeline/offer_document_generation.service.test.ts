import assert from 'node:assert/strict';
import { Phase6cOfferDocumentGenerationService } from './offer_document_generation.service';

const service = new Phase6cOfferDocumentGenerationService();

const validInput = {
  organization_id: 'org_akti',
  service_manifest_contract_id: 'smc:phase_6c_offer_document_generation',
  source_record_ref: 'recruitment_application:app_001',
  applicant_ref: 'applicant:person_001',
  offer_ref: 'employment_offer:offer_001',
  template_ref: 'offer_template:standard_full_time',
  template_version: '2026.06',
  language_code: 'en-US',
  output_format: 'PDF' as const,
  file_service_ref: '6a_file_service:svfs_offer_documents',
  requested_by_user_id: 'user_hr_001',
  requested_at: '2026-06-09T10:00:00.000Z',
  variables: [
    { variable_code: 'candidate_name', value: 'Amina Khan' },
    { variable_code: 'start_date', value: '2026-07-01' },
    { variable_code: 'compensation_summary', value: 'redacted in audit', redacted_in_audit: true },
  ],
};

const receipt = service.prepareOfferDocumentGeneration(validInput);

assert.equal(receipt.seed_id, 'seed_6c_020_offer_document_generation');
assert.equal(receipt.component_id, '6C.02');
assert.equal(receipt.runtime_status, 'OFFER_DOCUMENT_6A_FILE_SERVICE_REQUEST_READY');
assert.equal(receipt.file_service_only, true);
assert.equal(receipt.direct_file_mutation_allowed, false);
assert.equal(receipt.local_file_write_allowed, false);
assert.equal(receipt.non_6a_file_service_allowed, false);
assert.equal(receipt.schema_mutation_allowed, false);
assert.equal(receipt.phase_6a_mutation_allowed, false);
assert.equal(receipt.phase_6b_mutation_allowed, false);
assert.equal(receipt.ticket_flag_flip_allowed, false);
assert.deepEqual(receipt.decision_refs, ['6C-RECRUIT-012', '6C-GLOBAL-018']);
assert.deepEqual(receipt.evidence_artifacts, [
  'phase_6c_offer_document_generation_request',
  'phase_6c_offer_document_6a_file_service_payload',
  'phase_6c_offer_document_generation_receipt',
]);
assert.deepEqual(receipt.generation_payload.variable_codes, [
  'candidate_name',
  'compensation_summary',
  'start_date',
]);
assert.equal(receipt.variable_count, 3);
assert.equal(receipt.redacted_variable_count, 1);
assert.match(receipt.receipt_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = service.prepareOfferDocumentGeneration(validInput);
assert.equal(repeatedReceipt.receipt_digest, receipt.receipt_digest);

assert.throws(
  () => service.prepareOfferDocumentGeneration({ ...validInput, file_service_ref: 's3:bucket/path' }),
  /6a_file_service:/,
);
assert.throws(
  () => service.prepareOfferDocumentGeneration({ ...validInput, template_ref: 'generic_template:offer' }),
  /offer_template:/,
);
assert.throws(
  () => service.prepareOfferDocumentGeneration({ ...validInput, output_format: 'HTML' as never }),
  /unsupported offer document format/,
);
assert.throws(
  () => service.prepareOfferDocumentGeneration({ ...validInput, variables: [] }),
  /at least one offer document variable/,
);
assert.throws(
  () =>
    service.prepareOfferDocumentGeneration({
      ...validInput,
      variables: [
        { variable_code: 'candidate_name', value: 'Amina Khan' },
        { variable_code: 'candidate_name', value: 'Duplicate' },
      ],
    }),
  /duplicate offer document variable_code/,
);
assert.throws(
  () => service.prepareOfferDocumentGeneration({ ...validInput, direct_file_service_mutation_requested: true }),
  /direct 6A file service mutation is forbidden/,
);
assert.throws(
  () => service.prepareOfferDocumentGeneration({ ...validInput, ticket_flag_flip_requested: true }),
  /flag flips remain human-only/,
);
