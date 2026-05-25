import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { HierarchyController } from './hierarchy.controller';
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
    createUnitType: async (...args: unknown[]) => {
      calls.push({ method: 'createUnitType', args });
      return { id: 'unit-type-1' };
    },
    listUnitTypes: async (...args: unknown[]) => {
      calls.push({ method: 'listUnitTypes', args });
      return { items: [] };
    },
    createUnit: async (...args: unknown[]) => {
      calls.push({ method: 'createUnit', args });
      return { id: 'unit-1' };
    },
    listUnits: async (...args: unknown[]) => {
      calls.push({ method: 'listUnits', args });
      return { items: [] };
    },
  };

  return {
    controller: new HierarchyController(service as never),
    calls,
  };
}

async function testControllerRoutesNormalizeInputs() {
  const { controller, calls } = createController();

  await controller.createUnitType(
    ' org-1 ',
    {
      key: ' Division ',
      label: ' Division ',
      sort_order: 1,
    },
    trustedHeaders(),
  );
  await controller.listUnitTypes(' org-1 ', trustedHeaders());
  await controller.createUnit(
    ' org-1 ',
    {
      unit_type_id: 'unit-type-1',
      key: ' Branch.A ',
      name: ' Branch A ',
      status: ' active ',
    },
    trustedHeaders(),
  );
  await controller.listUnits(' org-1 ', trustedHeaders());

  assert.deepEqual(calls[0], {
    method: 'createUnitType',
    args: ['org-1', { key: 'division', label: 'Division', sort_order: 1 }, 'actor-1'],
  });
  assert.deepEqual(calls[1], {
    method: 'listUnitTypes',
    args: ['org-1', 'actor-1'],
  });
  assert.deepEqual(calls[2], {
    method: 'createUnit',
    args: [
      'org-1',
      {
        unit_type_id: 'unit-type-1',
        parent_unit_id: null,
        key: 'branch.a',
        name: 'Branch A',
        status: 'active',
      },
      'actor-1',
    ],
  });
  assert.deepEqual(calls[3], {
    method: 'listUnits',
    args: ['org-1', 'actor-1'],
  });
}

function testControllerRejectsInvalidInputsAndDoesNotExposeDeferredMethods() {
  const { controller } = createController();

  assert.throws(
    () => controller.createUnitType('org-1', { key: 'bad key', label: 'Division', sort_order: 1 }, trustedHeaders()),
    BadRequestException,
  );
  assert.equal('deleteUnit' in controller, false);
  assert.equal('moveUnit' in controller, false);
  assert.equal('reparentUnit' in controller, false);
}

async function run() {
  await testControllerRoutesNormalizeInputs();
  testControllerRejectsInvalidInputsAndDoesNotExposeDeferredMethods();

  console.log('hierarchy.controller tests passed');
}

void run();
