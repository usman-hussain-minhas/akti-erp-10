import assert from 'node:assert/strict';

import {
  OrganizationSetupValidationError,
  validateAndNormalizeCreateOrganizationSetupInput,
} from './create-organization-setup.dto';

function expectValidationError(fn: () => unknown) {
  assert.throws(fn, OrganizationSetupValidationError);
}

function run() {
  // valid payload normalized
  const normalized = validateAndNormalizeCreateOrganizationSetupInput({
    slug: '  My-School  ',
    display_name: '  My School  ',
    status: '  active  ',
    domain: '  EXAMPLE.ORG  ',
    is_primary: true,
  });

  assert.equal(normalized.slug, 'my-school');
  assert.equal(normalized.domain, 'example.org');
  assert.equal(normalized.display_name, 'My School');
  assert.equal(normalized.status, 'active');
  assert.equal(normalized.is_primary, true);

  // invalid non-object body fails
  expectValidationError(() => validateAndNormalizeCreateOrganizationSetupInput('not-an-object'));

  // invalid slug fails
  expectValidationError(() =>
    validateAndNormalizeCreateOrganizationSetupInput({
      slug: 'bad slug',
      display_name: 'Org',
      status: 'active',
      domain: 'example.org',
    }),
  );

  // invalid domain fails
  expectValidationError(() =>
    validateAndNormalizeCreateOrganizationSetupInput({
      slug: 'good-slug',
      display_name: 'Org',
      status: 'active',
      domain: 'not a domain',
    }),
  );

  // is_primary false fails
  expectValidationError(() =>
    validateAndNormalizeCreateOrganizationSetupInput({
      slug: 'good-slug',
      display_name: 'Org',
      status: 'active',
      domain: 'example.org',
      is_primary: false,
    }),
  );

  // is_primary true passes
  const primaryResult = validateAndNormalizeCreateOrganizationSetupInput({
    slug: 'good-slug',
    display_name: 'Org',
    status: 'active',
    domain: 'example.org',
    is_primary: true,
  });
  assert.equal(primaryResult.is_primary, true);

  console.log('create-organization-setup.dto tests passed');
}

run();
