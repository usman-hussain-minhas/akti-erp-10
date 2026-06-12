export const PHASE_6C_WAITLIST_AUTO_PROMOTION_TIMER_SEED_ID = 'seed_6c_102_waitlist_auto_promotion_timer' as const;
export const PHASE_6C_WAITLIST_AUTO_PROMOTION_TIMER_COMPONENT_ID = '6C.08' as const;
export const WAITLIST_AUTO_PROMOTION_TIMER_RUNTIME_EVENT = 'phase_6c.events_configuration_and_registration_service.waitlist_auto_promotion_timer.runtime_evaluated' as const;

export type WaitlistAutoPromotionTimerDecision = 'TIMER_DISABLED' | 'TIMER_NOT_DUE' | 'PROMOTION_ELIGIBLE' | 'PROMOTION_WINDOW_EXPIRED' | 'PROMOTION_REQUIRES_REVIEW';

export type WaitlistAutoPromotionTimerRule = {
  timer_ref: string;
  ticket_type_ref: string;
  auto_promotion_enabled: boolean;
  promotion_delay_minutes: number;
  promotion_window_minutes: number;
  max_promotions_per_run: number;
};

export type WaitlistAutoPromotionTimerCandidate = {
  waitlist_entry_ref: string;
  ticket_type_ref: string;
  entered_waitlist_at: string;
  priority_rank: number;
  capacity_available: number;
};

export type WaitlistAutoPromotionTimerInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  rule: WaitlistAutoPromotionTimerRule;
  candidate: WaitlistAutoPromotionTimerCandidate;
  control_metadata?: Record<string, unknown>;
  scheduler_job_requested?: boolean;
  waitlist_promotion_mutation_requested?: boolean;
  ticket_inventory_mutation_requested?: boolean;
  notification_send_requested?: boolean;
  payment_capture_requested?: boolean;
  provider_adapter_requested?: boolean;
  persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type WaitlistAutoPromotionTimerRuntimeReceipt = {
  seed_id: typeof PHASE_6C_WAITLIST_AUTO_PROMOTION_TIMER_SEED_ID;
  component_id: typeof PHASE_6C_WAITLIST_AUTO_PROMOTION_TIMER_COMPONENT_ID;
  component_slug: 'events_configuration_and_registration_service';
  model_name: 'Phase6CWaitlistAutoPromotionTimer';
  event_name: typeof WAITLIST_AUTO_PROMOTION_TIMER_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  timer_ref: string;
  waitlist_entry_ref: string;
  ticket_type_ref: string;
  eligible_at: string;
  expires_at: string;
  capacity_available: number;
  priority_rank: number;
  max_promotions_per_run: number;
  decision: WaitlistAutoPromotionTimerDecision;
  decision_reason: string;
  adl_refs: readonly string[];
  scheduler_job_created: false;
  waitlist_promotion_performed: false;
  ticket_inventory_mutation_performed: false;
  notification_send_performed: false;
  payment_capture_allowed: false;
  provider_adapter_allowed: false;
  persistence_performed: false;
  schema_mutation_performed: false;
  frontend_surface_created: false;
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  waitlist_auto_promotion_timer_runtime_digest: string;
};
