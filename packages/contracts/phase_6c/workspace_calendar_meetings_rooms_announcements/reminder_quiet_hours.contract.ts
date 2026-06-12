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
