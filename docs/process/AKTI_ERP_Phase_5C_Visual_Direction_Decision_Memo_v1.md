# AKTI ERP Phase 5C Visual Direction Decision Memo v1

## 1. Status

**Status:** `PHASE_5C_VISUAL_DIRECTION_DECISION_MEMO_ONLY`

Phase 5C implementation is not started.
Phase 5B1 implementation is not started.
This memo records human-approved visual/product direction only.

This memo is not a ticket pack, implementation plan, screen contract, component contract, runtime API contract, schema authorization, package-change authorization, or Phase 5C execution authorization.

## 2. Inputs Inspected

- `docs/process/AKTI_ERP_Phase_5C_Frontend_Current_State_Evidence_v1.md`
- `docs/process/AKTI_ERP_Phase_5C_Frontend_Improvement_Backlog_Candidates_v1.md`
- `AGENTS.md`
- `docs/process/AKTI_ERP_Autonomous_Runbook_v2.md`
- `docs/process/AKTI_ERP_Master_Roadmap_Reference_v2.md`
- `docs/process/AKTI_ERP_Phase_Roadmap_v2.md`
- `apps/web/app/**` route surfaces for context only:
  - `apps/web/app/page.tsx`
  - `apps/web/app/app/page.tsx`
  - `apps/web/app/app/settings/page.tsx`
  - `apps/web/app/setup/organization/page.tsx`
  - `apps/web/app/lead-desk/inbox/page.tsx`
  - `apps/web/app/lead-desk/create/page.tsx`
  - `apps/web/app/lead-desk/leads/[leadId]/page.tsx`
  - `apps/web/app/lead-desk/leads/[leadId]/actions/page.tsx`
  - `apps/web/app/lead-desk/lead-desk-workspace.tsx`

Roadmap text is planning context only. Chat discussion is planning input only. Committed docs, ADRs, contracts, schemas, manifests, and generated/validated artifacts remain authority according to the repo source-of-truth hierarchy.

## 3. Locked Product Identity Decisions

```text
Product shell name: AKTI Spark
Legacy/internal project name: AKTI ERP remains allowed for repo/docs/history where appropriate.
UI-facing shell should use AKTI Spark.
```

## 4. Locked Layout Decision

```text
Topbar spans full width.
Second row contains left navigation and main content.
Logo lives in topbar, not sidebar.
Sidebar is navigation only.
Workspace status card sits at sidebar bottom.
```

## 5. Locked Topbar Controls

```text
Left: AKTI Spark logo lockup.
Center/primary: command/search.
Right: organization badge, user avatar, notifications, help.
Organization badge and user avatar are separate controls.
```

## 6. Locked Sidebar Navigation

Primary:

```text
Mission Control
CRM
Modules
```

System:

```text
Settings
Diagnostics
```

Diagnostics must be visually de-emphasized.

## 7. CRM Alias Decision

```text
CRM is the user-facing label for the existing Lead Desk business-module surface.
Phase 5C may rename visible navigation labels, page titles, module cards, and operator-facing copy to CRM.
Phase 5C and Phase 5B1 must not rename `lead-desk` files, routes, API paths, contracts, Prisma models, or data models.
Any technical migration from Lead Desk to CRM requires a separately approved future migration phase.
```

## 8. Module Grid Decision

```text
Apps = modules.
Settings is not an app.
Diagnostics is not an app.
Module cards are role-aware and authority-aware.
Visibility does not equal authority.
```

Locked `visibility_state` values:

| `visibility_state` | UI meaning |
| --- | --- |
| `available` | Open module |
| `requires_setup` | Finish setup |
| `locked` | Coming soon / unavailable, no open action |
| `coming_soon` | Coming soon, no open action |
| `hidden` | not rendered |

## 9. Color / Token Decision

```text
Purple/Violet = brand identity.
Teal/Cyan = action and system activation.
Dark mode is the flagship visual direction.
Light mode is derived from the dark-mode system.
```

Suggested token direction:

```text
Dark background: near-black / deep charcoal navy.
Brand purple/violet: premium identity, glows, logo accents, hero accents.
Teal/cyan: primary CTA, connection, active state, system activation.
Warning: amber.
Success: emerald.
Danger: red/rose.
```

Exact final hex values are not locked by this memo. Exact tokens are Phase 5C Visual Direction doc work and must be approved before implementation.

## 10. Branding / White-Label Decision

```text
Phase 5C may design/read/display org logo placeholder, org badge, theme preview, and read-only branding sections.
Phase 5C must not implement logo upload, S3/storage write path, image cropper, per-org branding write UI, domain branding, or full white-label management.
Phase 5B1 may add read substrate fields/APIs.
Phase 6A+ may implement upload/write/override flows.
```

## 11. Phase 5B1 Dependency Decisions

Phase 5B1 must provide or confirm:

```text
organization profile read API
organization display_name / short_name / logo_url
branding_config
effective branding read API without CSS tokens
platform.crm.access
required_capabilities[] in module manifest
ai_data_classification in module manifest
module display metadata
visibility_state enum with available/requires_setup/locked/coming_soon/hidden
role-aware /platform/modules
data controls capability namespace
platform capability namespace registry with grantable_to
search scope contract grounded in current Phase 5B searchable surfaces
notification summary contract
platform status overview via existing platform-observability surface if possible
data controls status
Phase 5C screen contract registry document
```

Also locked:

```text
Dynamic GET /platform/shell/actions is deferred to Phase 6A+.
Phase 5C may use static capability-filtered frontend actions derived from module visibility and screen contracts.
```

## 12. Component Contract Note

```text
Route screens use screen contracts.
Non-route surfaces use component contracts.
```

Non-route component contract examples:

```text
command palette
notification drawer
workspace status card
organization badge
module card
```

Component contract fields:

```text
trigger
scope
data source
capability filter
keyboard behavior
empty state
must-not-show
mobile behavior
accessibility/focus behavior
```

## 13. Non-Scope

```text
No Phase 5C implementation.
No Phase 5B1 implementation.
No business modules.
No CRM technical migration.
No Admissions/Finance/HR implementation.
No module marketplace.
No workflow builder.
No AI assistant.
No AI runtime.
No real providers.
No real WhatsApp.
No production auth.
No logo upload/storage.
No full white-label editor.
No fake dashboards.
No fake module cards.
No fake metrics.
```

## 14. Next Required Step

```text
Next step after this memo: create Phase 5B1 Platform Experience Substrate planning/control docs in Plan Mode.
```

