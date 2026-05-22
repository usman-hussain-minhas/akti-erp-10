import assert from 'node:assert/strict';

import {
  AccessCoreValidationError,
  validateCreateGroupBody,
  validateCreateGroupCapabilityBody,
  validateCreateMembershipBody,
  validateCreateUserBody,
  validateOrganizationIdParam,
  validateUpdateUserBody,
} from './access-core.dto';

function expectValidationError(fn: () => unknown) {
  assert.throws(fn, AccessCoreValidationError);
}

function run() {
  const orgId = validateOrganizationIdParam('  org-1  ');
  assert.equal(orgId, 'org-1');

  const user = validateCreateUserBody({
    email: '  USER@Example.org ',
    display_name: '  Jane Doe  ',
    status: ' active ',
    primary_unit_id: ' unit-1 ',
  });
  assert.equal(user.email, 'user@example.org');
  assert.equal(user.display_name, 'Jane Doe');
  assert.equal(user.status, 'active');
  assert.equal(user.primary_unit_id, 'unit-1');

  const updatedUser = validateUpdateUserBody({
    display_name: '  Updated Name  ',
  });
  assert.equal(updatedUser.display_name, 'Updated Name');

  const group = validateCreateGroupBody({
    key: ' Access.Policy ',
    label: '  Access Policy  ',
    status: ' active ',
  });
  assert.equal(group.key, 'access.policy');

  const membership = validateCreateMembershipBody({
    user_id: ' user-1 ',
    group_id: ' group-1 ',
  });
  assert.equal(membership.user_id, 'user-1');
  assert.equal(membership.group_id, 'group-1');

  const assignment = validateCreateGroupCapabilityBody({
    group_id: ' group-1 ',
    capability_key: ' access.policy.manage ',
    scope_type: 'organization',
  });
  assert.equal(assignment.capability_key, 'access.policy.manage');

  expectValidationError(() => validateCreateUserBody('bad'));
  expectValidationError(() =>
    validateCreateUserBody({
      email: 'bad-email',
      display_name: 'A',
      status: 'active',
    }),
  );
  expectValidationError(() => validateUpdateUserBody({}));
  expectValidationError(() =>
    validateCreateGroupBody({
      key: 'Bad Key With Space',
      label: 'G',
      status: 'active',
    }),
  );
  expectValidationError(() =>
    validateCreateGroupCapabilityBody({
      group_id: 'group-1',
      capability_key: 'bad key',
      scope_type: 'organization',
    }),
  );

  console.log('access-core.dto tests passed');
}

run();
