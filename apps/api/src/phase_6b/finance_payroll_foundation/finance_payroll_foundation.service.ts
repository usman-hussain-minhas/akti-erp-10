import { Injectable } from '@nestjs/common';

export type FinancePayrollFoundationScaffoldMetadata = {
  phase: '6b';
  source_component_id: '6B.14';
  component_key: 'finance_payroll_foundation';
  display_name: 'Finance Payroll Foundation';
  scaffold_status: 'metadata_only';
  capability_implementation_authorized: false;
  ticket_generation_allowed: false;
  schema_baseline_status: 'phase_6b_schema_declared';
  schema_model_refs: readonly string[];
};

export const FinancePayrollFoundationScaffoldMetadata: FinancePayrollFoundationScaffoldMetadata = {
  phase: '6b',
  source_component_id: '6B.14',
  component_key: 'finance_payroll_foundation',
  display_name: 'Finance Payroll Foundation',
  scaffold_status: 'metadata_only',
  capability_implementation_authorized: false,
  ticket_generation_allowed: false,
  schema_baseline_status: 'phase_6b_schema_declared',
  schema_model_refs: [
  'Phase6BPayee',
  'Phase6BPayrollBatch',
  'Phase6BPayrollPayout',
  ],
};

@Injectable()
export class FinancePayrollFoundationService {
  getScaffoldMetadata(): FinancePayrollFoundationScaffoldMetadata {
    return FinancePayrollFoundationScaffoldMetadata;
  }
}
