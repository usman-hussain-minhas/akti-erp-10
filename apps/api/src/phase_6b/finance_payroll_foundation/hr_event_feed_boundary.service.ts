import { createHash } from 'node:crypto';

export const PHASE_6B_HR_EVENT_FEED_BOUNDARY_SEED_ID = 'seed_6b_14_hr_event_feed_boundary' as const;
export const PHASE_6B_FINANCE_PAYROLL_FOUNDATION_COMPONENT_ID = '6B.14' as const;
export const HR_EVENT_FEED_BOUNDARY_EVENT = 'phase_6b.finance_payroll.hr_event_feed_accepted' as const;

export type PayrollHrEventType = 'PAYEE_CREATED' | 'PAYEE_UPDATED' | 'COMPENSATION_CHANGED' | 'PAYEE_INACTIVE';
export type PayrollHrEventAction = 'UPSERT_PAYEE_RECORD' | 'REFRESH_COMPENSATION_INPUT' | 'EXCLUDE_FROM_FUTURE_RUNS';
export type PayrollHrEventInput = {
  hr_event_ref: string;
  event_type: PayrollHrEventType;
  person_identity_ref: string;
  payee_ref: string;
  effective_at: string;
  gross_pay_minor?: number;
  base_pay_minor?: number;
  currency_code?: string;
  source_evidence_ref: string;
};
export type NormalizedPayrollHrEvent = PayrollHrEventInput & { boundary_action: PayrollHrEventAction; payroll_boundary_evidence_ref: string };
export type PayrollHrEventFeedBoundaryInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_HR_EVENT_FEED_BOUNDARY_SEED_ID;
  feed_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  person_identity_scope_ref: string;
  events: PayrollHrEventInput[];
  accepted_by_user_id: string;
  accepted_at: string;
  hr_record_mutation_requested?: boolean;
  payroll_calculation_requested?: boolean;
  payout_creation_requested?: boolean;
  disbursement_file_requested?: boolean;
  journal_posting_requested?: boolean;
  payment_allocation_requested?: boolean;
  irreversible_action_requested?: boolean;
};
export type PayrollHrEventFeedBoundaryReceipt = {
  seed_id: typeof PHASE_6B_HR_EVENT_FEED_BOUNDARY_SEED_ID;
  component_id: typeof PHASE_6B_FINANCE_PAYROLL_FOUNDATION_COMPONENT_ID;
  event_name: typeof HR_EVENT_FEED_BOUNDARY_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  phase_6b_payee_model: 'Phase6BPayee';
  source_seed_id: typeof PHASE_6B_HR_EVENT_FEED_BOUNDARY_SEED_ID;
  feed_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  person_identity_scope_ref: string;
  event_count: number;
  normalized_events: NormalizedPayrollHrEvent[];
  hr_record_mutated: false;
  payroll_calculated: false;
  payout_created: false;
  disbursement_file_generated: false;
  journal_posted: false;
  payment_allocation_performed: false;
  irreversible_action_allowed: false;
  boundary_evidence_ref: string;
  boundary_digest: string;
  accepted_by_user_id: string;
  accepted_at: string;
};

const EVENT_TYPES: readonly PayrollHrEventType[] = ['PAYEE_CREATED', 'PAYEE_UPDATED', 'COMPENSATION_CHANGED', 'PAYEE_INACTIVE'] as const;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) throw new Error(`${field} is required for HR event feed boundary.`);
  return value.trim();
}
function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) throw new Error(`${field} must be a valid ISO-compatible timestamp for HR event feed boundary.`);
  return normalized;
}
function requireSourceSeed(value: string): typeof PHASE_6B_HR_EVENT_FEED_BOUNDARY_SEED_ID {
  const sourceSeedId = requireNonEmpty(value, 'source_seed_id');
  if (sourceSeedId !== PHASE_6B_HR_EVENT_FEED_BOUNDARY_SEED_ID) throw new Error('source_seed_id must match seed_6b_14_hr_event_feed_boundary.');
  return PHASE_6B_HR_EVENT_FEED_BOUNDARY_SEED_ID;
}
function requireEventType(value: PayrollHrEventType): PayrollHrEventType {
  if (!EVENT_TYPES.includes(value)) throw new Error('event_type is not supported for HR event feed boundary.');
  return value;
}
function optionalNonNegativeInteger(value: number | undefined, field: string): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isInteger(value) || value < 0) throw new Error(`${field} must be a non-negative integer for HR event feed boundary.`);
  return value;
}
function optionalCurrency(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const currency = requireNonEmpty(value, 'events.currency_code').toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) throw new Error('events.currency_code must be a three-letter ISO-style code for HR event feed boundary.');
  return currency;
}
function actionForEvent(eventType: PayrollHrEventType): PayrollHrEventAction {
  if (eventType === 'PAYEE_INACTIVE') return 'EXCLUDE_FROM_FUTURE_RUNS';
  if (eventType === 'COMPENSATION_CHANGED') return 'REFRESH_COMPENSATION_INPUT';
  return 'UPSERT_PAYEE_RECORD';
}
function normalizeEvent(event: PayrollHrEventInput, feedRef: string): NormalizedPayrollHrEvent {
  const eventType = requireEventType(event.event_type);
  const grossPay = optionalNonNegativeInteger(event.gross_pay_minor, 'events.gross_pay_minor');
  const basePay = optionalNonNegativeInteger(event.base_pay_minor, 'events.base_pay_minor');
  if (basePay !== undefined && grossPay !== undefined && basePay > grossPay) throw new Error('events.base_pay_minor must not exceed gross_pay_minor for HR event feed boundary.');
  if (eventType === 'COMPENSATION_CHANGED' && (grossPay === undefined || basePay === undefined || event.currency_code === undefined)) throw new Error('COMPENSATION_CHANGED events require gross_pay_minor, base_pay_minor, and currency_code for HR event feed boundary.');
  const hrEventRef = requireNonEmpty(event.hr_event_ref, 'events.hr_event_ref');
  return {
    hr_event_ref: hrEventRef,
    event_type: eventType,
    person_identity_ref: requireNonEmpty(event.person_identity_ref, 'events.person_identity_ref'),
    payee_ref: requireNonEmpty(event.payee_ref, 'events.payee_ref'),
    effective_at: requireTimestamp(event.effective_at, 'events.effective_at'),
    gross_pay_minor: grossPay,
    base_pay_minor: basePay,
    currency_code: optionalCurrency(event.currency_code),
    source_evidence_ref: requireNonEmpty(event.source_evidence_ref, 'events.source_evidence_ref'),
    boundary_action: actionForEvent(eventType),
    payroll_boundary_evidence_ref: `hr_event_feed_boundary:${feedRef}:${hrEventRef}:accepted`,
  };
}
function normalizeEvents(events: PayrollHrEventInput[], feedRef: string): NormalizedPayrollHrEvent[] {
  if (!Array.isArray(events) || events.length === 0) throw new Error('events must include at least one event for HR event feed boundary.');
  const normalized = events.map((event) => normalizeEvent(event, feedRef)).sort((left, right) => left.hr_event_ref.localeCompare(right.hr_event_ref));
  const refs = normalized.map((event) => event.hr_event_ref);
  if (new Set(refs).size !== refs.length) throw new Error('events must not repeat hr_event_ref for HR event feed boundary.');
  return normalized;
}
function digestBoundary(receiptWithoutDigest: Omit<PayrollHrEventFeedBoundaryReceipt, 'boundary_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}
export function acceptPayrollHrEventFeed(input: PayrollHrEventFeedBoundaryInput): PayrollHrEventFeedBoundaryReceipt {
  if (input.hr_record_mutation_requested === true) throw new Error('HR event feed boundary must not mutate HR records.');
  if (input.payroll_calculation_requested === true) throw new Error('HR event feed boundary must not calculate payroll.');
  if (input.payout_creation_requested === true) throw new Error('HR event feed boundary must not create payroll payouts.');
  if (input.disbursement_file_requested === true) throw new Error('HR event feed boundary must not generate disbursement files.');
  if (input.journal_posting_requested === true) throw new Error('HR event feed boundary must not post journals.');
  if (input.payment_allocation_requested === true) throw new Error('HR event feed boundary must not perform payment allocation math.');
  if (input.irreversible_action_requested === true) throw new Error('HR event feed boundary must not perform irreversible actions.');
  const feedRef = requireNonEmpty(input.feed_ref, 'feed_ref');
  const normalizedEvents = normalizeEvents(input.events, feedRef);
  const receiptWithoutDigest: Omit<PayrollHrEventFeedBoundaryReceipt, 'boundary_digest'> = {
    seed_id: PHASE_6B_HR_EVENT_FEED_BOUNDARY_SEED_ID,
    component_id: PHASE_6B_FINANCE_PAYROLL_FOUNDATION_COMPONENT_ID,
    event_name: HR_EVENT_FEED_BOUNDARY_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    phase_6b_payee_model: 'Phase6BPayee',
    source_seed_id: requireSourceSeed(input.source_seed_id),
    feed_ref: feedRef,
    payment_allocation_balance_ref: requireNonEmpty(input.payment_allocation_balance_ref, 'payment_allocation_balance_ref'),
    chart_version_ref: requireNonEmpty(input.chart_version_ref, 'chart_version_ref'),
    person_identity_scope_ref: requireNonEmpty(input.person_identity_scope_ref, 'person_identity_scope_ref'),
    event_count: normalizedEvents.length,
    normalized_events: normalizedEvents,
    hr_record_mutated: false,
    payroll_calculated: false,
    payout_created: false,
    disbursement_file_generated: false,
    journal_posted: false,
    payment_allocation_performed: false,
    irreversible_action_allowed: false,
    boundary_evidence_ref: `hr_event_feed_boundary:${feedRef}:accepted`,
    accepted_by_user_id: requireNonEmpty(input.accepted_by_user_id, 'accepted_by_user_id'),
    accepted_at: requireTimestamp(input.accepted_at, 'accepted_at'),
  };
  return { ...receiptWithoutDigest, boundary_digest: digestBoundary(receiptWithoutDigest) };
}
