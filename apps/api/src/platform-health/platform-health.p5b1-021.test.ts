import assert from 'node:assert/strict';

import { RequestMethod, UnauthorizedException } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';

import { PlatformHealthController } from './platform-health.controller';
import { type HeaderRecord, createPhase3SessionToken } from '../security/request-context';

const AUTH_SECRET = 'phase5b1-platform-status-overview-secret';
process.env.AKTI_AUTH_SESSION_SECRET = AUTH_SECRET;

function trustedHeaders(organizationId = 'org-021', actorUserId = 'actor-021'): HeaderRecord {
  return {
    authorization: `Bearer ${createPhase3SessionToken(
      {
        organization_id: organizationId,
        actor_user_id: actorUserId,
        issued_at: new Date(Date.now() - 60_000).toISOString(),
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
      AUTH_SECRET,
    )}`,
  };
}

function createController() {
  return new PlatformHealthController({ listModules: async () => ({ items: [] }) } as never);
}

function testStatusOverviewRouteMetadataUsesExistingPlatformBoundary() {
  const descriptor = Object.getOwnPropertyDescriptor(PlatformHealthController.prototype, 'getPlatformStatusOverview');
  const healthDescriptor = Object.getOwnPropertyDescriptor(PlatformHealthController.prototype, 'getPlatformHealth');

  assert.ok(descriptor?.value);
  assert.ok(healthDescriptor?.value);
  assert.equal(Reflect.getMetadata(PATH_METADATA, PlatformHealthController), 'platform');
  assert.equal(Reflect.getMetadata(PATH_METADATA, descriptor.value), 'status/overview');
  assert.equal(Reflect.getMetadata(METHOD_METADATA, descriptor.value), RequestMethod.GET);
  assert.equal(Reflect.getMetadata(PATH_METADATA, healthDescriptor.value), 'health');
}

function testStatusOverviewReturnsHonestCurrentStates() {
  const response = createController().getPlatformStatusOverview(trustedHeaders());

  assert.equal(response.route, '/platform/status/overview');
  assert.deepEqual(response.status, {
    workspace_connection: 'not_connected',
    crm_pipeline: 'unavailable',
    platform_services: 'offline',
    data_controls: 'unavailable',
  });
  assert.deepEqual(response.tenant_context, {
    organization_id: 'org-021',
    actor_user_id: 'actor-021',
  });
  assert.equal(response.capability.required, 'platform.shell.access');
  assert.equal(response.sources.boundary, 'platform-health');
  assert.equal(response.sources.platform_observability_inspected, true);
  assert.equal(response.audit.event_type, 'platform.status.overview.read');
  assert.equal(response.audit.outbox_event_required, false);
}

function testStatusOverviewRejectsMissingSession() {
  assert.throws(() => createController().getPlatformStatusOverview({}), UnauthorizedException);
}

function testStatusOverviewDoesNotInventMetrics() {
  const serialized = JSON.stringify(createController().getPlatformStatusOverview(trustedHeaders())).toLowerCase();

  for (const forbidden of ['revenue', 'pipeline_value', 'lead_count', 'task_count', 'conversion_rate', 'whatsapp']) {
    assert.equal(serialized.includes(forbidden), false);
  }
}

testStatusOverviewRouteMetadataUsesExistingPlatformBoundary();
testStatusOverviewReturnsHonestCurrentStates();
testStatusOverviewRejectsMissingSession();
testStatusOverviewDoesNotInventMetrics();

console.log('P5B1-021 platform status overview tests passed.');
