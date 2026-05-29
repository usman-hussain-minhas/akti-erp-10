import assert from 'node:assert/strict';

import { UnauthorizedException } from '@nestjs/common';

import { DataControlsController } from './data-controls.controller';
import { DataControlsService } from './data-controls.service';
import { type HeaderRecord, createPhase3SessionToken } from '../security/request-context';

const AUTH_SECRET = 'phase5b1-cross-substrate-data-controls-secret';
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

function testDataControlsStatusIsTenantScoped() {
  const result = new DataControlsController(new DataControlsService()).getStatus(trustedHeaders());

  assert.deepEqual(result.tenant_context, {
    organization_id: 'org-alpha',
    actor_user_id: 'actor-alpha',
  });
  assert.equal(JSON.stringify(result).includes('org-beta'), false);
  assert.equal(JSON.stringify(result).includes('actor-beta'), false);
}

function testDataControlsStatusDoesNotGrantExecutionAuthority() {
  const result = new DataControlsService().getStatus({
    organization_id: 'org-alpha',
    actor_user_id: 'actor-alpha',
  });

  assert.equal(result.import_export, 'unavailable');
  assert.equal(result.retention_policy, 'inactive');
  assert.equal(result.audit_controls, 'inactive');
  assert.equal(result.capability.required, 'platform.data.controls.view');
  assert.deepEqual(result.execution, {
    import_run_enabled: false,
    export_run_enabled: false,
    backup_restore_enabled: false,
    retention_workflow_enabled: false,
  });
}

function testDataControlsRequiresTrustedSession() {
  assert.throws(() => new DataControlsController(new DataControlsService()).getStatus({}), UnauthorizedException);
}

testDataControlsStatusIsTenantScoped();
testDataControlsStatusDoesNotGrantExecutionAuthority();
testDataControlsRequiresTrustedSession();

console.log('P5B1-024 data-controls tenant-scope tests passed.');
