# AKTI ERP Phase 5C Component/API Map v1

Status: PHASE_5C_COMPONENT_API_MAP_READY_FOR_TICKET_SEED_MATRIX

This document is a Phase 5C planning/control artifact only. It does not start Phase 5C implementation, create a ticket pack, create a ticket seed matrix, authorize code changes, or start Phase 6 work.

The reference images are visual targets only, not data authority. Components must bind to committed contracts, manifests, APIs, and docs.

## Global API Mapping Rules

- No dynamic `GET /platform/shell/actions`.
- No CRM/Lead Desk search expansion.
- No CRM pipeline endpoint.
- No Phase 6 modules.
- No fake data.
- No hardcoded module feature bullets.
- No upload/write branding UI.
- No workflow builder.
- No AI assistant.
- No runtime AI.
- No marketplace.
- No white-label upload/write UI.
- No production auth.
- No production deployment.
- No secrets.
- CRM is visible label only over existing Lead Desk technical surfaces.
- Visibility does not equal authority. Contract phrase: visibility does not equal authority.

## Component/API Map

| Component / screen | Frontend file candidates | API / data source | Required capability | Empty/loading/error behavior | Must-not-show | Screenshot acceptance | Ticket seed hint | Risk / watchpoint |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AKTI Spark topbar | `apps/web/components/mission-control/mission-control-shell.tsx`, `apps/web/lib/platform-branding.config.ts` | frontend branding config plus `GET /platform/branding/effective` where needed | `platform.shell.access`; branding read when enforced | show default AKTI Spark identity if branding unavailable | product rename to AKTI ERP, upload/write branding UI | topbar matches reference density and separates org badge/avatar | visual shell ticket after contracts | branding values must stay in config/API authority |
| org badge | mission-control shell future org badge surface | `GET /platform/organization/profile`; `GET /platform/branding/effective` | `platform.organization.profile.view`, `platform.branding.view` when enforced | initials/no-logo fallback, loading skeleton, unavailable copy | logo upload, domain branding, write UI | separate org badge and avatar in dark/light | org badge component ticket | white-label overreach |
| module grid / module card | `apps/web/components/mission-control/module-launcher.tsx` | `GET /platform/modules` | `platform.modules.view` plus module `required_capabilities[]` | no modules, loading modules, permission denied, unavailable API | fake module cards, marketplace, destructive/admin actions | cards match reference while only real/authorized modules are openable | module card contract ticket after `display_features[]` dependency | fake module card risk |
| module card feature bullets | module card component | future manifest `display_features[]` | same as module card | render no bullet list when absent | hardcoded CRM, Modules, Admissions, Finance, HR, Analytics/Operations, or future-module bullet text | screenshots prove absent bullets do not create layout breakage | first ticket seed dependency: add optional `display_features?: string[]` | contract field must be optional and validated |
| workspace status card | shell sidebar/status area and hero | `GET /platform/status/overview` | `platform.shell.access` | workspace not connected, loading, unavailable | fake uptime, fake CRM pipeline, fake revenue | status card matches reference and remains honest | status card component ticket | no fake operational metrics |
| CRM pipeline status card | operational overview | no approved API | none beyond shell display | unavailable/workspace-required only | fake counts, fake stages, fake conversion, fake tasks, fake revenue | card shows "Not available / Workspace connection is required." | placeholder-only contract; no API ticket | endpoint creation is forbidden |
| notification drawer / bell | `apps/web/components/mission-control/notification-center.tsx` | `GET /platform/notifications/summary` | `platform.notifications.summary.view` when enforced | unread_count 0, not_configured, loading/error | fake notifications, provider status, notification center runtime | drawer/bell screenshots show summary-only state | notification component ticket | provider/runtime overreach |
| data controls card | operational overview / settings | `GET /platform/data-controls/status` | `platform.data.controls.view` | unavailable/inactive states | import/export/backup execution, business-report workflows | card uses honest inactive/unavailable states | data controls card ticket | visibility must not grant execution |
| branding/settings read section | `apps/web/components/settings/settings-control-panel.tsx` | `GET /platform/branding/effective`; existing configuration reads | `platform.branding.view` when enforced | read-only defaults if not configured | upload, cropper, storage write, full white-label editor | settings screenshots show read-only branding facts | settings read ticket | white-label write overreach |
| search / command surface | `apps/web/components/mission-control/command-palette.tsx`, `apps/web/lib/routes.config.ts` | route config; current search scope limited to `WorkflowDefinition` and `WorkflowInstance` if search is used | `platform.search.query` when invoking search; route capabilities for commands | no commands/results, loading, unavailable | dynamic shell actions endpoint, CRM search expansion, fake actions | command screenshots show static/capability-filtered commands | command component ticket | search scope expansion |
| CRM navigation / card | route config, module launcher, Lead Desk routes | existing `lead-desk` frontend routes and APIs only | `platform.crm.access` plus existing Lead Desk rules | no records, permission denied, API unavailable | CRM technical migration, new CRM model, fake pipeline | screenshots use CRM visible label while preserving `lead-desk` route | CRM visual label ticket | product label becoming technical rename |

## Modules Card Legitimacy And Action Rule

The Modules card on `/app` is a legitimate active Phase 5B1 platform surface, distinct from future business-module cards.

It maps to `GET /platform/modules` and the Foundry/module registry substrate.

Its `visibility_state` and data source are real, not example-only.

Treat the Modules card equivalently to CRM in the module card component contract, subject to route authority.

Admissions, Finance, HR, and Analytics/Operations remain visual examples / future-module cards only unless later backed by approved manifests, routes, screen contracts, and phase scope.

Modules card action rule: The Modules card may appear as a real platform surface because `/platform/modules` exists as a Phase 5B1 substrate API. However, the card's Open Modules action must be conditional on an approved frontend route. If `/modules` is not approved or does not exist, the card may show module availability/status but must not present a working Open Modules action.

## Module Card Bullet Points Decision

Option A selected. Module card feature bullets must come from module manifest `display_features[]`.

If `display_features[]` is absent, render no bullet list.

Option A for display_features requires a manifest contract extension ticket before Phase 5C module card implementation tickets can be created.

This ticket is not part of the control-doc creation task. It is a Phase 5C ticket seed dependency that must appear at the head of the Phase 5C ticket seed matrix.

The dependency must add optional `display_features?: string[]` to module manifest display metadata, validate it through module manifest / Foundry / module registry validation, and backfill only approved existing module manifests.

Until `display_features[]` exists and is populated by approved manifests, Phase 5C frontend must render no feature bullet list for that module.

Frontend must not hardcode bullet text for CRM, Modules, Admissions, Finance, HR, Analytics/Operations, or future modules.

## CRM Pipeline Placeholder Decision

CRM pipeline is a visual placeholder only in Phase 5C control planning.

No approved CRM pipeline API exists. Render only:

```text
Not available / Workspace connection is required.
```

Do not create a CRM pipeline endpoint. Do not expand Lead Desk / CRM APIs. Do not show fake lead stages, fake counts, fake conversion rates, fake tasks, fake revenue, or fake analytics.

## Ticket Seed Readiness

This map is ready to inform a future ticket seed matrix only after review. The first seed dependency must be the manifest contract extension for optional `display_features[]`. No implementation ticket for module card bullets may be created before that dependency.
