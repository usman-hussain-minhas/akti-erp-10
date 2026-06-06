import { Injectable } from '@nestjs/common';

export type GeneralLedgerAccountingScaffoldMetadata = {
  phase: '6b';
  source_component_id: '6B.12';
  component_key: 'general_ledger_accounting';
  display_name: 'General Ledger Accounting';
  scaffold_status: 'metadata_only';
  capability_implementation_authorized: false;
  ticket_generation_allowed: false;
  schema_baseline_status: 'phase_6b_schema_declared';
  schema_model_refs: readonly string[];
};

export const GeneralLedgerAccountingScaffoldMetadata: GeneralLedgerAccountingScaffoldMetadata = {
  phase: '6b',
  source_component_id: '6B.12',
  component_key: 'general_ledger_accounting',
  display_name: 'General Ledger Accounting',
  scaffold_status: 'metadata_only',
  capability_implementation_authorized: false,
  ticket_generation_allowed: false,
  schema_baseline_status: 'phase_6b_schema_declared',
  schema_model_refs: [
  'Phase6BChartOfAccount',
  'Phase6BJournalEntry',
  'Phase6BJournalEntryLine',
  'Phase6BAccountingPeriod',
  'Phase6BTaxMapping',
  ],
};

@Injectable()
export class GeneralLedgerAccountingService {
  getScaffoldMetadata(): GeneralLedgerAccountingScaffoldMetadata {
    return GeneralLedgerAccountingScaffoldMetadata;
  }
}
