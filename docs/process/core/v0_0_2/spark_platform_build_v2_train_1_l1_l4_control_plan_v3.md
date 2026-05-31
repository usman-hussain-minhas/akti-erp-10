# Spark Platform Build v2 train_1_l1_l4 Control Plan v3

Status: PREPLANNING_TICKET_PACK_READY_FOR_MANUAL_REVIEW

Implementation is not stale by itself. Tickets become stale.

Apply maximum concrete capability within the approved scope of each ticket.

## Purpose

This control plan defines preplanning scope for Levels 1-4 infrastructure, storage, identity, and services. It informs manual review only and does not authorize execution.

## Scope

- Train: train_1_l1_l4
- Levels: level_1, level_2, level_3, level_4
- Ticket count planned: 61
- Scale floor: 52
- Scale thresholds are floors, not exact targets.
- No filler tickets are allowed.
- No boilerplate tickets are allowed.

## Gate Rules

- scale_decomposition_audit must be PASS or WARN without STOP before ticket-pack audit can pass.
- ticket_quality_gate must be PASS or WARN without STOP before ticket-pack audit can pass.
- STOP findings from TSA, EFO, MCR, RRC, VRA, TPA, SIA, CPA, ACA, EAA, TSV, CFP, SAG, ADT are hard blockers.
- Predictive stop analysis was not run.
- Autonomous readiness was not run.
- Execution was not run.

## Repo-Plausible Path Policy

Existing executable domains used for future paths: apps/api/src, apps/web, packages/contracts, prisma, prisma/migrations, scripts, .github/workflows. Absent domains are infra, tools, packages/ui. Future paths under absent domains require this control plan to justify them.


## Planned New Domain Justification

`infra/terraform/aws_eks/` is absent today and is planned only by Train 1 tickets that own AWS EKS and Cloudflare infrastructure scaffolding. No tracked infra files are created by this PR; the path appears only as future ticket ownership.

## Frontend or Screen Contract Rule

frontend_or_screen_contract_when_applicable = not_applicable_for_this_train_except_future_screen_contract_references

## Level Counts

- level_1: 14 tickets; floor 12
- level_2: 14 tickets; floor 12
- level_3: 14 tickets; floor 12
- level_4: 19 tickets; floor 16

## Stop Conditions

- Stop if a ticket requires runtime/frontend/backend/schema/generated/package/lockfile tracked changes in this PR.
- Stop if scale_decomposition_audit returns STOP.
- Stop if ticket_quality_gate returns STOP.
- Stop if a ticket crosses train boundaries without documented dependency authority.
- Stop if any ticket requires predictive stop analysis, autonomous readiness, execution prompt creation, or execution.
