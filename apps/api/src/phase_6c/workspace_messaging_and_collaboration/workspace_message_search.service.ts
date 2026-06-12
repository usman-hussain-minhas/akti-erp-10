import { createHash } from "crypto";

type WorkspaceMessageSearchDecision = "SEARCH_READY" | "SEARCH_NO_MATCHES" | "SEARCH_REQUIRES_REVIEW";

type WorkspaceMessageSearchFilters = {
  channel_refs?: string[];
  author_user_refs?: string[];
  created_from?: string;
  created_to?: string;
  include_file_refs: boolean;
};

type WorkspaceMessageSearchRecord = {
  message_ref: string;
  conversation_ref: string;
  channel_ref: string;
  author_user_ref: string;
  body_text: string;
  created_at: string;
  edited_at?: string;
  file_refs: string[];
  search_layer_evidence_ref: string;
};

export type WorkspaceMessageSearchInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  workspace_ref: string;
  query_ref: string;
  query_text: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  access_filter_ref: string;
  allowed_channel_refs: string[];
  filters: WorkspaceMessageSearchFilters;
  records: WorkspaceMessageSearchRecord[];
  external_search_runtime_requested?: boolean;
  search_index_mutation_requested?: boolean;
  file_layer_mutation_requested?: boolean;
  direct_cross_module_query_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  event_dispatch_requested?: boolean;
  frontend_route_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

type WorkspaceMessageSearchResult = {
  message_ref: string;
  conversation_ref: string;
  channel_ref: string;
  author_user_ref: string;
  score: number;
  matched_terms: string[];
  snippet: string;
  file_refs: string[];
  search_layer_evidence_ref: string;
};

export type WorkspaceMessageSearchReceipt = {
  seed_id: "seed_6c_067_workspace_message_search";
  component_id: "6C.05";
  event_name: "phase_6c.workspace_messaging_and_collaboration.workspace_message_search.evaluated";
  organization_id: string;
  source_record_ref: string;
  workspace_ref: string;
  query_ref: string;
  decision: WorkspaceMessageSearchDecision;
  normalized_terms: string[];
  scanned_record_count: number;
  accessible_record_count: number;
  result_count: number;
  results: WorkspaceMessageSearchResult[];
  review_reasons: string[];
  external_search_runtime_performed: false;
  search_index_mutation_performed: false;
  file_layer_mutation_performed: false;
  direct_cross_module_query_performed: false;
  schema_mutation_performed: false;
  phase_6a_mutation_performed: false;
  phase_6b_mutation_performed: false;
  event_dispatch_performed: false;
  frontend_route_performed: false;
  ticket_flag_flip_performed: false;
  decision_refs: readonly ["6C-WORK-MSG-013", "6C-GLOBAL-018"];
  evidence_artifacts: string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  deterministic_digest: string;
};

const SEED_ID = "seed_6c_067_workspace_message_search" as const;
const COMPONENT_ID = "6C.05" as const;
const EVENT_NAME = "phase_6c.workspace_messaging_and_collaboration.workspace_message_search.evaluated" as const;
const DECISION_REFS = ["6C-WORK-MSG-013", "6C-GLOBAL-018"] as const;

export function evaluateWorkspaceMessageSearch(input: WorkspaceMessageSearchInput): WorkspaceMessageSearchReceipt {
  assertNoForbiddenRuntimeRequest(input);
  validateInput(input);

  const terms = normalizeTerms(input.query_text);
  const reviewReasons: string[] = [];
  if (terms.length === 0) {
    reviewReasons.push("query_has_no_searchable_terms");
  }

  const allowedChannels = new Set(dedupeStrings(input.allowed_channel_refs));
  const filteredRecords = input.records.filter((record) => recordMatchesFilters(record, input.filters));
  const accessibleRecords = filteredRecords.filter((record) => allowedChannels.has(record.channel_ref.trim()));
  if (accessibleRecords.length < filteredRecords.length) {
    reviewReasons.push("records_excluded_by_access_filter");
  }

  const results = accessibleRecords
    .map((record) => scoreRecord(record, terms, input.filters.include_file_refs))
    .filter((result): result is WorkspaceMessageSearchResult => result !== null)
    .sort((a, b) => b.score - a.score || a.message_ref.localeCompare(b.message_ref));

  const decision = decide(results.length, reviewReasons.length);
  const evidenceArtifacts = [
    `${SEED_ID}:workspace:${input.workspace_ref.trim()}`,
    `${SEED_ID}:query:${input.query_ref.trim()}`,
    `${SEED_ID}:access_filter:${input.access_filter_ref.trim()}`,
    `${SEED_ID}:results:${results.length}`,
    ...results.map((result) => `${SEED_ID}:message:${result.message_ref}`),
  ];
  const digestPayload = {
    organization_id: input.organization_id.trim(),
    workspace_ref: input.workspace_ref.trim(),
    query_ref: input.query_ref.trim(),
    terms,
    results,
    reviewReasons: reviewReasons.sort(),
  };

  return {
    seed_id: SEED_ID,
    component_id: COMPONENT_ID,
    event_name: EVENT_NAME,
    organization_id: input.organization_id.trim(),
    source_record_ref: input.source_record_ref.trim(),
    workspace_ref: input.workspace_ref.trim(),
    query_ref: input.query_ref.trim(),
    decision,
    normalized_terms: terms,
    scanned_record_count: input.records.length,
    accessible_record_count: accessibleRecords.length,
    result_count: results.length,
    results,
    review_reasons: reviewReasons.sort(),
    external_search_runtime_performed: false,
    search_index_mutation_performed: false,
    file_layer_mutation_performed: false,
    direct_cross_module_query_performed: false,
    schema_mutation_performed: false,
    phase_6a_mutation_performed: false,
    phase_6b_mutation_performed: false,
    event_dispatch_performed: false,
    frontend_route_performed: false,
    ticket_flag_flip_performed: false,
    decision_refs: DECISION_REFS,
    evidence_artifacts: dedupeStrings(evidenceArtifacts),
    evaluated_by_user_id: input.evaluated_by_user_id.trim(),
    evaluated_at: new Date(input.evaluated_at).toISOString(),
    deterministic_digest: digest(digestPayload),
  };
}

function scoreRecord(
  record: WorkspaceMessageSearchRecord,
  terms: string[],
  includeFileRefs: boolean,
): WorkspaceMessageSearchResult | null {
  const text = record.body_text.toLowerCase();
  const matchedTerms = terms.filter((term) => text.includes(term));
  if (matchedTerms.length === 0) {
    return null;
  }
  const uniqueMatchedTerms = dedupeStrings(matchedTerms);
  const score = uniqueMatchedTerms.length * 10 + uniqueMatchedTerms.reduce((sum, term) => sum + countOccurrences(text, term), 0);
  return {
    message_ref: record.message_ref.trim(),
    conversation_ref: record.conversation_ref.trim(),
    channel_ref: record.channel_ref.trim(),
    author_user_ref: record.author_user_ref.trim(),
    score,
    matched_terms: uniqueMatchedTerms,
    snippet: snippet(record.body_text, uniqueMatchedTerms[0] ?? ""),
    file_refs: includeFileRefs ? dedupeStrings(record.file_refs) : [],
    search_layer_evidence_ref: record.search_layer_evidence_ref.trim(),
  };
}

function recordMatchesFilters(record: WorkspaceMessageSearchRecord, filters: WorkspaceMessageSearchFilters): boolean {
  if (filters.channel_refs && filters.channel_refs.length > 0 && !filters.channel_refs.includes(record.channel_ref.trim())) {
    return false;
  }
  if (
    filters.author_user_refs &&
    filters.author_user_refs.length > 0 &&
    !filters.author_user_refs.includes(record.author_user_ref.trim())
  ) {
    return false;
  }
  const createdAt = Date.parse(record.created_at);
  if (filters.created_from && createdAt < Date.parse(filters.created_from)) {
    return false;
  }
  if (filters.created_to && createdAt > Date.parse(filters.created_to)) {
    return false;
  }
  return true;
}

function decide(resultCount: number, reviewReasonCount: number): WorkspaceMessageSearchDecision {
  if (reviewReasonCount > 0) {
    return "SEARCH_REQUIRES_REVIEW";
  }
  if (resultCount === 0) {
    return "SEARCH_NO_MATCHES";
  }
  return "SEARCH_READY";
}

function validateInput(input: WorkspaceMessageSearchInput): void {
  const requiredFields: Array<keyof WorkspaceMessageSearchInput> = [
    "organization_id",
    "service_manifest_contract_id",
    "source_record_ref",
    "workspace_ref",
    "query_ref",
    "query_text",
    "evaluated_by_user_id",
    "evaluated_at",
    "access_filter_ref",
  ];
  for (const field of requiredFields) {
    assertNonEmptyString(input[field], field);
  }
  if (Number.isNaN(Date.parse(input.evaluated_at))) {
    throw new Error("evaluated_at must be an ISO-compatible timestamp");
  }
  validateStringArray(input.allowed_channel_refs, "allowed_channel_refs");
  if (input.allowed_channel_refs.length === 0) {
    throw new Error("allowed_channel_refs[] must be a non-empty string");
  }
  validateFilters(input.filters);
  if (!Array.isArray(input.records)) {
    throw new Error("records must be an array");
  }
  input.records.forEach(validateRecord);
}

function validateFilters(filters: WorkspaceMessageSearchFilters): void {
  if (!filters || typeof filters.include_file_refs !== "boolean") {
    throw new Error("filters.include_file_refs must be boolean");
  }
  if (filters.channel_refs !== undefined) {
    validateStringArray(filters.channel_refs, "filters.channel_refs");
  }
  if (filters.author_user_refs !== undefined) {
    validateStringArray(filters.author_user_refs, "filters.author_user_refs");
  }
  if (filters.created_from !== undefined && Number.isNaN(Date.parse(filters.created_from))) {
    throw new Error("filters.created_from must be an ISO-compatible timestamp");
  }
  if (filters.created_to !== undefined && Number.isNaN(Date.parse(filters.created_to))) {
    throw new Error("filters.created_to must be an ISO-compatible timestamp");
  }
}

function validateRecord(record: WorkspaceMessageSearchRecord, index: number): void {
  const label = `records[${index}]`;
  assertNonEmptyString(record.message_ref, `${label}.message_ref`);
  assertNonEmptyString(record.conversation_ref, `${label}.conversation_ref`);
  assertNonEmptyString(record.channel_ref, `${label}.channel_ref`);
  assertNonEmptyString(record.author_user_ref, `${label}.author_user_ref`);
  assertNonEmptyString(record.body_text, `${label}.body_text`);
  assertNonEmptyString(record.search_layer_evidence_ref, `${label}.search_layer_evidence_ref`);
  if (Number.isNaN(Date.parse(record.created_at))) {
    throw new Error(`${label}.created_at must be an ISO-compatible timestamp`);
  }
  if (record.edited_at !== undefined && Number.isNaN(Date.parse(record.edited_at))) {
    throw new Error(`${label}.edited_at must be an ISO-compatible timestamp`);
  }
  validateStringArray(record.file_refs, `${label}.file_refs`);
}

function assertNoForbiddenRuntimeRequest(input: WorkspaceMessageSearchInput): void {
  const forbidden: Array<[keyof WorkspaceMessageSearchInput, string]> = [
    ["external_search_runtime_requested", "external search runtime execution is outside this FFET"],
    ["search_index_mutation_requested", "search index mutation is outside this FFET"],
    ["file_layer_mutation_requested", "file layer mutation is outside this FFET"],
    ["direct_cross_module_query_requested", "direct cross-module query is outside this FFET"],
    ["schema_mutation_requested", "schema mutation is outside this FFET"],
    ["phase_6a_mutation_requested", "Phase 6A mutation is outside this FFET"],
    ["phase_6b_mutation_requested", "Phase 6B mutation is outside this FFET"],
    ["event_dispatch_requested", "event dispatch is outside this FFET"],
    ["frontend_route_requested", "frontend routing is outside this FFET"],
    ["ticket_flag_flip_requested", "ticket/execution flag mutation is forbidden"],
  ];
  for (const [field, message] of forbidden) {
    if (input[field] === true) {
      throw new Error(message);
    }
  }
}

function normalizeTerms(query: string): string[] {
  return dedupeStrings(query.toLowerCase().split(/[^a-z0-9_]+/).filter((term) => term.length >= 2));
}

function countOccurrences(text: string, term: string): number {
  return text.split(term).length - 1;
}

function snippet(text: string, term: string): string {
  const normalized = text.trim().replace(/\s+/g, " ");
  const index = normalized.toLowerCase().indexOf(term);
  if (index < 0) {
    return normalized.slice(0, 120);
  }
  const start = Math.max(0, index - 30);
  const end = Math.min(normalized.length, index + term.length + 60);
  return normalized.slice(start, end);
}

function validateStringArray(values: unknown, field: string): asserts values is string[] {
  if (!Array.isArray(values)) {
    throw new Error(`${field} must be an array`);
  }
  for (const value of values) {
    assertNonEmptyString(value, `${field}[]`);
  }
}

function assertNonEmptyString(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} must be a non-empty string`);
  }
}

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

function digest(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}
