import { createHash } from 'node:crypto';

export const PHASE_6C_RECURRING_EVENT_RULE_SEED_ID = 'seed_6c_091_recurring_event_rule' as const;
export const PHASE_6C_RECURRING_EVENT_RULE_COMPONENT_ID = '6C.07' as const;
export const RECURRING_EVENT_RULE_RUNTIME_EVENT = 'phase_6c.workspace_calendar_meetings_rooms_announcements.recurring_event_rule.runtime_evaluated' as const;

export const RECURRING_EVENT_RULE_DECISION_REFS = ['6C-CAL-009'] as const;

export type RecurringEventFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type RecurringEventDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export type RecurringEventRuleDecision = 'VALID_RULE_WITH_PREVIEW' | 'VALID_RULE_WITH_EMPTY_PREVIEW';

export type RecurringEventRuleInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  rule_id: string;
  source_record_ref: string;
  requested_by_user_id: string;
  evaluated_at: string;
  frequency: RecurringEventFrequency;
  interval: number;
  start_date: string;
  end_date?: string;
  occurrence_count?: number;
  days_of_week?: RecurringEventDay[];
  preview_limit: number;
  calendar_write_requested?: boolean;
  provider_sync_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type NormalizedRecurringEventRule = {
  frequency: RecurringEventFrequency;
  interval: number;
  start_date: string;
  end_date: string | null;
  occurrence_count: number | null;
  days_of_week: RecurringEventDay[];
};

export type RecurringEventPreviewOccurrence = {
  occurrence_index: number;
  local_date: string;
  source_rule_id: string;
};

export type RecurringEventRuleReceipt = {
  seed_id: typeof PHASE_6C_RECURRING_EVENT_RULE_SEED_ID;
  component_id: typeof PHASE_6C_RECURRING_EVENT_RULE_COMPONENT_ID;
  component_slug: 'workspace_calendar_meetings_rooms_announcements';
  model_name: 'Phase6CRecurringEventRule';
  event_name: typeof RECURRING_EVENT_RULE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  rule_id: string;
  source_record_ref: string;
  decision: RecurringEventRuleDecision;
  normalized_rule: NormalizedRecurringEventRule;
  preview_occurrences: RecurringEventPreviewOccurrence[];
  calendar_write_executed: false;
  provider_sync_executed: false;
  runtime_adapter_executed: false;
  persistence_executed: false;
  required_evidence_artifacts: readonly string[];
  decision_refs: typeof RECURRING_EVENT_RULE_DECISION_REFS;
  requested_by_user_id: string;
  evaluated_at: string;
  runtime_evidence_digest: string;
};

const DAYS: RecurringEventDay[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_SET = new Set<RecurringEventDay>(DAYS);
const FREQUENCIES = new Set<RecurringEventFrequency>(['DAILY', 'WEEKLY', 'MONTHLY']);
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for recurring event rule evaluation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for recurring event rule evaluation.');
  }
  return normalized;
}

function requirePositiveInteger(value: number | undefined, field: string, max: number): number {
  if (!Number.isInteger(value) || value === undefined || value < 1 || value > max) {
    throw new Error(field + ' must be an integer between 1 and ' + max + '.');
  }
  return value;
}

function parseDate(value: string | undefined, field: string): Date {
  const normalized = requireNonEmpty(value, field);
  const match = DATE_RE.exec(normalized);
  if (!match) {
    throw new Error(field + ' must use YYYY-MM-DD local date format.');
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error(field + ' must be a valid calendar date.');
  }
  return date;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function addMonthsFromAnchor(startDate: Date, months: number): Date {
  const desiredYear = startDate.getUTCFullYear();
  const desiredMonth = startDate.getUTCMonth() + months;
  const anchorDay = startDate.getUTCDate();
  const target = new Date(Date.UTC(desiredYear, desiredMonth, 1));
  const maxDay = daysInMonth(target.getUTCFullYear(), target.getUTCMonth());
  target.setUTCDate(Math.min(anchorDay, maxDay));
  return target;
}

function dayName(date: Date): RecurringEventDay {
  const sundayBased = date.getUTCDay();
  return DAYS[(sundayBased + 6) % 7];
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return '[' + value.map((item) => stableStringify(item)).join(',') + ']';
  }
  if (value && typeof value === 'object') {
    return '{' + Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => JSON.stringify(key) + ':' + stableStringify(nested))
      .join(',') + '}';
  }
  return JSON.stringify(value);
}

function digest(value: unknown): string {
  return createHash('sha256').update(stableStringify(value)).digest('hex');
}

function normalizeDays(days: RecurringEventDay[] | undefined, startDate: Date, frequency: RecurringEventFrequency): RecurringEventDay[] {
  if (frequency !== 'WEEKLY') {
    return [];
  }
  const inputDays = days === undefined || days.length === 0 ? [dayName(startDate)] : days;
  const seen = new Set<RecurringEventDay>();
  const normalized: RecurringEventDay[] = [];
  for (const day of inputDays) {
    if (!DAY_SET.has(day)) {
      throw new Error('days_of_week contains unsupported day ' + String(day) + '.');
    }
    if (!seen.has(day)) {
      seen.add(day);
      normalized.push(day);
    }
  }
  return normalized.sort((left, right) => DAYS.indexOf(left) - DAYS.indexOf(right));
}

function withinEnd(date: Date, endDate: Date | null): boolean {
  return endDate === null || date.getTime() <= endDate.getTime();
}

function weeksBetween(start: Date, candidate: Date): number {
  const millisPerWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.floor((candidate.getTime() - start.getTime()) / millisPerWeek);
}

function generatePreview(ruleId: string, rule: NormalizedRecurringEventRule, previewLimit: number): RecurringEventPreviewOccurrence[] {
  const startDate = parseDate(rule.start_date, 'normalized_rule.start_date');
  const endDate = rule.end_date === null ? null : parseDate(rule.end_date, 'normalized_rule.end_date');
  const maxOccurrences = rule.occurrence_count === null ? previewLimit : Math.min(rule.occurrence_count, previewLimit);
  const occurrences: RecurringEventPreviewOccurrence[] = [];

  if (rule.frequency === 'DAILY') {
    let cursor = startDate;
    while (occurrences.length < maxOccurrences && withinEnd(cursor, endDate)) {
      occurrences.push({ occurrence_index: occurrences.length + 1, local_date: formatDate(cursor), source_rule_id: ruleId });
      cursor = addDays(cursor, rule.interval);
    }
    return occurrences;
  }

  if (rule.frequency === 'MONTHLY') {
    let step = 0;
    while (occurrences.length < maxOccurrences) {
      const candidate = addMonthsFromAnchor(startDate, step * rule.interval);
      if (!withinEnd(candidate, endDate)) {
        break;
      }
      occurrences.push({ occurrence_index: occurrences.length + 1, local_date: formatDate(candidate), source_rule_id: ruleId });
      step += 1;
    }
    return occurrences;
  }

  let cursor = startDate;
  let scannedDays = 0;
  const maxScannedDays = 3710;
  while (occurrences.length < maxOccurrences && scannedDays < maxScannedDays && withinEnd(cursor, endDate)) {
    const weekIndex = weeksBetween(startDate, cursor);
    if (weekIndex % rule.interval === 0 && rule.days_of_week.includes(dayName(cursor))) {
      occurrences.push({ occurrence_index: occurrences.length + 1, local_date: formatDate(cursor), source_rule_id: ruleId });
    }
    cursor = addDays(cursor, 1);
    scannedDays += 1;
  }
  return occurrences;
}

export function evaluateRecurringEventRule(input: RecurringEventRuleInput): RecurringEventRuleReceipt {
  if (input.calendar_write_requested === true) {
    throw new Error('recurring_event_rule must not write calendar events inside this FFET.');
  }
  if (input.provider_sync_requested === true) {
    throw new Error('recurring_event_rule must not execute provider sync inside this FFET.');
  }
  if (input.persistence_requested === true) {
    throw new Error('recurring_event_rule must not persist recurrence state inside this FFET.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('recurring_event_rule must not execute runtime adapters inside this FFET.');
  }

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const ruleId = requireNonEmpty(input.rule_id, 'rule_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const requestedByUserId = requireNonEmpty(input.requested_by_user_id, 'requested_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  if (!FREQUENCIES.has(input.frequency)) {
    throw new Error('frequency contains unsupported value ' + String(input.frequency) + '.');
  }

  const interval = requirePositiveInteger(input.interval, 'interval', 24);
  const previewLimit = requirePositiveInteger(input.preview_limit, 'preview_limit', 52);
  const startDate = parseDate(input.start_date, 'start_date');
  const endDate = input.end_date === undefined ? null : parseDate(input.end_date, 'end_date');
  if (endDate !== null && endDate.getTime() < startDate.getTime()) {
    throw new Error('end_date must be on or after start_date.');
  }
  const occurrenceCount = input.occurrence_count === undefined ? null : requirePositiveInteger(input.occurrence_count, 'occurrence_count', 366);

  const normalizedRule: NormalizedRecurringEventRule = {
    frequency: input.frequency,
    interval,
    start_date: formatDate(startDate),
    end_date: endDate === null ? null : formatDate(endDate),
    occurrence_count: occurrenceCount,
    days_of_week: normalizeDays(input.days_of_week, startDate, input.frequency),
  };

  const previewOccurrences = generatePreview(ruleId, normalizedRule, previewLimit);
  const receiptWithoutDigest: Omit<RecurringEventRuleReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_RECURRING_EVENT_RULE_SEED_ID,
    component_id: PHASE_6C_RECURRING_EVENT_RULE_COMPONENT_ID,
    component_slug: 'workspace_calendar_meetings_rooms_announcements',
    model_name: 'Phase6CRecurringEventRule',
    event_name: RECURRING_EVENT_RULE_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    rule_id: ruleId,
    source_record_ref: sourceRecordRef,
    decision: previewOccurrences.length > 0 ? 'VALID_RULE_WITH_PREVIEW' : 'VALID_RULE_WITH_EMPTY_PREVIEW',
    normalized_rule: normalizedRule,
    preview_occurrences: previewOccurrences,
    calendar_write_executed: false,
    provider_sync_executed: false,
    runtime_adapter_executed: false,
    persistence_executed: false,
    required_evidence_artifacts: [
      'recurring_event_rule_runtime_receipt',
      'bounded_occurrence_preview',
      'calendar_write_not_executed',
    ],
    decision_refs: RECURRING_EVENT_RULE_DECISION_REFS,
    requested_by_user_id: requestedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digest(receiptWithoutDigest),
  };
}
