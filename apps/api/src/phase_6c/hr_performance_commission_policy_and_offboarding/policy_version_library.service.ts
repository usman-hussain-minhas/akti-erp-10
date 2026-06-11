import { createHash } from 'node:crypto';

export const PHASE_6C_POLICY_VERSION_LIBRARY_SEED_ID = "seed_6c_049_policy_version_library" as const;
export const PHASE_6C_POLICY_VERSION_LIBRARY_COMPONENT_ID = "6C.04" as const;
export const POLICY_VERSION_LIBRARY_EVALUATED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.policy_version_library.evaluated" as const;

export type PolicyVersionCategory =
  | "HR_POLICY"
  | "COMMISSION_POLICY"
  | "OFFBOARDING_POLICY"
  | "ATTENDANCE_POLICY"
  | "PERFORMANCE_POLICY";

export type PolicyVersionStatus = "DRAFT" | "ACTIVE" | "SUPERSEDED" | "RETIRED";

export type PolicyVersionLibraryDecision =
  | "POLICY_VERSION_LIBRARY_READY"
  | "POLICY_VERSION_LIBRARY_PARTIAL"
  | "POLICY_VERSION_LIBRARY_REQUIRES_REVIEW";

export type PolicyVersionRecord = {
  policy_key: string;
  policy_title: string;
  category: PolicyVersionCategory;
  version: string;
  status: PolicyVersionStatus;
  effective_from: string;
  effective_to?: string;
  supersedes_version?: string;
  policy_hash: string;
  evidence_refs: readonly string[];
};

export type PolicyVersionLibraryInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  library_ref: string;
  requested_policy_keys: readonly string[];
  policy_versions: readonly PolicyVersionRecord[];
  effective_at: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  policy_mutation_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type PolicyVersionSelection = {
  policy_key: string;
  selected_version: string | null;
  selected_policy_hash: string | null;
  category: PolicyVersionCategory | null;
  status: "SELECTED" | "MISSING" | "CONFLICT";
  effective_version_count: number;
  evidence_refs: readonly string[];
  conflict_versions: readonly string[];
};

export type PolicyVersionLibraryReceipt = {
  seed_id: typeof PHASE_6C_POLICY_VERSION_LIBRARY_SEED_ID;
  component_id: typeof PHASE_6C_POLICY_VERSION_LIBRARY_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6CPolicyVersionLibrary";
  event_name: typeof POLICY_VERSION_LIBRARY_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  library_ref: string;
  effective_at: string;
  requested_policy_count: number;
  selected_policy_count: number;
  missing_policy_count: number;
  conflict_policy_count: number;
  decision: PolicyVersionLibraryDecision;
  selections: readonly PolicyVersionSelection[];
  policy_mutation_allowed: false;
  schema_mutation_allowed: false;
  phase_6a_mutation_allowed: false;
  phase_6b_mutation_allowed: false;
  runtime_adapter_allowed: false;
  ticket_flag_flip_allowed: false;
  decision_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  evidence_artifacts: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  policy_library_digest: string;
};

type ReceiptWithoutDigest = Omit<PolicyVersionLibraryReceipt, 'policy_library_digest'>;

type NormalizedPolicyVersion = PolicyVersionRecord & {
  policy_key: string;
  policy_title: string;
  version: string;
  effective_from: string;
  effective_to?: string;
  policy_hash: string;
  evidence_refs: readonly string[];
};

const DECISION_REFS = ["6C-HR-OPS-009"] as const;
const EVIDENCE_ARTIFACTS = [
  "policy_version_library_runtime_receipt",
  "effective_policy_selection_evidence",
  "policy_version_conflict_evidence",
  "deterministic_policy_library_digest",
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for policy_version_library.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for policy_version_library.');
  }
  return normalized;
}

function requireCategory(value: PolicyVersionCategory | undefined, field: string): PolicyVersionCategory {
  if (
    value !== "HR_POLICY" &&
    value !== "COMMISSION_POLICY" &&
    value !== "OFFBOARDING_POLICY" &&
    value !== "ATTENDANCE_POLICY" &&
    value !== "PERFORMANCE_POLICY"
  ) {
    throw new Error(field + ' must be a supported policy category for policy_version_library.');
  }
  return value;
}

function requireStatus(value: PolicyVersionStatus | undefined, field: string): PolicyVersionStatus {
  if (value !== "DRAFT" && value !== "ACTIVE" && value !== "SUPERSEDED" && value !== "RETIRED") {
    throw new Error(field + ' must be a supported policy status for policy_version_library.');
  }
  return value;
}

function rejectForbiddenMutation(input: PolicyVersionLibraryInput): void {
  const forbiddenRequests: Array<[keyof PolicyVersionLibraryInput, string]> = [
    ['policy_mutation_requested', 'policy mutation'],
    ['schema_mutation_requested', 'schema mutation'],
    ['phase_6a_mutation_requested', 'Phase 6A mutation'],
    ['phase_6b_mutation_requested', 'Phase 6B mutation'],
    ['runtime_adapter_requested', 'runtime adapter execution'],
    ['ticket_flag_flip_requested', 'ticket flag flip'],
  ];

  for (const [field, label] of forbiddenRequests) {
    if (input[field] === true) {
      throw new Error('policy_version_library must not perform ' + label + '.');
    }
  }
}

function digestReceipt(receiptWithoutDigest: ReceiptWithoutDigest): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

function normalizePolicyVersions(policyVersions: readonly PolicyVersionRecord[]): NormalizedPolicyVersion[] {
  if (!Array.isArray(policyVersions)) {
    throw new Error('policy_versions must be an array for policy_version_library.');
  }
  const seenVersionKeys = new Set<string>();

  return policyVersions.map((policyVersion, index) => {
    const prefix = 'policy_versions[' + index + ']';
    const policyKey = requireNonEmpty(policyVersion.policy_key, prefix + '.policy_key');
    const version = requireNonEmpty(policyVersion.version, prefix + '.version');
    const versionKey = policyKey + '::' + version;
    if (seenVersionKeys.has(versionKey)) {
      throw new Error(prefix + '.version must be unique per policy_key for policy_version_library.');
    }
    seenVersionKeys.add(versionKey);

    const effectiveFrom = requireTimestamp(policyVersion.effective_from, prefix + '.effective_from');
    const effectiveTo = policyVersion.effective_to === undefined ? undefined : requireTimestamp(policyVersion.effective_to, prefix + '.effective_to');
    if (effectiveTo !== undefined && Date.parse(effectiveTo) <= Date.parse(effectiveFrom)) {
      throw new Error(prefix + '.effective_to must be after effective_from for policy_version_library.');
    }
    if (!Array.isArray(policyVersion.evidence_refs) || policyVersion.evidence_refs.length === 0) {
      throw new Error(prefix + '.evidence_refs must contain at least one evidence reference for policy_version_library.');
    }

    return {
      policy_key: policyKey,
      policy_title: requireNonEmpty(policyVersion.policy_title, prefix + '.policy_title'),
      category: requireCategory(policyVersion.category, prefix + '.category'),
      version,
      status: requireStatus(policyVersion.status, prefix + '.status'),
      effective_from: effectiveFrom,
      ...(effectiveTo === undefined ? {} : { effective_to: effectiveTo }),
      ...(policyVersion.supersedes_version === undefined ? {} : { supersedes_version: requireNonEmpty(policyVersion.supersedes_version, prefix + '.supersedes_version') }),
      policy_hash: requireNonEmpty(policyVersion.policy_hash, prefix + '.policy_hash'),
      evidence_refs: policyVersion.evidence_refs.map((ref: string, refIndex: number) => requireNonEmpty(ref, prefix + '.evidence_refs[' + refIndex + ']')),
    };
  });
}

function isEffectiveVersion(policyVersion: NormalizedPolicyVersion, effectiveAtMs: number): boolean {
  if (policyVersion.status !== "ACTIVE") {
    return false;
  }
  const startsAt = Date.parse(policyVersion.effective_from);
  const endsAt = policyVersion.effective_to === undefined ? Number.POSITIVE_INFINITY : Date.parse(policyVersion.effective_to);
  return startsAt <= effectiveAtMs && effectiveAtMs < endsAt;
}

function buildSelection(policyKey: string, policyVersions: readonly NormalizedPolicyVersion[], effectiveAtMs: number): PolicyVersionSelection {
  const effectiveVersions = policyVersions
    .filter((policyVersion) => policyVersion.policy_key === policyKey && isEffectiveVersion(policyVersion, effectiveAtMs))
    .sort((a, b) => Date.parse(a.effective_from) - Date.parse(b.effective_from) || a.version.localeCompare(b.version));

  if (effectiveVersions.length === 0) {
    return {
      policy_key: policyKey,
      selected_version: null,
      selected_policy_hash: null,
      category: null,
      status: "MISSING",
      effective_version_count: 0,
      evidence_refs: [],
      conflict_versions: [],
    };
  }

  if (effectiveVersions.length > 1) {
    return {
      policy_key: policyKey,
      selected_version: null,
      selected_policy_hash: null,
      category: effectiveVersions[0].category,
      status: "CONFLICT",
      effective_version_count: effectiveVersions.length,
      evidence_refs: effectiveVersions.flatMap((policyVersion) => policyVersion.evidence_refs),
      conflict_versions: effectiveVersions.map((policyVersion) => policyVersion.version),
    };
  }

  const selected = effectiveVersions[0];
  return {
    policy_key: policyKey,
    selected_version: selected.version,
    selected_policy_hash: selected.policy_hash,
    category: selected.category,
    status: "SELECTED",
    effective_version_count: 1,
    evidence_refs: selected.evidence_refs,
    conflict_versions: [],
  };
}

export function evaluatePolicyVersionLibrary(input: PolicyVersionLibraryInput): PolicyVersionLibraryReceipt {
  rejectForbiddenMutation(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const libraryRef = requireNonEmpty(input.library_ref, 'library_ref');
  const effectiveAt = requireTimestamp(input.effective_at, 'effective_at');
  const evaluatedByUserId = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');

  if (!Array.isArray(input.requested_policy_keys) || input.requested_policy_keys.length === 0) {
    throw new Error('requested_policy_keys must contain at least one policy key for policy_version_library.');
  }
  const requestedPolicyKeys = input.requested_policy_keys.map((policyKey, index) => requireNonEmpty(policyKey, 'requested_policy_keys[' + index + ']'));
  const uniqueRequestedPolicyKeys = Array.from(new Set(requestedPolicyKeys));
  const policyVersions = normalizePolicyVersions(input.policy_versions);
  const selections = uniqueRequestedPolicyKeys.map((policyKey) => buildSelection(policyKey, policyVersions, Date.parse(effectiveAt)));
  const selectedPolicyCount = selections.filter((selection) => selection.status === "SELECTED").length;
  const missingPolicyCount = selections.filter((selection) => selection.status === "MISSING").length;
  const conflictPolicyCount = selections.filter((selection) => selection.status === "CONFLICT").length;
  const decision: PolicyVersionLibraryDecision = selectedPolicyCount === selections.length
    ? "POLICY_VERSION_LIBRARY_READY"
    : selectedPolicyCount > 0 && conflictPolicyCount === 0
      ? "POLICY_VERSION_LIBRARY_PARTIAL"
      : "POLICY_VERSION_LIBRARY_REQUIRES_REVIEW";

  const receiptWithoutDigest: ReceiptWithoutDigest = {
    seed_id: PHASE_6C_POLICY_VERSION_LIBRARY_SEED_ID,
    component_id: PHASE_6C_POLICY_VERSION_LIBRARY_COMPONENT_ID,
    component_slug: "hr_performance_commission_policy_and_offboarding",
    model_name: "Phase6CPolicyVersionLibrary",
    event_name: POLICY_VERSION_LIBRARY_EVALUATED_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    library_ref: libraryRef,
    effective_at: effectiveAt,
    requested_policy_count: uniqueRequestedPolicyKeys.length,
    selected_policy_count: selectedPolicyCount,
    missing_policy_count: missingPolicyCount,
    conflict_policy_count: conflictPolicyCount,
    decision,
    selections,
    policy_mutation_allowed: false,
    schema_mutation_allowed: false,
    phase_6a_mutation_allowed: false,
    phase_6b_mutation_allowed: false,
    runtime_adapter_allowed: false,
    ticket_flag_flip_allowed: false,
    decision_refs: DECISION_REFS,
    control_metadata: input.control_metadata ?? {},
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    evaluated_by_user_id: evaluatedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    policy_library_digest: digestReceipt(receiptWithoutDigest),
  };
}
