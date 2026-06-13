# AKTI Core v0.0.2 codex-review Future Path Policy v1

Status: AKTI_CODEX_REVIEW_FUTURE_PATH_POLICY_READY_FOR_REVIEW

## Purpose

This policy switches future AKTI review artifacts toward lower_snake_case domain/version paths while preserving historical `codex-review/**` truthfulness.

## Historical Preservation

Historical paths remain truthful and are not moved, rewritten, or retroactively renamed by this policy. Existing screenshot manifests, checksum files, final audit packages, and ticket artifacts continue to point to the locations that existed when they were created.

## Future Paths

Future Core lifecycle evidence should use:

```text
codex-review/core/v0_0_2/
```

Future app/domain lifecycle evidence should use industry-aware paths such as:

```text
codex-review/apps/training/crm/v0_0_1/
```

## Required Lifecycle Files

Each future phase/app lifecycle artifact set must include:

- `spark_genesis_state.json`
- `spark_genesis_run_log.jsonl`
- `artifact_manifest.json`

## Filename Policy

- New ticket artifacts use lower_snake_case filenames.
- New evidence directories use lower_snake_case names.
- Version directories use forms such as `v0_0_1`.
- Phase directories use forms such as `phase_05c`.
- Do not create new hyphenated AKTI-generated evidence paths unless an external tool requires it or a human explicitly approves an exception.

## Non-Scope

- No historical `codex-review/**` evidence is moved.
- No old screenshot manifest is rewritten.
- No old final audit package is rewritten.
- No Phase 6 work starts here.
- No runtime, frontend, backend, schema, package, lockfile, generated registry, route, or API code changes are authorized here.

Final status: AKTI_CODEX_REVIEW_FUTURE_PATH_POLICY_READY_FOR_REVIEW
