import assert from 'node:assert/strict';
import { configureWhatsappTemplateManagement, type WhatsappTemplateManagementInput } from './whatsapp_template_management.service';

const baseInput: WhatsappTemplateManagementInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_communication',
  whatsapp_template_id: 'whatsapp_template_001',
  pipeline_stage_model_ref: 'pipeline_stage_model_001',
  template_key: 'qualification_follow_up',
  display_name: 'Qualification follow up',
  category: 'UTILITY',
  lifecycle_status: 'READY_FOR_PROVIDER_REVIEW',
  language_code: 'en-PK',
  body_template: 'Hello {{lead_name}}, your {{product_name}} enquiry is ready for qualification review.',
  variables: [
    { variable_name: 'product_name', sample_value: 'Commerce package', required: true },
    { variable_name: 'lead_name', sample_value: 'Ayesha', required: true },
  ],
  approval_evidence_refs: ['template_policy_review_001'],
  global_opt_out_registry_ref: 'global_opt_out_registry_reference',
  configured_by_user_id: 'user_comms_owner_001',
  configured_at: '2026-06-08T18:50:00.000Z',
};

const receipt = configureWhatsappTemplateManagement(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_07_whatsapp_template_management');
assert.equal(receipt.component_id, '6B.07');
assert.equal(receipt.event_name, 'phase_6b.crm_communication.whatsapp_template_management.configured');
assert.equal(receipt.whatsapp_template_id, 'whatsapp_template_001');
assert.equal(receipt.pipeline_stage_model_ref, 'pipeline_stage_model_001');
assert.equal(receipt.template_key, 'qualification_follow_up');
assert.equal(receipt.category, 'UTILITY');
assert.equal(receipt.lifecycle_status, 'READY_FOR_PROVIDER_REVIEW');
assert.equal(receipt.language_code, 'en-PK');
assert.deepEqual(receipt.variables.map((variable) => variable.variable_name), ['lead_name', 'product_name']);
assert.equal(receipt.variable_count, 2);
assert.equal(receipt.approval_evidence_count, 1);
assert.equal(receipt.opt_out_dependency_tier, 'CONDITIONAL_SETUP_REFERENCE');
assert.equal(receipt.send_gateway_required_for_future_send, true);
assert.equal(receipt.outbound_send_allowed, false);
assert.equal(receipt.provider_submission_allowed, false);
assert.equal(receipt.credential_material_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const draftReceipt = configureWhatsappTemplateManagement({
  ...baseInput,
  whatsapp_template_id: 'whatsapp_template_002',
  lifecycle_status: 'DRAFT',
  language_code: 'ur',
  approval_evidence_refs: [],
  global_opt_out_registry_ref: undefined,
});
assert.equal(draftReceipt.lifecycle_status, 'DRAFT');
assert.equal(draftReceipt.language_code, 'ur');
assert.equal(draftReceipt.approval_evidence_count, 0);
assert.equal(draftReceipt.global_opt_out_registry_ref, undefined);

assert.throws(() => configureWhatsappTemplateManagement({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => configureWhatsappTemplateManagement({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => configureWhatsappTemplateManagement({ ...baseInput, whatsapp_template_id: '' }), /whatsapp_template_id is required/);
assert.throws(() => configureWhatsappTemplateManagement({ ...baseInput, pipeline_stage_model_ref: '' }), /pipeline_stage_model_ref is required/);
assert.throws(() => configureWhatsappTemplateManagement({ ...baseInput, template_key: 'QualificationFollowUp' }), /template_key must be lower snake case/);
assert.throws(() => configureWhatsappTemplateManagement({ ...baseInput, display_name: '' }), /display_name is required/);
assert.throws(() => configureWhatsappTemplateManagement({ ...baseInput, category: 'SALES' as never }), /category is not supported/);
assert.throws(() => configureWhatsappTemplateManagement({ ...baseInput, lifecycle_status: 'SENT' as never }), /lifecycle_status is not supported/);
assert.throws(() => configureWhatsappTemplateManagement({ ...baseInput, language_code: 'eng' }), /language_code must use a supported language tag/);
assert.throws(() => configureWhatsappTemplateManagement({ ...baseInput, body_template: '' }), /body_template is required/);
assert.throws(() => configureWhatsappTemplateManagement({ ...baseInput, variables: [] }), /variables must contain at least one variable/);
assert.throws(
  () => configureWhatsappTemplateManagement({ ...baseInput, variables: [{ ...baseInput.variables[0]!, variable_name: 'LeadName' }] }),
  /variable_name must be lower snake case/,
);
assert.throws(
  () => configureWhatsappTemplateManagement({ ...baseInput, variables: [baseInput.variables[0]!, baseInput.variables[0]!] }),
  /variables must not contain duplicate/,
);
assert.throws(
  () => configureWhatsappTemplateManagement({ ...baseInput, body_template: 'Hello {{missing_name}}.' }),
  /body_template must not reference undeclared variables/,
);
assert.throws(
  () => configureWhatsappTemplateManagement({ ...baseInput, body_template: 'Hello {{lead_name}}.' }),
  /variables must all be referenced by body_template/,
);
assert.throws(() => configureWhatsappTemplateManagement({ ...baseInput, approval_evidence_refs: ['review_1', 'review_1'] }), /approval_evidence_refs must not contain duplicate/);
assert.throws(() => configureWhatsappTemplateManagement({ ...baseInput, global_opt_out_registry_ref: '' }), /global_opt_out_registry_ref is required/);
assert.throws(() => configureWhatsappTemplateManagement({ ...baseInput, configured_by_user_id: '' }), /configured_by_user_id is required/);
assert.throws(() => configureWhatsappTemplateManagement({ ...baseInput, configured_at: 'not-a-date' }), /configured_at must be a valid ISO-compatible timestamp/);
assert.throws(() => configureWhatsappTemplateManagement({ ...baseInput, outbound_send_requested: true }), /must not send outbound messages/);
assert.throws(() => configureWhatsappTemplateManagement({ ...baseInput, provider_submission_requested: true }), /must not submit templates to providers/);
assert.throws(() => configureWhatsappTemplateManagement({ ...baseInput, credential_material_requested: true }), /must not handle credential material/);
assert.throws(() => configureWhatsappTemplateManagement({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-050 whatsapp template management service test passed.');
