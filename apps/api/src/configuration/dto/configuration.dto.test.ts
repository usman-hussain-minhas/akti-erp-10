import assert from 'node:assert/strict';

import {
  ConfigurationValidationError,
  validateOrganizationIdParam,
  validateUpdatePortalModeBody,
} from './configuration.dto';

function testOrganizationIdParam() {
  assert.equal(validateOrganizationIdParam(' org-1 '), 'org-1');
  assert.throws(() => validateOrganizationIdParam(' '), ConfigurationValidationError);
}

function testPortalModeValidation() {
  assert.deepEqual(validateUpdatePortalModeBody({ mode: 'simple' }), { mode: 'simple' });
  assert.deepEqual(validateUpdatePortalModeBody({ mode: ' BUILDER ' }), { mode: 'builder' });

  assert.throws(() => validateUpdatePortalModeBody({}), ConfigurationValidationError);
  assert.throws(() => validateUpdatePortalModeBody({ mode: '' }), ConfigurationValidationError);
  assert.throws(() => validateUpdatePortalModeBody({ mode: 1 }), ConfigurationValidationError);
  assert.throws(() => validateUpdatePortalModeBody({ mode: 'advanced' }), ConfigurationValidationError);
  assert.throws(() => validateUpdatePortalModeBody(null), ConfigurationValidationError);
}

function run() {
  testOrganizationIdParam();
  testPortalModeValidation();

  console.log('configuration.dto tests passed');
}

run();
