import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const palette = readFileSync(new URL('../components/mission-control/command-palette.tsx', import.meta.url), 'utf8');
const shell = readFileSync(new URL('../components/mission-control/mission-control-shell.tsx', import.meta.url), 'utf8');
const routes = readFileSync(new URL('../lib/routes.config.ts', import.meta.url), 'utf8');

test('command palette consumes static core Phase 4B commands from route config', () => {
  assert.match(palette, /SHELL_COMMANDS/);

  for (const text of [
    'Open dashboard',
    'CRM_VISIBLE_LABEL',
    'Create lead',
    'Open settings',
    'Open help',
    '/app',
    '/lead-desk/inbox',
    '/lead-desk/create',
    '/app/settings',
    '#help-region',
  ]) {
    assert.equal(routes.includes(text), true);
  }
});

test('command palette supports keyboard trigger navigation and close behavior', () => {
  for (const marker of [
    "window.addEventListener('keydown'",
    'event.ctrlKey || event.metaKey',
    "event.key.toLowerCase() === 'k'",
    "event.key === 'ArrowDown'",
    "event.key === 'ArrowUp'",
    "event.key === 'Enter'",
    "event.key === 'Escape'",
    'Close command palette',
    'onMouseDown={closePalette}',
  ]) {
    assert.equal(palette.includes(marker), true);
  }
});

test('command palette records safe recent command ids only', () => {
  assert.match(palette, /RECENT_COMMANDS_KEY/);
  assert.match(palette, /localStorage/);
  assert.match(palette, /Recent commands/);
});

test('command palette excludes advanced deferred scopes', () => {
  for (const forbidden of [
    'Run macro',
    'Run script',
    'AI command',
    'Open installer',
    'Cross-module search',
  ]) {
    assert.equal(palette.includes(forbidden), false);
  }
});

test('Mission Control shell integrates command palette and help target', () => {
  assert.match(shell, /CommandPalette/);
  assert.match(shell, /help-region/);
});
