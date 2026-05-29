import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { StructuredLoggerService, type StructuredLogInput } from './structured-logger.service';

function validInput(overrides?: Partial<StructuredLogInput>): StructuredLogInput {
  return {
    level: 'info',
    message: 'Gatekeeper decision recorded.',
    organization_id: 'org-029a',
    actor_user_id: 'actor-029a',
    correlation_id: 'corr-029a',
    source_module: 'gatekeeper',
    action_key: 'gatekeeper.preflight.decided',
    entity_type: 'gatekeeper.decision',
    entity_id: 'decision-029a',
    metadata: {
      outcome: 'ALLOW',
      risk_surface: 'platform',
    },
    ...overrides,
  };
}

function testStructuredLogIncludesRequiredCorrelationContext() {
  const entry = new StructuredLoggerService().buildEntry(validInput(), '2026-05-29T09:00:00.000Z');

  assert.equal(entry.structured, true);
  assert.equal(entry.level, 'info');
  assert.equal(entry.organization_id, 'org-029a');
  assert.equal(entry.actor_user_id, 'actor-029a');
  assert.equal(entry.correlation_id, 'corr-029a');
  assert.equal(entry.source_module, 'gatekeeper');
  assert.equal(entry.action_key, 'gatekeeper.preflight.decided');
  assert.equal(entry.entity_type, 'gatekeeper.decision');
  assert.equal(entry.entity_id, 'decision-029a');
  assert.equal(entry.emitted_at, '2026-05-29T09:00:00.000Z');
  assert.deepEqual(entry.metadata, {
    outcome: 'ALLOW',
    risk_surface: 'platform',
  });
}

function testStructuredLogRejectsMissingCorrelationAndTenantContext() {
  const service = new StructuredLoggerService();

  assert.throws(() => service.buildEntry(validInput({ correlation_id: '' })), BadRequestException);
  assert.throws(() => service.buildEntry(validInput({ organization_id: '' })), BadRequestException);
  assert.throws(() => service.buildEntry(validInput({ actor_user_id: '' })), BadRequestException);
}

function testStructuredLogRejectsInvalidLevelTimestampAndMetadata() {
  const service = new StructuredLoggerService();

  assert.throws(() => service.buildEntry(validInput({ level: 'trace' as StructuredLogInput['level'] })), BadRequestException);
  assert.throws(() => service.buildEntry(validInput(), 'not-a-date'), BadRequestException);
  assert.throws(() => service.buildEntry(validInput({ metadata: [] as never })), BadRequestException);
}

function testStructuredLogAllowsNullEntityIdForAggregateEvents() {
  const entry = new StructuredLoggerService().buildEntry(
    validInput({
      entity_type: 'platform.health',
      entity_id: null,
    }),
    '2026-05-29T09:00:00.000Z',
  );

  assert.equal(entry.entity_type, 'platform.health');
  assert.equal(entry.entity_id, null);
}

function run() {
  testStructuredLogIncludesRequiredCorrelationContext();
  testStructuredLogRejectsMissingCorrelationAndTenantContext();
  testStructuredLogRejectsInvalidLevelTimestampAndMetadata();
  testStructuredLogAllowsNullEntityIdForAggregateEvents();

  console.log('P5B-029a structured logging/correlation context tests passed.');
}

run();
