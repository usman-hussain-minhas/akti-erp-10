import assert from 'node:assert/strict';

import {
  HierarchyValidationError,
  validateCreateOrganizationUnitBody,
  validateCreateUnitTypeBody,
  validateOrganizationIdParam,
} from './hierarchy.dto';

function testOrganizationIdParam() {
  assert.equal(validateOrganizationIdParam(' org-1 '), 'org-1');
  assert.throws(() => validateOrganizationIdParam(' '), HierarchyValidationError);
}

function testUnitTypeValidation() {
  const input = validateCreateUnitTypeBody({
    key: ' Division.Main ',
    label: ' Main Division ',
    sort_order: 10,
  });

  assert.deepEqual(input, {
    key: 'division.main',
    label: 'Main Division',
    sort_order: 10,
  });

  assert.throws(() => validateCreateUnitTypeBody({ key: 'Bad Key', label: 'Main', sort_order: 1 }), HierarchyValidationError);
  assert.throws(() => validateCreateUnitTypeBody({ key: 'division', label: '', sort_order: 1 }), HierarchyValidationError);
  assert.throws(() => validateCreateUnitTypeBody({ key: 'division', label: 'Main', sort_order: 1.5 }), HierarchyValidationError);
  assert.throws(() => validateCreateUnitTypeBody({ key: 'division', label: 'Main', sort_order: -1 }), HierarchyValidationError);
}

function testOrganizationUnitValidation() {
  const input = validateCreateOrganizationUnitBody({
    unit_type_id: ' unit-type-1 ',
    parent_unit_id: ' parent-1 ',
    key: ' Branch.A ',
    name: ' Branch A ',
    status: ' active ',
  });

  assert.deepEqual(input, {
    unit_type_id: 'unit-type-1',
    parent_unit_id: 'parent-1',
    key: 'branch.a',
    name: 'Branch A',
    status: 'active',
  });

  assert.equal(
    validateCreateOrganizationUnitBody({
      unit_type_id: 'unit-type-1',
      parent_unit_id: null,
      key: 'branch.b',
      name: 'Branch B',
      status: 'active',
    }).parent_unit_id,
    null,
  );

  assert.throws(
    () =>
      validateCreateOrganizationUnitBody({
        unit_type_id: ' ',
        key: 'branch',
        name: 'Branch',
        status: 'active',
      }),
    HierarchyValidationError,
  );
  assert.throws(
    () =>
      validateCreateOrganizationUnitBody({
        unit_type_id: 'unit-type-1',
        parent_unit_id: ' ',
        key: 'branch',
        name: 'Branch',
        status: 'active',
      }),
    HierarchyValidationError,
  );
  assert.throws(
    () =>
      validateCreateOrganizationUnitBody({
        unit_type_id: 'unit-type-1',
        key: 'Bad Key',
        name: 'Branch',
        status: 'active',
      }),
    HierarchyValidationError,
  );
}

function run() {
  testOrganizationIdParam();
  testUnitTypeValidation();
  testOrganizationUnitValidation();

  console.log('hierarchy.dto tests passed');
}

run();
