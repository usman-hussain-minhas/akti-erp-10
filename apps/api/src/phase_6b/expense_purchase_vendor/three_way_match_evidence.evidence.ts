import { createHash } from 'node:crypto';

export const PHASE_6B_THREE_WAY_MATCH_EVIDENCE_SEED_ID = 'seed_6b_11_three_way_match_evidence' as const;
export const PHASE_6B_THREE_WAY_MATCH_EVIDENCE_COMPONENT_ID = '6B.11' as const;

export const THREE_WAY_MATCH_EVIDENCE_EVENT = 'phase_6b.expense_purchase_vendor.three_way_match.evidence_recorded' as const;

export type ThreeWayMatchPolicy = 'FLAG_VARIANCE' | 'BLOCK_PAYMENT_EVIDENCE_ON_VARIANCE';
export type ThreeWayMatchStatus = 'MATCHED' | 'VARIANCE_REVIEW_REQUIRED';

export type ThreeWayMatchLineInput = {
  purchase_order_line_ref: string;
  purchase_receipt_line_ref: string;
  vendor_invoice_line_ref: string;
  ordered_quantity_units: number;
  received_quantity_units: number;
  invoiced_quantity_units: number;
  ordered_amount_minor: number;
  invoiced_amount_minor: number;
};

export type ThreeWayMatchEvidenceInput = {
  organization_id: string;
  purchase_order_ref: string;
  purchase_order_digest: string;
  purchase_receipt_ref: string;
  purchase_receipt_evidence_ref: string;
  vendor_invoice_ref: string;
  vendor_invoice_evidence_ref: string;
  vendor_record_ref: string;
  payment_allocation_balance_ref: string;
  reviewer_person_ref: string;
  visual_workflow_builder_ref: string;
  match_policy: ThreeWayMatchPolicy;
  currency_code: string;
  amount_tolerance_minor: number;
  quantity_tolerance_units: number;
  line_matches: ThreeWayMatchLineInput[];
  evidence_recorded_by_user_id: string;
  evidence_recorded_at: string;
  purchase_receipt_creation_requested?: boolean;
  vendor_invoice_creation_requested?: boolean;
  payment_allocation_requested?: boolean;
  reconciliation_requested?: boolean;
  gl_posting_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type ThreeWayMatchVariance = {
  purchase_order_line_ref: string;
  purchase_receipt_line_ref: string;
  vendor_invoice_line_ref: string;
  quantity_variance_units: number;
  amount_variance_minor: number;
  within_quantity_tolerance: boolean;
  within_amount_tolerance: boolean;
};

export type ThreeWayMatchEvidenceReceipt = {
  seed_id: typeof PHASE_6B_THREE_WAY_MATCH_EVIDENCE_SEED_ID;
  component_id: typeof PHASE_6B_THREE_WAY_MATCH_EVIDENCE_COMPONENT_ID;
  event_name: typeof THREE_WAY_MATCH_EVIDENCE_EVENT;
  organization_id: string;
  purchase_order_ref: string;
  purchase_order_digest: string;
  purchase_receipt_ref: string;
  purchase_receipt_evidence_ref: string;
  vendor_invoice_ref: string;
  vendor_invoice_evidence_ref: string;
  vendor_record_ref: string;
  payment_allocation_balance_ref: string;
  reviewer_person_ref: string;
  visual_workflow_builder_ref: string;
  match_policy: ThreeWayMatchPolicy;
  match_status: ThreeWayMatchStatus;
  currency_code: string;
  amount_tolerance_minor: number;
  quantity_tolerance_units: number;
  line_count: number;
  matched_line_count: number;
  variance_count: number;
  total_ordered_amount_minor: number;
  total_invoiced_amount_minor: number;
  total_amount_variance_minor: number;
  variances: ThreeWayMatchVariance[];
  payment_evidence_blocked: boolean;
  three_way_match_evidence_ref: string;
  three_way_match_digest: string;
  purchase_receipt_created: false;
  vendor_invoice_created: false;
  payment_allocation_performed: false;
  reconciliation_performed: false;
  gl_posting_performed: false;
  irreversible_action_allowed: false;
  evidence_recorded_by_user_id: string;
  evidence_recorded_at: string;
};

const MATCH_POLICIES: readonly ThreeWayMatchPolicy[] = ['FLAG_VARIANCE', 'BLOCK_PAYMENT_EVIDENCE_ON_VARIANCE'] as const;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for three way match evidence.`);
  }
  return value.trim();
}

function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for three way match evidence.`);
  }
  return normalized;
}

function requireDigest(value: string): string {
  const digest = requireNonEmpty(value, 'purchase_order_digest');
  if (!DIGEST_PATTERN.test(digest)) {
    throw new Error('purchase_order_digest must be a 64-character lowercase hex digest for three way match evidence.');
  }
  return digest;
}

function normalizeCurrency(value: string): string {
  const currency = requireNonEmpty(value, 'currency_code').toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error('currency_code must be a three-letter ISO-style code for three way match evidence.');
  }
  return currency;
}

function requirePolicy(value: ThreeWayMatchPolicy): ThreeWayMatchPolicy {
  if (!MATCH_POLICIES.includes(value)) {
    throw new Error('match_policy is not supported for three way match evidence.');
  }
  return value;
}

function requireNonNegativeInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer for three way match evidence.`);
  }
  return value;
}

function normalizeLine(line: ThreeWayMatchLineInput, index: number): ThreeWayMatchLineInput {
  return {
    purchase_order_line_ref: requireNonEmpty(line.purchase_order_line_ref, `line_matches[${index}].purchase_order_line_ref`),
    purchase_receipt_line_ref: requireNonEmpty(line.purchase_receipt_line_ref, `line_matches[${index}].purchase_receipt_line_ref`),
    vendor_invoice_line_ref: requireNonEmpty(line.vendor_invoice_line_ref, `line_matches[${index}].vendor_invoice_line_ref`),
    ordered_quantity_units: requireNonNegativeInteger(line.ordered_quantity_units, `line_matches[${index}].ordered_quantity_units`),
    received_quantity_units: requireNonNegativeInteger(line.received_quantity_units, `line_matches[${index}].received_quantity_units`),
    invoiced_quantity_units: requireNonNegativeInteger(line.invoiced_quantity_units, `line_matches[${index}].invoiced_quantity_units`),
    ordered_amount_minor: requireNonNegativeInteger(line.ordered_amount_minor, `line_matches[${index}].ordered_amount_minor`),
    invoiced_amount_minor: requireNonNegativeInteger(line.invoiced_amount_minor, `line_matches[${index}].invoiced_amount_minor`),
  };
}

function normalizeLines(lines: ThreeWayMatchLineInput[]): ThreeWayMatchLineInput[] {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error('line_matches must include at least one line for three way match evidence.');
  }
  const normalized = lines.map((line, index) => normalizeLine(line, index));
  for (const field of ['purchase_order_line_ref', 'purchase_receipt_line_ref', 'vendor_invoice_line_ref'] as const) {
    const refs = normalized.map((line) => line[field]);
    if (new Set(refs).size !== refs.length) {
      throw new Error(`line_matches must not repeat ${field} for three way match evidence.`);
    }
  }
  return normalized;
}

function calculateVariance(
  line: ThreeWayMatchLineInput,
  amountToleranceMinor: number,
  quantityToleranceUnits: number,
): ThreeWayMatchVariance {
  const quantityVarianceUnits = Math.max(
    Math.abs(line.ordered_quantity_units - line.received_quantity_units),
    Math.abs(line.received_quantity_units - line.invoiced_quantity_units),
    Math.abs(line.ordered_quantity_units - line.invoiced_quantity_units),
  );
  const amountVarianceMinor = Math.abs(line.ordered_amount_minor - line.invoiced_amount_minor);
  return {
    purchase_order_line_ref: line.purchase_order_line_ref,
    purchase_receipt_line_ref: line.purchase_receipt_line_ref,
    vendor_invoice_line_ref: line.vendor_invoice_line_ref,
    quantity_variance_units: quantityVarianceUnits,
    amount_variance_minor: amountVarianceMinor,
    within_quantity_tolerance: quantityVarianceUnits <= quantityToleranceUnits,
    within_amount_tolerance: amountVarianceMinor <= amountToleranceMinor,
  };
}

function digestThreeWayMatch(receiptWithoutDigest: Omit<ThreeWayMatchEvidenceReceipt, 'three_way_match_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function recordThreeWayMatchEvidence(input: ThreeWayMatchEvidenceInput): ThreeWayMatchEvidenceReceipt {
  if (input.purchase_receipt_creation_requested === true) {
    throw new Error('three way match evidence must not create purchase receipts.');
  }
  if (input.vendor_invoice_creation_requested === true) {
    throw new Error('three way match evidence must not create vendor invoices.');
  }
  if (input.payment_allocation_requested === true) {
    throw new Error('three way match evidence must not perform payment allocation math.');
  }
  if (input.reconciliation_requested === true) {
    throw new Error('three way match evidence must not perform reconciliation.');
  }
  if (input.gl_posting_requested === true) {
    throw new Error('three way match evidence must not post to general ledger.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('three way match evidence must not perform irreversible actions.');
  }

  const amountToleranceMinor = requireNonNegativeInteger(input.amount_tolerance_minor, 'amount_tolerance_minor');
  const quantityToleranceUnits = requireNonNegativeInteger(input.quantity_tolerance_units, 'quantity_tolerance_units');
  const lineMatches = normalizeLines(input.line_matches);
  const variances = lineMatches.map((line) => calculateVariance(line, amountToleranceMinor, quantityToleranceUnits));
  const outOfToleranceVariances = variances.filter(
    (variance) => !variance.within_amount_tolerance || !variance.within_quantity_tolerance,
  );
  const purchaseOrderRef = requireNonEmpty(input.purchase_order_ref, 'purchase_order_ref');
  const vendorInvoiceRef = requireNonEmpty(input.vendor_invoice_ref, 'vendor_invoice_ref');
  const matchPolicy = requirePolicy(input.match_policy);
  const totalOrderedAmountMinor = lineMatches.reduce((total, line) => total + line.ordered_amount_minor, 0);
  const totalInvoicedAmountMinor = lineMatches.reduce((total, line) => total + line.invoiced_amount_minor, 0);
  const totalAmountVarianceMinor = Math.abs(totalOrderedAmountMinor - totalInvoicedAmountMinor);

  const receiptWithoutDigest: Omit<ThreeWayMatchEvidenceReceipt, 'three_way_match_digest'> = {
    seed_id: PHASE_6B_THREE_WAY_MATCH_EVIDENCE_SEED_ID,
    component_id: PHASE_6B_THREE_WAY_MATCH_EVIDENCE_COMPONENT_ID,
    event_name: THREE_WAY_MATCH_EVIDENCE_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    purchase_order_ref: purchaseOrderRef,
    purchase_order_digest: requireDigest(input.purchase_order_digest),
    purchase_receipt_ref: requireNonEmpty(input.purchase_receipt_ref, 'purchase_receipt_ref'),
    purchase_receipt_evidence_ref: requireNonEmpty(input.purchase_receipt_evidence_ref, 'purchase_receipt_evidence_ref'),
    vendor_invoice_ref: vendorInvoiceRef,
    vendor_invoice_evidence_ref: requireNonEmpty(input.vendor_invoice_evidence_ref, 'vendor_invoice_evidence_ref'),
    vendor_record_ref: requireNonEmpty(input.vendor_record_ref, 'vendor_record_ref'),
    payment_allocation_balance_ref: requireNonEmpty(input.payment_allocation_balance_ref, 'payment_allocation_balance_ref'),
    reviewer_person_ref: requireNonEmpty(input.reviewer_person_ref, 'reviewer_person_ref'),
    visual_workflow_builder_ref: requireNonEmpty(input.visual_workflow_builder_ref, 'visual_workflow_builder_ref'),
    match_policy: matchPolicy,
    match_status: outOfToleranceVariances.length === 0 ? 'MATCHED' : 'VARIANCE_REVIEW_REQUIRED',
    currency_code: normalizeCurrency(input.currency_code),
    amount_tolerance_minor: amountToleranceMinor,
    quantity_tolerance_units: quantityToleranceUnits,
    line_count: lineMatches.length,
    matched_line_count: lineMatches.length - outOfToleranceVariances.length,
    variance_count: outOfToleranceVariances.length,
    total_ordered_amount_minor: totalOrderedAmountMinor,
    total_invoiced_amount_minor: totalInvoicedAmountMinor,
    total_amount_variance_minor: totalAmountVarianceMinor,
    variances,
    payment_evidence_blocked: matchPolicy === 'BLOCK_PAYMENT_EVIDENCE_ON_VARIANCE' && outOfToleranceVariances.length > 0,
    three_way_match_evidence_ref: `three_way_match:${purchaseOrderRef}:${vendorInvoiceRef}`,
    purchase_receipt_created: false,
    vendor_invoice_created: false,
    payment_allocation_performed: false,
    reconciliation_performed: false,
    gl_posting_performed: false,
    irreversible_action_allowed: false,
    evidence_recorded_by_user_id: requireNonEmpty(input.evidence_recorded_by_user_id, 'evidence_recorded_by_user_id'),
    evidence_recorded_at: requireTimestamp(input.evidence_recorded_at, 'evidence_recorded_at'),
  };

  return {
    ...receiptWithoutDigest,
    three_way_match_digest: digestThreeWayMatch(receiptWithoutDigest),
  };
}
