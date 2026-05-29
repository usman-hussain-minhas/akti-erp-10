import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { BadRequestException, RequestMethod, UnauthorizedException } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';

import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { type HeaderRecord, createPhase3SessionToken } from '../security/request-context';

const AUTH_SECRET = 'phase5b-search-api-baseline-secret';
process.env.AKTI_AUTH_SESSION_SECRET = AUTH_SECRET;

function trustedHeaders(organizationId = 'org-019b', actorUserId = 'actor-019b'): HeaderRecord {
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
    q: 'approval flow',
    capability_keys: 'platform.workflow.read',
    target_keys: 'workflow_definition,workflow_instance',
    limit: '10',
    cursor: 'cursor-019b',
    ...overrides,
  };
}

function testSearchRouteMetadataIsExplicit() {
  const descriptor = Object.getOwnPropertyDescriptor(SearchController.prototype, 'search');

  assert.ok(descriptor?.value);
  assert.equal(Reflect.getMetadata(PATH_METADATA, SearchController), 'platform/search');
  assert.ok([undefined, '', '/'].includes(Reflect.getMetadata(PATH_METADATA, descriptor.value)));
  assert.equal(Reflect.getMetadata(METHOD_METADATA, descriptor.value), RequestMethod.GET);
}

function testSearchApiUsesTrustedContextCapabilityGatekeeperAndAuditShape() {
  const controller = new SearchController(new SearchService());

  const response = controller.search(validQuery(), trustedHeaders());

  assert.equal(response.method, 'GET');
  assert.equal(response.route, '/platform/search');
  assert.equal(response.request.query, 'approval flow');
  assert.deepEqual(response.request.target_keys, ['workflow_definition', 'workflow_instance']);
  assert.equal(response.request.limit, 10);
  assert.equal(response.request.cursor, 'cursor-019b');
  assert.deepEqual(response.response_shape, {
    items: 'SearchResultItem[]',
    page: '{ limit, cursor, next_cursor }',
  });
  assert.equal(response.capability.required, 'platform.search.query');
  assert.deepEqual(response.capability.target_capability_filter, ['platform.workflow.read']);
  assert.deepEqual(response.tenant_context, {
    organization_id: 'org-019b',
    actor_user_id: 'actor-019b',
  });
  assert.equal(response.gatekeeper.risk_check_required, true);
  assert.equal(response.gatekeeper.capability_key, 'platform.search.query');
  assert.equal(response.gatekeeper.exposure_surface, 'search_index_visibility');
  assert.equal(response.audit.event_type, 'search.query.executed');
  assert.equal(response.audit.audit_required, true);
  assert.deepEqual(response.items, []);
  assert.equal(response.page.next_cursor, null);
  assert.equal(response.query_plan.tenant_filter_required, true);
  assert.equal(response.query_plan.capability_filter_required, true);
}

function testSearchApiSupportsArrayQueryParamsAndDefaults() {
  const controller = new SearchController(new SearchService());

  const response = controller.search(
    {
      q: 'workflow',
      capability_keys: ['platform.workflow.read'],
      target_keys: ['workflow_definition'],
    },
    trustedHeaders(),
  );

  assert.deepEqual(response.request.target_keys, ['workflow_definition']);
  assert.equal(response.request.limit, 25);
  assert.equal(response.request.cursor, null);
  assert.equal(response.page.limit, 25);
  assert.equal(response.query_plan.targets[0].model_name, 'WorkflowDefinition');
}

function testSearchApiRejectsInvalidRequestsAndUnauthenticatedContext() {
  const controller = new SearchController(new SearchService());

  assert.throws(() => controller.search(validQuery({ q: ' ' }), trustedHeaders()), BadRequestException);
  assert.throws(() => controller.search(validQuery({ q: 'a' }), trustedHeaders()), BadRequestException);
  assert.throws(() => controller.search(validQuery({ capability_keys: '' }), trustedHeaders()), BadRequestException);
  assert.throws(
    () => controller.search(validQuery({ capability_keys: 'platform.workflow.read,platform.workflow.read' }), trustedHeaders()),
    BadRequestException,
  );
  assert.throws(() => controller.search(validQuery({ target_keys: 'lead_record' }), trustedHeaders()), BadRequestException);
  assert.throws(() => controller.search(validQuery({ limit: '0' }), trustedHeaders()), BadRequestException);
  assert.throws(() => controller.search(validQuery({ limit: '101' }), trustedHeaders()), BadRequestException);
  assert.throws(() => controller.search(validQuery(), {}), UnauthorizedException);
}

function testAppModuleRegistersSearchApiSurface() {
  const appModuleSource = readFileSync('src/app.module.ts', 'utf8');

  assert.equal(appModuleSource.includes('SearchController'), true);
  assert.equal(appModuleSource.includes('SearchService'), true);
}

function run() {
  testSearchRouteMetadataIsExplicit();
  testSearchApiUsesTrustedContextCapabilityGatekeeperAndAuditShape();
  testSearchApiSupportsArrayQueryParamsAndDefaults();
  testSearchApiRejectsInvalidRequestsAndUnauthenticatedContext();
  testAppModuleRegistersSearchApiSurface();

  console.log('P5B-019b Search service/API tests passed.');
}

run();
