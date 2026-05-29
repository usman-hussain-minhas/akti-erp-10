import assert from 'node:assert/strict';

import { UnauthorizedException } from '@nestjs/common';

import { PlatformHealthController } from './platform-health.controller';
import { type HeaderRecord, createPhase3SessionToken } from '../security/request-context';

const AUTH_SECRET = 'phase5b1-cross-substrate-status-secret';
process.env.AKTI_AUTH_SESSION_SECRET = AUTH_SECRET;

function trustedHeaders(organizationId = 'org-alpha', actorUserId = 'actor-alpha'): HeaderRecord {
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

function testStatusOverviewIsTenantScoped() {
  const result = createController().getPlatformStatusOverview(trustedHeaders());

  assert.deepEqual(result.tenant_context, {
    organization_id: 'org-alpha',
    actor_user_id: 'actor-alpha',
  });
  assert.equal(JSON.stringify(result).includes('org-beta'), false);
  assert.equal(JSON.stringify(result).includes('actor-beta'), false);
}

function testStatusOverviewContainsHonestUnavailableStatesOnly() {
  const result = createController().getPlatformStatusOverview(trustedHeaders());

  assert.deepEqual(result.status, {
    workspace_connection: 'not_connected',
    crm_pipeline: 'unavailable',
    platform_services: 'offline',
    data_controls: 'unavailable',
  });
  assert.equal(result.capability.required, 'platform.shell.access');
  assert.equal(result.sources.boundary, 'platform-health');
  assert.equal(result.sources.platform_observability_inspected, true);

  const serialized = JSON.stringify(result).toLowerCase();
  for (const forbidden of ['revenue', 'pipeline_value', 'lead_count', 'task_count', 'conversion_rate', 'whatsapp']) {
    assert.equal(serialized.includes(forbidden), false);
  }
}

function testStatusOverviewRequiresTrustedSession() {
  assert.throws(() => createController().getPlatformStatusOverview({}), UnauthorizedException);
}

testStatusOverviewIsTenantScoped();
testStatusOverviewContainsHonestUnavailableStatesOnly();
testStatusOverviewRequiresTrustedSession();

console.log('P5B1-024 platform status tenant-scope tests passed.');
