import { createHash } from 'node:crypto';

export const PHASE_6C_REMINDER_QUIET_HOURS_SEED_ID = 'seed_6c_090_reminder_quiet_hours' as const;
export const PHASE_6C_REMINDER_QUIET_HOURS_COMPONENT_ID = '6C.07' as const;
export const REMINDER_QUIET_HOURS_RUNTIME_EVENT = 'phase_6c.workspace_calendar_meetings_rooms_announcements.reminder_quiet_hours.runtime_evaluated' as const;

export const REMINDER_QUIET_HOURS_DECISION_REFS = ['6C-CAL-008', '6C-GLOBAL-013', '6C-ADL-008'] as const;
export const REMINDER_QUIET_HOURS_ADL_REFS = ['ADL-004'] as const;

export type ReminderQuietHoursDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export type ReminderQuietHoursDecision = 'SEND_ALLOWED_NOW' | 'DEFER_UNTIL_QUIET_HOURS_END';

export type ReminderQuietHoursWindow = {
  window_id: string;
  start_local_time: string;
  end_local_time: string;
  active_days?: ReminderQuietHoursDay[];
};

export type ReminderQuietHoursInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  reminder_id: string;
  source_record_ref: string;
  requested_by_user_id: string;
  evaluated_at: string;
  recipient_user_id: string;
  recipient_timezone: string;
  scheduled_local_day: ReminderQuietHoursDay;
  scheduled_local_time: string;
  quiet_hours_enabled: boolean;
  quiet_hour_windows: ReminderQuietHoursWindow[];
  gateway_policy_ref: string;
  idempotency_key: string;
  direct_provider_send_requested?: boolean;
  gateway_bypass_requested?: boolean;
  quiet_hours_override_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type ReminderQuietHoursMatchedWindow = {
  window_id: string;
  start_local_time: string;
  end_local_time: string;
  overnight: boolean;
};

export type ReminderQuietHoursReceipt = {
  seed_id: typeof PHASE_6C_REMINDER_QUIET_HOURS_SEED_ID;
  component_id: typeof PHASE_6C_REMINDER_QUIET_HOURS_COMPONENT_ID;
  component_slug: 'workspace_calendar_meetings_rooms_announcements';
  model_name: 'Phase6CReminderQuietHours';
  event_name: typeof REMINDER_QUIET_HOURS_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  reminder_id: string;
  source_record_ref: string;
  recipient_user_id: string;
  recipient_timezone: string;
  decision: ReminderQuietHoursDecision;
  gateway_route_required: true;
  opt_out_gateway_enforcement_required: true;
  direct_provider_send_allowed: false;
  runtime_adapter_executed: false;
  persistence_executed: false;
  quiet_hours_enabled: boolean;
  scheduled_local_day: ReminderQuietHoursDay;
  scheduled_local_time: string;
  matched_window: ReminderQuietHoursMatchedWindow | null;
  defer_until_local_day: ReminderQuietHoursDay | null;
  defer_until_local_time: string | null;
  required_evidence_artifacts: readonly string[];
  decision_refs: typeof REMINDER_QUIET_HOURS_DECISION_REFS;
  adl_refs: typeof REMINDER_QUIET_HOURS_ADL_REFS;
  gateway_policy_ref: string;
  idempotency_key: string;
  requested_by_user_id: string;
  evaluated_at: string;
  runtime_evidence_digest: string;
};

const DAYS: ReminderQuietHoursDay[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_SET = new Set<ReminderQuietHoursDay>(DAYS);
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for reminder quiet-hours evaluation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for reminder quiet-hours evaluation.');
  }
  return normalized;
}

function parseLocalTime(value: string, field: string): number {
  const normalized = requireNonEmpty(value, field);
  const match = TIME_RE.exec(normalized);
  if (!match) {
    throw new Error(field + ' must use HH:mm 24-hour local time.');
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

function requireDay(value: ReminderQuietHoursDay, field: string): ReminderQuietHoursDay {
  if (!DAY_SET.has(value)) {
    throw new Error(field + ' contains unsupported day ' + String(value) + '.');
  }
  return value;
}

function nextDay(day: ReminderQuietHoursDay): ReminderQuietHoursDay {
  return DAYS[(DAYS.indexOf(day) + 1) % DAYS.length];
}

function normalizeWindow(window: ReminderQuietHoursWindow): ReminderQuietHoursWindow & { startMinutes: number; endMinutes: number; overnight: boolean; days: ReminderQuietHoursDay[] } {
  const windowId = requireNonEmpty(window.window_id, 'quiet_hour_windows.window_id');
  const startMinutes = parseLocalTime(window.start_local_time, 'quiet_hour_windows.start_local_time');
  const endMinutes = parseLocalTime(window.end_local_time, 'quiet_hour_windows.end_local_time');
  if (startMinutes === endMinutes) {
    throw new Error('quiet_hour_windows window ' + windowId + ' must not start and end at the same local time.');
  }
  const days = window.active_days === undefined || window.active_days.length === 0
    ? DAYS
    : window.active_days.map((day) => requireDay(day, 'quiet_hour_windows.active_days'));
  return {
    ...window,
    window_id: windowId,
    start_local_time: window.start_local_time,
    end_local_time: window.end_local_time,
    startMinutes,
    endMinutes,
    overnight: startMinutes > endMinutes,
    days,
  };
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

function appliesToScheduledTime(window: ReturnType<typeof normalizeWindow>, scheduledDay: ReminderQuietHoursDay, scheduledMinutes: number): boolean {
  if (!window.overnight) {
    return window.days.includes(scheduledDay) && scheduledMinutes >= window.startMinutes && scheduledMinutes < window.endMinutes;
  }

  const previousDay = DAYS[(DAYS.indexOf(scheduledDay) + DAYS.length - 1) % DAYS.length];
  const sameDayStart = window.days.includes(scheduledDay) && scheduledMinutes >= window.startMinutes;
  const previousDayCarryover = window.days.includes(previousDay) && scheduledMinutes < window.endMinutes;
  return sameDayStart || previousDayCarryover;
}

function deferDayForWindow(window: ReturnType<typeof normalizeWindow>, scheduledDay: ReminderQuietHoursDay, scheduledMinutes: number): ReminderQuietHoursDay {
  if (!window.overnight) {
    return scheduledDay;
  }
  return scheduledMinutes >= window.startMinutes ? nextDay(scheduledDay) : scheduledDay;
}

export function evaluateReminderQuietHours(input: ReminderQuietHoursInput): ReminderQuietHoursReceipt {
  if (input.direct_provider_send_requested === true) {
    throw new Error('reminder_quiet_hours must not create direct provider sends.');
  }
  if (input.gateway_bypass_requested === true) {
    throw new Error('reminder_quiet_hours must not bypass Communication Gateway routing.');
  }
  if (input.quiet_hours_override_requested === true) {
    throw new Error('reminder_quiet_hours must not execute quiet-hours override behavior inside this FFET.');
  }
  if (input.persistence_requested === true) {
    throw new Error('reminder_quiet_hours must not persist reminder schedule state inside this FFET.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('reminder_quiet_hours must not execute runtime adapters inside this FFET.');
  }

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const reminderId = requireNonEmpty(input.reminder_id, 'reminder_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const requestedByUserId = requireNonEmpty(input.requested_by_user_id, 'requested_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const recipientUserId = requireNonEmpty(input.recipient_user_id, 'recipient_user_id');
  const recipientTimezone = requireNonEmpty(input.recipient_timezone, 'recipient_timezone');
  const gatewayPolicyRef = requireNonEmpty(input.gateway_policy_ref, 'gateway_policy_ref');
  const idempotencyKey = requireNonEmpty(input.idempotency_key, 'idempotency_key');
  const scheduledDay = requireDay(input.scheduled_local_day, 'scheduled_local_day');
  const scheduledMinutes = parseLocalTime(input.scheduled_local_time, 'scheduled_local_time');

  const normalizedWindows = (Array.isArray(input.quiet_hour_windows) ? input.quiet_hour_windows : []).map(normalizeWindow);
  const seenWindows = new Set<string>();
  for (const window of normalizedWindows) {
    if (seenWindows.has(window.window_id)) {
      throw new Error('quiet_hour_windows must not contain duplicate window_id ' + window.window_id + '.');
    }
    seenWindows.add(window.window_id);
  }

  const matchedWindow = input.quiet_hours_enabled
    ? normalizedWindows.find((window) => appliesToScheduledTime(window, scheduledDay, scheduledMinutes))
    : undefined;

  const decision: ReminderQuietHoursDecision = matchedWindow ? 'DEFER_UNTIL_QUIET_HOURS_END' : 'SEND_ALLOWED_NOW';
  const receiptMatchedWindow: ReminderQuietHoursMatchedWindow | null = matchedWindow
    ? {
      window_id: matchedWindow.window_id,
      start_local_time: matchedWindow.start_local_time,
      end_local_time: matchedWindow.end_local_time,
      overnight: matchedWindow.overnight,
    }
    : null;

  const receiptWithoutDigest: Omit<ReminderQuietHoursReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_REMINDER_QUIET_HOURS_SEED_ID,
    component_id: PHASE_6C_REMINDER_QUIET_HOURS_COMPONENT_ID,
    component_slug: 'workspace_calendar_meetings_rooms_announcements',
    model_name: 'Phase6CReminderQuietHours',
    event_name: REMINDER_QUIET_HOURS_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    reminder_id: reminderId,
    source_record_ref: sourceRecordRef,
    recipient_user_id: recipientUserId,
    recipient_timezone: recipientTimezone,
    decision,
    gateway_route_required: true,
    opt_out_gateway_enforcement_required: true,
    direct_provider_send_allowed: false,
    runtime_adapter_executed: false,
    persistence_executed: false,
    quiet_hours_enabled: input.quiet_hours_enabled,
    scheduled_local_day: scheduledDay,
    scheduled_local_time: input.scheduled_local_time,
    matched_window: receiptMatchedWindow,
    defer_until_local_day: matchedWindow ? deferDayForWindow(matchedWindow, scheduledDay, scheduledMinutes) : null,
    defer_until_local_time: matchedWindow ? matchedWindow.end_local_time : null,
    required_evidence_artifacts: [
      'reminder_quiet_hours_runtime_receipt',
      'quiet_hours_policy_evaluated',
      'communication_gateway_route_preserved',
    ],
    decision_refs: REMINDER_QUIET_HOURS_DECISION_REFS,
    adl_refs: REMINDER_QUIET_HOURS_ADL_REFS,
    gateway_policy_ref: gatewayPolicyRef,
    idempotency_key: idempotencyKey,
    requested_by_user_id: requestedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digest(receiptWithoutDigest),
  };
}
