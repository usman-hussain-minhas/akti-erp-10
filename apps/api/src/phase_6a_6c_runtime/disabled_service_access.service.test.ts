import { strict as assert } from 'node:assert';

import { BadRequestException } from '@nestjs/common';

import { DisabledServiceAccessService } from './disabled_service_access.service';

const service = new DisabledServiceAccessService();

const negativeProof = service.proveCoreCrmOnlyTenantCannotAccessInactiveServices({
  organization_id: 'org-stage2-core-crm-only',
  actor_user_id: 'user-stage2-core-crm-only',
  correlation_id: 'corr-stage2-disabled-service-proof',
});

assert.equal(negativeProof.length, 5);
for (const decision of negativeProof) {
  assert.equal(decision.organization_id, 'org-stage2-core-crm-only');
  assert.equal(decision.active_services.join(','), 'core,crm');
  assert.equal(decision.route_accessible, false);
  assert.equal(decision.navigation_visible, false);
  assert.equal(decision.server_side_inaccessible, true);
  assert.equal(decision.http_status, 404);
  assert.equal(decision.reason, 'tenant_service_inactive');
  assert.equal(decision.foundry_activation_authority_required, true);
  assert.equal(decision.gatekeeper_bypass_allowed, false);
  assert.match(decision.decision_hash, /^[a-f0-9]{64}$/);
  assert.match(decision.decision_id, /^phase6_disabled_service_[a-f0-9]{16}$/);
}
assert.deepEqual(
  negativeProof.map((decision) => decision.requested_service),
  ['lms', 'e-commerce', 'events', 'campaigns', 'website-builder'],
);

const activeCrmDecision = service.evaluateTenantServiceAccess({
  organization_id: 'org-stage2-core-crm-only',
  actor_user_id: 'user-stage2-core-crm-only',
  requested_service: 'crm',
  active_services: ['core', 'crm'],
  route_path: '/platform/services/crm',
  correlation_id: 'corr-stage2-crm-active',
});
assert.equal(activeCrmDecision.route_accessible, true);
assert.equal(activeCrmDecision.navigation_visible, true);
assert.equal(activeCrmDecision.server_side_inaccessible, false);
assert.equal(activeCrmDecision.http_status, 200);
assert.equal(activeCrmDecision.reason, 'tenant_service_active');

const duplicateActiveServices = service.evaluateTenantServiceAccess({
  organization_id: 'org-stage2-core-crm-only',
  actor_user_id: 'user-stage2-core-crm-only',
  requested_service: 'core',
  active_services: ['core', 'core', 'crm'],
  route_path: '/platform/services/core',
  correlation_id: 'corr-stage2-dedupe',
});
assert.deepEqual(duplicateActiveServices.active_services, ['core', 'crm']);

assert.throws(
  () =>
    service.evaluateTenantServiceAccess({
      organization_id: 'org-stage2-core-crm-only',
      actor_user_id: 'user-stage2-core-crm-only',
      requested_service: 'unknown-service',
      active_services: ['core', 'crm'],
      route_path: '/platform/services/unknown-service',
      correlation_id: 'corr-stage2-unknown-service',
    }),
  BadRequestException,
);

assert.throws(
  () =>
    service.evaluateTenantServiceAccess({
      organization_id: 'org-stage2-core-crm-only',
      actor_user_id: 'user-stage2-core-crm-only',
      requested_service: 'events',
      active_services: ['core', 'crm'],
      route_path: 'platform/services/events',
      correlation_id: 'corr-stage2-route-not-absolute',
    }),
  BadRequestException,
);

console.log('Phase 6A-6C disabled service negative runtime proof checks passed');
