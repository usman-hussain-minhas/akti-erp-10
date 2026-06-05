import { Injectable } from '@nestjs/common';

export type PaymentCollectionTopupScaffoldMetadata = {
  phase: '6b';
  source_component_id: '6B.10';
  component_key: 'payment_collection_topup';
  display_name: 'Payment Collection Top-Up';
  scaffold_status: 'metadata_only';
  capability_implementation_authorized: false;
  ticket_generation_allowed: false;
};

export const PaymentCollectionTopupScaffoldMetadata: PaymentCollectionTopupScaffoldMetadata = {
  phase: '6b',
  source_component_id: '6B.10',
  component_key: 'payment_collection_topup',
  display_name: 'Payment Collection Top-Up',
  scaffold_status: 'metadata_only',
  capability_implementation_authorized: false,
  ticket_generation_allowed: false,
};

@Injectable()
export class PaymentCollectionTopupService {
  getScaffoldMetadata(): PaymentCollectionTopupScaffoldMetadata {
    return PaymentCollectionTopupScaffoldMetadata;
  }
}
