# AKTI ERP Codex Operating Rules

This file is the compact operating guide for Codex in this repository. It summarizes the committed doctrine and active phase controls; it does not replace them.

`AGENTS.md` is not the architecture source of truth. If this file conflicts with Prisma, `packages/contracts`, module manifests, the generated registry, accepted ADRs, active process docs, policies, standards, tests, validation evidence, or committed doctrine files, the higher-authority source wins.

---

## Doctrine Map — Read This First

These doctrine files must remain separate and linked:

- `docs/doctrine/AKTI_ERP_Failure_Prevention_Codex_Operating_Doctrine_v1.json`
  - Root operating doctrine.
  - Governs failure prevention, source-of-truth hierarchy, Codex behavior, ADR discipline, Plan Mode, delivery-first behavior, frontend prevention, evidence discipline, autonomous execution, and human/AI governance.
- `docs/doctrine/AKTI_ERP_Ticket_Quality_Doctrine_v1.md`
  - Specialized ticket-writing doctrine.
  - Governs ticket freshness, ticket depth, split rules, MCR quality, ownership boundaries, and ticket-pack prompt enforcement.

The Ticket Quality Doctrine extends, but does not replace, the Failure Prevention & Codex Operating Doctrine.

`AGENTS.md` summarizes both for daily Codex operation. Do not merge the two doctrine files into one broad document.

---

## TICKET QUALITY — READ THIS FIRST

Full doctrine: `docs/doctrine/AKTI_ERP_Ticket_Quality_Doctrine_v1.md`

Axiom 1: Implementation is not stale by itself. Tickets become stale.

Axiom 2: Each ticket must contain maximum concrete implementation within its approved scope.

The failure pattern is stale, vague, shallow, overlapping, unsafe, or non-predictive tickets — not long queues. Ticket count is never a split condition.

Every ticket pack prompt must include these exact enforcement lines:

```text
Implementation is not stale by itself. Tickets become stale.
Apply maximum concrete capability within the approved scope of each ticket.
```

A ticket is stale if it references stale files, has missing dependencies, leaves decisions open for Codex to make, has vague scope, has a documentation-only MCR, overlaps another ticket's ownership, is too large for one commit, or forces Codex to invent rules not in any committed source.

Split a ticket only if it owns multiple architectural decisions, creates multiple runtime subsystems, mixes policy interpretation with implementation, spans unrelated validation ladders, or creates overlapping file ownership.

MCR must name a runtime behavior, CI command result, or named artifact. `Service documented`, `file created`, and `implementation improved` are forbidden MCRs.

Lifecycle `PASS`, `READY`, or zero-trust audit success is not executable ticket readiness unless the ticket pack also passes exact-file, runtime-MCR, blocker, dependency, ownership, validation, and freshness gates.

Ticket-pack planning reveals blockers; it must not resolve them by changing real code, schema, runtime, generated, package, lockfile, migration, contract, registry, frontend, backend, or validation-script files. Missing repo truth requires a separate control implementation PR before ticket promotion.

Every branch and PR must have one role: planning, control implementation, capability implementation, review, or documentation correction. A mixed ticket-planning plus implementation PR is not valid planning or execution authority even when CI is green; quarantine, split, or replace it before using it as source truth.

Final Fine-Grained Executable Tickets (FFETs) are the only final implementation execution units. A service-level capability candidate is not an FFET. Each FFET maps to exactly one seed/sub-surface unless an explicit `merge_rationale` proves inseparability, and it must carry concrete files, runtime MCR, validation commands, dependencies, stop conditions, rollback notes, and bounded self-heal policy.

Only binding human approval after independent FFET audit may flip `ticket_generation_allowed`, `ticket_pack_generation_allowed`, or `execution_authorized` to `true`. CI, readiness reports, scripts, and autonomous runs must keep those flags `false`.

---

## Required Stack

* Next.js + React + TypeScript
* NestJS + TypeScript
* PostgreSQL
* Prisma
* Redis + BullMQ
* Tailwind + shadcn/ui
* S3-compatible storage

---

## Current Project State

* Phase 1: PASS
* Phase 2: PASS_WITH_ACCEPTED_DEFERRALS
* Phase 3: PASS_WITH_ACCEPTED_DEFERRALS
* Phase 4: PASS
* Phase 4A: PASS
* Phase 4B: PASS
* Phase 5A: PASS — merged to `main` at `a866c7b1fbea2aff44418494286e85215c36cc79`
* Current target: Phase 5B control docs and ticket pack, planning only
* Phase 5B: Gatekeeper-Governed Module Foundry & Core Platform Completion
* Do not start Phase 5B execution, Foundry runtime, or module installer runtime until Phase 5B control docs and ticket pack are approved
* Phase 5C: Frontend Excellence & UI Platform Maturity, after Phase 5B is merged and approved
* Phase 6A: Golden Module Certification, after Phase 5B and Phase 5C
* Phase 6B+: business modules, after Foundry exists and Golden Module certification is complete
* Lead Desk is a business module, not core
* Engagement Gateway is a shared platform module
* WhatsApp stub is an integration adapter; no production WhatsApp credentials or real outbound WhatsApp are in scope until separately approved

---

## Phase 5A Outputs on Main — Primary Phase 5B Inputs

Read these before creating any Phase 5B ticket:

* `docs/process/AKTI_ERP_Foundry_Implementation_Requirements_From_Phase_5A_v1.md`
* `docs/process/AKTI_ERP_Phase_5A_Core_Platform_Service_Architecture_Decisions_v1.md`
* `docs/process/AKTI_ERP_Phase_5B_Readiness_Handoff_After_Phase_5A_v1.md`
* `docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md`
* `docs/policies/AKTI_ERP_Gatekeeper_Module_Change_Checklist_v1.md`
* `docs/standards/AKTI_ERP_Event_Schema_Standard_v1.md`
* `docs/standards/AKTI_ERP_Platform_Service_Contracts_Standard_v1.md`
* `docs/standards/AKTI_ERP_Workflow_Process_Definition_Standard_v1.md`
* `docs/adr/ADR-0015-tenant-rls-enforcement-strategy.md`
* `docs/adr/ADR-0016-shell-base-capability-or-session-gated-screen.md`
* `docs/adr/ADR-0017-platform-versioning-baseline.md`
* `docs/adr/ADR-0018-module-registry-frontend-api-boundary.md`
* `platform.version.json`

Phase 5A documents are read-only during Phase 5B. A gap found in a Phase 5A document is a stop condition, not a reason to edit it.

---

## Source Of Truth Hierarchy

Lower rank number wins when sources conflict:

1. `prisma/schema.prisma` — tables, relationships, migrations, database constraints
2. `packages/contracts` — Zod schemas, behavioral contracts, validation contracts
3. Module manifests — capabilities, permissions, routes, events, dependencies, settings, menu entries
4. Generated entity registry — derived Prisma and metadata view, not structural authority
5. `docs/adr` — accepted decisions and rationale
6. Active phase control docs, process docs, policies, standards, tests, and validation evidence — active execution contract for the phase
7. `docs/doctrine/AKTI_ERP_Failure_Prevention_Codex_Operating_Doctrine_v1.json` — root Codex and failure-prevention operating doctrine
8. `docs/doctrine/AKTI_ERP_Ticket_Quality_Doctrine_v1.md` — specialized ticket-writing doctrine
9. `docs/blueprints` and roadmap references — planning direction and scope context only
10. Chat history — drafting support only, never final authority

When two sources conflict, the lower rank number wins. If conflict remains unresolved, stop and report the conflict instead of guessing.

---

## Spark Genesis Planning Aid

<skill>
<name>spark-genesis</name>
<channel>stable</channel>
<description>Use for phase planning, intent clarification, control docs, seed matrix, ticket-pack audit, predictive stop analysis, autonomous readiness, execution logging, postmortem learning, and recurring failure-pattern detection.</description>
<location>/Volumes/UsmanWork/Spark Genesis/skills/spark_genesis/SKILL.md</location>
</skill>

Spark Genesis is an audit/planning aid, not source of truth. If Spark Genesis conflicts with AGENTS.md, Prisma, contracts, manifests, generated registry, ADRs, active process docs, tests, or validation evidence, the AKTI source-of-truth hierarchy wins.

AKTI Spark adopts Spark Genesis by stable channel. Spark Genesis patch/minor updates do not require an AKTI adoption PR unless the skill location, channel, major compatibility behavior, or project-specific override changes.

Every Spark Genesis-generated audit, readiness report, postmortem, learning scan, and lifecycle artifact must record the exact Spark Genesis channel, version, git SHA, and repo status used for that run.

Use Spark Genesis before:

- Phase 5C planning/control docs
- Phase 5C ticket-pack creation
- ticket-pack audit
- predictive stop analysis
- autonomous execution readiness
- post-run learning classification

Do not invoke Spark Genesis for tiny typo fixes, single-file harmless text edits, or low-risk changes with no phase/schema/auth/frontend/module-boundary impact.

---

## Phase 5B Locked Decisions

Final. Do not revisit:

* Gatekeeper = judge/policy enforcement only
* Gatekeeper outcomes: `ALLOW | DENY | APPROVAL_REQUIRED | STOP_FOR_REVIEW`
* `STOP_FOR_REVIEW` is immutable below platform architect level
* Foundry = module installer/lifecycle runtime only; it executes after Gatekeeper authorizes
* Workflow Engine = core platform service, not a Foundry module
* Reporting = event-driven read models
* Search = PostgreSQL FTS baseline; pgvector reserved path; Typesense deferred
* Multi-tenancy = shared DB + `organization_id` default; future enterprise isolation path
* White-labeling = core architectural constraint; enum: `none | partial | full`
* Configurable labels = module defaults + tenant overrides; display-only
* Golden Module = Phase 6A only

---

## Codex Operating Model

* Inspect relevant repo files before planning or implementation.
* Use Plan Mode for multi-step work.
* Use Plan Mode for schema, auth, permission, RLS, payment, certification, WhatsApp, frontend screen, module-boundary, Gatekeeper, Foundry, migration, and cross-module data tasks.
* Implement only from an approved plan unless the task is a tiny typo fix or single-file text edit with no architecture impact.
* Keep work ticket-sized: one ticket, one branch or worktree, one outcome.
* Keep branch and PR role pure: docs-only ticket planning must not include schema/runtime/code/control implementation, and implementation/control PRs must not claim ticket-pack readiness unless separately regenerated from accepted repo truth.
* Use worktrees only for bounded parallel tasks with non-overlapping files.
* Do not run multiple agents on overlapping architecture, schema, contract, registry, manifest, Access Core, Gatekeeper, Foundry, migration, or module-boundary files.
* Future autonomous runs use stable contract plus flexible runtime: control docs define scope, queue, ticket boundaries, validation ladder, artifact policy, hard gates, and final stop behavior; progress comes from git history, journals, artifacts, optional run-state files, and ordered queue position.
* Control docs are not live execution ledgers and must not be mutated during implementation tickets unless the active ticket is explicitly a control-doc correction.

---

## Exact-File Planning Rule

Before editing, each ticket must produce an exact-file implementation plan.

Broad globs in ticket packs are inspection hints only. If required files fall outside the exact-file plan, stop unless the active ticket explicitly allows a scoped plan update.

---

## Autonomous Execution Constants

Reusable autonomous-run constants are committed doctrine, not chat memory. Phase-specific variables remain in the active phase plan, FFET registry, or explicit human approval.

Fixed FFET lifecycle:

* Gate 1: generate candidate FFETs from committed repo truth only.
* Gate 2: run independent FFET audit before human review.
* Gate 3: binding human approval; only this gate may flip `ticket_generation_allowed`, `ticket_pack_generation_allowed`, or `execution_authorized`.
* Gate 4: execute approved FFETs in dependency order within exact files.
* Gate 5: stop and escalate on scope expansion, hidden decision, irreversible action, forbidden path, exhausted self-heal, CI failure outside scope, or branch protection requiring human action.

Execution constants:

* One FFET per seed/sub-surface unless explicit `merge_rationale` proves inseparability.
* One FFET per branch, commit, PR, CI wait, merge, and local `main` update unless an approved phase plan permits safe batching.
* Apply maximum concrete capability within approved exact-file scope; do not ship minimal/stale/scaffold-only behavior for runtime-authorized FFETs.
* Self-audit before implementation, before commit, before merge, and after merge.
* Self-heal up to 3 deterministic repairs per FFET, only inside active FFET files.
* Use the CI settling gate after every push, PR creation, PR update, and merge.

Do not encode phase variables in doctrine: phase/version, registry path, ticket count/order, allowed files, validation commands, branch names, blockers, or approval scope.

## Autonomous Repair Policy

Autonomous repair is allowed only for deterministic local validation failures inside active ticket scope.

Allowed examples:

* TypeScript import/export mismatch
* Zod/schema shape mismatch
* Local test expectation mismatch caused by active-ticket implementation
* Missing validation wiring for active-ticket tests when no dependency or unrelated script change is needed

Stop immediately for:

* New dependency
* Forbidden file scope
* Architecture, ADR, module-boundary, or business-rule decision
* Secret access
* Production deployment
* Destructive migration
* Direct WhatsApp/Meta coupling
* Frontend without an approved screen contract
* Repeated validation failure after the active repair budget

Test-runner wiring may be updated only when the active ticket adds or requires tests, existing validation does not run those tests, the change is limited to including active-ticket tests, no dependency is added, and no unrelated script behavior changes.

---

## CI Settling Gate

After every push, PR creation, PR update, or merge, do not treat transient GitHub `UNSTABLE`, `PENDING`, `QUEUED`, or `IN_PROGRESS` state as a hard stop.

Use this polling gate before deciding the autonomous run is blocked:

* Wait 2 minutes, then run `gh pr view <PR_NUMBER> --json state,mergeStateStatus,statusCheckRollup,url`.
* Repeat up to 5 times for a default 10-minute wait budget.
* Continue automatically when required checks are successful and merge state is `CLEAN`.
* Stop immediately when a required check concludes `FAILURE`, `CANCELLED`, `TIMED_OUT`, or `ACTION_REQUIRED`.
* Stop immediately when merge state becomes conflicted, dirty, blocked by branch protection that needs human action, or otherwise not mergeable for a real reason.
* If checks are still actively progressing after 5 polls, allow one extended 10-minute loop: 5 more polls, 2 minutes apart.
* After the extended loop, stop and report timeout rather than waiting indefinitely.

Classify polling results as:

* `CONTINUE`: all required checks successful and merge state clean.
* `WAIT`: checks are queued, pending, in progress, or PR metadata is stale while the latest run is active.
* `FAIL`: a required check failed, was cancelled, timed out, or needs action.
* `STOP`: merge conflict, branch-protection human action, unknown state after timeout, or scope violation.

If CI fails because of deterministic local artifact drift inside the active ticket scope, self-heal up to 3 attempts, push again, and restart this CI settling gate. Do not self-heal failures caused by architecture, schema ambiguity, missing business decision, destructive migration risk, forbidden scope, or branch protection.

---

## Hard Rules

* Never change architecture without an ADR.
* Never treat chat history as source of truth.
* Never produce another broad blueprint revision instead of repo artifacts.
* Never hardcode organization, campus, role, group, user, tenant, or AKTI-only business assumptions.
* Never bypass Access Core.
* Never bypass Gatekeeper for high-risk actions.
* Never invent permissions, roles, module boundaries, capabilities, APIs, events, screens, business rules, or AI tools.
* Never add tenant-scoped tables without `organization_id`, RLS metadata, required indexes, and negative cross-org tests.
* Never manually maintain lists that should be derived from Prisma, contracts, manifests, or generated artifacts.
* Never leave TODO placeholders in production code.
* Never claim done without running and reporting validation commands.
* Never produce documentation instead of working code unless the ticket is explicitly documentation-only.
* Never modify Phase 5A policy, ADR, standard, checklist, or handoff documents during Phase 5B execution.
* Never create frontend UX without an approved screen contract.
* Never create new UI patterns when `packages/ui` has an approved component.
* Never use AI-generated content to publish website pages without explicit approval.

---

## Phase 5B1 Platform Experience Guardrails

* CRM is the visible user-facing label for the existing Lead Desk surface. Do not rename `lead-desk` files, routes, API paths, contracts, Prisma models, or data models without a separately approved future migration phase.
* Visibility does not equal authority. Showing a module card or navigation item does not grant import, export, delete, approve, configure, administer, or other destructive authority.

---

## Phase 5B Non-Scope

No Phase 5B ticket may authorize:

* Phase 5C frontend pixel-perfect work
* Phase 6A Golden Module implementation or certification template
* Phase 6B+ business modules, business workflows, or business-specific UI
* Marketplace or public module store
* Production deployment beyond operational readiness proof
* Real external adapter production integration
* Real outbound WhatsApp
* Production WhatsApp credentials
* Runtime AI beyond approved governed proxy boundary
* Phase 5A policy, ADR, standard, checklist, or handoff document modifications

---

## Approval Required Before

Codex must get explicit approval before it:

* Changes architecture
* Adds dependencies
* Changes Prisma schema broadly
* Changes auth or session logic
* Disables or weakens RLS
* Modifies Gatekeeper behavior
* Changes module boundaries
* Invents permissions, roles, capabilities, APIs, events, screens, or business rules
* Hardcodes business structure
* Creates frontend UX without a screen contract
* Touches production secrets
* Runs destructive migrations
* Deletes broad file trees
* Rewrites large modules
* Uses AI-generated content to publish website pages
* Starts production deployment or real external adapter production integration

---

## Architecture And Data Rules

* Prisma is the structural source of truth for entities.
* Entity Registry must be generated from Prisma plus approved metadata, not manually maintained.
* CI must fail when generated registry output drifts from checked-in generated output once registry tooling exists.
* Tenant-scoped data must include organization isolation, RLS metadata, required indexes, and negative cross-org tests.
* Module capabilities, APIs, events, dependencies, settings, and menu entries must be declared through contracts or manifests.
* Future phases should remain placeholders until phase-specific planning begins.
* Every module must declare the problem it solves, users, owned data, required permissions, screens, emitted events, dependencies, install/disable policy, audit behavior, evidence produced, AI-readable data, AI-prohibited data, AI tools/recommendations if any, human approval rules, Gatekeeper requirements, cost budget, and evaluation evidence.
* Every adapter must declare external system, credential requirements, credential storage, failure behavior, retry/idempotency policy, audit behavior, disable behavior, module access rules, AI tool eligibility if any, and human/Gatekeeper approval requirements before AI-suggested adapter actions.
* Cross-module data must be governed by explicit policy before parallel module implementation. Do not allow direct cross-module querying, reporting, AI-readable context assembly, or prohibited-field exclusion by assumption.

---

## Frontend Rules

* Do not implement a frontend screen without a screen contract.
* A screen contract must define route, purpose, users, required capabilities, actions, data source, fields, validation, states, mobile behavior, audit hooks, and what must not happen.
* Use `packages/ui` components when available.
* Do not ship fake dashboards, placeholder buttons, hardcoded role dashboards, hardcoded campus names, random dummy data, or generic UI without operational value.
* Technical/admin details should sit under Advanced Options, Admin, or Diagnostics surfaces, not the default operator flow.

Frontend done means:

* Working route
* Permission-aware navigation
* Real layout
* Empty, loading, and error states
* Responsive behavior
* Connected API or explicit mock contract
* Form validation where forms exist
* Table filters where tables exist
* Visible primary action
* Audit hooks where required
* No hardcoded role, campus, organization, tenant, user, or business assumptions
* Passing build

---

## Validation Commands

Run the narrow relevant subset after each change:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test --filter api
pnpm test --filter access-core
pnpm test --filter lead-desk
pnpm build
pnpm exec prisma validate --schema prisma/schema.prisma
npx prisma validate
npx prisma migrate diff
pnpm contracts:validate
pnpm registry:generate
pnpm registry:check
pnpm registry:verify:phase2
```

If a validation script or scaffold does not exist yet, do not create it as a side effect. Report it as unavailable and recommend the next ticket.

---

## Done Means

* Code or requested artifact implemented
* Relevant tests added or updated when code changes
* Relevant validation commands run, or unavailable commands reported honestly
* Lint, typecheck, build, tests, Prisma validation, contract validation, and registry checks pass when applicable
* No hardcoded tenant, organization, campus, role, user, or business assumptions
* Acceptance criteria satisfied
* MCR proven by observable runtime behavior, CI command result, or named artifact — not documentation alone
* Short completion note provided with changed files, commands run, result, known gaps, and next recommended ticket

---

## What This File Prevents

* Architecture drift by chat memory
* Blueprint revision loops replacing delivery
* Evidence packs and reports being treated as completion
* Manual list drift across entities, RLS, indexes, events, blockers, and manifests
* Tenant isolation mistakes
* Gatekeeper or Access Core bypasses
* Hardcoded AKTI org, campus, user, role, tenant, or business assumptions
* Frontend screens built from imagination
* Fake dashboards and unusable generic UI
* Broad unsafe schema, auth, Foundry, Gatekeeper, or module-boundary changes without approval
* Parallel agents editing overlapping files
* Premature Phase 5B execution before control docs and ticket pack approval
* Premature Phase 5C, Phase 6A, Phase 6B+, marketplace, runtime AI, or production adapter work
* WhatsApp and Lead Desk urgency being buried behind foundation work
