export const PHASE_6C_CHECKIN_TIME_WINDOW_SEED_ID = "seed_6c_113_checkin_time_window" as const;
export const PHASE_6C_CHECKIN_TIME_WINDOW_COMPONENT_ID = "6C.09" as const;
export const CHECKIN_TIME_WINDOW_SCAFFOLD_EVENT = "phase_6c.events_check_in_and_post_event_service.checkin_time_window.scaffold_control_evaluated" as const;

export type CheckinTimeWindowScaffoldInput = {
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

export type CheckinTimeWindowScaffoldReceipt = {
  seed_id: typeof PHASE_6C_CHECKIN_TIME_WINDOW_SEED_ID;
  component_id: typeof PHASE_6C_CHECKIN_TIME_WINDOW_COMPONENT_ID;
  component_slug: "events_check_in_and_post_event_service";
  model_name: "Phase6CCheckinTimeWindow";
  event_name: typeof CHECKIN_TIME_WINDOW_SCAFFOLD_EVENT;
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
