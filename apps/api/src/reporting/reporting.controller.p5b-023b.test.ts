import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { BadRequestException, RequestMethod, UnauthorizedException } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';

import { buildEventEnvelope } from '../platform-observability/event-outbox.service';
import { type HeaderRecord, createPhase3SessionToken } from '../security/request-context';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';

const AUTH_SECRET = 'phase5b-reporting-api-secret';
process.env.AKTI_AUTH_SESSION_SECRET = AUTH_SECRET;

function trustedHeaders(organizationId = 'org-023b', actorUserId = 'actor-023b'): HeaderRecord {
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

function validQuery(overrides?: Record<string, unknown>) {
  return {
    capability_keys: 'platform.reporting.read',
    limit: '10',
    cursor: 'cursor-023b',
    ...overrides,
  };
}

function readModelEntry() {
  return new ReportingService().consumeEventForReadModel({
    read_model_key: 'workflow.instance.summary',
    event: buildEventEnvelope({
      organization_id: 'org-023b',
      event_type: 'workflow.instance.updated',
      idempotency_key: 'event-023b-workflow-instance-updated',
      source_module: 'core.workflow',
      occurred_at: new Date('2026-05-29T04:00:00.000Z'),
      subject: {
        entity_type: 'WorkflowInstance',
        entity_id: 'workflow-instance-023b',
      },
      payload: {
        workflow_key: 'platform.approval_flow',
      },
    }),
    projection_payload: {
      workflow_key: 'platform.approval_flow',
      current_state: 'review_requested',
    },
  }).entry;
}

function testReadModelRouteMetadataIsExplicit() {
  const descriptor = Object.getOwnPropertyDescriptor(ReportingController.prototype, 'queryReadModel');

  assert.ok(descriptor?.value);
  assert.equal(Reflect.getMetadata(PATH_METADATA, ReportingController), 'platform/read-models');
  assert.equal(Reflect.getMetadata(PATH_METADATA, descriptor.value), ':key');
  assert.equal(Reflect.getMetadata(METHOD_METADATA, descriptor.value), RequestMethod.GET);
}

function testReadModelApiUsesTrustedContextCapabilityGatekeeperAndAuditShape() {
  const controller = new ReportingController(new ReportingService());
  const response = controller.queryReadModel('workflow.instance.summary', validQuery(), trustedHeaders());

  assert.equal(response.method, 'GET');
  assert.equal(response.route, '/platform/read-models/:key');
  assert.equal(response.request_shape, 'ReadModelQueryRequest');
  assert.equal(response.response_shape, 'ReadModelQueryResponse');
  assert.deepEqual(response.request, {
    read_model_key: 'workflow.instance.summary',
    capability_keys: ['platform.reporting.read'],
    limit: 10,
    cursor: 'cursor-023b',
  });
  assert.equal(response.capability.required, 'platform.reporting.read');
  assert.deepEqual(response.capability.target_capability_filter, ['platform.reporting.read']);
  assert.deepEqual(response.tenant_context, {
    organization_id: 'org-023b',
    actor_user_id: 'actor-023b',
  });
  assert.equal(response.gatekeeper.risk_check_required, true);
  assert.equal(response.gatekeeper.data_source_validation_required, true);
  assert.equal(response.gatekeeper.capability_key, 'platform.reporting.read');
  assert.equal(response.audit.event_type, 'read_model.query.executed');
  assert.equal(response.audit.audit_required, true);
  assert.deepEqual(response.items, []);
  assert.deepEqual(response.page, {
    limit: 10,
    cursor: 'cursor-023b',
    next_cursor: null,
  });
  assert.equal(response.direct_cross_module_table_read, false);
  assert.equal(response.business_report_created, false);
}

function testReadModelServiceFiltersItemsByTenantAndKeyWithoutBusinessReports() {
  const service = new ReportingService();
  const response = service.queryReadModel({
    organization_id: 'org-023b',
    actor_user_id: 'actor-023b',
    read_model_key: 'workflow.instance.summary',
    capability_keys: ['platform.reporting.read'],
    entries: [
      readModelEntry(),
      {
        ...readModelEntry(),
        organization_id: 'other-org',
      },
      {
        ...readModelEntry(),
        read_model_key: 'other.read.model',
      },
    ],
  });

  assert.equal(response.items.length, 1);
  assert.equal(response.items[0]?.organization_id, 'org-023b');
  assert.equal(response.items[0]?.read_model_key, 'workflow.instance.summary');
  assert.equal(response.items[0]?.direct_cross_module_table_read, false);
  assert.equal(response.items[0]?.fake_operational_data, false);
  assert.equal(response.business_report_created, false);
}

function testReadModelApiRejectsInvalidRequestsAndUnauthenticatedContext() {
  const controller = new ReportingController(new ReportingService());

  assert.throws(() => controller.queryReadModel('', validQuery(), trustedHeaders()), BadRequestException);
  assert.throws(() => controller.queryReadModel('workflow.instance.summary', validQuery({ capability_keys: '' }), trustedHeaders()), BadRequestException);
  assert.throws(
    () => controller.queryReadModel('workflow.instance.summary', validQuery({ capability_keys: 'platform.file.read' }), trustedHeaders()),
    BadRequestException,
  );
  assert.throws(
    () =>
      controller.queryReadModel(
        'workflow.instance.summary',
        validQuery({ capability_keys: 'platform.reporting.read,platform.reporting.read' }),
        trustedHeaders(),
      ),
    BadRequestException,
  );
  assert.throws(() => controller.queryReadModel('workflow.instance.summary', validQuery({ limit: '0' }), trustedHeaders()), BadRequestException);
  assert.throws(() => controller.queryReadModel('workflow.instance.summary', validQuery({ limit: '101' }), trustedHeaders()), BadRequestException);
  assert.throws(() => controller.queryReadModel('workflow.instance.summary', validQuery(), {}), UnauthorizedException);
}

function testAppModuleRegistersReportingApiSurface() {
  const appModuleSource = readFileSync('src/app.module.ts', 'utf8');

  assert.equal(appModuleSource.includes('ReportingController'), true);
  assert.equal(appModuleSource.includes('ReportingService'), true);
}

function run() {
  testReadModelRouteMetadataIsExplicit();
  testReadModelApiUsesTrustedContextCapabilityGatekeeperAndAuditShape();
  testReadModelServiceFiltersItemsByTenantAndKeyWithoutBusinessReports();
  testReadModelApiRejectsInvalidRequestsAndUnauthenticatedContext();
  testAppModuleRegistersReportingApiSurface();

  console.log('P5B-023b Reporting/read-model query API tests passed.');
}

run();
