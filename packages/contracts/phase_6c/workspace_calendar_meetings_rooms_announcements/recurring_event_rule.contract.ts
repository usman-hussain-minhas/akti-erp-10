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
