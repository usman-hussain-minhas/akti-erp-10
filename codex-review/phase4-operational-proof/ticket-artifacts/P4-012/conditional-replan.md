# P4-012 Conditional Re-Plan

P4-005 selected a no-new-dependency localhost browser/visual QA path. P4-012 uses the Codex in-app browser against a controlled local API/web runtime.

The setup organization screen is tested before local fixture seeding so browser-rendered setup success is real. After setup succeeds, a disposable local fixture provides bearer-session Lead Desk data for browser behavior checks.

Expected repo changes are limited to P4-012 evidence artifacts and the Phase 4 run journal. No runtime source, package, Prisma schema, existing migrations, contracts, generated registry, deployment implementation, real env file, or secret file changes are authorized.

Browser checks must verify behavior, not only screenshots. Screenshots are retained as evidence only.
