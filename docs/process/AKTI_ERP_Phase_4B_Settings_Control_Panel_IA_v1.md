# AKTI ERP Phase 4B Settings / Control Panel IA v1

**Status:** DECIDED_FOR_PRODUCT_DEFINITION
**Route:** `/app/settings`

## Structure

Settings uses a left-nav or tabbed control-panel layout with these sections:

- General
- Users & Roles
- Groups / Access
- Hierarchy / Organization Structure
- Modules
- Appearance
- Security
- Notifications
- Advanced Diagnostics

## Built-Vs-Placeholder Table

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

## Existing API Support

| Setting area | Existing support | Boundary |
| --- | --- | --- |
| General / portal mode | `GET/PUT /platform/configuration/organizations/:organization_id/portal-mode` | update requires safe session and Gatekeeper handling |
| Users & Roles | Access Core user/group/capability endpoints | reads may be built; mutations are gated and may remain placeholders |
| Groups / Access | Access Core groups/memberships/capability assignments | reads may be built; mutations need approval-safe UX |
| Hierarchy | hierarchy unit type/unit endpoints | read-only/minimal safe view |
| Modules | `GET /platform/modules` | read-only; no installer/lifecycle |
| Advanced Diagnostics | existing `operator-context.ts` sessionStorage mechanism | admin-gated; technical details hidden from normal operators |

## Gatekeeper And Denial UX

Use only these normal-user messages:

- 403 Forbidden: “You don’t have permission to make this change. Contact your administrator.”
- approval_required: “This action requires approval. Contact your administrator.”
- API unreachable: “Settings are temporarily unavailable. Try again later.”

Codex must not invent other Gatekeeper denial messages, approval UI, raw error codes, stack traces, or technical API messages for normal users.

## Advanced Diagnostics

Advanced Diagnostics owns technical session setup for Phase 4B:

- bearer token entry
- session active/missing/expired-invalid status detail
- limited diagnostics mode explanation
- redaction warning

It must not become a full login implementation, OAuth flow, username/password flow, production-auth replacement, or secret store.
