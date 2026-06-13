---
company: HAUTM
platform: Esbla Spark
author: Usman Hussain
owner: Usman Hussain
suite_version: v5.0
file_version: v1.0
created: 2026-06-13
last_updated: 2026-06-13
status: authoritative
document_type: suite_manifest
scope: Inventory, authority order, supersessions, execution sequence, and continuity bridge for documentation suite v5.0.
title: Esbla Spark — Documentation Suite v5.0 Manifest v1
ratifier: Usman Hussain
---

# Esbla Spark — Documentation Suite v5.0 Manifest v1

**Target repo path:** `docs/ratification/esbla_spark_v5_0/esbla_docs_suite_v5_manifest_v1.md`
**Role:** this manifest is the **source-of-truth bridge** for the v4.1 → v5.0 transition (Blueprint v3.1, Part 0.3). v5.0 is the **suite** version; each document keeps its own file_version per the metadata standard.

## 1. Suite inventory

| Document | File (outputs → target path) | file_version | Status on ratification |
|---|---|---|---|
| Blueprint Master Plan | `esbla_spark_blueprint_master_plan_v3_1.md` → `docs/blueprints/current/` | v3.1 | authoritative |
| Global Business Logic | `esbla_business_logic_v2.md` → `docs/doctrine/current/` | v2.0 | authoritative |
| Business Logic v2 Carry-Forward Appendix | `esbla_business_logic_v2_appendix_a_carried_forward_v4_rules.md` → `docs/doctrine/current/` | v1.0 | authoritative |
| File Metadata Standard | `esbla_file_metadata_standard_v1.md` → `docs/standards/current/` | v1.0 | authoritative |
| Rebaseline Refactor Plan (AKTI→Esbla) | `esbla_rebaseline_refactor_plan_v1.md` → `docs/process/active/` | v1.0 | active |
| Phase 6A–6C Consolidated Amendment | `esbla_phase_6a_6c_consolidated_amendment_v1.md` → `docs/process/phases/cross_phase/` | v1.0 | active |
| Phase 6D Learning Plan | `esbla_phase_6d_learning_v2.md` → `docs/process/phases/phase_06d_learning/plan/` | v2.0 | active |
| Phase 6E Growth Surface Plan | `esbla_phase_6e_growth_surface_v2.md` → `docs/process/phases/phase_06e_growth_surface/plan/` | v2.0 | active |
| Phase 6F Intelligence/Admin/Design Plan | `esbla_phase_6f_intelligence_admin_design_v2.md` → `docs/process/phases/phase_06f_intelligence_admin_design/plan/` | v2.0 | active |
| This manifest | `esbla_docs_suite_v5_manifest_v1.md` → `docs/ratification/esbla_spark_v5_0/` | v1.0 | authoritative |

Carried forward under a v5.0 transition exception: the Failure Prevention / Codex Operating Doctrine JSON, the Ticket Quality Doctrine, AGENTS.md, and the subsurface decomposition guide. Stage 0 Wave 3-4 transition work records Esbla successor shells and transition metadata where authorized, while AGENTS.md and legacy operative sources remain temporarily active until a separate operating-guide transition PR promotes, renames, replaces, or classifies them historical.

## 2. Supersession table

| Superseded artifact | Superseded by | New status |
|---|---|---|
| Blueprint v1, v2, v3 (`esbla_spark_blueprint_master_plan_v1/v2/v3.md`) | Blueprint v3.1 | historical (→ `docs/blueprints/legacy/`) |
| `esbla_spark_master_plan_v1.md` (strategic master plan) | Blueprint v3.1 (strategy absorbed) | historical |
| `0_business_logic.md` (Spark Platform v4 Global Business Logic) | Business Logic v2 + carry-forward appendix | historical evidence only |
| `business_logic_v4_amendments_v1.md` (48 items) | Business Logic v2 §12 disposition | superseded in full |
| `phase_6a_amendments_v1.md`, `phase_6b_amendments_v1.md`, `phase_6c_amendments_v1.md` | Consolidated Amendment v1 | superseded in full |
| `phase_6d/6e/6f_amendments_v1.md` and v4.1 `6d/6e/6f` phase docs | Phase 6D/6E/6F v2 plans | superseded / historical (catalogs carried by incorporation) |

**Not superseded:** all closed-run artifacts (6A/6B/6C catalogs, edges, seeds, FFETs, closure and audit records) — historical baseline of record, never edited.

## 3. Authority order (restated from Blueprint 0.3)

Future intended doctrine order: law > participant contracts > Blueprint v3.1 > Business Logic v2 > phase plans/amendments > implementation. Current executable repo truth remains Prisma, contracts, manifests, generated registry, accepted ADRs, active controls, tests, and validation evidence until doc-as-SOT activation after Phase 6F closure. Codex never implements from the blueprint directly — only from phase artifacts. Conflicts become ADRs, control amendments, migration tickets, or blocked items. Governed operational thresholds live only in Blueprint Appendix A; exempt dates, versions, phase numbers, document versions, section numbers, examples, and non-governed explanatory counts may appear inline.

## 4. Codex execution sequence

**Continuity precondition (binding):** Phase 6C seed FFETs are complete on current main. Refactor Wave 0 still records closure verification from git history, final SHA, PRs, and validation evidence before any runtime, filename, package, contract, or active-process refactor wave begins. Drafting and ratification package assembly may proceed in `docs/ratification` or draft/import paths before closure recording; runtime, contract, active-process, and filename-refactor waves wait for explicit Wave 0 closure verification.

- **Stage 0 — Rebaseline.** Refactor Waves 0–5 + metadata standard adoption + registries. (Waves 1–2 docs-only; Waves 3–5 runtime/filenames after closure verification.)
- **Stage 1 — 6A–6C amendments.** Consolidated Amendment §§2–4 through the standard pipeline (decision register → ratify → catalog/extraction/fidelity/seeds → FFETs → Gate-2 audits → **Gate-3 human**).
- **Stage 2 — 6A–6C runtime wiring.** Amendment §5: RI-FFET pack against the amended substrate; falsifiable demo script (positive + negative tests) green in CI is the definition of done.
- **Stage 3 — Phase 6D.** Full pipeline per its v2 plan, **wiring inside the phase** (plan §3).
- **Stage 4 — Phase 6E.** Same in-phase wiring rule.
- **Stage 5 — Phase 6F.** Same; exit hands off the **foundations transition**: doc-as-SOT activation under XIII.4 safeguards, validation sprint (Blueprint X.2) under pilot terms, then Phase 7 wedge planning.

There is **no separate wiring stage after 6C** — 6D/6E/6F each contain their own wiring; this is the single most important sequencing change of v5.0.

## 5. Ratification

Per Blueprint 0.2: `RATIFICATION_Esbla_Spark_v5_0.md` + `decision_record_v5_0.json` (doc IDs, file_versions, content hashes, date, Ratifier: **Usman Hussain**, three-AI stress-test links, external-review status, outstanding conditions), merged by PR. Three-AI review is stress-test, not governance. On ratification, statuses flip per the inventory table; counsel-gated items (XIII.1 categories) gate **public activation** of their capabilities, not suite ratification.

## 6. Declined review items (logged, with reasons)

1. **Rename the blueprint file to v5.0** — declined; founder ruling: v5.0 is the suite version, the blueprint remains file_version v3.1. The metadata standard's suite/file split is the permanent fix.
2. **Renumber post-6F phases** — accepted for v5. Phase 7 = Website Builder / Agency Handoff; Phase 8 = App Builder; Phase 9 = Marketplace / Trust Layer. Marketplace was renumbered from Phase 10 to close the post-6F sequence gap; there is no Phase 10.
3. **Three separate per-phase 6A–6C amendment files** — consolidated per founder ruling; section boundaries are split-ready if Codex prefers per-phase files at Wave 2.

End of suite manifest v1.
