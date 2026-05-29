import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { SchedulerService, type SchedulerJobDeclarationInput } from './scheduler.service';

function validDeclaration(overrides?: Partial<SchedulerJobDeclarationInput>): SchedulerJobDeclarationInput {
  return {
    organization_id: 'org-022a',
    actor_user_id: 'actor-022a',
    owner_module: 'core.workflow',
    job_key: 'workflow.escalation.check',
    queue_key: 'platform.scheduler.workflow',
    cadence: 'once',
    run_at: '2026-05-29T02:00:00.000Z',
    payload_schema_key: 'workflow.escalation.payload.v1',
    payload_shape: {
      workflow_instance_id: 'string',
      escalation_level: 'number',
    },
    idempotency_key: 'scheduler-job-022a',
    retry_policy: {
      max_attempts: 3,
      backoff_ms: 60_000,
    },
    dead_letter: {
      enabled: true,
      queue_key: 'platform.scheduler.workflow.dead_letter',
    },
    risk_classification: 'high',
    ...overrides,
  };
}

function testSchedulerDeclarationCapturesRequiredPolicyFieldsWithoutRuntimeExecution() {
  const declaration = new SchedulerService().declareJob(validDeclaration());

  assert.equal(declaration.organization_id, 'org-022a');
  assert.equal(declaration.actor_user_id, 'actor-022a');
  assert.equal(declaration.owner_module, 'core.workflow');
  assert.equal(declaration.job_key, 'workflow.escalation.check');
  assert.equal(declaration.queue_key, 'platform.scheduler.workflow');
  assert.equal(declaration.cadence, 'once');
  assert.equal(declaration.run_at, '2026-05-29T02:00:00.000Z');
  assert.equal(declaration.cron_expression, null);
  assert.equal(declaration.payload_schema_key, 'workflow.escalation.payload.v1');
  assert.equal(declaration.retry_policy.max_attempts, 3);
  assert.equal(declaration.retry_policy.backoff_ms, 60_000);
  assert.equal(declaration.dead_letter.enabled, true);
  assert.equal(declaration.dead_letter.queue_key, 'platform.scheduler.workflow.dead_letter');
  assert.equal(declaration.status, 'declared');
  assert.equal(declaration.runtime_enqueued, false);
  assert.equal(declaration.worker_started, false);
  assert.equal(declaration.gatekeeper.preflight_required, true);
  assert.equal(declaration.gatekeeper.high_risk_review_required, true);
  assert.equal(declaration.gatekeeper.capability_key, 'platform.scheduler.declare');
  assert.equal(declaration.audit.event_type, 'scheduler.job.declared');
  assert.equal(declaration.audit.audit_required, true);
}

function testSchedulerDeclarationSupportsManualOnceAndRecurringDeclarations() {
  const service = new SchedulerService();

  assert.equal(service.declareJob(validDeclaration({ cadence: 'manual', run_at: undefined })).cadence, 'manual');
  assert.equal(
    service.declareJob(
      validDeclaration({
        cadence: 'recurring',
        run_at: undefined,
        cron_expression: '*/15 * * * *',
      }),
    ).cron_expression,
    '*/15 * * * *',
  );
}

function testSchedulerDeclarationRejectsUnsafeOrIncompleteDeclarations() {
  const service = new SchedulerService();

  assert.throws(() => service.declareJob(validDeclaration({ organization_id: '' })), BadRequestException);
  assert.throws(() => service.declareJob(validDeclaration({ owner_module: ' ' })), BadRequestException);
  assert.throws(() => service.declareJob(validDeclaration({ cadence: 'hourly' as SchedulerJobDeclarationInput['cadence'] })), BadRequestException);
  assert.throws(() => service.declareJob(validDeclaration({ run_at: 'not-a-date' })), BadRequestException);
  assert.throws(
    () =>
      service.declareJob(
        validDeclaration({
          cadence: 'recurring',
          run_at: undefined,
          cron_expression: '* * *',
        }),
      ),
    BadRequestException,
  );
  assert.throws(() => service.declareJob(validDeclaration({ payload_shape: [] as never })), BadRequestException);
  assert.throws(
    () =>
      service.declareJob(
        validDeclaration({
          retry_policy: {
            max_attempts: 11,
            backoff_ms: 60_000,
          },
        }),
      ),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.declareJob(
        validDeclaration({
          dead_letter: {
            enabled: true,
            queue_key: 'platform.scheduler.workflow',
          },
        }),
      ),
    BadRequestException,
  );
}

function testSchedulerHighRiskGatekeeperReviewIsExplicitlyClassified() {
  const service = new SchedulerService();

  assert.equal(service.declareJob(validDeclaration({ risk_classification: 'low' })).gatekeeper.high_risk_review_required, false);
  assert.equal(service.declareJob(validDeclaration({ risk_classification: 'medium' })).gatekeeper.high_risk_review_required, false);
  assert.equal(service.declareJob(validDeclaration({ risk_classification: 'high' })).gatekeeper.high_risk_review_required, true);
  assert.throws(
    () => service.declareJob(validDeclaration({ risk_classification: 'critical' as SchedulerJobDeclarationInput['risk_classification'] })),
    BadRequestException,
  );
}

function run() {
  testSchedulerDeclarationCapturesRequiredPolicyFieldsWithoutRuntimeExecution();
  testSchedulerDeclarationSupportsManualOnceAndRecurringDeclarations();
  testSchedulerDeclarationRejectsUnsafeOrIncompleteDeclarations();
  testSchedulerHighRiskGatekeeperReviewIsExplicitlyClassified();

  console.log('P5B-022a Scheduler declaration validation tests passed.');
}

run();
