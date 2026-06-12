export const PHASE_6C_WAITLIST_RULE_SEED_ID = 'seed_6c_101_waitlist_rule' as const;
export const PHASE_6C_WAITLIST_RULE_COMPONENT_ID = '6C.08' as const;
export const WAITLIST_RULE_RUNTIME_EVENT = 'phase_6c.events_configuration_and_registration_service.waitlist_rule.runtime_evaluated' as const;

export type WaitlistJoinPolicy = 'OPEN' | 'AFTER_SELL_OUT' | 'INVITE_ONLY' | 'MANUAL_REVIEW_ONLY';
export type WaitlistRankingStrategy = 'FIFO' | 'PRIORITY_SCORE' | 'MANUAL_REVIEW';
export type WaitlistRuleDecision = 'WAITLIST_ACCEPTED' | 'WAITLIST_DISABLED' | 'WAITLIST_FULL' | 'WAITLIST_NOT_NEEDED' | 'WAITLIST_REQUIRES_REVIEW';

export type WaitlistTicketRule = {
  ticket_type_ref: string;
  product_catalogue_item_ref: string;
  waitlist_enabled: boolean;
  max_waitlist_size: number;
  join_policy: WaitlistJoinPolicy;
  ranking_strategy: WaitlistRankingStrategy;
  min_priority_score?: number;
};

export type WaitlistCandidateRequest = {
  ticket_type_ref: string;
  requested_quantity: number;
  current_waitlist_count: number;
  active_capacity_remaining: number;
  invitation_ref?: string;
  priority_score?: number;
};

export type WaitlistRuleInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  product_catalogue_ref: string;
  waitlist_rules: readonly WaitlistTicketRule[];
  candidate_request?: WaitlistCandidateRequest;
  control_metadata?: Record<string, unknown>;
  waitlist_entry_mutation_requested?: boolean;
  ticket_inventory_mutation_requested?: boolean;
  auto_promotion_requested?: boolean;
  payment_capture_requested?: boolean;
  notification_send_requested?: boolean;
  provider_adapter_requested?: boolean;
  persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type WaitlistRuleEvaluation = {
  ticket_type_ref: string;
  product_catalogue_item_ref: string;
  waitlist_enabled: boolean;
  max_waitlist_size: number;
  join_policy: WaitlistJoinPolicy;
  ranking_strategy: WaitlistRankingStrategy;
};

export type WaitlistRuleRuntimeReceipt = {
  seed_id: typeof PHASE_6C_WAITLIST_RULE_SEED_ID;
  component_id: typeof PHASE_6C_WAITLIST_RULE_COMPONENT_ID;
  component_slug: 'events_configuration_and_registration_service';
  model_name: 'Phase6CWaitlistRule';
  event_name: typeof WAITLIST_RULE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  product_catalogue_ref: string;
  rule_count: number;
  evaluations: readonly WaitlistRuleEvaluation[];
  requested_ticket_type_ref?: string;
  requested_quantity?: number;
  remaining_waitlist_slots?: number;
  decision: WaitlistRuleDecision;
  decision_reason: string;
  refs_events_only: true;
  waitlist_entry_mutation_performed: false;
  ticket_inventory_mutation_performed: false;
  auto_promotion_performed: false;
  payment_capture_allowed: false;
  notification_send_performed: false;
  provider_adapter_allowed: false;
  persistence_performed: false;
  schema_mutation_performed: false;
  frontend_surface_created: false;
  decision_refs: readonly string[];
  adl_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  waitlist_rule_runtime_digest: string;
};
