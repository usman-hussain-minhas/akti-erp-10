export const PHASE_6B_AGING_AND_OVERDUE_MANAGEMENT_SEED_ID = 'seed_6b_09_aging_and_overdue_management' as const;
export const PHASE_6B_AGING_AND_OVERDUE_MANAGEMENT_COMPONENT_ID = '6B.09' as const;

export const AGING_AND_OVERDUE_MANAGEMENT_EVENT = 'phase_6b.finance_invoice_receivables.aging_overdue.evaluated' as const;

export type AgingReceivableStatus = 'CURRENT' | 'OVERDUE' | 'SETTLED';
export type AgingWorkflowDisposition = 'NO_ACTION' | 'MANUAL_REVIEW' | 'WORKFLOW_ESCALATION';

export type AgingBucketPolicy = {
  bucket_id: string;
  label: string;
  min_days_past_due: number;
  max_days_past_due?: number;
  pipeline_stage_model_ref: string;
  visual_workflow_builder_ref: string;
  requires_manual_review: boolean;
};

export type AgingReceivableInput = {
  receivable_id: string;
  invoice_record_ref: string;
  currency_code: string;
  receivable_balance_minor: number;
  due_at: string;
  issued_at: string;
  customer_account_ref: string;
  payment_terms_ref: string;
  credit_note_total_minor: number;
  debit_note_total_minor: number;
  applied_payment_total_minor: number;
};

export type AgingAndOverdueManagementInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  product_record_authority_ref: string;
  product_price_history_ref: string;
  pricing_table_effective_date_ref: string;
  pipeline_stage_model_ref: string;
  visual_workflow_builder_ref: string;
  as_of: string;
  managed_by_user_id: string;
  aging_policy: AgingBucketPolicy[];
  receivables: AgingReceivableInput[];
  payment_allocation_requested?: boolean;
  communication_send_requested?: boolean;
  provider_callback_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type AgingReceivableEvaluation = {
  receivable_id: string;
  invoice_record_ref: string;
  customer_account_ref: string;
  payment_terms_ref: string;
  currency_code: string;
  receivable_balance_minor: number;
  due_at: string;
  issued_at: string;
  days_past_due: number;
  status: AgingReceivableStatus;
  aging_bucket_id: string;
  aging_bucket_label: string;
  pipeline_stage_model_ref: string;
  visual_workflow_builder_ref: string;
  disposition: AgingWorkflowDisposition;
  credit_note_total_minor: number;
  debit_note_total_minor: number;
  applied_payment_total_minor: number;
};

export type AgingAndOverdueManagementReceipt = {
  seed_id: typeof PHASE_6B_AGING_AND_OVERDUE_MANAGEMENT_SEED_ID;
  component_id: typeof PHASE_6B_AGING_AND_OVERDUE_MANAGEMENT_COMPONENT_ID;
  event_name: typeof AGING_AND_OVERDUE_MANAGEMENT_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  product_record_authority_ref: string;
  product_price_history_ref: string;
  pricing_table_effective_date_ref: string;
  pipeline_stage_model_ref: string;
  visual_workflow_builder_ref: string;
  as_of: string;
  managed_by_user_id: string;
  total_receivable_count: number;
  overdue_receivable_count: number;
  current_receivable_count: number;
  settled_receivable_count: number;
  total_open_balance_minor_by_currency: Record<string, number>;
  evaluations: AgingReceivableEvaluation[];
  payment_allocation_performed: false;
  communication_send_performed: false;
  provider_callback_processing_allowed: false;
  irreversible_action_allowed: false;
  evaluated_at: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for aging and overdue management.`);
  }
  return value.trim();
}

function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for aging and overdue management.`);
  }
  return normalized;
}

function normalizeCurrency(value: string): string {
  const currency = requireNonEmpty(value, 'currency_code').toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error('currency_code must be a three-letter ISO-style code for aging and overdue management.');
  }
  return currency;
}

function normalizeMinorAmount(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer for aging and overdue management.`);
  }
  return value;
}

function normalizePolicy(policy: AgingBucketPolicy[]): AgingBucketPolicy[] {
  if (!Array.isArray(policy) || policy.length === 0) {
    throw new Error('aging_policy must include at least one bucket for aging and overdue management.');
  }
  const normalized = policy.map((bucket) => {
    const minDays = bucket.min_days_past_due;
    const maxDays = bucket.max_days_past_due;
    if (!Number.isInteger(minDays) || minDays < 0) {
      throw new Error('aging_policy.min_days_past_due must be a non-negative integer.');
    }
    if (maxDays !== undefined && (!Number.isInteger(maxDays) || maxDays < minDays)) {
      throw new Error('aging_policy.max_days_past_due must be greater than or equal to min_days_past_due.');
    }
    if (typeof bucket.requires_manual_review !== 'boolean') {
      throw new Error('aging_policy.requires_manual_review must be boolean.');
    }
    return {
      bucket_id: requireNonEmpty(bucket.bucket_id, 'aging_policy.bucket_id'),
      label: requireNonEmpty(bucket.label, 'aging_policy.label'),
      min_days_past_due: minDays,
      max_days_past_due: maxDays,
      pipeline_stage_model_ref: requireNonEmpty(bucket.pipeline_stage_model_ref, 'aging_policy.pipeline_stage_model_ref'),
      visual_workflow_builder_ref: requireNonEmpty(bucket.visual_workflow_builder_ref, 'aging_policy.visual_workflow_builder_ref'),
      requires_manual_review: bucket.requires_manual_review,
    };
  });
  const ids = new Set<string>();
  for (const bucket of normalized) {
    if (ids.has(bucket.bucket_id)) {
      throw new Error('aging_policy.bucket_id values must be unique for aging and overdue management.');
    }
    ids.add(bucket.bucket_id);
  }
  return normalized.sort((a, b) => a.min_days_past_due - b.min_days_past_due);
}

function daysPastDue(dueAt: string, asOf: string): number {
  const difference = Date.parse(asOf) - Date.parse(dueAt);
  if (difference <= 0) return 0;
  return Math.floor(difference / DAY_MS);
}

function bucketFor(days: number, policy: AgingBucketPolicy[]): AgingBucketPolicy {
  const bucket = policy.find((candidate) => {
    const aboveMin = days >= candidate.min_days_past_due;
    const belowMax = candidate.max_days_past_due === undefined || days <= candidate.max_days_past_due;
    return aboveMin && belowMax;
  });
  if (!bucket) {
    throw new Error(`aging_policy does not cover ${days} days past due.`);
  }
  return bucket;
}

function dispositionFor(status: AgingReceivableStatus, bucket: AgingBucketPolicy): AgingWorkflowDisposition {
  if (status === 'SETTLED' || status === 'CURRENT') return 'NO_ACTION';
  return bucket.requires_manual_review ? 'MANUAL_REVIEW' : 'WORKFLOW_ESCALATION';
}

export function evaluateAgingAndOverdueManagement(input: AgingAndOverdueManagementInput): AgingAndOverdueManagementReceipt {
  if (input.payment_allocation_requested === true) {
    throw new Error('aging and overdue management must not perform payment allocation math.');
  }
  if (input.communication_send_requested === true) {
    throw new Error('aging and overdue management must not send communications.');
  }
  if (input.provider_callback_requested === true) {
    throw new Error('aging and overdue management must not process provider callbacks.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('aging and overdue management must not perform irreversible actions.');
  }

  const asOf = requireTimestamp(input.as_of, 'as_of');
  const policy = normalizePolicy(input.aging_policy);
  if (!Array.isArray(input.receivables)) {
    throw new Error('receivables must be an array for aging and overdue management.');
  }

  const evaluations = input.receivables.map((receivable) => {
    const issuedAt = requireTimestamp(receivable.issued_at, 'issued_at');
    const dueAt = requireTimestamp(receivable.due_at, 'due_at');
    if (Date.parse(dueAt) < Date.parse(issuedAt)) {
      throw new Error('due_at must not be earlier than issued_at for aging and overdue management.');
    }
    const receivableBalanceMinor = normalizeMinorAmount(receivable.receivable_balance_minor, 'receivable_balance_minor');
    const creditNoteTotalMinor = normalizeMinorAmount(receivable.credit_note_total_minor, 'credit_note_total_minor');
    const debitNoteTotalMinor = normalizeMinorAmount(receivable.debit_note_total_minor, 'debit_note_total_minor');
    const appliedPaymentTotalMinor = normalizeMinorAmount(receivable.applied_payment_total_minor, 'applied_payment_total_minor');
    const pastDue = receivableBalanceMinor === 0 ? 0 : daysPastDue(dueAt, asOf);
    const status: AgingReceivableStatus = receivableBalanceMinor === 0 ? 'SETTLED' : pastDue > 0 ? 'OVERDUE' : 'CURRENT';
    const bucket = bucketFor(pastDue, policy);

    return {
      receivable_id: requireNonEmpty(receivable.receivable_id, 'receivable_id'),
      invoice_record_ref: requireNonEmpty(receivable.invoice_record_ref, 'invoice_record_ref'),
      customer_account_ref: requireNonEmpty(receivable.customer_account_ref, 'customer_account_ref'),
      payment_terms_ref: requireNonEmpty(receivable.payment_terms_ref, 'payment_terms_ref'),
      currency_code: normalizeCurrency(receivable.currency_code),
      receivable_balance_minor: receivableBalanceMinor,
      due_at: dueAt,
      issued_at: issuedAt,
      days_past_due: pastDue,
      status,
      aging_bucket_id: bucket.bucket_id,
      aging_bucket_label: bucket.label,
      pipeline_stage_model_ref: bucket.pipeline_stage_model_ref,
      visual_workflow_builder_ref: bucket.visual_workflow_builder_ref,
      disposition: dispositionFor(status, bucket),
      credit_note_total_minor: creditNoteTotalMinor,
      debit_note_total_minor: debitNoteTotalMinor,
      applied_payment_total_minor: appliedPaymentTotalMinor,
    };
  });

  const totals: Record<string, number> = {};
  for (const evaluation of evaluations) {
    if (evaluation.status === 'SETTLED') continue;
    totals[evaluation.currency_code] = (totals[evaluation.currency_code] ?? 0) + evaluation.receivable_balance_minor;
  }

  return {
    seed_id: PHASE_6B_AGING_AND_OVERDUE_MANAGEMENT_SEED_ID,
    component_id: PHASE_6B_AGING_AND_OVERDUE_MANAGEMENT_COMPONENT_ID,
    event_name: AGING_AND_OVERDUE_MANAGEMENT_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    product_record_authority_ref: requireNonEmpty(input.product_record_authority_ref, 'product_record_authority_ref'),
    product_price_history_ref: requireNonEmpty(input.product_price_history_ref, 'product_price_history_ref'),
    pricing_table_effective_date_ref: requireNonEmpty(input.pricing_table_effective_date_ref, 'pricing_table_effective_date_ref'),
    pipeline_stage_model_ref: requireNonEmpty(input.pipeline_stage_model_ref, 'pipeline_stage_model_ref'),
    visual_workflow_builder_ref: requireNonEmpty(input.visual_workflow_builder_ref, 'visual_workflow_builder_ref'),
    as_of: asOf,
    managed_by_user_id: requireNonEmpty(input.managed_by_user_id, 'managed_by_user_id'),
    total_receivable_count: evaluations.length,
    overdue_receivable_count: evaluations.filter((evaluation) => evaluation.status === 'OVERDUE').length,
    current_receivable_count: evaluations.filter((evaluation) => evaluation.status === 'CURRENT').length,
    settled_receivable_count: evaluations.filter((evaluation) => evaluation.status === 'SETTLED').length,
    total_open_balance_minor_by_currency: totals,
    evaluations,
    payment_allocation_performed: false,
    communication_send_performed: false,
    provider_callback_processing_allowed: false,
    irreversible_action_allowed: false,
    evaluated_at: asOf,
  };
}
