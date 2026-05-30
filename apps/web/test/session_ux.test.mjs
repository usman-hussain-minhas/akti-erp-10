import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contextHook = readFileSync(new URL('../app/lead-desk/operator-context.ts', import.meta.url), 'utf8');
const stateCopy = readFileSync(new URL('../components/session/session_state.ts', import.meta.url), 'utf8');
const status = readFileSync(new URL('../components/session/session_status.tsx', import.meta.url), 'utf8');
const diagnostics = readFileSync(new URL('../components/session/advanced_diagnostics_session_panel.tsx', import.meta.url), 'utf8');

test('session model declares the four approved Phase 4B states', () => {
  for (const state of ['active', 'missing', 'expired_invalid', 'limited_diagnostics']) {
    assert.match(contextHook, new RegExp(state));
    assert.match(stateCopy, new RegExp(state));
  }
});

test('six-step session setup path remains Advanced Diagnostics based', () => {
  assert.match(stateCopy, /Session missing/);
  assert.match(status, /Set up session/);
  assert.equal(status.includes('href="/app/settings?section=advanced-diagnostics#advanced-diagnostics"'), true);
  assert.match(diagnostics, /Advanced Diagnostics Session/);
  assert.equal(diagnostics.includes('updateContext({ sessionToken: sessionTokenDraft })'), true);
  assert.match(diagnostics, /Session active/);
});

test('technical token entry is isolated from normal shell status', () => {
  assert.equal(status.includes('<textarea'), false);
  assert.equal(status.includes('Bearer session token'), false);
  assert.match(diagnostics, /<Textarea/);
  assert.match(diagnostics, /Bearer session token/);
});
