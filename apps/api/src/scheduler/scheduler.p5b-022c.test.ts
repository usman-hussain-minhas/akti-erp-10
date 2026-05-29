import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import {
  SchedulerService,
  type SchedulerJobDeclarationInput,
  type SchedulerRuntimeDependency,
} from './scheduler.service';

function validDeclaration(overrides?: Partial<SchedulerJobDeclarationInput>): SchedulerJobDeclarationInput {
  return {
    organization_id: 'org-022c',
    actor_user_id: 'actor-022c',
    owner_module: 'core.workflow',
    job_key: 'workflow.escalation.check',
    queue_key: 'platform.scheduler.workflow',
    cadence: 'manual',
    payload_schema_key: 'workflow.escalation.payload.v1',
    payload_shape: {
      workflow_instance_id: 'string',
    },
    idempotency_key: 'scheduler-job-022c',
    retry_policy: {
      max_attempts: 5,
      backoff_ms: 120_000,
    },
    dead_letter: {
      enabled: true,
      queue_key: 'platform.scheduler.workflow.dead_letter',
    },
    risk_classification: 'medium',
    ...overrides,
  };
}

function dependencies(): SchedulerRuntimeDependency[] {
  return [
    {
      dependency_key: 'platform.workflow.engine',
      dependency_type: 'core_service',
    },
    {
      dependency_key: 'platform.scheduler.workflow',
      dependency_type: 'platform_queue',
    },
  ];
}

function testSchedulerSafetyBaselineDeclaresRetryDeadLetterAndTenantContextWithoutExecution() {
  const service = new SchedulerService();
  const declaration = service.declareJob(validDeclaration());
  const boundary = service.defineRuntimeBoundary(declaration, dependencies());
  const baseline = service.declareSafetyDeadLetterBaseline(declaration, boundary);

  assert.equal(baseline.job_key, 'workflow.escalation.check');
  assert.equal(baseline.organization_id, 'org-022c');
  assert.equal(baseline.queue_key, 'platform.scheduler.workflow');
  assert.equal(baseline.idempotency_key, 'scheduler-job-022c');
  assert.equal(baseline.retry_max_attempts, 5);
  assert.equal(baseline.retry_backoff_ms, 120_000);
  assert.equal(baseline.dead_letter_enabled, true);
  assert.equal(baseline.dead_letter_queue_key, 'platform.scheduler.workflow.dead_letter');
  assert.equal(baseline.safety_state, 'declared_not_executed');
  assert.equal(baseline.poison_message_policy, 'dead_letter_after_retry_exhaustion');
  assert.equal(baseline.dead_letter_record_emitted, false);
  assert.equal(baseline.retry_execution_started, false);
  assert.equal(baseline.worker_started, false);
  assert.equal(baseline.production_queue_connected, false);
  assert.equal(baseline.tenant_context_required, true);
  assert.equal(baseline.audit.event_type, 'scheduler.safety.dead_letter.baseline.declared');
  assert.equal(baseline.audit.audit_required, true);
}

function testSchedulerSafetyBaselineRejectsRuntimeStartedBoundaries() {
  const service = new SchedulerService();
  const declaration = service.declareJob(validDeclaration());
  const boundary = service.defineRuntimeBoundary(declaration, dependencies());

  assert.throws(
    () =>
      service.declareSafetyDeadLetterBaseline(declaration, {
        ...boundary,
        queue_enqueued: true as false,
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.declareSafetyDeadLetterBaseline(declaration, {
        ...boundary,
        worker_started: true as false,
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.declareSafetyDeadLetterBaseline(declaration, {
        ...boundary,
        production_queue_connected: true as false,
      }),
    BadRequestException,
  );
}

function testSchedulerSafetyBaselineRejectsBoundaryMismatchAndDeadLetterCollapse() {
  const service = new SchedulerService();
  const declaration = service.declareJob(validDeclaration());
  const boundary = service.defineRuntimeBoundary(declaration, dependencies());

  assert.throws(
    () =>
      service.declareSafetyDeadLetterBaseline(declaration, {
        ...boundary,
        organization_id: 'other-org',
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.declareSafetyDeadLetterBaseline(
        {
          ...declaration,
          dead_letter: {
            enabled: true,
            queue_key: declaration.queue_key,
          },
        },
        boundary,
      ),
    BadRequestException,
  );
}

function testSchedulerSafetyBaselineAllowsExplicitDisabledDeadLetterPolicy() {
  const service = new SchedulerService();
  const declaration = service.declareJob(
    validDeclaration({
      dead_letter: {
        enabled: false,
        queue_key: 'platform.scheduler.workflow.disabled_dead_letter',
      },
    }),
  );
  const boundary = service.defineRuntimeBoundary(declaration, dependencies());
  const baseline = service.declareSafetyDeadLetterBaseline(declaration, boundary);

  assert.equal(baseline.dead_letter_enabled, false);
  assert.equal(baseline.dead_letter_queue_key, 'platform.scheduler.workflow.disabled_dead_letter');
  assert.equal(baseline.dead_letter_record_emitted, false);
}

function run() {
  testSchedulerSafetyBaselineDeclaresRetryDeadLetterAndTenantContextWithoutExecution();
  testSchedulerSafetyBaselineRejectsRuntimeStartedBoundaries();
  testSchedulerSafetyBaselineRejectsBoundaryMismatchAndDeadLetterCollapse();
  testSchedulerSafetyBaselineAllowsExplicitDisabledDeadLetterPolicy();

  console.log('P5B-022c Scheduler safety/dead-letter baseline tests passed.');
}

run();
