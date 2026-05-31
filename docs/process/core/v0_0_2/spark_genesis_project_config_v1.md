# AKTI Spark Genesis Project Config v1

## Purpose
This document records the repository source-of-truth configuration used by Spark Genesis through `.spark_genesis/project.json`.

## Spark Genesis Adoption
AKTI Spark adopts Spark Genesis on the `stable` channel (`stable-channel`) using this project configuration.

## Lean reliability checks version
The project config requires Spark Genesis minimum version:

- `spark_genesis_min_version`: `0.3.5`

Each Spark Genesis run must record the exact version/commit used and keep run-level provenance in evidence.

## Current scope and baselines
- `Core` has completed `core_v0_0_1` through `Phase 5C` and uses `v0_0_1` as completed baseline.
- `core_v0_0_2` is the current Core update space.
- `apps/training/crm/v0_0_1` is future planned lifecycle, not started.
- `apps/training/hr/v0_0_1` is placeholder, not started.
- `apps/training/finance/v0_0_1` is placeholder, not started.

## Validation command set
Configured validation commands:

- `node scripts/quality/check_lower_snake_case_paths.mjs`
- `pnpm contracts:validate`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `git diff --check`
- `git status --short --branch`

## Runtime validation required after
The following categories require runtime validation:
- structural path migration
- module wiring change
- dependency injection change
- route/API boundary change
- framework module change

## Hard boundaries
- No Phase 6 without an intent packet and explicit human approval
- No production secrets
- No deployment without approval
- No package/lockfile changes without approval
- No Prisma schema, migration, or generated registry changes without approval
- No public route/API rename without compatibility plan
- No historical evidence rewrite
- No fake dashboards, metrics, notifications, or revenue artifacts
- No invented APIs, modules, screens, or permissions
- No runtime/frontend/backend/schema/generated/package changes in config-only PRs

## Project status snapshot
- `no_phase_6`: no Phase 6 work started
- `no_crm_tickets_started`: no CRM runtime implementation tickets started
- `no_implementation_authorized`: repository remains config/documentation-only for this PR

Final status:

AKTI_SPARK_GENESIS_PROJECT_CONFIG_READY_FOR_REVIEW
