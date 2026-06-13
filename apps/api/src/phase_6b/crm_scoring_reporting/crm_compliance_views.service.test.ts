import assert from 'node:assert/strict';
import { registerCrmComplianceView, type CrmComplianceViewInput } from './crm_compliance_views.service';

const baseInput: CrmComplianceViewInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_crm_scoring_reporting',
  compliance_view_id: 'crm_compliance_view_001',
  view_name: 'CRM compliance evidence view',
  audience: 'SUPPORT_AUDIT',
  pipeline_stage_model_ref: 'pipeline_stage_model_001',
  whatsapp_template_management_ref: 'whatsapp_template_management_001',
  optimization_fact_store_ref: 'optimization_fact_store_001',
  lifecycle_status: 'ACTIVE',
  visible_field_refs: ['lead_record_ref', 'score_band', 'task_evidence_ref'],
  prohibited_field_refs: ['credential_material', 'raw_message_body'],
  evidence_sources: [
    {
      source_id: 'report_evidence_source',
      source_type: 'REPORT_EVIDENCE',
      evidence_ref: 'crm_report_definition_001',
      evidence_label: 'report_definition_compliance_evidence',
    },
    {
      source_id: 'task_evidence_source',
      source_type: 'TASK_EVIDENCE',
      evidence_ref: 'follow_up_task_evidence_001',
      evidence_label: 'follow_up_task_compliance_evidence',
    },
  ],
  configured_by_user_id: 'user_compliance_owner_001',
  configured_at: '2026-06-08T22:25:00.000Z',
};

const receipt = registerCrmComplianceView(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_08_crm_compliance_views');
assert.equal(receipt.component_id, '6B.08');
assert.equal(receipt.event_name, 'phase_6b.crm_scoring_reporting.crm_compliance_view.registered');
assert.equal(receipt.audience, 'SUPPORT_AUDIT');
assert.equal(receipt.lifecycle_status, 'ACTIVE');
assert.equal(receipt.visible_field_count, 3);
assert.equal(receipt.prohibited_field_count, 2);
assert.equal(receipt.evidence_source_count, 2);
assert.equal(receipt.data_query_allowed, false);
assert.equal(receipt.export_allowed, false);
assert.equal(receipt.frontend_render_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const draftReceipt = registerCrmComplianceView({
  ...baseInput,
  compliance_view_id: 'crm_compliance_view_002',
  audience: 'BILLING_EVIDENCE_REVIEW',
  lifecycle_status: 'DRAFT',
  prohibited_field_refs: [],
});
assert.equal(draftReceipt.audience, 'BILLING_EVIDENCE_REVIEW');
assert.equal(draftReceipt.lifecycle_status, 'DRAFT');
assert.equal(draftReceipt.prohibited_field_count, 0);

assert.throws(() => registerCrmComplianceView({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, compliance_view_id: '' }), /compliance_view_id is required/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, view_name: '' }), /view_name is required/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, audience: 'PUBLIC' as never }), /audience is not supported/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, pipeline_stage_model_ref: '' }), /pipeline_stage_model_ref is required/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, whatsapp_template_management_ref: '' }), /whatsapp_template_management_ref is required/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, optimization_fact_store_ref: '' }), /optimization_fact_store_ref is required/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, lifecycle_status: 'DELETED' as never }), /lifecycle_status is not supported/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, visible_field_refs: [] }), /visible_field_refs must include at least one value/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, visible_field_refs: ['lead_record_ref', 'lead_record_ref'] }), /visible_field_refs must not contain duplicates/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, visible_field_refs: [''] }), /visible_field_refs is required/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, prohibited_field_refs: ['raw_message_body', 'raw_message_body'] }), /prohibited_field_refs must not contain duplicates/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, visible_field_refs: ['raw_message_body'], prohibited_field_refs: ['raw_message_body'] }), /visible_field_refs must not overlap prohibited_field_refs/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, evidence_sources: [] }), /evidence_sources must include at least one source/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, evidence_sources: [{ ...baseInput.evidence_sources[0]!, source_id: '' }] }), /evidence_sources.source_id is required/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, evidence_sources: [{ ...baseInput.evidence_sources[0]!, source_type: 'RAW_DB' as never }] }), /source_type is not supported/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, evidence_sources: [{ ...baseInput.evidence_sources[0]!, evidence_ref: '' }] }), /evidence_sources.evidence_ref is required/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, evidence_sources: [{ ...baseInput.evidence_sources[0]!, evidence_label: '' }] }), /evidence_sources.evidence_label is required/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, evidence_sources: [{ ...baseInput.evidence_sources[0]!, source_id: 'duplicate' }, { ...baseInput.evidence_sources[1]!, source_id: 'duplicate' }] }), /evidence_sources must not repeat source_id/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, configured_by_user_id: '' }), /configured_by_user_id is required/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, configured_at: 'not-a-date' }), /configured_at must be a valid ISO-compatible timestamp/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, data_query_requested: true }), /must not execute data queries/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, export_requested: true }), /must not export data/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, frontend_render_requested: true }), /must not render frontend views/);
assert.throws(() => registerCrmComplianceView({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-063 crm compliance views service test passed.');
