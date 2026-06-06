import { Injectable } from '@nestjs/common';

export type BankingReconciliationScaffoldMetadata = {
  phase: '6b';
  source_component_id: '6B.13';
  component_key: 'banking_reconciliation';
  display_name: 'Banking Reconciliation';
  scaffold_status: 'metadata_only';
  capability_implementation_authorized: false;
  ticket_generation_allowed: false;
  schema_baseline_status: 'phase_6b_schema_declared';
  schema_model_refs: readonly string[];
};

export const BankingReconciliationScaffoldMetadata: BankingReconciliationScaffoldMetadata = {
  phase: '6b',
  source_component_id: '6B.13',
  component_key: 'banking_reconciliation',
  display_name: 'Banking Reconciliation',
  scaffold_status: 'metadata_only',
  capability_implementation_authorized: false,
  ticket_generation_allowed: false,
  schema_baseline_status: 'phase_6b_schema_declared',
  schema_model_refs: [
  'Phase6BBankAccount',
  'Phase6BBankTransaction',
  'Phase6BReconciliationStatement',
  ],
};

@Injectable()
export class BankingReconciliationService {
  getScaffoldMetadata(): BankingReconciliationScaffoldMetadata {
    return BankingReconciliationScaffoldMetadata;
  }
}
