export const PHASE_6C_TENANT_AUTHORED_KNOWLEDGE_SEED_ID = "seed_6c_081_tenant_authored_knowledge" as const;
export const PHASE_6C_TENANT_AUTHORED_KNOWLEDGE_COMPONENT_ID = "6C.06" as const;
export const TENANT_AUTHORED_KNOWLEDGE_SCAFFOLD_EVENT = "phase_6c.workspace_tasks_projects_documents_and_knowledge.tenant_authored_knowledge.scaffold_control_evaluated" as const;

export type TenantAuthoredKnowledgeScaffoldInput = {
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

export type TenantAuthoredKnowledgeScaffoldReceipt = {
  seed_id: typeof PHASE_6C_TENANT_AUTHORED_KNOWLEDGE_SEED_ID;
  component_id: typeof PHASE_6C_TENANT_AUTHORED_KNOWLEDGE_COMPONENT_ID;
  component_slug: "workspace_tasks_projects_documents_and_knowledge";
  model_name: "Phase6CTenantAuthoredKnowledge";
  event_name: typeof TENANT_AUTHORED_KNOWLEDGE_SCAFFOLD_EVENT;
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
