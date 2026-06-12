---
company: HAUTM
platform: Esbla Spark
author: Usman Hussain
owner: Usman Hussain
suite_version: v5.0
file_version: v1.0
created: 2026-06-13
last_updated: 2026-06-13
status: for_ratification
document_type: refactor_plan
scope: Wave-based AKTI→Esbla identity, repository-architecture, and metadata rebaseline plan (Codex Stage 0).
title: Esbla Spark — Rebaseline Refactor Plan v1 (AKTI → Esbla)
ratifier: Usman Hussain
---

# Esbla Spark — Rebaseline Refactor Plan v1 (AKTI → Esbla)

**Target repo path:** `docs/process/active/esbla_rebaseline_refactor_plan_v1.md`
**Execution stage:** Codex **Stage 0** — runs before the 6A–6C amendment work.
**Nature:** This is an identity, doctrine-authority, repository-architecture, and metadata rebaseline — **not a blind search-and-replace**. One giant rename PR is prohibited; the plan executes in waves, each with its own inventory, exact-file plan, and validation gate, per the standing FFET exact-file methodology.

## 1. Binding preconditions

1. **Phase 6C closure first.** Phase 6C seed FFETs are complete on current `main`; Wave 0 records closure verification from git history, PRs, final SHA, FFET count, validation ladder, and audit package before any runtime, filename, package, contract, or active-process refactor wave begins. Drafting and ratification package assembly may proceed in docs-only paths before Wave 0 closure recording. The accepted 6C run contract remains historical execution evidence, not active doctrine, after closure verification.
2. **Identity lock** per the File Metadata Standard v1 (HAUTM / Esbla Spark / Usman Hussain; no AI attribution).
3. **Legal gate:** the AKTI IP/partnership counsel check (Blueprint XIII.3 gate) completes before any **public** marketing under the Esbla name. The internal rename does not wait for it; public use does.
4. **History is immutable:** git history is never rewritten; historical files are archived (moved with `status: historical`), never edited. A correction to a historical record requires its own explicitly-targeted PR.

## 2. Classification taxonomy

Wave 0 classifies every AKTI-reference hit into exactly one class. During Waves 1-2, legacy-named operating files remain temporarily active under a transition exception; Waves 3-4 must rename them, replace them with Esbla-named successors, or classify them historical and update AGENTS.md accordingly:

`ACTIVE_RUNTIME | ACTIVE_DOC_AUTHORITY | ACTIVE_PROCESS | ACTIVE_POLICY | ACTIVE_STANDARD | ACTIVE_BLUEPRINT | ACTIVE_VALIDATION | HISTORICAL_RECORD | EXTERNAL_REFERENCE | DO_NOT_TOUCH`

Rename applies only to ACTIVE_* classes. HISTORICAL_RECORD and EXTERNAL_REFERENCE are preserved verbatim and listed in the allowed-legacy-hit list. DO_NOT_TOUCH (lockfiles, vendored, generated, strict-schema, migrations) is handled through generators or the metadata registry, never manual edits.

## 3. Waves

**Wave 0 — Closure verification and inventory.** Verify 6C closure (Section 1.1). Run the AKTI scan: `rg -n "AKTI|AKTI_ERP|akti|AKTI Spark|Arfa Karim" .` Produce the rename inventory; classify every hit; produce the exact-file plan per wave. Output: inventory + classification + line-level `legacy_name_map_v5_0.json` draft. Broad active-path allowlisting is forbidden; each active transition hit records file, line, term, class, reason, and expiry wave. Gate: zero unclassified hits.

**Wave 1 — v5 doctrine and structure, docs only.** Add the suite documents (blueprint v3.1, business logic v2 plus carry-forward appendix, this plan, metadata standard, 6A–6C consolidated amendment, 6D–6F v2 plans, suite manifest) into the target structure (Section 4); add the ratification record skeleton under `docs/ratification/esbla_spark_v5_0/`; create the registries (Section 5). **No runtime code in this wave.** Gate: `docs:check-links`, `docs:check-legacy-names` using line-level `legacy_name_map_v5_0.json`, registry validation.

**Wave 2 — docs/process and codex-review cleanup.** Move active docs into the new structure; archive superseded v4.1-era process clutter under `docs/process/archive/superseded_v4/` and legacy AKTI material under `docs/process/archive/legacy_akti/`; restructure `/codex-review` into `active/ | archive/ | temp/` with long-term committed run evidence relocated to `docs/audits/phase_runs/`; add README index files; populate `document_registry_v5_0.json` and `migration_tracker_v5_0.json`. Gate: link check, active-doc index check, lower_snake_case path check.

**Wave 3 — code/runtime rename.** Replace ACTIVE_RUNTIME AKTI references: package names/metadata, UI copy, seed/default copy, contract labels, manifest labels, CSS tokens, configuration strings, event-producer labels where they are display labels (semantic identifiers that would break contracts are renamed only through versioned contract change, not string edits). Generated metadata changes go through source-controlled generators. Gate: `contracts:validate`, `lint`, `typecheck`, `test`, plus the runtime smoke relevant to touched services.

**Wave 4 — active filename rename.** Rename active docs/process files to Esbla names with metadata frontmatter added on touch; update internal links; historical files keep their names under archive. Gate: link validation + path-case validation.

**Wave 5 — final audit.** Re-run the rg scan; classify remaining hits; CI fails on any unclassified active hit; publish the allowed-legacy-hit list and close `migration_tracker_v5_0.json`. Output: rename-audit report under `docs/audits/rename_audits/`.

## 4. Target repository information architecture

```text
docs/
  doctrine/
    current/
    legacy/akti/
  blueprints/
    current/
    legacy/v1/
    legacy/v2/
    legacy/v3/
    legacy/akti/
  process/
    active/
    phases/
      cross_phase/
      phase_06a_core_foundation/amendments/
      phase_06a_core_foundation/closure/
      phase_06a_core_foundation/audit/
      phase_06a_core_foundation/ffet/
      phase_06b_commerce_core/amendments/
      phase_06b_commerce_core/closure/
      phase_06b_commerce_core/audit/
      phase_06b_commerce_core/ffet/
      phase_06c_operations/amendments/
      phase_06c_operations/closure/
      phase_06c_operations/audit/
      phase_06c_operations/ffet/
      phase_06d_learning/plan/
      phase_06d_learning/ticketability/
      phase_06d_learning/ffet/
      phase_06d_learning/gates/
      phase_06e_growth_surface/plan/
      phase_06e_growth_surface/ticketability/
      phase_06e_growth_surface/ffet/
      phase_06e_growth_surface/gates/
      phase_06f_intelligence_admin_design/plan/
      phase_06f_intelligence_admin_design/ticketability/
      phase_06f_intelligence_admin_design/ffet/
      phase_06f_intelligence_admin_design/gates/
      phase_07_website_builder_agency_handoff/plan/
      phase_07_website_builder_agency_handoff/gates/
      phase_08_app_builder/plan/
      phase_08_app_builder/gates/
      phase_09_marketplace_trust_layer/plan/
      phase_09_marketplace_trust_layer/gates/
      phase_10_intelligence_scale_ecosystem_expansion/plan/
      phase_10_intelligence_scale_ecosystem_expansion/gates/
    runbooks/
    registries/
    archive/legacy_akti/
    archive/superseded_v4/
    archive/old_process_flat_files/
  adr/current/
  adr/legacy/
  policies/current/
  policies/legacy/
  standards/current/
  standards/legacy/
  audits/phase_runs/
  audits/doctrine_reviews/
  audits/rename_audits/
  ratification/esbla_spark_v5_0/
codex-review/
  active/<current_run>/run_state.json
  active/<current_run>/journal.md
  active/<current_run>/ffet_artifacts/
  active/<current_run>/validation/
  archive/<closed_runs>/
  temp/ignored/
```

Note: there is intentionally **no `phase_09` directory** — Phase 9 is restored doctrine (Blueprint XV). The review's 7–10 renumbering suggestion is declined and logged in the suite manifest.

## 5. Registries (created Wave 1–2, maintained thereafter)

`docs/process/registries/`: `phase_registry_v5_0.json` (phases, status, authoritative plan per phase), `document_registry_v5_0.json` (every active doc, version, status, supersedes), `legacy_name_map_v5_0.json` (old→new name pairs and allowed legacy hits), `file_metadata_registry_v5_0.json` (metadata for unsafe files), `migration_tracker_v5_0.json` (wave progress, file moves, link updates).

## 6. Validation gate suite

`docs:check-links · docs:check-legacy-names · docs:check-active-doc-index · docs:check-phase-registry · docs:check-metadata-registry · docs:check-lower-snake-case-paths · contracts:validate · lint · typecheck · test · git diff --check`. Docs-only PRs (Waves 1–2) are not blocked by unrelated pre-existing code drift; runtime PRs (Wave 3) run the full ladder.

## 7. Definition of done

All waves closed; Wave 5 audit shows zero unclassified active hits; registries populated and CI-validated; suite manifest statuses flipped per ratification; rename-audit report filed. Human approval (Gate 3 discipline) is required to start Wave 3 and to declare Wave 5 closure.

End of refactor plan v1.
