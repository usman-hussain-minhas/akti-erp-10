# AKTI ERP Phase 4B Product Definition v1

**Status:** PRODUCT_DEFINITION_READY_FOR_REVIEW
**Phase:** Phase 4B - Frontend Operational Experience & Mission Control Shell
**Purpose:** Make AKTI ERP noob-proof, operator-ready, visually readable, and structurally ready for future Foundry/module registration.

## Preconditions

- Phase 4 is complete, merged, and validated.
- Phase 4A is complete, merged, and validated.
- Phase 4A provides the local/demo runtime, smoke path, browser URL, and screenshot capture path for Phase 4B validation.
- Phase 4B implementation must not begin until product docs and a Phase 4B ticket pack are separately approved.

## Phase 4A Inputs

Phase 4B must use these inputs:

- `docs/process/AKTI_ERP_Local_Demo_Runbook_v1.md`
- `scripts/dev/local-up.sh`
- `scripts/dev/local-down.sh`
- `scripts/dev/local-reset-db.sh`
- `scripts/dev/local-smoke.sh`
- `scripts/dev/local-capture-frontend.sh`
- Phase 4 frontend current-state package under `codex-review/phase4-operational-proof/frontend-current-state/`
- Phase 4A screenshots/browser evidence under `codex-review/phase4a-local-demo-staging/ticket-artifacts/P4A-009/`
- Phase 4A redaction reviews and no-secret evidence
- Phase 4A known deferrals, especially full Docker Compose API/Web/Postgres deferral
- `docs/process/AKTI_ERP_Phase_4B_Readiness_Handoff_After_Phase_4A_v1.md`

## Locked Product Decisions

### Shell And Navigation

- Desktop shell: collapsible left sidebar plus compact top utility bar.
- Mobile shell: hybrid drawer plus bottom primary navigation.
- Module launcher: grid in Mission Control/default dashboard; list/search in command palette.
- User/org menu: top-right.
- Settings, help, and notifications: top-right cluster plus sidebar settings entry.
- Regions: fixed shell with scrollable content.
- Density: comfortable default.
- Dashboard v1 is default `/app` Mission Control content, not a distinct `/app/dashboard` route in this product definition.
- Notification center is a shell drawer/region, not a distinct route in this product definition.

### Auth And Session UX

Manual bearer token textarea must not be visible to normal operators.

The exact Phase 4B session establishment first-run path is:

1. Operator opens app; shell shows “Session missing” indicator in top bar.
2. Session indicator includes “Set up session” affordance linking to Advanced Diagnostics.
3. On Advanced Diagnostics page/section, operator enters bearer token.
4. Session is established in sessionStorage via the existing operator-context.ts mechanism or its approved successor.
5. Shell updates to “Session active”.
6. Operator navigates to work area.

Normal operators may see only these session states:

- session active
- session missing
- session expired/invalid
- limited diagnostics mode

Normal operators must not see decoded token internals, actor IDs, org IDs, lead IDs, raw technical session fields, or bearer token textareas. `apps/web/app/lead-desk/operator-context.ts` is active, not legacy. Phase 4B must define a migration/cleanup path for it; it must not be blindly deleted.

Codex must not invent any other session setup mechanism, login redirect, modal flow, OAuth flow, username/password flow, or production-auth replacement in Phase 4B.

### Dashboard V1

- Use existing APIs only.
- No fake operational data.
- Unsupported widgets become placeholders or deferrals.
- Welcome/next steps may be static/contextual.
- Module status may use module registry if available.
- Lead Desk cards may use existing Lead Desk APIs if session UX is safe.
- Recent activity and notifications are placeholders/deferred unless APIs exist.

### Settings And Control Panel

Settings must be built around existing portal mode, module list, access, hierarchy, and diagnostic boundaries where safe.

| Setting area | Phase 4B disposition |
| --- | --- |
| General / portal mode | BUILT |
| Users & Roles | BUILT for list/read where existing API and session context safely support it; invite/create/update flows are PLACEHOLDER unless already safely supported |
| Groups / Access | BUILT for list/read where existing API and session context safely support it; mutations are gated and may remain PLACEHOLDER |
| Hierarchy / Organization Structure | BUILT read-only or minimal safe view where existing APIs support it |
| Modules | BUILT read-only using module registry/list API; no installer, enable/disable, Foundry, or module lifecycle operations |
| Appearance | PLACEHOLDER |
| Security | PLACEHOLDER for Phase 5A/auth/security policy |
| Notifications | PLACEHOLDER for Phase 5A notification/communication policy |
| Advanced Diagnostics | BUILT, admin-gated, and the only place where bearer token/session technical details may appear |

PLACEHOLDER means: header/section is visible, shows “Coming in a future phase” or equivalent plain-English message, exposes no functional controls, shows no fake data, and makes no hidden backend assumptions.

Gatekeeper / settings denial UX messages are fixed:

- 403 Forbidden: “You don’t have permission to make this change. Contact your administrator.”
- approval_required: “This action requires approval. Contact your administrator.”
- API unreachable: “Settings are temporarily unavailable. Try again later.”

Codex must not invent other Gatekeeper denial messages, approval UI, raw error codes, stack traces, or technical API messages for normal users.

### Command Palette V1

- Core Phase 4B feature.
- Trigger: Ctrl+K / Cmd+K and visible search/command entry.
- Centered overlay.
- Grouped results.
- Full keyboard navigation.
- Recent commands.
- Basic actions: open dashboard, open Lead Desk, create lead if route exists, open settings, open help.
- Admin commands hidden from normal users.
- Macros, inline parameter commands, and cross-module backend search are deferred.

### Notification Center

Phase 4B includes notification infrastructure shell only:

- bell icon
- unread badge shell
- notification drawer
- toast renderer
- empty state
- static/demo/system notification rendering
- permission-aware placeholder

Notification center is infrastructure only. Phase 4B must not implement module-driven notification semantics, delivery, retention, mentions, WhatsApp/SMS/email notification behavior, or communication policy. Those wait for Phase 5A notification/communication policy.

### Lead Desk

Phase 4B must fix repo-observable UX gaps:

- token/session exposure
- raw org/actor/user/lead ID exposure
- missing shell/navigation context
- weak empty/loading/error states
- unreadable/proof-like layout
- success states exposing raw Lead ID

Human input is still needed for:

- lead vs inquiry/candidate/applicant/client lead terminology
- real statuses/stages
- assignment owner model
- top daily actions
- source/intake/status wording

Product docs and future tickets must mark those as human-input placeholders and must not invent business terminology.

## Scope

Phase 4B may define and later implement:

- Mission Control / ERP shell
- global navigation
- module navigation
- settings/control panel
- default dashboard/Mission Control content
- Lead Desk operator-friendly pages
- user/session context UI
- Advanced Diagnostics hidden from normal operators
- friendly empty/error/loading states
- responsive/readability baseline
- browser-rendered tests
- visual QA package

## Non-Scope

Phase 4B must not become:

- Phase 4A environment work
- Foundry/module installer implementation
- new business modules
- platform AI runtime
- production launch
- real WhatsApp production behavior
- full module-driven notification semantics
- full dashboard marketplace
- offline-first sync queue
- real-time collaboration platform
- macro/scripting sandbox
- production integrations

## Future Ticket-Pack Structure

The later Phase 4B ticket pack should include separate tickets for:

- product-doc validation and route/surface ownership
- Tailwind/shadcn installation/configuration decision and implementation
- Mission Control shell
- session indicator and Advanced Diagnostics migration
- settings/control panel
- command palette
- dashboard v1
- notification shell infrastructure
- Lead Desk UX cleanup
- noob-proof acceptance/visual QA gate
- closure/audit package

## Dependency Boundaries

- Existing API support may be used for portal mode, module list, Access Core read paths, hierarchy read paths, Lead Desk read/write paths, setup/bootstrap, and health.
- Backend gaps must become paired backend tickets or placeholders.
- No package/dependency/config/lockfile changes are authorized by this product definition.
- Tailwind/shadcn installation and configuration require explicit Phase 4B ticket-pack approval.
