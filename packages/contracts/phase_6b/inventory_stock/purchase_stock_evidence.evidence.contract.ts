export const PHASE_6B_PURCHASE_STOCK_EVIDENCE_SEED_ID = 'seed_6b_03_purchase_stock_evidence' as const;
export const PHASE_6B_PURCHASE_STOCK_EVIDENCE_COMPONENT_ID = '6B.03' as const;

export const PURCHASE_STOCK_EVIDENCE_EVENT = 'phase_6b.inventory_stock.purchase_stock_evidence.recorded' as const;

export type PurchaseStockEvidenceSourceType =
  | 'PURCHASE_ORDER'
  | 'SUPPLIER_INVOICE'
  | 'GOODS_RECEIPT_NOTE'
  | 'MANUAL_STOCK_RECEIPT';

export type PurchaseStockEvidenceInput = {
  organization_id: string;
  product_record_id: string;
  product_price_history_id: string;
  inventory_location_id: string;
  stock_movement_ledger_id: string;
  evidence_source_type: PurchaseStockEvidenceSourceType;
  evidence_source_id: string;
  supplier_reference?: string;
  received_quantity: number;
  received_at: string;
  evidence_collected_by_user_id: string;
  inventory_service_enabled: boolean;
  provider_operation_requested?: boolean;
};

export type PurchaseStockEvidenceRecord = {
  seed_id: typeof PHASE_6B_PURCHASE_STOCK_EVIDENCE_SEED_ID;
  component_id: typeof PHASE_6B_PURCHASE_STOCK_EVIDENCE_COMPONENT_ID;
  event_name: typeof PURCHASE_STOCK_EVIDENCE_EVENT;
  organization_id: string;
  product_record_id: string;
  product_price_history_id: string;
  inventory_location_id: string;
  stock_movement_ledger_id: string;
  evidence_source_type: PurchaseStockEvidenceSourceType;
  evidence_source_id: string;
  supplier_reference: string | null;
  received_quantity: number;
  received_at: string;
  evidence_collected_by_user_id: string;
  evidence_status: 'RECORDED';
};

const PURCHASE_STOCK_EVIDENCE_SOURCE_TYPES: readonly PurchaseStockEvidenceSourceType[] = [
  'PURCHASE_ORDER',
  'SUPPLIER_INVOICE',
  'GOODS_RECEIPT_NOTE',
  'MANUAL_STOCK_RECEIPT',
] as const;

function requireNonEmpty(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for purchase stock evidence.`);
  }
  return value.trim();
}

function requirePositiveQuantity(value: number): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error('received_quantity must be a positive integer for purchase stock evidence.');
  }
  return value;
}

function requireValidReceivedAt(value: string): string {
  const normalized = requireNonEmpty(value, 'received_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('received_at must be a valid ISO-compatible timestamp for purchase stock evidence.');
  }
  return normalized;
}

function requireEvidenceSourceType(value: PurchaseStockEvidenceSourceType): PurchaseStockEvidenceSourceType {
  if (!PURCHASE_STOCK_EVIDENCE_SOURCE_TYPES.includes(value)) {
    throw new Error('evidence_source_type is not supported for purchase stock evidence.');
  }
  return value;
}

export function recordPurchaseStockEvidence(input: PurchaseStockEvidenceInput): PurchaseStockEvidenceRecord {
  if (input.inventory_service_enabled !== true) {
    throw new Error('inventory_service_enabled must be true before purchase stock evidence can be recorded.');
  }
  if (input.provider_operation_requested === true) {
    throw new Error('purchase stock evidence must not request provider, payment, or adapter operations.');
  }

  return {
    seed_id: PHASE_6B_PURCHASE_STOCK_EVIDENCE_SEED_ID,
    component_id: PHASE_6B_PURCHASE_STOCK_EVIDENCE_COMPONENT_ID,
    event_name: PURCHASE_STOCK_EVIDENCE_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    product_record_id: requireNonEmpty(input.product_record_id, 'product_record_id'),
    product_price_history_id: requireNonEmpty(input.product_price_history_id, 'product_price_history_id'),
    inventory_location_id: requireNonEmpty(input.inventory_location_id, 'inventory_location_id'),
    stock_movement_ledger_id: requireNonEmpty(input.stock_movement_ledger_id, 'stock_movement_ledger_id'),
    evidence_source_type: requireEvidenceSourceType(input.evidence_source_type),
    evidence_source_id: requireNonEmpty(input.evidence_source_id, 'evidence_source_id'),
    supplier_reference: input.supplier_reference && input.supplier_reference.trim().length > 0 ? input.supplier_reference.trim() : null,
    received_quantity: requirePositiveQuantity(input.received_quantity),
    received_at: requireValidReceivedAt(input.received_at),
    evidence_collected_by_user_id: requireNonEmpty(input.evidence_collected_by_user_id, 'evidence_collected_by_user_id'),
    evidence_status: 'RECORDED',
  };
}
