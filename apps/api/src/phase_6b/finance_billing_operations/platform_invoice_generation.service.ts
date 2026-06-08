import { createHash } from 'node:crypto';

type Phase6BPlatformInvoiceLineKind = 'subscription' | 'usage' | 'adjustment' | 'tax';

type Phase6BPlatformInvoiceLineInput = {
  line_id: string;
  service_ref: string;
  pricing_ref: string;
  usage_evidence_ref: string;
  description: string;
  kind: Phase6BPlatformInvoiceLineKind;
  quantity: number;
  unit_amount_minor: number;
  tax_rate_bps?: number;
  discount_amount_minor?: number;
};

type Phase6BForbiddenInvoiceAction =
  | 'collect_payment'
  | 'send_invoice'
  | 'post_journal'
  | 'run_dunning'
  | 'mutate_final_invoice'
  | 'irreversible_action';

export type Phase6BPlatformInvoiceGenerationInput = {
  organization_id: string;
  invoice_ref: string;
  customer_ref: string;
  billing_account_ref: string;
  pricing_table_ref: string;
  payment_allocation_ref?: string;
  chart_version_ref: string;
  currency: string;
  issue_date: string;
  due_date: string;
  lines: Phase6BPlatformInvoiceLineInput[];
  requested_forbidden_action?: Phase6BForbiddenInvoiceAction;
  generated_at?: string;
};

export type Phase6BPlatformInvoiceLineOutput = Phase6BPlatformInvoiceLineInput & {
  gross_amount_minor: number;
  net_amount_minor: number;
  tax_amount_minor: number;
  total_amount_minor: number;
};

export type Phase6BPlatformInvoiceGenerationResult = {
  organization_id: string;
  invoice_ref: string;
  customer_ref: string;
  billing_account_ref: string;
  pricing_table_ref: string;
  payment_allocation_ref?: string;
  chart_version_ref: string;
  currency: string;
  issue_date: string;
  due_date: string;
  status: 'generated_immutable_snapshot';
  subtotal_minor: number;
  discount_total_minor: number;
  tax_total_minor: number;
  grand_total_minor: number;
  line_count: number;
  lines: Phase6BPlatformInvoiceLineOutput[];
  immutable_snapshot: {
    invoice_ref: string;
    pricing_table_ref: string;
    usage_evidence_refs: string[];
    generated_at: string;
    snapshot_digest: string;
  };
  evidence: {
    seed_id: 'seed_6b_15_platform_invoice_generation';
    source_models: ['Phase6BPlatformInvoice', 'Phase6BPlatformInvoiceLine', 'Phase6BBillingOperation'];
    forbidden_behaviors_rejected: Phase6BForbiddenInvoiceAction[];
  };
};

const forbiddenActionReasons: Record<Phase6BForbiddenInvoiceAction, string> = {
  collect_payment: 'Platform invoice generation cannot collect payment.',
  send_invoice: 'Platform invoice generation cannot send invoices through a communication channel.',
  post_journal: 'Platform invoice generation cannot post general-ledger entries.',
  run_dunning: 'Platform invoice generation cannot run retention or dunning rules.',
  mutate_final_invoice: 'Generated invoice snapshots are immutable; use credit-note or adjustment flows.',
  irreversible_action: 'Platform invoice generation cannot perform irreversible customer-impacting actions.',
};

const supportedCurrencies = new Set(['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR']);

function requireNonEmpty(value: string, field: string): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required.`);
  }
}

function requireIntegerMinor(value: number, field: string): void {
  if (!Number.isInteger(value)) {
    throw new Error(`${field} must be an integer minor-unit amount.`);
  }
}

function requirePositiveNumber(value: number, field: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${field} must be greater than zero.`);
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

function calculateLine(line: Phase6BPlatformInvoiceLineInput): Phase6BPlatformInvoiceLineOutput {
  requireNonEmpty(line.line_id, 'line_id');
  requireNonEmpty(line.service_ref, 'service_ref');
  requireNonEmpty(line.pricing_ref, 'pricing_ref');
  requireNonEmpty(line.usage_evidence_ref, 'usage_evidence_ref');
  requireNonEmpty(line.description, 'description');
  requirePositiveNumber(line.quantity, 'quantity');
  requireIntegerMinor(line.unit_amount_minor, 'unit_amount_minor');

  const discount = line.discount_amount_minor ?? 0;
  const taxRate = line.tax_rate_bps ?? 0;
  requireIntegerMinor(discount, 'discount_amount_minor');
  if (discount < 0) {
    throw new Error('discount_amount_minor cannot be negative.');
  }
  if (!Number.isInteger(taxRate) || taxRate < 0 || taxRate > 10000) {
    throw new Error('tax_rate_bps must be an integer between 0 and 10000.');
  }

  const gross = Math.round(line.quantity * line.unit_amount_minor);
  const net = gross - discount;
  if (net < 0) {
    throw new Error('discount_amount_minor cannot exceed the gross line amount.');
  }
  const tax = Math.round((net * taxRate) / 10000);

  return {
    ...line,
    discount_amount_minor: discount,
    tax_rate_bps: taxRate,
    gross_amount_minor: gross,
    net_amount_minor: net,
    tax_amount_minor: tax,
    total_amount_minor: net + tax,
  };
}

function buildDigest(input: Omit<Phase6BPlatformInvoiceGenerationResult, 'immutable_snapshot' | 'evidence'>, generatedAt: string): string {
  return createHash('sha256')
    .update(JSON.stringify({ ...input, generated_at: generatedAt }))
    .digest('hex');
}

export function generatePhase6BPlatformInvoice(
  input: Phase6BPlatformInvoiceGenerationInput,
): Phase6BPlatformInvoiceGenerationResult {
  if (input.requested_forbidden_action) {
    throw new Error(forbiddenActionReasons[input.requested_forbidden_action]);
  }

  requireNonEmpty(input.organization_id, 'organization_id');
  requireNonEmpty(input.invoice_ref, 'invoice_ref');
  requireNonEmpty(input.customer_ref, 'customer_ref');
  requireNonEmpty(input.billing_account_ref, 'billing_account_ref');
  requireNonEmpty(input.pricing_table_ref, 'pricing_table_ref');
  requireNonEmpty(input.chart_version_ref, 'chart_version_ref');
  requireNonEmpty(input.currency, 'currency');
  if (!supportedCurrencies.has(input.currency)) {
    throw new Error('currency must be a supported ISO currency for the Phase 6B billing baseline.');
  }
  const issueTimestamp = parseDate(input.issue_date, 'issue_date');
  const dueTimestamp = parseDate(input.due_date, 'due_date');
  if (dueTimestamp < issueTimestamp) {
    throw new Error('due_date cannot be before issue_date.');
  }
  if (!Array.isArray(input.lines) || input.lines.length === 0) {
    throw new Error('at least one invoice line is required.');
  }

  const seenLineIds = new Set<string>();
  const lines = input.lines.map((line) => {
    if (seenLineIds.has(line.line_id)) {
      throw new Error(`duplicate invoice line_id ${line.line_id}.`);
    }
    seenLineIds.add(line.line_id);
    return calculateLine(line);
  });

  const subtotal = lines.reduce((sum, line) => sum + line.gross_amount_minor, 0);
  const discountTotal = lines.reduce((sum, line) => sum + (line.discount_amount_minor ?? 0), 0);
  const taxTotal = lines.reduce((sum, line) => sum + line.tax_amount_minor, 0);
  const grandTotal = lines.reduce((sum, line) => sum + line.total_amount_minor, 0);
  const generatedAt = input.generated_at ?? new Date(0).toISOString();

  const baseResult = {
    organization_id: input.organization_id,
    invoice_ref: input.invoice_ref,
    customer_ref: input.customer_ref,
    billing_account_ref: input.billing_account_ref,
    pricing_table_ref: input.pricing_table_ref,
    payment_allocation_ref: input.payment_allocation_ref,
    chart_version_ref: input.chart_version_ref,
    currency: input.currency,
    issue_date: input.issue_date,
    due_date: input.due_date,
    status: 'generated_immutable_snapshot' as const,
    subtotal_minor: subtotal,
    discount_total_minor: discountTotal,
    tax_total_minor: taxTotal,
    grand_total_minor: grandTotal,
    line_count: lines.length,
    lines,
  };

  return {
    ...baseResult,
    immutable_snapshot: {
      invoice_ref: input.invoice_ref,
      pricing_table_ref: input.pricing_table_ref,
      usage_evidence_refs: Array.from(new Set(lines.map((line) => line.usage_evidence_ref))).sort(),
      generated_at: generatedAt,
      snapshot_digest: buildDigest(baseResult, generatedAt),
    },
    evidence: {
      seed_id: 'seed_6b_15_platform_invoice_generation',
      source_models: ['Phase6BPlatformInvoice', 'Phase6BPlatformInvoiceLine', 'Phase6BBillingOperation'],
      forbidden_behaviors_rejected: Object.keys(forbiddenActionReasons) as Phase6BForbiddenInvoiceAction[],
    },
  };
}
