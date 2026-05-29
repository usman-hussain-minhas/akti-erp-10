# AKTI ERP Phase 5C Ticket Seed Matrix v1

Status: PHASE_5C_TICKET_SEED_MATRIX_READY_FOR_REVIEW

This document is not a ticket pack. It is not implementation authorization. It does not start Phase 5C code changes.

A JSON ticket pack must be created separately after review and Spark Genesis audit. This matrix exists to shape the future ticket pack dependency graph and prevent Phase 5C UI work from starting without the approved control-doc chain.

## 1. Authority And Input Sources

Seed shaping is grounded in:

- `docs/process/AKTI_ERP_Phase_5C_Visual_Direction_v1.md`
- `docs/process/AKTI_ERP_Phase_5C_Screen_Contracts_v1.md`
- `docs/process/AKTI_ERP_Phase_5C_Component_API_Map_v1.md`
- `docs/process/AKTI_ERP_Phase_5C_Spark_Genesis_Readiness_Audit_v1.md`
- `docs/process/AKTI_ERP_Phase_5C_Control_Docs_Spark_Genesis_Audit_v1.md`
- `docs/process/AKTI_ERP_Phase_5C_Screen_Contract_Registry_v1.md`
- `docs/process/AKTI_ERP_Platform_Capability_Namespace_Registry_v1.md`
- `packages/contracts/module-manifest.schema.ts`
- `packages/contracts/screen-contract.schema.ts`
- current frontend route/component/lib surfaces under `apps/web/app`, `apps/web/components`, and `apps/web/lib`
- current Phase 5B1 API surfaces for configuration, module registry, notifications, platform health/status, data controls, and search
- Spark Genesis v0.2.0 frontend checklist and failure patterns

## 2. Seed Matrix Principles

- Visual Direction, Screen Contracts, and Component/API Map are control authority for Phase 5C ticket shaping.
- Every seed maps to at least one route screen or non-route component contract.
- Every seed names source files or file families to inspect before implementation planning.
- Every seed names expected ownership areas, but exact-file plans must still be produced during ticket-pack creation.
- Every seed names validation expectations appropriate to its future implementation surface.
- Every seed preserves the CRM visible-label-only rule over existing Lead Desk technical surfaces.
- Every seed preserves the no fake dashboard, no fake module, no fake metric, no fake notification, no fake analytics, and no fake revenue rule.
- Every seed preserves Phase 6 non-scope.
- Every seed preserves the white-label read-only boundary.
- Every seed preserves the rule that visibility does not equal authority.
- No seed authorizes Phase 5C implementation by itself.
- No seed authorizes a ticket pack by itself.

## 3. Ordered Dependency Groups

### Group 0 - Baseline And Visual Reference Control

Purpose:

- establish the execution baseline;
- verify visual references and control docs are present;
- create committed screenshot acceptance authority;
- avoid implementation.

Seeds:

- `P5C-SEED-000` baseline/control and repo-state evidence.
- `P5C-SEED-001` visual reference and screenshot acceptance baseline.

### Group 1 - Pre-UI Contract Dependencies

This group must come before module-card implementation.

The first implementation dependency in the future ticket pack must be the optional `display_features[]` module manifest contract extension.

Requirements:

- add optional `display_features?: string[]` to module manifest display metadata;
- validate through module manifest / Foundry / module registry validation;
- backfill only approved existing module manifests;
- do not hardcode bullets in frontend;
- no Phase 6 module feature claims.

Additional seeds:

- screen/component contract validation alignment, if needed;
- module display metadata verification.

### Group 2 - Design Tokens And Theme Substrate

Seeds:

- AKTI Spark theme tokens;
- dark mode flagship styling;
- light mode high-contrast derived styling;
- focus, hover, active, disabled states;
- screenshot token acceptance.

No hardcoded data.

### Group 3 - App Shell Layout

Seeds:

- full-width topbar shell;
- sidebar navigation-only shell;
- org badge and user avatar separation;
- workspace status card and mobile shell baseline.

### Group 4 - Navigation And Route Metadata

Seeds:

- Mission Control / CRM / Modules / Settings / Diagnostics navigation;
- Diagnostics de-emphasis;
- CRM visible label over Lead Desk;
- Modules route/action authority handling;
- no technical `lead-desk` rename.

### Group 5 - Mission Control `/app`

Seeds:

- hero/workspace banner;
- role-aware apps grid;
- operational overview layout;
- honest unavailable/offline states;
- no fake metrics;
- no fake module cards;
- CRM pipeline placeholder only.

### Group 6 - Module Card Component

Seeds:

- module card visual states: available, requires_setup, locked, coming_soon, hidden;
- `display_features[]` rendering only when present;
- no hardcoded bullets;
- Modules card as legitimate active surface;
- future business modules not active/openable.

### Group 7 - CRM Visible Label / Lead Desk Surfaces

Seeds:

- CRM visible label in navigation, card, and page title;
- `/lead-desk/inbox` visible as CRM;
- preserve technical Lead Desk routes, files, APIs, contracts, and models;
- no CRM pipeline endpoint.

### Group 8 - Settings And Branding Read-Only Surfaces

Seeds:

- settings shell polish;
- branding read-only section;
- organization profile display;
- no upload, write, cropper, or domain branding.

### Group 9 - Non-Route Overlays And Components

Seeds:

- command palette;
- notification drawer/bell;
- workspace status card;
- org badge dropdown;
- mobile shell interactions.

All must use component contracts.

### Group 10 - Accessibility, Responsive, And Screenshot Acceptance

Seeds:

- keyboard/focus validation;
- mobile shell validation;
- dark screenshot acceptance;
- light screenshot acceptance;
- no overlap and tap target checks.

### Group 11 - Cross-Surface No-Fake Validation

Seeds:

- no fake dashboards, modules, metrics, notifications, analytics, or revenue;
- no Phase 6 active surfaces;
- no CRM technical migration;
- no dynamic shell actions endpoint;
- no unsupported APIs;
- no hardcoded module feature bullets.

### Group 12 - Final Audit And Phase 5C Ticket-Pack Readiness

Seeds:

- final Phase 5C seed-matrix audit;
- ticket-pack readiness handoff;
- Spark Genesis audit before ticket-pack creation.

## 4. Seed Table

| Seed ID | Group | Seed title | Purpose | Depends on | Screen/component contract source | Likely files to inspect | Expected ownership area | Validation expectations | Must not do | Ticket-pack note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `P5C-SEED-000` | 0 | Baseline/control and repo-state evidence | Confirm branch, docs, visual references, Spark Genesis adoption, and current repo state before ticket-pack shaping. | none | All Phase 5C control docs | `AGENTS.md`; Phase 5C docs; Spark Genesis references | evidence/control docs | git status, source-doc existence checks | start implementation, create ticket pack, alter code | First future ticket should record baseline before implementation planning. |
| `P5C-SEED-001` | 0 | Visual reference and screenshot acceptance baseline | Create committed visual acceptance authority for future screenshots. | `P5C-SEED-000` | Visual Direction; Screen Contracts | visual reference paths; Phase 5C visual/control docs | screenshot acceptance control doc or section | references name `akti_spark_proposed_dark.png`, `akti_spark_proposed_light.png`, desktop dark targets, desktop light targets, mobile shell targets, routes/states, pass/fail rules | implement UI, copy fake data from images, authorize future modules | Must produce a committed screenshot acceptance plan document or section - not just a process step; all implementation tickets reference this acceptance plan. |
| `P5C-SEED-010` | 1 | Optional `display_features[]` manifest contract extension | Add the source-of-truth field required before module card bullet rendering. | `P5C-SEED-001` | Module card component contract | `packages/contracts/module-manifest.schema.ts`; module manifests; module registry validation | contracts, manifest validation, module registry tests | contracts validate; Foundry/module registry validation; legacy fixtures remain valid | hardcode bullet text, invent Phase 6 module claims | First implementation dependency in the future ticket pack. |
| `P5C-SEED-011` | 1 | Screen/component contract validation alignment | Ensure route screen and non-route component contracts match current schemas and control docs. | `P5C-SEED-010` | Screen Contracts; Screen Contract Registry | `packages/contracts/screen-contract.schema.ts`; screen registry; control docs | contracts and control docs | contract validation and docs consistency checks | collapse component contracts into route contracts | Needed before UI tickets can cite contracts confidently. |
| `P5C-SEED-012` | 1 | Module display metadata verification | Confirm module display metadata, visibility states, required capabilities, and AI classification remain coherent. | `P5C-SEED-010` | Module card component contract | module manifest schema; module registry service/tests | contracts and module registry | contracts validate; module registry tests | make response-only decoration, bypass manifest authority | Keeps module card tickets grounded in manifest data. |
| `P5C-SEED-020` | 2 | AKTI Spark dark/light theme token substrate | Establish theme token work for flagship dark mode and derived high-contrast light mode. | `P5C-SEED-012` | Visual Direction | `apps/web/app/globals.css`; UI/design-system files | frontend styling substrate | lint/typecheck/build plus screenshot target checks when implemented | hardcode fake data, change runtime APIs | Token tickets must be visual-only and data-agnostic. |
| `P5C-SEED-021` | 2 | Focus, hover, active, disabled, and contrast states | Define interactive state styling across shell and cards. | `P5C-SEED-020` | Visual Direction; Screen Contracts | UI component files; mission-control components | frontend accessibility styling | accessibility/focus checks; visual screenshots | hide focus, reduce contrast, create inaccessible states | Must be paired with accessibility validation seeds. |
| `P5C-SEED-022` | 2 | Theme screenshot acceptance criteria | Translate theme work into screenshot pass/fail acceptance. | `P5C-SEED-021` | Visual Direction; screenshot acceptance plan | screenshot acceptance artifact from `P5C-SEED-001` | visual QA control | dark/light screenshot targets present | accept broken contrast or overlap | References the committed screenshot acceptance plan. |
| `P5C-SEED-030` | 3 | Full-width topbar shell | Shape topbar layout to match approved control docs. | `P5C-SEED-022` | `/app` screen contract; mobile shell component contract | mission-control shell; route config; app layout | frontend shell layout | lint/typecheck/build; desktop screenshots | production auth changes, new APIs | Must preserve AKTI Spark identity and control-doc hierarchy. |
| `P5C-SEED-031` | 3 | Sidebar navigation-only shell | Keep sidebar focused on navigation and workspace status placement. | `P5C-SEED-030` | `/app` screen contract | mission-control shell; route config | frontend shell layout | screenshot and responsive checks | treat Settings/Diagnostics as apps | Diagnostics remains visually de-emphasized. |
| `P5C-SEED-032` | 3 | Org badge and user avatar separation | Separate organization context from personal user account controls in the topbar. | `P5C-SEED-031` | org badge component contract | configuration API client area; mission-control shell; org badge surface | frontend shell and org badge display | reads use `GET /platform/organization/profile`; loading/error states; keyboard focus | logo upload, org switching implementation beyond approved read/display state, production auth changes, account-management rewrites | Data source: `GET /platform/organization/profile`. Split from workspace/mobile work to avoid oversized tickets. |
| `P5C-SEED-033` | 3 | Workspace status card and mobile shell baseline | Place honest workspace status in the shell and define the responsive/mobile shell baseline. | `P5C-SEED-032` | workspace status card; mobile shell component contract | mission-control shell; platform status client; responsive CSS | frontend shell status and mobile layout | reads use `GET /platform/status/overview`; mobile screenshots; no overlap checks | fake service uptime, fake CRM pipeline status, production auth, mobile-only feature invention, unsupported navigation surfaces | Data source: `GET /platform/status/overview`. Downstream mobile/responsive validation depends on this seed. |
| `P5C-SEED-040` | 4 | Mission Control / CRM / Modules / Settings / Diagnostics navigation | Implement approved navigation labels and grouping in future UI tickets. | `P5C-SEED-032` | `/app` and shell contracts | route config; CRM alias config; mission-control shell | frontend route metadata/navigation | route config tests; lint/typecheck | invent routes, activate future modules, rename technical Lead Desk | Navigation must preserve CRM visible-label-only rule. |
| `P5C-SEED-041` | 4 | Modules route/action authority handling | Ensure Modules card/nav action only works when route authority exists. | `P5C-SEED-040` | module card component contract; `/modules` conditional route | route config; module launcher | frontend route/action gating | tests or assertions for absent/unapproved `/modules` action | present a working Open Modules action without approved route | Modules card can show status from real substrate even when route action is unavailable. |
| `P5C-SEED-042` | 4 | CRM visible-label-only navigation guard | Apply CRM label while preserving Lead Desk technical surfaces. | `P5C-SEED-040` | CRM route contracts | CRM alias config; Lead Desk route files | frontend visible copy | tests for visible labels; no file/route renames | rename `lead-desk` files, routes, APIs, contracts, or models | Guardrail seed for all CRM-facing tickets. |
| `P5C-SEED-050` | 5 | Mission Control workspace hero/banner | Build the honest workspace banner target from control docs. | `P5C-SEED-033`, `P5C-SEED-042` | `/app` screen contract | dashboard overview; mission-control shell | frontend Mission Control | screenshot checks; honest unavailable state | fake workspace connection, production auth assumptions | Uses real status or explicit unavailable state only. |
| `P5C-SEED-051` | 5 | Role-aware apps grid | Shape app/module grid from real module visibility. | `P5C-SEED-050`, `P5C-SEED-010` | module card component contract | module launcher; module registry API client | frontend module grid | tests for authorized/locked/hidden states; no fake card checks | hardcode modules or bullets, show unsupported active modules | Depends on `display_features[]` before bullets can appear. |
| `P5C-SEED-052` | 5 | Operational overview honest unavailable/offline states | Present operational cards with real or unavailable states only. | `P5C-SEED-050` | `/app` screen contract | dashboard overview; platform status/data controls/notifications surfaces | frontend overview cards | no fake metric checks; screenshot checks | fake revenue, fake analytics, fake notifications | Operational overview is status-first, not metric theater. |
| `P5C-SEED-053` | 5 | CRM pipeline unavailable placeholder only | Keep CRM pipeline visual as unavailable/workspace-required only. | `P5C-SEED-052` | CRM pipeline placeholder rule | dashboard overview; CRM/Lead Desk surfaces | frontend placeholder state | asserts no CRM pipeline endpoint and no fake counts | create CRM pipeline API, expand Lead Desk APIs, fake pipeline data | No CRM pipeline endpoint in Phase 5C. |
| `P5C-SEED-060` | 6 | Module card visual states | Render available, requires_setup, locked, coming_soon, hidden states honestly. | `P5C-SEED-051` | module card component contract | module launcher; module manifest data | frontend module card | role-aware state tests and screenshots | visibility as destructive/admin authority | visibility does not equal authority. |
| `P5C-SEED-061` | 6 | Module card `display_features[]` rendering only when present | Render bullets only from manifest data. | `P5C-SEED-060`, `P5C-SEED-010` | module card component contract | module launcher; manifest data plumbing | frontend module card | tests for present/absent `display_features[]` | hardcode CRM, Modules, Admissions, Finance, HR, Analytics/Operations, or future bullets | If absent, render no bullet list. |
| `P5C-SEED-062` | 6 | Modules-card legitimacy and future-module inactive safeguards | Treat Modules as real platform surface while keeping future modules inactive. | `P5C-SEED-061` | Component/API Map; module card contract | module launcher; route config | frontend module card/action gating | tests for Modules vs future examples | make Admissions/Finance/HR/Analytics active without authority | Modules is real; future business modules are not active/openable. |
| `P5C-SEED-070` | 7 | CRM visible label on Lead Desk surfaces | Apply CRM copy to approved operator-facing Lead Desk surfaces. | `P5C-SEED-042` | `/lead-desk/inbox` route contract | Lead Desk route pages; CRM alias config | frontend copy/labels | visible-copy tests; build | technical rename, CRM data model migration | CRM is a label only. |
| `P5C-SEED-071` | 7 | Lead Desk technical rename prohibition validation | Prove no technical Lead Desk rename occurred. | `P5C-SEED-070` | CRM rule in all control docs | Lead Desk routes/files/contracts/models | validation/audit | git diff checks and targeted negative assertions | rename routes/files/APIs/contracts/Prisma models | Required before final audit. |
| `P5C-SEED-080` | 8 | Settings shell polish | Align settings route with shell and visual direction. | `P5C-SEED-033` | `/app/settings` screen contract | settings page; settings components | frontend settings surface | lint/typecheck/build; screenshots | write UI, full white-label editor | Settings is system navigation, not an app. |
| `P5C-SEED-081` | 8 | Read-only branding section | Show effective branding facts read-only. | `P5C-SEED-080` | settings/branding contract | settings components; branding config/API client | frontend read-only branding | no upload/write affordance checks | upload, cropper, storage write, domain branding | White-label write flows remain deferred. |
| `P5C-SEED-082` | 8 | Organization profile display | Display organization facts consistently across settings and shell. | `P5C-SEED-081`, `P5C-SEED-032` | org badge and settings contracts | settings components; org badge | frontend org profile display | reads use `GET /platform/organization/profile`; tenant-safe states | org switching beyond read/display, production auth changes | Uses same org-profile source as org badge. |
| `P5C-SEED-090` | 9 | Command palette component contract | Shape command/search surface from approved static capability-filtered actions. | `P5C-SEED-040` | command palette component contract | command palette; route config; search surfaces | frontend non-route overlay | keyboard/focus tests; no dynamic action API | create `GET /platform/shell/actions`, fake actions | Search remains limited to `WorkflowDefinition` and `WorkflowInstance`. |
| `P5C-SEED-091` | 9 | Notification drawer/bell component contract | Show honest notification summary only. | `P5C-SEED-090` | notification drawer component contract | notification center; notifications summary API client | frontend non-route overlay | summary state tests; no provider claims | fake notifications, provider activation, notification center runtime | Uses `GET /platform/notifications/summary` only. |
| `P5C-SEED-092` | 9 | Workspace status, org badge dropdown, and mobile shell interactions | Validate non-route shell interactions together after their source surfaces exist. | `P5C-SEED-033`, `P5C-SEED-091` | workspace status, org badge, mobile shell contracts | shell, org badge, notification, status components | frontend non-route interactions | keyboard/focus/mobile checks | fake status, unsupported account/org management | This is interaction integration, not the first data-source work. |
| `P5C-SEED-100` | 10 | Keyboard/focus/accessibility validation | Verify keyboard traversal, labels, focus rings, and states across implemented surfaces. | `P5C-SEED-092` | all route and component contracts | frontend shell and components | accessibility validation | focus/keyboard/a11y checks | inaccessible focus states | Must cover desktop and mobile shell behavior. |
| `P5C-SEED-101` | 10 | Responsive/mobile validation | Verify mobile shell and component behavior. | `P5C-SEED-033`, `P5C-SEED-100` | mobile shell contract | shell and route components | responsive validation | mobile screenshots and no-overlap checks | mobile-only feature invention | Depends directly on mobile shell baseline. |
| `P5C-SEED-102` | 10 | Dark and light screenshot acceptance | Capture and compare approved dark/light visual targets. | `P5C-SEED-101` | screenshot acceptance plan | screenshot tooling and frontend routes | visual QA evidence | dark desktop, light desktop, mobile screenshots | accept broken contrast, overlap, fake data, unsupported modules | Must cite the committed screenshot acceptance plan. |
| `P5C-SEED-110` | 11 | Cross-surface no-fake validation | Prove no fake dashboards, modules, metrics, notifications, analytics, or revenue were introduced. | `P5C-SEED-102` | all control docs | frontend routes/components; docs | audit/validation | negative grep/static checks and screenshots | fake dashboards/modules/metrics | Cross-surface no fake gate before handoff. |
| `P5C-SEED-111` | 11 | Phase 6, CRM migration, search, and shell-action leakage guard | Prove forbidden phase/scope leakage did not occur. | `P5C-SEED-110` | control docs and Component/API Map | routes, API clients, Lead Desk surfaces, search surfaces | audit/validation | negative checks for Phase 6, shell actions, search expansion, technical rename | Phase 6 modules, CRM migration, dynamic shell actions, CRM search expansion | Keeps Phase 5C bounded to visual/shell implementation. |
| `P5C-SEED-112` | 11 | Hardcoded bullets and unsupported API audit | Prove module bullets and API surfaces remain source-backed. | `P5C-SEED-111` | module card and Component/API Map | module launcher; API clients; manifest data | audit/validation | no hardcoded bullet strings; no unsupported endpoints | hardcoded module feature bullets, unsupported CRM pipeline API | Must pass before ticket-pack readiness handoff. |
| `P5C-SEED-120` | 12 | Final seed-matrix audit | Audit the future implementation ticket candidates before ticket-pack creation. | `P5C-SEED-112` | Spark Genesis references and all Phase 5C control docs | seed matrix, candidate tickets, control docs | docs/audit | Spark Genesis audit and dependency graph checks | create ticket pack prematurely | Final audit of seed-derived plan. |
| `P5C-SEED-121` | 12 | Ticket-pack readiness handoff | Record whether Phase 5C is ready for JSON ticket-pack creation. | `P5C-SEED-120` | all Phase 5C control/audit docs | seed matrix and audit outputs | docs/handoff | readiness verdict and unresolved watchpoints | implementation, ticket execution | Handoff only; not execution approval. |
| `P5C-SEED-122` | 12 | Spark Genesis audit before ticket-pack creation | Run final Spark Genesis gate before ticket pack authoring. | `P5C-SEED-121` | Spark Genesis adoption and references | seed matrix, handoff, control docs | docs/audit | audit verdict before ticket pack | bypass Spark Genesis gate | Ticket pack may be created only after this audit passes. |

## 5. Required First Seed Dependency

The first implementation dependency in the future ticket pack must be the optional `display_features[]` module manifest contract extension.

This dependency must:

- add optional `display_features?: string[]` to module manifest display metadata;
- validate it through module manifest / Foundry / module registry validation;
- backfill only approved existing module manifests;
- ensure frontend renders no feature bullet list when `display_features[]` is absent;
- prohibit hardcoded bullet text for CRM, Modules, Admissions, Finance, HR, Analytics/Operations, or future modules.

## 6. Known Deferrals

- Phase 6 business modules.
- CRM technical migration.
- CRM pipeline endpoint.
- Dynamic shell actions endpoint.
- White-label upload/write UI.
- Production auth, deployment, and secrets.
- Marketplace.
- Workflow builder.
- AI assistant and runtime AI.
- Real providers.
- Hardcoded module feature bullets.

## 7. Ticket Pack Readiness Decision

This seed matrix is ready for review and Spark Genesis audit. It is not a ticket pack, and it does not authorize implementation.

PHASE_5C_SEED_MATRIX_READY_FOR_SPARK_GENESIS_AUDIT
