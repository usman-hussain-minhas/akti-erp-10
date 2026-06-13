---
company: HAUTM
platform: Esbla Spark
author: Usman Hussain
owner: Usman Hussain
suite_version: v5.0
file_version: v2.0
created: 2026-06-13
last_updated: 2026-06-13
status: active
document_type: operating_guide
scope: Compact Codex operating guide for this repository during Esbla Spark Stage 1.
ratifier: Usman Hussain
---

# Esbla Spark Codex Operating Rules

This file is the compact daily operating guide for Codex in this repository. It summarizes committed doctrine and active controls; it does not replace them.

`AGENTS.md` is not the architecture source of truth. If this file conflicts with Prisma, contracts, manifests, generated registries, accepted ADRs, active process docs, policies, standards, tests, validation evidence, or committed doctrine files, the higher-authority source wins.

## Current Project State

- Company: HAUTM.
- Platform: Esbla Spark.
- v5 suite: internally ratified in repo artifacts.
- Stage 0: complete on `main`; Waves 2-5 executed with the semantic contract/package rename FFET deferred to Stage 2.
- Current target: Stage 1 for the Phase 6A-6C consolidated amendment.
- Stage 1 scope: amendment, catalog, extraction, fidelity, seed, and FFET control artifacts only.
- Stage 1 must stop at Gate 3 until human approval is explicit.
- Stage 2 scope: runtime integration, contract-change work, backend wiring, frontend wiring, Foundry activation enforcement, Gatekeeper routing, audit/evidence emission, and tenant-isolation proof.
- Stage 2 may not execute from Stage 1 approval.

## Active Doctrine and Control Map

Read these before planning or execution:

- `docs/ratification/esbla_spark_v5_0/esbla_docs_suite_v5_manifest_v1.md`
- `docs/blueprints/current/esbla_spark_blueprint_master_plan_v3_1.md`
- `docs/doctrine/current/esbla_business_logic_v2.md`
- `docs/doctrine/current/esbla_business_logic_v2_appendix_a_carried_forward_v4_rules.md`
- `docs/doctrine/current/esbla_failure_prevention_codex_operating_doctrine_v1.md`
- `docs/doctrine/current/esbla_ticket_quality_doctrine_v1.md`
- `docs/standards/current/esbla_file_metadata_standard_v1.md`
- `docs/process/active/esbla_rebaseline_refactor_plan_v1.md`
- `docs/process/phases/cross_phase/esbla_phase_6a_6c_consolidated_amendment_v1.md`
- `docs/process/phases/cross_phase/phase_6a_6c_runtime_integration_ffet_v1/phase_6a_6c_runtime_integration_ffet_registry_v1.json`
- `docs/process/registries/migration_tracker_v5_0.json`
- `docs/process/registries/legacy_name_map_v5_0.json`
- `docs/process/registries/document_registry_v5_0.json`
- `docs/process/registries/file_metadata_registry_v5_0.json`

Legacy-named operating files that were carried forward are transition evidence only when superseded by the current Esbla-named files above. Do not restore retired paths or names unless an active control artifact explicitly requires it.

## Source of Truth Bridge

Until post-6F doc-as-source-of-truth activation, executable repo truth remains authoritative for implemented behavior:

1. Prisma schema, migrations, and database constraints.
2. Contracts and validation contracts.
3. Module manifests.
4. Generated registries as derived evidence.
5. Accepted ADRs.
6. Active process docs, policies, standards, tests, and validation evidence.
7. Current doctrine and blueprint documents.
8. Chat history as drafting support only.

When intended doctrine and implemented truth differ, do not guess. Record the gap as an ADR, control amendment, migration ticket, FFET blocker, or deferred decision.

## Ticket and FFET Rules

Implementation is not stale by itself. Tickets become stale.

Apply maximum concrete capability within the approved scope of each ticket.

Final Fine-Grained Executable Tickets are the execution unit. Each FFET must have exact files, concrete MCR, dependencies, validation commands, stop conditions, rollback notes, bounded self-heal policy, and expected evidence.

Ticket packs and Gate-2 planning may reveal blockers; they must not resolve blockers by editing runtime code, schema, contracts, generated files, packages, lockfiles, migrations, frontend, backend, or validation scripts unless that exact control implementation is separately approved.

Only binding human Gate 3 approval may authorize execution. Readiness reports, CI, audit success, chat approval, or merged planning artifacts do not imply execution approval.

## Autonomous Execution Constants

- Gate 1: generate candidate FFETs from committed repo truth only.
- Gate 2: run independent FFET audit before human review.
- Gate 3: binding human approval.
- Gate 4: execute approved FFETs in dependency order within exact files.
- Gate 5: stop and escalate on scope expansion, hidden decision, irreversible action, forbidden path, exhausted self-heal, CI failure outside scope, or branch protection requiring human action.

Autonomous execution uses one FFET per branch, commit, PR, CI wait, merge, and local main update unless an approved phase plan explicitly permits batching.

Self-heal is limited to three deterministic repairs inside active FFET files. Stop for architecture, schema, API, permission, provider, business-rule, secret, production, destructive migration, or runtime-boundary decisions.

## Stage 1 Guardrails

Stage 1 may create or update docs/control artifacts for the Phase 6A-6C amendment pipeline. Stage 1 may not:

- Wire runtime modules.
- Publish routes or controllers.
- Change Prisma schema or migrations.
- Change package or lock files.
- Manually edit generated registries.
- Create frontend screens or routes.
- Execute the deferred semantic contract/package rename.
- Flip `ticket_generation_allowed`, `ticket_pack_generation_allowed`, or `execution_authorized` to true.
- Treat the runtime integration FFET package as approved for execution.

The Stage 1 package must cover the 19 amendment surfaces from the consolidated amendment, or record explicit blockers instead of inventing missing doctrine.

## Stage 2 Guardrails

Stage 2 requires a re-audited runtime-integration package after Stage 1 lands. Stage 2 owns runtime wiring only after explicit Gate 3 approval.

Stage 2 must prove disabled tenant services are inaccessible, Foundry activation gates backend and frontend access, Gatekeeper governs high-risk actions, audit/evidence is emitted, tenant isolation is enforced, and frontend bundle behavior is measured.

## Spark Genesis

Do not use Spark Genesis in this repository unless the user explicitly asks for it in the active task. If it is used, record its channel, version, git SHA, and repo status. Repo artifacts remain authoritative over Spark Genesis output.

## Validation

Run the narrow validation ladder required by the active FFET or control PR. Common docs/control checks:

```bash
node scripts/quality/check_lower_snake_case_paths.mjs
git diff --check
```

Common runtime validation commands are used only when runtime or package files are in approved scope. If a validation command is unavailable, report it honestly rather than creating it as a side effect.

## Done Means

- The requested artifact or approved implementation is complete.
- Exact-file scope is respected.
- Relevant validation commands are run and reported.
- No forbidden files or flags changed.
- MCR is proven by observable behavior, CI command result, or named artifact.
- Known gaps and deferred decisions are recorded explicitly.
