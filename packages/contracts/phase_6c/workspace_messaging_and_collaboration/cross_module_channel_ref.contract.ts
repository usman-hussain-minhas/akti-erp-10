export const PHASE_6C_CROSS_MODULE_CHANNEL_REF_SEED_ID = "seed_6c_066_cross_module_channel_ref" as const;
export const PHASE_6C_CROSS_MODULE_CHANNEL_REF_COMPONENT_ID = "6C.05" as const;
export const CROSS_MODULE_CHANNEL_REF_EVALUATED_EVENT =
  "phase_6c.workspace_messaging_and_collaboration.cross_module_channel_ref.evaluated" as const;

export type CrossModuleChannelRelation = "CONTEXT_CHANNEL" | "SUPPORT_CHANNEL" | "DISCUSSION_CHANNEL";
export type CrossModuleChannelRefDecision = "CHANNEL_REFS_READY" | "CHANNEL_REFS_REQUIRE_REVIEW" | "CHANNEL_REFS_BLOCKED";

export type RegisteredCrossModuleRef = {
  registered_ref: string;
  module_key: string;
  capability_surface: string;
  evidence_ref: string;
};

export type RequestedCrossModuleChannelRef = {
  link_ref: string;
  registered_ref: string;
  module_key: string;
  module_record_ref: string;
  relation: CrossModuleChannelRelation;
  evidence_ref: string;
};

export type CrossModuleChannelRefInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  workspace_ref: string;
  channel_ref: string;
  channel_name: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  registered_refs: RegisteredCrossModuleRef[];
  requested_refs: RequestedCrossModuleChannelRef[];
  module_mutation_requested?: boolean;
  direct_cross_module_query_requested?: boolean;
  runtime_adapter_requested?: boolean;
  event_dispatch_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  frontend_route_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedCrossModuleChannelRef = {
  link_ref: string;
  registered_ref: string;
  module_key: string;
  module_record_ref: string;
  relation: CrossModuleChannelRelation;
  capability_surface: string;
  evidence_ref: string;
};

export type CrossModuleChannelRefReceipt = {
  seed_id: typeof PHASE_6C_CROSS_MODULE_CHANNEL_REF_SEED_ID;
  component_id: typeof PHASE_6C_CROSS_MODULE_CHANNEL_REF_COMPONENT_ID;
  event_name: typeof CROSS_MODULE_CHANNEL_REF_EVALUATED_EVENT;
  organization_id: string;
  source_record_ref: string;
  workspace_ref: string;
  channel_ref: string;
  decision: CrossModuleChannelRefDecision;
  requested_ref_count: number;
  accepted_ref_count: number;
  rejected_ref_count: number;
  normalized_refs: NormalizedCrossModuleChannelRef[];
  review_reasons: string[];
  blockers: string[];
  module_mutation_performed: false;
  direct_cross_module_query_performed: false;
  runtime_adapter_performed: false;
  event_dispatch_performed: false;
  schema_mutation_performed: false;
  phase_6a_mutation_performed: false;
  phase_6b_mutation_performed: false;
  frontend_route_performed: false;
  ticket_flag_flip_performed: false;
  decision_refs: readonly ["6C-WORK-MSG-012", "6C-GLOBAL-018"];
  evidence_artifacts: string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  deterministic_digest: string;
};
