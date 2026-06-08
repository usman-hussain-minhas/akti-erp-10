export const PHASE_6C_MESSAGE_THREAD_REACTION_SEED_ID = "seed_6c_058_message_thread_reaction" as const;
export const PHASE_6C_MESSAGE_THREAD_REACTION_COMPONENT_ID = "6C.05" as const;
export const MESSAGE_THREAD_REACTION_SCAFFOLD_EVENT = "phase_6c.workspace_messaging_and_collaboration.message_thread_reaction.scaffold_control_evaluated" as const;

export type MessageThreadReactionScaffoldInput = {
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

export type MessageThreadReactionScaffoldReceipt = {
  seed_id: typeof PHASE_6C_MESSAGE_THREAD_REACTION_SEED_ID;
  component_id: typeof PHASE_6C_MESSAGE_THREAD_REACTION_COMPONENT_ID;
  component_slug: "workspace_messaging_and_collaboration";
  model_name: "Phase6CMessageThreadReaction";
  event_name: typeof MESSAGE_THREAD_REACTION_SCAFFOLD_EVENT;
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
