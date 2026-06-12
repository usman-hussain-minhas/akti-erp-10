import { createHash } from 'node:crypto';

export const PHASE_6C_TENANT_AUTHORED_KNOWLEDGE_SEED_ID = 'seed_6c_081_tenant_authored_knowledge' as const;
export const PHASE_6C_TENANT_AUTHORED_KNOWLEDGE_COMPONENT_ID = '6C.06' as const;
export const TENANT_AUTHORED_KNOWLEDGE_RUNTIME_EVENT = 'phase_6c.workspace_tasks_projects_documents_and_knowledge.tenant_authored_knowledge.runtime_evaluated' as const;

type TenantAuthoredKnowledgeStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
type TenantAuthoredKnowledgeVisibility = 'PRIVATE' | 'TEAM' | 'ORGANIZATION';
type TenantAuthoredKnowledgeBlockType = 'HEADING' | 'PARAGRAPH' | 'CHECKLIST' | 'CODE' | 'QUOTE';

type TenantAuthoredKnowledgeBlock = {
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

const ALLOWED_STATUSES = new Set<TenantAuthoredKnowledgeStatus>(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
const ALLOWED_VISIBILITIES = new Set<TenantAuthoredKnowledgeVisibility>(['PRIVATE', 'TEAM', 'ORGANIZATION']);
const ALLOWED_BLOCK_TYPES = new Set<TenantAuthoredKnowledgeBlockType>(['HEADING', 'PARAGRAPH', 'CHECKLIST', 'CODE', 'QUOTE']);
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for tenant_authored_knowledge runtime evaluation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  const timestampMs = Date.parse(normalized);
  if (!Number.isFinite(timestampMs)) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for tenant_authored_knowledge runtime evaluation.');
  }
  return new Date(timestampMs).toISOString();
}

function requirePositiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(field + ' must be a positive integer for tenant_authored_knowledge runtime evaluation.');
  }
  return value;
}

function rejectForbiddenRequests(input: TenantAuthoredKnowledgeInput): readonly string[] {
  const rejected: string[] = [];
  const forbiddenFlags: Array<[keyof TenantAuthoredKnowledgeInput, string]> = [
    ['hardcoded_content_requested', 'hardcoded knowledge content is forbidden; pages must be tenant-authored'],
    ['platform_default_content_requested', 'platform default knowledge content is forbidden without tenant authorship'],
    ['publish_without_tenant_author_requested', 'publishing without a tenant author is forbidden'],
    ['persistence_requested', 'persistence is deferred until runtime wiring is authorized'],
    ['realtime_collaboration_requested', 'real-time collaborative editing is deferred by scope'],
    ['runtime_adapter_requested', 'runtime adapter execution is outside this FFET'],
    ['cross_phase_write_requested', 'cross-phase writes are forbidden; refs/events only'],
    ['frontend_route_requested', 'frontend route publication is outside this FFET'],
    ['authorization_flag_change_requested', 'authorization flag changes are human-gated and forbidden here'],
  ];

  for (const [field, reason] of forbiddenFlags) {
    if (input[field] === true) {
      rejected.push(reason);
    }
  }

  return rejected;
}

function normalizeSlug(value: string): string {
  const slug = requireNonEmpty(value, 'page_slug').toLowerCase();
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error('page_slug must be lower-snake-free kebab case for tenant_authored_knowledge.');
  }
  return slug;
}

function normalizeStringList(values: readonly string[] | undefined, field: string): readonly string[] {
  const normalized = [...(values ?? [])].map((value, index) => requireNonEmpty(value, field + '[' + index + ']'));
  const seen = new Set<string>();
  for (const value of normalized) {
    if (seen.has(value)) {
      throw new Error(field + ' contains duplicate value for tenant_authored_knowledge: ' + value);
    }
    seen.add(value);
  }
  return normalized;
}

function normalizeBlocks(blocks: readonly TenantAuthoredKnowledgeBlock[]): readonly TenantAuthoredKnowledgeBlock[] {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    throw new Error('at least one content block is required for tenant_authored_knowledge runtime evaluation.');
  }
  const seenKeys = new Set<string>();
  const seenOrders = new Set<number>();
  return blocks.map((block, index) => {
    const block_key = requireNonEmpty(block.block_key, 'blocks[' + index + '].block_key');
    if (seenKeys.has(block_key)) {
      throw new Error('duplicate block_key is not allowed for tenant_authored_knowledge: ' + block_key);
    }
    seenKeys.add(block_key);
    if (!ALLOWED_BLOCK_TYPES.has(block.type)) {
      throw new Error('blocks[' + index + '].type must be HEADING, PARAGRAPH, CHECKLIST, CODE, or QUOTE.');
    }
    const order = requirePositiveInteger(block.order, 'blocks[' + index + '].order');
    if (seenOrders.has(order)) {
      throw new Error('duplicate block order is not allowed for tenant_authored_knowledge: ' + order);
    }
    seenOrders.add(order);
    return {
      block_key,
      type: block.type,
      order,
      text: requireNonEmpty(block.text, 'blocks[' + index + '].text'),
    };
  }).sort((a, b) => a.order - b.order);
}

function countWords(blocks: readonly TenantAuthoredKnowledgeBlock[]): number {
  return blocks.reduce((sum, block) => {
    const words = block.text.trim().split(/\s+/).filter(Boolean);
    return sum + words.length;
  }, 0);
}

function buildContentHash(input: {
  page_slug: string;
  title: string;
  version: number;
  blocks: readonly TenantAuthoredKnowledgeBlock[];
}): string {
  return createHash('sha256').update(JSON.stringify(input)).digest('hex');
}

function buildValidationWarnings(input: {
  status: TenantAuthoredKnowledgeStatus;
  wordCount: number;
  sourceDocumentCount: number;
  tagCount: number;
}): readonly string[] {
  const warnings: string[] = [];
  if (input.status === 'PUBLISHED' && input.wordCount < 5) {
    warnings.push('published_page_has_short_body');
  }
  if (input.sourceDocumentCount === 0) {
    warnings.push('page_has_no_source_document_refs');
  }
  if (input.tagCount === 0) {
    warnings.push('page_has_no_tags');
  }
  return warnings;
}

function digestRuntime(receiptWithoutDigest: Omit<TenantAuthoredKnowledgeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateTenantAuthoredKnowledge(input: TenantAuthoredKnowledgeInput): TenantAuthoredKnowledgeReceipt {
  const forbiddenBehaviorRejections = rejectForbiddenRequests(input);
  if (forbiddenBehaviorRejections.length > 0) {
    throw new Error('tenant_authored_knowledge rejected forbidden behavior: ' + forbiddenBehaviorRejections.join('; '));
  }
  if (!ALLOWED_STATUSES.has(input.status)) {
    throw new Error('status must be DRAFT, PUBLISHED, or ARCHIVED for tenant_authored_knowledge runtime evaluation.');
  }
  if (!ALLOWED_VISIBILITIES.has(input.visibility)) {
    throw new Error('visibility must be PRIVATE, TEAM, or ORGANIZATION for tenant_authored_knowledge runtime evaluation.');
  }

  const organization_id = requireNonEmpty(input.organization_id, 'organization_id');
  const service_manifest_contract_id = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const page_ref = requireNonEmpty(input.page_ref, 'page_ref');
  const page_slug = normalizeSlug(input.page_slug);
  const title = requireNonEmpty(input.title, 'title');
  const authored_by_user_id = requireNonEmpty(input.authored_by_user_id, 'authored_by_user_id');
  const authored_at = requireTimestamp(input.authored_at, 'authored_at');
  const version = requirePositiveInteger(input.version, 'version');
  const blocks = normalizeBlocks(input.blocks);
  const tags = normalizeStringList(input.tags, 'tags');
  const source_document_refs = normalizeStringList(input.source_document_refs, 'source_document_refs');
  const word_count = countWords(blocks);
  const content_sha256 = buildContentHash({ page_slug, title, version, blocks });
  const workspace_collaboration_surface_active = input.workspace_collaboration_surface_active === true;
  const collaboration_context_ref = input.collaboration_context_ref === undefined
    ? undefined
    : requireNonEmpty(input.collaboration_context_ref, 'collaboration_context_ref');
  if (collaboration_context_ref !== undefined && !workspace_collaboration_surface_active) {
    throw new Error('collaboration_context_ref requires workspace_collaboration_surface_active for tenant_authored_knowledge.');
  }

  const receiptWithoutDigest: Omit<TenantAuthoredKnowledgeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_TENANT_AUTHORED_KNOWLEDGE_SEED_ID,
    component_id: PHASE_6C_TENANT_AUTHORED_KNOWLEDGE_COMPONENT_ID,
    component_slug: 'workspace_tasks_projects_documents_and_knowledge',
    model_name: 'Phase6CTenantAuthoredKnowledge',
    event_name: TENANT_AUTHORED_KNOWLEDGE_RUNTIME_EVENT,
    organization_id,
    service_manifest_contract_id,
    page_ref,
    page_slug,
    title,
    status: input.status,
    visibility: input.visibility,
    authored_by_user_id,
    authored_at,
    version,
    tenant_authored: true,
    block_count: blocks.length,
    word_count,
    tag_count: tags.length,
    source_document_refs,
    tags,
    blocks,
    content_sha256,
    workspace_collaboration_surface_active,
    ...(collaboration_context_ref === undefined ? {} : { collaboration_context_ref }),
    validation_warnings: buildValidationWarnings({ status: input.status, wordCount: word_count, sourceDocumentCount: source_document_refs.length, tagCount: tags.length }),
    forbidden_behavior_rejections: [],
    metadata: input.metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestRuntime(receiptWithoutDigest),
  };
}
