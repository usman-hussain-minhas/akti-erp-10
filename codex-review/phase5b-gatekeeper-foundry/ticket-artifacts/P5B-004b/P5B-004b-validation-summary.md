# P5B-004b Validation Summary

| Command | Result |
| --- | --- |
| `pnpm --dir apps/api exec tsx src/module-registry/module-registry.p5b-004b.test.ts` | PASS |
| `pnpm --dir apps/api exec tsx src/module-registry/module-registry.service.test.ts` | PASS |
| `pnpm --filter @akti/api test` | PASS |
| `pnpm --filter @akti/api typecheck` | PASS |
| `git diff --check` | PASS |
| `git status --short --branch` | PASS |

The approved Access Core seed set is now accepted by module-registry seed validation, and unknown, duplicate, malformed, missing, or non-`core.access` seeds remain rejected.
