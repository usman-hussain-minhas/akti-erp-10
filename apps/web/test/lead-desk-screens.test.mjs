import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const inbox = readFileSync(new URL('../app/lead-desk/inbox/page.tsx', import.meta.url), 'utf8');
const create = readFileSync(new URL('../app/lead-desk/create/page.tsx', import.meta.url), 'utf8');
const detail = readFileSync(new URL('../app/lead-desk/leads/[leadId]/page.tsx', import.meta.url), 'utf8');
const actions = readFileSync(new URL('../app/lead-desk/leads/[leadId]/actions/page.tsx', import.meta.url), 'utf8');
const apiClient = readFileSync(new URL('../app/lead-desk/api-client.ts', import.meta.url), 'utf8');
const contextHook = readFileSync(new URL('../app/lead-desk/operator-context.ts', import.meta.url), 'utf8');

test('operator context persists in session storage', () => {
  assert.match(contextHook, /sessionStorage\.setItem/);
  assert.match(contextHook, /sessionStorage\.getItem/);
  assert.match(contextHook, /organizationId/);
  assert.match(contextHook, /actorUserId/);
});

test('api client injects actor header and organization scoped path', () => {
  assert.match(apiClient, /'x-actor-user-id'/);
  assert.match(apiClient, /organizations\/\$\{encodeURIComponent\(context\.organizationId\.trim\(\)\)\}/);
  assert.match(apiClient, /throw new Error\('API_BASE_UNAVAILABLE'\)/);
});

test('inbox screen has explicit loading error permission and degraded states', () => {
  assert.match(inbox, /state === 'loading'/);
  assert.match(inbox, /state === 'error'/);
  assert.match(inbox, /state === 'permission'/);
  assert.match(inbox, /state === 'degraded'/);
});

test('create screen submits required payload fields', () => {
  assert.match(create, /full_name/);
  assert.match(create, /phone_e164/);
  assert.match(create, /source_ref/);
  assert.match(create, /requested_at/);
});

test('detail screen fetches scoped lead path and handles context state', () => {
  assert.match(detail, /\/leads\/\$\{encodeURIComponent\(routeLeadId\)\}/);
  assert.match(detail, /temporary operator context/i);
  assert.match(detail, /state === 'not_found'/);
});

test('actions screen posts status and assignment to scoped endpoints', () => {
  assert.match(actions, /\/status/);
  assert.match(actions, /\/assignment/);
  assert.match(actions, /requested_at/);
});

test('lead desk links do not expose actor_user_id query parameter', () => {
  assert.equal(inbox.includes('actor_user_id='), false);
  assert.equal(create.includes('actor_user_id='), false);
  assert.equal(detail.includes('actor_user_id='), false);
  assert.equal(actions.includes('actor_user_id='), false);
});
