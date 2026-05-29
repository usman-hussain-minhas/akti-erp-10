import assert from 'node:assert/strict';

import {
  STRUCTURED_LOG_REDACTED_VALUE,
  StructuredLoggerService,
  type StructuredLogInput,
} from './structured-logger.service';

function validInput(overrides?: Partial<StructuredLogInput>): StructuredLogInput {
  return {
    level: 'warn',
    message: 'Gatekeeper migration review required.',
    organization_id: 'org-029b',
    actor_user_id: 'actor-029b',
    correlation_id: 'corr-029b',
    source_module: 'gatekeeper',
    action_key: 'gatekeeper.migration.stop_for_review',
    entity_type: 'module.migration',
    entity_id: 'migration-029b',
    metadata: {
      outcome: 'STOP_FOR_REVIEW',
    },
    ...overrides,
  };
}

function assertSerializedLogDoesNotContain(entry: unknown, forbidden: string[]) {
  const serialized = JSON.stringify(entry);
  for (const value of forbidden) {
    assert.equal(serialized.includes(value), false, `structured log must not contain ${value}`);
  }
}

function testStructuredLoggerRedactsTopLevelSecretFields() {
  const entry = new StructuredLoggerService().buildEntry(
    validInput({
      metadata: {
        api_key: 'api-key-value-029b',
        access_token: 'token-value-029b',
        safe_field: 'safe-value',
      },
    }),
    '2026-05-29T10:00:00.000Z',
  );

  assert.equal(entry.metadata.api_key, STRUCTURED_LOG_REDACTED_VALUE);
  assert.equal(entry.metadata.access_token, STRUCTURED_LOG_REDACTED_VALUE);
  assert.equal(entry.metadata.safe_field, 'safe-value');
  assert.deepEqual(entry.redacted_fields.sort(), ['access_token', 'api_key']);
  assertSerializedLogDoesNotContain(entry, ['api-key-value-029b', 'token-value-029b']);
}

function testStructuredLoggerRedactsNestedSecretFields() {
  const entry = new StructuredLoggerService().buildEntry(
    validInput({
      metadata: {
        request: {
          headers: {
            authorization: 'Bearer secret-token-029b',
            cookie: 'session-cookie-029b',
          },
          body: {
            credential_ref: 'credential-029b',
            public_note: 'visible',
          },
        },
      },
    }),
    '2026-05-29T10:00:00.000Z',
  );

  const request = entry.metadata.request as Record<string, unknown>;
  const headers = request.headers as Record<string, unknown>;
  const body = request.body as Record<string, unknown>;

  assert.equal(headers.authorization, STRUCTURED_LOG_REDACTED_VALUE);
  assert.equal(headers.cookie, STRUCTURED_LOG_REDACTED_VALUE);
  assert.equal(body.credential_ref, STRUCTURED_LOG_REDACTED_VALUE);
  assert.equal(body.public_note, 'visible');
  assert.deepEqual(entry.redacted_fields.sort(), [
    'request.body.credential_ref',
    'request.headers.authorization',
    'request.headers.cookie',
  ]);
  assertSerializedLogDoesNotContain(entry, ['secret-token-029b', 'session-cookie-029b', 'credential-029b']);
}

function testStructuredLoggerRedactsArraySecretFields() {
  const entry = new StructuredLoggerService().buildEntry(
    validInput({
      metadata: {
        attempts: [
          {
            provider_secret: 'provider-secret-029b',
          },
          {
            result: 'blocked',
          },
        ],
      },
    }),
    '2026-05-29T10:00:00.000Z',
  );

  const attempts = entry.metadata.attempts as Array<Record<string, unknown>>;

  assert.equal(attempts[0].provider_secret, STRUCTURED_LOG_REDACTED_VALUE);
  assert.equal(attempts[1].result, 'blocked');
  assert.deepEqual(entry.redacted_fields, ['attempts.0.provider_secret']);
  assertSerializedLogDoesNotContain(entry, ['provider-secret-029b']);
}

function testStructuredLoggerDoesNotRedactBenignCorrelationContext() {
  const entry = new StructuredLoggerService().buildEntry(validInput(), '2026-05-29T10:00:00.000Z');

  assert.equal(entry.organization_id, 'org-029b');
  assert.equal(entry.actor_user_id, 'actor-029b');
  assert.equal(entry.correlation_id, 'corr-029b');
  assert.deepEqual(entry.redacted_fields, []);
}

function run() {
  testStructuredLoggerRedactsTopLevelSecretFields();
  testStructuredLoggerRedactsNestedSecretFields();
  testStructuredLoggerRedactsArraySecretFields();
  testStructuredLoggerDoesNotRedactBenignCorrelationContext();

  console.log('P5B-029b redaction/no-secret logging tests passed.');
}

run();
