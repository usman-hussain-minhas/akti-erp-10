# AKTI ERP Ticket Quality Doctrine v1

**Status:** Authoritative
**Version:** 1.1
**Owner:** Platform Architecture
**Applies to:** Every ticket pack, every phase, every Codex session

---

## Changelog

- v1.1: Adds the Phase 6B v1-v18 ticketability correction. Lifecycle evidence is compiler input for ticket writing, not ticket readiness by itself. Ticket-pack planning must not modify real code, schema, runtime, generated artifacts, package files, or validation scripts to unblock tickets.
- v1.0: Initial authoritative ticket quality doctrine.

---

## The Two Axioms

These are not guidelines. They are axioms.
Every ticket that contradicts them is wrong by definition.
Axiom 1: Implementation is not stale by itself. Tickets become stale.
Axiom 2: Apply maximum concrete capability within the approved scope of each ticket.

The failure pattern in AI-assisted development is not autonomous execution
running too long. It is tickets that are stale, shallow, vague, overlapping,
unsafe, or non-predictive. A 200-ticket queue with precise tickets executes
more reliably than a 20-ticket queue with vague ones.

---

## Lifecycle Evidence Is Compiler Input, Not Ticket Readiness

Lifecycle documentation, source coverage matrices, dependency maps, execution
seed matrices, fidelity matrices, blocker registries, and zero-trust reports
are evidence layers for ticket writing. They are not the finish line.

Mechanical PASS, semantic PASS, READY, or READY_FOR_REVIEW does not mean a
phase is ready for implementation tickets. A phase becomes ticket-ready only
when a ticket pack can answer this harder question:

Can a developer execute this ticket at current repo HEAD without inventing
scope, decisions, files, validation, architecture, service boundaries,
permissions, schema, APIs, ADL behavior, or business rules?

Production ticket readiness requires all of the following:

- exact file ownership;
- runtime behavior to implement;
- observable minimum concrete requirement;
- validation commands;
- dependency tickets;
- blocker references;
- stop conditions;
- stale-ticket risk notes;
- current repo HEAD freshness.

Documentation proves readiness. Tickets drive implementation. If tickets are
vague, implementation will become stale again.

---

## Ticket-Pack Planning Must Not Implement Blockers

Ticket-pack planning reveals blockers. It must not resolve blockers by changing
real repo truth inside the planning pass.

A ticket-pack planning PR may create docs-only readiness artifacts, blocker
registries, ticketability matrices, quality gates, stale-ticket audits, and
ticket-pack drafts.

A ticket-pack planning PR must not modify:

- `apps/**`;
- `packages/**`;
- `prisma/**`;
- `generated/**`;
- `scripts/**`;
- package files;
- lockfiles;
- migrations;
- frontend files;
- backend files;
- runtime code;
- schema files;
- contract files;
- registry outputs.

If missing schema, contracts, manifests, runtime scaffolds, generated registry,
validation scripts, permissions, API boundaries, service boundaries, screen
contracts, or business decisions block implementation tickets, the planning
pass must mark the affected candidates blocked and create a separate
schema-control, scaffold-control, decision-control, or validation-control
implementation plan or PR.

A ticket may not become executable-review-ready because the planning pass
changed repo truth. Repo truth must already exist on the accepted base branch
or in an accepted dependency PR before promotion.

## Branch and PR Role Purity

Every branch and PR must have one role: planning, control implementation,
capability implementation, review, or documentation correction.

Ticket-pack planning PRs are docs/process artifacts only. They must not change
code, schema, runtime, generated artifacts, package files, contracts, registry
outputs, migrations, frontend, backend, or validation scripts to make tickets
appear executable.

Schema-control, scaffold-control, decision-control, validation-control, and
runtime implementation work must happen in separate implementation/control PRs
with explicit scope and validation.

Green CI does not approve a mixed-scope PR. If a PR contains ticket-pack
planning plus implementation/control changes, quarantine, split, or replace it
before treating it as planning or execution authority.

---

## Five Production Ticket Gates

Every production implementation ticket pack must pass these gates before any
ticket is considered executable-review-ready.

1. Decision closure.
   All human decisions, blocker registry entries, architecture choices, service
   boundaries, permissions, schema/API questions, ADL interpretations, and
   business rules are resolved with committed source authority or remain
   explicitly blocked.

2. Ticketability matrix.
   Each candidate maps source authority, exact runtime surface, expected files,
   dependency tickets, blockers, runtime behavior, MCR, validation commands,
   and stop conditions against current repo HEAD.

3. Ticket generation by runtime capability slice.
   Tickets are generated around executable runtime capability ownership, not
   lifecycle row count, artifact count, seed count, or queue-size anxiety.

4. Ticket quality audit.
   Fail any ticket with vague scope, hidden decisions, unresolved dependencies,
   documentation-only MCR, overlapping file ownership, weak validation, or
   missing stop conditions.

5. Freshness check at execution time.
   Re-check the ticket against current repo HEAD immediately before execution.
   If files moved, dependencies changed, blockers changed, validation changed,
   or repo truth changed, refresh the ticket before implementation. If the
   refresh requires a decision, stop for human review.

---

## Blocked Means Blocked

Any unresolved blocker prevents executable-ticket promotion.

This includes:

- unresolved human decision;
- missing exact file ownership;
- missing runtime MCR;
- missing validation command;
- missing schema/API/service boundary;
- missing permission or manifest authority;
- missing source authority;
- hidden architecture or business decision;
- ambiguous ADL behavior;
- stale repo reference;
- dependency ticket not accepted;
- control implementation required but not yet merged.

The correct output is a blocked ticket candidate, blocker registry entry,
decision-control ticket, schema-control ticket, scaffold-control ticket, or
validation-control ticket. The wrong output is optimistic implementation-ticket
generation.

Blocker identity is first-class. Every blocked candidate must reference blocker
IDs or explicit missing repo truth. No manual-review state may hide inside a
READY status.

---

## What "Stale Ticket" Means

A ticket is stale when any of the following are true at execution time:

| # | Staleness condition | Example |
|---|---|---|
| 1 | Scope references a file changed since the ticket was written | files_expected_to_change lists a file restructured by a prior ticket |
| 2 | A dependency is missing | Foundry install ticket with no dependency on Gatekeeper preflight ticket |
| 3 | A decision was not made — asks Codex to choose between architectures | "Implement tenant isolation using either service-level or DB-level RLS" |
| 4 | Scope is vague — Codex must guess what done looks like | Objective: "Improve tenant handling" |
| 5 | MCR is documentation only | MCR: "Foundry service documented" |
| 6 | Duplicates another ticket's file ownership | Two tickets both claim to write gatekeeper-preflight.service.ts |
| 7 | Scope exceeds what one commit can express | One ticket creates Gatekeeper, Foundry manifest validation, install, and registry |
| 8 | Repo moved forward but ticket was not updated | Ticket references a file renamed in a previous phase |
| 9 | Stop condition is missing | No stop condition for Prisma schema changes |
| 10 | Forces Codex to invent a rule not in any committed source document | "Apply the appropriate security pattern for this service" |

The fix for every staleness condition: write the ticket more precisely, not shorter.

---

## What "Maximum Concrete Implementation" Means

Every ticket exhausts all work that can be safely and correctly done
within its approved scope boundary and stops exactly there.

It does NOT mean adding adjacent scope, doing future-phase work, or
building more than one architectural surface.

It DOES mean:
- Every file within scope is fully implemented, not partially
- Every test case within scope is written, not deferred
- Every validation command within scope is run and passing
- Every edge case within scope is handled, not left as TODO
- The MCR is met completely, not approximately

Bad: A Gatekeeper decision API ticket that implements the route but leaves
STOP_FOR_REVIEW as a TODO, then marks the ticket done.

Good: A Gatekeeper decision API ticket that implements all four verdicts
(ALLOW, DENY, APPROVAL_REQUIRED, STOP_FOR_REVIEW), writes tests for all four,
runs pnpm test, and produces evidence that all four paths are exercised.

---

## The MCR Standard

The MCR must name one of the following. It must never be documentation alone.

| Accepted MCR type | Example |
|---|---|
| Runtime behavior with observable output | GET /platform/access/me returns { actor_id, display_name, capabilities[] } with status 200 for an authenticated session |
| CI command that must pass | pnpm test --filter api passes the Gatekeeper preflight test suite including STOP_FOR_REVIEW path |
| Named artifact proving the feature exists | platform.shell.access is seeded in access_capabilities for org test-org-001 and returned by GET /access/capabilities |
| Negative test that must pass | GET /platform/leads with Tenant B session returns 0 results when all leads belong to Tenant A |
| Measured target with threshold | PostgreSQL FTS returns results with p95 < 200ms under a 10,000-record fixture |

Forbidden MCR patterns:
"Service documented."
"File created."
"Service exists."
"Implementation improved."
"Foundry updated."
"Tenant isolation improved."
"Policy applied."

None of those can be verified by running a command.

---

## The 10 Split Conditions

Split a ticket when ANY of these are true.

| # | Split condition | Test question |
|---|---|---|
| 1 | Owns more than one architectural decision | Does completing this require choosing between designs in two different areas? |
| 2 | Creates more than one runtime subsystem | Does this add more than one NestJS module/service/controller pair? |
| 3 | Mixes policy interpretation with runtime implementation | Does this both decide what a policy means AND write enforcement code? |
| 4 | Mixes backend + frontend + database + CI without a contract boundary | Does this write schema migrations AND frontend components AND API routes AND CI validators? |
| 5 | Changes schema/contracts AND runtime code without a narrow reason | Could the schema change be its own ticket? |
| 6 | Spans unrelated validation ladders | Would validation for part A and part B have nothing in common? |
| 7 | Creates overlapping ownership with another ticket | Does another queue ticket also write to the same files? |
| 8 | Would be hard to review as one commit | Would a reviewer need to context-switch between unrelated concerns? |
| 9 | Hides a major dependency behind vague wording | Does this say "after the relevant service exists" without naming which ticket creates it? |
| 10 | Would force Codex to invent decisions during execution | Would Codex need to make an architectural choice not in any committed document? |

---

## What Is Never a Split Condition
The phase has many tickets.
The queue feels long.
The task will take more than one hour.
Codex might lose context.
Humans feel anxious about scale.
The ticket touches many files within a single owned surface.
The ticket has a long validation ladder.

The queue length is not the variable. The ticket quality is the variable.

---

## Required Ticket Fields

Every ticket must contain all of these. A ticket pack missing any of these
fields is rejected before Codex execution begins.
ticket_id, title, type, priority, objective, scope, non_scope,
source_files_to_inspect, files_expected_to_change, files_forbidden_to_change,
required_outputs, evidence_artifacts, tests_required, validation_commands,
stop_conditions, acceptance_criteria, dependencies, commit_message,
rollback_notes, exact_file_plan_required: true,
broad_globs_are_inspection_hints_only: true, conditional_replan_required,
stale_ticket_risk_notes, runtime_consistency_chain,
minimum_concrete_requirement, split_if, requires_human_approval_if,
failure_classification

Decision/ADR tickets must also include:
decision_options, selection_criteria, decision_output_path

## Required Production Ticket Structure

For production-grade implementation tickets, the required fields above must
also be expressed in an execution-friendly structure containing:

ticket_id, title, objective, source_authority_chain, approved_scope, non_scope,
exact_files_expected_to_change, files_forbidden_to_change, dependency_tickets,
blocker_registry_references, runtime_behavior_to_implement,
maximum_concrete_capability_statement, minimum_concrete_requirement,
validation_commands, expected_validation_evidence, stale_ticket_risk_notes,
stop_conditions, requires_human_approval_if, handoff_notes

These fields do not replace the existing required fields. They clarify the
minimum production-ticket shape needed to prevent vague, stale, or invented
implementation.

## Forbidden Ticket Language

Executable implementation scope must not contain vague instruction phrases.
Fail the ticket if implementation scope, MCR, validation, or acceptance criteria
use phrases such as:

- "wire as needed";
- "relevant service";
- "appropriate validation";
- "future implementation";
- "documented";
- "integrate where needed";
- "use existing patterns" without naming exact files or patterns.

These phrases may appear only in blocker notes or stale-risk notes where they
describe why a candidate is not executable yet.

---

## Required Stop Conditions

Every implementation ticket must include these five:

1. Stop if exact-file plan reveals work requires files_forbidden_to_change.
2. Stop if the ticket cannot be completed without making an architectural
   decision not present in any committed source document.
3. Stop if validation fails after 3 bounded repair attempts.
4. Stop if work drifts into runtime / Foundry / module installer /
   business modules / production auth / deployment / secrets /
   destructive migrations without explicit ticket authority.
5. Stop if a Prisma schema migration is required but not authorized
   in files_expected_to_change.

---

## The Three Roles — Never Mixed

| Role | Actor | Output | Failure when mixed |
|---|---|---|
| Discovery | Claude + repo inspection | Options and evidence — not decisions | Codex inventing options during execution |
| Decision | Human | Locked decisions in ADRs, policies, plans | Decisions made in chat, never committed |
| Execution | Codex | Code, migrations, tests committed to branch | Planning mixed with coding in same session |

---

## Enforcement

At ticket pack review: every ticket pack reviewed against this doctrine before
Codex begins. Violations corrected before execution starts.

At GATE ticket: validates no ticket produced shallow or documentation-only output.

At autonomous execution: these two enforcing lines appear at the top of every
ticket pack prompt:
Implementation is not stale by itself. Tickets become stale.
Apply maximum concrete capability within the approved scope of each ticket.

---

## Authority

This document supersedes any conversational instruction that contradicts it.
It does not supersede ADR-0001's source-of-truth hierarchy.
Prisma, packages/contracts, module manifests, generated registry, and ADRs
remain above this doctrine in conflict resolution.

This doctrine governs HOW tickets are written and executed.
The source-of-truth hierarchy governs WHAT the implementation must produce.
