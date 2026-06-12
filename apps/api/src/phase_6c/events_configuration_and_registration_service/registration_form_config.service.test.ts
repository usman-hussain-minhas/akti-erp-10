import assert from 'node:assert/strict';

import { evaluateRegistrationFormConfig, type RegistrationFormConfigInput } from './registration_form_config.service';

const baseInput: RegistrationFormConfigInput = {
  organization_id: 'org_phase_6c_events',
  service_manifest_contract_id: 'smc_phase_6c_registration_form_config',
  event_configuration_id: 'event_config_001',
  registration_form_config_id: 'registration_form_config_001',
  source_record_ref: 'registration_form_config_record_001',
  evaluated_by_user_id: 'user_phase_6c_events',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  configuration_engine_ref: 'config_engine:event_registration_form_001',
  form_version: 'v1.0.0',
  fields: [
    {
      field_key: 'Full_Name',
      label: 'Full name',
      field_type: 'TEXT',
      required: true,
      data_class: 'PUBLIC',
    },
    {
      field_key: 'email_address',
      label: 'Email address',
      field_type: 'EMAIL',
      required: true,
      data_class: 'CONTACT',
    },
    {
      field_key: 'dietary_preference',
      label: 'Dietary preference',
      field_type: 'SELECT',
      required: false,
      data_class: 'PUBLIC',
      options: [
        { option_key: 'none', label: 'None', active: true },
        { option_key: 'vegetarian', label: 'Vegetarian', active: true },
      ],
    },
    {
      field_key: 'accessibility_note',
      label: 'Accessibility note',
      field_type: 'TEXT',
      required: false,
      data_class: 'SENSITIVE',
      sensitive_field_purpose_ref: 'purpose:event_accessibility_support',
    },
    {
      field_key: 'attachment_ref',
      label: 'Attachment reference',
      field_type: 'FILE_REF',
      required: false,
      data_class: 'SENSITIVE',
      sensitive_field_purpose_ref: 'purpose:event_attachment_reference',
    },
    {
      field_key: 'guest_count',
      label: 'Guest count',
      field_type: 'NUMBER',
      required: false,
      data_class: 'PUBLIC',
      min_value: 0,
      max_value: 5,
    },
  ],
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateRegistrationFormConfig(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_100_registration_form_config');
assert.equal(receipt.component_id, '6C.08');
assert.equal(receipt.component_slug, 'events_configuration_and_registration_service');
assert.equal(receipt.model_name, 'Phase6CRegistrationFormConfig');
assert.equal(receipt.configuration_engine_ref, 'config_engine:event_registration_form_001');
assert.equal(receipt.field_count, 6);
assert.equal(receipt.required_field_count, 2);
assert.equal(receipt.sensitive_field_count, 2);
assert.equal(receipt.selectable_field_count, 1);
assert.equal(receipt.file_ref_field_count, 1);
assert.deepEqual(receipt.normalized_field_keys, ['full_name', 'email_address', 'dietary_preference', 'accessibility_note', 'attachment_ref', 'guest_count']);
assert.equal(receipt.decision, 'FORM_CONFIG_READY');
assert.deepEqual(receipt.review_reasons, []);
assert.equal(receipt.configuration_engine_driven, true);
assert.equal(receipt.frontend_render_performed, false);
assert.equal(receipt.submission_processing_performed, false);
assert.equal(receipt.configuration_write_performed, false);
assert.equal(receipt.dynamic_code_allowed, false);
assert.equal(receipt.file_upload_performed, false);
assert.equal(receipt.provider_adapter_allowed, false);
assert.equal(receipt.persistence_performed, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.match(receipt.registration_form_config_runtime_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateRegistrationFormConfig(baseInput);
assert.equal(repeatedReceipt.registration_form_config_runtime_digest, receipt.registration_form_config_runtime_digest);

const reviewReceipt = evaluateRegistrationFormConfig({
  ...baseInput,
  registration_form_config_id: 'registration_form_config_review_001',
  fields: [
    {
      field_key: 'medical_note',
      label: 'Medical note',
      field_type: 'TEXT',
      required: false,
      data_class: 'SENSITIVE',
    },
  ],
});
assert.equal(reviewReceipt.decision, 'FORM_CONFIG_REQUIRES_REVIEW');
assert.deepEqual(reviewReceipt.review_reasons, ['sensitive field medical_note requires sensitive_field_purpose_ref']);

assert.throws(() => evaluateRegistrationFormConfig({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateRegistrationFormConfig({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateRegistrationFormConfig({ ...baseInput, configuration_engine_ref: '' }), /configuration_engine_ref is required/);
assert.throws(() => evaluateRegistrationFormConfig({ ...baseInput, fields: [] }), /at least one field is required/);
assert.throws(() => evaluateRegistrationFormConfig({ ...baseInput, fields: [{ ...baseInput.fields[0], field_key: '1bad' }] }), /field_key must use lower-snake key format/);
assert.throws(() => evaluateRegistrationFormConfig({ ...baseInput, fields: [{ ...baseInput.fields[0], field_key: 'dup' }, { ...baseInput.fields[1], field_key: 'dup' }] }), /field_key values must be unique/);
assert.throws(() => evaluateRegistrationFormConfig({ ...baseInput, fields: [{ ...baseInput.fields[0], sensitive_field_purpose_ref: 'purpose:not_allowed' }] }), /only valid for SENSITIVE fields/);
assert.throws(() => evaluateRegistrationFormConfig({ ...baseInput, fields: [{ ...baseInput.fields[0], field_type: 'SELECT', options: [] }] }), /selectable field full_name requires active options/);
assert.throws(() => evaluateRegistrationFormConfig({ ...baseInput, fields: [{ ...baseInput.fields[0], options: [{ option_key: 'a', label: 'A', active: true }] }] }), /non-selectable field full_name must not declare options/);
assert.throws(() => evaluateRegistrationFormConfig({ ...baseInput, fields: [{ ...baseInput.fields[0], field_type: 'SELECT', options: [{ option_key: 'aa', label: 'A', active: false }] }] }), /requires at least one active option/);
assert.throws(() => evaluateRegistrationFormConfig({ ...baseInput, fields: [{ ...baseInput.fields[5], min_value: 6, max_value: 5 }] }), /min_value must not exceed max_value/);
assert.throws(() => evaluateRegistrationFormConfig({ ...baseInput, frontend_render_requested: true }), /must not render frontend screens/);
assert.throws(() => evaluateRegistrationFormConfig({ ...baseInput, submission_processing_requested: true }), /must not process submissions/);
assert.throws(() => evaluateRegistrationFormConfig({ ...baseInput, configuration_write_requested: true }), /not write configuration/);
assert.throws(() => evaluateRegistrationFormConfig({ ...baseInput, dynamic_code_requested: true }), /must not execute dynamic code/);
assert.throws(() => evaluateRegistrationFormConfig({ ...baseInput, file_upload_requested: true }), /may reference file fields, not upload files/);
assert.throws(() => evaluateRegistrationFormConfig({ ...baseInput, provider_adapter_requested: true }), /must not execute provider adapters/);
assert.throws(() => evaluateRegistrationFormConfig({ ...baseInput, persistence_requested: true }), /must not persist records/);
assert.throws(() => evaluateRegistrationFormConfig({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);

console.log('P6C runtime registration_form_config test passed.');
