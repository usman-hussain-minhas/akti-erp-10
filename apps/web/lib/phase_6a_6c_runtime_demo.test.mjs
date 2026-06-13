import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');

function readRepoFile(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readRepoFile(relativePath));
}

const demoSpec = readJson(
  'docs/process/phases/cross_phase/phase_6a_6c_runtime_integration_ffet_v2/phase_6a_6c_runtime_integration_v2_demo_script_spec_v1.json',
);
const screenContractTest = readJson('docs/screen_contracts/phase_6a_6c/runtime_capability_shell.screen.test.json');
const routesConfig = readRepoFile('apps/web/lib/routes.config.ts');
const moduleLauncher = readRepoFile('apps/web/components/mission-control/module_launcher.tsx');
const missionControlShell = readRepoFile('apps/web/components/mission-control/mission_control_shell.tsx');
const appPage = readRepoFile('apps/web/app/app/page.tsx');

const requiredDemoNegativeAssertions = [
  'cross_tenant_deny',
  'opt_out_send_blocked',
  'inactive_service_route_404',
  'failed_kyc_t1_restricted_path',
  'failed_payment_correctable_invoice',
];

assert.equal(demoSpec.status, 'DEMO_SPEC_COMPLETE_WITH_FIVE_NEGATIVE_ASSERTIONS_NOT_EXECUTED');
assert.equal(demoSpec.required_negative_assertion_count, 5);
assert.deepEqual(
  demoSpec.negative_assertions.map((assertion) => assertion.name).sort(),
  [...requiredDemoNegativeAssertions].sort(),
);
for (const assertion of demoSpec.negative_assertions) {
  assert.equal(assertion.owning_ffets.includes('S2-RI-013'), true, `${assertion.name} must be owned by S2-RI-013`);
  assert.ok(assertion.expected_result.length > 0, `${assertion.name} must describe an expected result`);
  assert.ok(assertion.required_evidence.length > 0, `${assertion.name} must name required evidence`);
}

const requiredVisualNegativeAssertions = [
  'cross_tenant_deny',
  'inactive_route_404_or_unavailable',
  'opt_out_send_blocked',
  'failed_kyc_restricted_t1_path',
  'failed_payment_correctable_invoice_path',
];
assert.deepEqual(
  [...screenContractTest.required_negative_visual_assertions].sort(),
  [...requiredVisualNegativeAssertions].sort(),
);
assert.equal(screenContractTest.forbidden_frontend_shortcuts.includes('client_only_activation_authority'), true);
assert.equal(screenContractTest.forbidden_frontend_shortcuts.includes('placeholder_service_cards'), true);

assert.match(routesConfig, /PHASE6_RUNTIME_NAVIGATION_AUTHORITY/);
assert.match(routesConfig, /screen_contracts\/phase_6a_6c\/runtime_capability_shell\.screen\.json/);
assert.match(routesConfig, /inactiveServicesNavigable:\s*false/);
assert.match(routesConfig, /frontendOnlyActivationAllowed:\s*false/);
assert.match(routesConfig, /directInactiveRouteBehavior:\s*['"]404_or_unavailable['"]/);

assert.match(moduleLauncher, /surface\.active/);
assert.match(moduleLauncher, /inactive services are not\s+rendered as openable links/i);
assert.match(moduleLauncher, /PHASE6_RUNTIME_NAVIGATION_AUTHORITY/);
assert.match(moduleLauncher, /shellAnchorRoute/);
assert.doesNotMatch(moduleLauncher, /hardcoded_active_services/);
assert.doesNotMatch(moduleLauncher, /placeholder_service_cards/);

const shellAndPage = `${missionControlShell}\n${appPage}`;
assert.match(shellAndPage, /dynamic\(/);
assert.match(shellAndPage, /tenantActivationPrunesBundle:\s*false/);
assert.match(shellAndPage, /not tenant-activation-pruned/);
assert.match(shellAndPage, /phase-6-runtime-capabilities/);
assert.match(shellAndPage, /server_runtime_foundry_and_gatekeeper/);

console.log('Stage 2 Phase 6A-6C frontend runtime demo checks passed.');
