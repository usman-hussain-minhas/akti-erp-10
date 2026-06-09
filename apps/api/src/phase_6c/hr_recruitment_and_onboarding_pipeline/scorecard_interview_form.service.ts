import { createHash } from 'node:crypto';

export const PHASE_6C_SCORECARD_INTERVIEW_FORM_SEED_ID = 'seed_6c_013_scorecard_interview_form' as const;
export const PHASE_6C_SCORECARD_INTERVIEW_FORM_COMPONENT_ID = '6C.02' as const;
export const SCORECARD_INTERVIEW_FORM_RUNTIME_EVENT = 'phase_6c.hr_recruitment_and_onboarding_pipeline.scorecard_interview_form.configuration_validated' as const;

export type ScorecardInterviewQuestionType = 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'SINGLE_SELECT' | 'MULTI_SELECT' | 'RATING' | 'DATE';
export type ScorecardInterviewOutcome = 'ADVANCE' | 'HOLD' | 'REJECT' | 'MANUAL_REVIEW';
export type ScorecardInterviewCandidateSource = 'DIRECT_FORM' | 'CRM_LINKED';

export type ScorecardInterviewQuestionOption = {
  option_code: string;
  label: string;
  score_value?: number;
};

export type ScorecardInterviewQuestionConfig = {
  question_code: string;
  label: string;
  question_type: ScorecardInterviewQuestionType;
  required: boolean;
  weight: number;
  max_score?: number;
  competency_code?: string;
  evidence_required?: boolean;
  options?: readonly ScorecardInterviewQuestionOption[];
};

export type ScorecardInterviewSectionConfig = {
  section_code: string;
  label: string;
  order: number;
  weight: number;
  questions: readonly ScorecardInterviewQuestionConfig[];
};

export type ScorecardInterviewScoreBand = {
  band_code: string;
  label: string;
  min_score: number;
  max_score: number;
  outcome: ScorecardInterviewOutcome;
};

export type ScorecardInterviewFormRuntimeInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  configuration_engine_form_ref: string;
  form_code: string;
  form_label: string;
  form_version: string;
  interview_stage_code: string;
  candidate_source: ScorecardInterviewCandidateSource;
  crm_lead_ref?: string;
  configured_by_user_id: string;
  evaluated_at: string;
  sections: readonly ScorecardInterviewSectionConfig[];
  score_bands: readonly ScorecardInterviewScoreBand[];
  control_metadata?: Record<string, unknown>;
  hardcoded_form_requested?: boolean;
  schema_mutation_requested?: boolean;
  crm_stage_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type ScorecardInterviewNormalizedQuestion = {
  question_code: string;
  question_type: ScorecardInterviewQuestionType;
  weight: number;
  max_score: number;
  weighted_available_score: number;
  competency_code?: string;
  evidence_required: boolean;
};

export type ScorecardInterviewNormalizedSection = {
  section_code: string;
  order: number;
  weight: number;
  question_count: number;
  weighted_available_score: number;
  questions: readonly ScorecardInterviewNormalizedQuestion[];
};

export type ScorecardInterviewFormRuntimeReceipt = {
  seed_id: typeof PHASE_6C_SCORECARD_INTERVIEW_FORM_SEED_ID;
  component_id: typeof PHASE_6C_SCORECARD_INTERVIEW_FORM_COMPONENT_ID;
  component_slug: 'hr_recruitment_and_onboarding_pipeline';
  model_name: 'Phase6CScorecardInterviewForm';
  event_name: typeof SCORECARD_INTERVIEW_FORM_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  configuration_engine_form_ref: string;
  form_code: string;
  form_version: string;
  interview_stage_code: string;
  candidate_source: ScorecardInterviewCandidateSource;
  crm_lead_ref?: string;
  runtime_status: 'CONFIGURATION_ENGINE_SCORECARD_READY';
  configuration_engine_required: true;
  hardcoded_form_allowed: false;
  crm_stage_mutation_allowed: false;
  schema_mutation_allowed: false;
  phase_6a_mutation_allowed: false;
  phase_6b_mutation_allowed: false;
  runtime_adapter_allowed: false;
  question_count: number;
  scored_question_count: number;
  required_question_count: number;
  section_count: number;
  score_band_count: number;
  total_available_score: number;
  normalized_sections: readonly ScorecardInterviewNormalizedSection[];
  score_bands: readonly ScorecardInterviewScoreBand[];
  decision_refs: readonly string[];
  external_dependency_conditions: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  configured_by_user_id: string;
  evaluated_at: string;
  scorecard_interview_form_evidence_digest: string;
};

type ScorecardInterviewReceiptWithoutDigest = Omit<ScorecardInterviewFormRuntimeReceipt, 'scorecard_interview_form_evidence_digest'>;

const QUESTION_TYPES = new Set<ScorecardInterviewQuestionType>(['TEXT', 'NUMBER', 'BOOLEAN', 'SINGLE_SELECT', 'MULTI_SELECT', 'RATING', 'DATE']);
const SCORE_OUTCOMES = new Set<ScorecardInterviewOutcome>(['ADVANCE', 'HOLD', 'REJECT', 'MANUAL_REVIEW']);
const CANDIDATE_SOURCES = new Set<ScorecardInterviewCandidateSource>(['DIRECT_FORM', 'CRM_LINKED']);
const CONFIGURATION_ENGINE_REF_PREFIX = 'configuration_engine:';

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for scorecard_interview_form runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for scorecard_interview_form runtime.');
  }
  return normalized;
}

function requirePositiveNumber(value: number, field: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(field + ' must be a positive number for scorecard_interview_form runtime.');
  }
  return value;
}

function requireNonNegativeNumber(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(field + ' must be a non-negative number for scorecard_interview_form runtime.');
  }
  return value;
}

function ensureUnique(value: string, seen: Set<string>, field: string): void {
  if (seen.has(value)) {
    throw new Error(field + ' must be unique for scorecard_interview_form runtime: ' + value);
  }
  seen.add(value);
}

function validateOptions(question: ScorecardInterviewQuestionConfig, questionCode: string): void {
  const needsOptions = question.question_type === 'SINGLE_SELECT' || question.question_type === 'MULTI_SELECT';
  const options = question.options ?? [];
  if (needsOptions && options.length < 2) {
    throw new Error('select question requires at least two configurable options for scorecard_interview_form runtime: ' + questionCode);
  }
  if (!needsOptions && options.length > 0) {
    throw new Error('options are only allowed for select questions for scorecard_interview_form runtime: ' + questionCode);
  }

  const optionCodes = new Set<string>();
  const optionLabels = new Set<string>();
  for (const option of options) {
    const optionCode = requireNonEmpty(option.option_code, 'option_code');
    const optionLabel = requireNonEmpty(option.label, 'option label');
    ensureUnique(optionCode, optionCodes, 'option_code');
    ensureUnique(optionLabel.toLocaleLowerCase('en-US'), optionLabels, 'option label');
    if (option.score_value !== undefined) {
      requireNonNegativeNumber(option.score_value, 'option score_value');
    }
  }
}

function normalizeSections(sections: readonly ScorecardInterviewSectionConfig[]): {
  normalizedSections: ScorecardInterviewNormalizedSection[];
  questionCount: number;
  scoredQuestionCount: number;
  requiredQuestionCount: number;
  totalAvailableScore: number;
} {
  if (!Array.isArray(sections) || sections.length === 0) {
    throw new Error('at least one configurable section is required for scorecard_interview_form runtime.');
  }

  const sectionCodes = new Set<string>();
  const sectionOrders = new Set<number>();
  const sectionLabels = new Set<string>();
  const questionCodes = new Set<string>();
  const normalizedSections: ScorecardInterviewNormalizedSection[] = [];
  let questionCount = 0;
  let scoredQuestionCount = 0;
  let requiredQuestionCount = 0;
  let totalAvailableScore = 0;

  for (const section of sections) {
    const sectionCode = requireNonEmpty(section.section_code, 'section_code');
    const sectionLabel = requireNonEmpty(section.label, 'section label');
    ensureUnique(sectionCode, sectionCodes, 'section_code');
    ensureUnique(sectionLabel.toLocaleLowerCase('en-US'), sectionLabels, 'section label');
    if (!Number.isInteger(section.order) || section.order <= 0) {
      throw new Error('section order must be a positive integer for scorecard_interview_form runtime: ' + sectionCode);
    }
    ensureUnique(String(section.order), new Set(Array.from(sectionOrders).map(String)), 'section order');
    if (sectionOrders.has(section.order)) {
      throw new Error('section order must be unique for scorecard_interview_form runtime: ' + section.order);
    }
    sectionOrders.add(section.order);
    const sectionWeight = requirePositiveNumber(section.weight, 'section weight');

    if (!Array.isArray(section.questions) || section.questions.length === 0) {
      throw new Error('section requires at least one configurable question for scorecard_interview_form runtime: ' + sectionCode);
    }

    const normalizedQuestions: ScorecardInterviewNormalizedQuestion[] = [];
    let sectionAvailableScore = 0;

    for (const question of section.questions) {
      const questionCode = requireNonEmpty(question.question_code, 'question_code');
      requireNonEmpty(question.label, 'question label');
      ensureUnique(questionCode, questionCodes, 'question_code');
      if (!QUESTION_TYPES.has(question.question_type)) {
        throw new Error('question_type is not supported for scorecard_interview_form runtime: ' + questionCode);
      }
      if (typeof question.required !== 'boolean') {
        throw new Error('question required flag must be boolean for scorecard_interview_form runtime: ' + questionCode);
      }
      const questionWeight = requirePositiveNumber(question.weight, 'question weight');
      const maxScore = question.max_score === undefined ? 0 : requirePositiveNumber(question.max_score, 'question max_score');
      validateOptions(question, questionCode);
      if (question.competency_code !== undefined) {
        requireNonEmpty(question.competency_code, 'competency_code');
      }
      if (question.evidence_required !== undefined && typeof question.evidence_required !== 'boolean') {
        throw new Error('question evidence_required flag must be boolean for scorecard_interview_form runtime: ' + questionCode);
      }
      if (maxScore > 0) {
        scoredQuestionCount += 1;
      }
      if (question.required) {
        requiredQuestionCount += 1;
      }
      const weightedAvailableScore = sectionWeight * questionWeight * maxScore;
      sectionAvailableScore += weightedAvailableScore;
      questionCount += 1;
      normalizedQuestions.push({
        question_code: questionCode,
        question_type: question.question_type,
        weight: questionWeight,
        max_score: maxScore,
        weighted_available_score: weightedAvailableScore,
        competency_code: question.competency_code?.trim(),
        evidence_required: question.evidence_required ?? false,
      });
    }

    totalAvailableScore += sectionAvailableScore;
    normalizedSections.push({
      section_code: sectionCode,
      order: section.order,
      weight: sectionWeight,
      question_count: normalizedQuestions.length,
      weighted_available_score: sectionAvailableScore,
      questions: normalizedQuestions,
    });
  }

  if (scoredQuestionCount === 0) {
    throw new Error('at least one scored question is required for scorecard_interview_form runtime.');
  }
  if (requiredQuestionCount === 0) {
    throw new Error('at least one required question is required for scorecard_interview_form runtime.');
  }

  normalizedSections.sort((a, b) => a.order - b.order);

  return {
    normalizedSections,
    questionCount,
    scoredQuestionCount,
    requiredQuestionCount,
    totalAvailableScore,
  };
}

function normalizeScoreBands(scoreBands: readonly ScorecardInterviewScoreBand[], totalAvailableScore: number): ScorecardInterviewScoreBand[] {
  if (!Array.isArray(scoreBands) || scoreBands.length === 0) {
    throw new Error('at least one score band is required for scorecard_interview_form runtime.');
  }

  const bandCodes = new Set<string>();
  const bandLabels = new Set<string>();
  const normalized = scoreBands.map((band) => {
    const bandCode = requireNonEmpty(band.band_code, 'band_code');
    const label = requireNonEmpty(band.label, 'score band label');
    ensureUnique(bandCode, bandCodes, 'band_code');
    ensureUnique(label.toLocaleLowerCase('en-US'), bandLabels, 'score band label');
    const minScore = requireNonNegativeNumber(band.min_score, 'score band min_score');
    const maxScore = requireNonNegativeNumber(band.max_score, 'score band max_score');
    if (maxScore < minScore) {
      throw new Error('score band max_score must be greater than or equal to min_score for scorecard_interview_form runtime: ' + bandCode);
    }
    if (maxScore > totalAvailableScore) {
      throw new Error('score band max_score cannot exceed total available score for scorecard_interview_form runtime: ' + bandCode);
    }
    if (!SCORE_OUTCOMES.has(band.outcome)) {
      throw new Error('score band outcome is not supported for scorecard_interview_form runtime: ' + bandCode);
    }
    return { band_code: bandCode, label, min_score: minScore, max_score: maxScore, outcome: band.outcome };
  }).sort((a, b) => a.min_score - b.min_score);

  for (let index = 1; index < normalized.length; index += 1) {
    const previous = normalized[index - 1]!;
    const current = normalized[index]!;
    if (current.min_score <= previous.max_score) {
      throw new Error('score bands must not overlap for scorecard_interview_form runtime: ' + previous.band_code + ' and ' + current.band_code);
    }
  }

  return normalized;
}

function validateCandidateSource(input: ScorecardInterviewFormRuntimeInput): { candidateSource: ScorecardInterviewCandidateSource; crmLeadRef?: string } {
  if (!CANDIDATE_SOURCES.has(input.candidate_source)) {
    throw new Error('candidate_source is not supported for scorecard_interview_form runtime.');
  }
  if (input.candidate_source === 'CRM_LINKED') {
    return {
      candidateSource: input.candidate_source,
      crmLeadRef: requireNonEmpty(input.crm_lead_ref, 'crm_lead_ref'),
    };
  }
  if (input.crm_lead_ref !== undefined && input.crm_lead_ref.trim().length > 0) {
    throw new Error('crm_lead_ref is only allowed when candidate_source is CRM_LINKED for scorecard_interview_form runtime.');
  }
  return { candidateSource: input.candidate_source };
}

function rejectForbiddenRequests(input: ScorecardInterviewFormRuntimeInput): void {
  if (input.hardcoded_form_requested === true) {
    throw new Error('scorecard_interview_form runtime must use Configuration Engine forms, not hardcoded form definitions.');
  }
  if (input.schema_mutation_requested === true) {
    throw new Error('scorecard_interview_form runtime must not mutate Prisma schema or migrations.');
  }
  if (input.crm_stage_mutation_requested === true) {
    throw new Error('scorecard_interview_form runtime must not mutate CRM stages.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('scorecard_interview_form runtime must not mutate Phase 6A surfaces.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('scorecard_interview_form runtime must not mutate Phase 6B surfaces.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('scorecard_interview_form runtime must not execute external runtime adapters.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('scorecard_interview_form runtime must not flip ticket or execution authorization flags.');
  }
}

function digestReceipt(receiptWithoutDigest: ScorecardInterviewReceiptWithoutDigest): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateScorecardInterviewFormRuntime(input: ScorecardInterviewFormRuntimeInput): ScorecardInterviewFormRuntimeReceipt {
  rejectForbiddenRequests(input);

  const configurationEngineFormRef = requireNonEmpty(input.configuration_engine_form_ref, 'configuration_engine_form_ref');
  if (!configurationEngineFormRef.startsWith(CONFIGURATION_ENGINE_REF_PREFIX)) {
    throw new Error('configuration_engine_form_ref must identify a Configuration Engine form for scorecard_interview_form runtime.');
  }

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const formCode = requireNonEmpty(input.form_code, 'form_code');
  requireNonEmpty(input.form_label, 'form_label');
  const formVersion = requireNonEmpty(input.form_version, 'form_version');
  const interviewStageCode = requireNonEmpty(input.interview_stage_code, 'interview_stage_code');
  const configuredByUserId = requireNonEmpty(input.configured_by_user_id, 'configured_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const { candidateSource, crmLeadRef } = validateCandidateSource(input);
  const sectionSummary = normalizeSections(input.sections);
  const scoreBands = normalizeScoreBands(input.score_bands, sectionSummary.totalAvailableScore);

  const receiptWithoutDigest: ScorecardInterviewReceiptWithoutDigest = {
    seed_id: PHASE_6C_SCORECARD_INTERVIEW_FORM_SEED_ID,
    component_id: PHASE_6C_SCORECARD_INTERVIEW_FORM_COMPONENT_ID,
    component_slug: 'hr_recruitment_and_onboarding_pipeline',
    model_name: 'Phase6CScorecardInterviewForm',
    event_name: SCORECARD_INTERVIEW_FORM_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    configuration_engine_form_ref: configurationEngineFormRef,
    form_code: formCode,
    form_version: formVersion,
    interview_stage_code: interviewStageCode,
    candidate_source: candidateSource,
    ...(crmLeadRef === undefined ? {} : { crm_lead_ref: crmLeadRef }),
    runtime_status: 'CONFIGURATION_ENGINE_SCORECARD_READY',
    configuration_engine_required: true,
    hardcoded_form_allowed: false,
    crm_stage_mutation_allowed: false,
    schema_mutation_allowed: false,
    phase_6a_mutation_allowed: false,
    phase_6b_mutation_allowed: false,
    runtime_adapter_allowed: false,
    question_count: sectionSummary.questionCount,
    scored_question_count: sectionSummary.scoredQuestionCount,
    required_question_count: sectionSummary.requiredQuestionCount,
    section_count: sectionSummary.normalizedSections.length,
    score_band_count: scoreBands.length,
    total_available_score: sectionSummary.totalAvailableScore,
    normalized_sections: sectionSummary.normalizedSections,
    score_bands: scoreBands,
    decision_refs: ['6C-RECRUIT-004'],
    external_dependency_conditions: ['lead_sourced_applicant_active'],
    evidence_artifacts: [
      'scorecard_interview_form_runtime_receipt',
      'scorecard_interview_form_validation_result',
      'scorecard_interview_form_forbidden_behavior_rejection_evidence',
    ],
    control_metadata: input.control_metadata ?? {},
    configured_by_user_id: configuredByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    scorecard_interview_form_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
