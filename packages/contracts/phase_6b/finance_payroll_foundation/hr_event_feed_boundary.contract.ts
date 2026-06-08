export const PHASE_6B_HR_EVENT_FEED_BOUNDARY_SEED_ID = 'seed_6b_14_hr_event_feed_boundary' as const;
export const PHASE_6B_FINANCE_PAYROLL_FOUNDATION_COMPONENT_ID = '6B.14' as const;

export const HR_EVENT_FEED_BOUNDARY_EVENT = 'phase_6b.finance_payroll.hr_event_feed_accepted' as const;

export type PayrollHrEventType = 'PAYEE_CREATED' | 'PAYEE_UPDATED' | 'COMPENSATION_CHANGED' | 'PAYEE_INACTIVE';
export type PayrollHrEventAction = 'UPSERT_PAYEE_RECORD' | 'REFRESH_COMPENSATION_INPUT' | 'EXCLUDE_FROM_FUTURE_RUNS';

export type PayrollHrEventInput = {
  hr_event_ref: string;
  event_type: PayrollHrEventType;
  person_identity_ref: string;
  payee_ref: string;
  effective_at: string;
  gross_pay_minor?: number;
  base_pay_minor?: number;
  currency_code?: string;
  source_evidence_ref: string;
};

export type NormalizedPayrollHrEvent = PayrollHrEventInput & {
  boundary_action: PayrollHrEventAction;
  payroll_boundary_evidence_ref: string;
};

export type PayrollHrEventFeedBoundaryInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_HR_EVENT_FEED_BOUNDARY_SEED_ID;
  feed_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  person_identity_scope_ref: string;
  events: PayrollHrEventInput[];
  accepted_by_user_id: string;
  accepted_at: string;
  hr_record_mutation_requested?: boolean;
  payroll_calculation_requested?: boolean;
  payout_creation_requested?: boolean;
  disbursement_file_requested?: boolean;
  journal_posting_requested?: boolean;
  payment_allocation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type PayrollHrEventFeedBoundaryReceipt = {
  seed_id: typeof PHASE_6B_HR_EVENT_FEED_BOUNDARY_SEED_ID;
  component_id: typeof PHASE_6B_FINANCE_PAYROLL_FOUNDATION_COMPONENT_ID;
  event_name: typeof HR_EVENT_FEED_BOUNDARY_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  phase_6b_payee_model: 'Phase6BPayee';
  source_seed_id: typeof PHASE_6B_HR_EVENT_FEED_BOUNDARY_SEED_ID;
  feed_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  person_identity_scope_ref: string;
  event_count: number;
  normalized_events: NormalizedPayrollHrEvent[];
  hr_record_mutated: false;
  payroll_calculated: false;
  payout_created: false;
  disbursement_file_generated: false;
  journal_posted: false;
  payment_allocation_performed: false;
  irreversible_action_allowed: false;
  boundary_evidence_ref: string;
  boundary_digest: string;
  accepted_by_user_id: string;
  accepted_at: string;
};
