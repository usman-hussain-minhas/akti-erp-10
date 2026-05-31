# Spark Platform Build v2 train_4_l13_l17 Control Plan v1

Status: TRAIN_4_CONTROL_PLAN_READY_FOR_REVIEW

## 1. Purpose

Define preplanning control boundaries for train_4_l13_l17. This plan does not authorize execution.

## 2. Source-of-Truth Hierarchy

- AGENTS.md
- docs/doctrine/AKTI_ERP_Ticket_Quality_Doctrine_v1.md
- docs/doctrine/AKTI_ERP_Failure_Prevention_Codex_Operating_Doctrine_v1.json
- docs/process/core/v0_0_2/spark_plan_v2.md
- docs/process/core/v0_0_2/spark_adl_complete.md
- docs/process/core/v0_0_2/spark_platform_build_v2_phase_intent_packet.json
- docs/process/core/v0_0_2/spark_platform_build_v2_human_decisions_v1.md

## 3. Train Boundary

train_4_l13_l17 covers level_13 (Campaigns), level_14 (E-Commerce), level_15 (Website and App Builder), level_16 (AI Business Consultant), level_17 (Admin, Onboarding, and Support) only.

## 4. Included Levels

- level_13: Campaigns
- level_14: E-Commerce
- level_15: Website and App Builder
- level_16: AI Business Consultant
- level_17: Admin, Onboarding, and Support

## 5. Excluded Levels

- level_1 (train_1_l1_l4)
- level_2 (train_1_l1_l4)
- level_3 (train_1_l1_l4)
- level_4 (train_1_l1_l4)
- level_5 (train_2_l5)
- level_6 (train_3_l6_l12)
- level_7 (train_3_l6_l12)
- level_8 (train_3_l6_l12)
- level_9 (train_3_l6_l12)
- level_10 (train_3_l6_l12)
- level_11 (train_3_l6_l12)
- level_12 (train_3_l6_l12)
- level_18 (train_5_l18)

## 6. Dependency Ordering

- Train 1 completed and merged
- Train 2 completed and merged
- Train 3 completed and merged
- Repo refresh after Train 3

## 7. ADL Constraints

- No train-specific ADL constraints beyond source-of-truth and lower-train dependency review.

## 8. Existing Lower-Level Assumptions

Lower trains named in dependencies must be merged and refreshed before execution. Draft future packs require staleness scan and dependency refresh.

## 9. Expected Output Categories

Control plan, gate, seed matrix, seed audit, ticket pack, ticket-pack audit, and manual review summary.

## 10. Validation Ladder Families

Path policy, contract validation, lint, typecheck, targeted tests, runtime startup/health/smoke verification where runtime boundaries are touched.

## 11. Runtime Validation Triggers

Runtime validation is required for module wiring, framework module change, route/API behavior, provider boundary, storage behavior, event processing, auth/session behavior, or frontend route behavior.

## 12. Evidence Artifact Policy

Every future ticket must name ticket-local evidence under ignored codex-review or committed validation artifacts. Evidence paths are planning references until execution.

## 13. Ticket Quality Rules

Implementation is not stale by itself. Tickets become stale.

Apply maximum concrete capability within the approved scope of each ticket.

## 14. Split Rules

Split only by doctrine split conditions: multiple architectural decisions, multiple runtime subsystems, unrelated validation ladders, overlapping file ownership, policy interpretation mixed with implementation, or unreadable review scope.

## 15. Gate Model: PASS/WARN/STOP

PASS means no blockers. WARN means named non-blocking risk requiring manual review. STOP means do not proceed.

## 16. Stop Conditions

Stop for source conflict, train-boundary leakage, production deployment requirement, production sensitive value requirement, dependency ambiguity, unresolved ADL, runtime/frontend/backend/schema/package work outside future ticket authority, or ticket execution attempt.

## 17. Next Artifact After This Plan

Seed matrix only.
