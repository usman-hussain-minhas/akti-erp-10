import { Injectable } from '@nestjs/common';

export type ExpensePurchaseVendorScaffoldMetadata = {
  phase: '6b';
  source_component_id: '6B.11';
  component_key: 'expense_purchase_vendor';
  display_name: 'Expense Purchase Vendor';
  scaffold_status: 'metadata_only';
  capability_implementation_authorized: false;
  ticket_generation_allowed: false;
  schema_baseline_status: 'phase_6b_schema_declared';
  schema_model_refs: readonly string[];
};

export const ExpensePurchaseVendorScaffoldMetadata: ExpensePurchaseVendorScaffoldMetadata = {
  phase: '6b',
  source_component_id: '6B.11',
  component_key: 'expense_purchase_vendor',
  display_name: 'Expense Purchase Vendor',
  scaffold_status: 'metadata_only',
  capability_implementation_authorized: false,
  ticket_generation_allowed: false,
  schema_baseline_status: 'phase_6b_schema_declared',
  schema_model_refs: [
  'Phase6BVendor',
  'Phase6BExpense',
  'Phase6BPurchaseOrder',
  'Phase6BPurchaseReceipt',
  ],
};

@Injectable()
export class ExpensePurchaseVendorService {
  getScaffoldMetadata(): ExpensePurchaseVendorScaffoldMetadata {
    return ExpensePurchaseVendorScaffoldMetadata;
  }
}
