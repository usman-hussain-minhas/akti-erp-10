import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { BadRequestException, RequestMethod, UnauthorizedException } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';

import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { type HeaderRecord, createPhase3SessionToken } from '../security/request-context';

const AUTH_SECRET = 'phase5b1-notification-summary-secret';
process.env.AKTI_AUTH_SESSION_SECRET = AUTH_SECRET;

function trustedHeaders(organizationId = 'org-020', actorUserId = 'actor-020'): HeaderRecord {
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

function testControllerRouteMetadata() {
  const descriptor = Object.getOwnPropertyDescriptor(NotificationsController.prototype, 'getSummary');

  assert.ok(descriptor?.value);
  assert.equal(Reflect.getMetadata(PATH_METADATA, NotificationsController), 'platform/notifications');
  assert.equal(Reflect.getMetadata(PATH_METADATA, descriptor.value), 'summary');
  assert.equal(Reflect.getMetadata(METHOD_METADATA, descriptor.value), RequestMethod.GET);
}

function testSummaryReturnsHonestNotConfiguredState() {
  const result = new NotificationsService().getSummary({
    organization_id: 'org-020',
    actor_user_id: 'actor-020',
  });

  assert.equal(result.unread_count, 0);
  assert.equal(result.status, 'not_configured');
  assert.deepEqual(result.tenant_context, {
    organization_id: 'org-020',
    actor_user_id: 'actor-020',
  });
  assert.equal(result.capability.required, 'platform.notifications.summary.view');
  assert.equal(result.providers.live_provider_enabled, false);
  assert.equal(result.providers.notification_center_enabled, false);
}

function testSummaryRejectsMissingContext() {
  const service = new NotificationsService();

  assert.throws(() => service.getSummary({ organization_id: '', actor_user_id: 'actor-020' }), BadRequestException);
  assert.throws(() => service.getSummary({ organization_id: 'org-020', actor_user_id: '' }), BadRequestException);
}

function testControllerUsesTrustedContextAndRejectsMissingSession() {
  const calls: Array<{ input: unknown }> = [];
  const service = {
    getSummary: (input: unknown) => {
      calls.push({ input });
      return new NotificationsService().getSummary(input as { organization_id: string; actor_user_id: string });
    },
  };
  const controller = new NotificationsController(service as never);

  const result = controller.getSummary(trustedHeaders());

  assert.equal(result.status, 'not_configured');
  assert.deepEqual(calls[0].input, {
    organization_id: 'org-020',
    actor_user_id: 'actor-020',
  });
  assert.throws(() => controller.getSummary({}), UnauthorizedException);
}

function testNoProviderRuntimeOrNotificationCenterWasAdded() {
  const sourceFiles = [
    'src/notifications/notifications.service.ts',
    'src/notifications/notifications.controller.ts',
    'src/app.module.ts',
  ].map((path) => readFileSync(path, 'utf8').toLowerCase());
  const source = sourceFiles.join('\n');

  for (const forbidden of ['sendgrid', 'twilio', 'whatsapp business', 'smtp', 'firebase', 'notification center runtime']) {
    assert.equal(source.includes(forbidden), false);
  }
}

testControllerRouteMetadata();
testSummaryReturnsHonestNotConfiguredState();
testSummaryRejectsMissingContext();
testControllerUsesTrustedContextAndRejectsMissingSession();
testNoProviderRuntimeOrNotificationCenterWasAdded();

console.log('P5B1-020 notification summary API tests passed.');
