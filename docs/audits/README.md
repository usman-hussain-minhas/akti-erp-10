---
company: HAUTM
platform: Esbla Spark
author: Usman Hussain
owner: Usman Hussain
suite_version: v5.0
file_version: v1.0
created: 2026-06-13
last_updated: 2026-06-13
status: active
document_type: index
scope: Active index for audit evidence and archived historical review material.
---

# Esbla Spark Audits Index

This directory contains active audit evidence, closure verification, and archived historical review material.

## Current structure

| Path | Purpose | Status |
| --- | --- | --- |
| `docs/audits/archive/codex_review/` | Historical review artifacts moved path-only during `STAGE0-W2-FFET-001`. | Historical evidence |
| `docs/audits/` root files | Active audit artifacts created by current v5 control work. | Active |

## Operating rules

- Historical evidence under archive roots is preserved path-only and must not be rewritten.
- New audit artifacts should use lower-snake-case paths and v5 metadata when Markdown.
- Audit evidence supports review; it does not override executable repo truth, ratified doctrine, or active process controls.
- Final Stage 0 registry reconciliation is owned by `STAGE0-W5-FFET-002`, not this index.
