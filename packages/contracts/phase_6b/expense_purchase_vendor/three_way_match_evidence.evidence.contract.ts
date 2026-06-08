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
