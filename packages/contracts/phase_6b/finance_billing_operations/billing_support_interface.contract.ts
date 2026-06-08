export type Phase6BBillingSupportView =
  | 'billing_summary'
  | 'invoice_detail'
  | 'receivable_status'
  | 'payment_allocation_status'
  | 'dunning_history';

export type Phase6BBillingSupportInput = {
  organization_id: string;
  support_case_ref: string;
  support_window_ref: string;
  support_window_authorized_by_ref: string;
  support_window_expires_at: string;
  evaluated_at: string;
  support_agent_ref: string;
  customer_ref: string;
  billing_account_ref: string;
  support_reason: string;
  requested_view: Phase6BBillingSupportView;
  authorization_scopes: string[];
  invoice_refs?: string[];
  receivable_refs?: string[];
  payment_allocation_refs?: string[];
  budget_cap_refs?: string[];
  dunning_case_refs?: string[];
  requested_forbidden_action?:
    | 'mutate_invoice'
    | 'collect_payment'
    | 'run_dunning'
    | 'waive_debt'
    | 'access_without_support_window'
    | 'export_unredacted_data'
    | 'irreversible_action';
};

export type Phase6BBillingSupportResult = {
  organization_id: string;
  support_case_ref: string;
  support_window_ref: string;
  support_agent_ref: string;
  customer_ref: string;
  billing_account_ref: string;
  requested_view: Phase6BBillingSupportView;
  access_state: 'authorized_read_only_support_window';
  visible_refs: {
    invoice_refs: string[];
    receivable_refs: string[];
    payment_allocation_refs: string[];
    budget_cap_refs: string[];
    dunning_case_refs: string[];
  };
  redacted_fields: string[];
  escalation_required: boolean;
  support_recommendations: string[];
  evidence: {
    seed_id: 'seed_6b_15_billing_support_interface';
    support_window_authorized_by_ref: string;
    support_window_expires_at: string;
    digest: string;
    forbidden_behaviors_rejected: string[];
  };
};
