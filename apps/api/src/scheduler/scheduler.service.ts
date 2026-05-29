import { BadRequestException, Injectable } from '@nestjs/common';

export type SchedulerCadence = 'manual' | 'once' | 'recurring';
export type SchedulerRiskClassification = 'low' | 'medium' | 'high';

export type SchedulerJobDeclarationInput = {
  organization_id: string;
  actor_user_id: string;
  owner_module: string;
  job_key: string;
  queue_key: string;
  cadence: SchedulerCadence;
  run_at?: string;
  cron_expression?: string;
  payload_schema_key: string;
  payload_shape: Record<string, unknown>;
  idempotency_key: string;
  retry_policy: {
    max_attempts: number;
    backoff_ms: number;
  };
  dead_letter: {
    enabled: boolean;
    queue_key: string;
  };
  risk_classification: SchedulerRiskClassification;
};

export type SchedulerJobDeclaration = {
  organization_id: string;
  actor_user_id: string;
  owner_module: string;
  job_key: string;
  queue_key: string;
  cadence: SchedulerCadence;
  run_at: string | null;
  cron_expression: string | null;
  payload_schema_key: string;
  payload_shape: Record<string, unknown>;
  idempotency_key: string;
  retry_policy: {
    max_attempts: number;
    backoff_ms: number;
  };
  dead_letter: {
    enabled: boolean;
    queue_key: string;
  };
  risk_classification: SchedulerRiskClassification;
  status: 'declared';
  runtime_enqueued: false;
  worker_started: false;
  gatekeeper: {
    preflight_required: true;
    high_risk_review_required: boolean;
    capability_key: 'platform.scheduler.declare';
  };
  audit: {
    event_type: 'scheduler.job.declared';
    audit_required: true;
  };
};

export type SchedulerRuntimeDependency = {
  dependency_key: string;
  dependency_type: 'core_service' | 'module_capability' | 'platform_queue';
};

export type SchedulerRuntimeBoundary = {
  job_key: string;
  organization_id: string;
  owner_module: string;
  dependency_keys: string[];
  dependency_count: number;
  boundary_state: 'declared_not_enqueued';
  gatekeeper_outcome_required: 'ALLOW';
  gatekeeper_preflight_required: true;
  queue_enqueued: false;
  worker_started: false;
  runtime_execution_started: false;
  business_logic_executed: false;
  production_queue_connected: false;
  blocked_reason: 'gatekeeper_preflight_required_before_runtime_enqueue';
};

export type SchedulerSafetyDeadLetterBaseline = {
  job_key: string;
  organization_id: string;
  queue_key: string;
  idempotency_key: string;
  retry_max_attempts: number;
  retry_backoff_ms: number;
  dead_letter_enabled: boolean;
  dead_letter_queue_key: string;
  safety_state: 'declared_not_executed';
  poison_message_policy: 'dead_letter_after_retry_exhaustion';
  dead_letter_record_emitted: false;
  retry_execution_started: false;
  worker_started: false;
  production_queue_connected: false;
  tenant_context_required: true;
  audit: {
    event_type: 'scheduler.safety.dead_letter.baseline.declared';
    audit_required: true;
  };
};

const ALLOWED_CADENCES = new Set<SchedulerCadence>(['manual', 'once', 'recurring']);
const ALLOWED_RISK = new Set<SchedulerRiskClassification>(['low', 'medium', 'high']);
const ALLOWED_DEPENDENCY_TYPES = new Set<SchedulerRuntimeDependency['dependency_type']>([
  'core_service',
  'module_capability',
  'platform_queue',
]);

@Injectable()
export class SchedulerService {
  declareJob(input: SchedulerJobDeclarationInput): SchedulerJobDeclaration {
    const cadence = this.cadence(input.cadence);
    const runAt = this.runAt(input.run_at, cadence);
    const cronExpression = this.cronExpression(input.cron_expression, cadence);
    const retryPolicy = this.retryPolicy(input.retry_policy);
    const queueKey = this.required(input.queue_key, 'queue_key');
    const deadLetter = this.deadLetter(input.dead_letter, queueKey);
    const riskClassification = this.riskClassification(input.risk_classification);

    return {
      organization_id: this.required(input.organization_id, 'organization_id'),
      actor_user_id: this.required(input.actor_user_id, 'actor_user_id'),
      owner_module: this.required(input.owner_module, 'owner_module'),
      job_key: this.required(input.job_key, 'job_key'),
      queue_key: queueKey,
      cadence,
      run_at: runAt,
      cron_expression: cronExpression,
      payload_schema_key: this.required(input.payload_schema_key, 'payload_schema_key'),
      payload_shape: this.payloadShape(input.payload_shape),
      idempotency_key: this.required(input.idempotency_key, 'idempotency_key'),
      retry_policy: retryPolicy,
      dead_letter: deadLetter,
      risk_classification: riskClassification,
      status: 'declared',
      runtime_enqueued: false,
      worker_started: false,
      gatekeeper: {
        preflight_required: true,
        high_risk_review_required: riskClassification === 'high',
        capability_key: 'platform.scheduler.declare',
      },
      audit: {
        event_type: 'scheduler.job.declared',
        audit_required: true,
      },
    };
  }

  defineRuntimeBoundary(
    declaration: SchedulerJobDeclaration,
    dependencies: SchedulerRuntimeDependency[],
  ): SchedulerRuntimeBoundary {
    if (declaration.status !== 'declared' || declaration.runtime_enqueued !== false || declaration.worker_started !== false) {
      throw new BadRequestException('scheduler runtime boundary requires a declared non-enqueued job');
    }

    const dependencyKeys = this.runtimeDependencyKeys(dependencies);

    return {
      job_key: declaration.job_key,
      organization_id: declaration.organization_id,
      owner_module: declaration.owner_module,
      dependency_keys: dependencyKeys,
      dependency_count: dependencyKeys.length,
      boundary_state: 'declared_not_enqueued',
      gatekeeper_outcome_required: 'ALLOW',
      gatekeeper_preflight_required: true,
      queue_enqueued: false,
      worker_started: false,
      runtime_execution_started: false,
      business_logic_executed: false,
      production_queue_connected: false,
      blocked_reason: 'gatekeeper_preflight_required_before_runtime_enqueue',
    };
  }

  declareSafetyDeadLetterBaseline(
    declaration: SchedulerJobDeclaration,
    boundary: SchedulerRuntimeBoundary,
  ): SchedulerSafetyDeadLetterBaseline {
    if (boundary.job_key !== declaration.job_key || boundary.organization_id !== declaration.organization_id) {
      throw new BadRequestException('scheduler safety baseline must match declaration boundary');
    }
    if (
      boundary.queue_enqueued !== false ||
      boundary.worker_started !== false ||
      boundary.runtime_execution_started !== false ||
      boundary.production_queue_connected !== false
    ) {
      throw new BadRequestException('scheduler safety baseline cannot be declared after runtime execution starts');
    }
    if (declaration.dead_letter.enabled && declaration.dead_letter.queue_key === declaration.queue_key) {
      throw new BadRequestException('scheduler dead-letter queue must remain separate from runtime queue');
    }

    return {
      job_key: declaration.job_key,
      organization_id: declaration.organization_id,
      queue_key: declaration.queue_key,
      idempotency_key: declaration.idempotency_key,
      retry_max_attempts: declaration.retry_policy.max_attempts,
      retry_backoff_ms: declaration.retry_policy.backoff_ms,
      dead_letter_enabled: declaration.dead_letter.enabled,
      dead_letter_queue_key: declaration.dead_letter.queue_key,
      safety_state: 'declared_not_executed',
      poison_message_policy: 'dead_letter_after_retry_exhaustion',
      dead_letter_record_emitted: false,
      retry_execution_started: false,
      worker_started: false,
      production_queue_connected: false,
      tenant_context_required: true,
      audit: {
        event_type: 'scheduler.safety.dead_letter.baseline.declared',
        audit_required: true,
      },
    };
  }

  private runtimeDependencyKeys(dependencies: SchedulerRuntimeDependency[]): string[] {
    if (!Array.isArray(dependencies) || dependencies.length === 0) {
      throw new BadRequestException('scheduler runtime dependencies are required');
    }

    const keys = dependencies.map((dependency) => {
      if (!dependency || typeof dependency !== 'object') {
        throw new BadRequestException('scheduler runtime dependency is invalid');
      }
      if (!ALLOWED_DEPENDENCY_TYPES.has(dependency.dependency_type)) {
        throw new BadRequestException('scheduler runtime dependency_type is invalid');
      }

      return this.required(dependency.dependency_key, 'dependency_key');
    });

    if (new Set(keys).size !== keys.length) {
      throw new BadRequestException('scheduler runtime dependencies must be unique');
    }

    return keys;
  }

  private cadence(input: SchedulerCadence): SchedulerCadence {
    const value = this.required(input, 'cadence') as SchedulerCadence;
    if (!ALLOWED_CADENCES.has(value)) {
      throw new BadRequestException('scheduler cadence is invalid');
    }

    return value;
  }

  private runAt(input: string | undefined, cadence: SchedulerCadence): string | null {
    if (cadence !== 'once') {
      return null;
    }

    const value = this.required(input, 'run_at');
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('scheduler run_at must be an ISO timestamp');
    }

    return date.toISOString();
  }

  private cronExpression(input: string | undefined, cadence: SchedulerCadence): string | null {
    if (cadence !== 'recurring') {
      return null;
    }

    const value = this.required(input, 'cron_expression');
    if (value.split(/\s+/).length !== 5) {
      throw new BadRequestException('scheduler cron_expression must use five-field cron syntax');
    }

    return value;
  }

  private retryPolicy(input: SchedulerJobDeclarationInput['retry_policy']): SchedulerJobDeclaration['retry_policy'] {
    if (!input || typeof input !== 'object') {
      throw new BadRequestException('scheduler retry_policy is required');
    }

    if (!Number.isInteger(input.max_attempts) || input.max_attempts < 0 || input.max_attempts > 10) {
      throw new BadRequestException('scheduler retry_policy.max_attempts must be between 0 and 10');
    }
    if (!Number.isInteger(input.backoff_ms) || input.backoff_ms < 0 || input.backoff_ms > 86_400_000) {
      throw new BadRequestException('scheduler retry_policy.backoff_ms must be between 0 and 86400000');
    }

    return {
      max_attempts: input.max_attempts,
      backoff_ms: input.backoff_ms,
    };
  }

  private deadLetter(input: SchedulerJobDeclarationInput['dead_letter'], queueKey: string): SchedulerJobDeclaration['dead_letter'] {
    if (!input || typeof input !== 'object') {
      throw new BadRequestException('scheduler dead_letter policy is required');
    }
    if (typeof input.enabled !== 'boolean') {
      throw new BadRequestException('scheduler dead_letter.enabled must be boolean');
    }

    const deadLetterQueue = this.required(input.queue_key, 'dead_letter.queue_key');
    if (input.enabled && deadLetterQueue === queueKey) {
      throw new BadRequestException('scheduler dead_letter.queue_key must differ from queue_key');
    }

    return {
      enabled: input.enabled,
      queue_key: deadLetterQueue,
    };
  }

  private riskClassification(input: SchedulerRiskClassification): SchedulerRiskClassification {
    const value = this.required(input, 'risk_classification') as SchedulerRiskClassification;
    if (!ALLOWED_RISK.has(value)) {
      throw new BadRequestException('scheduler risk_classification is invalid');
    }

    return value;
  }

  private payloadShape(input: Record<string, unknown>): Record<string, unknown> {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new BadRequestException('scheduler payload_shape must be an object');
    }

    return input;
  }

  private required(input: unknown, field: string): string {
    if (typeof input !== 'string' || input.trim().length === 0) {
      throw new BadRequestException(`scheduler ${field} is required`);
    }

    return input.trim();
  }
}
