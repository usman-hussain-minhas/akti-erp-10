import { Injectable } from '@nestjs/common';

export type PaymentCollectionTopupScaffoldMetadata = {
  phase: '6b';
  source_component_id: '6B.10';
  component_key: 'payment_collection_topup';
  display_name: 'Payment Collection Top-Up';
  scaffold_status: 'metadata_only';
  capability_implementation_authorized: false;
  ticket_generation_allowed: false;
  schema_baseline_status: 'phase_6b_schema_declared';
  schema_model_refs: readonly string[];
};

export const PaymentCollectionTopupScaffoldMetadata: PaymentCollectionTopupScaffoldMetadata = {
  phase: '6b',
  source_component_id: '6B.10',
  component_key: 'payment_collection_topup',
  display_name: 'Payment Collection Top-Up',
  scaffold_status: 'metadata_only',
  capability_implementation_authorized: false,
  ticket_generation_allowed: false,
  schema_baseline_status: 'phase_6b_schema_declared',
  schema_model_refs: [
  'Phase6BPayment',
  'Phase6BPaymentAllocation',
  'Phase6BReceipt',
  'Phase6BTopUp',
  'Phase6BReconciliationCandidate',
  ],
};

@Injectable()
export class PaymentCollectionTopupService {
  getScaffoldMetadata(): PaymentCollectionTopupScaffoldMetadata {
    return PaymentCollectionTopupScaffoldMetadata;
  }
}
