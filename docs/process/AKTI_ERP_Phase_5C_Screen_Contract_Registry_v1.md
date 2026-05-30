# AKTI ERP Phase 5C Screen Contract Registry v1

Status: PHASE_5C_SCREEN_CONTRACT_REGISTRY_CONTROL_ONLY

This registry is a Phase 5B1 planning/control artifact. It does not start Phase 5C implementation, authorize frontend code changes, create routes, create APIs, or approve fake dashboards, fake metrics, fake module cards, or Phase 6 business-module surfaces.

Route screens use screen contracts. Non-route surfaces use component contracts.

Allowed contract statuses:

- `defined`: contract exists and is ready for implementation planning.
- `pending`: route or surface exists, but a full Phase 5C contract must still be written before implementation.
- `deferred`: intentionally outside initial Phase 5C execution unless separately approved.
- `blocked`: cannot be implemented until missing substrate or authority exists.

## Route Screen Contract Registry

| route / surface | current source | planned label | contract status | data source authority | capability filter | must-not-show |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | `apps/web/app/page.tsx` | AKTI Spark entry | `pending` | Static/public entry contract not defined yet. | none until auth model is approved | production auth claims, fake tenant data |
| `/app` | `apps/web/app/app/page.tsx` | Mission Control | `pending` | Existing shell plus Phase 5B1 status/summary APIs. | `platform.shell.access` | fake revenue, fake tasks, fake analytics |
| `/app/settings` | `apps/web/app/app/settings/page.tsx` | Settings | `pending` | Existing settings shell plus profile/branding read substrate. | `platform.shell.access` and surface-specific read capabilities | write controls not backed by contracts |
| `/lead-desk/inbox` | `apps/web/app/lead-desk/inbox/page.tsx` | CRM inbox | `pending` | Existing Lead Desk API only. | `platform.crm.access` plus existing Lead Desk rules | CRM technical migration, fake pipeline metrics |
| `/lead-desk/create` | `apps/web/app/lead-desk/create/page.tsx` | CRM create | `deferred` | Existing Lead Desk API only. | Existing Lead Desk rules | new CRM workflows beyond existing Lead Desk |
| `/lead-desk/leads/[leadId]` | `apps/web/app/lead-desk/leads/[leadId]/page.tsx` | CRM detail | `deferred` | Existing Lead Desk API only. | Existing Lead Desk rules | new CRM data model or route rename |
| `/lead-desk/leads/[leadId]/actions` | `apps/web/app/lead-desk/leads/[leadId]/actions/page.tsx` | CRM actions | `deferred` | Existing Lead Desk API only. | Existing Lead Desk rules and Gatekeeper where required | destructive/admin authority from visibility |
| `/setup/organization` | `apps/web/app/setup/organization/page.tsx` | Organization setup | `deferred` | Existing setup route; Phase 5C contract not yet defined. | setup-specific authority TBD | production onboarding assumptions |
| `/modules` | not present in current route inventory | Modules | `blocked` | Phase 5B1 `/platform/modules` substrate exists, but route implementation is not authorized. | `platform.modules.view` and module `required_capabilities[]` | fake module cards, marketplace, Phase 6 modules |
| diagnostics surface | current Settings / Advanced Diagnostics | Diagnostics | `pending` | Existing diagnostics/session context only. | diagnostics authority TBD | production auth pattern, real secrets |

## Non-Route Component Contract Requirements

Each non-route component contract must include:

- `trigger`
- `scope`
- `data source`
- `capability filter`
- `keyboard behavior`
- `empty state`
- `must-not-show`
- `mobile behavior`
- `accessibility/focus behavior`

| component surface | current source | contract status | required data source | capability filter | must-not-show |
| --- | --- | --- | --- | --- | --- |
| command palette | `apps/web/components/mission-control/command_palette.tsx` | `pending` | Static capability-filtered frontend actions derived from route config and module visibility. | route/module capabilities; no dynamic shell actions endpoint in Phase 5C | `GET /platform/shell/actions`, fake actions, Phase 6 module actions |
| notification drawer | `apps/web/components/mission-control/notification_center.tsx` | `pending` | `GET /platform/notifications/summary` only. | `platform.notifications.summary.view` when enforced | fake notifications, provider status, notification center runtime |
| workspace status card | Mission Control shell/status area | `pending` | `GET /platform/status/overview`. | `platform.shell.access` | fake service uptime, fake CRM pipeline, fake revenue |
| organization badge | topbar future shell surface | `pending` | `GET /platform/organization/profile` and `GET /platform/branding/effective`. | `platform.organization.profile.view`, `platform.branding.view` when enforced | logo upload, write UI, domain branding |
| module card | `apps/web/components/mission-control/module_launcher.tsx` | `pending` | Role-aware `GET /platform/modules`. | `platform.modules.view` plus module `required_capabilities[]` | fake module cards, marketplace, import/export/delete/admin authority |

## Locked Rules For Phase 5C Planning

- CRM is a visible label over existing Lead Desk technical surfaces only.
- Phase 5C must not rename `lead-desk` files, routes, API paths, contracts, Prisma models, or data models.
- Visibility does not equal authority.
- Dynamic `GET /platform/shell/actions` is deferred to Phase 6A+.
- Settings and Diagnostics are not apps.
- Apps are modules, and module cards are role-aware and authority-aware.
- No Admissions, Finance, HR, marketplace, workflow builder, AI assistant, runtime AI, real providers, production WhatsApp, logo upload, storage write path, full white-label editor, fake dashboards, fake metrics, or fake module cards are authorized by this registry.
