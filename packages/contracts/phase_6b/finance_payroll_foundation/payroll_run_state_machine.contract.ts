export const PHASE_6B_PAYROLL_RUN_STATE_MACHINE_SEED_ID = 'seed_6b_14_payroll_run_state_machine' as const;
export const PHASE_6B_FINANCE_PAYROLL_FOUNDATION_COMPONENT_ID = '6B.14' as const;

export const PAYROLL_RUN_STATE_MACHINE_EVENT = 'phase_6b.finance_payroll.run_state_transitioned' as const;

export type PayrollRunState = 'DRAFT' | 'CALCULATED' | 'REVIEW_READY' | 'APPROVED' | 'LOCKED' | 'DISBURSEMENT_READY' | 'CANCELLED';

export type PayrollRunStateTransitionInput = {
  transition_ref: string;
  from_state: PayrollRunState;
  to_state: PayrollRunState;
  actor_user_id: string;
  transition_reason: string;
  evidence_ref: string;
  transitioned_at: string;
};

export type PayrollRunStateMachineInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_PAYROLL_RUN_STATE_MACHINE_SEED_ID;
  payroll_batch_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  person_identity_scope_ref: string;
  initial_state: PayrollRunState;
  transitions: PayrollRunStateTransitionInput[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  payout_creation_requested?: boolean;
  tax_calculation_requested?: boolean;
  formula_calculation_requested?: boolean;
  disbursement_file_requested?: boolean;
  journal_posting_requested?: boolean;
  hr_record_mutation_requested?: boolean;
  payment_allocation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type PayrollRunStateMachineReceipt = {
  seed_id: typeof PHASE_6B_PAYROLL_RUN_STATE_MACHINE_SEED_ID;
  component_id: typeof PHASE_6B_FINANCE_PAYROLL_FOUNDATION_COMPONENT_ID;
  event_name: typeof PAYROLL_RUN_STATE_MACHINE_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  phase_6b_payroll_batch_model: 'Phase6BPayrollBatch';
  phase_6b_payroll_payout_model: 'Phase6BPayrollPayout';
  phase_6b_payee_model: 'Phase6BPayee';
  source_seed_id: typeof PHASE_6B_PAYROLL_RUN_STATE_MACHINE_SEED_ID;
  payroll_batch_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  person_identity_scope_ref: string;
  initial_state: PayrollRunState;
  current_state: PayrollRunState;
  transition_count: number;
  transitions: PayrollRunStateTransitionInput[];
  lock_state_reached: boolean;
  disbursement_ready: boolean;
  payout_created: false;
  tax_calculated: false;
  formula_calculated: false;
  disbursement_file_generated: false;
  journal_posted: false;
  hr_record_mutated: false;
  payment_allocation_performed: false;
  irreversible_action_allowed: false;
  state_machine_evidence_ref: string;
  state_machine_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
