import { createHash } from 'node:crypto';

const SEED_ID = 'seed_6c_020_offer_document_generation' as const;
const COMPONENT_ID = '6C.02' as const;
const EVENT_NAME = 'phase_6c.hr_recruitment_and_onboarding_pipeline.offer_document_generation.request_ready' as const;

type OfferDocumentFormat = 'PDF' | 'DOCX';

interface OfferDocumentVariable {
  readonly variable_code: string;
  readonly value: string;
  readonly redacted_in_audit?: boolean;
}

interface OfferDocumentGenerationInput {
  readonly organization_id: string;
  readonly service_manifest_contract_id: string;
  readonly source_record_ref: string;
  readonly applicant_ref: string;
  readonly offer_ref: string;
  readonly template_ref: string;
  readonly template_version: string;
  readonly language_code: string;
  readonly output_format: OfferDocumentFormat;
  readonly file_service_ref: string;
  readonly requested_by_user_id: string;
  readonly requested_at: string;
  readonly variables: readonly OfferDocumentVariable[];
  readonly control_metadata?: Readonly<Record<string, string>>;
  readonly local_file_write_requested?: boolean;
  readonly direct_file_service_mutation_requested?: boolean;
  readonly non_6a_file_service_requested?: boolean;
  readonly schema_mutation_requested?: boolean;
  readonly phase_6a_mutation_requested?: boolean;
  readonly phase_6b_mutation_requested?: boolean;
  readonly runtime_adapter_requested?: boolean;
  readonly ticket_flag_flip_requested?: boolean;
}

interface OfferDocumentGenerationReceipt {
  readonly seed_id: typeof SEED_ID;
  readonly component_id: typeof COMPONENT_ID;
  readonly event_name: typeof EVENT_NAME;
  readonly runtime_status: 'OFFER_DOCUMENT_6A_FILE_SERVICE_REQUEST_READY';
  readonly organization_id: string;
  readonly service_manifest_contract_id: string;
  readonly file_service_ref: string;
  readonly file_service_only: true;
  readonly direct_file_mutation_allowed: false;
  readonly local_file_write_allowed: false;
  readonly non_6a_file_service_allowed: false;
  readonly schema_mutation_allowed: false;
  readonly phase_6a_mutation_allowed: false;
  readonly phase_6b_mutation_allowed: false;
  readonly ticket_flag_flip_allowed: false;
  readonly generation_payload: {
    readonly source_record_ref: string;
    readonly applicant_ref: string;
    readonly offer_ref: string;
    readonly template_ref: string;
    readonly template_version: string;
    readonly output_format: OfferDocumentFormat;
    readonly language_code: string;
    readonly variable_codes: readonly string[];
  };
  readonly variable_count: number;
  readonly redacted_variable_count: number;
  readonly evidence_artifacts: readonly string[];
  readonly decision_refs: readonly string[];
  readonly receipt_digest: string;
}

const DECISION_REFS = ['6C-RECRUIT-012', '6C-GLOBAL-018'] as const;
const EVIDENCE_ARTIFACTS = [
  'phase_6c_offer_document_generation_request',
  'phase_6c_offer_document_6a_file_service_payload',
  'phase_6c_offer_document_generation_receipt',
] as const;
const SUPPORTED_FORMATS = new Set<OfferDocumentFormat>(['PDF', 'DOCX']);

export class Phase6cOfferDocumentGenerationService {
  prepareOfferDocumentGeneration(input: OfferDocumentGenerationInput): OfferDocumentGenerationReceipt {
    this.assertNoForbiddenAdjacentBehavior(input);
    this.assertRequiredText(input.organization_id, 'organization_id');
    this.assertRequiredText(input.service_manifest_contract_id, 'service_manifest_contract_id');
    this.assertRequiredText(input.source_record_ref, 'source_record_ref');
    this.assertRequiredText(input.applicant_ref, 'applicant_ref');
    this.assertRequiredText(input.offer_ref, 'offer_ref');
    this.assertRequiredText(input.template_ref, 'template_ref');
    this.assertRequiredText(input.template_version, 'template_version');
    this.assertRequiredText(input.language_code, 'language_code');
    this.assertRequiredText(input.file_service_ref, 'file_service_ref');
    this.assertRequiredText(input.requested_by_user_id, 'requested_by_user_id');
    this.assertIsoDateTime(input.requested_at, 'requested_at');

    if (!input.service_manifest_contract_id.startsWith('smc:')) {
      throw new Error('service_manifest_contract_id must reference the 6A service manifest contract with smc: prefix');
    }
    if (!input.template_ref.startsWith('offer_template:')) {
      throw new Error('template_ref must use the offer_template: prefix');
    }
    if (!input.file_service_ref.startsWith('6a_file_service:')) {
      throw new Error('file_service_ref must reference the approved 6A file service with 6a_file_service: prefix');
    }
    if (!SUPPORTED_FORMATS.has(input.output_format)) {
      throw new Error(`unsupported offer document format: ${input.output_format}`);
    }
    if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(input.language_code)) {
      throw new Error('language_code must be an ISO-like language code such as en or en-US');
    }

    const variableCodes = this.normalizeVariables(input.variables);
    const redactedVariableCount = input.variables.filter((variable) => variable.redacted_in_audit === true).length;
    const payload = {
      source_record_ref: input.source_record_ref.trim(),
      applicant_ref: input.applicant_ref.trim(),
      offer_ref: input.offer_ref.trim(),
      template_ref: input.template_ref.trim(),
      template_version: input.template_version.trim(),
      output_format: input.output_format,
      language_code: input.language_code.trim(),
      variable_codes: variableCodes,
    } as const;

    return {
      seed_id: SEED_ID,
      component_id: COMPONENT_ID,
      event_name: EVENT_NAME,
      runtime_status: 'OFFER_DOCUMENT_6A_FILE_SERVICE_REQUEST_READY',
      organization_id: input.organization_id.trim(),
      service_manifest_contract_id: input.service_manifest_contract_id.trim(),
      file_service_ref: input.file_service_ref.trim(),
      file_service_only: true,
      direct_file_mutation_allowed: false,
      local_file_write_allowed: false,
      non_6a_file_service_allowed: false,
      schema_mutation_allowed: false,
      phase_6a_mutation_allowed: false,
      phase_6b_mutation_allowed: false,
      ticket_flag_flip_allowed: false,
      generation_payload: payload,
      variable_count: variableCodes.length,
      redacted_variable_count: redactedVariableCount,
      evidence_artifacts: EVIDENCE_ARTIFACTS,
      decision_refs: DECISION_REFS,
      receipt_digest: this.digest({
        seed_id: SEED_ID,
        organization_id: input.organization_id.trim(),
        service_manifest_contract_id: input.service_manifest_contract_id.trim(),
        file_service_ref: input.file_service_ref.trim(),
        requested_at: input.requested_at,
        payload,
        redacted_variable_count: redactedVariableCount,
      }),
    };
  }

  private normalizeVariables(variables: readonly OfferDocumentVariable[]): readonly string[] {
    if (!Array.isArray(variables) || variables.length === 0) {
      throw new Error('at least one offer document variable is required');
    }

    const seen = new Set<string>();
    const normalized: string[] = [];
    for (const variable of variables) {
      this.assertRequiredText(variable.variable_code, 'variable.variable_code');
      this.assertRequiredText(variable.value, `variable ${variable.variable_code} value`);
      const code = variable.variable_code.trim();
      if (!/^[a-z][a-z0-9_]*$/.test(code)) {
        throw new Error(`variable_code must be lower_snake_case: ${code}`);
      }
      if (seen.has(code)) {
        throw new Error(`duplicate offer document variable_code: ${code}`);
      }
      seen.add(code);
      normalized.push(code);
    }
    return normalized.sort();
  }

  private assertNoForbiddenAdjacentBehavior(input: OfferDocumentGenerationInput): void {
    const forbiddenFlags: Array<[keyof OfferDocumentGenerationInput, string]> = [
      ['local_file_write_requested', 'local file writes are forbidden; route through the 6A file service request payload'],
      ['direct_file_service_mutation_requested', 'direct 6A file service mutation is forbidden in this FFET'],
      ['non_6a_file_service_requested', 'non-6A file service generation is forbidden'],
      ['schema_mutation_requested', 'schema mutation is forbidden in this runtime FFET'],
      ['phase_6a_mutation_requested', 'Phase 6A runtime mutation is forbidden from this Phase 6C FFET'],
      ['phase_6b_mutation_requested', 'Phase 6B runtime mutation is forbidden from this Phase 6C FFET'],
      ['runtime_adapter_requested', 'external runtime adapter execution is forbidden from this FFET'],
      ['ticket_flag_flip_requested', 'ticket and execution flag flips remain human-only and forbidden here'],
    ];
    for (const [flag, message] of forbiddenFlags) {
      if (input[flag] === true) {
        throw new Error(message);
      }
    }
  }

  private assertRequiredText(value: string, fieldName: string): void {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(`${fieldName} is required`);
    }
  }

  private assertIsoDateTime(value: string, fieldName: string): void {
    this.assertRequiredText(value, fieldName);
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) {
      throw new Error(`${fieldName} must be an ISO date-time`);
    }
  }

  private digest(value: unknown): string {
    return createHash('sha256').update(JSON.stringify(value)).digest('hex');
  }
}

export type { OfferDocumentGenerationInput, OfferDocumentGenerationReceipt, OfferDocumentVariable };
