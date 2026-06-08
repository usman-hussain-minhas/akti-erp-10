export const PHASE_6B_PAYROLL_DISBURSEMENT_FILE_EXPORT_SEED_ID = 'seed_6b_14_payroll_disbursement_file_export' as const;
export const PHASE_6B_FINANCE_PAYROLL_FOUNDATION_COMPONENT_ID = '6B.14' as const;

export const PAYROLL_DISBURSEMENT_FILE_EXPORT_EVENT = 'phase_6b.finance_payroll.disbursement_file_exported' as const;

export type PayrollDisbursementExportFormat = 'CSV' | 'BANK_STANDARD_TEXT';

export type PayrollDisbursementLineInput = {
  payout_ref: string;
  payee_ref: string;
  person_identity_ref: string;
  beneficiary_label: string;
  amount_minor: number;
  currency_code: string;
  payment_allocation_balance_ref: string;
  chart_account_ref: string;
  payout_evidence_ref: string;
};

export type PayrollDisbursementFileExportInput = {
  organization_id: string;
  source_seed_id: typeof PHASE_6B_PAYROLL_DISBURSEMENT_FILE_EXPORT_SEED_ID;
  export_ref: string;
  payroll_batch_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  base_currency_code: string;
  export_format: PayrollDisbursementExportFormat;
  lines: PayrollDisbursementLineInput[];
  exported_by_user_id: string;
  exported_at: string;
  bank_transmission_requested?: boolean;
  payout_creation_requested?: boolean;
  credential_handling_requested?: boolean;
  journal_posting_requested?: boolean;
  hr_record_mutation_requested?: boolean;
  payment_allocation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type PayrollDisbursementFileExportReceipt = {
  seed_id: typeof PHASE_6B_PAYROLL_DISBURSEMENT_FILE_EXPORT_SEED_ID;
  component_id: typeof PHASE_6B_FINANCE_PAYROLL_FOUNDATION_COMPONENT_ID;
  event_name: typeof PAYROLL_DISBURSEMENT_FILE_EXPORT_EVENT;
  organization_id: string;
  source_seed_id: typeof PHASE_6B_PAYROLL_DISBURSEMENT_FILE_EXPORT_SEED_ID;
  payroll_batch_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  base_currency_code: string;
  export_ref: string;
  export_format: PayrollDisbursementExportFormat;
  line_count: number;
  total_amount_minor: number;
  file_payload: string;
  file_evidence_ref: string;
  file_digest: string;
  bank_transmission_performed: false;
  payout_created: false;
  credential_handling_performed: false;
  journal_posted: false;
  hr_record_mutated: false;
  payment_allocation_performed: false;
  irreversible_action_allowed: false;
  exported_by_user_id: string;
  exported_at: string;
};
