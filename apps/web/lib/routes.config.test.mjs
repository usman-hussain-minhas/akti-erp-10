import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const routesConfig = readFileSync('lib/routes.config.ts', 'utf8');
const shell = readFileSync('components/mission-control/mission-control-shell.tsx', 'utf8');
const palette = readFileSync('components/mission-control/command-palette.tsx', 'utf8');

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
  assert.match(routesConfig, /approvedRoute: null/);
  assert.match(routesConfig, /deferredRoute: '\/modules'/);
  assert.equal(routesConfig.includes('GET /platform/shell/actions'), false);
  assert.equal(routesConfig.includes('/platform/shell/actions'), false);
});
