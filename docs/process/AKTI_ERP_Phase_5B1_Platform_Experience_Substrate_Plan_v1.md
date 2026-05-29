# AKTI ERP Phase 5B1 — Platform Experience Substrate & Future-Proofing Plan v1

**Status:** `PHASE_5B1_PLANNING_ONLY`

Phase 5B1 prepares real platform substrate for Phase 5C and Phase 6 without building Phase 6 features. It adds or confirms naming, organization profile, branding, module visibility, capability namespace, honest status surfaces, search/notification/data-control contracts, AI data classification, and screen-contract registry support.

This document is a planning/control document only. It is not a ticket pack, implementation authorization, runtime API authorization, Prisma/schema authorization, frontend implementation authorization, or Phase 6 authorization.

## 1. Authority and Source-of-Truth Rules

- Chat is planning input only.
- Roadmap text is planning context only.
- Prisma, contracts, module manifests, generated registry, ADRs, active docs, tests, and validation evidence win over roadmap/chat.
- No frontend implementation may occur without screen contracts.
- Non-route surfaces require component contracts.
- Do not invent capabilities, APIs, roles, modules, permissions, events, or fake dashboards.
- Do not implement Phase 6 business modules in Phase 5B1.
- No runtime implementation is authorized by this plan alone.
- Evidence supports delivery; it does not replace working software.

## 2. Inputs Inspected and Repo-State Summary

Files and directories inspected for this plan:

- `prisma/schema.prisma`
- `prisma/entity-registry.metadata.json`
- `generated/entity-registry.generated.json`
- `packages/contracts/module-manifest.schema.ts`
- `packages/contracts/access-core-capability-seed.contract.ts`
- `packages/contracts/access-core.module-manifest.contract.ts`
- `packages/contracts/lead-desk-core.module-manifest.contract.ts`
- `packages/contracts/engagement-gateway-lite.module-manifest.contract.ts`
- `packages/contracts/screen-contract.schema.ts`
- `apps/api/src/app.module.ts`
- `apps/api/src/platform-health/**`
- `apps/api/src/platform-observability/**`
- `apps/api/src/module-registry/**`
- `apps/api/src/configuration/**`
- `apps/api/src/access-core/**`
- `apps/api/src/search/**`
- `apps/api/src/communication/**`
- `apps/api/src/scheduler/**`
- `apps/api/src/import-export/**`
- `apps/api/src/reporting/**`
- `apps/api/src/file-service/**`
- `apps/web/app/**`
- `apps/web/components/**`
- `apps/web/lib/**`
- `docs/process/AKTI_ERP_Phase_5C_Visual_Direction_Decision_Memo_v1.md`
- `docs/process/AKTI_ERP_Phase_5C_Frontend_Current_State_Evidence_v1.md`
- `docs/process/AKTI_ERP_Phase_5C_Frontend_Improvement_Backlog_Candidates_v1.md`
- `AGENTS.md`
- `docs/process/AKTI_ERP_Autonomous_Runbook_v2.md`
- `docs/process/AKTI_ERP_Master_Roadmap_Reference_v2.md`
- `docs/process/AKTI_ERP_Phase_Roadmap_v2.md`

Repo-state summary:

| Area | Repo-state marker | Current state |
| --- | --- | --- |
| Organization model fields | PARTIAL | `Organization.display_name` exists and is required. `short_name`, `logo_url`, and `branding_config` are missing. `OrganizationSetting` exists as tenant-scoped JSON config. |
| Module manifest fields | PARTIAL | `module_key`, `display_name`, capabilities, permissions, API routes, events, settings, menu entries, health checks, and data ownership exist. Top-level `required_capabilities`, display metadata, `visibility_state`, and `ai_data_classification` are missing. |
| Access Core capability seed pattern | EXISTING | `packages/contracts/access-core-capability-seed.contract.ts` seeds `platform.shell.access` and `access.policy.manage`; Access Core falls back to contract seeds when the DB catalog is empty. |
| Module Registry response/shape | PARTIAL | `/platform/modules`, `/platform/modules/frontend`, and lifecycle status routes exist. Responses expose module key/display/version/status, tenant context, and `platform.shell.access`; role-aware visibility and the Phase 5B1 module-card shape are missing. |
| Platform observability/current surfaces | PARTIAL | Audit log, event outbox, structured logger, and `/platform/health` exist. `GET /platform/status/overview` with Mission Control-ready states is missing. |
| Configuration service boundaries | PARTIAL | Configuration owns portal mode, tenant-config baseline, branding assets settings, configurable labels, and domain sender identity helpers. `GET /platform/branding/effective` and organization profile read substrate are missing. |
| Frontend route/config locations | PARTIAL | Routes exist under `apps/web/app/**`; route/navigation decisions are hardcoded in `MissionControlShell`, `ModuleLauncher`, and `CommandPalette`. No `apps/web/lib/routes.config.ts` exists. |
| Screen contract schema status | EXISTING | `packages/contracts/screen-contract.schema.ts` exists and requires capabilities for private portal screens. The Phase 5C screen contract registry document is missing. |
| Generated registry status | EXISTING | Generated registry and metadata both contain 26 entities, including `Organization`, `OrganizationSetting`, `ModuleRegistryEntry`, `WorkflowDefinition`, `WorkflowInstance`, `GatekeeperDecisionRecord`, and Lead Desk models. |

Planning interpretation:

- Repo inspection confirms multiple Phase 5B1 needs are real gaps, not assumptions.
- Visual/product decisions confirm desired AKTI Spark, CRM alias, dark-mode direction, and topbar/sidebar product behavior.
- Existing substrate should receive verification tickets before modification.
- Missing substrate requires implementation tickets later, after ticket-pack creation.
- Partial substrate requires bounded completion tickets that preserve existing behavior.
- No unknown blocker was found that prevents creating the Phase 5B1 ticket pack after review.

## 3. Phase 5B1 Scope Summary

Phase 5B1 has a final 22-item substrate scope. The scope is substrate only:

- metadata;
- contracts;
- capability namespace;
- read surfaces;
- honest state endpoints;
- frontend config authority;
- planning docs;
- no business modules.

Phase 5B1 must not implement Phase 5C UI polish, Phase 6A Golden Module certification, Phase 6B+ business modules, marketplace/store behavior, real providers, runtime AI, or production deployment.

## 4. Detailed 22-Item Substrate Scope

### 1. AKTI Spark product identity

Update visible product shell naming to:

```text
AKTI Spark
```

Allowed:

- frontend display constants;
- docs/status references;
- UI copy;
- safe package display names only if they do not break tooling.

Forbidden:

- no repo/package identity rename that breaks tooling;
- no company/legal rename;
- no database rename;
- no module rename.

MISSING: The visual direction memo locks AKTI Spark, but current frontend copy still shows `AKTI ERP` in the root scaffold and Mission Control shell. No dedicated product display constant was found.

Planning classification: repo inspection confirmed needed; implementation ticket required.

### 2. CRM visible alias over Lead Desk

User-facing label:

```text
CRM
```

Technical surfaces remain:

```text
lead-desk routes
lead-desk files
lead-desk API
lead-desk data model
```

Rule:

```text
CRM is a visible/product label only in Phase 5B1/5C.
Do not rename lead-desk files, routes, APIs, contracts, or models unless a later CRM migration is separately approved.
```

This rule must be added to the Phase 5B1 ticket pack and recommended for `AGENTS.md`.

PARTIAL: Lead Desk technical routes, files, contracts, and Prisma models exist. Visible frontend labels still say Lead Desk. The CRM alias rule is locked in the visual direction memo but not applied to user-facing surfaces.

Planning classification: assumed needed from visual/product decision and confirmed by repo inspection; implementation ticket required, with explicit no-technical-rename guardrail.

### 3. Shell route metadata as frontend-only config

Shell route metadata must live in frontend config, not backend API.

Preferred location:

```text
apps/web/lib/routes.config.ts
```

or equivalent repo-real frontend config location.

It should be a typed constant:

```ts
route -> {
  type,
  label,
  capability_required?,
  visible,
  section
}
```

Allowed route types:

```text
primary_navigation
system_navigation
diagnostics
hidden
future
```

Rules:

- Backend does not know about frontend route classification.
- Do not create a backend endpoint for shell route metadata.
- Do not hardcode future business routes as active navigation.

MISSING: `apps/web/lib/` currently contains only `utils.ts`; navigation and command route lists are hardcoded in frontend components.

Planning classification: repo inspection confirmed needed; implementation ticket required.

### 4. Organization display name / short name

Inspect the Organization model first.

If absent, plan nullable fields:

```text
display_name
short_name
```

Purpose:

- topbar org badge;
- org switcher;
- Settings org profile;
- white-label display.

PARTIAL: `Organization.display_name` exists and is required. `Organization.short_name` is missing.

Planning classification: already existing field requires verification; missing field requires a schema/registry/migration ticket if still approved by ticket-pack review.

### 5. Organization logo URL

Plan nullable:

```text
logo_url
```

Purpose:

- Phase 5C can display org logo/initials;
- Phase 6A+ can build upload/write/storage later.

Forbidden:

- no file upload;
- no S3 write path;
- no image cropper;
- no logo upload UI.

MISSING: `Organization.logo_url` is absent. Configuration service has a `white_label.branding_assets` setting with `logo_url` support, but no organization-profile logo field exists.

Planning classification: repo inspection confirmed needed; schema/registry/migration ticket required if the plan chooses a Prisma field instead of settings-only read composition.

### 6. Organization branding config

Plan nullable JSON:

```json
{
  "logo_url": null,
  "primary_color": null,
  "accent_color": null,
  "product_name_override": null,
  "theme_mode": null
}
```

Purpose:

- future white-label foundation;
- per-org override foundation;
- theme preference foundation.

Forbidden:

- no full white-label editor;
- no per-org write UI;
- no domain branding;
- no storage workflow.

PARTIAL: `Organization.branding_config` is absent. `OrganizationSetting.value_json` exists and ConfigurationService already handles tenant-scoped settings, branding assets, and configurable labels. The exact Phase 5B1 branding config read shape is missing.

Planning classification: partial substrate; ticket-pack review must decide whether to add a nullable Prisma field or derive the read model from `OrganizationSetting`.

### 7. Platform branding defaults

Add/confirm code-level platform defaults, not DB records:

```text
product_name: AKTI Spark
dark mode flagship tokens
light mode derived tokens
purple = brand identity
teal/cyan = action/system activation
```

Reason: the product should know its default brand without requiring a database round-trip.

MISSING: No platform branding defaults file was found. Current frontend uses component/local CSS variables and visible `AKTI ERP` copy.

Planning classification: repo inspection confirmed needed; implementation ticket required.

### 8. GET /platform/organization/profile

Read-only endpoint.

Required response shape:

```json
{
  "organization_id": "...",
  "display_name": "Rising Stars Academy",
  "short_name": "RS",
  "logo_url": null,
  "branding_config": {},
  "my_modules": ["lead-desk"],
  "my_role": "manager",
  "my_capabilities": ["platform.crm.access", "platform.modules.view"]
}
```

Important:

- Use `my_capabilities`, not `my_capability_count`.
- The frontend can derive capability count if needed.
- This supports the org badge dropdown: "what is assigned to me in this organization."
- No PATCH endpoint unless already safely present.

MISSING: No `/platform/organization/profile` endpoint was found. Existing pieces include `Organization`, Access Core user/group/capability reads, Module Registry reads, and Configuration tenant config, but no single read substrate exists.

Likely owning service: a new or existing platform organization/profile read surface must be selected during ticket exact-file planning. It should compose existing Prisma, Access Core, Configuration, and Module Registry facts without adding a write API.

Planning classification: repo inspection confirmed needed; API/service/controller/module registration/test tickets required.

### 9. GET /platform/branding/effective

Read-only endpoint.

Correct response shape:

```json
{
  "product_name": "AKTI Spark",
  "logo_url": null,
  "theme_mode": "system",
  "primary_color": null,
  "accent_color": null
}
```

Important:

- Do not return CSS design tokens from backend.
- Backend returns branding facts.
- Frontend computes visual tokens.

PARTIAL: ConfigurationService already has branding asset and tenant-config helpers, but no `/platform/branding/effective` endpoint or exact response exists.

Likely owning service: ConfigurationService/ConfigurationController unless ticket inspection finds a better existing branding boundary.

Planning classification: partial substrate; read-only API ticket required.

### 10. Seed platform.crm.access

Seed capability:

```text
platform.crm.access
```

Purpose:

- CRM visible access capability;
- maps to Lead Desk technical route for now;
- does not grant destructive authority.

MISSING: Access Core seed currently includes `platform.shell.access` and `access.policy.manage`. `platform.crm.access` is not seeded.

Planning classification: repo inspection confirmed needed; capability seed/manifest/test ticket required.

### 11. Module manifest required_capabilities[]

Verify first. Add if missing:

```json
{
  "required_capabilities": []
}
```

Purpose:

- modules declare required capability before install/display/use;
- Foundry/Gatekeeper can validate capability requirements.

PARTIAL: Screen contribution and screen contract schemas already have `required_capabilities`. The top-level module manifest schema does not have `required_capabilities`.

Planning classification: partial substrate; contract/schema ticket required only if review confirms module-level requirements belong in the manifest schema.

### 12. Module display metadata

Add/confirm module display metadata:

```json
{
  "display_name": "CRM",
  "display_description": "...",
  "icon_key": "users",
  "category": "business",
  "route": "/lead-desk",
  "visibility_state": "available",
  "required_capabilities": []
}
```

PARTIAL: Manifest `display_name` exists, ModuleRegistryEntry has `display_name`, `version`, `status`, and `manifest_hash`, and frontend ModuleLauncher has hardcoded display descriptions/routes. Manifest-level `display_description`, `icon_key`, `category`, route, `visibility_state`, and top-level `required_capabilities` are missing.

Planning classification: repo inspection confirmed partial substrate; contract and registry response tickets required.

### 13. visibility_state enum

Use five states:

```text
available
requires_setup
locked
coming_soon
hidden
```

Behavior:

```text
available      -> Open module
requires_setup -> Finish setup
locked         -> Coming soon / unavailable, no open action
coming_soon    -> Coming soon, no open action
hidden         -> not rendered
```

PARTIAL: Module lifecycle status exists with values like `proposed`, `installable`, `installed`, `enabled`, `disabled`, and `blocked`; command contributions also have a separate `visibility_condition`. The Phase 5B1 `visibility_state` enum does not exist.

Planning classification: partial substrate; contract/model/read-response ticket required.

### 14. Role-aware /platform/modules

`/platform/modules` must return modules based on current actor capability/role context.

Rule:

```text
Visibility does not equal authority.
```

A user seeing CRM does not mean the user can import, export, delete, approve, configure, or administer CRM.

This rule must appear in:

- Phase 5B1 plan;
- `AGENTS.md` recommendation;
- Phase 5C screen contracts.

PARTIAL: `/platform/modules` and `/platform/modules/frontend` exist. Current responses are module registry reads keyed by runtime manifest registration and do not yet filter or shape module visibility by actor capability/role context.

Likely change surface: ModuleRegistryService/Controller plus Access Core capability context and focused tests.

Planning classification: repo inspection confirmed partial substrate; implementation ticket required.

### 15. Data-control capability namespace

Plan/reserve capability names:

```text
platform.data.controls.view
platform.import_export.manage
platform.export.run
platform.import.run
platform.backup_restore.manage
```

Not all granted. Not all UI built.

Purpose:

- Phase 5C can show Data Controls honestly;
- future Phase 6/6A can wire real import/export and backup permissions.

MISSING: The exact namespace was not found in Access Core seeds or contracts. Import/export service contracts exist, but these platform capability names are not seeded.

Planning classification: repo inspection confirmed needed; capability namespace/registry planning and seed tickets required.

### 16. Platform Capability Namespace Registry

Create committed document:

```text
docs/process/AKTI_ERP_Platform_Capability_Namespace_Registry_v1.md
```

It must include columns:

- capability
- owner
- seeded_phase
- status
- meaning
- grantable_to
- notes

Initial capabilities include:

- `platform.shell.access`
- `platform.crm.access`
- `platform.modules.view`
- `platform.organization.profile.view`
- `platform.branding.view`
- `platform.data.controls.view`
- `platform.import_export.manage`
- `platform.export.run`
- `platform.import.run`
- `platform.backup_restore.manage`
- `platform.search.query`
- `platform.notifications.summary.view`
- `platform.shell.actions.view` reserved only; no endpoint in 5B1.

Example `grantable_to` guidance:

- `platform.crm.access` -> any authenticated operator.
- `platform.data.controls.view` -> manager, director, super-admin.
- `platform.import_export.manage` -> director, super-admin only.
- `platform.backup_restore.manage` -> super-admin only.

MISSING: `docs/process/AKTI_ERP_Platform_Capability_Namespace_Registry_v1.md` does not exist.

Planning classification: repo inspection confirmed needed; docs/control ticket required, with runtime enforcement remaining in Access Core/Gatekeeper.

### 17. Search scope contract

Ground search scope in current Phase 5B searchable surfaces.

Searchable now:

```text
WorkflowDefinition
WorkflowInstance
```

Not searchable yet:

- CRM/Lead Desk records;
- files/documents unless already wired;
- notifications;
- future business modules.

Never allowed:

- cross-tenant leakage;
- unauthorized module search;
- fake search results.

5B1 may add/reserve:

```text
platform.search.query
```

but does not expand searchable data beyond existing Phase 5B surfaces.

PARTIAL: SearchService exists with PostgreSQL FTS baseline concepts and targets only `WorkflowDefinition` and `WorkflowInstance`; `platform.search.query` appears in SearchService and tests. A committed Phase 5B1 search scope contract document/read substrate is missing.

Planning classification: existing runtime surface requires confirmation/contract ticket; no new searchable data should be added in 5B1.

### 18. Notification summary contract

Add/confirm minimal read surface:

```text
GET /platform/notifications/summary
```

Allowed response:

```json
{
  "unread_count": 0,
  "status": "not_configured"
}
```

No real provider. No notification center. No email/SMS/WhatsApp integration.

Purpose: Phase 5C notification bell is honest, not decorative.

MISSING: The frontend has a static NotificationCenter, and CommunicationService declares/stubs communication intent and local delivery proof, but no `/platform/notifications/summary` read route exists.

Planning classification: repo inspection confirmed needed; read-only API/contract ticket required.

### 19. Platform status overview

Add/confirm:

```text
GET /platform/status/overview
```

Return honest current states:

```json
{
  "workspace_connection": "not_connected",
  "crm_pipeline": "unavailable",
  "platform_services": "offline",
  "data_controls": "unavailable"
}
```

Before creating this endpoint, inspect:

```text
apps/api/src/platform-observability/**
```

Look for:

- existing health check routes;
- event-outbox status;
- audit-log status surfaces;
- observability controller/service patterns.

If a health/observability surface already exists, shape a new route on the existing service. Do not create a new service unnecessarily.

PARTIAL: `/platform/health` exists through `PlatformHealthController`, using ModuleRegistryService and StructuredLoggerService. Audit log, event outbox, and structured logger services exist. The exact `/platform/status/overview` route and Mission Control status response are missing.

Likely owning surface: `apps/api/src/platform-health/platform-health.controller.ts` unless ticket exact-file planning proves a better existing observability boundary.

Planning classification: partial substrate; API ticket required.

### 20. Data controls status

Add/confirm:

```text
GET /platform/data-controls/status
```

Allowed response:

```json
{
  "import_export": "unavailable",
  "retention_policy": "inactive",
  "audit_controls": "inactive"
}
```

No actual import/export workflow in 5B1 unless already approved.

MISSING: Import/export service and reporting/file service surfaces exist, but no `/platform/data-controls/status` endpoint or exact Data Controls read contract exists.

Planning classification: repo inspection confirmed needed; read-only API/contract ticket required.

### 21. ai_data_classification in module manifest

Add module-level declaration:

```json
{
  "ai_data_classification": "readable | restricted | prohibited"
}
```

Purpose:

- every future module declares AI data boundary before install;
- Phase 7 AI runtime can later obey this.

This does not build AI runtime.

MISSING: `ai_data_classification` was not found in module manifest schema or module manifest contracts.

Planning classification: repo inspection confirmed needed; contract/schema/test ticket required.

### 22. Phase 5C Screen Contract Registry document

Docs deliverable, not API.

Create:

```text
docs/process/AKTI_ERP_Phase_5C_Screen_Contract_Registry_v1.md
```

It lists every planned Phase 5C route and contract status:

```text
defined
pending
deferred
blocked
```

Routes likely include:

- `/`
- `/app`
- `/app/settings`
- `lead-desk` visible as CRM
- `/modules` or repo-real module route if present
- diagnostics
- command/search surface
- notification surface
- mobile shell

Important:

- route screens use screen contracts;
- non-route surfaces use component contracts.

Non-route component contract examples:

- command palette;
- notification drawer;
- workspace status card;
- organization badge;
- module card.

Component contract fields:

- trigger;
- scope;
- data source;
- capability filter;
- keyboard behavior;
- empty state;
- must-not-show;
- mobile behavior;
- accessibility/focus behavior.

MISSING: `docs/process/AKTI_ERP_Phase_5C_Screen_Contract_Registry_v1.md` does not exist. Screen contract schema exists, and Phase 5C current-state evidence has a route inventory.

Planning classification: repo inspection confirmed needed; docs/control ticket required.

## 5. Removed / Deferred Scope

Explicitly removed or deferred from Phase 5B1:

- dynamic `GET /platform/shell/actions`, deferred to Phase 6A+;
- CRM technical migration;
- Admissions/Finance/HR implementation;
- marketplace;
- workflow builder;
- drag/drop dashboards;
- real providers;
- WhatsApp production integration;
- AI assistant/runtime;
- logo upload/storage;
- full white-label editor;
- production auth;
- business reports;
- cross-module intelligence.

## 6. Capability Namespace Registry Plan

Phase 5B1 should create:

```text
docs/process/AKTI_ERP_Platform_Capability_Namespace_Registry_v1.md
```

Columns:

- capability;
- owner;
- seeded_phase;
- status;
- meaning;
- grantable_to;
- notes.

This registry is human-readable intent and planning authority. It is not runtime enforcement by itself. Runtime enforcement remains Access Core/Gatekeeper through committed contracts, capability seeds, database catalog, Gatekeeper checks, and tests.

The registry must make clear that `platform.shell.actions.view` is reserved only in Phase 5B1 and does not authorize `GET /platform/shell/actions`.

## 7. Dependency Map to Phase 5C

| Phase 5C surface | Phase 5B1 substrate dependency |
| --- | --- |
| Topbar organization badge | Organization profile read API |
| Org badge dropdown | Organization profile `my_modules`, `my_role`, `my_capabilities` |
| Module grid | Role-aware modules plus `visibility_state` |
| CRM nav | CRM alias plus `platform.crm.access` |
| Workspace status card | Platform status overview |
| Notification bell | Notification summary |
| Search bar | Search scope contract |
| Settings branding section | Effective branding API |
| Data control card | Data controls status plus capability namespace |
| Command palette | Static capability-filtered frontend actions from screen contracts and module visibility |
| Route sidebar | Frontend routes config |

## 8. Ticket Shaping Guidance

Estimate 28-35 tickets after repo inspection.

Guidance:

- exact ticket count is not fixed;
- split by architectural surface, not anxiety about queue size;
- one ticket, one outcome;
- schema/registry tickets must include Prisma schema, metadata, generated registry, and migration authority where needed;
- capability tickets must include tests;
- API tickets must include service/controller/module/app registration/test ownership where needed;
- frontend-visible naming tickets must not rename technical routes;
- before finalizing the ticket pack, re-confirm each item's existence against the current repo;
- items marked EXISTING in this plan require verification tickets or may be skipped;
- items marked MISSING require implementation tickets;
- items marked PARTIAL require bounded completion tickets;
- items marked UNKNOWN require inspection tickets before implementation.

Potential recurring ticket-pack guardrails:

- Do not create frontend screens without screen contracts.
- Do not create non-route surface behavior without component contracts.
- Do not create fake dashboard cards, fake metrics, fake modules, or fake notifications.
- Do not expand searchable data beyond the current Phase 5B searchable surfaces without a separate approved contract.
- Do not make visibility equal authority.
- Do not rename Lead Desk technical surfaces while applying CRM visible labels.
- Do not use roadmap text or chat as implementation authority.

## 9. Proposed Ticket Group Outline

This is a group outline only. It is not a ticket pack.

- baseline/control;
- AKTI Spark naming;
- CRM visible alias;
- route metadata config;
- organization profile fields;
- logo/branding fields;
- branding defaults/effective branding;
- organization profile API;
- CRM capability seed;
- manifest `required_capabilities`;
- manifest `ai_data_classification`;
- module display metadata plus `visibility_state`;
- role-aware modules;
- capability namespace registry;
- data-control capabilities;
- search scope contract;
- notification summary;
- platform status overview;
- data-controls status;
- Phase 5C screen contract registry;
- final audit plus Phase 5C readiness handoff.

## 10. Validation Ladder

Phase 5B1 ticket-pack validation should include the relevant subset of:

```bash
pnpm contracts:validate
pnpm exec prisma validate --schema prisma/schema.prisma
pnpm exec prisma generate --schema prisma/schema.prisma
pnpm registry:generate
pnpm registry:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
git status --short --branch
```

Docs-only planning tickets do not require runtime validation beyond docs diff checks unless they also inspect generated artifacts. Runtime, schema, contract, API, and frontend tickets must use their stricter ladders.

## 11. Final Recommendation

```text
READY_TO_CREATE_PHASE_5B1_TICKET_PACK_AFTER_REVIEW
```

No repo blocker was found that prevents a Phase 5B1 ticket pack from being drafted after review. The ticket pack must remain substrate-only, must re-confirm exact files before each ticket, and must not start Phase 5C implementation or Phase 6 scope.
