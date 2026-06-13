import { MissionControlShell } from '../../components/mission-control/mission_control_shell';
import { PHASE6_RUNTIME_NAVIGATION_AUTHORITY } from '../../lib/routes.config';

const PHASE6_RUNTIME_CAPABILITY_PAGE_DISCLOSURE = {
  screenContract: PHASE6_RUNTIME_NAVIGATION_AUTHORITY.screenContract,
  shellAnchorRoute: PHASE6_RUNTIME_NAVIGATION_AUTHORITY.shellAnchorRoute,
  loadingPattern: 'hybrid_dynamic_shell_chunk_with_runtime_activation_gating',
  tenantActivationPrunesBundle: false,
  inactiveServiceAccessAuthority: 'server_runtime_foundry_and_gatekeeper',
} as const;

export default function MissionControlPage() {
  return (
    <>
      <span className="sr-only">
        Phase 6 runtime loading pattern: {PHASE6_RUNTIME_CAPABILITY_PAGE_DISCLOSURE.loadingPattern}. Tenant activation
        prunes bundle: {String(PHASE6_RUNTIME_CAPABILITY_PAGE_DISCLOSURE.tenantActivationPrunesBundle)}.
      </span>
      <MissionControlShell />
    </>
  );
}
