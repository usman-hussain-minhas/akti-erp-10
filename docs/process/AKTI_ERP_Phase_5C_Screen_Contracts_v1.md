# AKTI ERP Phase 5C Screen Contracts v1

Status: PHASE_5C_SCREEN_CONTRACTS_READY_FOR_COMPONENT_API_MAPPING

This document is a Phase 5C planning/control artifact only. It does not start Phase 5C implementation, create a ticket pack, create a ticket seed matrix, authorize frontend code changes, or start Phase 6 work.

The visual reference images are visual targets for layout quality, theme feel, spacing, hierarchy, and screenshot acceptance. They are not authority for fake data, fake active modules, unsupported module bullets, or future-phase features.

## Global Contract Rules

- CRM is visible label only over existing Lead Desk technical surfaces.
- Do not rename `lead-desk` routes, files, APIs, contracts, Prisma models, or data models.
- Apps = modules.
- Settings and Diagnostics are not apps.
- Visibility does not equal authority. Contract phrase: visibility does not equal authority.
- No fake metrics, fake CRM pipeline, fake notifications, fake modules, fake analytics, or fake revenue.
- No hardcoded module feature bullet text.
- No Phase 6 business modules as active surfaces.
- No white-label upload/write UI.
- No production auth assumptions.
- Dynamic `GET /platform/shell/actions` remains deferred.
- Search scope remains limited to `WorkflowDefinition` and `WorkflowInstance`.

## Route Screen Contracts

| Route | Status | Purpose | Primary users | Required capabilities | Data sources | Allowed widgets | Primary actions | Secondary actions | Empty/loading/error states | Mobile behavior | Accessibility/focus rules | Audit/security notes | Must-not-show | Screenshot acceptance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | active planning | AKTI Spark entry / governed landing entry. | unauthenticated or pre-shell operators, depending on approved auth flow | none until auth model is approved | static frontend entry plus approved auth/setup links only | brand lockup, entry CTA, setup/auth state | enter approved shell/auth/setup flow only when backed by route authority | learn/help links if approved | must avoid fake tenant data; show honest unavailable/setup state if no auth route exists | stacked content, no overlapping CTAs | visible focus on primary CTA; readable heading | no production auth claim unless auth is approved | fake tenant/org data, fake dashboards, fake metrics | desktop and mobile screenshots match visual target style while preserving honest state |
| `/app` | active planning | Mission Control shell and platform overview. | authenticated operators with platform shell access | `platform.shell.access` when enforced | `GET /platform/status/overview`, `GET /platform/modules`, `GET /platform/notifications/summary`, `GET /platform/data-controls/status`, existing route config | topbar, sidebar, workspace banner, module grid, operational cards, notification affordance | connect workspace if route/action authority exists; open authorized CRM or Modules only when route authority exists | refresh apps, learn/help, view services/data controls if backed by route authority | workspace not connected, loading modules, API unavailable, permission blocked | responsive shell derived from reference layout; mobile shell contract required | keyboard traversal through nav, command, notifications, and cards | tenant context from trusted session; no secret entry in normal flow | fake revenue, fake task counts, fake analytics, fake CRM pipeline, fake module cards | desktop dark/light screenshots must match reference system; mobile screenshots must prove no overlap |
| `/app/settings` | active planning | Settings/control panel read surfaces. | operators with shell/settings access | `platform.shell.access` plus surface-specific read capabilities when enforced | `GET /platform/organization/profile`, `GET /platform/branding/effective`, existing settings/config reads | read-only branding preview, org facts, diagnostics link, data-control state if approved | view read-only settings sections | navigate back to Mission Control; open diagnostics only as de-emphasized system surface | unavailable/API-error states; no write UI fallback | mobile section nav must remain usable | focus order through sections; clear labels | no production auth pattern; diagnostics separated | upload UI, cropper, domain branding editor, full white-label editor | screenshots prove read-only state and no write/upload affordance |
| `/lead-desk/inbox` | active planning as CRM visible label | CRM inbox label over existing Lead Desk inbox. | operators with CRM/Lead Desk authority | `platform.crm.access` plus existing Lead Desk rules | existing Lead Desk APIs only | CRM header, filters, table/list, empty/error states | open existing records only through Lead Desk route authority | create lead only if existing scope/contract allows | no records, loading, permission denied, API unavailable | table/list must adapt without overflow | focus on filters/table/actions; row links named clearly | existing Lead Desk tenant/security boundaries remain | CRM technical migration, new CRM model, fake pipeline, fake conversion metrics | screenshots use CRM visible label while preserving `lead-desk` technical route |
| `/lead-desk/create` | deferred | Existing Lead Desk create route, if included later. | CRM/Lead Desk operators | existing Lead Desk create capability | existing Lead Desk create API only | form, validation, success/error states | create lead only through existing API | reset/back to inbox | validation and API unavailable states | mobile form readable and tappable | labels and validation messages | Gatekeeper/audit behavior as existing route requires | new CRM workflows, fake automation | deferred until explicitly scoped |
| `/lead-desk/leads/[leadId]` | deferred | Existing Lead Desk detail route, if included later. | CRM/Lead Desk operators | existing Lead Desk detail capability | existing Lead Desk detail API only | detail sections, state history if existing | view existing lead | back/open actions | missing/forbidden/unavailable states | readable stacked detail | focusable links/actions | tenant-scoped record access | new CRM data model, fake enrichment | deferred until explicitly scoped |
| `/lead-desk/leads/[leadId]/actions` | deferred | Existing Lead Desk status/assignment route, if included later. | CRM/Lead Desk operators | existing Lead Desk status/assignment capabilities | existing Lead Desk action APIs only | status form, assignment form | approved existing mutation actions | back to detail/inbox | validation, denied, unavailable states | forms fit mobile | focus and error summaries | Gatekeeper/audit where required | destructive/admin authority from visibility | deferred until explicitly scoped |
| `/setup/organization` | deferred | Organization setup surface. | setup actors only if approved | setup-specific authority TBD | existing setup route only | setup form and safe help text | submit setup only if approved | back/help | setup unavailable, validation errors | standalone mobile-safe layout | field labels and focus order | no production onboarding assumptions | fake tenant bootstrap, secret entry | deferred until lifecycle is approved |
| `/modules` | conditional/blocked | Dedicated Modules route if approved later. | operators with module view authority | `platform.modules.view` plus module `required_capabilities[]` | `GET /platform/modules` | module grid/list, filters if approved | open approved module route only | refresh/filter | no modules, unavailable, permission denied | grid collapses cleanly | card and filter focus states | visibility does not equal authority | marketplace, installer, Phase 6 modules, fake module cards | blocked until route authority exists |

## Non-Route Component Contracts

| Component | Trigger | Scope | Data source | Capability filter | Keyboard behavior | Empty state | Must-not-show | Mobile behavior | Accessibility/focus behavior | Screenshot acceptance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| command palette | search input / keyboard shortcut if approved | static capability-filtered shell actions | frontend route config plus module visibility; no dynamic shell actions endpoint | route and module capabilities | open, search, arrow navigation, enter, escape | no commands found | `GET /platform/shell/actions`, fake actions, Phase 6 module actions | full-width overlay or sheet | focus trap and return focus | open/empty state screenshots in dark and light |
| notification drawer | bell button | summary-only notification affordance | `GET /platform/notifications/summary` | `platform.notifications.summary.view` when enforced | open/close, escape, tab loop | unread count 0 / not configured | fake notifications, provider status, notification center runtime | sheet/drawer with no overlap | labelled trigger, focus trap | drawer screenshots prove honest summary-only state |
| workspace status card | sidebar and hero status areas | workspace connection status | `GET /platform/status/overview` | `platform.shell.access` | focusable CTA only if real action exists | workspace not connected | fake service uptime, fake CRM pipeline, fake revenue | compact card and hero stack | CTA labels are descriptive | dark/light screenshots match reference status treatment |
| org badge | topbar org control | org identity and branding facts | `GET /platform/organization/profile`, `GET /platform/branding/effective` | `platform.organization.profile.view`, `platform.branding.view` when enforced | open/close menu if approved | initials / no logo fallback | logo upload, write UI, domain branding | compact badge menu | labelled control, focus return | screenshots show separate org badge and avatar |
| module card | module grid | role-aware module visibility and status | `GET /platform/modules`; future `display_features[]` for bullets | `platform.modules.view` plus module `required_capabilities[]` | card action focus; disabled cards not openable | no modules available | fake cards, hardcoded bullets, marketplace, import/export/delete/admin authority | cards stack without text overflow | status and action labels announce state | screenshots prove real/locked/coming-soon states and no fake active modules |
| mobile shell | mobile viewport | topbar/sidebar equivalent | route config, same APIs as desktop | same as desktop | menu open/close, tab order, escape where applicable | same as desktop | desktop-only hidden controls becoming inaccessible | bottom/nav/drawer derived from desktop | no overlap; focus trap in drawer | mobile screenshot acceptance before implementation complete |

## Modules Card Distinction

The Modules card on `/app` is a legitimate active Phase 5B1 platform surface, distinct from future business-module cards.

It maps to `GET /platform/modules` and the Foundry/module registry substrate.

Its `visibility_state` and data source are real, not example-only.

Treat the Modules card equivalently to CRM in the module card component contract, subject to route authority.

Admissions, Finance, HR, and Analytics/Operations remain visual examples / future-module cards only unless later backed by approved manifests, routes, screen contracts, and phase scope.

Modules card action rule: The Modules card may appear as a real platform surface because `/platform/modules` exists as a Phase 5B1 substrate API. However, the card's Open Modules action must be conditional on an approved frontend route. If `/modules` is not approved or does not exist, the card may show module availability/status but must not present a working Open Modules action.

## Module Card Bullet-Point Dependency

Option A for display_features requires a manifest contract extension ticket before Phase 5C module card implementation tickets can be created.

This ticket is not part of the control-doc creation task. It is a Phase 5C ticket seed dependency that must appear at the head of the Phase 5C ticket seed matrix.

The dependency must add optional `display_features?: string[]` to module manifest display metadata, validate it through module manifest / Foundry / module registry validation, and backfill only approved existing module manifests.

Until `display_features[]` exists and is populated by approved manifests, Phase 5C frontend must render no feature bullet list for that module.

Frontend must not hardcode bullet text for CRM, Modules, Admissions, Finance, HR, Analytics/Operations, or future modules.

## CRM Pipeline Placeholder Rule

The CRM pipeline card may exist visually only as an honest unavailable placeholder.

Required state:

```text
Not available / Workspace connection is required.
```

Do not create a CRM pipeline endpoint. Do not show fake pipeline counts, fake lead stages, fake conversion data, fake tasks, fake revenue, or fake analytics. Do not expand Lead Desk or CRM APIs without separate approval.

## Screenshot Acceptance

Implementation tickets must require screenshots before completion:

- desktop dark mode against `akti_spark_proposed_dark.png`;
- desktop light mode against `akti_spark_proposed_light.png`;
- mobile shell and route states derived responsively;
- hover/focus/active/disabled states for major controls;
- proof that unsupported modules are not active/openable;
- proof that module feature bullets render only from approved manifest `display_features[]`.
