import { createHash } from 'node:crypto';

type Phase6BProrationReason = 'activation' | 'upgrade' | 'downgrade' | 'cancellation' | 'quantity_change';

type Phase6BForbiddenProrationAction =
  | 'generate_invoice'
  | 'collect_payment'
  | 'post_journal'
  | 'run_dunning'
  | 'change_pricing_authority'
  | 'irreversible_action';

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
  requested_forbidden_action?: Phase6BForbiddenProrationAction;
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
    forbidden_behaviors_rejected: Phase6BForbiddenProrationAction[];
  };
};

const dayMs = 24 * 60 * 60 * 1000;

const forbiddenActionReasons: Record<Phase6BForbiddenProrationAction, string> = {
  generate_invoice: 'Billing proration computes deltas but cannot generate invoices.',
  collect_payment: 'Billing proration cannot collect payments.',
  post_journal: 'Billing proration cannot post general-ledger entries.',
  run_dunning: 'Billing proration cannot run retention or dunning rules.',
  change_pricing_authority: 'Billing proration cannot mutate product price history authority.',
  irreversible_action: 'Billing proration cannot perform irreversible customer-impacting actions.',
};

const supportedCurrencies = new Set(['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR']);
const supportedReasons = new Set<Phase6BProrationReason>([
  'activation',
  'upgrade',
  'downgrade',
  'cancellation',
  'quantity_change',
]);

function requireNonEmpty(value: string, field: string): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required.`);
  }
}

function requireMinorAmount(value: number, field: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer minor-unit amount.`);
  }
}

function requireQuantity(value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('quantity must be greater than zero.');
  }
}

function parseDate(value: string, field: string): number {
  requireNonEmpty(value, field);
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw new Error(`${field} must be an ISO date.`);
  }
  return timestamp;
}

function roundCurrency(value: number): number {
  return Math.round(value);
}

function calculateDays(start: number, end: number): number {
  return Math.max(1, Math.ceil((end - start) / dayMs));
}

function buildDigest(result: Omit<Phase6BBillingProrationResult, 'evidence'>): string {
  return createHash('sha256').update(JSON.stringify(result)).digest('hex');
}

export function calculatePhase6BBillingProration(
  input: Phase6BBillingProrationInput,
): Phase6BBillingProrationResult {
  if (input.requested_forbidden_action) {
    throw new Error(forbiddenActionReasons[input.requested_forbidden_action]);
  }

  requireNonEmpty(input.organization_id, 'organization_id');
  requireNonEmpty(input.proration_ref, 'proration_ref');
  requireNonEmpty(input.customer_ref, 'customer_ref');
  requireNonEmpty(input.billing_account_ref, 'billing_account_ref');
  requireNonEmpty(input.service_ref, 'service_ref');
  requireNonEmpty(input.current_pricing_ref, 'current_pricing_ref');
  requireNonEmpty(input.replacement_pricing_ref, 'replacement_pricing_ref');
  requireNonEmpty(input.usage_evidence_ref, 'usage_evidence_ref');
  requireNonEmpty(input.currency, 'currency');
  if (!supportedCurrencies.has(input.currency)) {
    throw new Error('currency must be a supported ISO currency for the Phase 6B billing baseline.');
  }
  if (!supportedReasons.has(input.reason)) {
    throw new Error('reason must be a supported proration reason.');
  }
  requireMinorAmount(input.current_unit_amount_minor, 'current_unit_amount_minor');
  requireMinorAmount(input.replacement_unit_amount_minor, 'replacement_unit_amount_minor');
  requireQuantity(input.quantity);

  const taxRate = input.tax_rate_bps ?? 0;
  if (!Number.isInteger(taxRate) || taxRate < 0 || taxRate > 10000) {
    throw new Error('tax_rate_bps must be an integer between 0 and 10000.');
  }

  const start = parseDate(input.period_start, 'period_start');
  const end = parseDate(input.period_end, 'period_end');
  const effective = parseDate(input.change_effective_at, 'change_effective_at');
  if (end <= start) {
    throw new Error('period_end must be after period_start.');
  }
  if (effective < start || effective > end) {
    throw new Error('change_effective_at must fall inside the billing period.');
  }

  const periodDays = calculateDays(start, end);
  const remainingDays = calculateDays(effective, end);
  const ratioBps = Math.min(10000, Math.max(0, Math.round((remainingDays / periodDays) * 10000)));
  const currentRemaining = roundCurrency(input.current_unit_amount_minor * input.quantity * (ratioBps / 10000));
  const replacementRemaining = roundCurrency(input.replacement_unit_amount_minor * input.quantity * (ratioBps / 10000));
  const currentCredit = currentRemaining === 0 ? 0 : -currentRemaining;
  const replacementCharge = replacementRemaining;
  const subtotalDelta = currentCredit + replacementCharge;
  const taxDelta = roundCurrency(subtotalDelta * (taxRate / 10000));
  const totalDelta = subtotalDelta + taxDelta;

  const lines: Phase6BProrationLine[] = [
    {
      line_id: `${input.proration_ref}:credit_current_period`,
      line_type: 'credit_current_period',
      pricing_ref: input.current_pricing_ref,
      amount_minor: currentCredit,
      proration_ratio_bps: ratioBps,
      evidence_ref: input.usage_evidence_ref,
    },
    {
      line_id: `${input.proration_ref}:charge_replacement_period`,
      line_type: 'charge_replacement_period',
      pricing_ref: input.replacement_pricing_ref,
      amount_minor: replacementCharge,
      proration_ratio_bps: ratioBps,
      evidence_ref: input.usage_evidence_ref,
    },
    {
      line_id: `${input.proration_ref}:tax_delta`,
      line_type: 'tax_delta',
      pricing_ref: input.replacement_pricing_ref,
      amount_minor: taxDelta,
      proration_ratio_bps: ratioBps,
      evidence_ref: input.usage_evidence_ref,
    },
  ];

  const resultWithoutEvidence = {
    organization_id: input.organization_id,
    proration_ref: input.proration_ref,
    customer_ref: input.customer_ref,
    billing_account_ref: input.billing_account_ref,
    service_ref: input.service_ref,
    currency: input.currency,
    reason: input.reason,
    period_days: periodDays,
    remaining_days: remainingDays,
    proration_ratio_bps: ratioBps,
    subtotal_delta_minor: subtotalDelta,
    tax_delta_minor: taxDelta,
    total_delta_minor: totalDelta,
    lines,
  };

  return {
    ...resultWithoutEvidence,
    evidence: {
      seed_id: 'seed_6b_15_billing_proration_engine',
      pricing_authority: 'product_price_history_effective_dates',
      usage_evidence_ref: input.usage_evidence_ref,
      digest: buildDigest(resultWithoutEvidence),
      forbidden_behaviors_rejected: Object.keys(forbiddenActionReasons) as Phase6BForbiddenProrationAction[],
    },
  };
}
