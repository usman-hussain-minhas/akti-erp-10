export const PHASE_6C_TENANT_AUTHORED_KNOWLEDGE_SEED_ID = 'seed_6c_081_tenant_authored_knowledge' as const;
export const PHASE_6C_TENANT_AUTHORED_KNOWLEDGE_COMPONENT_ID = '6C.06' as const;
export const TENANT_AUTHORED_KNOWLEDGE_RUNTIME_EVENT = 'phase_6c.workspace_tasks_projects_documents_and_knowledge.tenant_authored_knowledge.runtime_evaluated' as const;

export type TenantAuthoredKnowledgeStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type TenantAuthoredKnowledgeVisibility = 'PRIVATE' | 'TEAM' | 'ORGANIZATION';
export type TenantAuthoredKnowledgeBlockType = 'HEADING' | 'PARAGRAPH' | 'CHECKLIST' | 'CODE' | 'QUOTE';

export type TenantAuthoredKnowledgeBlock = {
  block_key: string;
  type: TenantAuthoredKnowledgeBlockType;
  order: number;
  text: string;
};

export type TenantAuthoredKnowledgeInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  page_ref: string;
  page_slug: string;
  title: string;
  status: TenantAuthoredKnowledgeStatus;
  visibility: TenantAuthoredKnowledgeVisibility;
  authored_by_user_id: string;
  authored_at: string;
  version: number;
  blocks: readonly TenantAuthoredKnowledgeBlock[];
  tags?: readonly string[];
  source_document_refs?: readonly string[];
  workspace_collaboration_surface_active?: boolean;
  collaboration_context_ref?: string;
  metadata?: Record<string, unknown>;
  hardcoded_content_requested?: boolean;
  platform_default_content_requested?: boolean;
  publish_without_tenant_author_requested?: boolean;
  persistence_requested?: boolean;
  realtime_collaboration_requested?: boolean;
  runtime_adapter_requested?: boolean;
  cross_phase_write_requested?: boolean;
  frontend_route_requested?: boolean;
  authorization_flag_change_requested?: boolean;
};

export type TenantAuthoredKnowledgeReceipt = {
  seed_id: typeof PHASE_6C_TENANT_AUTHORED_KNOWLEDGE_SEED_ID;
  component_id: typeof PHASE_6C_TENANT_AUTHORED_KNOWLEDGE_COMPONENT_ID;
  component_slug: 'workspace_tasks_projects_documents_and_knowledge';
  model_name: 'Phase6CTenantAuthoredKnowledge';
  event_name: typeof TENANT_AUTHORED_KNOWLEDGE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  page_ref: string;
  page_slug: string;
  title: string;
  status: TenantAuthoredKnowledgeStatus;
  visibility: TenantAuthoredKnowledgeVisibility;
  authored_by_user_id: string;
  authored_at: string;
  version: number;
  tenant_authored: true;
  block_count: number;
  word_count: number;
  tag_count: number;
  source_document_refs: readonly string[];
  tags: readonly string[];
  blocks: readonly TenantAuthoredKnowledgeBlock[];
  content_sha256: string;
  workspace_collaboration_surface_active: boolean;
  collaboration_context_ref?: string;
  validation_warnings: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};
