import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const dashboard = readFileSync(new URL('../components/mission-control/dashboard-overview.tsx', import.meta.url), 'utf8');
const shell = readFileSync(new URL('../components/mission-control/mission-control-shell.tsx', import.meta.url), 'utf8');

test('dashboard v1 uses existing API surfaces only', () => {
  assert.equal(dashboard.includes('/platform/status/overview'), true);
  assert.equal(dashboard.includes("leadDeskApiFetch(context, '/leads'"), true);
  assert.equal(dashboard.includes('/app/settings'), true);
  assert.equal(dashboard.includes('GET /platform/modules'), false);
  assert.match(dashboard, /platform_services/);
});

test('dashboard v1 renders placeholders and deferrals for unsupported widgets', () => {
  for (const text of [
    'Recent activity deferred',
    'No frontend-safe activity endpoint is confirmed',
    'Notifications summary deferred',
    'Notification content waits for Phase 5A policy',
  ]) {
    assert.equal(dashboard.includes(text), true);
  }
});

test('dashboard v1 does not hardcode operational metrics or dummy rows', () => {
  for (const forbidden of [
    'dummy',
    'mock metric',
    'Lorem',
    '123 leads',
    'sample data',
  ]) {
    assert.equal(dashboard.includes(forbidden), false);
  }

  assert.equal(dashboard.includes('payload.items.length'), true);
});

test('dashboard v1 preserves session and no-fake-data boundaries', () => {
  assert.match(dashboard, /Set up session in Advanced Diagnostics/);
  assert.match(dashboard, /hardcoded operational data/);
  assert.match(dashboard, /Workspace connection is required/);
  assert.match(dashboard, /PermissionState/);
  assert.match(dashboard, /ErrorState/);
  assert.match(dashboard, /Authorization/);
  assert.equal(dashboard.includes('organizationId'), false);
  assert.equal(dashboard.includes('actorUserId'), false);
});

test('Mission Control shell renders dashboard overview as default /app content', () => {
  assert.match(shell, /DashboardOverview/);
});
