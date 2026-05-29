import { BadRequestException, Injectable } from '@nestjs/common';

export type AiProxyDataClass = 'internal' | 'confidential' | 'restricted';
export type AiProxyRiskClassification = 'low' | 'medium' | 'high';

export type AiProxyDeclarationInput = {
  organization_id: string;
  actor_user_id: string;
  source_module: string;
  request_key: string;
  purpose: string;
  data_sources: string[];
  capability_keys: string[];
  model_policy_key: string;
  data_classes: AiProxyDataClass[];
  max_cost_cents: number;
  human_review_required: boolean;
  retention_policy: string;
  redaction_policy: 'none' | 'standard' | 'strict';
  evaluation_policy: string;
  risk_classification: AiProxyRiskClassification;
  idempotency_key: string;
};

export type AiProxyDeclaration = {
  organization_id: string;
  actor_user_id: string;
  source_module: string;
  request_key: string;
  purpose: string;
  data_sources: string[];
  capability_keys: string[];
  model_policy_key: string;
  data_classes: AiProxyDataClass[];
  max_cost_cents: number;
  human_review_required: boolean;
  retention_policy: string;
  redaction_policy: 'none' | 'standard' | 'strict';
  evaluation_policy: string;
  risk_classification: AiProxyRiskClassification;
  idempotency_key: string;
  status: 'declared';
  provider_configured: false;
  provider_request_started: false;
  runtime_ai_executed: false;
  production_credentials_required: false;
  tenant_boundary_required: true;
  gatekeeper: {
    preflight_required: true;
    high_risk_review_required: boolean;
    capability_key: 'platform.ai_proxy.request';
  };
  audit: {
    event_type: 'ai_proxy.request.declared';
    audit_required: true;
  };
};

export type AiProxyStubProofInput = {
  declaration: AiProxyDeclaration;
  prompt_token_estimate: number;
  completion_token_cap: number;
  requested_at: string;
};

export type AiProxyStubProof = {
  mode: 'stub_only';
  status: 'stub_recorded';
  organization_id: string;
  actor_user_id: string;
  request_key: string;
  idempotency_key: string;
  requested_at: string;
  cost: {
    currency: 'USD';
    estimated_cents: number;
    hard_cap_cents: number;
    within_budget: true;
  };
  output: {
    kind: 'stub';
    content: 'AI_PROXY_STUB_NO_MODEL_OUTPUT';
  };
  audit: {
    event_type: 'ai_proxy.stub.recorded';
    audit_required: true;
  };
  provider_configured: false;
  provider_request_started: false;
  runtime_ai_executed: false;
  production_credentials_required: false;
};

const ALLOWED_DATA_CLASSES = new Set<AiProxyDataClass>(['internal', 'confidential', 'restricted']);
const ALLOWED_RISK = new Set<AiProxyRiskClassification>(['low', 'medium', 'high']);
const ALLOWED_REDACTION = new Set<AiProxyDeclarationInput['redaction_policy']>(['none', 'standard', 'strict']);
const FORBIDDEN_PROVIDER_MARKERS = [
  'openai',
  'anthropic',
  'azure',
  'gemini',
  'provider',
  'api_key',
  'secret',
  'token',
  'production',
  'live',
];

@Injectable()
export class AiProxyService {
  declareRequest(input: AiProxyDeclarationInput): AiProxyDeclaration {
    const riskClassification = this.riskClassification(input.risk_classification);
    const dataClasses = this.dataClasses(input.data_classes);
    const capabilityKeys = this.stringList(input.capability_keys, 'capability_keys');

    if (!capabilityKeys.includes('platform.ai_proxy.request')) {
      throw new BadRequestException('ai proxy platform.ai_proxy.request capability is required');
    }

    return {
      organization_id: this.required(input.organization_id, 'organization_id'),
      actor_user_id: this.required(input.actor_user_id, 'actor_user_id'),
      source_module: this.required(input.source_module, 'source_module'),
      request_key: this.required(input.request_key, 'request_key'),
      purpose: this.safeText(input.purpose, 'purpose'),
      data_sources: this.safeStringList(input.data_sources, 'data_sources'),
      capability_keys: capabilityKeys,
      model_policy_key: this.safeText(input.model_policy_key, 'model_policy_key'),
      data_classes: dataClasses,
      max_cost_cents: this.maxCost(input.max_cost_cents),
      human_review_required: this.humanReviewRequired(input.human_review_required, dataClasses, riskClassification),
      retention_policy: this.required(input.retention_policy, 'retention_policy'),
      redaction_policy: this.redactionPolicy(input.redaction_policy),
      evaluation_policy: this.required(input.evaluation_policy, 'evaluation_policy'),
      risk_classification: riskClassification,
      idempotency_key: this.required(input.idempotency_key, 'idempotency_key'),
      status: 'declared',
      provider_configured: false,
      provider_request_started: false,
      runtime_ai_executed: false,
      production_credentials_required: false,
      tenant_boundary_required: true,
      gatekeeper: {
        preflight_required: true,
        high_risk_review_required: riskClassification === 'high',
        capability_key: 'platform.ai_proxy.request',
      },
      audit: {
        event_type: 'ai_proxy.request.declared',
        audit_required: true,
      },
    };
  }

  recordStubProof(input: AiProxyStubProofInput): AiProxyStubProof {
    const declaration = input.declaration;
    if (declaration.status !== 'declared') {
      throw new BadRequestException('ai proxy stub proof requires a declared request');
    }
    if (
      declaration.provider_configured !== false ||
      declaration.provider_request_started !== false ||
      declaration.runtime_ai_executed !== false ||
      declaration.production_credentials_required !== false
    ) {
      throw new BadRequestException('ai proxy stub proof cannot follow provider/runtime execution');
    }

    const requestedAt = this.isoTimestamp(input.requested_at, 'requested_at');
    const estimatedCents = this.estimateCost(input.prompt_token_estimate, input.completion_token_cap);
    if (estimatedCents > declaration.max_cost_cents) {
      throw new BadRequestException('ai proxy stub cost estimate exceeds declared cap');
    }

    return {
      mode: 'stub_only',
      status: 'stub_recorded',
      organization_id: declaration.organization_id,
      actor_user_id: declaration.actor_user_id,
      request_key: declaration.request_key,
      idempotency_key: declaration.idempotency_key,
      requested_at: requestedAt,
      cost: {
        currency: 'USD',
        estimated_cents: estimatedCents,
        hard_cap_cents: declaration.max_cost_cents,
        within_budget: true,
      },
      output: {
        kind: 'stub',
        content: 'AI_PROXY_STUB_NO_MODEL_OUTPUT',
      },
      audit: {
        event_type: 'ai_proxy.stub.recorded',
        audit_required: true,
      },
      provider_configured: false,
      provider_request_started: false,
      runtime_ai_executed: false,
      production_credentials_required: false,
    };
  }

  private estimateCost(promptTokenEstimate: number, completionTokenCap: number): number {
    if (!Number.isSafeInteger(promptTokenEstimate) || promptTokenEstimate < 0) {
      throw new BadRequestException('ai proxy prompt_token_estimate must be a non-negative integer');
    }
    if (!Number.isSafeInteger(completionTokenCap) || completionTokenCap < 0) {
      throw new BadRequestException('ai proxy completion_token_cap must be a non-negative integer');
    }

    return Math.ceil((promptTokenEstimate + completionTokenCap) / 100);
  }

  private isoTimestamp(input: unknown, field: string): string {
    const value = this.required(input, field);
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`ai proxy ${field} must be an ISO timestamp`);
    }

    return date.toISOString();
  }

  private dataClasses(input: AiProxyDataClass[]): AiProxyDataClass[] {
    const classes = this.stringList(input, 'data_classes') as AiProxyDataClass[];
    for (const dataClass of classes) {
      if (!ALLOWED_DATA_CLASSES.has(dataClass)) {
        throw new BadRequestException('ai proxy data_class is invalid');
      }
    }

    return classes;
  }

  private riskClassification(input: AiProxyRiskClassification): AiProxyRiskClassification {
    const value = this.required(input, 'risk_classification') as AiProxyRiskClassification;
    if (!ALLOWED_RISK.has(value)) {
      throw new BadRequestException('ai proxy risk_classification is invalid');
    }

    return value;
  }

  private redactionPolicy(input: AiProxyDeclarationInput['redaction_policy']): AiProxyDeclarationInput['redaction_policy'] {
    const value = this.required(input, 'redaction_policy') as AiProxyDeclarationInput['redaction_policy'];
    if (!ALLOWED_REDACTION.has(value)) {
      throw new BadRequestException('ai proxy redaction_policy is invalid');
    }

    return value;
  }

  private maxCost(input: number): number {
    if (!Number.isSafeInteger(input) || input < 0 || input > 100_000) {
      throw new BadRequestException('ai proxy max_cost_cents must be between 0 and 100000');
    }

    return input;
  }

  private humanReviewRequired(
    input: boolean,
    dataClasses: AiProxyDataClass[],
    riskClassification: AiProxyRiskClassification,
  ): boolean {
    if (typeof input !== 'boolean') {
      throw new BadRequestException('ai proxy human_review_required must be boolean');
    }
    if (!input && (riskClassification === 'high' || dataClasses.includes('restricted'))) {
      throw new BadRequestException('ai proxy restricted or high-risk requests require human review');
    }

    return input;
  }

  private safeStringList(input: string[], field: string): string[] {
    const values = this.stringList(input, field);
    for (const value of values) {
      this.rejectProviderMarker(value, field);
    }

    return values;
  }

  private stringList(input: string[], field: string): string[] {
    if (!Array.isArray(input) || input.length === 0) {
      throw new BadRequestException(`ai proxy ${field} is required`);
    }

    const values = input.map((value) => this.required(value, field));
    if (new Set(values).size !== values.length) {
      throw new BadRequestException(`ai proxy ${field} must be unique`);
    }

    return values;
  }

  private safeText(input: unknown, field: string): string {
    const value = this.required(input, field);
    this.rejectProviderMarker(value, field);
    return value;
  }

  private rejectProviderMarker(input: string, field: string): void {
    const normalized = input.toLowerCase();
    if (FORBIDDEN_PROVIDER_MARKERS.some((marker) => normalized.includes(marker))) {
      throw new BadRequestException(`ai proxy ${field} cannot name real providers, credentials, or live runtime`);
    }
  }

  private required(input: unknown, field: string): string {
    if (typeof input !== 'string' || input.trim().length === 0) {
      throw new BadRequestException(`ai proxy ${field} is required`);
    }

    return input.trim();
  }
}
