import { createHash } from 'node:crypto';

export const PHASE_6B_PERIOD_CLOSE_MANAGEMENT_SEED_ID = 'seed_6b_12_period_close_management' as const;
export const PHASE_6B_PERIOD_CLOSE_MANAGEMENT_COMPONENT_ID = '6B.12' as const;

export const PERIOD_CLOSE_MANAGEMENT_EVENT = 'phase_6b.general_ledger_accounting.period.closed' as const;

export type PeriodCloseAction = 'CLOSE_PERIOD';

export type PeriodCloseManagementInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_PERIOD_CLOSE_MANAGEMENT_SEED_ID;
  accounting_period_ref: string;
  period_start_at: string;
  period_end_at: string;
  close_action: PeriodCloseAction;
  invoice_record_authority_ref: string;
  payment_allocation_balance_ref: string;
  expense_record_authority_ref: string;
  journal_entry_evidence_refs: string[];
  period_close_evidence_refs: string[];
  unposted_journal_count: number;
  unresolved_invoice_count: number;
  unresolved_payment_allocation_count: number;
  unresolved_expense_count: number;
  close_authorized_by_user_id: string;
  close_authorized_at: string;
  journal_posting_requested?: boolean;
  tax_report_generation_requested?: boolean;
  payment_allocation_requested?: boolean;
  retrospective_mutation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type PeriodCloseManagementReceipt = {
  seed_id: typeof PHASE_6B_PERIOD_CLOSE_MANAGEMENT_SEED_ID;
  component_id: typeof PHASE_6B_PERIOD_CLOSE_MANAGEMENT_COMPONENT_ID;
  event_name: typeof PERIOD_CLOSE_MANAGEMENT_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  phase_6b_accounting_period_model: 'Phase6BAccountingPeriod';
  source_seed_id: typeof PHASE_6B_PERIOD_CLOSE_MANAGEMENT_SEED_ID;
  accounting_period_ref: string;
  period_start_at: string;
  period_end_at: string;
  close_action: PeriodCloseAction;
  invoice_record_authority_ref: string;
  payment_allocation_balance_ref: string;
  expense_record_authority_ref: string;
  journal_entry_evidence_refs: string[];
  journal_entry_evidence_count: number;
  period_close_evidence_refs: string[];
  period_close_evidence_count: number;
  unposted_journal_count: 0;
  unresolved_invoice_count: 0;
  unresolved_payment_allocation_count: 0;
  unresolved_expense_count: 0;
  period_protection_enforced: true;
  period_closed: true;
  reopen_performed: false;
  journal_posting_performed: false;
  tax_report_generated: false;
  payment_allocation_performed: false;
  retrospective_mutation_performed: false;
  irreversible_action_allowed: false;
  period_close_evidence_ref: string;
  period_close_digest: string;
  close_authorized_by_user_id: string;
  close_authorized_at: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for period close management.`);
  }
  return value.trim();
}

function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for period close management.`);
  }
  return normalized;
}

function requireSourceSeed(value: string): typeof PHASE_6B_PERIOD_CLOSE_MANAGEMENT_SEED_ID {
  const sourceSeedId = requireNonEmpty(value, 'source_seed_id');
  if (sourceSeedId !== PHASE_6B_PERIOD_CLOSE_MANAGEMENT_SEED_ID) {
    throw new Error('source_seed_id must match seed_6b_12_period_close_management.');
  }
  return PHASE_6B_PERIOD_CLOSE_MANAGEMENT_SEED_ID;
}

function requireCloseAction(value: PeriodCloseAction): PeriodCloseAction {
  if (value !== 'CLOSE_PERIOD') {
    throw new Error('close_action must be CLOSE_PERIOD for period close management.');
  }
  return value;
}

function requireZero(value: number, field: string): 0 {
  if (!Number.isInteger(value) || value !== 0) {
    throw new Error(`${field} must be 0 before period close.`);
  }
  return 0;
}

function normalizeEvidenceRefs(value: string[], field: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${field} must include at least one evidence reference for period close management.`);
  }
  const refs = value.map((ref, index) => requireNonEmpty(ref, `${field}[${index}]`));
  if (new Set(refs).size !== refs.length) {
    throw new Error(`${field} must not contain duplicates for period close management.`);
  }
  return refs;
}

function digestPeriodClose(receiptWithoutDigest: Omit<PeriodCloseManagementReceipt, 'period_close_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function closeAccountingPeriod(input: PeriodCloseManagementInput): PeriodCloseManagementReceipt {
  if (input.journal_posting_requested === true) {
    throw new Error('period close management must not post journals.');
  }
  if (input.tax_report_generation_requested === true) {
    throw new Error('period close management must not generate tax reports.');
  }
  if (input.payment_allocation_requested === true) {
    throw new Error('period close management must not perform payment allocation math.');
  }
  if (input.retrospective_mutation_requested === true) {
    throw new Error('period close management must not perform retrospective mutation.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('period close management must not perform irreversible actions.');
  }

  const periodStartAt = requireTimestamp(input.period_start_at, 'period_start_at');
  const periodEndAt = requireTimestamp(input.period_end_at, 'period_end_at');
  if (Date.parse(periodEndAt) <= Date.parse(periodStartAt)) {
    throw new Error('period_end_at must be later than period_start_at for period close management.');
  }
  const accountingPeriodRef = requireNonEmpty(input.accounting_period_ref, 'accounting_period_ref');
  const journalEntryEvidenceRefs = normalizeEvidenceRefs(input.journal_entry_evidence_refs, 'journal_entry_evidence_refs');
  const periodCloseEvidenceRefs = normalizeEvidenceRefs(input.period_close_evidence_refs, 'period_close_evidence_refs');

  const receiptWithoutDigest: Omit<PeriodCloseManagementReceipt, 'period_close_digest'> = {
    seed_id: PHASE_6B_PERIOD_CLOSE_MANAGEMENT_SEED_ID,
    component_id: PHASE_6B_PERIOD_CLOSE_MANAGEMENT_COMPONENT_ID,
    event_name: PERIOD_CLOSE_MANAGEMENT_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    phase_6b_accounting_period_model: 'Phase6BAccountingPeriod',
    source_seed_id: requireSourceSeed(input.source_seed_id),
    accounting_period_ref: accountingPeriodRef,
    period_start_at: periodStartAt,
    period_end_at: periodEndAt,
    close_action: requireCloseAction(input.close_action),
    invoice_record_authority_ref: requireNonEmpty(input.invoice_record_authority_ref, 'invoice_record_authority_ref'),
    payment_allocation_balance_ref: requireNonEmpty(input.payment_allocation_balance_ref, 'payment_allocation_balance_ref'),
    expense_record_authority_ref: requireNonEmpty(input.expense_record_authority_ref, 'expense_record_authority_ref'),
    journal_entry_evidence_refs: journalEntryEvidenceRefs,
    journal_entry_evidence_count: journalEntryEvidenceRefs.length,
    period_close_evidence_refs: periodCloseEvidenceRefs,
    period_close_evidence_count: periodCloseEvidenceRefs.length,
    unposted_journal_count: requireZero(input.unposted_journal_count, 'unposted_journal_count'),
    unresolved_invoice_count: requireZero(input.unresolved_invoice_count, 'unresolved_invoice_count'),
    unresolved_payment_allocation_count: requireZero(input.unresolved_payment_allocation_count, 'unresolved_payment_allocation_count'),
    unresolved_expense_count: requireZero(input.unresolved_expense_count, 'unresolved_expense_count'),
    period_protection_enforced: true,
    period_closed: true,
    reopen_performed: false,
    journal_posting_performed: false,
    tax_report_generated: false,
    payment_allocation_performed: false,
    retrospective_mutation_performed: false,
    irreversible_action_allowed: false,
    period_close_evidence_ref: `period_close:${accountingPeriodRef}:closed`,
    close_authorized_by_user_id: requireNonEmpty(input.close_authorized_by_user_id, 'close_authorized_by_user_id'),
    close_authorized_at: requireTimestamp(input.close_authorized_at, 'close_authorized_at'),
  };

  return {
    ...receiptWithoutDigest,
    period_close_digest: digestPeriodClose(receiptWithoutDigest),
  };
}
