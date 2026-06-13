import assert from 'node:assert/strict';

import { Phase6BCategoryTaxonomyService } from './category_taxonomy.service';

function validCategoryInput() {
  return {
    organization_id: 'org_demo',
    category_id: 'cat_admissions',
    name: 'Admissions',
    slug: 'admissions',
    status: 'active' as const,
    parent_category_id: 'cat_services',
    ancestor_category_ids: ['cat_root', 'cat_services'],
    sort_order: 10,
    actor_user_id: 'user_catalogue_manager',
    requested_event: 'product.updated' as const,
  };
}

function testAcceptsTenantScopedCategoryTaxonomy() {
  const service = new Phase6BCategoryTaxonomyService();
  const result = service.evaluateCategoryTaxonomy(validCategoryInput());

  assert.equal(result.accepted, true);
  assert.deepEqual(result.violations, []);
  assert.equal(result.schema_model, 'Phase6BProductCategory');
  assert.equal(result.evidence.organization_id, 'org_demo');
  assert.equal(result.evidence.category_id, 'cat_admissions');
  assert.equal(result.evidence.parent_category_id, 'cat_services');
  assert.equal(result.evidence.tenant_scoped_taxonomy, true);
  assert.equal(result.evidence.foundry_activation_required, true);
  assert.equal(result.evidence.access_gatekeeper_required, true);
  assert.equal(result.manifest_verified, true);
}

function testRejectsMissingTenantIsolation() {
  const service = new Phase6BCategoryTaxonomyService();
  const result = service.evaluateCategoryTaxonomy({
    ...validCategoryInput(),
    organization_id: '',
  });

  assert.equal(result.accepted, false);
  assert.ok(result.violations.includes('organization_id is required for tenant isolation'));
}

function testRejectsInvalidSlug() {
  const service = new Phase6BCategoryTaxonomyService();
  const result = service.evaluateCategoryTaxonomy({
    ...validCategoryInput(),
    slug: 'Admissions Catalog',
  });

  assert.equal(result.accepted, false);
  assert.ok(result.violations.includes('slug must be lower kebab case'));
}

function testRejectsSelfParentingAndAncestorCycle() {
  const service = new Phase6BCategoryTaxonomyService();
  const result = service.evaluateCategoryTaxonomy({
    ...validCategoryInput(),
    parent_category_id: 'cat_admissions',
    ancestor_category_ids: ['cat_root', 'cat_admissions'],
  });

  assert.equal(result.accepted, false);
  assert.ok(result.violations.includes('category cannot parent itself'));
  assert.ok(result.violations.includes('ancestor_category_ids cannot include category_id'));
}

function testArchiveOverDeleteIsEnforced() {
  const service = new Phase6BCategoryTaxonomyService();
  const result = service.evaluateCategoryTaxonomy({
    ...validCategoryInput(),
    status: 'archived',
    requested_event: 'product.archived',
    archived_reason: 'taxonomy consolidation',
  });

  assert.equal(result.accepted, true);
  assert.equal(result.emitted_event, 'product.archived');
  assert.equal(result.evidence.archive_over_delete_enforced, true);
}

function testRejectsArchiveWithoutReason() {
  const service = new Phase6BCategoryTaxonomyService();
  const result = service.evaluateCategoryTaxonomy({
    ...validCategoryInput(),
    status: 'archived',
    requested_event: 'product.archived',
  });

  assert.equal(result.accepted, false);
  assert.ok(result.violations.includes('archived categories require archived_reason to enforce archive over delete'));
}

function run() {
  testAcceptsTenantScopedCategoryTaxonomy();
  testRejectsMissingTenantIsolation();
  testRejectsInvalidSlug();
  testRejectsSelfParentingAndAncestorCycle();
  testArchiveOverDeleteIsEnforced();
  testRejectsArchiveWithoutReason();
  console.log('P6B-FFET-002 category taxonomy service test passed.');
}

run();
