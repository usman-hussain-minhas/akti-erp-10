# AKTI ERP Spark Genesis Adoption v1

## Status

SPARK_GENESIS_ADOPTED_FOR_PHASE_5C_PLANNING_GATES

## Purpose

Spark Genesis will be used as a lightweight audit/planning aid before Phase 5C planning, ticketing, and execution.

It does not replace:

- AKTI source-of-truth hierarchy
- human product judgment
- architecture approval
- screen contracts
- ticket packs
- tests
- validation evidence

## What Spark Genesis Will Be Used For

- Phase 5C readiness audit
- Visual direction / screen-contract audit
- Component/API map audit
- Phase 5C ticket-pack audit
- dependency graph and gate closure checks
- predictive stop analysis
- post-run learning filter

## What Spark Genesis Will Not Do

- no Phase 5C implementation
- no business-module creation
- no architecture decisions
- no automatic code changes
- no source-of-truth override
- no plugin/MCP/installer requirement
- no production secrets/deployment
- no fake dashboards or fake module cards

## Recommended Phase 5C Gate Sequence

```text
1. Use Spark Genesis to audit Phase 5C readiness.
2. Create Phase 5C Visual Direction document.
3. Create Phase 5C Screen Contracts document.
4. Create Phase 5C Component/API Map.
5. Use Spark Genesis to audit those docs.
6. Create Phase 5C ticket seed matrix.
7. Create Phase 5C ticket pack.
8. Use Spark Genesis to audit ticket pack and dependency graph.
9. Run predictive stop analysis.
10. Human approve.
11. Execute Phase 5C.
12. Use Spark Genesis post-run learning filter.
```

## Phase 5C Risks Spark Genesis Must Check

- fake dashboard risk
- fake module card risk
- CRM technical rename risk
- `lead-desk` route/file/API/model rename risk
- Phase 6 leakage
- white-label upload/write overreach
- settings/diagnostics treated as apps
- missing screen contracts
- missing component contracts
- missing component/API map
- search scope expansion
- notification/status/data-controls fake surface risk
- dependency graph/gate closure issues

## Current Adoption Path

Skill path:

```text
/Volumes/UsmanWork/Spark Genesis/skills/spark-genesis/SKILL.md
```

Current version:

```text
0.2.0
```
