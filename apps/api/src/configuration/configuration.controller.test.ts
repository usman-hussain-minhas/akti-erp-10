import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { ConfigurationController } from './configuration.controller';
import { HeaderRecord, createPhase3SessionToken } from '../security/request-context';

const AUTH_SECRET = 'phase3-controller-test-secret';
process.env.AKTI_AUTH_SESSION_SECRET = AUTH_SECRET;

function trustedHeaders(organizationId = 'org-1', actorUserId = 'actor-1'): HeaderRecord {
  const issuedAt = new Date(Date.now() - 60_000).toISOString();
  const expiresAt = new Date(Date.now() + 60_000).toISOString();

  return {
    authorization: `Bearer ${createPhase3SessionToken(
      {
        organization_id: organizationId,
        actor_user_id: actorUserId,
        issued_at: issuedAt,
        expires_at: expiresAt,
      },
      AUTH_SECRET,
    )}`,
  };
}

function createController() {
  const calls: Array<{ method: string; args: unknown[] }> = [];
  const service = {
    getPortalMode: async (...args: unknown[]) => {
      calls.push({ method: 'getPortalMode', args });
      return { mode: 'simple' };
    },
    updatePortalMode: async (...args: unknown[]) => {
      calls.push({ method: 'updatePortalMode', args });
      return { mode: 'builder' };
    },
  };

  return {
    controller: new ConfigurationController(service as never),
    calls,
  };
}

async function testControllerRoutesNormalizeInputsAndUseTrustedActor() {
  const { controller, calls } = createController();

  await controller.getPortalMode(' org-1 ', trustedHeaders());
  await controller.updatePortalMode(' org-1 ', { mode: ' BUILDER ', actor_user_id: 'body-actor' }, trustedHeaders());

  assert.deepEqual(calls[0], {
    method: 'getPortalMode',
    args: ['org-1', 'actor-1'],
  });
  assert.deepEqual(calls[1], {
    method: 'updatePortalMode',
    args: ['org-1', { mode: 'builder' }, 'actor-1'],
  });
}

function testControllerRejectsInvalidInputs() {
  const { controller } = createController();

  assert.throws(() => controller.updatePortalMode('org-1', { mode: 'advanced' }, trustedHeaders()), BadRequestException);
  assert.throws(() => controller.getPortalMode(' ', trustedHeaders()), BadRequestException);
}

async function run() {
  await testControllerRoutesNormalizeInputsAndUseTrustedActor();
  testControllerRejectsInvalidInputs();

  console.log('configuration.controller tests passed');
}

void run();
