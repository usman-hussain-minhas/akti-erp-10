import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import {
  SchedulerService,
  type SchedulerJobDeclaration,
  type SchedulerJobDeclarationInput,
  type SchedulerRuntimeDependency,
} from './scheduler.service';

function validDeclaration(overrides?: Partial<SchedulerJobDeclarationInput>): SchedulerJobDeclarationInput {
  return {
    organization_id: 'org-022b',
    actor_user_id: 'actor-022b',
    owner_module: 'core.workflow',
    job_key: 'workflow.escalation.check',
    queue_key: 'platform.scheduler.workflow',
    cadence: 'manual',
    payload_schema_key: 'workflow.escalation.payload.v1',
    payload_shape: {
      workflow_instance_id: 'string',
    },
    idempotency_key: 'scheduler-job-022b',
    retry_policy: {
      max_attempts: 3,
      backoff_ms: 60_000,
    },
    dead_letter: {
      enabled: true,
      queue_key: 'platform.scheduler.workflow.dead_letter',
    },
    risk_classification: 'medium',
    ...overrides,
  };
}

function dependencies(overrides?: SchedulerRuntimeDependency[]): SchedulerRuntimeDependency[] {
  return (
    overrides ?? [
      {
        dependency_key: 'platform.workflow.engine',
        dependency_type: 'core_service',
      },
      {
        dependency_key: 'platform.scheduler.workflow',
        dependency_type: 'platform_queue',
      },
    ]
  );
}

function testSchedulerRuntimeBoundaryKeepsDeclaredJobsBlockedUntilGatekeeperAllow() {
  const service = new SchedulerService();
  const declaration = service.declareJob(validDeclaration());
  const boundary = service.defineRuntimeBoundary(declaration, dependencies());

  assert.equal(boundary.job_key, 'workflow.escalation.check');
  assert.equal(boundary.organization_id, 'org-022b');
  assert.equal(boundary.owner_module, 'core.workflow');
  assert.deepEqual(boundary.dependency_keys, ['platform.workflow.engine', 'platform.scheduler.workflow']);
  assert.equal(boundary.dependency_count, 2);
  assert.equal(boundary.boundary_state, 'declared_not_enqueued');
  assert.equal(boundary.gatekeeper_outcome_required, 'ALLOW');
  assert.equal(boundary.gatekeeper_preflight_required, true);
  assert.equal(boundary.queue_enqueued, false);
  assert.equal(boundary.worker_started, false);
  assert.equal(boundary.runtime_execution_started, false);
  assert.equal(boundary.business_logic_executed, false);
  assert.equal(boundary.production_queue_connected, false);
  assert.equal(boundary.blocked_reason, 'gatekeeper_preflight_required_before_runtime_enqueue');
}

function testSchedulerRuntimeBoundaryRejectsAlreadyEnqueuedOrStartedJobs() {
  const service = new SchedulerService();
  const declaration = service.declareJob(validDeclaration());

  assert.throws(
    () =>
      service.defineRuntimeBoundary(
        {
          ...declaration,
          runtime_enqueued: true as false,
        },
        dependencies(),
      ),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.defineRuntimeBoundary(
        {
          ...declaration,
          worker_started: true as false,
        },
        dependencies(),
      ),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.defineRuntimeBoundary(
        {
          ...declaration,
          status: 'running' as SchedulerJobDeclaration['status'],
        },
        dependencies(),
      ),
    BadRequestException,
  );
}

function testSchedulerRuntimeBoundaryRejectsUnsafeDependencyDeclarations() {
  const service = new SchedulerService();
  const declaration = service.declareJob(validDeclaration());

  assert.throws(() => service.defineRuntimeBoundary(declaration, []), BadRequestException);
  assert.throws(
    () =>
      service.defineRuntimeBoundary(
        declaration,
        dependencies([
          {
            dependency_key: 'platform.workflow.engine',
            dependency_type: 'core_service',
          },
          {
            dependency_key: 'platform.workflow.engine',
            dependency_type: 'platform_queue',
          },
        ]),
      ),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.defineRuntimeBoundary(
        declaration,
        dependencies([
          {
            dependency_key: '',
            dependency_type: 'core_service',
          },
        ]),
      ),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.defineRuntimeBoundary(
        declaration,
        dependencies([
          {
            dependency_key: 'runtime.provider',
            dependency_type: 'external_provider' as SchedulerRuntimeDependency['dependency_type'],
          },
        ]),
      ),
    BadRequestException,
  );
}

function run() {
  testSchedulerRuntimeBoundaryKeepsDeclaredJobsBlockedUntilGatekeeperAllow();
  testSchedulerRuntimeBoundaryRejectsAlreadyEnqueuedOrStartedJobs();
  testSchedulerRuntimeBoundaryRejectsUnsafeDependencyDeclarations();

  console.log('P5B-022b Scheduler dependency/runtime boundary tests passed.');
}

run();
