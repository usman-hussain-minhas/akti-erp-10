import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const routesConfig = readFileSync('lib/routes.config.ts', 'utf8');
const shell = readFileSync('components/mission-control/mission_control_shell.tsx', 'utf8');
const palette = readFileSync('components/mission-control/command_palette.tsx', 'utf8');
const moduleLauncher = readFileSync('components/mission-control/module_launcher.tsx', 'utf8');

test('route config declares the allowed frontend-only route types', () => {
  for (const type of ['primary_navigation', 'system_navigation', 'diagnostics', 'hidden', 'future']) {
    assert.equal(routesConfig.includes(type), true);
  }
});

test('route config covers current repo-real shell routes without active future business routes', () => {
  for (const route of ['/', '/app', '/lead-desk/inbox', '/app#module-launcher', '/lead-desk/create', '/app/settings', '#diagnostics-region', '#help-region']) {
    assert.equal(routesConfig.includes(route), true);
  }

  for (const forbidden of ['/admissions', '/finance', '/hr', '/marketplace']) {
    assert.equal(routesConfig.includes(forbidden), false);
  }
});

test('shell and command palette consume frontend route config without backend shell actions API', () => {
  assert.match(shell, /SHELL_NAVIGATION_ROUTES/);
  assert.match(shell, /SHELL_SYSTEM_NAVIGATION_ROUTES/);
  assert.match(shell, /Diagnostics boundary/);
  assert.match(palette, /SHELL_COMMANDS/);
  assert.match(routesConfig, /platform\.modules\.view/);
  assert.match(routesConfig, /modules\.view/);
  assert.match(routesConfig, /MODULES_ROUTE_ACTION_AUTHORITY/);
  assert.match(routesConfig, /PHASE5C_MODULE_ROUTE_AUTHORITY/);
  assert.match(routesConfig, /approvedRoute: null/);
  assert.match(routesConfig, /deferredRoute: '\/modules'/);
  assert.match(routesConfig, /visibilityDoesNotEqualAuthority: true/);
  assert.match(routesConfig, /futureBusinessModuleRoutesAreActive: false/);
  assert.match(routesConfig, /COMMAND_SEARCH_SCOPE_GUARD/);
  assert.match(routesConfig, /WorkflowDefinition/);
  assert.match(routesConfig, /WorkflowInstance/);
  assert.match(routesConfig, /crmLeadDeskSearchExpansionAllowed: false/);
  assert.match(routesConfig, /backendSearchIsNotInvokedByPalette: true/);
  assert.match(routesConfig, /PHASE6_RUNTIME_NAVIGATION_AUTHORITY/);
  assert.match(routesConfig, /docs\\/screen_contracts\\/phase_6a_6c\\/runtime_capability_shell\\.screen\\.json/);
  assert.match(routesConfig, /GET \\/platform\\/phase-6a\\/runtime\\/status/);
  assert.match(routesConfig, /GET \\/platform\\/phase-6b\\/runtime\\/status/);
  assert.match(routesConfig, /GET \\/platform\\/phase-6c\\/runtime\\/status/);
  assert.match(routesConfig, /inactiveServicesNavigable: false/);
  assert.match(routesConfig, /frontendOnlyActivationAllowed: false/);
  assert.equal(routesConfig.includes('GET /platform/shell/actions'), false);
  assert.equal(routesConfig.includes('/platform/shell/actions'), false);
});

test('module launcher has activation-aware Phase 6 runtime navigation without inactive links', () => {
  assert.match(moduleLauncher, /buildPhase6RuntimeNavigationItems/);
  assert.match(moduleLauncher, /PHASE6_RUNTIME_NAVIGATION_AUTHORITY\\.statusEndpoints/);
  assert.match(moduleLauncher, /surface\\.active/);
  assert.match(moduleLauncher, /inactive service surface\\(s\\) are hidden until Foundry activation permits navigation/);
  assert.match(moduleLauncher, /frontendOnlyActivationAllowed/);
  assert.equal(moduleLauncher.includes('frontendOnlyActivationAllowed: true'), false);
});
