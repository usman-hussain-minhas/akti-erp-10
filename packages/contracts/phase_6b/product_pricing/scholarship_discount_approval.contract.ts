export const phase6BScholarshipDiscountApprovalSeedId = 'seed_6b_02_scholarship_discount_approval' as const;
export const phase6BScholarshipDiscountApprovalComponentId = '6B.02' as const;
export const phase6BScholarshipDiscountApprovalModuleKey = 'phase-6b.product-pricing' as const;

export type Phase6BScholarshipDiscountApprovalDecision = 'APPROVE' | 'REJECT';

export interface Phase6BScholarshipDiscountApprovalRequest {
  readonly organization_id: string;
  readonly product_id: string;
  readonly price_history_id: string;
  readonly approval_request_id: string;
  readonly recipient_subject_id: string;
  readonly requested_discount_reference_id: string;
  readonly decision: Phase6BScholarshipDiscountApprovalDecision;
  readonly approver_user_id: string;
  readonly decision_reason: string;
  readonly evidence_id: string;
  readonly decided_at: string;
  readonly source_seed_id?: typeof phase6BScholarshipDiscountApprovalSeedId;
  readonly invoice_snapshot_required: true;
  readonly pricing_calculation_requested?: never;
  readonly independent_activation_requested?: boolean;
}

export interface Phase6BScholarshipDiscountApprovalReceipt {
  readonly seed_id: typeof phase6BScholarshipDiscountApprovalSeedId;
  readonly component_id: typeof phase6BScholarshipDiscountApprovalComponentId;
  readonly module_key: typeof phase6BScholarshipDiscountApprovalModuleKey;
  readonly organization_id: string;
  readonly product_id: string;
  readonly price_history_id: string;
  readonly approval_request_id: string;
  readonly recipient_subject_id: string;
  readonly requested_discount_reference_id: string;
  readonly decision: Phase6BScholarshipDiscountApprovalDecision;
  readonly pricing_authority: {
    readonly canonical_price_history_required: true;
    readonly invoice_snapshot_required: true;
    readonly discount_calculation_performed: false;
  };
  readonly lifecycle: {
    readonly activation_manifest_required: true;
    readonly independent_foundry_activation: false;
  };
  readonly evidence: {
    readonly approver_user_id: string;
    readonly decision_reason: string;
    readonly evidence_id: string;
    readonly decided_at: string;
    readonly validation_event: 'PHASE_6B_SCHOLARSHIP_DISCOUNT_APPROVAL_RECORDED';
  };
}

export function validatePhase6BScholarshipDiscountApprovalRequest(
  request: Phase6BScholarshipDiscountApprovalRequest,
): Phase6BScholarshipDiscountApprovalReceipt {
  assertNonEmpty(request.organization_id, 'organization_id');
  assertNonEmpty(request.product_id, 'product_id');
  assertNonEmpty(request.price_history_id, 'price_history_id');
  assertNonEmpty(request.approval_request_id, 'approval_request_id');
  assertNonEmpty(request.recipient_subject_id, 'recipient_subject_id');
  assertNonEmpty(request.requested_discount_reference_id, 'requested_discount_reference_id');
  assertNonEmpty(request.approver_user_id, 'approver_user_id');
  assertNonEmpty(request.decision_reason, 'decision_reason');
  assertNonEmpty(request.evidence_id, 'evidence_id');

  if (request.source_seed_id !== undefined && request.source_seed_id !== phase6BScholarshipDiscountApprovalSeedId) {
    throw new Error('Scholarship discount approval source_seed_id must match the FFET seed.');
  }

  if (request.decision !== 'APPROVE' && request.decision !== 'REJECT') {
    throw new Error('Scholarship discount approval decision must be APPROVE or REJECT.');
  }

  if (Number.isNaN(Date.parse(request.decided_at))) {
    throw new Error('Scholarship discount approval decided_at must be a valid date.');
  }

  if (request.invoice_snapshot_required !== true) {
    throw new Error('Scholarship discount approval requires immutable invoice price snapshots.');
  }

  if ('pricing_calculation_requested' in request) {
    throw new Error('Scholarship discount approval records approval only and does not calculate discounts.');
  }

  if (request.independent_activation_requested === true) {
    throw new Error('Scholarship discount approval must activate only through Product Pricing manifest lifecycle.');
  }

  return {
    seed_id: phase6BScholarshipDiscountApprovalSeedId,
    component_id: phase6BScholarshipDiscountApprovalComponentId,
    module_key: phase6BScholarshipDiscountApprovalModuleKey,
    organization_id: request.organization_id,
    product_id: request.product_id,
    price_history_id: request.price_history_id,
    approval_request_id: request.approval_request_id,
    recipient_subject_id: request.recipient_subject_id,
    requested_discount_reference_id: request.requested_discount_reference_id,
    decision: request.decision,
    pricing_authority: {
      canonical_price_history_required: true,
      invoice_snapshot_required: true,
      discount_calculation_performed: false,
    },
    lifecycle: {
      activation_manifest_required: true,
      independent_foundry_activation: false,
    },
    evidence: {
      approver_user_id: request.approver_user_id,
      decision_reason: request.decision_reason,
      evidence_id: request.evidence_id,
      decided_at: request.decided_at,
      validation_event: 'PHASE_6B_SCHOLARSHIP_DISCOUNT_APPROVAL_RECORDED',
    },
  };
}

function assertNonEmpty(value: string, fieldName: string): void {
  if (value.trim().length === 0) {
    throw new Error(`Scholarship discount approval requires ${fieldName}.`);
  }
}
