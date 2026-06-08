import assert from 'node:assert/strict';
import { planFollowUpTaskCadence, type FollowUpTaskCadenceInput } from './follow_up_task_cadence.service';

const baseInput: FollowUpTaskCadenceInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_crm_scoring_reporting',
  cadence_id: 'follow_up_cadence_001',
  lead_record_ref: 'lead_record_001',
  pipeline_stage_model_ref: 'pipeline_stage_model_001',
  whatsapp_template_management_ref: 'whatsapp_template_management_001',
  optimization_fact_store_ref: 'optimization_fact_store_001',
  anchor_at: '2026-06-08T08:00:00.000Z',
  lifecycle_status: 'ACTIVE',
  cadence_steps: [
    {
      step_id: 'second_follow_up',
      step_order: 2,
      offset_minutes_after_anchor: 1440,
      task_title: 'Second follow-up',
      task_priority: 'NORMAL',
      channel: 'EMAIL_TASK_REFERENCE',
      evidence_label: 'second_follow_up_task_evidence',
      active: true,
    },
    {
      step_id: 'first_follow_up',
      step_order: 1,
      offset_minutes_after_anchor: 60,
      task_title: 'First follow-up',
      task_priority: 'HIGH',
      channel: 'WHATSAPP_TEMPLATE_REMINDER',
      evidence_label: 'first_follow_up_task_evidence',
      active: true,
    },
    {
      step_id: 'inactive_reference',
      step_order: 3,
      offset_minutes_after_anchor: 2880,
      task_title: 'Inactive reference',
      task_priority: 'LOW',
      channel: 'TASK_ONLY',
      evidence_label: 'inactive_follow_up_task_evidence',
      active: false,
    },
  ],
  configured_by_user_id: 'user_scoring_owner_001',
  configured_at: '2026-06-08T21:45:00.000Z',
};

const receipt = planFollowUpTaskCadence(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_08_follow_up_task_cadence');
assert.equal(receipt.component_id, '6B.08');
assert.equal(receipt.event_name, 'phase_6b.crm_scoring_reporting.follow_up_task_cadence.planned');
assert.equal(receipt.lifecycle_status, 'ACTIVE');
assert.equal(receipt.active_step_count, 2);
assert.equal(receipt.planned_tasks.length, 2);
assert.equal(receipt.planned_tasks[0]?.task_id, 'follow_up_cadence_001__first_follow_up');
assert.equal(receipt.planned_tasks[0]?.due_at, '2026-06-08T09:00:00.000Z');
assert.equal(receipt.planned_tasks[0]?.channel, 'WHATSAPP_TEMPLATE_REMINDER');
assert.equal(receipt.planned_tasks[1]?.due_at, '2026-06-09T08:00:00.000Z');
assert.equal(receipt.scheduler_execution_allowed, false);
assert.equal(receipt.communication_send_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const draftReceipt = planFollowUpTaskCadence({
  ...baseInput,
  cadence_id: 'follow_up_cadence_002',
  lifecycle_status: 'DRAFT',
  cadence_steps: [{ ...baseInput.cadence_steps[0]!, active: false }, { ...baseInput.cadence_steps[1]!, active: true }],
});
assert.equal(draftReceipt.lifecycle_status, 'DRAFT');
assert.equal(draftReceipt.active_step_count, 1);
assert.equal(draftReceipt.planned_tasks[0]?.task_id, 'follow_up_cadence_002__first_follow_up');

assert.throws(() => planFollowUpTaskCadence({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, cadence_id: '' }), /cadence_id is required/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, lead_record_ref: '' }), /lead_record_ref is required/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, pipeline_stage_model_ref: '' }), /pipeline_stage_model_ref is required/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, whatsapp_template_management_ref: '' }), /whatsapp_template_management_ref is required/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, optimization_fact_store_ref: '' }), /optimization_fact_store_ref is required/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, anchor_at: 'not-a-date' }), /anchor_at must be a valid ISO-compatible timestamp/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, lifecycle_status: 'DELETED' as never }), /lifecycle_status is not supported/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, cadence_steps: [] }), /cadence_steps must include at least one step/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, cadence_steps: [{ ...baseInput.cadence_steps[0]!, step_id: '' }] }), /cadence_steps.step_id is required/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, cadence_steps: [{ ...baseInput.cadence_steps[0]!, step_order: 0 }] }), /step_order must be a positive integer/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, cadence_steps: [{ ...baseInput.cadence_steps[0]!, offset_minutes_after_anchor: -1 }] }), /offset_minutes_after_anchor must be a non-negative integer/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, cadence_steps: [{ ...baseInput.cadence_steps[0]!, task_title: '' }] }), /cadence_steps.task_title is required/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, cadence_steps: [{ ...baseInput.cadence_steps[0]!, task_priority: 'URGENT' as never }] }), /task_priority is not supported/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, cadence_steps: [{ ...baseInput.cadence_steps[0]!, channel: 'SMS' as never }] }), /channel is not supported/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, cadence_steps: [{ ...baseInput.cadence_steps[0]!, evidence_label: '' }] }), /cadence_steps.evidence_label is required/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, cadence_steps: [{ ...baseInput.cadence_steps[0]!, step_id: 'duplicate' }, { ...baseInput.cadence_steps[1]!, step_id: 'duplicate' }] }), /cadence_steps must not repeat step_id/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, cadence_steps: [{ ...baseInput.cadence_steps[0]!, step_order: 1 }, { ...baseInput.cadence_steps[1]!, step_order: 1 }] }), /cadence_steps must not repeat step_order/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, cadence_steps: baseInput.cadence_steps.map((step) => ({ ...step, active: false })) }), /cadence_steps must include at least one active step/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, configured_by_user_id: '' }), /configured_by_user_id is required/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, configured_at: 'not-a-date' }), /configured_at must be a valid ISO-compatible timestamp/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, scheduler_execution_requested: true }), /must not execute a scheduler/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, communication_send_requested: true }), /must not send communications/);
assert.throws(() => planFollowUpTaskCadence({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-061 follow up task cadence service test passed.');
