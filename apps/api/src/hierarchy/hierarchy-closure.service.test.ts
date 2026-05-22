import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import {
  HierarchyClosureService,
  type CreateUnitWithClosureInput,
} from './hierarchy-closure.service';

type ParentChainRow = {
  ancestor_unit_id: string;
  depth: number;
};

type MockState = {
  createdUnitData: unknown[];
  parentChainWhere: unknown[];
  createdClosureBatches: unknown[];
  transactionOptions: unknown[];
};

function createMockPrisma(options: {
  parentChainRows?: ParentChainRow[];
  createdUnitId?: string;
}) {
  const state: MockState = {
    createdUnitData: [],
    parentChainWhere: [],
    createdClosureBatches: [],
    transactionOptions: [],
  };

  const tx = {
    organizationUnit: {
      create: async ({ data }: { data: CreateUnitWithClosureInput & { parent_unit_id: string | null } }) => {
        state.createdUnitData.push(data);
        return {
          id: options.createdUnitId ?? 'unit-new',
          organization_id: data.organization_id,
          unit_type_id: data.unit_type_id,
          parent_unit_id: data.parent_unit_id,
          key: data.key,
          name: data.name,
          status: data.status,
        };
      },
    },
    organizationUnitClosure: {
      findMany: async ({ where }: { where: unknown }) => {
        state.parentChainWhere.push(where);
        return options.parentChainRows ?? [];
      },
      createMany: async ({ data }: { data: unknown }) => {
        state.createdClosureBatches.push(data);
        return { count: Array.isArray(data) ? data.length : 0 };
      },
    },
  };

  const prisma = {
    $transaction: async <T>(fn: (txArg: typeof tx) => Promise<T>, optionsArg: unknown): Promise<T> => {
      state.transactionOptions.push(optionsArg);
      return fn(tx);
    },
  };

  return {
    prisma,
    state,
  };
}

async function testRootUnitCreation() {
  const { prisma, state } = createMockPrisma({ createdUnitId: 'root-unit' });
  const service = new HierarchyClosureService(prisma as never);

  const result = await service.createUnitWithClosure({
    organization_id: 'org-1',
    unit_type_id: 'unit-type-1',
    parent_unit_id: null,
    key: 'hq',
    name: 'Head Office',
    status: 'active',
  });

  assert.equal(result.unit.id, 'root-unit');
  assert.equal(result.closure_rows.length, 1);
  assert.deepEqual(result.closure_rows[0], {
    organization_id: 'org-1',
    ancestor_unit_id: 'root-unit',
    descendant_unit_id: 'root-unit',
    depth: 0,
  });
  assert.equal(state.parentChainWhere.length, 0);
  assert.equal(state.createdClosureBatches.length, 1);
  assert.deepEqual(state.createdClosureBatches[0], result.closure_rows);
}

async function testChildUnitCreationWithAncestors() {
  const { prisma, state } = createMockPrisma({
    createdUnitId: 'child-unit',
    parentChainRows: [
      { ancestor_unit_id: 'parent-unit', depth: 0 },
      { ancestor_unit_id: 'root-unit', depth: 1 },
    ],
  });
  const service = new HierarchyClosureService(prisma as never);

  const result = await service.createUnitWithClosure({
    organization_id: 'org-1',
    unit_type_id: 'unit-type-1',
    parent_unit_id: 'parent-unit',
    key: 'branch-a',
    name: 'Branch A',
    status: 'active',
  });

  assert.equal(state.parentChainWhere.length, 1);
  assert.deepEqual(state.parentChainWhere[0], {
    organization_id: 'org-1',
    descendant_unit_id: 'parent-unit',
  });

  assert.deepEqual(result.closure_rows, [
    {
      organization_id: 'org-1',
      ancestor_unit_id: 'child-unit',
      descendant_unit_id: 'child-unit',
      depth: 0,
    },
    {
      organization_id: 'org-1',
      ancestor_unit_id: 'parent-unit',
      descendant_unit_id: 'child-unit',
      depth: 1,
    },
    {
      organization_id: 'org-1',
      ancestor_unit_id: 'root-unit',
      descendant_unit_id: 'child-unit',
      depth: 2,
    },
  ]);
}

async function testMissingOrCrossOrgParentFailsSafely() {
  const { prisma, state } = createMockPrisma({
    createdUnitId: 'child-unit',
    parentChainRows: [],
  });
  const service = new HierarchyClosureService(prisma as never);

  await assert.rejects(
    service.createUnitWithClosure({
      organization_id: 'org-1',
      unit_type_id: 'unit-type-1',
      parent_unit_id: 'parent-not-in-org',
      key: 'branch-b',
      name: 'Branch B',
      status: 'active',
    }),
    (error: unknown) => {
      assert.ok(error instanceof BadRequestException);
      assert.match((error as BadRequestException).message, /parent unit not found in organization/);
      return true;
    },
  );

  assert.equal(state.createdUnitData.length, 0);
}

async function testSerializableIsolationIsUsed() {
  const { prisma, state } = createMockPrisma({ createdUnitId: 'root-unit' });
  const service = new HierarchyClosureService(prisma as never);

  await service.createUnitWithClosure({
    organization_id: 'org-1',
    unit_type_id: 'unit-type-1',
    key: 'hq',
    name: 'Head Office',
    status: 'active',
  });

  assert.equal(state.transactionOptions.length, 1);
  assert.deepEqual(state.transactionOptions[0], {
    isolationLevel: 'Serializable',
  });
}

async function run() {
  await testRootUnitCreation();
  await testChildUnitCreationWithAncestors();
  await testMissingOrCrossOrgParentFailsSafely();
  await testSerializableIsolationIsUsed();

  console.log('hierarchy-closure.service tests passed');
}

void run();
