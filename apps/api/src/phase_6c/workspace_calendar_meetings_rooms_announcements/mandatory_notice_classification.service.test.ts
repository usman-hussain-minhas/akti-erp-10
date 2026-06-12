import assert from 'node:assert/strict';

import { classifyMandatoryNotice, type MandatoryNoticeClassificationInput } from './mandatory_notice_classification.service';

const baseInput: MandatoryNoticeClassificationInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_mandatory_notice_classification',
  notice_id: 'notice_001',
  source_record_ref: 'notice_source_record_001',
  requested_by_user_id: 'user_notice_admin',
  requested_at: '2026-06-09T09:00:00.000Z',
  notice_purpose: 'GENERAL_ANNOUNCEMENT',
  title: 'Workspace policy reminder',
  body: 'Please review the posted workspace note.',
};

const optOutReceipt = classifyMandatoryNotice(baseInput);
assert.equal(optOutReceipt.seed_id, 'seed_6c_089_mandatory_notice_classification');
assert.equal(optOutReceipt.component_id, '6C.07');
assert.equal(optOutReceipt.event_name, 'phase_6c.workspace_calendar_meetings_rooms_announcements.mandatory_notice_classification.runtime_evaluated');
assert.equal(optOutReceipt.classification, 'OPT_OUT_ELIGIBLE_ANNOUNCEMENT');
assert.equal(optOutReceipt.gateway_route_required, true);
assert.equal(optOutReceipt.mandatory_notice_opt_out_exempt, false);
assert.equal(optOutReceipt.opt_out_enforcement_required, true);
assert.equal(optOutReceipt.direct_provider_send_allowed, false);
assert.equal(optOutReceipt.runtime_adapter_executed, false);
assert.equal(optOutReceipt.persistence_executed, false);
assert.deepEqual(optOutReceipt.adl_refs, ['ADL-004']);
assert.deepEqual(optOutReceipt.decision_refs, ['6C-CAL-007', '6C-CAL-006', '6C-GLOBAL-013', '6C-ADL-008', '6C-ADL-009']);
assert.match(optOutReceipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = classifyMandatoryNotice(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, optOutReceipt.runtime_evidence_digest);

const mandatoryReceipt = classifyMandatoryNotice({
  ...baseInput,
  notice_id: 'notice_002',
  notice_purpose: 'MANDATORY_COMPLIANCE',
  tenant_marked_mandatory: true,
  mandatory_basis: 'LEGAL_REQUIREMENT',
  mandatory_source_authority_ref: 'tenant_policy_ref_required_notice_002',
});
assert.equal(mandatoryReceipt.classification, 'MANDATORY_NOTICE');
assert.equal(mandatoryReceipt.mandatory_notice_opt_out_exempt, true);
assert.equal(mandatoryReceipt.opt_out_enforcement_required, false);
assert.equal(mandatoryReceipt.classification_basis, 'LEGAL_REQUIREMENT');
assert.equal(mandatoryReceipt.mandatory_source_authority_ref, 'tenant_policy_ref_required_notice_002');
assert.deepEqual(mandatoryReceipt.manual_review_reasons, []);

const reminderReceipt = classifyMandatoryNotice({
  ...baseInput,
  notice_id: 'notice_003',
  notice_purpose: 'REMINDER',
});
assert.equal(reminderReceipt.classification, 'OPT_OUT_ELIGIBLE_REMINDER');
assert.equal(reminderReceipt.opt_out_enforcement_required, true);

const manualReviewReceipt = classifyMandatoryNotice({
  ...baseInput,
  notice_id: 'notice_004',
  notice_purpose: 'MANDATORY_OPERATIONAL',
  tenant_marked_mandatory: true,
});
assert.equal(manualReviewReceipt.classification, 'REQUIRES_MANUAL_REVIEW');
assert.deepEqual(manualReviewReceipt.manual_review_reasons, ['MISSING_MANDATORY_BASIS', 'MISSING_SOURCE_AUTHORITY']);
assert.equal(manualReviewReceipt.opt_out_enforcement_required, true);

const conflictingReceipt = classifyMandatoryNotice({
  ...baseInput,
  notice_id: 'notice_005',
  notice_purpose: 'PROMOTIONAL',
  mandatory_basis: 'POLICY_ACKNOWLEDGEMENT_REQUIRED',
  mandatory_source_authority_ref: 'tenant_policy_ref_conflicting_notice',
});
assert.equal(conflictingReceipt.classification, 'REQUIRES_MANUAL_REVIEW');
assert.deepEqual(conflictingReceipt.manual_review_reasons, ['CONFLICTING_PURPOSE_AND_BASIS']);

const contentOnlyReceipt = classifyMandatoryNotice({
  ...baseInput,
  notice_id: 'notice_006',
  title: 'Mandatory review requested',
  body: 'This title alone must not create an opt-out exemption.',
});
assert.equal(contentOnlyReceipt.classification, 'OPT_OUT_ELIGIBLE_ANNOUNCEMENT');
assert.equal(contentOnlyReceipt.opt_out_enforcement_required, true);

assert.throws(() => classifyMandatoryNotice({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => classifyMandatoryNotice({ ...baseInput, requested_at: 'not-a-date' }), /requested_at must be a valid ISO-compatible timestamp/);
assert.throws(() => classifyMandatoryNotice({ ...baseInput, notice_purpose: 'UNKNOWN' as never }), /unsupported value UNKNOWN/);
assert.throws(() => classifyMandatoryNotice({ ...baseInput, mandatory_basis: 'UNCITED' as never }), /unsupported value UNCITED/);
assert.throws(() => classifyMandatoryNotice({ ...baseInput, direct_provider_send_requested: true }), /must not create direct provider sends/);
assert.throws(() => classifyMandatoryNotice({ ...baseInput, gateway_bypass_requested: true }), /must not bypass Communication Gateway routing/);
assert.throws(() => classifyMandatoryNotice({ ...baseInput, opt_out_bypass_requested: true }), /must not accept manual opt-out bypass requests/);
assert.throws(() => classifyMandatoryNotice({ ...baseInput, persistence_requested: true }), /must not persist classification state/);
assert.throws(() => classifyMandatoryNotice({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);

console.log('P6C runtime mandatory_notice_classification test passed.');
