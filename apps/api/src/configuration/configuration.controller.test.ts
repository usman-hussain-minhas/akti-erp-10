import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { ConfigurationController } from './configuration.controller';

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

async function testControllerRoutesNormalizeInputsAndUseHeaderActor() {
  const { controller, calls } = createController();

  await controller.getPortalMode(' org-1 ', 'actor-1');
  await controller.updatePortalMode(' org-1 ', { mode: ' BUILDER ', actor_user_id: 'body-actor' }, 'header-actor');

  assert.deepEqual(calls[0], {
    method: 'getPortalMode',
    args: ['org-1', 'actor-1'],
  });
  assert.deepEqual(calls[1], {
    method: 'updatePortalMode',
    args: ['org-1', { mode: 'builder' }, 'header-actor'],
  });
}

function testControllerRejectsInvalidInputs() {
  const { controller } = createController();

  assert.throws(() => controller.updatePortalMode('org-1', { mode: 'advanced' }, 'actor-1'), BadRequestException);
  assert.throws(() => controller.getPortalMode(' ', 'actor-1'), BadRequestException);
}

async function run() {
  await testControllerRoutesNormalizeInputsAndUseHeaderActor();
  testControllerRejectsInvalidInputs();

  console.log('configuration.controller tests passed');
}

void run();
