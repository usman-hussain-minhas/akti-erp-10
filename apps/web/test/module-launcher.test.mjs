import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const launcher = readFileSync(new URL('../components/mission-control/module-launcher.tsx', import.meta.url), 'utf8');
const shell = readFileSync(new URL('../components/mission-control/mission-control-shell.tsx', import.meta.url), 'utf8');

test('module launcher reads the existing module registry endpoint when configured', () => {
  assert.match(launcher, /NEXT_PUBLIC_API_BASE_URL/);
  assert.equal(launcher.includes('/platform/modules'), true);
  assert.match(launcher, /Authorization/);
  assert.equal(launcher.includes('Connect the local/demo API to load the module registry'), true);
});

test('module launcher maps known Phase 2 modules to read-only shell surfaces', () => {
  assert.match(launcher, /display_description/);
  assert.match(launcher, /visibility_state/);
  assert.match(launcher, /required_capabilities/);
  assert.match(launcher, /Visibility does not equal authority/);
  assert.match(launcher, /No approved operator route is available for this module/);
});

test('module launcher does not introduce module lifecycle or Foundry controls', () => {
  for (const forbidden of [
    'install module',
    'enable module',
    'disable module',
    'marketplace',
  ]) {
    assert.equal(launcher.includes(forbidden), false);
  }
});

test('Mission Control shell integrates the module launcher component', () => {
  assert.match(shell, /ModuleLauncher/);
  assert.doesNotMatch(shell, /MODULE_LAUNCHER_ITEMS/);
});
