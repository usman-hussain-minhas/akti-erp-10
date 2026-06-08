import { createHash } from 'node:crypto';

export const PHASE_6B_TAX_MAPPING_REPORTING_SEED_ID = 'seed_6b_12_tax_mapping_reporting' as const;
export const PHASE_6B_TAX_MAPPING_REPORTING_COMPONENT_ID = '6B.12' as const;

export const TAX_MAPPING_REPORTING_EVENT = 'phase_6b.general_ledger_accounting.tax_report.generated' as const;

export type TaxRoundingMode = 'ROUND_HALF_UP' | 'ROUND_HALF_EVEN' | 'TRUNCATE';
export type TaxSourceEvent = 'invoice.issued' | 'payment.verified' | 'expense.created';

export type TaxMappingInput = {
  tax_mapping_ref: string;
  tax_code_ref: string;
  source_event_name: TaxSourceEvent;
  chart_of_account_ref: string;
  tax_rate_basis_points: number;
  rounding_mode: TaxRoundingMode;
  mapping_evidence_ref: string;
};

export type TaxableLineInput = {
  taxable_line_ref: string;
  source_event_name: TaxSourceEvent;
  source_document_ref: string;
  tax_mapping_ref: string;
  net_amount_minor: number;
  currency_code: string;
};

export type TaxMappingReportingInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_TAX_MAPPING_REPORTING_SEED_ID;
  tax_report_ref: string;
  accounting_period_ref: string;
  chart_version_ref: string;
  invoice_record_authority_ref: string;
  payment_allocation_balance_ref: string;
  expense_record_authority_ref: string;
  base_currency_code: string;
  regional_compliance_pack_ref?: string;
  tax_mappings: TaxMappingInput[];
  taxable_lines: TaxableLineInput[];
  generated_by_user_id: string;
  generated_at: string;
  journal_posting_requested?: boolean;
  period_close_requested?: boolean;
  external_tax_filing_requested?: boolean;
  payment_allocation_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type TaxReportLine = {
  taxable_line_ref: string;
  tax_mapping_ref: string;
  tax_code_ref: string;
  source_event_name: TaxSourceEvent;
  source_document_ref: string;
  net_amount_minor: number;
  tax_amount_minor: number;
  currency_code: string;
  rounding_mode: TaxRoundingMode;
};

export type TaxMappingReportingReceipt = {
  seed_id: typeof PHASE_6B_TAX_MAPPING_REPORTING_SEED_ID;
  component_id: typeof PHASE_6B_TAX_MAPPING_REPORTING_COMPONENT_ID;
  event_name: typeof TAX_MAPPING_REPORTING_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  phase_6b_tax_mapping_model: 'Phase6BTaxMapping';
  source_seed_id: typeof PHASE_6B_TAX_MAPPING_REPORTING_SEED_ID;
  tax_report_ref: string;
  accounting_period_ref: string;
  chart_version_ref: string;
  invoice_record_authority_ref: string;
  payment_allocation_balance_ref: string;
  expense_record_authority_ref: string;
  base_currency_code: string;
  regional_compliance_pack_ref?: string;
  tax_mappings: TaxMappingInput[];
  report_lines: TaxReportLine[];
  mapping_count: number;
  taxable_line_count: number;
  total_net_amount_minor: number;
  total_tax_amount_minor: number;
  adl_refs: readonly string[];
  tax_report_generated: true;
  external_tax_filing_submitted: false;
  journal_posting_performed: false;
  period_closed: false;
  payment_allocation_performed: false;
  provider_callback_processed: false;
  irreversible_action_allowed: false;
  tax_report_evidence_ref: string;
  tax_report_digest: string;
  generated_by_user_id: string;
  generated_at: string;
};

const ROUNDING_MODES: readonly TaxRoundingMode[] = ['ROUND_HALF_UP', 'ROUND_HALF_EVEN', 'TRUNCATE'] as const;
const SOURCE_EVENTS: readonly TaxSourceEvent[] = ['invoice.issued', 'payment.verified', 'expense.created'] as const;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for tax mapping reporting.`);
  }
  return value.trim();
}

function optionalNonEmpty(value: string | undefined, field: string): string | undefined {
  if (value === undefined) return undefined;
  return requireNonEmpty(value, field);
}

function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for tax mapping reporting.`);
  }
  return normalized;
}

function requireSourceSeed(value: string): typeof PHASE_6B_TAX_MAPPING_REPORTING_SEED_ID {
  const sourceSeedId = requireNonEmpty(value, 'source_seed_id');
  if (sourceSeedId !== PHASE_6B_TAX_MAPPING_REPORTING_SEED_ID) {
    throw new Error('source_seed_id must match seed_6b_12_tax_mapping_reporting.');
  }
  return PHASE_6B_TAX_MAPPING_REPORTING_SEED_ID;
}

function normalizeCurrency(value: string, field: string): string {
  const currency = requireNonEmpty(value, field).toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error(`${field} must be a three-letter ISO-style code for tax mapping reporting.`);
  }
  return currency;
}

function requireSourceEvent(value: TaxSourceEvent): TaxSourceEvent {
  if (!SOURCE_EVENTS.includes(value)) {
    throw new Error('source_event_name is not supported for tax mapping reporting.');
  }
  return value;
}

function requireRoundingMode(value: TaxRoundingMode): TaxRoundingMode {
  if (!ROUNDING_MODES.includes(value)) {
    throw new Error('rounding_mode is not supported for tax mapping reporting.');
  }
  return value;
}

function requireNonNegativeInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer for tax mapping reporting.`);
  }
  return value;
}

function roundTax(numerator: number, roundingMode: TaxRoundingMode): number {
  const quotient = Math.trunc(numerator / 10000);
  const remainder = numerator % 10000;
  if (roundingMode === 'TRUNCATE' || remainder === 0) return quotient;
  if (roundingMode === 'ROUND_HALF_UP') return remainder >= 5000 ? quotient + 1 : quotient;
  if (remainder > 5000) return quotient + 1;
  if (remainder < 5000) return quotient;
  return quotient % 2 === 0 ? quotient : quotient + 1;
}

function normalizeMapping(mapping: TaxMappingInput): TaxMappingInput {
  return {
    tax_mapping_ref: requireNonEmpty(mapping.tax_mapping_ref, 'tax_mappings.tax_mapping_ref'),
    tax_code_ref: requireNonEmpty(mapping.tax_code_ref, 'tax_mappings.tax_code_ref'),
    source_event_name: requireSourceEvent(mapping.source_event_name),
    chart_of_account_ref: requireNonEmpty(mapping.chart_of_account_ref, 'tax_mappings.chart_of_account_ref'),
    tax_rate_basis_points: requireNonNegativeInteger(mapping.tax_rate_basis_points, 'tax_mappings.tax_rate_basis_points'),
    rounding_mode: requireRoundingMode(mapping.rounding_mode),
    mapping_evidence_ref: requireNonEmpty(mapping.mapping_evidence_ref, 'tax_mappings.mapping_evidence_ref'),
  };
}

function normalizeMappings(mappings: TaxMappingInput[]): TaxMappingInput[] {
  if (!Array.isArray(mappings) || mappings.length === 0) {
    throw new Error('tax_mappings must include at least one mapping for tax mapping reporting.');
  }
  const normalized = mappings.map(normalizeMapping);
  const refs = normalized.map((mapping) => mapping.tax_mapping_ref);
  if (new Set(refs).size !== refs.length) {
    throw new Error('tax_mappings must not repeat tax_mapping_ref.');
  }
  return normalized;
}

function normalizeLine(line: TaxableLineInput, mappingRefs: Set<string>, baseCurrencyCode: string): TaxableLineInput {
  const taxMappingRef = requireNonEmpty(line.tax_mapping_ref, 'taxable_lines.tax_mapping_ref');
  if (!mappingRefs.has(taxMappingRef)) {
    throw new Error('taxable_lines.tax_mapping_ref must reference a tax mapping.');
  }
  const currencyCode = normalizeCurrency(line.currency_code, 'taxable_lines.currency_code');
  if (currencyCode !== baseCurrencyCode) {
    throw new Error('taxable_lines.currency_code must match base_currency_code for tax mapping reporting.');
  }
  return {
    taxable_line_ref: requireNonEmpty(line.taxable_line_ref, 'taxable_lines.taxable_line_ref'),
    source_event_name: requireSourceEvent(line.source_event_name),
    source_document_ref: requireNonEmpty(line.source_document_ref, 'taxable_lines.source_document_ref'),
    tax_mapping_ref: taxMappingRef,
    net_amount_minor: requireNonNegativeInteger(line.net_amount_minor, 'taxable_lines.net_amount_minor'),
    currency_code: currencyCode,
  };
}

function normalizeLines(lines: TaxableLineInput[], mappings: TaxMappingInput[], baseCurrencyCode: string): TaxableLineInput[] {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error('taxable_lines must include at least one line for tax mapping reporting.');
  }
  const mappingRefs = new Set(mappings.map((mapping) => mapping.tax_mapping_ref));
  const normalized = lines.map((line) => normalizeLine(line, mappingRefs, baseCurrencyCode));
  const refs = normalized.map((line) => line.taxable_line_ref);
  if (new Set(refs).size !== refs.length) {
    throw new Error('taxable_lines must not repeat taxable_line_ref.');
  }
  return normalized;
}

function buildReportLine(line: TaxableLineInput, mapping: TaxMappingInput): TaxReportLine {
  const taxAmountMinor = roundTax(line.net_amount_minor * mapping.tax_rate_basis_points, mapping.rounding_mode);
  return {
    taxable_line_ref: line.taxable_line_ref,
    tax_mapping_ref: mapping.tax_mapping_ref,
    tax_code_ref: mapping.tax_code_ref,
    source_event_name: line.source_event_name,
    source_document_ref: line.source_document_ref,
    net_amount_minor: line.net_amount_minor,
    tax_amount_minor: taxAmountMinor,
    currency_code: line.currency_code,
    rounding_mode: mapping.rounding_mode,
  };
}

function digestTaxReport(receiptWithoutDigest: Omit<TaxMappingReportingReceipt, 'tax_report_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function generateTaxMappingReport(input: TaxMappingReportingInput): TaxMappingReportingReceipt {
  if (input.journal_posting_requested === true) {
    throw new Error('tax mapping reporting must not post journals.');
  }
  if (input.period_close_requested === true) {
    throw new Error('tax mapping reporting must not close accounting periods.');
  }
  if (input.external_tax_filing_requested === true) {
    throw new Error('tax mapping reporting must not submit external tax filings.');
  }
  if (input.payment_allocation_requested === true) {
    throw new Error('tax mapping reporting must not perform payment allocation math.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('tax mapping reporting must not process provider callbacks.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('tax mapping reporting must not perform irreversible actions.');
  }

  const baseCurrencyCode = normalizeCurrency(input.base_currency_code, 'base_currency_code');
  const taxMappings = normalizeMappings(input.tax_mappings);
  const taxableLines = normalizeLines(input.taxable_lines, taxMappings, baseCurrencyCode);
  const mappingByRef = new Map(taxMappings.map((mapping) => [mapping.tax_mapping_ref, mapping]));
  const reportLines = taxableLines.map((line) => buildReportLine(line, mappingByRef.get(line.tax_mapping_ref)!));
  const taxReportRef = requireNonEmpty(input.tax_report_ref, 'tax_report_ref');

  const receiptWithoutDigest: Omit<TaxMappingReportingReceipt, 'tax_report_digest'> = {
    seed_id: PHASE_6B_TAX_MAPPING_REPORTING_SEED_ID,
    component_id: PHASE_6B_TAX_MAPPING_REPORTING_COMPONENT_ID,
    event_name: TAX_MAPPING_REPORTING_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    phase_6b_tax_mapping_model: 'Phase6BTaxMapping',
    source_seed_id: requireSourceSeed(input.source_seed_id),
    tax_report_ref: taxReportRef,
    accounting_period_ref: requireNonEmpty(input.accounting_period_ref, 'accounting_period_ref'),
    chart_version_ref: requireNonEmpty(input.chart_version_ref, 'chart_version_ref'),
    invoice_record_authority_ref: requireNonEmpty(input.invoice_record_authority_ref, 'invoice_record_authority_ref'),
    payment_allocation_balance_ref: requireNonEmpty(input.payment_allocation_balance_ref, 'payment_allocation_balance_ref'),
    expense_record_authority_ref: requireNonEmpty(input.expense_record_authority_ref, 'expense_record_authority_ref'),
    base_currency_code: baseCurrencyCode,
    regional_compliance_pack_ref: optionalNonEmpty(input.regional_compliance_pack_ref, 'regional_compliance_pack_ref'),
    tax_mappings: taxMappings,
    report_lines: reportLines,
    mapping_count: taxMappings.length,
    taxable_line_count: taxableLines.length,
    total_net_amount_minor: reportLines.reduce((total, line) => total + line.net_amount_minor, 0),
    total_tax_amount_minor: reportLines.reduce((total, line) => total + line.tax_amount_minor, 0),
    adl_refs: ['ADL-018'],
    tax_report_generated: true,
    external_tax_filing_submitted: false,
    journal_posting_performed: false,
    period_closed: false,
    payment_allocation_performed: false,
    provider_callback_processed: false,
    irreversible_action_allowed: false,
    tax_report_evidence_ref: `tax_report:${taxReportRef}:generated`,
    generated_by_user_id: requireNonEmpty(input.generated_by_user_id, 'generated_by_user_id'),
    generated_at: requireTimestamp(input.generated_at, 'generated_at'),
  };

  return {
    ...receiptWithoutDigest,
    tax_report_digest: digestTaxReport(receiptWithoutDigest),
  };
}
