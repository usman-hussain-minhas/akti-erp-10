# P4-016A Proof-ticket Validation Requirements

| Ticket | Required validation |
| --- | --- |
| P4-009 | Clean DB migration/bootstrap logs, setup smoke, registry check, full ladder. |
| P4-010 | Build, startup, DB/API/web/CORS/restart logs, full ladder. |
| P4-011 | Smoke matrix commands, auth success/failure, tenant denial, CORS/security headers, app limiter if exposed. |
| P4-012 | Browser/rendered behavior evidence, screenshots/DOM/log redaction, responsive baseline, no x-actor-user-id regression. |
| P4-013 | Backup/restore/rollback command logs, metadata, restore validation, redaction review. |
| P4-015 | P4-007 mode resolution, app limiter preservation, validation or accepted deferral. |
