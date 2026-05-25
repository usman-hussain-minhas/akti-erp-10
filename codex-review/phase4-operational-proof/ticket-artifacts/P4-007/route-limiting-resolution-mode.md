# AKTI ERP Phase 4 Infrastructure Route Limiting Decision v1

**Status:** ACCEPTED_FOR_PHASE_4_EXECUTION
**Ticket:** P4-007

## Decision

For controlled local/demo Phase 4 proof, the Phase 3 in-app route limiter is sufficient. Distributed/infrastructure route limiting is documented as a bounded deferral to the separately approved production deployment decision. The app limiter must not be removed.

## Evaluated Modes

| Mode | Description | Decision | Reason |
| --- | --- | --- | --- |
| A | App limiter only is sufficient for controlled staging/demo | Accepted | Local/demo proof is single-process and does not require distributed coordination. |
| B | Document staging proxy/header trust behavior | Partially accepted as documentation only | Proxy trust remains disabled by default unless later proof explicitly uses trusted proxy headers. |
| C | Infra/distributed limiter required | Rejected for Phase 4 without approval | Would require provider/dependency/infrastructure scope. |
| D | Defer distributed limiter to production deployment decision | Accepted | Proper distributed limiting depends on production/staging infrastructure topology. |

## Resolution Mode For P4-015

`resolution_mode_set_by: P4-007` = documentation-only bounded deferral plus validation-only confirmation that the Phase 3 app-level limiter remains active for controlled local/demo proof.

## Validation Expectations

- P4-011 may test app-level rate limiting if exposed in the local/demo API path.
- P4-015 must attest that the in-app limiter remains configured.
- P4-015 must not invent proxy/CDN/WAF assumptions.
- P4-015 must not add dependencies or production infrastructure.

## Stop Conditions

Stop if distributed limiting is required for Phase 4 acceptance, if a new dependency/provider is required, if production infrastructure is required, or if the app limiter would be removed/weakened.
