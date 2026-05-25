# P4-013 Conditional Re-plan

Status: ACCEPTED

P4-006 selected a local disposable PostgreSQL backup/restore model and git/build-process rollback evidence. P4-013 uses a fresh local PostgreSQL proof server on port 55435, a local API smoke process on port 3104, a pg_dump SQL backup from disposable source data, restore into a second disposable database, and rollback proof through a third disposable database plus git/config rollback evidence.

Expected repo changes are limited to P4-013 evidence artifacts and the Phase 4 run journal. No runtime source, package, Prisma schema, existing migrations, contracts, generated registry, deployment implementation, real env file, or secret file changes are authorized.
