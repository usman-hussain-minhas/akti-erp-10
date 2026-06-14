---
company: HAUTM
platform: Esbla Spark
author: Usman Hussain
owner: Usman Hussain
suite_version: v5.0
file_version: v1.0
created: 2026-06-14
last_updated: 2026-06-14
status: for_ratification
document_type: ffet_registry
scope: Human-readable FFET registry for 6.5B Canonical Configuration and Change Pipeline.
title: 6.5B Composer FFET Registry v1
---


# 6.5B Composer FFET Registry v1

## Summary

Canonical Configuration and Change Pipeline: Canonical configuration, composition versions, proposal object, risk classification, one change pipeline.

All execution flags are false. Each FFET must apply maximum concrete capability inside exact files only.

| FFET | Slug | Maximum concrete capability | MCR |
|---|---|---|---|
| `P65B-FFET-001` | `composition_artifact_contracts` | Create concrete Composition and CompositionVersion contracts with immutable published versions and draft/version statuses. | contracts:validate proves composition schemas, version statuses, and symbolic reference boundaries. |
| `P65B-FFET-002` | `universal_change_proposal_contract` | Define the proposal object used by manual, AI, import, template, and support faces. | Every proposal records source, risk floor, actor, provenance, impact preview requirement, and evidence target. |
| `P65B-FFET-003` | `one_change_pipeline_runtime` | Implement the canonical pipeline service that all six faces must use for configuration mutation. | API tests prove settings, canvas, wizard, AI diff, import, and support paths call the same pipeline entrypoint. |
| `P65B-FFET-004` | `risk_floor_classifier` | Implement deterministic risk-floor classification for Low, Medium, High, and Critical changes. | Tests prove AI or humans may escalate but cannot lower deterministic risk floor. |
| `P65B-FFET-005` | `versioned_change_graph_and_provenance` | Record versioned change graph edges and no-hidden-decision provenance for every accepted proposal. | Tests prove proposal-to-version lineage is replayable and exported as evidence. |
| `P65B-FFET-006` | `super_admin_pipeline_bound_support_face` | Enforce that Super Admin support edits are read-mostly and pipeline-bound for any write. | Negative test proves direct support-surface config write is rejected. |
