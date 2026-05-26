import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/app/settings/page.tsx', import.meta.url), 'utf8');
const settings = readFileSync(new URL('../components/settings/settings-control-panel.tsx', import.meta.url), 'utf8');
const shell = readFileSync(new URL('../components/mission-control/mission-control-shell.tsx', import.meta.url), 'utf8');
const sessionStatus = readFileSync(new URL('../components/session/session-status.tsx', import.meta.url), 'utf8');

test('/app/settings route renders the Settings Control Panel', () => {
  assert.match(page, /SettingsControlPanel/);
});

test('settings sections match the built-vs-placeholder table', () => {
  for (const text of [
    'General / portal mode',
    'Users & Roles',
    'Groups / Access',
    'Hierarchy / Organization Structure',
    'Modules',
    'Appearance',
    'Security',
    'Notifications',
    'Advanced Diagnostics',
  ]) {
    assert.match(settings, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(settings, /Coming in a future phase/);
  assert.match(settings, /Load read-only view/);
});

test('settings uses exact Gatekeeper denial messages and no fake controls', () => {
  assert.equal(page.includes('You don’t have permission to make this change. Contact your administrator.'), true);
  assert.equal(page.includes('This action requires approval. Contact your administrator.'), true);
  assert.equal(page.includes('Settings are temporarily unavailable. Try again later.'), true);
  assert.match(settings, /denialMessages\.forbidden/);
  assert.match(settings, /denialMessages\.approvalRequired/);
  assert.match(settings, /denialMessages\.apiUnavailable/);
  assert.equal(settings.includes('enable module'), false);
  assert.equal(settings.includes('disable module'), false);
  assert.equal(settings.includes('installer'), false);
  assert.equal(settings.includes('dummy data'), false);
});

test('settings integrates Advanced Diagnostics as the token technical surface', () => {
  assert.match(settings, /AdvancedDiagnosticsSessionPanel/);
  assert.match(settings, /advanced-diagnostics/);
});

test('Mission Control and session status link to the contract-owned settings route', () => {
  assert.equal(shell.includes("href: '/app/settings'"), true);
  assert.equal(shell.includes('href="/app/settings"'), true);
  assert.equal(sessionStatus.includes('/app/settings?section=advanced-diagnostics#advanced-diagnostics'), true);
});
