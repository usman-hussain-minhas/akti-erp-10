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
