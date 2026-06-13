# AKTI ERP Phase 4 Backup, Restore, and Rollback Decision v1

**Status:** ACCEPTED_FOR_PHASE_4_EXECUTION
**Ticket:** P4-006

## Decision

Phase 4 recovery proof uses disposable local PostgreSQL data only. Backup/restore proof is command-level evidence with no production data. Application rollback proof is git/build-process evidence only; it must not rewrite main or perform destructive production operations.

## Backup Target

Local artifact under `codex-review/phase4-operational-proof/local-runtime/backups/`, excluded from final source ZIP unless explicitly packaged as redacted metadata only.

## Restore Target

A second disposable local PostgreSQL database, for example `akti_phase4_operational_restore`, on the local proof server.

## Allowed Data Source

Only data generated during P4-009/P4-010 local demo proof. No production or customer data.

## No-Production-Data Proof

P4-013 must record that the backup was generated from the disposable Phase 4 database and must include redaction review.

## RPO/RTO Expectation For Staging/Demo

- RPO: last successful disposable DB dump for Phase 4 proof.
- RTO: documented restore procedure can complete in the local proof environment.

## Backup Procedure

Use `pg_dump` against the disposable local database. Capture command output and redact DATABASE_URL/passwords.

## Restore Procedure

Create a new disposable local DB and restore using `psql` or `pg_restore`, depending on dump format. Validate by querying expected tables/counts or API smoke checks.

## Rollback Trigger

Rollback is triggered by failed smoke/browser/validation proof, unacceptable secret exposure, failed deployment proof, or operator decision during controlled demo.

## Rollback Procedure

- Application rollback: stop processes and checkout/rebuild prior committed branch HEAD or prior build artifact.
- Database rollback: restore prior disposable DB dump into a new disposable DB.
- Config/env rollback: restore prior non-secret env command values.
- Migration rollback policy: do not use destructive reverse migrations in Phase 4; reset disposable DB instead.

## Evidence Files

- backup-command-log.txt
- backup-artifact-metadata.txt
- restore-command-log.txt
- restore-validation-log.txt
- rollback-command-log.txt
- rollback-validation-log.txt
- redaction-review.md

## Stop Conditions

Stop if proof requires production data, production credentials, destructive migrations, cloud/provider backups, or unapproved dependencies.
