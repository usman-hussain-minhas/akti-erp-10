# AKTI ERP Phase 5C Autonomous Execution Readiness v1

Status: PHASE_5C_AUTONOMOUS_EXECUTION_READY_FOR_HUMAN_APPROVAL

This document is planning/control only. It does not start Phase 5C implementation, execute tickets, create runtime/frontend/backend/schema/generated/package changes, add dependencies, deploy, access secrets, or start Phase 6.

## Current Main State

- Main HEAD after PR #26 merge: `f160478bda3c53147f234eb8ffe65d9400ca62a3`
- Phase 5C ticket pack: `docs/process/AKTI_ERP_Phase_5C_Ticket_Pack_v1.json`
- Phase 5C audit stub: `docs/process/AKTI_ERP_Phase_5C_Audit_Report_v1.md`
- Spark Genesis ticket-pack audit: `docs/process/AKTI_ERP_Phase_5C_Ticket_Pack_Spark_Genesis_Audit_v1.md`
- Spark Genesis ticket-pack audit status: `PHASE_5C_TICKET_PACK_SPARK_GENESIS_AUDIT_PASSED`

## Execution Branch Recommendation

Recommended execution branch:

```text
phase5c/frontend-excellence
```

Do not create or use this branch until a human explicitly approves Phase 5C execution.

## Execution Queue Summary

Approved queue source:

```text
docs/process/AKTI_ERP_Phase_5C_Ticket_Pack_v1.json
```

Execution order:

```text
P5C-000 through P5C-GATE
```

Execution model:

- One ticket at a time.
- One ticket equals one commit.
- Use each ticket's `commit_message`.
- Before editing each ticket, produce an exact-file implementation plan.
- Broad globs are inspection hints only.
- Do not modify `files_forbidden_to_change`.
- Modify only `files_expected_to_change` unless the ticket's bounded replan rule applies and does not violate phase scope.
- Do not merge the future Phase 5C implementation PR automatically.

## Required First Execution Dependency

The first implementation dependency is:

```text
P5C-010 display_features[] manifest contract extension
```

`P5C-010` must remain limited to:

- optional `display_features?: string[]` in module manifest display metadata;
- module manifest / Foundry / module registry validation;
- approved existing module-manifest backfill only;
- tests/fixtures needed to preserve strict validation;
- no frontend hardcoded module feature bullets.

`P5C-010` does not authorize Prisma/schema/migration changes, generated registry changes, package/lockfile changes, Phase 6 module features, or broad module manifest redesign.

## Required Validation Ladder

Use the narrow ticket validation ladder for each ticket. The final gate must run the full ladder from the ticket pack, including:

```bash
pnpm contracts:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
git status --short --branch
```

Run screenshot, mobile, accessibility, and no-fake-surface validation where required by the ticket pack.

## Stop Conditions

Stop immediately if execution would require or authorize:

- Phase 6 modules;
- CRM technical migration;
- CRM pipeline endpoint;
- dynamic `GET /platform/shell/actions`;
- white-label upload/write UI;
- production auth/deployment/secrets;
- fake dashboards/modules/metrics/notifications/analytics/revenue;
- hardcoded module feature bullets;
- package/lockfile changes;
- Prisma/schema/migration/generated registry changes outside an explicitly approved ticket;
- unsupported APIs;
- frontend screen work without screen/component contract authority;
- repeated validation failure that cannot be resolved within the ticket's bounded scope.

## Bounded Self-Healing Rules

Self-healing is allowed only inside the active ticket's approved ownership area.

Allowed:

- tighten docs/control evidence for the active ticket;
- add or adjust targeted tests required by the active ticket;
- fix local type/lint/test failures caused by the active ticket;
- update exact-file plan notes when the implementation remains within approved ticket scope.

Not allowed without stopping:

- add dependencies;
- change package or lockfiles;
- broaden schema, auth, deployment, provider, or generated registry scope;
- invent APIs or module capabilities;
- implement future modules;
- hardcode data to pass visual checks;
- rename Lead Desk technical routes/files/APIs/contracts/models.

## Exact-File Planning Rules

For every ticket:

- inspect source files before editing;
- name exact files to change before editing;
- compare exact files against `files_expected_to_change`;
- treat `source_files_to_inspect` globs as inspection hints only;
- stop if a necessary file is forbidden or outside the ticket's allowed scope;
- preserve unrelated user or prior-ticket changes.

## Screenshot Acceptance Requirements

Screenshot acceptance must follow the committed acceptance plan required by `P5C-001`.

Required coverage:

- dark desktop target;
- light desktop target;
- mobile shell target;
- route/state captures named by the ticket pack;
- pass/fail criteria for visual hierarchy, spacing, contrast, focus states, layout overlap, and source-backed data;
- failure classification for fake data, unsupported modules, broken contrast, inaccessible focus states, or layout overlap.

## Mobile and Accessibility Validation Requirements

Phase 5C execution must validate:

- keyboard navigation;
- focus visibility;
- accessible names for controls;
- responsive shell behavior;
- mobile navigation and overlays;
- no text overlap or clipped controls;
- tap target sanity;
- dark and light contrast expectations.

## No-Fake-Surface Validation Requirements

Phase 5C execution must prove:

- no fake dashboards;
- no fake modules;
- no fake metrics;
- no fake notifications;
- no fake analytics;
- no fake revenue;
- no fake CRM pipeline counts, stages, conversion, tasks, or revenue;
- no future module is active/openable unless backed by approved manifest, route, screen contract, and phase scope;
- module visibility does not equal authority.

## Specific Phase 5C Non-Scope

Phase 5C execution must not include:

- no Phase 6 modules;
- no CRM technical migration;
- no CRM pipeline endpoint;
- no dynamic `GET /platform/shell/actions`;
- no white-label upload/write UI;
- no production auth/deployment/secrets;
- no fake dashboards/modules/metrics/notifications/analytics/revenue;
- no hardcoded module feature bullets.

## Readiness Verdict

Execution readiness verdict:

```text
PHASE_5C_AUTONOMOUS_EXECUTION_READY_FOR_HUMAN_APPROVAL
```

Phase 5C is ready for a human to approve autonomous execution from the merged ticket pack. Phase 5C implementation is not started by this readiness document.
