import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const primitives = readFileSync(new URL('../components/ui/design-system.tsx', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../components/mission-control/dashboard-overview.tsx', import.meta.url), 'utf8');
const settings = readFileSync(new URL('../components/settings/settings-control-panel.tsx', import.meta.url), 'utf8');

test('state UX baseline exposes reusable plain-English states', () => {
  for (const exportName of ['StateMessage', 'LoadingState', 'ErrorState', 'PermissionState', 'DegradedState', 'SuccessState']) {
    assert.match(primitives, new RegExp(`export function ${exportName}`));
  }

  assert.equal(primitives.includes("role={tone === 'danger' ? 'alert' : 'status'}"), true);
  assert.match(primitives, /Something needs attention/);
  assert.match(primitives, /Access needed/);
  assert.match(primitives, /Limited mode/);
});

test('dashboard and settings apply shared state UX instead of raw errors', () => {
  for (const source of [dashboard, settings]) {
    assert.match(source, /LoadingState/);
    assert.match(source, /ErrorState/);
    assert.match(source, /PermissionState/);
    assert.equal(source.includes('Error:'), false);
    assert.equal(source.includes('stack trace'), false);
    assert.equal(source.includes('API_BASE_UNAVAILABLE'), false);
  }
});
