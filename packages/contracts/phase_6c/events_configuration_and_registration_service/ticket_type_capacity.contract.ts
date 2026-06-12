export const PHASE_6C_TICKET_TYPE_CAPACITY_SEED_ID = 'seed_6c_099_ticket_type_capacity' as const;
export const PHASE_6C_TICKET_TYPE_CAPACITY_COMPONENT_ID = '6C.08' as const;
export const TICKET_TYPE_CAPACITY_RUNTIME_EVENT = 'phase_6c.events_configuration_and_registration_service.ticket_type_capacity.runtime_evaluated' as const;

export type TicketTypeCapacityDecision = 'CAPACITY_AVAILABLE' | 'CAPACITY_EXHAUSTED' | 'CAPACITY_REQUIRES_REVIEW';
export type TicketTypeCapacityStatus = 'AVAILABLE' | 'EXHAUSTED' | 'INACTIVE' | 'OVER_ALLOCATED';

export type TicketTypeCapacityRow = {
  ticket_type_ref: string;
  product_catalogue_item_ref: string;
  active: boolean;
  capacity: number;
  sold_count: number;
  held_count: number;
  reserved_count?: number;
};

export type TicketTypeCapacityRequest = {
  ticket_type_ref: string;
  requested_quantity: number;
};

export type TicketTypeCapacityInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  product_catalogue_ref: string;
  ticket_types: readonly TicketTypeCapacityRow[];
  capacity_request?: TicketTypeCapacityRequest;
  control_metadata?: Record<string, unknown>;
  product_catalogue_write_requested?: boolean;
  ticket_inventory_mutation_requested?: boolean;
  payment_capture_requested?: boolean;
  registration_creation_requested?: boolean;
  waitlist_promotion_requested?: boolean;
  provider_adapter_requested?: boolean;
  persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type TicketTypeCapacityEvaluation = {
  ticket_type_ref: string;
  product_catalogue_item_ref: string;
  active: boolean;
  capacity: number;
  committed_count: number;
  remaining_capacity: number;
  status: TicketTypeCapacityStatus;
};

export type TicketTypeCapacityRuntimeReceipt = {
  seed_id: typeof PHASE_6C_TICKET_TYPE_CAPACITY_SEED_ID;
  component_id: typeof PHASE_6C_TICKET_TYPE_CAPACITY_COMPONENT_ID;
  component_slug: 'events_configuration_and_registration_service';
  model_name: 'Phase6CTicketTypeCapacity';
  event_name: typeof TICKET_TYPE_CAPACITY_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  product_catalogue_ref: string;
  ticket_type_count: number;
  total_capacity: number;
  total_committed_count: number;
  total_remaining_capacity: number;
  evaluations: readonly TicketTypeCapacityEvaluation[];
  requested_ticket_type_ref?: string;
  requested_quantity?: number;
  requested_remaining_after_hold?: number;
  decision: TicketTypeCapacityDecision;
  refs_events_only: true;
  product_catalogue_write_allowed: false;
  ticket_inventory_mutation_performed: false;
  payment_capture_allowed: false;
  registration_creation_allowed: false;
  waitlist_promotion_performed: false;
  provider_adapter_allowed: false;
  persistence_performed: false;
  schema_mutation_performed: false;
  frontend_surface_created: false;
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  ticket_type_capacity_runtime_digest: string;
};
