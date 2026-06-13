import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/app/page.tsx', import.meta.url), 'utf8');
const shell = readFileSync(new URL('../components/mission-control/mission_control_shell.tsx', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../components/mission-control/dashboard_overview.tsx', import.meta.url), 'utf8');

test('/app route renders the Mission Control shell component', () => {
  assert.match(page, /MissionControlShell/);
});

test('Mission Control shell contains required desktop and mobile regions', () => {
  for (const text of [
    'CommandPalette',
    'NotificationCenter',
    'Help',
    'Settings',
    'Main content outlet',
    'ModuleLauncher',
    'DashboardOverview',
    'Mobile navigation drawer',
    'Bottom primary navigation',
    'phase5c-safe-bottom',
    'BrandLockup',
    'Esbla',
    'Spark',
    'Sidebar navigation only',
    'Primary and system navigation',
    'Organization badge',
    'User account avatar',
    '/platform/organization/profile',
    'Workspace status card',
    '/platform/status/overview',
    '/app#module-launcher',
  ]) {
    assert.match(shell, new RegExp(text));
  }
});

test('Mission Control shell uses session indicator and diagnostics boundary', () => {
  assert.match(shell, /useLeadDeskOperatorContext/);
  assert.match(shell, /SessionStatusNotice/);
  assert.match(dashboard, /Advanced Diagnostics/);
  assert.equal(shell.includes('organizationId'), false);
  assert.equal(shell.includes('actorUserId'), false);
  assert.equal(shell.includes('<textarea'), false);
});

test('Mission Control shell keeps later features as explicit placeholders without fake data', () => {
  assert.match(shell, /Notification drawer region/);
  assert.match(shell, /NotificationCenter/);
  assert.equal(shell.includes('Foundry'), false);
  assert.equal(shell.includes('WhatsApp'), false);
});

test('Mission Control shell delegates module list rendering to the read-only launcher', () => {
  assert.match(shell, /ModuleLauncher/);
  assert.equal(shell.includes('install module'), false);
  assert.equal(shell.includes('enable module'), false);
  assert.equal(shell.includes('disable module'), false);
});
