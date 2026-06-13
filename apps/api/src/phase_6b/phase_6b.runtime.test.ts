import { Phase6BService } from './phase_6b.service';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const service = new Phase6BService();

const defaultStatus = service.getRuntimeCapabilityStatus();
assert(defaultStatus.phase === '6B', 'Phase 6B runtime status must identify phase 6B');
assert(
  defaultStatus.status === 'runtime_surface_declared_activation_pending',
  'Phase 6B runtime status must be activation-pending until Foundry enforcement is wired',
);
assert(defaultStatus.activation_authority === 'foundry_runtime_authority', 'Phase 6B must name Foundry as authority');
assert(defaultStatus.billing_gatekeeper_required === true, 'Phase 6B billing/commerce surfaces must require Gatekeeper');
assert(defaultStatus.caller_controlled_activation_allowed === false, 'Caller-controlled activation must not be allowed');
assert(defaultStatus.surfaces.length === 5, 'Phase 6B must expose the five Stage 1 amendment surfaces');
assert(defaultStatus.active_surface_count === 0, 'No Phase 6B runtime surface should be active without activation snapshot');
assert(defaultStatus.inactive_surface_count === 5, 'All Phase 6B surfaces should be inactive by default');
assert(defaultStatus.surfaces.every((surface) => surface.provider_runtime_allowed === false), 'S2-RI-003 must not run providers');

const activatedSurface = 'phase_6b.cross_tenant_invoicing';
const activatedStatus = service.getRuntimeCapabilityStatus({ activeCapabilitySurfaces: [activatedSurface] });
assert(activatedStatus.active_surface_count === 1, 'Activation snapshot should mark exactly one Phase 6B surface active');
assert(
  activatedStatus.surfaces.some((surface) => surface.capability_surface === activatedSurface && surface.active),
  'Activation snapshot should mark cross-tenant invoicing active',
);
assert(
  activatedStatus.surfaces.every((surface) => surface.runtime_exposure === 'status_only_until_foundry_and_gatekeeper_enforced'),
  'S2-RI-003 must not claim Foundry/Gatekeeper enforcement before later FFETs',
);
assert(
  activatedStatus.surfaces.some((surface) => surface.surface_key === 'billing_honesty_surfaces'),
  'Failed-payment correctable invoice proof must have a billing honesty runtime surface',
);

const scaffoldReadiness = service.getScaffoldReadiness();
assert(scaffoldReadiness.status === 'scaffold_control_only', 'Existing scaffold readiness behavior must remain intact');
assert(scaffoldReadiness.ticket_generation_allowed === false, 'Scaffold readiness must not flip ticket flags');

console.log('phase_6b runtime status tests passed');
