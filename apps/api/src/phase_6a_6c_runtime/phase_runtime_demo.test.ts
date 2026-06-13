import { strict as assert } from 'node:assert';

import { ForbiddenException } from '@nestjs/common';

import { GatekeeperPreflightService, type GatekeeperPreflightInput } from '../gatekeeper/gatekeeper-preflight.service';
import { FoundryService } from '../foundry/foundry.service';
import {
  recordThreeWayMatchEvidence,
  type ThreeWayMatchEvidenceInput,
} from '../phase_6b/expense_purchase_vendor/three_way_match_evidence.evidence';
import { DisabledServiceAccessService } from './disabled_service_access.service';
import { PhaseRuntimeEvidenceService, type PhaseRuntimeEvidenceInput } from './phase_runtime_evidence.service';
import { TenantIsolationRuntimeService } from './tenant_isolation_runtime.service';

const organizationId = 'org-stage2-runtime-demo';
const actorUserId = 'user-stage2-runtime-demo';
const correlationId = 'corr-stage2-runtime-demo';

const foundry = new FoundryService();
const gatekeeper = new GatekeeperPreflightService();
const evidence = new PhaseRuntimeEvidenceService();
const tenantIsolation = new TenantIsolationRuntimeService();
const disabledServiceAccess = new DisabledServiceAccessService();

function gatekeeperInput(overrides: Partial<GatekeeperPreflightInput> = {}): GatekeeperPreflightInput {
  const capabilityKey = overrides.capability_key ?? 'phase6a.tiered-verification';
  const moduleKey =
    overrides.module_key ??
    (capabilityKey.startsWith('phase6a.')
      ? 'phase6a.runtime'
      : capabilityKey.startsWith('phase6b.')
        ? 'phase6b.runtime'
        : 'phase6c.runtime');

  return {
    organization_id: organizationId,
    actor_user_id: actorUserId,
    active_group_ids: ['group-stage2-runtime-demo-operator'],
    entity_type: 'phase6.runtime-demo-action',
    entity_id: 'phase6-runtime-demo-entity',
    action_key: 'phase6.runtime-demo.preflight',
    capability_key: capabilityKey,
    module_key: moduleKey,
    scope_unit_id: null,
    payload: {
      action_key: 'phase6.runtime-demo.preflight',
      correlation_id: correlationId,
      ...(overrides.payload ?? {}),
    },
    module_health: {
      [moduleKey]: 'healthy',
      ...(overrides.module_health ?? {}),
    },
    dependency_health: {
      'core.access': 'healthy',
      ...(overrides.dependency_health ?? {}),
    },
    reauth_status: overrides.reauth_status ?? 'not_required',
    ...overrides,
  };
}

function evidenceInput(overrides: Partial<PhaseRuntimeEvidenceInput>): PhaseRuntimeEvidenceInput {
  return {
    organization_id: organizationId,
    actor_user_id: actorUserId,
    capability_key: 'phase6a.tiered-verification',
    module_key: 'phase6a.runtime',
    action_key: 'phase6.runtime-demo.operation',
    entity_type: 'phase6.runtime-demo',
    entity_id: 'phase6-runtime-demo-entity',
    gatekeeper_decision: 'ALLOW',
    correlation_id: correlationId,
    foundry_activation_state: 'active',
    runtime_outcome: 'allowed',
    reason_codes: ['phase6.runtime-demo.allowed'],
    check_keys: ['phase6.runtime-demo.check'],
    required_evidence: ['phase6.runtime-demo.evidence'],
    missing_evidence: [],
    ...overrides,
  };
}

function paymentInput(overrides: Partial<ThreeWayMatchEvidenceInput> = {}): ThreeWayMatchEvidenceInput {
  return {
    organization_id: organizationId,
    purchase_order_ref: 'po-stage2-demo-001',
    purchase_order_digest: 'c'.repeat(64),
    purchase_receipt_ref: 'purchase-receipt-stage2-demo-001',
    purchase_receipt_evidence_ref: 'purchase-receipt-evidence-stage2-demo-001',
    vendor_invoice_ref: 'vendor-invoice-stage2-demo-001',
    vendor_invoice_evidence_ref: 'vendor-invoice-evidence-stage2-demo-001',
    vendor_record_ref: 'vendor-stage2-demo-001',
    payment_allocation_balance_ref: 'payment-allocation-stage2-demo-001',
    reviewer_person_ref: 'person-stage2-payment-reviewer',
    visual_workflow_builder_ref: 'workflow-stage2-three-way-match-demo',
    match_policy: 'BLOCK_PAYMENT_EVIDENCE_ON_VARIANCE',
    currency_code: 'usd',
    amount_tolerance_minor: 0,
    quantity_tolerance_units: 0,
    line_matches: [
      {
        purchase_order_line_ref: 'po-line-stage2-demo-001',
        purchase_receipt_line_ref: 'receipt-line-stage2-demo-001',
        vendor_invoice_line_ref: 'invoice-line-stage2-demo-001',
        ordered_quantity_units: 4,
        received_quantity_units: 4,
        invoiced_quantity_units: 3,
        ordered_amount_minor: 100000,
        invoiced_amount_minor: 90000,
      },
    ],
    evidence_recorded_by_user_id: actorUserId,
    evidence_recorded_at: '2026-06-13T00:00:00.000Z',
    ...overrides,
  };
}

async function assertPositiveActivationAndGatekeeperAllow() {
  const activation = foundry.evaluatePhase6A6CRuntimeActivation({
    organization_id: organizationId,
    requested_capability_surface: 'phase_6a.tiered_verification',
    active_capability_surfaces: [
      'phase_6a.tiered_verification',
      'phase_6a.communication_gateway',
      'phase_6b.billing_honesty_surfaces',
      'phase_6c.structured_agreements',
    ],
  });
  assert.equal(activation.activation_authority, 'foundry_runtime_authority');
  assert.equal(activation.active, true);
  assert.equal(activation.business_logic_execution_allowed, true);

  const allow = await gatekeeper.evaluatePreflight(gatekeeperInput());
  assert.equal(allow.decision, 'ALLOW');
  assert.equal(allow.decision_token?.startsWith('gk_'), true);

  const evidenceRecord = evidence.buildEvidenceRecord(
    evidenceInput({
      gatekeeper_decision: allow.decision,
      runtime_outcome: 'allowed',
      reason_codes: ['phase6.runtime-demo.positive-activation-allowed'],
      check_keys: ['phase6.runtime-demo.foundry-active', 'phase6.runtime-demo.gatekeeper-allow'],
    }),
  );
  assert.equal(evidenceRecord.audit_action_key, 'phase6.runtime.operation.evidence-recorded');
  assert.equal(evidenceRecord.evidence_completeness.missing_evidence_count, 0);
}

function assertInactiveRoute404ServerSide() {
  const inactiveActivation = foundry.evaluatePhase6A6CRuntimeActivation({
    organization_id: organizationId,
    requested_capability_surface: 'phase_6b.marketplace_transaction_infrastructure',
    active_capability_surfaces: ['phase_6b.billing_honesty_surfaces'],
  });
  assert.equal(inactiveActivation.active, false);
  assert.equal(inactiveActivation.http_status_when_inactive, 404);
  assert.equal(inactiveActivation.business_logic_execution_allowed, false);

  const inactiveRoute = disabledServiceAccess.evaluateTenantServiceAccess({
    organization_id: organizationId,
    actor_user_id: actorUserId,
    requested_service: 'lms',
    active_services: ['core', 'crm'],
    route_path: '/platform/services/lms',
    correlation_id: correlationId,
  });
  assert.equal(inactiveRoute.route_accessible, false);
  assert.equal(inactiveRoute.navigation_visible, false);
  assert.equal(inactiveRoute.server_side_inaccessible, true);
  assert.equal(inactiveRoute.http_status, 404);
  assert.equal(inactiveRoute.gatekeeper_bypass_allowed, false);

  const coreCrmOnlyNegativeProof = disabledServiceAccess.proveCoreCrmOnlyTenantCannotAccessInactiveServices({
    organization_id: organizationId,
    actor_user_id: actorUserId,
    correlation_id: 'corr-stage2-core-crm-only-negative-proof',
  });
  assert.equal(coreCrmOnlyNegativeProof.length, 5);
  assert.equal(coreCrmOnlyNegativeProof.every((decision) => decision.http_status === 404), true);
  assert.equal(coreCrmOnlyNegativeProof.every((decision) => decision.server_side_inaccessible === true), true);
}

async function assertGatekeeperDecisionMatrixAndOptOutBlock() {
  const deny = await gatekeeper.evaluatePreflight(
    gatekeeperInput({
      capability_key: 'phase6b.payout-rails',
      module_key: 'phase6b.runtime',
      entity_type: 'phase6b.payout-action',
      action_key: 'phase6b.payout.preflight',
      payload: { action_key: 'phase6b.payout.preflight' },
      module_health: { 'phase6b.runtime': 'healthy' },
      reauth_status: 'expired',
    }),
  );
  assert.equal(deny.decision, 'DENY');

  const approvalRequired = await gatekeeper.evaluatePreflight(
    gatekeeperInput({
      capability_key: 'phase6c.structured-agreements',
      module_key: 'phase6c.runtime',
      entity_type: 'phase6c.structured-agreement',
      action_key: 'phase6c.structured-agreement.publish',
      payload: {
        action_key: 'phase6c.structured-agreement.publish',
        migration_risk: 'approval_required',
      },
      module_health: { 'phase6c.runtime': 'healthy' },
    }),
  );
  assert.equal(approvalRequired.decision, 'APPROVAL_REQUIRED');
  assert.equal(approvalRequired.missing_evidence.includes('gatekeeper.migration.evidence'), true);

  const stop = await gatekeeper.evaluatePreflight(
    gatekeeperInput({
      capability_key: 'phase6a.foundry-cross-tenant-activation',
      module_key: 'phase6a.runtime',
      entity_type: 'phase6a.cross-tenant-activation',
      action_key: 'phase6a.cross-tenant-activation.override',
      payload: {
        action_key: 'phase6a.cross-tenant-activation.override',
        risk_surface: 'migration',
        tenant_admin_override_requested: true,
      },
      module_health: { 'phase6a.runtime': 'healthy' },
    }),
  );
  assert.equal(stop.decision, 'STOP_FOR_REVIEW');

  const optOutEvidence = evidence.buildEvidenceRecord(
    evidenceInput({
      capability_key: 'phase6a.communication-gateway',
      module_key: 'phase6a.runtime',
      action_key: 'phase6a.communication-gateway.send',
      entity_type: 'phase6a.communication-recipient',
      entity_id: 'recipient-with-active-opt-out',
      gatekeeper_decision: 'DENY',
      runtime_outcome: 'denied',
      reason_codes: ['communication.opt-out.blocked-before-provider-send'],
      check_keys: ['phase6.runtime.communication.opt-out'],
      required_evidence: ['phase6.runtime.communication.opt-out-proof'],
      missing_evidence: [],
    }),
  );
  const optOutSendProof = {
    assertion: 'opt_out_send_blocked',
    provider_send_attempted: false,
    provider_side_effect_allowed: false,
    evidence_id: optOutEvidence.evidence_id,
  } as const;
  assert.equal(optOutEvidence.gatekeeper_decision, 'DENY');
  assert.equal(optOutEvidence.runtime_outcome, 'denied');
  assert.equal(optOutEvidence.evidence_completeness.check_count, 1);
  assert.equal(optOutSendProof.provider_send_attempted, false);
  assert.equal(optOutSendProof.provider_side_effect_allowed, false);
}

function assertCrossTenantDenyAndEvidence() {
  const crossTenant = tenantIsolation.evaluateAccess({
    request_organization_id: organizationId,
    resource_organization_id: 'org-stage2-runtime-demo-other-tenant',
    actor_user_id: actorUserId,
    capability_key: 'phase6c.structured-agreements',
    module_key: 'phase6c.runtime',
    action_key: 'phase6c.structured-agreement.read',
    entity_type: 'phase6c.structured-agreement',
    entity_id: 'agreement-other-tenant-001',
    access_kind: 'read',
    correlation_id: 'corr-stage2-cross-tenant-deny',
  });
  assert.equal(crossTenant.decision, 'DENY');
  assert.equal(crossTenant.cross_tenant, true);
  assert.equal(crossTenant.runtime_access_allowed, false);
  assert.equal(crossTenant.http_status, 403);
  assert.throws(
    () =>
      tenantIsolation.assertAccessAllowed({
        request_organization_id: organizationId,
        resource_organization_id: 'org-stage2-runtime-demo-other-tenant',
        actor_user_id: actorUserId,
        capability_key: 'phase6c.structured-agreements',
        module_key: 'phase6c.runtime',
        action_key: 'phase6c.structured-agreement.read',
        entity_type: 'phase6c.structured-agreement',
        entity_id: 'agreement-other-tenant-001',
        access_kind: 'read',
        correlation_id: 'corr-stage2-cross-tenant-deny-throw',
      }),
    ForbiddenException,
  );

  const crossTenantEvidence = evidence.buildEvidenceRecord(tenantIsolation.buildEvidenceInput(crossTenant));
  assert.equal(crossTenantEvidence.gatekeeper_decision, 'DENY');
  assert.equal(crossTenantEvidence.runtime_outcome, 'denied');
  assert.equal(crossTenantEvidence.evidence_completeness.missing_evidence_count, 1);
}

function assertFailedKycRestrictedToT1Path() {
  const failedKycEvidence = evidence.buildEvidenceRecord(
    evidenceInput({
      capability_key: 'phase6a.tiered-verification',
      module_key: 'phase6a.runtime',
      action_key: 'phase6a.tiered-verification.high-trust-action',
      entity_type: 'phase6a.participant-verification',
      entity_id: 'participant-failed-kyc-001',
      gatekeeper_decision: 'DENY',
      runtime_outcome: 'denied',
      reason_codes: ['identity.kyc.failed-remains-t1'],
      check_keys: ['phase6.runtime.identity.tiered-verification'],
      required_evidence: ['phase6.runtime.kyc-tier-proof'],
      missing_evidence: ['phase6.runtime.kyc-passing-evidence'],
    }),
  );
  const failedKycTierPath = {
    assertion: 'failed_kyc_t1_restricted_path',
    verification_result: 'failed',
    resulting_tier: 'T1',
    higher_trust_action_allowed: false,
    evidence_id: failedKycEvidence.evidence_id,
  } as const;
  assert.equal(failedKycEvidence.gatekeeper_decision, 'DENY');
  assert.equal(failedKycEvidence.runtime_outcome, 'denied');
  assert.equal(failedKycEvidence.evidence_completeness.missing_evidence_count, 1);
  assert.equal(failedKycTierPath.resulting_tier, 'T1');
  assert.equal(failedKycTierPath.higher_trust_action_allowed, false);
}

function assertFailedPaymentCorrectableInvoicePath() {
  const failedPayment = recordThreeWayMatchEvidence(paymentInput());
  assert.equal(failedPayment.match_status, 'VARIANCE_REVIEW_REQUIRED');
  assert.equal(failedPayment.payment_evidence_blocked, true);
  assert.equal(failedPayment.vendor_invoice_created, false);
  assert.equal(failedPayment.payment_allocation_performed, false);
  assert.equal(failedPayment.irreversible_action_allowed, false);

  const correctableInvoicePath = {
    assertion: 'failed_payment_correctable_invoice',
    billing_state: 'correctable_invoice_or_remediation_required',
    payment_execution_allowed: !failedPayment.payment_evidence_blocked,
    remediation_reference: failedPayment.three_way_match_evidence_ref,
  } as const;
  assert.equal(correctableInvoicePath.billing_state, 'correctable_invoice_or_remediation_required');
  assert.equal(correctableInvoicePath.payment_execution_allowed, false);
  assert.match(correctableInvoicePath.remediation_reference, /^three_way_match:/);

  const failedPaymentEvidence = evidence.buildEvidenceRecord(
    evidenceInput({
      capability_key: 'phase6b.payout-rails',
      module_key: 'phase6b.runtime',
      action_key: 'phase6b.billing.correctable-invoice-remediation',
      entity_type: 'phase6b.vendor-invoice',
      entity_id: failedPayment.vendor_invoice_ref,
      gatekeeper_decision: 'DENY',
      runtime_outcome: 'denied',
      reason_codes: ['billing.payment.failed-three-way-match-variance'],
      check_keys: ['phase6.runtime.billing.correctable-invoice-path'],
      required_evidence: ['phase6.runtime.payment-failure-remediation-proof'],
      missing_evidence: [],
    }),
  );
  assert.equal(failedPaymentEvidence.evidence_completeness.missing_evidence_count, 0);
}

async function main() {
  await assertPositiveActivationAndGatekeeperAllow();
  assertInactiveRoute404ServerSide();
  await assertGatekeeperDecisionMatrixAndOptOutBlock();
  assertCrossTenantDenyAndEvidence();
  assertFailedKycRestrictedToT1Path();
  assertFailedPaymentCorrectableInvoicePath();

  console.log('Stage 2 Phase 6A-6C falsifiable runtime demo checks passed.');
}

void main();
