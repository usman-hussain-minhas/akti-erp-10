export const PHASE_6C_MESSAGE_ATTACHMENT_FILE_REF_SEED_ID = "seed_6c_061_message_attachment_file_ref" as const;
export const PHASE_6C_MESSAGE_ATTACHMENT_FILE_REF_COMPONENT_ID = "6C.05" as const;
export const MESSAGE_ATTACHMENT_FILE_REF_EVALUATED_EVENT =
  "phase_6c.workspace_messaging_and_collaboration.message_attachment_file_ref.evaluated" as const;

export type MessageAttachmentKind =
  | "IMAGE"
  | "DOCUMENT"
  | "SPREADSHEET"
  | "PDF"
  | "ARCHIVE"
  | "OTHER";

export type MessageAttachmentClassification = "NORMAL" | "SENSITIVE" | "RESTRICTED";
export type MessageAttachmentScanStatus = "CLEAN" | "PENDING" | "FAILED";
export type MessageAttachmentDecision =
  | "ATTACHMENTS_READY"
  | "ATTACHMENTS_REQUIRES_REVIEW"
  | "ATTACHMENTS_BLOCKED";

export type MessageAttachmentFileRef = {
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

export type PreparedMessageAttachmentFileRef = {
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
  seed_id: typeof PHASE_6C_MESSAGE_ATTACHMENT_FILE_REF_SEED_ID;
  component_id: typeof PHASE_6C_MESSAGE_ATTACHMENT_FILE_REF_COMPONENT_ID;
  event_name: typeof MESSAGE_ATTACHMENT_FILE_REF_EVALUATED_EVENT;
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
