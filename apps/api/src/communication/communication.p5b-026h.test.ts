import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { CommunicationService, type CommunicationIntentInput } from './communication.service';
import {
  SchedulerService,
  type SchedulerJobDeclarationInput,
  type SchedulerRuntimeDependency,
} from '../scheduler/scheduler.service';

function validIntent(overrides?: Partial<CommunicationIntentInput>): CommunicationIntentInput {
  return {
    organization_id: 'org-026h',
    actor_user_id: 'actor-026h',
    source_module: 'core.workflow',
    intent_key: 'workflow.communication.notice',
    recipient_ref: 'user:workflow-reviewer',
    channel: 'email_stub',
    template_key: 'workflow.notice',
    payload: {
      workflow_instance_id: 'workflow-026h',
    },
    idempotency_key: 'communication-026h',
    requested_at: '2026-05-29T00:00:00.000Z',
    consent_ref: 'consent:workflow-communication',
    retention_policy: 'per_communication_policy',
    risk_classification: 'medium',
    priority: 'normal',
    ...overrides,
  };
}

function validJob(overrides?: Partial<SchedulerJobDeclarationInput>): SchedulerJobDeclarationInput {
  return {
    organization_id: 'org-026h',
    actor_user_id: 'actor-026h',
    owner_module: 'core.workflow',
    job_key: 'workflow.communication.reminder',
    queue_key: 'platform.scheduler.communication',
    cadence: 'manual',
    payload_schema_key: 'workflow.communication.reminder.v1',
    payload_shape: {
      workflow_instance_id: 'string',
      recipient_ref: 'string',
    },
    idempotency_key: 'scheduler-026h',
    retry_policy: {
      max_attempts: 3,
      backoff_ms: 60_000,
    },
    dead_letter: {
      enabled: true,
      queue_key: 'platform.scheduler.communication.dead_letter',
    },
    risk_classification: 'medium',
    ...overrides,
  };
}

function dependencies(): SchedulerRuntimeDependency[] {
  return [
    {
      dependency_key: 'platform.communication.send',
      dependency_type: 'module_capability',
    },
    {
      dependency_key: 'platform.scheduler.communication',
      dependency_type: 'platform_queue',
    },
  ];
}

function testCommunicationTenantIsolationFixtureRejectsCrossTenantHandoff() {
  const service = new CommunicationService();
  const intent = service.declareIntent(validIntent());
  const handoff = service.buildEngagementGatewayHandoff(intent);
  const deliveryProof = service.recordLocalStubDelivery(handoff, '2026-05-29T00:05:00.000Z');

  const result = service.runTenantIsolationFixture({
    organization_id: 'org-026h',
    actor_user_id: 'actor-026h',
    intent,
    handoff,
    delivery_proof: deliveryProof,
  });

  assert.equal(result.communication_tenant_isolation_enforced, true);
  assert.equal(result.consent_risk_boundary_preserved, true);
  assert.equal(result.delivery_executed, false);
  assert.equal(result.production_provider_calls, false);

  assert.throws(
    () =>
      service.runTenantIsolationFixture({
        organization_id: 'org-026h',
        actor_user_id: 'actor-026h',
        intent,
        handoff: {
          ...handoff,
          organization_id: 'org-foreign',
        },
        delivery_proof: deliveryProof,
      }),
    BadRequestException,
  );
}

function testCommunicationTenantIsolationFixtureRejectsCrossTenantDeliveryProof() {
  const service = new CommunicationService();
  const intent = service.declareIntent(validIntent());
  const handoff = service.buildEngagementGatewayHandoff(intent);
  const deliveryProof = service.recordLocalStubDelivery(handoff, '2026-05-29T00:05:00.000Z');

  assert.throws(
    () =>
      service.runTenantIsolationFixture({
        organization_id: 'org-026h',
        actor_user_id: 'actor-026h',
        intent,
        handoff,
        delivery_proof: {
          ...deliveryProof,
          organization_id: 'org-foreign',
        },
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.runTenantIsolationFixture({
        organization_id: 'org-026h',
        actor_user_id: 'actor-026h',
        intent,
        handoff,
        delivery_proof: {
          ...deliveryProof,
          live_dispatch: true as false,
        },
      }),
    BadRequestException,
  );
}

function testSchedulerTenantIsolationRejectsCrossTenantSafetyBoundary() {
  const service = new SchedulerService();
  const declaration = service.declareJob(validJob());
  const boundary = service.defineRuntimeBoundary(declaration, dependencies());
  const baseline = service.declareSafetyDeadLetterBaseline(declaration, boundary);

  assert.equal(declaration.organization_id, 'org-026h');
  assert.equal(boundary.organization_id, 'org-026h');
  assert.equal(baseline.organization_id, 'org-026h');
  assert.equal(boundary.queue_enqueued, false);
  assert.equal(boundary.worker_started, false);
  assert.equal(baseline.production_queue_connected, false);
  assert.equal(baseline.tenant_context_required, true);

  assert.throws(
    () =>
      service.declareSafetyDeadLetterBaseline(declaration, {
        ...boundary,
        organization_id: 'org-foreign',
      }),
    BadRequestException,
  );
}

function testSchedulerTenantIsolationRejectsDuplicateOrMalformedDependencies() {
  const service = new SchedulerService();
  const declaration = service.declareJob(validJob());

  assert.throws(
    () =>
      service.defineRuntimeBoundary(declaration, [
        {
          dependency_key: 'platform.communication.send',
          dependency_type: 'module_capability',
        },
        {
          dependency_key: 'platform.communication.send',
          dependency_type: 'module_capability',
        },
      ]),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.defineRuntimeBoundary(declaration, [
        {
          dependency_key: ' ',
          dependency_type: 'platform_queue',
        },
      ]),
    BadRequestException,
  );
}

function run() {
  testCommunicationTenantIsolationFixtureRejectsCrossTenantHandoff();
  testCommunicationTenantIsolationFixtureRejectsCrossTenantDeliveryProof();
  testSchedulerTenantIsolationRejectsCrossTenantSafetyBoundary();
  testSchedulerTenantIsolationRejectsDuplicateOrMalformedDependencies();

  console.log('P5B-026h communication/scheduler cross-tenant negative tests passed.');
}

run();
