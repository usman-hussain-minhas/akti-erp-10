# P5B-028a Summary

## Finding And Bounded Replan

P5B-028a was ticketed as control/evidence with only codex-review output, but its MCR requires scoped capability namespace behavior to be implemented in exact files. Under the standing bounded-replan authority, this ticket added the exact implementation and test files needed to prove the behavior.

## Exact Files Selected

- Implementation: apps/api/src/foundry/foundry.service.ts
- Test: apps/api/src/foundry/foundry.p5b-028a.test.ts
- Evidence: codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-028a/P5B-028a-summary.md
- Evidence: codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-028a/P5B-028a-validation-summary.md

## Result

- Non-core Foundry module manifests must namespace capability keys under the manifest module key.
- Non-core modules cannot claim reserved or foreign capability keys such as platform.shell.access.
- Existing committed core capability exceptions remain allowed for core manifests.
- No package, Prisma, generated registry, Phase 5A document, deployment, or secret files were modified.
