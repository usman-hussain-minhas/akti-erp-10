export type Phase6BProrationReason = 'activation' | 'upgrade' | 'downgrade' | 'cancellation' | 'quantity_change';

export type Phase6BBillingProrationInput = {
  organization_id: string;
  proration_ref: string;
  customer_ref: string;
  billing_account_ref: string;
  service_ref: string;
  current_pricing_ref: string;
  replacement_pricing_ref: string;
  usage_evidence_ref: string;
  currency: string;
  period_start: string;
  period_end: string;
  change_effective_at: string;
  current_unit_amount_minor: number;
  replacement_unit_amount_minor: number;
  quantity: number;
  tax_rate_bps?: number;
  reason: Phase6BProrationReason;
  requested_forbidden_action?:
    | 'generate_invoice'
    | 'collect_payment'
    | 'post_journal'
    | 'run_dunning'
    | 'change_pricing_authority'
    | 'irreversible_action';
};

export type Phase6BProrationLine = {
  line_id: string;
  line_type: 'credit_current_period' | 'charge_replacement_period' | 'tax_delta';
  pricing_ref: string;
  amount_minor: number;
  proration_ratio_bps: number;
  evidence_ref: string;
};

export type Phase6BBillingProrationResult = {
  organization_id: string;
  proration_ref: string;
  customer_ref: string;
  billing_account_ref: string;
  service_ref: string;
  currency: string;
  reason: Phase6BProrationReason;
  period_days: number;
  remaining_days: number;
  proration_ratio_bps: number;
  subtotal_delta_minor: number;
  tax_delta_minor: number;
  total_delta_minor: number;
  lines: Phase6BProrationLine[];
  evidence: {
    seed_id: 'seed_6b_15_billing_proration_engine';
    pricing_authority: 'product_price_history_effective_dates';
    usage_evidence_ref: string;
    digest: string;
    forbidden_behaviors_rejected: string[];
  };
};
