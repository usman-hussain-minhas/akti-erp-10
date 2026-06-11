import { createHash } from "crypto";

type MessageAttachmentKind = "IMAGE" | "DOCUMENT" | "SPREADSHEET" | "PDF" | "ARCHIVE" | "OTHER";
type MessageAttachmentClassification = "NORMAL" | "SENSITIVE" | "RESTRICTED";
type MessageAttachmentScanStatus = "CLEAN" | "PENDING" | "FAILED";
type MessageAttachmentDecision =
  | "ATTACHMENTS_READY"
  | "ATTACHMENTS_REQUIRES_REVIEW"
  | "ATTACHMENTS_BLOCKED";

type MessageAttachmentFileRef = {
  attachment_ref: string;
  file_ref: string;
  file_name: string;
  mime_type: string;
  byte_size: number;
  sha256: string;
  kind: MessageAttachmentKind;
  classification: MessageAttachmentClassification;
  scan_status: MessageAttachmentScanStatus;
  uploaded_by_user_ref: string;
  approval_ref?: string;
  evidence_refs: string[];
};

export type MessageAttachmentFileRefInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  conversation_ref: string;
  message_ref: string;
  actor_user_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  approval_ref?: string;
  attachments: MessageAttachmentFileRef[];
  file_upload_requested?: boolean;
  file_mutation_requested?: boolean;
  download_proxy_requested?: boolean;
  notification_send_requested?: boolean;
  event_dispatch_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

type PreparedMessageAttachmentFileRef = {
  attachment_ref: string;
  file_ref: string;
  file_name: string;
  mime_type: string;
  byte_size: number;
  sha256: string;
  kind: MessageAttachmentKind;
  classification: MessageAttachmentClassification;
  scan_status: MessageAttachmentScanStatus;
  uploaded_by_user_ref: string;
  approved: boolean;
  evidence_refs: string[];
};

export type MessageAttachmentFileRefReceipt = {
  seed_id: "seed_6c_061_message_attachment_file_ref";
  component_id: "6C.05";
  event_name: "phase_6c.workspace_messaging_and_collaboration.message_attachment_file_ref.evaluated";
  organization_id: string;
  source_record_ref: string;
  conversation_ref: string;
  message_ref: string;
  decision: MessageAttachmentDecision;
  attachment_count: number;
  total_byte_size: number;
  prepared_attachments: PreparedMessageAttachmentFileRef[];
  blockers: string[];
  review_reasons: string[];
  mutation_performed: false;
  file_upload_performed: false;
  download_proxy_performed: false;
  notification_send_performed: false;
  event_dispatch_performed: false;
  schema_mutation_performed: false;
  phase_6a_mutation_performed: false;
  phase_6b_mutation_performed: false;
  runtime_adapter_performed: false;
  ticket_flag_flip_performed: false;
  decision_refs: readonly ["6C-WORK-MSG-006", "6C-GLOBAL-018"];
  evidence_artifacts: string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  deterministic_digest: string;
};

const SEED_ID = "seed_6c_061_message_attachment_file_ref" as const;
const COMPONENT_ID = "6C.05" as const;
const EVENT_NAME =
  "phase_6c.workspace_messaging_and_collaboration.message_attachment_file_ref.evaluated" as const;
const DECISION_REFS = ["6C-WORK-MSG-006", "6C-GLOBAL-018"] as const;

const ATTACHMENT_KINDS = new Set<MessageAttachmentKind>([
  "IMAGE",
  "DOCUMENT",
  "SPREADSHEET",
  "PDF",
  "ARCHIVE",
  "OTHER",
]);
const CLASSIFICATIONS = new Set<MessageAttachmentClassification>(["NORMAL", "SENSITIVE", "RESTRICTED"]);
const SCAN_STATUSES = new Set<MessageAttachmentScanStatus>(["CLEAN", "PENDING", "FAILED"]);
const HEX_256 = /^[a-f0-9]{64}$/i;

export function evaluateMessageAttachmentFileRef(
  input: MessageAttachmentFileRefInput,
): MessageAttachmentFileRefReceipt {
  assertNoForbiddenRuntimeRequest(input);
  const requiredFields: Array<keyof MessageAttachmentFileRefInput> = [
    "organization_id",
    "service_manifest_contract_id",
    "source_record_ref",
    "conversation_ref",
    "message_ref",
    "actor_user_ref",
    "evaluated_by_user_id",
    "evaluated_at",
  ];
  for (const field of requiredFields) {
    assertNonEmptyString(input[field], field);
  }
  if (!Number.isNaN(Date.parse(input.evaluated_at)) === false) {
    throw new Error("evaluated_at must be an ISO-compatible timestamp");
  }
  if (!Array.isArray(input.attachments) || input.attachments.length === 0) {
    throw new Error("attachments must contain at least one existing file reference");
  }

  const blockers: string[] = [];
  const reviewReasons: string[] = [];
  const preparedAttachments = input.attachments.map((attachment, index) => {
    validateAttachment(attachment, index);
    const hasApproval = Boolean(attachment.approval_ref || input.approval_ref);
    if (attachment.scan_status === "FAILED") {
      blockers.push(`attachment_${index + 1}_scan_failed`);
    }
    if (attachment.scan_status === "PENDING") {
      reviewReasons.push(`attachment_${index + 1}_scan_pending`);
    }
    if (attachment.classification !== "NORMAL" && !hasApproval) {
      reviewReasons.push(`attachment_${index + 1}_classification_requires_approval`);
    }
    return {
      attachment_ref: attachment.attachment_ref.trim(),
      file_ref: attachment.file_ref.trim(),
      file_name: attachment.file_name.trim(),
      mime_type: attachment.mime_type.trim().toLowerCase(),
      byte_size: attachment.byte_size,
      sha256: attachment.sha256.toLowerCase(),
      kind: attachment.kind,
      classification: attachment.classification,
      scan_status: attachment.scan_status,
      uploaded_by_user_ref: attachment.uploaded_by_user_ref.trim(),
      approved: hasApproval,
      evidence_refs: dedupeStrings(attachment.evidence_refs),
    } satisfies PreparedMessageAttachmentFileRef;
  });

  const totalByteSize = preparedAttachments.reduce((sum, attachment) => sum + attachment.byte_size, 0);
  const decision = decide(blockers, reviewReasons);
  const evidenceArtifacts = [
    `${SEED_ID}:conversation:${input.conversation_ref.trim()}`,
    `${SEED_ID}:message:${input.message_ref.trim()}`,
    `${SEED_ID}:attachments:${preparedAttachments.length}`,
    ...preparedAttachments.map((attachment) => `${SEED_ID}:file_ref:${attachment.file_ref}`),
  ];

  const digestPayload = {
    organization_id: input.organization_id.trim(),
    conversation_ref: input.conversation_ref.trim(),
    message_ref: input.message_ref.trim(),
    decision,
    blockers,
    reviewReasons,
    preparedAttachments,
  };

  return {
    seed_id: SEED_ID,
    component_id: COMPONENT_ID,
    event_name: EVENT_NAME,
    organization_id: input.organization_id.trim(),
    source_record_ref: input.source_record_ref.trim(),
    conversation_ref: input.conversation_ref.trim(),
    message_ref: input.message_ref.trim(),
    decision,
    attachment_count: preparedAttachments.length,
    total_byte_size: totalByteSize,
    prepared_attachments: preparedAttachments,
    blockers,
    review_reasons: reviewReasons,
    mutation_performed: false,
    file_upload_performed: false,
    download_proxy_performed: false,
    notification_send_performed: false,
    event_dispatch_performed: false,
    schema_mutation_performed: false,
    phase_6a_mutation_performed: false,
    phase_6b_mutation_performed: false,
    runtime_adapter_performed: false,
    ticket_flag_flip_performed: false,
    decision_refs: DECISION_REFS,
    evidence_artifacts: dedupeStrings(evidenceArtifacts),
    evaluated_by_user_id: input.evaluated_by_user_id.trim(),
    evaluated_at: new Date(input.evaluated_at).toISOString(),
    deterministic_digest: digest(digestPayload),
  };
}

function validateAttachment(attachment: MessageAttachmentFileRef, index: number): void {
  const label = `attachments[${index}]`;
  assertNonEmptyString(attachment.attachment_ref, `${label}.attachment_ref`);
  assertNonEmptyString(attachment.file_ref, `${label}.file_ref`);
  assertNonEmptyString(attachment.file_name, `${label}.file_name`);
  assertNonEmptyString(attachment.mime_type, `${label}.mime_type`);
  assertNonEmptyString(attachment.uploaded_by_user_ref, `${label}.uploaded_by_user_ref`);
  if (!Number.isInteger(attachment.byte_size) || attachment.byte_size <= 0) {
    throw new Error(`${label}.byte_size must be a positive integer`);
  }
  if (!HEX_256.test(attachment.sha256)) {
    throw new Error(`${label}.sha256 must be a 64-character hex digest`);
  }
  if (!ATTACHMENT_KINDS.has(attachment.kind)) {
    throw new Error(`${label}.kind is not supported`);
  }
  if (!CLASSIFICATIONS.has(attachment.classification)) {
    throw new Error(`${label}.classification is not supported`);
  }
  if (!SCAN_STATUSES.has(attachment.scan_status)) {
    throw new Error(`${label}.scan_status is not supported`);
  }
  if (!Array.isArray(attachment.evidence_refs) || attachment.evidence_refs.length === 0) {
    throw new Error(`${label}.evidence_refs must contain at least one evidence reference`);
  }
  for (const evidenceRef of attachment.evidence_refs) {
    assertNonEmptyString(evidenceRef, `${label}.evidence_refs[]`);
  }
}

function decide(blockers: string[], reviewReasons: string[]): MessageAttachmentDecision {
  if (blockers.length > 0) {
    return "ATTACHMENTS_BLOCKED";
  }
  if (reviewReasons.length > 0) {
    return "ATTACHMENTS_REQUIRES_REVIEW";
  }
  return "ATTACHMENTS_READY";
}

function assertNoForbiddenRuntimeRequest(input: MessageAttachmentFileRefInput): void {
  const forbidden: Array<[keyof MessageAttachmentFileRefInput, string]> = [
    ["file_upload_requested", "file upload is outside this FFET"],
    ["file_mutation_requested", "file mutation is outside this FFET"],
    ["download_proxy_requested", "download proxying is outside this FFET"],
    ["notification_send_requested", "notification sending is outside this FFET"],
    ["event_dispatch_requested", "event dispatch is outside this FFET"],
    ["schema_mutation_requested", "schema mutation is outside this FFET"],
    ["phase_6a_mutation_requested", "Phase 6A mutation is outside this FFET"],
    ["phase_6b_mutation_requested", "Phase 6B mutation is outside this FFET"],
    ["runtime_adapter_requested", "runtime adapter wiring is outside this FFET"],
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
