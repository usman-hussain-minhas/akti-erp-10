import { createHash } from 'node:crypto';

export const PHASE_6B_BANKING_EVIDENCE_EXPORT_SEED_ID = 'seed_6b_13_banking_evidence_export' as const;
export const PHASE_6B_BANKING_RECONCILIATION_COMPONENT_ID = '6B.13' as const;

export const BANKING_EVIDENCE_EXPORT_EVENT = 'phase_6b.banking_reconciliation.evidence_export.generated' as const;

export type BankingEvidenceArtifactType = 'BANK_ACCOUNT' | 'BANK_TRANSACTION' | 'MATCH_CANDIDATE' | 'RECONCILIATION_STATEMENT' | 'EXCEPTION_QUEUE_ITEM';

export type BankingEvidenceArtifactInput = {
  artifact_ref: string;
  artifact_type: BankingEvidenceArtifactType;
  source_model: 'Phase6BBankAccount' | 'Phase6BBankTransaction' | 'Phase6BReconciliationCandidate' | 'Phase6BReconciliationStatement';
  source_record_ref: string;
  evidence_ref: string;
  captured_at: string;
  amount_minor?: number;
  currency_code?: string;
};

export type BankingEvidenceExportInput = {
  organization_id: string;
  source_seed_id: typeof PHASE_6B_BANKING_EVIDENCE_EXPORT_SEED_ID;
  export_ref: string;
  bank_account_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  reconciliation_statement_ref?: string;
  artifacts: BankingEvidenceArtifactInput[];
  requested_by_user_id: string;
  requested_at: string;
  external_delivery_requested?: boolean;
  payment_allocation_requested?: boolean;
  journal_posting_requested?: boolean;
  statement_closure_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type BankingEvidenceExportReceipt = {
  seed_id: typeof PHASE_6B_BANKING_EVIDENCE_EXPORT_SEED_ID;
  component_id: typeof PHASE_6B_BANKING_RECONCILIATION_COMPONENT_ID;
  event_name: typeof BANKING_EVIDENCE_EXPORT_EVENT;
  organization_id: string;
  source_seed_id: typeof PHASE_6B_BANKING_EVIDENCE_EXPORT_SEED_ID;
  export_ref: string;
  bank_account_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  reconciliation_statement_ref?: string;
  artifact_count: number;
  artifact_type_counts: Record<BankingEvidenceArtifactType, number>;
  artifacts: BankingEvidenceArtifactInput[];
  export_evidence_ref: string;
  export_digest: string;
  external_delivery_performed: false;
  payment_allocation_performed: false;
  journal_posting_performed: false;
  statement_closed: false;
  provider_callback_processed: false;
  irreversible_action_allowed: false;
  requested_by_user_id: string;
  requested_at: string;
};

const ARTIFACT_TYPES: readonly BankingEvidenceArtifactType[] = ['BANK_ACCOUNT', 'BANK_TRANSACTION', 'MATCH_CANDIDATE', 'RECONCILIATION_STATEMENT', 'EXCEPTION_QUEUE_ITEM'] as const;
const SOURCE_MODELS: readonly BankingEvidenceArtifactInput['source_model'][] = ['Phase6BBankAccount', 'Phase6BBankTransaction', 'Phase6BReconciliationCandidate', 'Phase6BReconciliationStatement'] as const;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for banking evidence export.`);
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
    throw new Error(`${field} must be a valid ISO-compatible timestamp for banking evidence export.`);
  }
  return normalized;
}

function requireSourceSeed(value: string): typeof PHASE_6B_BANKING_EVIDENCE_EXPORT_SEED_ID {
  const sourceSeedId = requireNonEmpty(value, 'source_seed_id');
  if (sourceSeedId !== PHASE_6B_BANKING_EVIDENCE_EXPORT_SEED_ID) {
    throw new Error('source_seed_id must match seed_6b_13_banking_evidence_export.');
  }
  return PHASE_6B_BANKING_EVIDENCE_EXPORT_SEED_ID;
}

function requireArtifactType(value: BankingEvidenceArtifactType): BankingEvidenceArtifactType {
  if (!ARTIFACT_TYPES.includes(value)) {
    throw new Error('artifacts.artifact_type is not supported for banking evidence export.');
  }
  return value;
}

function requireSourceModel(value: BankingEvidenceArtifactInput['source_model']): BankingEvidenceArtifactInput['source_model'] {
  if (!SOURCE_MODELS.includes(value)) {
    throw new Error('artifacts.source_model is not supported for banking evidence export.');
  }
  return value;
}

function optionalNonNegativeInteger(value: number | undefined, field: string): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer for banking evidence export.`);
  }
  return value;
}

function optionalCurrency(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const currency = requireNonEmpty(value, 'artifacts.currency_code').toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error('artifacts.currency_code must be a three-letter ISO-style code for banking evidence export.');
  }
  return currency;
}

function normalizeArtifact(artifact: BankingEvidenceArtifactInput): BankingEvidenceArtifactInput {
  return {
    artifact_ref: requireNonEmpty(artifact.artifact_ref, 'artifacts.artifact_ref'),
    artifact_type: requireArtifactType(artifact.artifact_type),
    source_model: requireSourceModel(artifact.source_model),
    source_record_ref: requireNonEmpty(artifact.source_record_ref, 'artifacts.source_record_ref'),
    evidence_ref: requireNonEmpty(artifact.evidence_ref, 'artifacts.evidence_ref'),
    captured_at: requireTimestamp(artifact.captured_at, 'artifacts.captured_at'),
    amount_minor: optionalNonNegativeInteger(artifact.amount_minor, 'artifacts.amount_minor'),
    currency_code: optionalCurrency(artifact.currency_code),
  };
}

function normalizeArtifacts(artifacts: BankingEvidenceArtifactInput[]): BankingEvidenceArtifactInput[] {
  if (!Array.isArray(artifacts) || artifacts.length === 0) {
    throw new Error('artifacts must include at least one evidence artifact for banking evidence export.');
  }
  const normalized = artifacts.map(normalizeArtifact);
  const artifactRefs = normalized.map((artifact) => artifact.artifact_ref);
  if (new Set(artifactRefs).size !== artifactRefs.length) {
    throw new Error('artifacts must not repeat artifact_ref for banking evidence export.');
  }
  return normalized.sort((left, right) => left.artifact_ref.localeCompare(right.artifact_ref));
}

function artifactTypeCounts(artifacts: BankingEvidenceArtifactInput[]): Record<BankingEvidenceArtifactType, number> {
  const counts = Object.fromEntries(ARTIFACT_TYPES.map((type) => [type, 0])) as Record<BankingEvidenceArtifactType, number>;
  for (const artifact of artifacts) counts[artifact.artifact_type] += 1;
  return counts;
}

function digestEvidenceExport(receiptWithoutDigest: Omit<BankingEvidenceExportReceipt, 'export_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function exportBankingEvidence(input: BankingEvidenceExportInput): BankingEvidenceExportReceipt {
  if (input.external_delivery_requested === true) {
    throw new Error('banking evidence export must not perform external delivery.');
  }
  if (input.payment_allocation_requested === true) {
    throw new Error('banking evidence export must not perform payment allocation math.');
  }
  if (input.journal_posting_requested === true) {
    throw new Error('banking evidence export must not post journals.');
  }
  if (input.statement_closure_requested === true) {
    throw new Error('banking evidence export must not close reconciliation statements.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('banking evidence export must not process provider callbacks.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('banking evidence export must not perform irreversible actions.');
  }

  const exportRef = requireNonEmpty(input.export_ref, 'export_ref');
  const artifacts = normalizeArtifacts(input.artifacts);

  const receiptWithoutDigest: Omit<BankingEvidenceExportReceipt, 'export_digest'> = {
    seed_id: PHASE_6B_BANKING_EVIDENCE_EXPORT_SEED_ID,
    component_id: PHASE_6B_BANKING_RECONCILIATION_COMPONENT_ID,
    event_name: BANKING_EVIDENCE_EXPORT_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    source_seed_id: requireSourceSeed(input.source_seed_id),
    export_ref: exportRef,
    bank_account_ref: requireNonEmpty(input.bank_account_ref, 'bank_account_ref'),
    payment_allocation_balance_ref: requireNonEmpty(input.payment_allocation_balance_ref, 'payment_allocation_balance_ref'),
    chart_version_ref: requireNonEmpty(input.chart_version_ref, 'chart_version_ref'),
    reconciliation_statement_ref: optionalNonEmpty(input.reconciliation_statement_ref, 'reconciliation_statement_ref'),
    artifact_count: artifacts.length,
    artifact_type_counts: artifactTypeCounts(artifacts),
    artifacts,
    export_evidence_ref: `banking_evidence_export:${exportRef}:generated`,
    external_delivery_performed: false,
    payment_allocation_performed: false,
    journal_posting_performed: false,
    statement_closed: false,
    provider_callback_processed: false,
    irreversible_action_allowed: false,
    requested_by_user_id: requireNonEmpty(input.requested_by_user_id, 'requested_by_user_id'),
    requested_at: requireTimestamp(input.requested_at, 'requested_at'),
  };

  return {
    ...receiptWithoutDigest,
    export_digest: digestEvidenceExport(receiptWithoutDigest),
  };
}
