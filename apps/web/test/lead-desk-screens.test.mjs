import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const inbox = readFileSync(new URL('../app/lead-desk/inbox/page.tsx', import.meta.url), 'utf8');
const create = readFileSync(new URL('../app/lead-desk/create/page.tsx', import.meta.url), 'utf8');
const detail = readFileSync(new URL('../app/lead-desk/leads/[leadId]/page.tsx', import.meta.url), 'utf8');
const actions = readFileSync(new URL('../app/lead-desk/leads/[leadId]/actions/page.tsx', import.meta.url), 'utf8');
const apiClient = readFileSync(new URL('../app/lead-desk/api-client.ts', import.meta.url), 'utf8');
const contextHook = readFileSync(new URL('../app/lead-desk/operator-context.ts', import.meta.url), 'utf8');
const leadDeskScreens = [inbox, create, detail, actions];

test('operator context stores bearer session token and decoded metadata', () => {
  assert.match(contextHook, /sessionStorage\.setItem/);
  assert.match(contextHook, /sessionStorage\.getItem/);
  assert.match(contextHook, /sessionToken/);
  assert.match(contextHook, /decodeSessionMetadata/);
  assert.match(contextHook, /globalThis\.atob/);
  assert.match(contextHook, /organizationId/);
  assert.match(contextHook, /actorUserId/);
  assert.match(contextHook, /input\.sessionToken\.trim\(\)/);
  assert.match(contextHook, /organization_id/);
  assert.match(contextHook, /actor_user_id/);
  assert.match(contextHook, /akti\.leadDesk\.sessionContext\.v1/);
  assert.equal(contextHook.includes('akti.leadDesk.operatorContext.v1'), false);
});

test('api client injects bearer authorization and organization scoped path', () => {
  assert.match(apiClient, /Authorization/);
  assert.match(apiClient, /Bearer \$\{context\.sessionToken\.trim\(\)\}/);
  assert.match(apiClient, /organizations\/\$\{encodeURIComponent\(context\.organizationId\.trim\(\)\)\}/);
  assert.match(apiClient, /throw new Error\('API_BASE_UNAVAILABLE'\)/);
  assert.equal(apiClient.includes('x-actor-user-id'), false);
  assert.equal(apiClient.includes('organization_id'), false);
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
  assert.match(create, /organization_id: context\.organizationId\.trim\(\)/);
  assert.match(create, /actor_user_id: context\.actorUserId\.trim\(\)/);
  assert.match(create, /sessionTokenDraft/);
  assert.match(create, /response\.status === 401 \|\| response\.status === 403/);
});

test('detail screen fetches scoped lead path and handles context state', () => {
  assert.match(detail, /\/leads\/\$\{encodeURIComponent\(routeLeadId\)\}/);
  assert.match(detail, /Session context/);
  assert.match(detail, /sessionTokenDraft/);
  assert.match(detail, /state === 'not_found'/);
});

test('actions screen posts status and assignment to scoped endpoints', () => {
  assert.match(actions, /\/status/);
  assert.match(actions, /\/assignment/);
  assert.match(actions, /requested_at/);
  assert.match(actions, /sessionTokenDraft/);
  assert.match(actions, /response\.status === 401 \|\| response\.status === 403/);
  assert.equal(actions.includes('actor_user_id:'), false);
  assert.equal(actions.includes('organization_id:'), false);
});

test('frontend no longer sends caller-controlled actor header', () => {
  for (const source of [apiClient, contextHook, ...leadDeskScreens]) {
    assert.equal(source.includes('x-actor-user-id'), false);
    assert.equal(source.includes('operatorContext.v1'), false);
  }
});

test('lead desk links do not expose actor_user_id query parameter', () => {
  assert.equal(inbox.includes('actor_user_id='), false);
  assert.equal(create.includes('actor_user_id='), false);
  assert.equal(detail.includes('actor_user_id='), false);
  assert.equal(actions.includes('actor_user_id='), false);
});

test('lead desk navigation does not propagate actor or organization through hrefs', () => {
  for (const source of leadDeskScreens) {
    const hrefExpressions = source.match(/href=\{?`?[^\\n]+/g) ?? [];
    assert.equal(hrefExpressions.some((href) => /actorUserId|actor_user_id|organizationId|organization_id/.test(href)), false);
  }
});

test('lead desk screens do not hardcode tenant actor role or campus fixtures', () => {
  const forbiddenFixturePatterns = [
    /org-1/,
    /actor-1/,
    /user-1/,
    /unit-1/,
    /campus/i,
    /AKTI\s+Campus/i,
  ];

  for (const source of [apiClient, contextHook, ...leadDeskScreens]) {
    for (const pattern of forbiddenFixturePatterns) {
      assert.equal(pattern.test(source), false);
    }
  }
});

test('lead desk screens include permission and degraded handling around api calls', () => {
  for (const source of [inbox, create, detail, actions]) {
    assert.match(source, /state|ActionState|DetailState/);
    assert.match(source, /permission/);
    assert.match(source, /degraded|temporarily/);
  }
});
