import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { BadRequestException, RequestMethod, UnauthorizedException } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';

import { DataControlsController } from './data-controls.controller';
import { DataControlsService } from './data-controls.service';
import { type HeaderRecord, createPhase3SessionToken } from '../security/request-context';

const AUTH_SECRET = 'phase5b1-data-controls-status-secret';
process.env.AKTI_AUTH_SESSION_SECRET = AUTH_SECRET;

function trustedHeaders(organizationId = 'org-022', actorUserId = 'actor-022'): HeaderRecord {
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

function readSources(dir: string) {
  return readdirSync(dir)
    .filter((file) => file.endsWith('.ts') && !file.includes('.test.'))
    .map((file) => readFileSync(join(dir, file), 'utf8'))
    .join('\n')
    .toLowerCase();
}

function testControllerRouteMetadata() {
  const descriptor = Object.getOwnPropertyDescriptor(DataControlsController.prototype, 'getStatus');

  assert.ok(descriptor?.value);
  assert.equal(Reflect.getMetadata(PATH_METADATA, DataControlsController), 'platform/data-controls');
  assert.equal(Reflect.getMetadata(PATH_METADATA, descriptor.value), 'status');
  assert.equal(Reflect.getMetadata(METHOD_METADATA, descriptor.value), RequestMethod.GET);
}

function testStatusReturnsHonestUnavailableInactiveState() {
  const result = new DataControlsService().getStatus({
    organization_id: 'org-022',
    actor_user_id: 'actor-022',
  });

  assert.equal(result.import_export, 'unavailable');
  assert.equal(result.retention_policy, 'inactive');
  assert.equal(result.audit_controls, 'inactive');
  assert.deepEqual(result.tenant_context, {
    organization_id: 'org-022',
    actor_user_id: 'actor-022',
  });
  assert.equal(result.capability.required, 'platform.data.controls.view');
  assert.deepEqual(result.execution, {
    import_run_enabled: false,
    export_run_enabled: false,
    backup_restore_enabled: false,
    retention_workflow_enabled: false,
  });
}

function testStatusRejectsMissingContext() {
  const service = new DataControlsService();

  assert.throws(() => service.getStatus({ organization_id: '', actor_user_id: 'actor-022' }), BadRequestException);
  assert.throws(() => service.getStatus({ organization_id: 'org-022', actor_user_id: '' }), BadRequestException);
}

function testControllerUsesTrustedContextAndRejectsMissingSession() {
  const calls: Array<{ input: unknown }> = [];
  const service = {
    getStatus: (input: unknown) => {
      calls.push({ input });
      return new DataControlsService().getStatus(input as { organization_id: string; actor_user_id: string });
    },
  };
  const controller = new DataControlsController(service as never);

  const result = controller.getStatus(trustedHeaders());

  assert.equal(result.import_export, 'unavailable');
  assert.deepEqual(calls[0].input, {
    organization_id: 'org-022',
    actor_user_id: 'actor-022',
  });
  assert.throws(() => controller.getStatus({}), UnauthorizedException);
}

function testNoExecutionWorkflowWasAdded() {
  const dataControlsSource = readSources('src/data-controls');
  const source = [
    dataControlsSource,
    readSources('src/import-export'),
    readSources('src/reporting'),
    readSources('src/file-service'),
  ].join('\n');

  for (const forbidden of [
    'createimportjob',
    'runexport',
    'runimport',
    'backuprestore',
    'retentionjob',
    'business report execution',
  ]) {
    assert.equal(source.includes(forbidden), false);
  }
}

testControllerRouteMetadata();
testStatusReturnsHonestUnavailableInactiveState();
testStatusRejectsMissingContext();
testControllerUsesTrustedContextAndRejectsMissingSession();
testNoExecutionWorkflowWasAdded();

console.log('P5B1-022 data controls status API tests passed.');
