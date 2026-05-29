import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { buildEventEnvelope } from '../platform-observability/event-outbox.service';
import { ReportingService, type ReportingReadModelEntryWrite } from './reporting.service';

function entryFor(
  organizationId: string,
  readModelKey = 'workflow.instance.summary',
  idempotencyKey = `event-023c-${organizationId}-${readModelKey}`,
): ReportingReadModelEntryWrite {
  return new ReportingService().consumeEventForReadModel({
    read_model_key: readModelKey,
    event: buildEventEnvelope({
      organization_id: organizationId,
      event_type: 'workflow.instance.updated',
      idempotency_key: idempotencyKey,
      source_module: 'core.workflow',
      occurred_at: new Date('2026-05-29T05:00:00.000Z'),
      subject: {
        entity_type: 'WorkflowInstance',
        entity_id: `workflow-instance-${organizationId}`,
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

function testReportingQueryReturnsOnlyMatchingTenantAndReadModel() {
  const service = new ReportingService();
  const response = service.queryReadModel({
    organization_id: 'org-023c-a',
    actor_user_id: 'actor-023c',
    read_model_key: 'workflow.instance.summary',
    capability_keys: ['platform.reporting.read'],
    entries: [
      entryFor('org-023c-a', 'workflow.instance.summary', 'event-023c-a-1'),
      entryFor('org-023c-b', 'workflow.instance.summary', 'event-023c-b-1'),
      entryFor('org-023c-a', 'workflow.instance.detail', 'event-023c-a-2'),
    ],
  });

  assert.equal(response.items.length, 1);
  assert.equal(response.items[0]?.organization_id, 'org-023c-a');
  assert.equal(response.items[0]?.read_model_key, 'workflow.instance.summary');
  assert.equal(response.items[0]?.subject_id, 'workflow-instance-org-023c-a');
  assert.equal(response.tenant_context.organization_id, 'org-023c-a');
}

function testReportingQueryRejectsMissingTenantActorCapabilityAndDuplicateCapabilities() {
  const service = new ReportingService();

  assert.throws(
    () =>
      service.queryReadModel({
        organization_id: '',
        actor_user_id: 'actor-023c',
        read_model_key: 'workflow.instance.summary',
        capability_keys: ['platform.reporting.read'],
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.queryReadModel({
        organization_id: 'org-023c-a',
        actor_user_id: '',
        read_model_key: 'workflow.instance.summary',
        capability_keys: ['platform.reporting.read'],
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.queryReadModel({
        organization_id: 'org-023c-a',
        actor_user_id: 'actor-023c',
        read_model_key: 'workflow.instance.summary',
        capability_keys: ['platform.search.query'],
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.queryReadModel({
        organization_id: 'org-023c-a',
        actor_user_id: 'actor-023c',
        read_model_key: 'workflow.instance.summary',
        capability_keys: ['platform.reporting.read', 'platform.reporting.read'],
      }),
    BadRequestException,
  );
}

function testReportingQueryRejectsDirectTableReadOrFakeDataEntries() {
  const service = new ReportingService();
  const entry = entryFor('org-023c-a');

  assert.throws(
    () =>
      service.queryReadModel({
        organization_id: 'org-023c-a',
        actor_user_id: 'actor-023c',
        read_model_key: 'workflow.instance.summary',
        capability_keys: ['platform.reporting.read'],
        entries: [
          {
            ...entry,
            direct_cross_module_table_read: true as false,
          },
        ],
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.queryReadModel({
        organization_id: 'org-023c-a',
        actor_user_id: 'actor-023c',
        read_model_key: 'workflow.instance.summary',
        capability_keys: ['platform.reporting.read'],
        entries: [
          {
            ...entry,
            fake_operational_data: true as false,
          },
        ],
      }),
    BadRequestException,
  );
}

function testReportingQueryPaginatesWithoutCrossTenantNextCursorLeakage() {
  const service = new ReportingService();
  const tenantEntry = entryFor('org-023c-a', 'workflow.instance.summary', 'event-023c-a-1');
  const otherTenantEntry = entryFor('org-023c-b', 'workflow.instance.summary', 'event-023c-b-1');
  const response = service.queryReadModel({
    organization_id: 'org-023c-a',
    actor_user_id: 'actor-023c',
    read_model_key: 'workflow.instance.summary',
    capability_keys: ['platform.reporting.read'],
    limit: 1,
    entries: [tenantEntry, otherTenantEntry],
  });

  assert.equal(response.items.length, 1);
  assert.equal(response.page.next_cursor, tenantEntry.source_event_cursor);
  assert.notEqual(response.page.next_cursor, otherTenantEntry.source_event_cursor);
}

function run() {
  testReportingQueryReturnsOnlyMatchingTenantAndReadModel();
  testReportingQueryRejectsMissingTenantActorCapabilityAndDuplicateCapabilities();
  testReportingQueryRejectsDirectTableReadOrFakeDataEntries();
  testReportingQueryPaginatesWithoutCrossTenantNextCursorLeakage();

  console.log('P5B-023c Reporting tenant isolation tests passed.');
}

run();
