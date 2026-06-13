import assert from 'node:assert/strict';
import { configureEmailSequence, type EmailSequenceInput } from './email_sequences.service';

const baseInput: EmailSequenceInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_communication',
  email_sequence_id: 'email_sequence_001',
  sequence_name: 'Admissions follow-up sequence',
  pipeline_stage_model_ref: 'pipeline_stage_model_001',
  global_opt_out_registry_ref: 'global_opt_out_registry_001',
  outbound_gateway_enforcement_ref: 'outbound_gateway_enforcement_001',
  enrollment_policy: 'PIPELINE_STAGE_ENTRY',
  lifecycle_status: 'ACTIVE',
  steps: [
    {
      step_id: 'email_step_002',
      step_order: 2,
      subject_template_ref: 'subject_template_followup',
      body_template_ref: 'body_template_followup',
      delay_minutes_after_previous_step: 1440,
      evidence_label: 'followup_email_attempt_evidence',
      active: true,
    },
    {
      step_id: 'email_step_001',
      step_order: 1,
      subject_template_ref: 'subject_template_welcome',
      body_template_ref: 'body_template_welcome',
      delay_minutes_after_previous_step: 0,
      evidence_label: 'welcome_email_attempt_evidence',
      active: true,
    },
  ],
  configured_by_user_id: 'user_comms_owner_001',
  configured_at: '2026-06-08T20:25:00.000Z',
};

const receipt = configureEmailSequence(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_07_email_sequences');
assert.equal(receipt.component_id, '6B.07');
assert.equal(receipt.event_name, 'phase_6b.crm_communication.email_sequence.configured');
assert.equal(receipt.enrollment_policy, 'PIPELINE_STAGE_ENTRY');
assert.equal(receipt.lifecycle_status, 'ACTIVE');
assert.equal(receipt.steps[0]?.step_id, 'email_step_001');
assert.equal(receipt.steps[1]?.step_id, 'email_step_002');
assert.equal(receipt.step_count, 2);
assert.equal(receipt.active_step_count, 2);
assert.equal(receipt.total_delay_minutes, 1440);
assert.equal(receipt.opt_out_adl_ref, 'ADL-004');
assert.equal(receipt.outbound_gateway_adl_ref, 'ADL-004');
assert.equal(receipt.immediate_send_allowed, false);
assert.equal(receipt.provider_callback_allowed, false);
assert.equal(receipt.credential_material_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const draftReceipt = configureEmailSequence({
  ...baseInput,
  email_sequence_id: 'email_sequence_002',
  enrollment_policy: 'MANUAL_APPROVAL',
  lifecycle_status: 'DRAFT',
  steps: [{ ...baseInput.steps[0]!, active: false }, { ...baseInput.steps[1]!, active: true }],
});
assert.equal(draftReceipt.enrollment_policy, 'MANUAL_APPROVAL');
assert.equal(draftReceipt.lifecycle_status, 'DRAFT');
assert.equal(draftReceipt.active_step_count, 1);

assert.throws(() => configureEmailSequence({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => configureEmailSequence({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => configureEmailSequence({ ...baseInput, email_sequence_id: '' }), /email_sequence_id is required/);
assert.throws(() => configureEmailSequence({ ...baseInput, sequence_name: '' }), /sequence_name is required/);
assert.throws(() => configureEmailSequence({ ...baseInput, pipeline_stage_model_ref: '' }), /pipeline_stage_model_ref is required/);
assert.throws(() => configureEmailSequence({ ...baseInput, global_opt_out_registry_ref: '' }), /global_opt_out_registry_ref is required/);
assert.throws(() => configureEmailSequence({ ...baseInput, outbound_gateway_enforcement_ref: '' }), /outbound_gateway_enforcement_ref is required/);
assert.throws(() => configureEmailSequence({ ...baseInput, enrollment_policy: 'AUTO_SEND' as never }), /enrollment_policy is not supported/);
assert.throws(() => configureEmailSequence({ ...baseInput, lifecycle_status: 'DELETED' as never }), /lifecycle_status is not supported/);
assert.throws(() => configureEmailSequence({ ...baseInput, steps: [] }), /steps must include at least one/);
assert.throws(() => configureEmailSequence({ ...baseInput, steps: [{ ...baseInput.steps[0]!, step_id: '' }] }), /steps.step_id is required/);
assert.throws(() => configureEmailSequence({ ...baseInput, steps: [{ ...baseInput.steps[0]!, step_order: 0 }] }), /step_order must be a positive integer/);
assert.throws(() => configureEmailSequence({ ...baseInput, steps: [{ ...baseInput.steps[0]!, subject_template_ref: '' }] }), /steps.subject_template_ref is required/);
assert.throws(() => configureEmailSequence({ ...baseInput, steps: [{ ...baseInput.steps[0]!, body_template_ref: '' }] }), /steps.body_template_ref is required/);
assert.throws(() => configureEmailSequence({ ...baseInput, steps: [{ ...baseInput.steps[0]!, delay_minutes_after_previous_step: -1 }] }), /delay_minutes_after_previous_step must be non-negative/);
assert.throws(() => configureEmailSequence({ ...baseInput, steps: [{ ...baseInput.steps[0]!, evidence_label: '' }] }), /steps.evidence_label is required/);
assert.throws(() => configureEmailSequence({ ...baseInput, steps: [{ ...baseInput.steps[0]!, step_id: 'duplicate' }, { ...baseInput.steps[1]!, step_id: 'duplicate' }] }), /steps must not repeat step_id/);
assert.throws(() => configureEmailSequence({ ...baseInput, steps: [{ ...baseInput.steps[0]!, step_order: 1 }, { ...baseInput.steps[1]!, step_order: 1 }] }), /steps must not repeat step_order/);
assert.throws(() => configureEmailSequence({ ...baseInput, steps: baseInput.steps.map((step) => ({ ...step, active: false })) }), /steps must include at least one active step/);
assert.throws(() => configureEmailSequence({ ...baseInput, configured_by_user_id: '' }), /configured_by_user_id is required/);
assert.throws(() => configureEmailSequence({ ...baseInput, configured_at: 'not-a-date' }), /configured_at must be a valid ISO-compatible timestamp/);
assert.throws(() => configureEmailSequence({ ...baseInput, immediate_send_requested: true }), /must not send email immediately/);
assert.throws(() => configureEmailSequence({ ...baseInput, provider_callback_requested: true }), /must not process provider callbacks/);
assert.throws(() => configureEmailSequence({ ...baseInput, credential_material_requested: true }), /must not handle credential material/);
assert.throws(() => configureEmailSequence({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-057 email sequences service test passed.');
