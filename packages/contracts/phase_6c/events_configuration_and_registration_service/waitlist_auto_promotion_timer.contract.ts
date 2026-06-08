export const PHASE_6C_WAITLIST_AUTO_PROMOTION_TIMER_SEED_ID = "seed_6c_102_waitlist_auto_promotion_timer" as const;
export const PHASE_6C_WAITLIST_AUTO_PROMOTION_TIMER_COMPONENT_ID = "6C.08" as const;
export const WAITLIST_AUTO_PROMOTION_TIMER_SCAFFOLD_EVENT = "phase_6c.events_configuration_and_registration_service.waitlist_auto_promotion_timer.scaffold_control_evaluated" as const;

export type WaitlistAutoPromotionTimerScaffoldInput = {
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

export type WaitlistAutoPromotionTimerScaffoldReceipt = {
  seed_id: typeof PHASE_6C_WAITLIST_AUTO_PROMOTION_TIMER_SEED_ID;
  component_id: typeof PHASE_6C_WAITLIST_AUTO_PROMOTION_TIMER_COMPONENT_ID;
  component_slug: "events_configuration_and_registration_service";
  model_name: "Phase6CWaitlistAutoPromotionTimer";
  event_name: typeof WAITLIST_AUTO_PROMOTION_TIMER_SCAFFOLD_EVENT;
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
