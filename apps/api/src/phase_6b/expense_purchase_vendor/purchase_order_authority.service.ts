import { createHash } from 'node:crypto';

export const PHASE_6B_PURCHASE_ORDER_AUTHORITY_SEED_ID = 'seed_6b_11_purchase_order_authority' as const;
export const PHASE_6B_PURCHASE_ORDER_AUTHORITY_COMPONENT_ID = '6B.11' as const;

export const PURCHASE_ORDER_AUTHORITY_EVENT = 'phase_6b.expense_purchase_vendor.po.approved' as const;

export type PurchaseOrderApprovalDecision = 'APPROVED';
export type PurchaseOrderLineType = 'GOODS' | 'SERVICE' | 'FEE' | 'TAX';

export type PurchaseOrderLineInput = {
  purchase_order_line_ref: string;
  line_type: PurchaseOrderLineType;
  description: string;
  quantity_units: number;
  unit_amount_minor: number;
  line_total_minor: number;
  currency_code: string;
};

export type PurchaseOrderAuthorityInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_PURCHASE_ORDER_AUTHORITY_SEED_ID;
  purchase_order_ref: string;
  purchase_order_number: string;
  vendor_record_ref: string;
  requester_person_ref: string;
  approver_person_ref: string;
  visual_workflow_builder_ref: string;
  approval_workflow_ref: string;
  approval_step_ref: string;
  payment_allocation_balance_ref: string;
  approval_decision: PurchaseOrderApprovalDecision;
  currency_code: string;
  issued_at: string;
  approved_at: string;
  expected_receipt_at?: string;
  purchase_order_lines: PurchaseOrderLineInput[];
  purchase_order_evidence_refs: string[];
  authorized_by_user_id: string;
  authorized_at: string;
  purchase_receipt_requested?: boolean;
  vendor_invoice_requested?: boolean;
  inventory_receiving_requested?: boolean;
  payment_allocation_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  gl_posting_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type PurchaseOrderAuthorityReceipt = {
  seed_id: typeof PHASE_6B_PURCHASE_ORDER_AUTHORITY_SEED_ID;
  component_id: typeof PHASE_6B_PURCHASE_ORDER_AUTHORITY_COMPONENT_ID;
  event_name: typeof PURCHASE_ORDER_AUTHORITY_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  phase_6b_purchase_order_model: 'Phase6BPurchaseOrder';
  phase_6b_vendor_model_relation_required: true;
  source_seed_id: typeof PHASE_6B_PURCHASE_ORDER_AUTHORITY_SEED_ID;
  purchase_order_ref: string;
  purchase_order_number: string;
  vendor_record_ref: string;
  requester_person_ref: string;
  approver_person_ref: string;
  visual_workflow_builder_ref: string;
  approval_workflow_ref: string;
  approval_step_ref: string;
  payment_allocation_balance_ref: string;
  approval_decision: PurchaseOrderApprovalDecision;
  currency_code: string;
  issued_at: string;
  approved_at: string;
  expected_receipt_at?: string;
  purchase_order_lines: PurchaseOrderLineInput[];
  line_count: number;
  purchase_order_total_minor: number;
  purchase_order_evidence_refs: string[];
  evidence_count: number;
  approval_capability_gated: true;
  purchase_order_evidence_ref: string;
  purchase_order_digest: string;
  purchase_receipt_created: false;
  vendor_invoice_created: false;
  inventory_receiving_performed: false;
  payment_allocation_performed: false;
  provider_callback_processed: false;
  gl_posting_performed: false;
  irreversible_action_allowed: false;
  authorized_by_user_id: string;
  authorized_at: string;
};

const LINE_TYPES: readonly PurchaseOrderLineType[] = ['GOODS', 'SERVICE', 'FEE', 'TAX'] as const;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for purchase order authority.`);
  }
  return value.trim();
}

function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for purchase order authority.`);
  }
  return normalized;
}

function optionalTimestamp(value: string | undefined, field: string): string | undefined {
  if (value === undefined) return undefined;
  return requireTimestamp(value, field);
}

function normalizeCurrency(value: string): string {
  const currency = requireNonEmpty(value, 'currency_code').toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error('currency_code must be a three-letter ISO-style code for purchase order authority.');
  }
  return currency;
}

function requireSourceSeed(value: string): typeof PHASE_6B_PURCHASE_ORDER_AUTHORITY_SEED_ID {
  const sourceSeedId = requireNonEmpty(value, 'source_seed_id');
  if (sourceSeedId !== PHASE_6B_PURCHASE_ORDER_AUTHORITY_SEED_ID) {
    throw new Error('source_seed_id must match seed_6b_11_purchase_order_authority.');
  }
  return PHASE_6B_PURCHASE_ORDER_AUTHORITY_SEED_ID;
}

function requireApprovalDecision(value: PurchaseOrderApprovalDecision): PurchaseOrderApprovalDecision {
  if (value !== 'APPROVED') {
    throw new Error('approval_decision must be APPROVED for purchase order authority.');
  }
  return value;
}

function requireLineType(value: PurchaseOrderLineType): PurchaseOrderLineType {
  if (!LINE_TYPES.includes(value)) {
    throw new Error('line_type is not supported for purchase order authority.');
  }
  return value;
}

function normalizeLine(line: PurchaseOrderLineInput, purchaseOrderCurrency: string): PurchaseOrderLineInput {
  if (!Number.isInteger(line.quantity_units) || line.quantity_units < 1) {
    throw new Error('quantity_units must be a positive integer for purchase order authority.');
  }
  if (!Number.isInteger(line.unit_amount_minor) || line.unit_amount_minor < 0) {
    throw new Error('unit_amount_minor must be a non-negative integer for purchase order authority.');
  }
  if (line.line_total_minor !== line.quantity_units * line.unit_amount_minor) {
    throw new Error('line_total_minor must equal quantity_units times unit_amount_minor for purchase order authority.');
  }
  const currencyCode = normalizeCurrency(line.currency_code);
  if (currencyCode !== purchaseOrderCurrency) {
    throw new Error('purchase order line currency must match purchase order currency.');
  }
  return {
    purchase_order_line_ref: requireNonEmpty(line.purchase_order_line_ref, 'purchase_order_lines.purchase_order_line_ref'),
    line_type: requireLineType(line.line_type),
    description: requireNonEmpty(line.description, 'purchase_order_lines.description'),
    quantity_units: line.quantity_units,
    unit_amount_minor: line.unit_amount_minor,
    line_total_minor: line.line_total_minor,
    currency_code: currencyCode,
  };
}

function normalizeLines(lines: PurchaseOrderLineInput[], purchaseOrderCurrency: string): PurchaseOrderLineInput[] {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error('purchase_order_lines must include at least one line for purchase order authority.');
  }
  const normalized = lines.map((line) => normalizeLine(line, purchaseOrderCurrency));
  const refs = normalized.map((line) => line.purchase_order_line_ref);
  if (new Set(refs).size !== refs.length) {
    throw new Error('purchase_order_lines must not repeat purchase_order_line_ref.');
  }
  return normalized;
}

function normalizeEvidenceRefs(value: string[]): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('purchase_order_evidence_refs must include at least one evidence reference for purchase order authority.');
  }
  const refs = value.map((ref, index) => requireNonEmpty(ref, `purchase_order_evidence_refs[${index}]`));
  if (new Set(refs).size !== refs.length) {
    throw new Error('purchase_order_evidence_refs must not contain duplicates.');
  }
  return refs;
}

function digestPurchaseOrder(receiptWithoutDigest: Omit<PurchaseOrderAuthorityReceipt, 'purchase_order_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function authorizePurchaseOrder(input: PurchaseOrderAuthorityInput): PurchaseOrderAuthorityReceipt {
  if (input.purchase_receipt_requested === true) {
    throw new Error('purchase order authority must not create purchase receipts.');
  }
  if (input.vendor_invoice_requested === true) {
    throw new Error('purchase order authority must not create vendor invoices.');
  }
  if (input.inventory_receiving_requested === true) {
    throw new Error('purchase order authority must not perform inventory receiving.');
  }
  if (input.payment_allocation_requested === true) {
    throw new Error('purchase order authority must not perform payment allocation math.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('purchase order authority must not process provider callbacks.');
  }
  if (input.gl_posting_requested === true) {
    throw new Error('purchase order authority must not post to general ledger.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('purchase order authority must not perform irreversible actions.');
  }

  const currencyCode = normalizeCurrency(input.currency_code);
  const issuedAt = requireTimestamp(input.issued_at, 'issued_at');
  const approvedAt = requireTimestamp(input.approved_at, 'approved_at');
  if (Date.parse(approvedAt) < Date.parse(issuedAt)) {
    throw new Error('approved_at must not be earlier than issued_at for purchase order authority.');
  }
  const expectedReceiptAt = optionalTimestamp(input.expected_receipt_at, 'expected_receipt_at');
  if (expectedReceiptAt !== undefined && Date.parse(expectedReceiptAt) < Date.parse(approvedAt)) {
    throw new Error('expected_receipt_at must not be earlier than approved_at for purchase order authority.');
  }

  const purchaseOrderLines = normalizeLines(input.purchase_order_lines, currencyCode);
  const purchaseOrderEvidenceRefs = normalizeEvidenceRefs(input.purchase_order_evidence_refs);
  const purchaseOrderTotalMinor = purchaseOrderLines.reduce((total, line) => total + line.line_total_minor, 0);
  const purchaseOrderRef = requireNonEmpty(input.purchase_order_ref, 'purchase_order_ref');
  const approvalStepRef = requireNonEmpty(input.approval_step_ref, 'approval_step_ref');

  const receiptWithoutDigest: Omit<PurchaseOrderAuthorityReceipt, 'purchase_order_digest'> = {
    seed_id: PHASE_6B_PURCHASE_ORDER_AUTHORITY_SEED_ID,
    component_id: PHASE_6B_PURCHASE_ORDER_AUTHORITY_COMPONENT_ID,
    event_name: PURCHASE_ORDER_AUTHORITY_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    phase_6b_purchase_order_model: 'Phase6BPurchaseOrder',
    phase_6b_vendor_model_relation_required: true,
    source_seed_id: requireSourceSeed(input.source_seed_id),
    purchase_order_ref: purchaseOrderRef,
    purchase_order_number: requireNonEmpty(input.purchase_order_number, 'purchase_order_number'),
    vendor_record_ref: requireNonEmpty(input.vendor_record_ref, 'vendor_record_ref'),
    requester_person_ref: requireNonEmpty(input.requester_person_ref, 'requester_person_ref'),
    approver_person_ref: requireNonEmpty(input.approver_person_ref, 'approver_person_ref'),
    visual_workflow_builder_ref: requireNonEmpty(input.visual_workflow_builder_ref, 'visual_workflow_builder_ref'),
    approval_workflow_ref: requireNonEmpty(input.approval_workflow_ref, 'approval_workflow_ref'),
    approval_step_ref: approvalStepRef,
    payment_allocation_balance_ref: requireNonEmpty(input.payment_allocation_balance_ref, 'payment_allocation_balance_ref'),
    approval_decision: requireApprovalDecision(input.approval_decision),
    currency_code: currencyCode,
    issued_at: issuedAt,
    approved_at: approvedAt,
    expected_receipt_at: expectedReceiptAt,
    purchase_order_lines: purchaseOrderLines,
    line_count: purchaseOrderLines.length,
    purchase_order_total_minor: purchaseOrderTotalMinor,
    purchase_order_evidence_refs: purchaseOrderEvidenceRefs,
    evidence_count: purchaseOrderEvidenceRefs.length,
    approval_capability_gated: true,
    purchase_order_evidence_ref: `purchase_order:${purchaseOrderRef}:${approvalStepRef}:APPROVED`,
    purchase_receipt_created: false,
    vendor_invoice_created: false,
    inventory_receiving_performed: false,
    payment_allocation_performed: false,
    provider_callback_processed: false,
    gl_posting_performed: false,
    irreversible_action_allowed: false,
    authorized_by_user_id: requireNonEmpty(input.authorized_by_user_id, 'authorized_by_user_id'),
    authorized_at: requireTimestamp(input.authorized_at, 'authorized_at'),
  };

  return {
    ...receiptWithoutDigest,
    purchase_order_digest: digestPurchaseOrder(receiptWithoutDigest),
  };
}
