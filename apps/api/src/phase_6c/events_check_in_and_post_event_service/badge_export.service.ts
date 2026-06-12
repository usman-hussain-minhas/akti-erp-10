import { createHash } from 'node:crypto';

export const PHASE_6C_BADGE_EXPORT_SEED_ID = 'seed_6c_119_badge_export' as const;
export const PHASE_6C_BADGE_EXPORT_COMPONENT_ID = '6C.09' as const;
export const BADGE_EXPORT_RUNTIME_EVENT = 'phase_6c.events_check_in_and_post_event_service.badge_export.runtime_evaluated' as const;

export type BadgeExportFormat = 'pdf' | 'csv' | 'json';
export type BadgeExportDecision = 'BADGE_EXPORT_READY' | 'BADGE_EXPORT_REQUIRES_REVIEW' | 'BADGE_EXPORT_REJECTED_EMPTY' | 'BADGE_EXPORT_REJECTED_INVALID_LAYOUT';

export type BadgeExportRow = {
  attendee_ref: string;
  registration_ref: string;
  ticket_ref: string;
  display_name: string;
  organization_label?: string;
  role_label?: string;
  qr_ticket_token_ref?: string;
  badge_number?: string;
};

export type BadgeExportInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  source_record_ref: string;
  requested_by_user_id: string;
  requested_at: string;
  export_format: BadgeExportFormat;
  badge_layout_ref: string;
  rows: readonly BadgeExportRow[];
  include_qr_token_ref?: boolean;
  control_metadata?: Record<string, unknown>;
  file_generation_requested?: boolean;
  file_storage_requested?: boolean;
  qr_token_creation_requested?: boolean;
  ticket_mutation_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type BadgeExportRuntimeReceipt = {
  seed_id: typeof PHASE_6C_BADGE_EXPORT_SEED_ID;
  component_id: typeof PHASE_6C_BADGE_EXPORT_COMPONENT_ID;
  component_slug: 'events_check_in_and_post_event_service';
  model_name: 'Phase6CBadgeExport';
  event_name: typeof BADGE_EXPORT_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  source_record_ref: string;
  requested_by_user_id: string;
  requested_at: string;
  export_format: BadgeExportFormat;
  badge_layout_ref: string;
  decision: BadgeExportDecision;
  printable_attendee_refs: readonly string[];
  review_attendee_refs: readonly string[];
  row_count: number;
  printable_count: number;
  review_count: number;
  include_qr_token_ref: boolean;
  rejection_reasons: readonly string[];
  decision_refs: readonly string[];
  dependency_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for badge_export runtime evaluation.');
  }
  return value.trim();
}

function normalizeOptional(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(field + ' must be non-empty when provided for badge_export runtime evaluation.');
  }
  return normalized;
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for badge_export runtime evaluation.');
  }
  return normalized;
}

function rejectForbiddenRequests(input: BadgeExportInput): void {
  const forbidden: Array<[keyof BadgeExportInput, string]> = [
    ['file_generation_requested', 'badge_export must not generate files.'],
    ['file_storage_requested', 'badge_export must not store files.'],
    ['qr_token_creation_requested', 'badge_export must not create QR tokens.'],
    ['ticket_mutation_requested', 'badge_export must not mutate tickets.'],
    ['schema_mutation_requested', 'badge_export must not mutate schema.'],
    ['frontend_requested', 'badge_export must not create frontend surfaces.'],
  ];

  for (const [field, message] of forbidden) {
    if (input[field] === true) {
      throw new Error(message);
    }
  }
}

function digestReceipt(receiptWithoutDigest: Omit<BadgeExportRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function evaluateRow(row: BadgeExportRow, index: number, includeQr: boolean): { attendeeRef: string; reviewReasons: string[] } {
  const attendeeRef = requireNonEmpty(row.attendee_ref, 'rows[' + index + '].attendee_ref');
  requireNonEmpty(row.registration_ref, 'rows[' + index + '].registration_ref');
  requireNonEmpty(row.ticket_ref, 'rows[' + index + '].ticket_ref');
  const displayName = requireNonEmpty(row.display_name, 'rows[' + index + '].display_name');
  normalizeOptional(row.organization_label, 'rows[' + index + '].organization_label');
  normalizeOptional(row.role_label, 'rows[' + index + '].role_label');
  normalizeOptional(row.badge_number, 'rows[' + index + '].badge_number');
  const qrRef = normalizeOptional(row.qr_ticket_token_ref, 'rows[' + index + '].qr_ticket_token_ref');
  const reviewReasons: string[] = [];
  if (displayName.length < 2) {
    reviewReasons.push('display_name_too_short:' + attendeeRef);
  }
  if (includeQr && qrRef === null) {
    reviewReasons.push('qr_ticket_token_ref_required:' + attendeeRef);
  }
  return { attendeeRef, reviewReasons };
}

export function evaluateBadgeExport(input: BadgeExportInput): BadgeExportRuntimeReceipt {
  rejectForbiddenRequests(input);

  const badgeLayoutRef = requireNonEmpty(input.badge_layout_ref, 'badge_layout_ref');
  if (!/^[a-z0-9][a-z0-9_-]{2,79}$/i.test(badgeLayoutRef)) {
    throw new Error('badge_layout_ref must be a stable layout reference for badge_export runtime evaluation.');
  }

  const includeQr = input.include_qr_token_ref === true;
  const printable: string[] = [];
  const review: string[] = [];
  const reasons: string[] = [];
  for (let index = 0; index < input.rows.length; index += 1) {
    const rowResult = evaluateRow(input.rows[index], index, includeQr);
    if (rowResult.reviewReasons.length > 0) {
      review.push(rowResult.attendeeRef);
      reasons.push(...rowResult.reviewReasons);
    } else {
      printable.push(rowResult.attendeeRef);
    }
  }

  const decision: BadgeExportDecision =
    input.rows.length === 0
      ? 'BADGE_EXPORT_REJECTED_EMPTY'
      : !/^[a-z0-9][a-z0-9_-]{2,79}$/i.test(badgeLayoutRef)
        ? 'BADGE_EXPORT_REJECTED_INVALID_LAYOUT'
        : review.length > 0
          ? 'BADGE_EXPORT_REQUIRES_REVIEW'
          : 'BADGE_EXPORT_READY';

  const receiptWithoutDigest: Omit<BadgeExportRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_BADGE_EXPORT_SEED_ID,
    component_id: PHASE_6C_BADGE_EXPORT_COMPONENT_ID,
    component_slug: 'events_check_in_and_post_event_service',
    model_name: 'Phase6CBadgeExport',
    event_name: BADGE_EXPORT_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    event_ref: requireNonEmpty(input.event_ref, 'event_ref'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    requested_by_user_id: requireNonEmpty(input.requested_by_user_id, 'requested_by_user_id'),
    requested_at: requireTimestamp(input.requested_at, 'requested_at'),
    export_format: input.export_format,
    badge_layout_ref: badgeLayoutRef,
    decision,
    printable_attendee_refs: printable,
    review_attendee_refs: review,
    row_count: input.rows.length,
    printable_count: printable.length,
    review_count: review.length,
    include_qr_token_ref: includeQr,
    rejection_reasons: decision === 'BADGE_EXPORT_REJECTED_EMPTY' ? ['badge_export_rows_required'] : reasons,
    decision_refs: ['6C-EVENT-CHECK-009', '6C-EVENT-CHECK-014', '6C-EVENT-REG-012'],
    dependency_refs: ['seed_6a_service_manifest_contract', '6C.08'],
    control_metadata: input.control_metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
