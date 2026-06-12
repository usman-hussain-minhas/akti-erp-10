import { createHash } from 'node:crypto';

export const PHASE_6C_PROJECT_DEPENDENCY_ENGINE_SEED_ID = "seed_6c_073_project_dependency_engine" as const;
export const PHASE_6C_PROJECT_DEPENDENCY_ENGINE_COMPONENT_ID = "6C.06" as const;
export const PROJECT_DEPENDENCY_ENGINE_EVALUATED_EVENT = "phase_6c.workspace_tasks_projects_documents_and_knowledge.project_dependency_engine.evaluated" as const;

export const projectDependencyTypes = ["FINISH_TO_START", "START_TO_START", "FINISH_TO_FINISH", "BLOCKS"] as const;

type ProjectDependencyType = (typeof projectDependencyTypes)[number];
type ProjectDependencyEngineDecision = "PROJECT_DEPENDENCY_GRAPH_READY" | "PROJECT_DEPENDENCY_GRAPH_REQUIRES_REVIEW" | "PROJECT_DEPENDENCY_GRAPH_REJECTED";

export type ProjectDependencyNodeInput = {
  project_ref: string;
  label?: string;
  is_active?: boolean;
};

export type ProjectDependencyEdgeInput = {
  dependency_ref: string;
  source_project_ref: string;
  target_project_ref: string;
  dependency_type: ProjectDependencyType;
  lag_days?: number;
  is_blocking?: boolean;
};

export type ProjectDependencyEngineInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  graph_ref: string;
  nodes: readonly ProjectDependencyNodeInput[];
  dependencies: readonly ProjectDependencyEdgeInput[];
  evidence_refs?: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  persistence_requested?: boolean;
  gantt_view_requested?: boolean;
  frontend_publication_requested?: boolean;
  runtime_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  cross_phase_write_requested?: boolean;
  notification_send_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedProjectDependencyNode = {
  project_ref: string;
  label: string | null;
  is_active: boolean;
};

export type NormalizedProjectDependencyEdge = {
  dependency_ref: string;
  source_project_ref: string;
  target_project_ref: string;
  dependency_type: ProjectDependencyType;
  lag_days: number;
  is_blocking: boolean;
};

export type ProjectDependencyEngineReceipt = {
  seed_id: typeof PHASE_6C_PROJECT_DEPENDENCY_ENGINE_SEED_ID;
  component_id: typeof PHASE_6C_PROJECT_DEPENDENCY_ENGINE_COMPONENT_ID;
  component_slug: "workspace_tasks_projects_documents_and_knowledge";
  model_name: "Phase6CProjectDependencyEngine";
  event_name: typeof PROJECT_DEPENDENCY_ENGINE_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  graph_ref: string;
  decision: ProjectDependencyEngineDecision;
  normalized_nodes: readonly NormalizedProjectDependencyNode[];
  normalized_dependencies: readonly NormalizedProjectDependencyEdge[];
  topological_order: readonly string[];
  dependency_depth_by_project: Readonly<Record<string, number>>;
  cycle_paths: readonly string[];
  review_reasons: readonly string[];
  rejection_reasons: readonly string[];
  evidence_artifacts: readonly string[];
  decision_refs: readonly string[];
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  persistence_performed: false;
  gantt_view_rendered: false;
  frontend_publication_performed: false;
  schema_mutation_performed: false;
  cross_phase_write_performed: false;
  notification_sent: false;
  ticket_flags_changed: false;
  project_dependency_engine_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for project_dependency_engine.');
  }
  return value.trim();
}

function optionalText(value: string | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for project_dependency_engine.');
  }
  return normalized;
}

function requireOneOf<T extends string>(value: string, allowed: readonly T[], field: string): T {
  if (!allowed.includes(value as T)) {
    throw new Error(field + ' must be one of: ' + allowed.join(', '));
  }
  return value as T;
}

function normalizeList(values: readonly string[] | undefined, field: string): readonly string[] {
  if (values === undefined) {
    return [];
  }
  const normalized = values.map((value) => requireNonEmpty(value, field + ' entry'));
  return Array.from(new Set(normalized)).sort();
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return '[' + value.map((entry) => stableJson(entry)).join(',') + ']';
  }
  if (value !== null && typeof value === 'object') {
    return '{' + Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => JSON.stringify(key) + ':' + stableJson(entry))
      .join(',') + '}';
  }
  return JSON.stringify(value);
}

function digestGraph(receiptWithoutDigest: Omit<ProjectDependencyEngineReceipt, 'project_dependency_engine_evidence_digest'>): string {
  return createHash('sha256').update(stableJson(receiptWithoutDigest)).digest('hex');
}

function assertForbiddenRequests(input: ProjectDependencyEngineInput): void {
  const forbiddenRequests: Array<[boolean | undefined, string]> = [
    [input.persistence_requested, 'project_dependency_engine must not persist database changes inside this FFET.'],
    [input.gantt_view_requested, 'project_dependency_engine must not render Gantt or frontend views inside this FFET.'],
    [input.frontend_publication_requested, 'project_dependency_engine must not publish frontend routes inside this FFET.'],
    [input.runtime_adapter_requested, 'project_dependency_engine must not execute runtime adapters inside this FFET.'],
    [input.schema_mutation_requested, 'project_dependency_engine must not mutate schema inside this FFET.'],
    [input.cross_phase_write_requested, 'project_dependency_engine must not write cross-phase data inside this FFET.'],
    [input.notification_send_requested, 'project_dependency_engine must not send notifications inside this FFET.'],
    [input.ticket_flag_flip_requested, 'project_dependency_engine must not change ticket authorization flags.'],
  ];

  const violation = forbiddenRequests.find(([requested]) => requested === true);
  if (violation !== undefined) {
    throw new Error(violation[1]);
  }
}

function normalizeNodes(nodes: readonly ProjectDependencyNodeInput[]): readonly NormalizedProjectDependencyNode[] {
  if (nodes.length === 0) {
    throw new Error('nodes must include at least one project for project_dependency_engine.');
  }
  const byRef = new Map<string, NormalizedProjectDependencyNode>();
  for (const node of nodes) {
    const projectRef = requireNonEmpty(node.project_ref, 'project_ref');
    if (byRef.has(projectRef)) {
      throw new Error('duplicate project_ref is not allowed for project_dependency_engine: ' + projectRef);
    }
    byRef.set(projectRef, {
      project_ref: projectRef,
      label: optionalText(node.label),
      is_active: node.is_active !== false,
    });
  }
  return Array.from(byRef.values()).sort((left, right) => left.project_ref.localeCompare(right.project_ref));
}

function normalizeEdges(edges: readonly ProjectDependencyEdgeInput[]): readonly NormalizedProjectDependencyEdge[] {
  return edges.map((edge) => ({
    dependency_ref: requireNonEmpty(edge.dependency_ref, 'dependency_ref'),
    source_project_ref: requireNonEmpty(edge.source_project_ref, 'source_project_ref'),
    target_project_ref: requireNonEmpty(edge.target_project_ref, 'target_project_ref'),
    dependency_type: requireOneOf(requireNonEmpty(edge.dependency_type, 'dependency_type'), projectDependencyTypes, 'dependency_type'),
    lag_days: edge.lag_days ?? 0,
    is_blocking: edge.is_blocking !== false,
  })).sort((left, right) => left.source_project_ref.localeCompare(right.source_project_ref)
    || left.target_project_ref.localeCompare(right.target_project_ref)
    || left.dependency_ref.localeCompare(right.dependency_ref));
}

function analyzeGraph(
  nodes: readonly NormalizedProjectDependencyNode[],
  edges: readonly NormalizedProjectDependencyEdge[],
): {
  topological_order: readonly string[];
  dependency_depth_by_project: Readonly<Record<string, number>>;
  cycle_paths: readonly string[];
  review_reasons: readonly string[];
  rejection_reasons: readonly string[];
} {
  const nodeRefs = new Set(nodes.map((node) => node.project_ref));
  const adjacency = new Map<string, string[]>();
  const indegree = new Map<string, number>();
  const reviewReasons: string[] = [];
  const rejectionReasons: string[] = [];
  const edgeKeys = new Set<string>();

  for (const node of nodes) {
    adjacency.set(node.project_ref, []);
    indegree.set(node.project_ref, 0);
  }

  for (const edge of edges) {
    const edgeKey = edge.source_project_ref + '->' + edge.target_project_ref;
    if (edgeKeys.has(edgeKey)) {
      reviewReasons.push('duplicate_dependency_edge:' + edgeKey);
    }
    edgeKeys.add(edgeKey);

    if (edge.source_project_ref === edge.target_project_ref) {
      rejectionReasons.push('dependency_cannot_target_itself:' + edge.source_project_ref);
      continue;
    }
    if (!nodeRefs.has(edge.source_project_ref)) {
      rejectionReasons.push('dependency_source_missing:' + edge.source_project_ref);
      continue;
    }
    if (!nodeRefs.has(edge.target_project_ref)) {
      rejectionReasons.push('dependency_target_missing:' + edge.target_project_ref);
      continue;
    }
    if (!Number.isInteger(edge.lag_days) || edge.lag_days < 0) {
      reviewReasons.push('dependency_lag_days_requires_non_negative_integer:' + edge.dependency_ref);
    }

    adjacency.get(edge.source_project_ref)?.push(edge.target_project_ref);
    indegree.set(edge.target_project_ref, (indegree.get(edge.target_project_ref) ?? 0) + 1);
  }

  const cyclePaths = detectCycles(adjacency);
  if (cyclePaths.length > 0) {
    rejectionReasons.push('dependency_graph_contains_cycle');
  }

  const topologicalOrder = computeTopologicalOrder(adjacency, indegree);
  const depths = computeDepths(topologicalOrder, adjacency);

  return {
    topological_order: topologicalOrder,
    dependency_depth_by_project: depths,
    cycle_paths: cyclePaths,
    review_reasons: Array.from(new Set(reviewReasons)).sort(),
    rejection_reasons: Array.from(new Set(rejectionReasons)).sort(),
  };
}

function detectCycles(adjacency: ReadonlyMap<string, readonly string[]>): readonly string[] {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];
  const cycles = new Set<string>();

  function visit(node: string): void {
    if (visiting.has(node)) {
      const startIndex = stack.indexOf(node);
      const cycle = stack.slice(startIndex).concat(node).join('->');
      cycles.add(cycle);
      return;
    }
    if (visited.has(node)) {
      return;
    }
    visiting.add(node);
    stack.push(node);
    for (const next of [...(adjacency.get(node) ?? [])].sort()) {
      visit(next);
    }
    stack.pop();
    visiting.delete(node);
    visited.add(node);
  }

  for (const node of Array.from(adjacency.keys()).sort()) {
    visit(node);
  }

  return Array.from(cycles).sort();
}

function computeTopologicalOrder(adjacency: ReadonlyMap<string, readonly string[]>, indegree: ReadonlyMap<string, number>): readonly string[] {
  const localIndegree = new Map(indegree);
  const queue = Array.from(localIndegree.entries())
    .filter(([, count]) => count === 0)
    .map(([node]) => node)
    .sort();
  const order: string[] = [];

  while (queue.length > 0) {
    const node = queue.shift() as string;
    order.push(node);
    for (const next of [...(adjacency.get(node) ?? [])].sort()) {
      const nextIndegree = (localIndegree.get(next) ?? 0) - 1;
      localIndegree.set(next, nextIndegree);
      if (nextIndegree === 0) {
        queue.push(next);
        queue.sort();
      }
    }
  }

  return order;
}

function computeDepths(topologicalOrder: readonly string[], adjacency: ReadonlyMap<string, readonly string[]>): Readonly<Record<string, number>> {
  const depths: Record<string, number> = {};
  for (const node of topologicalOrder) {
    depths[node] = depths[node] ?? 0;
    for (const next of adjacency.get(node) ?? []) {
      depths[next] = Math.max(depths[next] ?? 0, depths[node] + 1);
    }
  }
  return Object.fromEntries(Object.entries(depths).sort(([left], [right]) => left.localeCompare(right)));
}

export function evaluateProjectDependencyEngine(input: ProjectDependencyEngineInput): ProjectDependencyEngineReceipt {
  assertForbiddenRequests(input);

  const normalizedNodes = normalizeNodes(input.nodes);
  const normalizedDependencies = normalizeEdges(input.dependencies);
  const analysis = analyzeGraph(normalizedNodes, normalizedDependencies);
  const evidenceArtifacts = normalizeList(input.evidence_refs, 'evidence_refs');
  const decision: ProjectDependencyEngineDecision = analysis.rejection_reasons.length > 0
    ? 'PROJECT_DEPENDENCY_GRAPH_REJECTED'
    : analysis.review_reasons.length > 0
      ? 'PROJECT_DEPENDENCY_GRAPH_REQUIRES_REVIEW'
      : 'PROJECT_DEPENDENCY_GRAPH_READY';

  const receiptWithoutDigest: Omit<ProjectDependencyEngineReceipt, 'project_dependency_engine_evidence_digest'> = {
    seed_id: PHASE_6C_PROJECT_DEPENDENCY_ENGINE_SEED_ID,
    component_id: PHASE_6C_PROJECT_DEPENDENCY_ENGINE_COMPONENT_ID,
    component_slug: "workspace_tasks_projects_documents_and_knowledge",
    model_name: "Phase6CProjectDependencyEngine",
    event_name: PROJECT_DEPENDENCY_ENGINE_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    graph_ref: requireNonEmpty(input.graph_ref, 'graph_ref'),
    decision,
    normalized_nodes: normalizedNodes,
    normalized_dependencies: normalizedDependencies,
    topological_order: analysis.topological_order,
    dependency_depth_by_project: analysis.dependency_depth_by_project,
    cycle_paths: analysis.cycle_paths,
    review_reasons: analysis.review_reasons,
    rejection_reasons: analysis.rejection_reasons,
    evidence_artifacts: evidenceArtifacts,
    decision_refs: ["6C-WORK-TASK-004"],
    capability_implementation_allowed: true,
    business_behavior_allowed: true,
    runtime_adapter_allowed: false,
    persistence_performed: false,
    gantt_view_rendered: false,
    frontend_publication_performed: false,
    schema_mutation_performed: false,
    cross_phase_write_performed: false,
    notification_sent: false,
    ticket_flags_changed: false,
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    project_dependency_engine_evidence_digest: digestGraph(receiptWithoutDigest),
  };
}
