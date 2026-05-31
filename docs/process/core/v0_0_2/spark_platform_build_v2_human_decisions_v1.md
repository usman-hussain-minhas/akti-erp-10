# Spark Platform Build v2 Human Decisions v1

Status: ACCEPTED_FOR_GENESIS_LIFECYCLE_PLANNING

## Purpose

This document records the human-confirmed decisions that govern Spark Genesis lifecycle planning for AKTI Spark Platform Build v2 in `core/v0_0_2`.

Spark Genesis informs readiness and risk. Genesis does not own product/architecture/train decisions. Human confirms.

## Accepted Decisions

1. Execution train model = level-bounded sequential autonomous trains.
2. First train = Level 1 only.
3. Plan files committed to repo = yes.
4. Intent packet path = `docs/process/core/v0_0_2/spark_platform_build_v2_phase_intent_packet.json`.
5. Cloud vendor for Level 1 planning = AWS EKS.
6. Production deployment = locked out until explicit human approval.
7. Desktop/mobile/P2P = deferred until cloud stable and beta tested.
8. Readiness threshold = PASS proceed, WARN proceed only with explicit risk acceptance, STOP no-go.

## Ticket Quality Doctrine Enforcement

Implementation is not stale by itself. Tickets become stale.

Apply maximum concrete capability within the approved scope of each ticket.

Long autonomous runs are allowed when tickets are repo-grounded, ordered, precise, non-overlapping, and validated. Ticket count, queue length, long validation ladders, and Codex anxiety about scale are not split conditions. Split only by the doctrine split conditions.

## Current Boundary

Level 1 cloud infrastructure and deployment is the first execution train candidate after Genesis lifecycle planning review. This decision does not authorize Level 1 ticket creation, seed matrix creation, production deployment, production secrets access, or implementation work.

Level 2 and later trains are future candidates only. They require separate human review and approval after Level 1 control outputs and readiness are accepted.
