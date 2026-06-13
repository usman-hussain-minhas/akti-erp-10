# AKTI Core v0.0.2 Route/API Path Compatibility Plan v1

Status: AKTI_ROUTE_API_PATH_COMPATIBILITY_PLAN_READY_FOR_REVIEW

## Purpose

This plan defines how AKTI should handle lower_snake_case migration for public route/API compatibility surfaces. It is planning/control only. It does not rename public route folders, API folders, contracts, manifests, schemas, package entrypoints, generated registry files, or historical evidence.

## Compatibility Rule

Route/API/public-surface paths remain compatibility exceptions until a separate approved migration provides:

- alias or redirect behavior where users, screen contracts, links, or API clients depend on the current path;
- route/API contract updates;
- targeted API/client tests;
- screenshot validation when UI routes are affected;
- human approval before any public path rename.

## Surface Decisions

| Surface | Current path examples | Risk | Decision | Future migration requirements | Human approval trigger |
| --- | --- | --- | --- | --- | --- |
| `lead-desk` | `apps/web/app/lead-desk/**`, `apps/api/src/lead-desk/**`, `packages/contracts/lead-desk-*` | Public route/API and CRM visible-label compatibility boundary. | Keep as compatibility exception. CRM remains visible-label-only over Lead Desk technical surfaces. | Alias or redirect plan, screen contract update, API/client tests, screenshots for affected UI routes, manifest/contract review. | Any rename of route folder, API folder, contract filename, module manifest key, model, or public URL. |
| `module-registry` | `apps/api/src/module-registry/**`, `packages/contracts/module-manifest.schema.ts` | API/module authority surface and manifest validation boundary. | Keep as compatibility exception until a versioned API/contract migration is approved. | API contract update, module registry service/controller tests, manifest validation proof, Foundry compatibility check. | Any rename of API path, service/module filenames with exported imports, or contract entrypoints. |
| `access-core` | `apps/api/src/access-core/**`, `packages/contracts/access-core-*` | Permission/capability authority surface. | Keep as compatibility exception. | Access Core contract update, negative permission tests, Gatekeeper integration validation. | Any rename that could affect permission imports, capability names, module manifest references, or package exports. |
| `data-controls` | `apps/api/src/data-controls/**` | Platform governance/status API surface. | Keep as compatibility exception. | API route contract update, data-controls status tests, UI consumer review. | Any route/controller/module path rename. |
| `engagement-gateway` | `apps/api/src/engagement-gateway/**`, `packages/contracts/engagement-gateway-lite*` | Shared platform module and WhatsApp stub boundary. | Keep as compatibility exception. | API/contract update, adapter boundary tests, no production provider authorization. | Any rename touching module key, contract export, provider boundary, or event names. |
| `file-service` | `apps/api/src/file-service/**` | File API/service compatibility surface. | Keep as compatibility exception. | API tests, storage boundary review, no production storage changes without approval. | Any route/controller/service path rename or public API path change. |
| `import-export` | `apps/api/src/import-export/**` | Public import/export capability boundary. | Keep as compatibility exception. | API contract update, permission/capability review, import/export tests. | Any rename touching public API route, capability, or exported service path. |
| `platform-health` | `apps/api/src/platform-health/**` | Platform health/status API surface. | Keep as compatibility exception. | API contract update, status endpoint tests, UI status consumer review. | Any controller/module route rename or endpoint path change. |
| `platform-observability` | `apps/api/src/platform-observability/**` | Audit/event/logging substrate. | Keep as compatibility exception. | Event/audit contract review, outbox tests, logging compatibility validation. | Any rename of event/outbox/audit service paths used outside local module scope. |
| `ai-proxy` | `apps/api/src/ai-proxy/**` | Deferred AI integration boundary. | Keep as compatibility exception. | Explicit AI scope approval, API contract update, no runtime AI/provider activation without approval. | Any rename that implies AI feature activation or provider integration. |
| `organization-setup` | `apps/api/src/organization-setup/**`, `apps/web/app/setup/organization` | Setup/onboarding route and API compatibility surface. | Keep current route/API path until a setup contract migration is approved. | Route contract update, API tests, screenshots for setup route, onboarding validation. | Any public setup URL, controller, DTO, or service path rename. |

## Exception Registry Decision

PR 34 does not expand `.path_policy_exceptions.json`. Existing public-surface paths remain allowed through the Core v0.0.2 legacy baseline inventory, while new hyphenated files under those areas still require an explicit exception review before they are added.

## Route/API Compatibility Risks

- Renaming `lead-desk` without aliases would break existing URLs and contradict the CRM visible-label-only rule.
- Renaming API module directories can break imports, controller/module references, tests, contracts, and package consumers even when HTTP paths appear unchanged.
- Renaming manifest or contract files can affect package exports and generated validation assumptions.
- Route/API compatibility work must not be batched into docs-only migration PRs.

## Validation Required For Any Future Migration

- `node scripts/quality/check_lower_snake_case_paths.mjs`
- `pnpm contracts:validate`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- targeted API/client tests for each affected surface
- screenshot validation for affected UI routes
- `pnpm build`
- `git diff --check`
- `git status --short --branch`

## Human Approval Triggers

- Any public URL or API path rename.
- Any route alias, redirect, or compatibility window decision.
- Any contract/schema/package export change.
- Any Lead Desk technical route/API/model/contract rename.
- Any CRM technical migration.
- Any Phase 6 app/module path activation.

## Recommended Next Step

Proceed to PR 35, which should keep historical `codex-review/**` evidence stable while defining lower_snake_case future evidence paths.

Final status: AKTI_ROUTE_API_PATH_COMPATIBILITY_PLAN_READY_FOR_REVIEW
