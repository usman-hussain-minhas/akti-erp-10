# P4-015 Accepted Deferral

Status: ACCEPTED_DEFERRAL

## Deferral

Distributed/infrastructure route limiting is deferred to the separately approved production deployment decision.

## Why This Is Acceptable For Phase 4

Phase 4 proves controlled local/demo operational readiness. The accepted Phase 4 target has no production proxy, CDN, WAF, load balancer, edge cache, or distributed multi-process API topology. Adding those controls would require deployment/provider decisions outside the approved ticket scope.

## What Remains Active

The Phase 3 app-level limiter remains active and validated. It must not be removed or weakened by future infrastructure work.

## Future Trigger

Reopen distributed/infrastructure route limiting before production deployment, public internet exposure, multi-instance API serving, CDN/WAF introduction, or provider-managed ingress.
