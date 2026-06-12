import assert from 'node:assert/strict';

import { evaluateSpeakerHonorariumRef, type SpeakerHonorariumRefInput } from './speaker_honorarium_ref.service';

const baseInput: SpeakerHonorariumRefInput = {
  organization_id: 'org_phase_6c_events',
  service_manifest_contract_id: 'smc_phase_6c_speaker_honorarium_ref',
  event_configuration_id: 'event_config_001',
  speaker_ref_record_id: 'speaker_ref_001',
  source_record_ref: 'speaker_honorarium_ref_record_001',
  evaluated_by_user_id: 'user_phase_6c_events',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  speaker_display_name: 'Avery Operations',
  person_ref: 'person:speaker_avery',
  session_refs: ['session:opening-keynote', 'session:operations-panel'],
  contract_ref: 'speaker_contract:avery_2026',
  honorarium_terms: {
    enabled: true,
    honorarium_ref: 'honorarium:avery_2026',
    amount_minor_units: 250000,
    currency: 'usd',
    approval_evidence_ref: 'approval:evidence_001',
    finance_evidence_ref: 'finance:evidence_001',
    payment_evidence_ref: 'payment:evidence_001',
  },
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateSpeakerHonorariumRef(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_098_speaker_honorarium_ref');
assert.equal(receipt.component_id, '6C.08');
assert.equal(receipt.component_slug, 'events_configuration_and_registration_service');
assert.equal(receipt.model_name, 'Phase6CSpeakerHonorariumRef');
assert.equal(receipt.speaker_link_mode, 'PERSON_REF');
assert.equal(receipt.person_ref, 'person:speaker_avery');
assert.equal(receipt.session_count, 2);
assert.deepEqual(receipt.session_refs, ['session:opening-keynote', 'session:operations-panel']);
assert.equal(receipt.contract_ref, 'speaker_contract:avery_2026');
assert.equal(receipt.honorarium_enabled, true);
assert.equal(receipt.honorarium_ref, 'honorarium:avery_2026');
assert.equal(receipt.amount_minor_units, 250000);
assert.equal(receipt.currency, 'USD');
assert.equal(receipt.approval_evidence_ref, 'approval:evidence_001');
assert.equal(receipt.finance_evidence_ref, 'finance:evidence_001');
assert.equal(receipt.payment_evidence_ref, 'payment:evidence_001');
assert.equal(receipt.decision, 'HONORARIUM_REF_READY');
assert.equal(receipt.refs_events_only, true);
assert.equal(receipt.direct_person_identity_write_allowed, false);
assert.equal(receipt.direct_finance_write_allowed, false);
assert.equal(receipt.direct_payment_capture_allowed, false);
assert.equal(receipt.provider_adapter_allowed, false);
assert.equal(receipt.persistence_performed, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.frontend_surface_created, false);
assert.match(receipt.speaker_honorarium_ref_runtime_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateSpeakerHonorariumRef(baseInput);
assert.equal(repeatedReceipt.speaker_honorarium_ref_runtime_digest, receipt.speaker_honorarium_ref_runtime_digest);

const externalSpeakerReceipt = evaluateSpeakerHonorariumRef({
  ...baseInput,
  speaker_ref_record_id: 'speaker_ref_external_001',
  person_ref: undefined,
  external_speaker_ref: 'external_speaker:avery_vendor',
  honorarium_terms: { enabled: false },
});
assert.equal(externalSpeakerReceipt.speaker_link_mode, 'EXTERNAL_SPEAKER_REF');
assert.equal(externalSpeakerReceipt.external_speaker_ref, 'external_speaker:avery_vendor');
assert.equal(externalSpeakerReceipt.honorarium_enabled, false);
assert.equal(externalSpeakerReceipt.decision, 'SPEAKER_REF_READY');

const approvalMissingReceipt = evaluateSpeakerHonorariumRef({
  ...baseInput,
  speaker_ref_record_id: 'speaker_ref_approval_missing_001',
  honorarium_terms: {
    enabled: true,
    honorarium_ref: 'honorarium:requires_approval',
    amount_minor_units: 100000,
    currency: 'PKR',
  },
});
assert.equal(approvalMissingReceipt.decision, 'HONORARIUM_REQUIRES_APPROVAL_EVIDENCE');

assert.throws(() => evaluateSpeakerHonorariumRef({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateSpeakerHonorariumRef({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateSpeakerHonorariumRef({ ...baseInput, person_ref: 'person:one', external_speaker_ref: 'external:two' }), /either person_ref or external_speaker_ref, not both/);
assert.throws(() => evaluateSpeakerHonorariumRef({ ...baseInput, person_ref: undefined }), /requires person_ref or external_speaker_ref/);
assert.throws(() => evaluateSpeakerHonorariumRef({ ...baseInput, session_refs: [] }), /at least one session_ref is required/);
assert.throws(() => evaluateSpeakerHonorariumRef({ ...baseInput, session_refs: ['session:one', 'session:one'] }), /session_refs must not contain duplicates/);
assert.throws(() => evaluateSpeakerHonorariumRef({ ...baseInput, honorarium_terms: { enabled: false, honorarium_ref: 'honorarium:not_allowed' } }), /disabled honorarium_terms must not carry/);
assert.throws(() => evaluateSpeakerHonorariumRef({ ...baseInput, honorarium_terms: { enabled: true, honorarium_ref: '', amount_minor_units: 1, currency: 'USD' } }), /honorarium_terms.honorarium_ref is required/);
assert.throws(() => evaluateSpeakerHonorariumRef({ ...baseInput, honorarium_terms: { enabled: true, honorarium_ref: 'honorarium:bad', amount_minor_units: -1, currency: 'USD' } }), /amount_minor_units must be a non-negative integer/);
assert.throws(() => evaluateSpeakerHonorariumRef({ ...baseInput, honorarium_terms: { enabled: true, honorarium_ref: 'honorarium:bad', amount_minor_units: 1, currency: 'US' } }), /currency must be a 3-letter/);
assert.throws(() => evaluateSpeakerHonorariumRef({ ...baseInput, person_identity_write_requested: true }), /not write identity data/);
assert.throws(() => evaluateSpeakerHonorariumRef({ ...baseInput, finance_invoice_write_requested: true }), /not write invoices/);
assert.throws(() => evaluateSpeakerHonorariumRef({ ...baseInput, payment_capture_requested: true }), /must not capture payment/);
assert.throws(() => evaluateSpeakerHonorariumRef({ ...baseInput, payroll_write_requested: true }), /must not write payroll/);
assert.throws(() => evaluateSpeakerHonorariumRef({ ...baseInput, provider_adapter_requested: true }), /must not execute provider adapters/);
assert.throws(() => evaluateSpeakerHonorariumRef({ ...baseInput, persistence_requested: true }), /must not persist records/);
assert.throws(() => evaluateSpeakerHonorariumRef({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluateSpeakerHonorariumRef({ ...baseInput, frontend_requested: true }), /must not create frontend surfaces/);

console.log('P6C runtime speaker_honorarium_ref test passed.');
