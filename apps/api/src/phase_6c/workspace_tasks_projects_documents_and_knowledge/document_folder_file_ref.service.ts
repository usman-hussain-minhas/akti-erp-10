import { createHash } from 'node:crypto';

export const PHASE_6C_DOCUMENT_FOLDER_FILE_REF_SEED_ID = "seed_6c_077_document_folder_file_ref" as const;
export const PHASE_6C_DOCUMENT_FOLDER_FILE_REF_COMPONENT_ID = "6C.06" as const;
export const DOCUMENT_FOLDER_FILE_REF_EVALUATED_EVENT = "phase_6c.workspace_tasks_projects_documents_and_knowledge.document_folder_file_ref.evaluated" as const;

export const documentRefSources = ["6A_FILE_SERVICE"] as const;

type DocumentRefSource = (typeof documentRefSources)[number];
type DocumentFolderFileRefDecision = "DOCUMENT_REFS_READY" | "DOCUMENT_REFS_REQUIRES_REVIEW" | "DOCUMENT_REFS_REJECTED";

export type DocumentFolderRefInput = {
  folder_ref: string;
  label: string;
  parent_folder_ref?: string;
};

export type DocumentFileRefInput = {
  file_ref: string;
  file_service_ref: string;
  folder_ref: string;
  display_name: string;
  mime_type: string;
  size_bytes?: number;
  checksum_sha256?: string;
  source: DocumentRefSource;
};

export type DocumentFolderFileRefInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  workspace_ref?: string;
  project_ref?: string;
  folders: readonly DocumentFolderRefInput[];
  files: readonly DocumentFileRefInput[];
  evidence_refs?: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  file_upload_requested?: boolean;
  file_binary_read_requested?: boolean;
  storage_mutation_requested?: boolean;
  external_provider_requested?: boolean;
  runtime_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  cross_phase_write_requested?: boolean;
  frontend_publication_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedDocumentFolderRef = {
  folder_ref: string;
  label: string;
  parent_folder_ref: string | null;
};

export type NormalizedDocumentFileRef = {
  file_ref: string;
  file_service_ref: string;
  folder_ref: string;
  display_name: string;
  mime_type: string;
  size_bytes: number | null;
  checksum_sha256: string | null;
  source: DocumentRefSource;
};

export type DocumentFolderFileRefReceipt = {
  seed_id: typeof PHASE_6C_DOCUMENT_FOLDER_FILE_REF_SEED_ID;
  component_id: typeof PHASE_6C_DOCUMENT_FOLDER_FILE_REF_COMPONENT_ID;
  component_slug: "workspace_tasks_projects_documents_and_knowledge";
  model_name: "Phase6CDocumentFolderFileRef";
  event_name: typeof DOCUMENT_FOLDER_FILE_REF_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  workspace_ref: string | null;
  project_ref: string | null;
  decision: DocumentFolderFileRefDecision;
  normalized_folders: readonly NormalizedDocumentFolderRef[];
  normalized_files: readonly NormalizedDocumentFileRef[];
  evidence_artifacts: readonly string[];
  review_reasons: readonly string[];
  rejection_reasons: readonly string[];
  decision_refs: readonly string[];
  file_service_boundary: "6A_FILE_SERVICE_ONLY";
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  file_upload_performed: false;
  file_binary_read_performed: false;
  storage_mutation_performed: false;
  external_provider_called: false;
  schema_mutation_performed: false;
  cross_phase_write_performed: false;
  frontend_publication_performed: false;
  ticket_flags_changed: false;
  document_folder_file_ref_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for document_folder_file_ref.');
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
    throw new Error(field + ' must be a valid ISO-compatible timestamp for document_folder_file_ref.');
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

function digestRefs(receiptWithoutDigest: Omit<DocumentFolderFileRefReceipt, 'document_folder_file_ref_evidence_digest'>): string {
  return createHash('sha256').update(stableJson(receiptWithoutDigest)).digest('hex');
}

function assertForbiddenRequests(input: DocumentFolderFileRefInput): void {
  const forbiddenRequests: Array<[boolean | undefined, string]> = [
    [input.file_upload_requested, 'document_folder_file_ref must not upload files inside this FFET.'],
    [input.file_binary_read_requested, 'document_folder_file_ref must not read file binaries inside this FFET.'],
    [input.storage_mutation_requested, 'document_folder_file_ref must not mutate storage inside this FFET.'],
    [input.external_provider_requested, 'document_folder_file_ref must not call external providers inside this FFET.'],
    [input.runtime_adapter_requested, 'document_folder_file_ref must not execute runtime adapters inside this FFET.'],
    [input.schema_mutation_requested, 'document_folder_file_ref must not mutate schema inside this FFET.'],
    [input.cross_phase_write_requested, 'document_folder_file_ref must not write cross-phase data inside this FFET.'],
    [input.frontend_publication_requested, 'document_folder_file_ref must not publish frontend routes inside this FFET.'],
    [input.ticket_flag_flip_requested, 'document_folder_file_ref must not change ticket authorization flags.'],
  ];

  const violation = forbiddenRequests.find(([requested]) => requested === true);
  if (violation !== undefined) {
    throw new Error(violation[1]);
  }
}

function normalizeFolders(folders: readonly DocumentFolderRefInput[]): readonly NormalizedDocumentFolderRef[] {
  if (folders.length === 0) {
    throw new Error('folders must include at least one folder reference.');
  }
  const seen = new Set<string>();
  const normalized = folders.map((folder) => {
    const folderRef = requireNonEmpty(folder.folder_ref, 'folder_ref');
    if (seen.has(folderRef)) {
      throw new Error('duplicate folder_ref is not allowed for document_folder_file_ref: ' + folderRef);
    }
    seen.add(folderRef);
    return {
      folder_ref: folderRef,
      label: requireNonEmpty(folder.label, 'label'),
      parent_folder_ref: optionalText(folder.parent_folder_ref),
    };
  });
  return normalized.sort((left, right) => left.folder_ref.localeCompare(right.folder_ref));
}

function normalizeFiles(files: readonly DocumentFileRefInput[]): readonly NormalizedDocumentFileRef[] {
  if (files.length === 0) {
    throw new Error('files must include at least one 6A file service reference.');
  }
  const seen = new Set<string>();
  const normalized = files.map((file) => {
    const fileRef = requireNonEmpty(file.file_ref, 'file_ref');
    if (seen.has(fileRef)) {
      throw new Error('duplicate file_ref is not allowed for document_folder_file_ref: ' + fileRef);
    }
    seen.add(fileRef);
    return {
      file_ref: fileRef,
      file_service_ref: requireNonEmpty(file.file_service_ref, 'file_service_ref'),
      folder_ref: requireNonEmpty(file.folder_ref, 'folder_ref'),
      display_name: requireNonEmpty(file.display_name, 'display_name'),
      mime_type: requireNonEmpty(file.mime_type, 'mime_type'),
      size_bytes: file.size_bytes ?? null,
      checksum_sha256: optionalText(file.checksum_sha256),
      source: requireOneOf(requireNonEmpty(file.source, 'source'), documentRefSources, 'source'),
    };
  });
  return normalized.sort((left, right) => left.file_ref.localeCompare(right.file_ref));
}

function evaluateRefs(
  folders: readonly NormalizedDocumentFolderRef[],
  files: readonly NormalizedDocumentFileRef[],
): { review_reasons: readonly string[]; rejection_reasons: readonly string[] } {
  const reviewReasons: string[] = [];
  const rejectionReasons: string[] = [];
  const folderRefs = new Set(folders.map((folder) => folder.folder_ref));

  for (const folder of folders) {
    if (folder.parent_folder_ref !== null && !folderRefs.has(folder.parent_folder_ref)) {
      rejectionReasons.push('parent_folder_missing:' + folder.folder_ref + '->' + folder.parent_folder_ref);
    }
    if (folder.parent_folder_ref === folder.folder_ref) {
      rejectionReasons.push('folder_cannot_parent_itself:' + folder.folder_ref);
    }
  }

  for (const cycle of detectFolderCycles(folders)) {
    rejectionReasons.push('folder_cycle_detected:' + cycle);
  }

  for (const file of files) {
    if (!folderRefs.has(file.folder_ref)) {
      rejectionReasons.push('file_folder_missing:' + file.file_ref + '->' + file.folder_ref);
    }
    if (file.size_bytes !== null && (!Number.isInteger(file.size_bytes) || file.size_bytes < 0)) {
      rejectionReasons.push('size_bytes_requires_non_negative_integer:' + file.file_ref);
    }
    if (file.checksum_sha256 !== null && !/^[a-f0-9]{64}$/.test(file.checksum_sha256)) {
      reviewReasons.push('checksum_sha256_not_canonical:' + file.file_ref);
    }
    if (!file.mime_type.includes('/')) {
      reviewReasons.push('mime_type_not_structured:' + file.file_ref);
    }
  }

  return {
    review_reasons: Array.from(new Set(reviewReasons)).sort(),
    rejection_reasons: Array.from(new Set(rejectionReasons)).sort(),
  };
}

function detectFolderCycles(folders: readonly NormalizedDocumentFolderRef[]): readonly string[] {
  const parentByFolder = new Map(folders.map((folder) => [folder.folder_ref, folder.parent_folder_ref] as const));
  const cycles = new Set<string>();

  for (const folder of folders) {
    const path: string[] = [];
    let cursor: string | null = folder.folder_ref;
    while (cursor !== null) {
      if (path.includes(cursor)) {
        const start = path.indexOf(cursor);
        cycles.add(canonicalCyclePath(path.slice(start)));
        break;
      }
      path.push(cursor);
      cursor = parentByFolder.get(cursor) ?? null;
    }
  }

  return Array.from(cycles).sort();
}

function canonicalCyclePath(cycleNodes: readonly string[]): string {
  const rotations = cycleNodes.map((_, index) => cycleNodes.slice(index).concat(cycleNodes.slice(0, index)));
  const canonical = rotations
    .map((rotation) => rotation.concat(rotation[0]).join('->'))
    .sort()[0];
  return canonical;
}

export function evaluateDocumentFolderFileRef(input: DocumentFolderFileRefInput): DocumentFolderFileRefReceipt {
  assertForbiddenRequests(input);

  const normalizedFolders = normalizeFolders(input.folders);
  const normalizedFiles = normalizeFiles(input.files);
  const evaluation = evaluateRefs(normalizedFolders, normalizedFiles);
  const evidenceArtifacts = normalizeList(input.evidence_refs, 'evidence_refs');
  const decision: DocumentFolderFileRefDecision = evaluation.rejection_reasons.length > 0
    ? 'DOCUMENT_REFS_REJECTED'
    : evaluation.review_reasons.length > 0
      ? 'DOCUMENT_REFS_REQUIRES_REVIEW'
      : 'DOCUMENT_REFS_READY';

  const receiptWithoutDigest: Omit<DocumentFolderFileRefReceipt, 'document_folder_file_ref_evidence_digest'> = {
    seed_id: PHASE_6C_DOCUMENT_FOLDER_FILE_REF_SEED_ID,
    component_id: PHASE_6C_DOCUMENT_FOLDER_FILE_REF_COMPONENT_ID,
    component_slug: "workspace_tasks_projects_documents_and_knowledge",
    model_name: "Phase6CDocumentFolderFileRef",
    event_name: DOCUMENT_FOLDER_FILE_REF_EVALUATED_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    workspace_ref: optionalText(input.workspace_ref),
    project_ref: optionalText(input.project_ref),
    decision,
    normalized_folders: normalizedFolders,
    normalized_files: normalizedFiles,
    evidence_artifacts: evidenceArtifacts,
    review_reasons: evaluation.review_reasons,
    rejection_reasons: evaluation.rejection_reasons,
    decision_refs: ["6C-WORK-TASK-009"],
    file_service_boundary: "6A_FILE_SERVICE_ONLY",
    capability_implementation_allowed: true,
    business_behavior_allowed: true,
    runtime_adapter_allowed: false,
    file_upload_performed: false,
    file_binary_read_performed: false,
    storage_mutation_performed: false,
    external_provider_called: false,
    schema_mutation_performed: false,
    cross_phase_write_performed: false,
    frontend_publication_performed: false,
    ticket_flags_changed: false,
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    document_folder_file_ref_evidence_digest: digestRefs(receiptWithoutDigest),
  };
}
