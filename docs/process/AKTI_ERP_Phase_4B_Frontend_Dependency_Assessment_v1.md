# AKTI ERP Phase 4B Frontend Dependency Assessment v1

**Status:** PRODUCT_DEPENDENCY_ASSESSMENT

| Feature | Existing frontend support | Existing API support | Backend needed? | Policy dependency? | Recommendation |
| --- | --- | --- | --- | --- | --- |
| Shell/nav | Minimal `/app`; no real shell | N/A | no | no | build Phase 4B shell |
| Settings portal mode | Planned contract, no page | portal-mode read/update | no for read/update if session safe | Gatekeeper UX | build General section |
| Users/groups/hierarchy | Planned contracts, no pages | Access Core and hierarchy endpoints | no for limited reads | Access policy | build safe read views; gate/placeholder mutations |
| Module list | No frontend route | `GET /platform/modules` | no | no installer policy yet | build read-only module list |
| Lead Desk polish | Existing pages | existing Lead Desk APIs | no for polish | human terminology needed | build UX cleanup without inventing terms |
| Session/user UI | Active `operator-context.ts` only | Phase 3 bearer session verification | no for minimum diagnostics path | future auth provider deferred | build session indicator and Advanced Diagnostics |
| Dashboard v1 | `/app` scaffold | module list, health, Lead Desk list if session safe | maybe for aggregates | no | build existing-API-only dashboard; defer unsupported widgets |
| Command palette | none | route/navigation only | no | no | build local navigation command palette |
| Notification shell | none | no notification API/policy | no for shell placeholder | Phase 5A for semantics | build infrastructure shell only |
| Audit/recent activity | none | no frontend-safe activity endpoint confirmed | yes | audit policy | defer / paired backend ticket |
| Advanced search/filter | basic Lead Desk filters | limited per-module APIs | yes for cross-module search | Phase 5A/5B | defer |
| Widget marketplace | none | none | yes | Phase 5B Foundry | defer |

## Boundary Rules

- Backend gaps become paired backend tickets or placeholders.
- No fake operational data.
- No Foundry/module installer controls.
- No Phase 5A policy work inside Phase 4B.
- No production integrations.

## Paired Backend Tickets Required / Deferred

The Phase 4B ticket pack must not create vague “backend work needed” tickets. Any paired backend ticket must name the exact endpoint or backend surface, the UI it unblocks, the validation expected, and the reason a placeholder is not sufficient. Dashboard must not use fake operational data.

| Gap id | Phase 4B feature blocked | Endpoint or backend surface needed | Why it is needed | Recommended action | Dependency/risk notes |
| --- | --- | --- | --- | --- | --- |
| P4B-BE-001 Lead Desk summary endpoint | Dashboard Lead Desk summary cards | `GET /api/lead-desk/:organizationId/summary` or equivalent | Dashboard needs aggregate counts/statuses if the current list API cannot safely provide enough data without client-side guesswork. | Use existing Lead Desk list API if enough; otherwise use placeholder or create a paired Phase 4B backend ticket. | Must preserve organization scope, Access Core checks, and no fake operational data. |
| P4B-BE-002 Current user/profile endpoint | User/org menu and safe session display | `GET /platform/access/me` or equivalent trusted context surface | Shell needs operator-readable display info without exposing raw actor ID, org ID, decoded token internals, or technical session fields. | Create paired backend ticket only if existing trusted context cannot safely provide display info. | Must not invent a login flow, OAuth replacement, or production auth provider in Phase 4B. |
| P4B-BE-003 Recent activity / audit feed endpoint | Dashboard recent activity widget | `GET /platform/activity/recent` or audit-safe equivalent | Recent activity needs real audit-safe event data; fake rows would violate Phase 4B dashboard rules. | Defer unless an existing audit/read endpoint is available; do not invent fake data. | May require Phase 5A policy decisions around activity visibility and audit semantics. |
| P4B-BE-004 Friendly user lookup / assignment display | Lead Desk assigned owner display | Existing Access Core users list or user lookup endpoint | Lead Desk should replace raw `assigned_user_id` with an operator-readable name where safely available. | Use existing Access Core list if safe; otherwise create paired backend ticket or show a placeholder label. | Must preserve same-organization checks and avoid exposing raw user IDs by default. |
| P4B-BE-005 Notification data endpoint | Real notification drawer content | Future notification read endpoint, shape deferred | Real notification content needs delivery, retention, permission, and communication policy. | Defer to Phase 5A notification policy / later implementation; Phase 4B builds shell only. | Phase 4B may render static/demo/system notification shell states only, with no WhatsApp/SMS/email semantics. |
| P4B-SCHEMA-001 Shell capability model limitation | Mission Control shell access for non-admin operators | Phase 5A decision: choose base platform capability such as `platform.shell.access` / `platform.authenticated`, or add a session-gated/authenticated shell screen type | Allows non-admin authenticated operators to access the shell while admin regions remain separately capability-gated. | Phase 5A remediation input before Phase 6 non-admin module/operator rollout. | Current Phase 4B shell requires `access.policy.manage` due to `private_portal` screen-contract schema constraint; if not resolved, Phase 6 non-admin operators/modules may be locked out of the shell or force incorrect admin capability assignment. |
