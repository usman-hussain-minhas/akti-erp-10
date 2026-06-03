# Phase Zero-Trust Mechanical Audit v1

Status: ACTIVE_REUSABLE_PHASE_LIFECYCLE_GATE

## Purpose

This document defines the reusable Phase zero-trust mechanical audit script for AKTI Spark phase lifecycle planning. The script persists the Phase 6A mechanical audit framework as a repository-owned validation tool so future Phase 6B-6F lifecycle work can run the same checks without relying on temporary `/tmp` scripts or pasted summaries.

The script is not a ticket generator. It does not authorize execution, predictive stop analysis, autonomous readiness, execution prompts, or ticket execution.

Failed mechanical audit blocks ticket-pack planning.

## Command Syntax

Run from the repository root:

```bash
node scripts/quality/check_phase_zero_trust_mechanical_audit.mjs \
  --phase-root docs/process/v4_1/phase_6a \
  --phase 6a
```

Optional arguments:

```bash
--json
--strict
```

The script outputs a JSON summary with `phase`, `phase_root`, `counts`, `category_status`, `assertions`, and `overall`.

Exit codes:

```text
0 = PASS
1 = audit findings
2 = usage, missing file, or JSON parse error
```

## Expected Phase Folder Shape

The phase root must contain:

```text
source_coverage_matrix_v1.json
subsurface_catalog_v1.json
dependency_extraction_matrix_v1.json
dependency_fidelity_matrix_v1.json
execution_seed_matrix_v1.json
dependency_extraction_audit_v1.md
dependency_fidelity_audit_v1.md
execution_seed_matrix_audit_v1.md
subsurface_catalog_audit_v1.md
readiness_report_v1.md
zero_trust_gate_summary_v1.md
```

## Categories A-E Summary

Category A - Field-schema consistency:

- Seed-local dependency edges use `seed_id`, never `target_seed_id`.
- Top-level seed dependencies exactly match `akti_local.dependency_edges[].seed_id`.
- `manifest_required=false` sub-surfaces have empty `manifest_traceability_targets`.
- `manifest_required=true` seeds depend on `seed_<phase>_service_manifest_contract`, except the service manifest contract seed itself.

Category B - Dependency chain integrity:

- DFS cycle detection must pass.
- Extraction hard edges must match top-level seed dependencies bidirectionally.
- Same-component dependencies must not point forward in catalog order.

Category C - Semantic field quality:

- Source coverage rows must not use generic `Flags align` rationale.
- Root seeds must not use generic upstream dependency boilerplate.
- ADL prose in extraction edges must match structured `adl_refs`.
- Optional dependencies must be represented by soft, conditional, deferred, or manual-review extraction edges.
- Hard dependencies must use an approved `hard_dependency_basis`.

Category D - Count consistency:

- Audit documents must report live JSON counts.
- Readiness and gate summaries must report current root seed count and root list or root-count change context.
- Manifest traceability counts must be internally consistent.

Category E - Inheritance trace completeness:

- Split-child seeds with parent required dependencies must include `akti_local.parent_required_dependency_trace`.
- Inherited traces must point to real top-level dependencies, anchor-child traces must resolve to existing seeds, and every trace must include a reason.

## Mandatory Future Lifecycle Gate

Every future Phase 6B-6F lifecycle must run this script after each execution seed matrix is created and before readiness is considered final.

The script is a mechanical validation gate only. It does not create source coverage, catalogs, dependency matrices, seed matrices, readiness reports, ticket packs, predictive stop analysis, autonomous readiness, execution prompts, or tickets.

If the script fails, ticket-pack planning is blocked until the failing phase lifecycle artifacts are repaired and the script passes.

## Sequential File-by-File Lifecycle Rule

For Phase 6B-6F, Codex must process lifecycle artifacts sequentially, one file/stage at a time:

1. create source_coverage_matrix
2. audit it
3. self-heal only that file if needed
4. re-audit
5. move to next file only when current file passes
6. repeat for sub-surface catalog
7. repeat for dependency extraction matrix
8. repeat for dependency fidelity matrix
9. repeat for execution seed matrix
10. then create gate summary and readiness report

Do not create all files first and audit at the end.

Do not self-heal downstream files before upstream file passes.

If a downstream audit reveals upstream defect, return to upstream file, patch, re-audit, then regenerate downstream files.
