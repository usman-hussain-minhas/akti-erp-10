# Spark Platform Build v2 Human Decisions v1

Status: ACCEPTED_FOR_GENESIS_LIFECYCLE_PLANNING

## Purpose

This document records the human-confirmed decisions that govern Spark Genesis lifecycle planning for AKTI Spark Platform Build v2 in `core/v0_0_2`.

Spark Genesis informs readiness and risk. Genesis does not own product/architecture/train decisions. Human confirms.

## Accepted Decisions

1. Execution train model = level-bounded sequential autonomous trains.
2. First train = Train 1, Levels 1–4.
3. Plan files committed to repo = yes.
4. Intent packet path = `docs/process/core/v0_0_2/spark_platform_build_v2_phase_intent_packet.json`.
5. Cloud vendor for Train 1 planning = AWS EKS.
6. Production deployment = locked out until explicit human approval.
7. Desktop/mobile/P2P = deferred until cloud stable and beta tested.
8. Readiness threshold = PASS proceed, WARN proceed only with explicit risk acceptance, STOP no-go.

## Confirmed Execution Trains

| Train | Levels | Label | Current authorization |
| --- | --- | --- | --- |
| Train 1 | Level 1–4 | Infrastructure + Storage/Auth/Platform Services foundation | Planning/control package may proceed after PR #38 correction. |
| Train 2 | Level 5 | Configuration Engine / Foundry | Future only; no ticket generation yet. |
| Train 3 | Level 6–12 | Products, CRM, Finance, HR, Workspace, LMS, Events | Future only; no ticket generation yet. |
| Train 4 | Level 13–17 | Campaigns, E-Commerce, Website/App Builder, AI Consultant, Admin/Support | Future only; no ticket generation yet. |
| Train 5 | Level 18 | Design System and Frontend | Future only; no ticket generation yet. |

## Ticket Quality Doctrine Enforcement

Implementation is not stale by itself. Tickets become stale.

Apply maximum concrete capability within the approved scope of each ticket.

Long autonomous runs are allowed when tickets are repo-grounded, ordered, precise, non-overlapping, and validated. Ticket count, queue length, long validation ladders, and Codex anxiety about scale are not split conditions. Split only by the doctrine split conditions.

## Current Boundary

Train 1 Levels 1–4 is the first execution-train candidate after Genesis lifecycle planning review. This decision does not authorize ticket creation, seed matrix creation, production deployment, production secrets access, implementation work, or Train 2+ ticket generation.

Train 2 through Train 5 are future candidates only. They require separate human review and approval after Train 1 control outputs, audited ticket pack, and readiness review are accepted.

## Full Train 1-5 Preplanning v3 Decision

Status: FULL_TRAIN_PREPLANNING_V3_AUTHORIZED_FOR_PREPLANNING_ONLY

Full Train 1-5 preplanning v3 is authorized as preplanning only. It supersedes PR #39 and PR #40 for review purposes. PR #39 remains open as under-decomposition failure evidence. PR #40 remains open as ticket-quality and executability failure evidence. Ticket packs and audits may be created for Train 1 through Train 5. No train is authorized for execution. Predictive stop analysis is not authorized. Autonomous readiness is not authorized. Execution prompts are not authorized.

Before any train executes, it requires repo refresh, staleness scan, dependency refresh, ticket-pack re-audit, scale-decomposition audit, ticket-quality gate, predictive stop analysis, autonomous readiness, and explicit human approval.

Implementation is not stale by itself. Tickets become stale.

Apply maximum concrete capability within the approved scope of each ticket.
