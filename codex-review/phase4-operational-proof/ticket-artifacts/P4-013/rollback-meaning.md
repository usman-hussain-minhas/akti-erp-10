# P4-013 Rollback Meaning

Status: ACCEPTED_FOR_PHASE_4_PROOF

## Database Rollback

Database rollback means restoring a prior disposable PostgreSQL dump into a clean disposable database. P4-013 restored the same backup into both restore and rollback databases and validated organization and migration counts.

## Application Rollback

Application rollback means returning to a prior committed branch HEAD or previously validated build artifact. For this ticket, the rollback target is `fe283302dd07230de63d0a61d420f1a07f94eb6d`. No app, package, Prisma schema, or lockfile files differ between `fe283302dd07230de63d0a61d420f1a07f94eb6d` and `5004b6caed892b3ff1d5d72e431039b77783690c`, so the current validated build path also covers the rollback target code path.

## Config/Env Rollback

Config/env rollback means restoring known non-secret command-injected environment values. No real env files, production credentials, or secret-bearing files are created by this proof.

## Migration Rollback Policy

Phase 4 does not use destructive reverse migrations. Migration rollback means resetting or restoring a disposable database from backup. Production migration rollback is a separately approved operational decision outside P4-013.
