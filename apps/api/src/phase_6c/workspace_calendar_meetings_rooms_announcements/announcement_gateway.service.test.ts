import assert from 'node:assert/strict';

import { evaluateAnnouncementGateway, type AnnouncementGatewayInput } from './announcement_gateway.service';

const baseInput: AnnouncementGatewayInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_announcement_gateway',
  announcement_id: 'announcement_001',
  source_record_ref: 'calendar_announcement_record_001',
  requested_by_user_id: 'user_announcements_admin',
  requested_at: '2026-06-09T09:00:00.000Z',
  notice_class: 'OPT_OUT_ELIGIBLE_ANNOUNCEMENT',
  title: 'Room maintenance window',
  body: 'Main conference room maintenance starts at 18:00.',
  channels: ['EMAIL', 'IN_APP', 'EMAIL'],
  audience_segments: [
    { segment_ref: 'role_facility_coordinators', segment_kind: 'ROLE' },
    { segment_ref: 'location_primary_site', segment_kind: 'LOCATION' },
  ],
  recipients: [
    { user_id: 'user_active', gateway_address_ref: 'gateway_ref_user_active', opted_out: false },
    { user_id: 'user_opted_out', gateway_address_ref: 'gateway_ref_user_opted_out', opted_out: true },
  ],
  gateway_policy_ref: 'communication_gateway_policy_adl_004',
  idempotency_key: 'announcement_001_first_evaluation',
};

const nonMandatoryReceipt = evaluateAnnouncementGateway(baseInput);
assert.equal(nonMandatoryReceipt.seed_id, 'seed_6c_088_announcement_gateway');
assert.equal(nonMandatoryReceipt.component_id, '6C.07');
assert.equal(nonMandatoryReceipt.event_name, 'phase_6c.workspace_calendar_meetings_rooms_announcements.announcement_gateway.runtime_evaluated');
assert.equal(nonMandatoryReceipt.decision, 'PARTIAL_WITH_BLOCKED_RECIPIENTS');
assert.equal(nonMandatoryReceipt.gateway_route_required, true);
assert.equal(nonMandatoryReceipt.direct_provider_send_allowed, false);
assert.equal(nonMandatoryReceipt.runtime_adapter_executed, false);
assert.equal(nonMandatoryReceipt.persistence_executed, false);
assert.equal(nonMandatoryReceipt.mandatory_notice_opt_out_exempt, false);
assert.equal(nonMandatoryReceipt.non_mandatory_opt_out_enforced, true);
assert.deepEqual(nonMandatoryReceipt.adl_refs, ['ADL-004']);
assert.deepEqual(nonMandatoryReceipt.decision_refs, [
  '6C-CAL-006',
  '6C-CAL-007',
  '6C-GLOBAL-013',
  '6C-ADL-008',
  '6C-ADL-009',
  '6C-GLOBAL-018',
]);
assert.equal(nonMandatoryReceipt.delivery_intents.length, 2);
assert.equal(nonMandatoryReceipt.delivery_intents.every((intent) => intent.route === 'COMMUNICATION_GATEWAY'), true);
assert.equal(nonMandatoryReceipt.delivery_intents.every((intent) => intent.provider_payload_created === false), true);
assert.equal(nonMandatoryReceipt.delivery_intents.every((intent) => intent.opt_out_mode === 'GLOBAL_OPT_OUT_APPLIED'), true);
assert.deepEqual(nonMandatoryReceipt.blocked_recipients, [
  { user_id: 'user_opted_out', reason: 'GLOBAL_OPT_OUT', adl_refs: ['ADL-004'] },
]);
assert.match(nonMandatoryReceipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateAnnouncementGateway(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, nonMandatoryReceipt.runtime_evidence_digest);

const mandatoryReceipt = evaluateAnnouncementGateway({
  ...baseInput,
  notice_class: 'MANDATORY_NOTICE',
  idempotency_key: 'announcement_001_mandatory_notice',
});
assert.equal(mandatoryReceipt.decision, 'READY_FOR_GATEWAY');
assert.equal(mandatoryReceipt.mandatory_notice_opt_out_exempt, true);
assert.equal(mandatoryReceipt.non_mandatory_opt_out_enforced, false);
assert.equal(mandatoryReceipt.blocked_recipients.length, 0);
assert.equal(mandatoryReceipt.delivery_intents.length, 4);
assert.equal(mandatoryReceipt.delivery_intents.every((intent) => intent.opt_out_mode === 'MANDATORY_NOTICE_EXEMPTION_APPLIED'), true);

const blockedReceipt = evaluateAnnouncementGateway({
  ...baseInput,
  recipients: [{ user_id: 'user_missing_ref', gateway_address_ref: ' ', opted_out: false }],
  idempotency_key: 'announcement_001_missing_gateway_ref',
});
assert.equal(blockedReceipt.decision, 'BLOCKED_NO_DELIVERABLE_RECIPIENTS');
assert.deepEqual(blockedReceipt.blocked_recipients, [
  { user_id: 'user_missing_ref', reason: 'MISSING_GATEWAY_ADDRESS_REF', adl_refs: ['ADL-004'] },
]);

assert.throws(() => evaluateAnnouncementGateway({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateAnnouncementGateway({ ...baseInput, requested_at: 'not-a-date' }), /requested_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateAnnouncementGateway({ ...baseInput, channels: [] }), /channels must include at least one Communication Gateway channel/);
assert.throws(() => evaluateAnnouncementGateway({ ...baseInput, channels: ['FAX' as never] }), /unsupported channel FAX/);
assert.throws(() => evaluateAnnouncementGateway({ ...baseInput, audience_segments: [] }), /audience_segments must include at least one source audience segment/);
assert.throws(() => evaluateAnnouncementGateway({ ...baseInput, recipients: [] }), /recipients must include at least one Communication Gateway recipient/);
assert.throws(() => evaluateAnnouncementGateway({ ...baseInput, recipients: [baseInput.recipients[0], baseInput.recipients[0]] }), /duplicate user_id user_active/);
assert.throws(() => evaluateAnnouncementGateway({ ...baseInput, direct_provider_send_requested: true }), /must not create direct provider sends/);
assert.throws(() => evaluateAnnouncementGateway({ ...baseInput, gateway_bypass_requested: true }), /must not bypass Communication Gateway enforcement/);
assert.throws(() => evaluateAnnouncementGateway({ ...baseInput, opt_out_bypass_requested: true }), /must not accept manual opt-out bypass requests/);
assert.throws(() => evaluateAnnouncementGateway({ ...baseInput, persistence_requested: true }), /must not persist announcement delivery state/);
assert.throws(() => evaluateAnnouncementGateway({ ...baseInput, runtime_adapter_requested: true }), /must not execute provider runtime adapters/);

console.log('P6C runtime announcement_gateway test passed.');
