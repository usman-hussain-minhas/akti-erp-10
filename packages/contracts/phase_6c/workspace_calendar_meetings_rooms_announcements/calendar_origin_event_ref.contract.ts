export const PHASE_6C_CALENDAR_ORIGIN_EVENT_REF_SEED_ID = "seed_6c_092_calendar_origin_event_ref" as const;
export const PHASE_6C_CALENDAR_ORIGIN_EVENT_REF_COMPONENT_ID = "6C.07" as const;
export const CALENDAR_ORIGIN_EVENT_REF_SCAFFOLD_EVENT = "phase_6c.workspace_calendar_meetings_rooms_announcements.calendar_origin_event_ref.scaffold_control_evaluated" as const;

export type CalendarOriginEventRefScaffoldInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  capability_execution_requested?: boolean;
  business_behavior_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type CalendarOriginEventRefScaffoldReceipt = {
  seed_id: typeof PHASE_6C_CALENDAR_ORIGIN_EVENT_REF_SEED_ID;
  component_id: typeof PHASE_6C_CALENDAR_ORIGIN_EVENT_REF_COMPONENT_ID;
  component_slug: "workspace_calendar_meetings_rooms_announcements";
  model_name: "Phase6CCalendarOriginEventRef";
  event_name: typeof CALENDAR_ORIGIN_EVENT_REF_SCAFFOLD_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  scaffold_status: 'SCAFFOLD_CONTROL_ONLY';
  capability_implementation_allowed: false;
  business_behavior_allowed: false;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  scaffold_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
