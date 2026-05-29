import assert from 'node:assert/strict';

import { PlatformHealthController } from './platform-health.controller';
import { type HeaderRecord, createPhase3SessionToken } from '../security/request-context';

const AUTH_SECRET = 'phase5b-platform-health-slo-secret';
process.env.AKTI_AUTH_SESSION_SECRET = AUTH_SECRET;

function trustedHeaders(correlationId?: string): HeaderRecord {
  return {
    authorization: `Bearer ${createPhase3SessionToken(
      {
        organization_id: 'org-031b',
        actor_user_id: 'actor-031b',
        issued_at: new Date(Date.now() - 60_000).toISOString(),
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
      AUTH_SECRET,
    )}`,
    ...(correlationId ? { 'x-correlation-id': correlationId } : {}),
  };
}

function createController(moduleRows: Array<{ module_key: string; display_name: string; version: string; status: string }>) {
  const service = {
    listModules: async () => ({
      items: moduleRows.map((row) => ({
        ...row,
        manifest_hash: 'a'.repeat(64),
      })),
    }),
  };

  return new PlatformHealthController(service as never);
}

async function testHealthyResponseIncludesSloTelemetryBaseline() {
  const controller = createController([
    {
      module_key: 'core.access',
      display_name: 'Access Core',
      version: '0.1.0',
      status: 'enabled',
    },
    {
      module_key: 'engagement.gateway',
      display_name: 'Engagement Gateway Lite',
      version: '0.1.0',
      status: 'available',
    },
  ]);

  const response = await controller.getPlatformHealth(trustedHeaders('corr-p5b-031b'));

  assert.equal(response.slo.telemetry_baseline, true);
  assert.equal(response.slo.source, 'platform.health');
  assert.equal(response.slo.status, 'healthy');
  assert.equal(response.slo.target_met, true);
  assert.equal(response.slo.targets.availability_target_percent, 99.5);
  assert.equal(response.slo.targets.latency_p95_target_ms, 500);
  assert.deepEqual(response.slo.measurement, {
    module_count: 2,
    healthy_count: 2,
    degraded_count: 0,
    blocked_count: 0,
  });
  assert.equal(response.telemetry.structured_log.structured, true);
  assert.equal(response.telemetry.structured_log.level, 'info');
  assert.equal(response.telemetry.structured_log.organization_id, 'org-031b');
  assert.equal(response.telemetry.structured_log.actor_user_id, 'actor-031b');
  assert.equal(response.telemetry.structured_log.correlation_id, 'corr-p5b-031b');
  assert.equal(response.telemetry.structured_log.source_module, 'platform-health');
  assert.equal(response.telemetry.structured_log.action_key, 'platform.health.read');
  assert.equal(response.telemetry.structured_log.entity_type, 'platform.health');
  assert.equal(response.telemetry.structured_log.entity_id, null);
  assert.deepEqual(response.telemetry.structured_log.metadata, {
    slo: response.slo,
  });
}

async function testDegradedResponseEmitsWarningSloTelemetry() {
  const controller = createController([
    {
      module_key: 'core.access',
      display_name: 'Access Core',
      version: '0.1.0',
      status: 'enabled',
    },
    {
      module_key: 'platform.fixture',
      display_name: 'Platform Fixture',
      version: '0.1.0',
      status: 'rollback_required',
    },
  ]);

  const response = await controller.getPlatformHealth(trustedHeaders('corr-p5b-031b-degraded'));

  assert.equal(response.status, 'degraded');
  assert.equal(response.slo.target_met, false);
  assert.equal(response.slo.measurement.degraded_count, 1);
  assert.equal(response.telemetry.structured_log.level, 'warn');
  assert.deepEqual(response.telemetry.structured_log.metadata.slo, response.slo);
}

async function testCorrelationFallbackIsDeterministicAndNonSecret() {
  const controller = createController([]);

  const response = await controller.getPlatformHealth(trustedHeaders());

  assert.equal(response.telemetry.structured_log.correlation_id, 'platform-health.org-031b.actor-031b');
  assert.equal(response.telemetry.structured_log.redacted_fields.length, 0);
}

async function run() {
  await testHealthyResponseIncludesSloTelemetryBaseline();
  await testDegradedResponseEmitsWarningSloTelemetry();
  await testCorrelationFallbackIsDeterministicAndNonSecret();

  console.log('P5B-031b platform health SLO telemetry baseline tests passed.');
}

void run();
