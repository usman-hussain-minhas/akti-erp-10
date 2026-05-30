# AKTI ERP Phase 5C Screenshot Acceptance Plan v1

Status: PHASE_5C_SCREENSHOT_ACCEPTANCE_PLAN_READY

This document is committed control authority for Phase 5C visual acceptance. It does not implement UI, create screenshots, or authorize fake data.

## Visual References

- `akti_spark_proposed_dark.png`
- `akti_spark_proposed_light.png`

The dark reference is the flagship target. The light reference is the derived equivalent with stronger contrast and the same layout intent.

## Required Screenshot Targets

Desktop dark-mode targets:

- `/`
- `/app`
- `/app/settings`
- `/lead-desk/inbox`

Desktop light-mode targets:

- `/`
- `/app`
- `/app/settings`
- `/lead-desk/inbox`

Mobile shell targets:

- `/app`
- `/app/settings`
- `/lead-desk/inbox`

Additional routes may be captured only when they already exist and are safe to render in local/demo mode without production secrets.

## Route and State Coverage

Capture available local/demo states for:

- default shell layout;
- workspace not connected or unavailable state;
- role-aware module grid state;
- read-only settings/branding state;
- CRM visible-label Lead Desk state;
- notification drawer where feasible;
- command palette where feasible;
- keyboard-visible focus state for major controls where feasible.

If a route or state is unavailable, auth-gated, intentionally deferred, or requires unapproved secrets, record it as skipped in the screenshot manifest with a reason.

## Pass Criteria

A screenshot passes when it:

- follows the approved Phase 5C visual direction;
- preserves the AKTI Spark product identity;
- keeps dark and light modes visually related;
- uses the committed Phase 5C token substrate for cyan/teal action states, violet brand glow, emerald success, amber warning, high-contrast text, and visible focus rings;
- avoids layout overlap or clipped text;
- keeps controls readable with visible focus states;
- uses real approved data sources or honest unavailable/empty states;
- keeps module cards bound to `GET /platform/modules`, manifest display metadata, `visibility_state`, and optional `display_features[]`;
- keeps CRM as visible label only over existing Lead Desk surfaces.

## Failure Criteria

A screenshot fails when it shows:

- token drift that makes dark mode no longer flagship or makes light mode low contrast;
- fake dashboards;
- fake modules;
- fake metrics;
- fake notifications;
- fake analytics;
- fake revenue;
- fake CRM pipeline counts, stages, conversion, tasks, or revenue;
- unsupported modules as active/openable;
- hardcoded module feature bullets;
- broken contrast;
- inaccessible focus states;
- layout overlap;
- unsupported white-label upload/write UI;
- Phase 6 module surfaces;
- CRM technical migration or renamed Lead Desk technical surfaces.

## Downstream Use

All Phase 5C implementation tickets that alter visual output must reference this acceptance plan. Final screenshot evidence must include a manifest that records route, viewport, theme mode, file path, capture method, pass/fail result, skipped routes, and confirmation that no production secrets or production data were used.

## Theme-Specific Criteria

Dark mode must verify:

- near-black/charcoal shell background;
- high-contrast text;
- cyan/teal active states;
- violet brand highlight/glow;
- emerald success and amber warning accents;
- subtle borders and shadows without hiding content.

Light mode must verify:

- white or warm-slate surfaces;
- readable slate text;
- light cyan/teal active states;
- violet brand highlights;
- soft shadows;
- stronger contrast than earlier light drafts.

Mobile screenshots must verify that the same tokens remain legible without overlapping text, clipped controls, or inaccessible tap targets.
