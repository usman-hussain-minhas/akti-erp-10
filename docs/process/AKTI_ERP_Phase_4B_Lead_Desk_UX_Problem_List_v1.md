# AKTI ERP Phase 4B Lead Desk UX Problem List v1

**Status:** PRODUCT_INPUT
**Source:** Repo-observable frontend state, Phase 4 frontend current-state evidence, and Phase 4A screenshot evidence.

## Repo-Observable Gaps

| Gap | Current evidence | Phase 4B expectation |
| --- | --- | --- |
| Token/session exposure | Lead Desk pages show Phase 3 session token textarea | Move token entry to Advanced Diagnostics only |
| Raw org/actor/user/lead ID exposure | Session context and Lead ID labels appear in normal UI | Hide raw IDs from normal views; show friendly labels or safe summaries |
| Missing shell/navigation context | Lead Desk routes are standalone pages | Place Lead Desk inside Mission Control shell and module navigation |
| Weak empty/loading/error states | States exist but are proof-like | Use plain, guided states with next action |
| Unreadable/proof-like layout | Phase 4 screenshots show poor visual readability | Apply design system and visual QA pass/fail gate |
| Success state exposes raw Lead ID | Create success displays Lead ID | Show user-friendly success and links, not raw IDs by default |
| Assignment owner terminology | UI asks for User ID | Use human-readable owner label or placeholder until owner model is approved |

## Human Input Still Needed

- lead vs inquiry/candidate/applicant/client lead terminology
- real statuses/stages
- assignment owner model
- top daily actions
- source/intake/status wording

Phase 4B must not invent those business terms. Use current contract terms only where necessary and mark final terminology as human-input placeholder.

## operator-context.ts Cleanup Target

`apps/web/app/lead-desk/operator-context.ts` is active, not legacy.

Phase 4B cleanup should:

- preserve existing trusted bearer-session behavior until an approved successor exists;
- move token entry and technical details to Advanced Diagnostics;
- provide a shell-level session state indicator;
- avoid showing decoded token internals in normal views;
- avoid deleting `operator-context.ts` blindly.

## Exact First-Run Session Path

1. Operator opens app; shell shows “Session missing” indicator in top bar.
2. Session indicator includes “Set up session” affordance linking to Advanced Diagnostics.
3. On Advanced Diagnostics page/section, operator enters bearer token.
4. Session is established in sessionStorage via the existing operator-context.ts mechanism or its approved successor.
5. Shell updates to “Session active”.
6. Operator navigates to work area.

Codex must not invent any other session setup mechanism, login redirect, modal flow, OAuth flow, username/password flow, or production-auth replacement in Phase 4B product definition docs or tickets.
