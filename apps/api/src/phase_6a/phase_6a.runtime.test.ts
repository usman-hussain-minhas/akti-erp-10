import { Phase6AService } from './phase_6a.service';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const service = new Phase6AService();

const defaultStatus = service.getRuntimeCapabilityStatus();
assert(defaultStatus.phase === '6A', 'Phase 6A runtime status must identify phase 6A');
assert(
  defaultStatus.status === 'runtime_surface_declared_activation_pending',
  'Phase 6A runtime status must be activation-pending until Foundry enforcement is wired',
);
assert(defaultStatus.activation_authority === 'foundry_runtime_authority', 'Phase 6A must name Foundry as authority');
assert(defaultStatus.caller_controlled_activation_allowed === false, 'Caller-controlled activation must not be allowed');
assert(defaultStatus.surfaces.length === 8, 'Phase 6A must expose the eight Stage 1 amendment surfaces');
assert(defaultStatus.active_surface_count === 0, 'No Phase 6A runtime surface should be active without activation snapshot');
assert(defaultStatus.inactive_surface_count === 8, 'All Phase 6A surfaces should be inactive by default');

const activatedSurface = 'phase_6a.tiered_verification';
const activatedStatus = service.getRuntimeCapabilityStatus({ activeCapabilitySurfaces: [activatedSurface] });
assert(activatedStatus.active_surface_count === 1, 'Activation snapshot should mark exactly one Phase 6A surface active');
assert(
  activatedStatus.surfaces.some((surface) => surface.capability_surface === activatedSurface && surface.active),
  'Activation snapshot should mark tiered verification active',
);
assert(
  activatedStatus.surfaces.every((surface) => surface.activation_required === true),
  'Every Phase 6A runtime surface must require Foundry activation',
);
assert(
  activatedStatus.surfaces.every((surface) => surface.runtime_exposure === 'status_only_until_foundry_enforced'),
  'S2-RI-002 must not claim Foundry enforcement before S2-RI-005',
);

const scaffoldReadiness = service.getScaffoldReadiness();
assert(scaffoldReadiness.status === 'scaffold_control_only', 'Existing scaffold readiness behavior must remain intact');
assert(scaffoldReadiness.execution_authorized === false, 'Scaffold readiness must not flip ticket execution flags');

console.log('phase_6a runtime status tests passed');
