# AKTI ERP Phase 5A Readiness Handoff After Phase 4B v1

**Status:** READINESS_HANDOFF_ONLY

This handoff records Phase 4B outputs that must inform the future Phase 5A Platform Policy Pack &
Change Governance phase. It is not a Phase 5A plan, ticket pack, implementation start, Foundry start,
module installer start, or production launch authorization.

## Phase 4B Completion Inputs

Phase 4B produced the Frontend Operational Experience & Mission Control Shell:

- Mission Control shell at `/app`;
- Settings / Control Panel at `/app/settings`;
- dashboard v1 bounded to existing APIs and explicit placeholders;
- command palette v1 with static/core commands only;
- notification shell infrastructure only;
- Lead Desk operator UX polish;
- Advanced Diagnostics session boundary;
- Tailwind/shadcn-compatible design system baseline;
- Phase 4B screen-contract validation alignment;
- browser-rendered visual QA and noob-proof checklist evidence.

## Phase 5A Inputs

Phase 5A should receive these unresolved governance inputs from Phase 4B:

| Input | Why it matters | Phase 4B disposition |
| --- | --- | --- |
| P4B-SCHEMA-001 shell capability model | Non-admin authenticated operators need shell access without receiving admin capability. | Accepted local/demo limitation; requires Phase 5A remediation before Phase 6 non-admin module/operator rollout. |
| Notification / communication policy | Real notification content requires delivery, retention, permission, escalation, and channel rules. | Deferred; Phase 4B implemented shell infrastructure only. |
| Auth/session and current user profile policy | Shell user/org display and production auth need an approved trusted identity surface. | Deferred; Phase 4B uses Advanced Diagnostics local/demo bearer session path only. |
| Activity / audit feed policy | Dashboard recent activity requires frontend-safe audit visibility rules. | Deferred; Phase 4B shows explicit placeholder. |
| Backend gap governance | Future backend tickets must name endpoint/surface, UI unblocked, validation, tenancy, and capability rules. | P4B-015 recorded exact gaps and deferrals; no vague backend ticket should be created. |
| Module UI registration governance | Future modules must use shared shell/component constraints and later Foundry registration contracts. | Phase 4B prepared shell/component boundaries; module-driven registration remains future work. |

## Explicit Non-Authorization

This handoff does not authorize:

- Phase 5A implementation;
- Phase 5B Foundry or module installer implementation;
- Phase 6 business modules;
- production auth/login/OAuth;
- production deployment;
- production secrets or credentials;
- real WhatsApp production behavior;
- module-driven notification semantics;
- schema, migration, package, or generated-registry changes.

## Required Future Decision Before Phase 6 Non-Admin Rollout

Phase 5A must resolve the Mission Control shell base-access model before Phase 6 non-admin users/modules:

- introduce a base platform shell capability such as `platform.shell.access` or `platform.authenticated`; or
- extend the screen-contract model with authenticated/session-gated shell semantics.

Until that decision is approved and implemented, `access.policy.manage` remains an accepted Phase 4B
local/demo screen-contract limitation, not the final operator-facing access model.

## Handoff Boundary

This document is a readiness handoff only. A future Phase 5A plan and ticket pack require separate approval.
