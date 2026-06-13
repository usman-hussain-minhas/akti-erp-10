import { Phase6CService } from './phase_6c.service';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const service = new Phase6CService();

const defaultStatus = service.getRuntimeCapabilityStatus();
assert(defaultStatus.phase === '6C', 'Phase 6C runtime status must identify phase 6C');
assert(
  defaultStatus.status === 'runtime_surface_declared_activation_pending',
  'Phase 6C runtime status must be activation-pending until Foundry enforcement is wired',
);
assert(defaultStatus.activation_authority === 'foundry_runtime_authority', 'Phase 6C must name Foundry as authority');
assert(defaultStatus.tenant_isolation_required === true, 'Phase 6C runtime status must require tenant isolation');
assert(defaultStatus.caller_controlled_activation_allowed === false, 'Caller-controlled activation must not be allowed');
assert(defaultStatus.surfaces.length === 6, 'Phase 6C must expose the six Stage 1 amendment surfaces');
assert(defaultStatus.active_surface_count === 0, 'No Phase 6C runtime surface should be active without activation snapshot');
assert(defaultStatus.inactive_surface_count === 6, 'All Phase 6C surfaces should be inactive by default');
assert(defaultStatus.surfaces.every((surface) => surface.tenant_isolation_required === true), 'Every Phase 6C surface must require tenant isolation');

const activatedSurface = 'phase_6c.workspace_level_working_copy';
const activatedStatus = service.getRuntimeCapabilityStatus({ activeCapabilitySurfaces: [activatedSurface] });
assert(activatedStatus.active_surface_count === 1, 'Activation snapshot should mark exactly one Phase 6C surface active');
assert(
  activatedStatus.surfaces.some((surface) => surface.capability_surface === activatedSurface && surface.active),
  'Activation snapshot should mark workspace working copy active',
);
assert(
  activatedStatus.surfaces.some((surface) => surface.surface_key === 'cross_tenant_scheduling_recruitment'),
  'Cross-tenant scheduling and recruitment must be represented for later isolation proof',
);
assert(
  activatedStatus.surfaces.every(
    (surface) => surface.runtime_exposure === 'status_only_until_foundry_gatekeeper_and_tenant_isolation_enforced',
  ),
  'S2-RI-004 must not claim Foundry/Gatekeeper/tenant isolation enforcement before later FFETs',
);

const scaffoldReadiness = service.getScaffoldReadiness();
assert(scaffoldReadiness.status === 'scaffold_control_only', 'Existing scaffold readiness behavior must remain intact');
assert(scaffoldReadiness.ticket_generation_allowed === false, 'Scaffold readiness must not flip ticket flags');

console.log('phase_6c runtime status tests passed');
