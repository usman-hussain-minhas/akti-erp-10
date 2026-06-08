import { createHash } from 'node:crypto';

type Phase6BBillingSupportView =
  | 'billing_summary'
  | 'invoice_detail'
  | 'receivable_status'
  | 'payment_allocation_status'
  | 'dunning_history';

type Phase6BForbiddenSupportAction =
  | 'mutate_invoice'
  | 'collect_payment'
  | 'run_dunning'
  | 'waive_debt'
  | 'access_without_support_window'
  | 'export_unredacted_data'
  | 'irreversible_action';

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
  requested_forbidden_action?: Phase6BForbiddenSupportAction;
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
    forbidden_behaviors_rejected: Phase6BForbiddenSupportAction[];
  };
};

const supportedViews = new Set<Phase6BBillingSupportView>([
  'billing_summary',
  'invoice_detail',
  'receivable_status',
  'payment_allocation_status',
  'dunning_history',
]);

const forbiddenActionReasons: Record<Phase6BForbiddenSupportAction, string> = {
  mutate_invoice: 'Billing support interface is read-only and cannot mutate invoices.',
  collect_payment: 'Billing support interface cannot collect payments.',
  run_dunning: 'Billing support interface cannot run dunning rules.',
  waive_debt: 'Billing support interface cannot waive debt.',
  access_without_support_window: 'Billing support interface requires an authorized time-bound support window.',
  export_unredacted_data: 'Billing support interface cannot export unredacted tenant data.',
  irreversible_action: 'Billing support interface cannot perform irreversible customer-impacting actions.',
};

const redactedFields = [
  'provider_credentials',
  'payment_instrument_secret',
  'full_bank_account_number',
  'raw_webhook_payload',
  'private_support_notes',
];

function requireNonEmpty(value: string, field: string): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required.`);
  }
}

function requireStringList(values: string[] | undefined, field: string): string[] {
  if (!values) return [];
  if (!Array.isArray(values)) {
    throw new Error(`${field} must be an array.`);
  }
  const normalized = values.map((value) => {
    requireNonEmpty(value, field);
    return value;
  });
  return Array.from(new Set(normalized)).sort();
}

function parseDate(value: string, field: string): number {
  requireNonEmpty(value, field);
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw new Error(`${field} must be an ISO date.`);
  }
  return timestamp;
}

function buildDigest(result: Omit<Phase6BBillingSupportResult, 'evidence'>): string {
  return createHash('sha256').update(JSON.stringify(result)).digest('hex');
}

function buildRecommendations(input: {
  requestedView: Phase6BBillingSupportView;
  invoiceCount: number;
  receivableCount: number;
  paymentAllocationCount: number;
  dunningCaseCount: number;
  budgetCapCount: number;
}): string[] {
  const recommendations = ['Preserve read-only support posture and audit all access through the support window.'];
  if (input.invoiceCount > 0 && input.requestedView === 'invoice_detail') {
    recommendations.push('Inspect immutable invoice snapshot and use adjustment or credit-note flow for correction requests.');
  }
  if (input.receivableCount > 0 && input.paymentAllocationCount === 0) {
    recommendations.push('Review payment allocation status before advising on outstanding receivables.');
  }
  if (input.dunningCaseCount > 0) {
    recommendations.push('Route dunning questions to retention/dunning rules; do not send messages from support view.');
  }
  if (input.budgetCapCount > 0) {
    recommendations.push('Review budget-cap evidence before recommending service-plan changes.');
  }
  return recommendations;
}

export function createPhase6BBillingSupportInterface(
  input: Phase6BBillingSupportInput,
): Phase6BBillingSupportResult {
  if (input.requested_forbidden_action) {
    throw new Error(forbiddenActionReasons[input.requested_forbidden_action]);
  }

  requireNonEmpty(input.organization_id, 'organization_id');
  requireNonEmpty(input.support_case_ref, 'support_case_ref');
  requireNonEmpty(input.support_window_ref, 'support_window_ref');
  requireNonEmpty(input.support_window_authorized_by_ref, 'support_window_authorized_by_ref');
  requireNonEmpty(input.support_agent_ref, 'support_agent_ref');
  requireNonEmpty(input.customer_ref, 'customer_ref');
  requireNonEmpty(input.billing_account_ref, 'billing_account_ref');
  requireNonEmpty(input.support_reason, 'support_reason');
  if (!supportedViews.has(input.requested_view)) {
    throw new Error('requested_view must be a supported billing support view.');
  }
  if (!Array.isArray(input.authorization_scopes) || !input.authorization_scopes.includes('billing_support_read')) {
    throw new Error('authorization_scopes must include billing_support_read.');
  }

  const evaluatedAt = parseDate(input.evaluated_at, 'evaluated_at');
  const expiresAt = parseDate(input.support_window_expires_at, 'support_window_expires_at');
  if (expiresAt <= evaluatedAt) {
    throw new Error('support_window_expires_at must be after evaluated_at.');
  }

  const visibleRefs = {
    invoice_refs: requireStringList(input.invoice_refs, 'invoice_refs'),
    receivable_refs: requireStringList(input.receivable_refs, 'receivable_refs'),
    payment_allocation_refs: requireStringList(input.payment_allocation_refs, 'payment_allocation_refs'),
    budget_cap_refs: requireStringList(input.budget_cap_refs, 'budget_cap_refs'),
    dunning_case_refs: requireStringList(input.dunning_case_refs, 'dunning_case_refs'),
  };

  const visibleRefCount = Object.values(visibleRefs).reduce((sum, refs) => sum + refs.length, 0);
  if (visibleRefCount === 0) {
    throw new Error('at least one billing artifact reference is required for support review.');
  }

  const escalationRequired =
    visibleRefs.dunning_case_refs.length > 0 ||
    visibleRefs.payment_allocation_refs.length === 0 ||
    input.requested_view === 'dunning_history';

  const resultWithoutEvidence = {
    organization_id: input.organization_id,
    support_case_ref: input.support_case_ref,
    support_window_ref: input.support_window_ref,
    support_agent_ref: input.support_agent_ref,
    customer_ref: input.customer_ref,
    billing_account_ref: input.billing_account_ref,
    requested_view: input.requested_view,
    access_state: 'authorized_read_only_support_window' as const,
    visible_refs: visibleRefs,
    redacted_fields: redactedFields,
    escalation_required: escalationRequired,
    support_recommendations: buildRecommendations({
      requestedView: input.requested_view,
      invoiceCount: visibleRefs.invoice_refs.length,
      receivableCount: visibleRefs.receivable_refs.length,
      paymentAllocationCount: visibleRefs.payment_allocation_refs.length,
      dunningCaseCount: visibleRefs.dunning_case_refs.length,
      budgetCapCount: visibleRefs.budget_cap_refs.length,
    }),
  };

  return {
    ...resultWithoutEvidence,
    evidence: {
      seed_id: 'seed_6b_15_billing_support_interface',
      support_window_authorized_by_ref: input.support_window_authorized_by_ref,
      support_window_expires_at: input.support_window_expires_at,
      digest: buildDigest(resultWithoutEvidence),
      forbidden_behaviors_rejected: Object.keys(forbiddenActionReasons) as Phase6BForbiddenSupportAction[],
    },
  };
}
