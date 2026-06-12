import { createHash } from "crypto";

type CrossModuleChannelRelation = "CONTEXT_CHANNEL" | "SUPPORT_CHANNEL" | "DISCUSSION_CHANNEL";
type CrossModuleChannelRefDecision = "CHANNEL_REFS_READY" | "CHANNEL_REFS_REQUIRE_REVIEW" | "CHANNEL_REFS_BLOCKED";

type RegisteredCrossModuleRef = {
  registered_ref: string;
  module_key: string;
  capability_surface: string;
  evidence_ref: string;
};

type RequestedCrossModuleChannelRef = {
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

type NormalizedCrossModuleChannelRef = {
  link_ref: string;
  registered_ref: string;
  module_key: string;
  module_record_ref: string;
  relation: CrossModuleChannelRelation;
  capability_surface: string;
  evidence_ref: string;
};

export type CrossModuleChannelRefReceipt = {
  seed_id: "seed_6c_066_cross_module_channel_ref";
  component_id: "6C.05";
  event_name: "phase_6c.workspace_messaging_and_collaboration.cross_module_channel_ref.evaluated";
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

const SEED_ID = "seed_6c_066_cross_module_channel_ref" as const;
const COMPONENT_ID = "6C.05" as const;
const EVENT_NAME = "phase_6c.workspace_messaging_and_collaboration.cross_module_channel_ref.evaluated" as const;
const DECISION_REFS = ["6C-WORK-MSG-012", "6C-GLOBAL-018"] as const;
const RELATIONS = new Set<CrossModuleChannelRelation>([
  "CONTEXT_CHANNEL",
  "SUPPORT_CHANNEL",
  "DISCUSSION_CHANNEL",
]);

export function evaluateCrossModuleChannelRef(
  input: CrossModuleChannelRefInput,
): CrossModuleChannelRefReceipt {
  assertNoForbiddenRuntimeRequest(input);
  validateInput(input);

  const registeredByRef = new Map<string, RegisteredCrossModuleRef>();
  const blockers: string[] = [];
  const reviewReasons: string[] = [];
  for (const registeredRef of input.registered_refs.map(normalizeRegisteredRef)) {
    if (registeredByRef.has(registeredRef.registered_ref)) {
      blockers.push(`duplicate_registered_ref:${registeredRef.registered_ref}`);
    }
    registeredByRef.set(registeredRef.registered_ref, registeredRef);
  }

  const normalizedRefs: NormalizedCrossModuleChannelRef[] = [];
  const seenLinkRefs = new Set<string>();
  for (const requestedRef of input.requested_refs.map(normalizeRequestedRef)) {
    if (seenLinkRefs.has(requestedRef.link_ref)) {
      blockers.push(`duplicate_link_ref:${requestedRef.link_ref}`);
      continue;
    }
    seenLinkRefs.add(requestedRef.link_ref);
    const registeredRef = registeredByRef.get(requestedRef.registered_ref);
    if (!registeredRef) {
      reviewReasons.push(`unregistered_ref:${requestedRef.registered_ref}`);
      continue;
    }
    if (registeredRef.module_key !== requestedRef.module_key) {
      reviewReasons.push(`module_key_mismatch:${requestedRef.link_ref}`);
      continue;
    }
    normalizedRefs.push({
      link_ref: requestedRef.link_ref,
      registered_ref: requestedRef.registered_ref,
      module_key: requestedRef.module_key,
      module_record_ref: requestedRef.module_record_ref,
      relation: requestedRef.relation,
      capability_surface: registeredRef.capability_surface,
      evidence_ref: requestedRef.evidence_ref,
    });
  }

  const rejectedRefCount = input.requested_refs.length - normalizedRefs.length;
  const decision = decide(normalizedRefs.length, blockers.length, reviewReasons.length);
  const sortedRefs = normalizedRefs.sort((a, b) => a.link_ref.localeCompare(b.link_ref));
  const evidenceArtifacts = [
    `${SEED_ID}:workspace:${input.workspace_ref.trim()}`,
    `${SEED_ID}:channel:${input.channel_ref.trim()}`,
    `${SEED_ID}:accepted_refs:${sortedRefs.length}`,
    ...sortedRefs.map((ref) => `${SEED_ID}:link:${ref.link_ref}:${ref.module_key}`),
  ];
  const digestPayload = {
    organization_id: input.organization_id.trim(),
    workspace_ref: input.workspace_ref.trim(),
    channel_ref: input.channel_ref.trim(),
    decision,
    normalizedRefs: sortedRefs,
    blockers: blockers.sort(),
    reviewReasons: reviewReasons.sort(),
  };

  return {
    seed_id: SEED_ID,
    component_id: COMPONENT_ID,
    event_name: EVENT_NAME,
    organization_id: input.organization_id.trim(),
    source_record_ref: input.source_record_ref.trim(),
    workspace_ref: input.workspace_ref.trim(),
    channel_ref: input.channel_ref.trim(),
    decision,
    requested_ref_count: input.requested_refs.length,
    accepted_ref_count: sortedRefs.length,
    rejected_ref_count: rejectedRefCount,
    normalized_refs: sortedRefs,
    review_reasons: reviewReasons.sort(),
    blockers: blockers.sort(),
    module_mutation_performed: false,
    direct_cross_module_query_performed: false,
    runtime_adapter_performed: false,
    event_dispatch_performed: false,
    schema_mutation_performed: false,
    phase_6a_mutation_performed: false,
    phase_6b_mutation_performed: false,
    frontend_route_performed: false,
    ticket_flag_flip_performed: false,
    decision_refs: DECISION_REFS,
    evidence_artifacts: dedupeStrings(evidenceArtifacts),
    evaluated_by_user_id: input.evaluated_by_user_id.trim(),
    evaluated_at: new Date(input.evaluated_at).toISOString(),
    deterministic_digest: digest(digestPayload),
  };
}

function decide(acceptedCount: number, blockerCount: number, reviewCount: number): CrossModuleChannelRefDecision {
  if (blockerCount > 0) {
    return "CHANNEL_REFS_BLOCKED";
  }
  if (acceptedCount === 0 || reviewCount > 0) {
    return "CHANNEL_REFS_REQUIRE_REVIEW";
  }
  return "CHANNEL_REFS_READY";
}

function validateInput(input: CrossModuleChannelRefInput): void {
  const requiredFields: Array<keyof CrossModuleChannelRefInput> = [
    "organization_id",
    "service_manifest_contract_id",
    "source_record_ref",
    "workspace_ref",
    "channel_ref",
    "channel_name",
    "evaluated_by_user_id",
    "evaluated_at",
  ];
  for (const field of requiredFields) {
    assertNonEmptyString(input[field], field);
  }
  if (Number.isNaN(Date.parse(input.evaluated_at))) {
    throw new Error("evaluated_at must be an ISO-compatible timestamp");
  }
  if (!Array.isArray(input.registered_refs) || input.registered_refs.length === 0) {
    throw new Error("registered_refs must contain at least one registered module reference");
  }
  if (!Array.isArray(input.requested_refs) || input.requested_refs.length === 0) {
    throw new Error("requested_refs must contain at least one requested channel reference");
  }
  input.registered_refs.forEach(validateRegisteredRef);
  input.requested_refs.forEach(validateRequestedRef);
}

function validateRegisteredRef(ref: RegisteredCrossModuleRef, index: number): void {
  const label = `registered_refs[${index}]`;
  assertNonEmptyString(ref.registered_ref, `${label}.registered_ref`);
  assertNonEmptyString(ref.module_key, `${label}.module_key`);
  assertNonEmptyString(ref.capability_surface, `${label}.capability_surface`);
  assertNonEmptyString(ref.evidence_ref, `${label}.evidence_ref`);
}

function validateRequestedRef(ref: RequestedCrossModuleChannelRef, index: number): void {
  const label = `requested_refs[${index}]`;
  assertNonEmptyString(ref.link_ref, `${label}.link_ref`);
  assertNonEmptyString(ref.registered_ref, `${label}.registered_ref`);
  assertNonEmptyString(ref.module_key, `${label}.module_key`);
  assertNonEmptyString(ref.module_record_ref, `${label}.module_record_ref`);
  assertNonEmptyString(ref.evidence_ref, `${label}.evidence_ref`);
  if (!RELATIONS.has(ref.relation)) {
    throw new Error(`${label}.relation is not supported`);
  }
}

function normalizeRegisteredRef(ref: RegisteredCrossModuleRef): RegisteredCrossModuleRef {
  return {
    registered_ref: ref.registered_ref.trim(),
    module_key: ref.module_key.trim(),
    capability_surface: ref.capability_surface.trim(),
    evidence_ref: ref.evidence_ref.trim(),
  };
}

function normalizeRequestedRef(ref: RequestedCrossModuleChannelRef): RequestedCrossModuleChannelRef {
  return {
    link_ref: ref.link_ref.trim(),
    registered_ref: ref.registered_ref.trim(),
    module_key: ref.module_key.trim(),
    module_record_ref: ref.module_record_ref.trim(),
    relation: ref.relation,
    evidence_ref: ref.evidence_ref.trim(),
  };
}

function assertNoForbiddenRuntimeRequest(input: CrossModuleChannelRefInput): void {
  const forbidden: Array<[keyof CrossModuleChannelRefInput, string]> = [
    ["module_mutation_requested", "module mutation is outside this FFET"],
    ["direct_cross_module_query_requested", "direct cross-module query is outside this FFET"],
    ["runtime_adapter_requested", "runtime adapter execution is outside this FFET"],
    ["event_dispatch_requested", "event dispatch is outside this FFET"],
    ["schema_mutation_requested", "schema mutation is outside this FFET"],
    ["phase_6a_mutation_requested", "Phase 6A mutation is outside this FFET"],
    ["phase_6b_mutation_requested", "Phase 6B mutation is outside this FFET"],
    ["frontend_route_requested", "frontend routing is outside this FFET"],
    ["ticket_flag_flip_requested", "ticket/execution flag mutation is forbidden"],
  ];
  for (const [field, message] of forbidden) {
    if (input[field] === true) {
      throw new Error(message);
    }
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
