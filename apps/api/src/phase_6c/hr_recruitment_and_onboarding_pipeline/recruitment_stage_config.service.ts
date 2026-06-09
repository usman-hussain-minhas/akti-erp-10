import { createHash } from 'node:crypto';

export const PHASE_6C_RECRUITMENT_STAGE_CONFIG_SEED_ID = "seed_6c_012_recruitment_stage_config" as const;
export const PHASE_6C_RECRUITMENT_STAGE_CONFIG_COMPONENT_ID = "6C.02" as const;
export const RECRUITMENT_STAGE_CONFIG_EVENT = "phase_6c.hr_recruitment_and_onboarding_pipeline.recruitment_stage_config.runtime_evaluated" as const;

export type RecruitmentStageKind = 'ENTRY' | 'INTERMEDIATE' | 'TERMINAL';
export type RecruitmentStageOutcome = 'CONTINUE' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';

export type RecruitmentStageDefinition = {
  stage_code: string;
  stage_label: string;
  stage_order: number;
  stage_kind: RecruitmentStageKind;
  terminal_outcome?: RecruitmentStageOutcome;
  allowed_next_stage_codes: readonly string[];
  active: boolean;
};

export type RecruitmentStageConfigRuntimeInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  stages: readonly RecruitmentStageDefinition[];
  control_metadata?: Record<string, unknown>;
  hardcoded_stage_names_requested?: boolean;
  crm_stage_mutation_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type RecruitmentStageConfigReceipt = {
  seed_id: typeof PHASE_6C_RECRUITMENT_STAGE_CONFIG_SEED_ID;
  component_id: typeof PHASE_6C_RECRUITMENT_STAGE_CONFIG_COMPONENT_ID;
  component_slug: "hr_recruitment_and_onboarding_pipeline";
  model_name: "Phase6CRecruitmentStageConfig";
  event_name: typeof RECRUITMENT_STAGE_CONFIG_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: 'RECRUITMENT_STAGE_CONFIG_VALIDATED';
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  fully_configurable_stages: true;
  crm_stage_mutation_allowed: false;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  stages: readonly RecruitmentStageDefinition[];
  stage_counts: {
    total_stages: number;
    active_stages: number;
    entry_stages: number;
    terminal_stages: number;
  };
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for recruitment_stage_config runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for recruitment_stage_config runtime.');
  }
  return normalized;
}

function requireStageKind(value: RecruitmentStageKind): RecruitmentStageKind {
  if (value !== 'ENTRY' && value !== 'INTERMEDIATE' && value !== 'TERMINAL') {
    throw new Error('stage_kind must be ENTRY, INTERMEDIATE, or TERMINAL for recruitment_stage_config runtime.');
  }
  return value;
}

function requireOutcome(value: RecruitmentStageOutcome | undefined, kind: RecruitmentStageKind): RecruitmentStageOutcome | undefined {
  if (kind === 'TERMINAL') {
    if (value !== 'HIRED' && value !== 'REJECTED' && value !== 'WITHDRAWN') {
      throw new Error('TERMINAL recruitment stages require a terminal outcome for recruitment_stage_config runtime.');
    }
    return value;
  }
  if (value !== undefined && value !== 'CONTINUE') {
    throw new Error('non-terminal recruitment stages must not carry terminal outcomes for recruitment_stage_config runtime.');
  }
  return value;
}

function requirePositiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(field + ' must be a positive integer for recruitment_stage_config runtime.');
  }
  return value;
}

function assertUnique(values: readonly string[], field: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(field + ' must be unique for recruitment_stage_config runtime: ' + value);
    }
    seen.add(value);
  }
}

function digestRuntime(receiptWithoutDigest: Omit<RecruitmentStageConfigReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateRecruitmentStageConfigRuntime(input: RecruitmentStageConfigRuntimeInput): RecruitmentStageConfigReceipt {
  if (input.hardcoded_stage_names_requested === true) {
    throw new Error('recruitment_stage_config runtime must not force hardcoded stage names.');
  }
  if (input.crm_stage_mutation_requested === true) {
    throw new Error('recruitment_stage_config runtime must not mutate CRM pipeline stages.');
  }
  if (input.schema_mutation_requested === true) {
    throw new Error('recruitment_stage_config runtime must not mutate Prisma schema.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('recruitment_stage_config runtime must not mutate Phase 6A identity records.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('recruitment_stage_config runtime must not mutate Phase 6B records.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('recruitment_stage_config runtime must not execute external runtime adapters.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('recruitment_stage_config runtime must not flip ticket authorization flags.');
  }

  const stages = input.stages.map((stage) => {
    const stageKind = requireStageKind(stage.stage_kind);
    return {
      stage_code: requireNonEmpty(stage.stage_code, 'stage_code'),
      stage_label: requireNonEmpty(stage.stage_label, 'stage_label'),
      stage_order: requirePositiveInteger(stage.stage_order, 'stage_order'),
      stage_kind: stageKind,
      terminal_outcome: requireOutcome(stage.terminal_outcome, stageKind),
      allowed_next_stage_codes: [...stage.allowed_next_stage_codes].map((code) => requireNonEmpty(code, 'allowed_next_stage_code')).sort(),
      active: stage.active === true,
    };
  }).sort((left, right) => left.stage_order - right.stage_order || left.stage_code.localeCompare(right.stage_code));
  assertUnique(stages.map((stage) => stage.stage_code), 'stage_code');
  assertUnique(stages.map((stage) => String(stage.stage_order)), 'stage_order');
  assertUnique(stages.map((stage) => stage.stage_label.toLocaleLowerCase()), 'stage_label');

  const stageCodes = new Set(stages.map((stage) => stage.stage_code));
  for (const stage of stages) {
    if (stage.stage_kind === 'TERMINAL' && stage.allowed_next_stage_codes.length > 0) {
      throw new Error('TERMINAL recruitment stages must not have next stages for recruitment_stage_config runtime.');
    }
    if (stage.stage_kind !== 'TERMINAL' && stage.allowed_next_stage_codes.length === 0) {
      throw new Error('non-terminal recruitment stages require at least one next stage for recruitment_stage_config runtime.');
    }
    for (const nextStageCode of stage.allowed_next_stage_codes) {
      if (!stageCodes.has(nextStageCode)) {
        throw new Error('allowed_next_stage_code must reference an existing stage for recruitment_stage_config runtime: ' + nextStageCode);
      }
      if (nextStageCode === stage.stage_code) {
        throw new Error('recruitment stages must not transition to themselves for recruitment_stage_config runtime: ' + stage.stage_code);
      }
    }
  }
  if (stages.filter((stage) => stage.stage_kind === 'ENTRY').length !== 1) {
    throw new Error('recruitment_stage_config runtime requires exactly one ENTRY stage.');
  }
  if (stages.filter((stage) => stage.stage_kind === 'TERMINAL').length < 1) {
    throw new Error('recruitment_stage_config runtime requires at least one TERMINAL stage.');
  }

  const receiptWithoutDigest: Omit<RecruitmentStageConfigReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_RECRUITMENT_STAGE_CONFIG_SEED_ID,
    component_id: PHASE_6C_RECRUITMENT_STAGE_CONFIG_COMPONENT_ID,
    component_slug: "hr_recruitment_and_onboarding_pipeline",
    model_name: "Phase6CRecruitmentStageConfig",
    event_name: RECRUITMENT_STAGE_CONFIG_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    runtime_status: 'RECRUITMENT_STAGE_CONFIG_VALIDATED',
    capability_implementation_allowed: true,
    business_behavior_allowed: true,
    fully_configurable_stages: true,
    crm_stage_mutation_allowed: false,
    runtime_adapter_allowed: false,
    decision_refs: ["6C-RECRUIT-003", "6C-SCHEMA-006", "6C-NON-007"],
    stages,
    stage_counts: {
      total_stages: stages.length,
      active_stages: stages.filter((stage) => stage.active).length,
      entry_stages: stages.filter((stage) => stage.stage_kind === 'ENTRY').length,
      terminal_stages: stages.filter((stage) => stage.stage_kind === 'TERMINAL').length,
    },
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestRuntime(receiptWithoutDigest),
  };
}
