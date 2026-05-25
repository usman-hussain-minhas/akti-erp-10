# P4-014B Known Deferrals Section

Status: ACCEPTED_FOR_PHASE_4

| Deferral | Classification | Why acceptable after Phase 4 |
| --- | --- | --- |
| Production launch | Separately approved production decision | Phase 4 proves controlled local/demo readiness only. |
| Production auth/session provider and credentials | Separately approved production decision | Phase 4 uses Phase 3 bearer-session boundary with placeholders only. |
| Production WhatsApp credentials | Later approved production/integration decision | Engagement Gateway remains mediated and `whatsapp_stub` only. |
| Real outbound WhatsApp | Later approved production/integration decision | No real outbound WhatsApp is required for operational proof. |
| DB-level RLS and tenant transaction context | Later-phase input | Service-level tenant isolation remains the accepted Phase 3 posture unless evidence proves insufficient. |
| Distributed/infrastructure route limiting | Production deployment decision | P4-015 preserved the app limiter and deferred infrastructure posture until real ingress topology exists. |
| Cloud/provider staging | Separately approved deployment decision | P4-003 selected controlled local/demo staging proof. |
| Foundry/module installer | Phase 5 | Explicit Phase 4 non-scope. |
| Platform AI runtime | Later phase | Explicit Phase 4 non-scope per roadmap v2. |

## Non-Hidden Deferral Rule

These deferrals are not hidden blockers for Phase 4 controlled local/demo readiness. They must be revisited before production launch or later phase execution where relevant.
